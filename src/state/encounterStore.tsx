import { createContext, useContext, useMemo, useReducer, type Dispatch, type ReactNode } from 'react';
import { SEC_PER_LINE } from '../constants';
import { checklistFor, RISK_ORDER } from '../data/checklists';
import { AMPUTATION_FIELDS, linesFor, templateDef, type TemplateId } from '../data/mockNote';
import { patients } from '../data/patients';
import { scenarioFor } from '../data/scenarios';
import type { CaptureItem, EncounterType, FieldView, GapStatus, Layer1Item, NoteLineT, NoteStatus, Patient, TranscriptLine } from '../types';

// `?nolayer2` demos the "no follow-ups needed" state
const NO_FOLLOWUPS = new URLSearchParams(window.location.search).has('nolayer2');

/** One page, one session. No screens: the phase only changes what each panel shows. */
export type Phase = 'idle' | 'recording' | 'ended' | 'finalized';
export type SaveKind = 'session' | 'transcript' | 'note';

interface Override { text: string; status: NoteStatus; edited: boolean; at: number }
interface Template { id: TemplateId; lines: NoteLineT[]; visible: number; generatedAt: number; sourceCount: number }

export interface State {
  phase: Phase;
  patientId: string | null;
  type: EncounterType | null; // null = infer from profile
  device: string | null;
  elapsed: number; // real seconds recorded
  micIssue: boolean;
  endedAtElapsed: number | null;
  flushed: boolean; // Stop processes the full mock transcript, and Resume must not un-hear it
  reviewing: boolean; // short "reviewing the last few minutes" after End visit
  itemState: Record<string, { status: GapStatus; answer?: string }>;
  templateId: TemplateId;
  templateTouched: boolean; // the clinician picked a template themselves
  template: Template | null;
  overrides: Record<string, Override>; // clinician edits; survive re-fills
  skipped: Record<string, boolean>; // fields marked Not applicable, so they stop counting as missing
  lastAdded: { id: string; n: number } | null; // the form field the latest answer landed in, so the form can point at it
  saved: Partial<Record<SaveKind, number>>;
}

const initial: State = {
  phase: 'idle', patientId: null, type: null, device: null,
  elapsed: 0, micIssue: false, endedAtElapsed: null, flushed: false, reviewing: false,
  itemState: {}, templateId: 'soap', templateTouched: false, template: null, overrides: {}, skipped: {}, lastAdded: null, saved: {},
};

export type Action =
  | { t: 'setPatient'; id: string | null }
  | { t: 'setType'; type: EncounterType | null }
  | { t: 'setDevice'; device: string | null }
  | { t: 'start' }
  | { t: 'tick' }
  | { t: 'setMic'; issue: boolean }
  | { t: 'endVisit' }
  | { t: 'resume' }
  | { t: 'skipToEnd' }
  | { t: 'reviewDone' }
  | { t: 'item'; id: string; status: GapStatus; answer?: string }
  | { t: 'selectTemplate'; id: TemplateId }
  | { t: 'fillTemplate' }
  | { t: 'streamStep' }
  | { t: 'editLine'; id: string; text: string }
  | { t: 'refillField'; id: string }
  | { t: 'skipField'; id: string }
  | { t: 'unskipField'; id: string }
  | { t: 'save'; kind: SaveKind }
  | { t: 'finalize' }
  | { t: 'reset' };

/** Lines heard so far. After End visit the full (mock) transcript is processed. */
const heardCount = (s: State) => {
  const total = scenarioFor(s.patientId).transcript.length;
  return s.flushed || s.phase === 'ended' || s.phase === 'finalized' ? total : Math.min(total, Math.floor(s.elapsed / SEC_PER_LINE));
};

/** The mock AI writes the selected template from what has been heard so far. */
function buildTemplate(s: State): Template {
  const sc = scenarioFor(s.patientId);
  const heard = new Set(sc.transcript.slice(0, heardCount(s)).map((l) => l.id));
  // Only fill what the conversation actually supports so far
  const lines = linesFor(s.templateId, sc).filter((l) => l.sourceLineIds.every((id) => heard.has(id)));
  const sourceCount = new Set(lines.flatMap((l) => l.sourceLineIds)).size;
  return { id: s.templateId, lines, visible: 0, generatedAt: Date.now(), sourceCount };
}

/** A prosthetic evaluation is a payer-facing document; other visits default to a clinical SOAP note. */
const defaultTemplate = (t: EncounterType): TemplateId => (t === 'prosthetic' ? 'lcd' : 'soap');

export const inferredType = (p?: Patient): EncounterType =>
  p?.scheduledType ?? (p && p.encounters.length === 0 ? 'initial' : 'followup');

function reducer(s: State, a: Action): State {
  switch (a.t) {
    case 'setPatient': {
      const p = patients.find((x) => x.id === a.id);
      return { ...initial, patientId: a.id, type: p?.scheduledType ?? null, device: p?.device ?? null, templateId: defaultTemplate(p?.scheduledType ?? inferredType(p)) };
    }
    case 'setType': {
      const p = patients.find((x) => x.id === s.patientId);
      return { ...s, type: a.type, templateId: s.templateTouched ? s.templateId : defaultTemplate(a.type ?? inferredType(p)) };
    }
    case 'setDevice': return { ...s, device: a.device };
    case 'start':
      return { ...s, phase: 'recording', elapsed: 0, micIssue: false, endedAtElapsed: null, flushed: false, reviewing: false, itemState: {}, template: null, overrides: {}, skipped: {}, lastAdded: null, saved: {} };
    case 'tick': return s.phase !== 'recording' || s.micIssue ? s : { ...s, elapsed: s.elapsed + 1 };
    case 'setMic': return { ...s, micIssue: a.issue };
    case 'endVisit': {
      const next: State = { ...s, phase: 'ended', micIssue: false, endedAtElapsed: s.elapsed, flushed: true, reviewing: true };
      // Stopping writes the note, so answers always have somewhere to land. An existing note is left for "Update".
      return next.template && next.template.id === next.templateId ? next : { ...next, template: buildTemplate(next) };
    }
    // Continue the same visit: nothing is cleared and the clock carries on from where it stopped
    case 'resume': return { ...s, phase: 'recording', micIssue: false, endedAtElapsed: null, reviewing: false };
    // Demo only: fast-forward the mock conversation to its end. Recording keeps running until Stop.
    case 'skipToEnd': return s.phase === 'recording' ? { ...s, micIssue: false, elapsed: Math.max(s.elapsed, scenarioFor(s.patientId).transcript.length * SEC_PER_LINE) } : s;
    case 'reviewDone': return { ...s, reviewing: false };
    case 'item': {
      // An answer lands in the template field it belongs to, or is added at the end of its section
      const landed = a.status === 'answered'
        ? { id: templateDef(s.templateId, scenarioFor(s.patientId).transcript).fieldOf[a.id] ?? `c-${a.id}`, n: Date.now() }
        : s.lastAdded;
      return { ...s, itemState: { ...s.itemState, [a.id]: { status: a.status, answer: a.answer } }, lastAdded: landed };
    }
    case 'selectTemplate': return { ...s, templateId: a.id, templateTouched: true };
    case 'fillTemplate': return { ...s, template: buildTemplate(s) };
    case 'streamStep':
      return s.template ? { ...s, template: { ...s.template, visible: Math.min(s.template.lines.length, s.template.visible + 1) } } : s;
    case 'editLine':
      return { ...s, overrides: { ...s.overrides, [a.id]: { text: a.text, status: 'confirmed', edited: true, at: Date.now() } } };
    // Rewrite one field from what has been heard so far. It replaces the clinician's edit for that field only.
    case 'refillField': {
      if (!s.template) return s;
      const sc = scenarioFor(s.patientId);
      const heard = new Set(sc.transcript.slice(0, heardCount(s)).map((l) => l.id));
      const fresh = linesFor(s.templateId, sc).find((l) => l.id === a.id && l.sourceLineIds.every((id) => heard.has(id)));
      if (!fresh) return s;
      const had = s.template.lines.some((l) => l.id === a.id);
      const lines = had ? s.template.lines.map((l) => (l.id === a.id ? fresh : l)) : [...s.template.lines, fresh];
      const visible = had ? s.template.visible : Math.min(lines.length, s.template.visible + 1);
      const overrides = { ...s.overrides };
      delete overrides[a.id];
      return { ...s, template: { ...s.template, lines, visible }, overrides };
    }
    case 'skipField': return { ...s, skipped: { ...s.skipped, [a.id]: true } };
    // An explicit "no" also overrides an automatic Not applicable
    case 'unskipField': return { ...s, skipped: { ...s.skipped, [a.id]: false } };
    case 'save': return { ...s, saved: { ...s.saved, [a.kind]: Date.now(), ...(a.kind === 'session' ? { transcript: Date.now(), note: Date.now() } : {}) } };
    case 'finalize': return { ...s, phase: 'finalized' };
    case 'reset': return initial;
  }
}

/** Apply clinician overrides to generated/derived lines. */
function applyOverrides(lines: NoteLineT[], ov: Record<string, Override>, generatedAt: number): NoteLineT[] {
  return lines.map((l) => {
    const o = ov[l.id];
    if (!o) return l;
    return { ...l, text: o.edited ? o.text : l.text, status: o.status, edited: o.edited, risk: undefined, kept: o.at < generatedAt };
  });
}

interface Ctx {
  state: State;
  dispatch: Dispatch<Action>;
  patient: Patient | undefined;
  effectiveType: EncounterType;
  typeInferred: boolean;
  transcript: TranscriptLine[]; // the whole conversation for this patient's visit
  revealed: TranscriptLine[]; // the part heard so far
  items: CaptureItem[];
  pendingReview: boolean;
  fields: FieldView[]; // the whole selected template as a form (empty slots included)
  noteLines: NoteLineT[]; // only the fields that have content or need an answer
  skipped: Record<string, boolean>; // fields that are Not applicable: marked by the clinician, or automatically
  skipNotes: Record<string, string>; // why a field was marked automatically
  refillable: Set<string>; // fields the transcript can (re)write right now
  streaming: boolean;
}
const EncounterContext = createContext<Ctx | null>(null);

export function EncounterProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initial);

  const value = useMemo<Ctx>(() => {
    const patient = patients.find((p) => p.id === state.patientId);
    const scenario = scenarioFor(state.patientId);
    const transcript = scenario.transcript;
    const layer2Items = NO_FOLLOWUPS ? [] : scenario.layer2;
    // A patient wearing an orthosis is not an amputee: the amputation fields are Not applicable from the start
    const wearsOrthosis = /orthosis/i.test(state.device ?? '');
    const auto: Record<string, boolean> = wearsOrthosis ? Object.fromEntries(AMPUTATION_FIELDS.map((id) => [id, true])) : {};
    const skipped: Record<string, boolean> = { ...auto, ...state.skipped };
    const skipNotes = Object.fromEntries(
      Object.keys(auto).filter((id) => skipped[id] && state.skipped[id] === undefined).map((id) => [id, 'Not an amputation: the patient wears an orthosis']),
    );
    const effectiveType = state.type ?? inferredType(patient);
    const ended = state.phase === 'ended' || state.phase === 'finalized';
    const revealed = transcript.slice(0, heardCount(state));
    const heardCaps = new Set(revealed.flatMap((l) => l.captures ?? []));

    // Layer 2 gating: while "reviewing", only items heard before End visit are shown.
    const liveCount = state.reviewing && state.endedAtElapsed !== null
      ? Math.min(transcript.length, Math.floor(state.endedAtElapsed / SEC_PER_LINE))
      : revealed.length;
    const liveHeard = new Set(transcript.slice(0, liveCount).map((l) => l.id));

    const st = (id: string) => state.itemState[id] ?? { status: 'open' as GapStatus };
    const items: CaptureItem[] = [];
    if (patient) {
      const fromL1 = (it: Layer1Item): CaptureItem => ({
        ...it,
        source: 'type',
        // Only captured items have a source (the lines that captured them). A question nobody has
        // asked yet has nothing to point at.
        evidenceLineIds: heardCaps.has(it.id) ? revealed.filter((l) => l.captures?.includes(it.id)).map((l) => l.id) : [],
        captured: heardCaps.has(it.id),
        ...st(it.id),
      });
      // A cleaned transcript is not a form, so it has no questions
      const needed = (it: { templates: TemplateId[] }) => it.templates.includes(state.templateId);
      checklistFor(effectiveType).filter(needed).forEach((it) => items.push(fromL1(it)));
      if (state.phase !== 'idle') {
        layer2Items
          .filter((it) => needed(it) && liveHeard.has(it.evidenceLineIds[0]))
          .forEach((it) => items.push({ ...it, source: 'conversation', captured: false, ...st(it.id) }));
      }
      items.sort((a, b) => RISK_ORDER[a.risk] - RISK_ORDER[b.risk]);
    }
    const pendingReview = state.reviewing && layer2Items.some((it) => it.templates.includes(state.templateId) && !liveHeard.has(it.evidenceLineIds[0]));

    // The selected template is always a form. Generated values stream into it field by field,
    // then clinician answers from "Before they leave" are added at the bottom of their section.
    let streaming = false;
    let generated: NoteLineT[] = [];
    if (state.template && state.template.id === state.templateId) {
      const tpl = templateDef(state.template.id, transcript);
      streaming = state.template.visible < state.template.lines.length;
      const base = state.template.lines.slice(0, state.template.visible);
      const extra: NoteLineT[] = [];
      if (!streaming) {
        items.filter((i) => !i.captured).forEach((i) => {
          const mapped = tpl.fieldOf[i.id]; // an existing form field this question answers
          const id = mapped ?? `c-${i.id}`;
          const section = tpl.place(i.id, i.section);
          if (i.status === 'answered') {
            extra.push({ id, section, label: i.label, span: 12, text: i.answer ?? '', status: 'from_checkpoint', sourceLineIds: [] });
          } else if (i.status === 'later' || (ended && !mapped && i.status === 'open')) {
            // A mapped field that is simply still empty is flagged by the form itself, so only "Later" needs a marker there
            const placeholder = i.status === 'later' ? `Follow-up: ${i.question}` : i.question;
            extra.push({ id, section, label: i.label, span: 12, text: '', placeholder, status: 'open_gap', risk: i.risk, sourceLineIds: i.evidenceLineIds });
          }
        });
      }
      generated = applyOverrides([...base, ...extra], state.overrides, state.template.generatedAt);
    }

    const byId = new Map(generated.map((l) => [l.id, l]));
    const carried = patient?.historyGaps ?? [];
    const fields: FieldView[] = [];
    templateDef(state.templateId, transcript).sections.forEach((sec) => {
      sec.fields.forEach((fd) => {
        const line = byId.get(fd.id);
        const typed = state.overrides[fd.id];
        const meta = { label: fd.label, span: fd.span, required: fd.required, options: fd.options, carryNote: carried.find((g) => g.fieldId === fd.id)?.note };
        if (line) fields.push({ ...line, ...meta, empty: false });
        else if (typed?.edited) {
          // The clinician typed into a field the AI left empty
          fields.push({ id: fd.id, section: sec.title, ...meta, text: typed.text, status: 'confirmed', edited: true, sourceLineIds: [], empty: false });
        } else fields.push({ id: fd.id, section: sec.title, ...meta, text: '', placeholder: fd.placeholder, status: 'ai_inferred', sourceLineIds: [], empty: true });
      });
      generated.filter((l) => l.id.startsWith('c-') && l.section === sec.title).forEach((l) => fields.push({ ...l, empty: false }));
    });
    const noteLines = fields.filter((f) => !f.empty);
    const heardIds = new Set(revealed.map((l) => l.id));
    const refillable = new Set(linesFor(state.templateId, scenario).filter((l) => l.sourceLineIds.every((id) => heardIds.has(id))).map((l) => l.id));

    return { state, dispatch, patient, effectiveType, typeInferred: !state.type, transcript, revealed, items, pendingReview, fields, noteLines, skipped, skipNotes, refillable, streaming };
  }, [state]);

  return <EncounterContext.Provider value={value}>{children}</EncounterContext.Provider>;
}

export function useEncounter() {
  const c = useContext(EncounterContext);
  if (!c) throw new Error('useEncounter must be used inside EncounterProvider');
  return c;
}
