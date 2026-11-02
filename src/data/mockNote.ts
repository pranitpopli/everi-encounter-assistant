import { fmtClock } from '../constants';
import type { NoteLineT, Scenario, Section, TemplateId, TranscriptLine } from '../types';

export type { TemplateId };

/**
 * TEMPLATE STRUCTURES ARE BASED ON REAL O&P DOCUMENTATION GUIDANCE, not invented:
 *  - SOAP: Everi's own Subjective Evaluation fields, plus the SOAP guidance in the O&P trade article
 *    "SOAP Notes Can Clean up Your Records" (2014) and the physical-exam elements Medicare expects.
 *  - LCD: the Ottobock Lower Limb Prosthesis Documentation Packet (Medicare LCD L33787 criteria):
 *    history of amputation, physical examination, functional limitations, functional level (K-level),
 *    current prosthesis, desire and motivation, recommendation and medical necessity.
 * This file is only the STRUCTURE. What the mock AI writes into each field lives in scenarios.ts.
 *
 * Things the clinician judges or looks up (diagnosis code, K-level) are fields here, flagged when empty.
 * They are not checklist questions.
 */

// Medicare functional levels (LCD L33787), shortened from the official definitions
export const K_LEVELS = [
  'K0 · No ability or potential to ambulate or transfer safely',
  'K1 · Transfers or level surfaces at fixed cadence (household)',
  'K2 · Low-level barriers: curbs, stairs, uneven surfaces (limited community)',
  'K3 · Variable cadence, most barriers (community ambulator)',
  'K4 · Exceeds basic ambulation: high impact, stress or energy (child, active adult, athlete)',
];

// A few common ICD-10 codes for the mock
export const ICD_CODES = [
  'Z89.512 · Acquired absence of left leg below knee',
  'Z89.511 · Acquired absence of right leg below knee',
  'M21.372 · Foot drop, left foot',
  'M21.371 · Foot drop, right foot',
  'E11.51 · Type 2 diabetes with diabetic peripheral angiopathy, without gangrene',
  'I69.354 · Hemiplegia following cerebral infarction, left non-dominant side',
  'Other (add in note)',
];

/** Fields that only make sense for an amputee. A patient wearing an orthosis has none of this history. */
export const AMPUTATION_FIELDS = ['s-cause', 's-date', 's-level', 'o-limb', 'l-cause', 'l-date', 'l-limb'];

/** One labelled form field (structure only). */
export interface FieldDef {
  id: string;
  label: string;
  span: 4 | 6 | 12; // width in the 12-column form grid
  placeholder?: string;
  required?: boolean;
  options?: string[];
}
export interface SectionDef { title: string; fields: FieldDef[] }
export interface SourceLink { label: string; url: string }

export interface TemplateDef {
  id: TemplateId;
  label: string;
  sections: SectionDef[];
  /** Where checkpoint answers / unresolved items land */
  place: (itemId: string, section: Section) => string;
  /** Checklist questions whose answer belongs in an existing form field (so it fills that field, no duplicate) */
  fieldOf: Record<string, string>;
  sources: SourceLink[];
}

const F = (
  id: string, label: string, span: 4 | 6 | 12 = 12, placeholder?: string,
  extra: { required?: boolean; options?: string[] } = {},
): FieldDef => ({ id, label, span, placeholder, ...extra });

const SOAP_SECTIONS: SectionDef[] = [
  {
    title: 'Subjective Evaluation (S)',
    fields: [
      F('s-reason', 'Reason for Encounter'),
      F('s-cause', 'Cause of Amputation', 4),
      F('s-date', 'Date of Amputation', 4, 'yyyy-mm-dd'),
      F('s-level', 'Amputation Level', 4),
      F('s-goals', "Patient's Stated Functional Goals"),
      F('s-history', 'Relevant Medical History'),
      F('s-lifestyle', 'Lifestyle & Activities'),
      F('s-pain', 'Pain / Residual Limb Complaints'),
    ],
  },
  {
    title: 'Objective Evaluation (O)',
    fields: [
      F('o-presentation', 'Presentation', 12, 'Arrived wearing the device? Accompanied? Cognitive state, weight change'),
      F('o-limb', 'Condition of Residual Limb'),
      F('o-device', 'Current Device Condition'),
      F('o-gait', 'Gait, Balance & Strength', 12, 'Observed gait, balance, strength, range of motion'),
    ],
  },
  {
    title: 'Assessment (A)',
    fields: [
      F('a-dx', 'Diagnosis Code (ICD-10)', 12, 'Choose the diagnosis code', { required: true, options: ICD_CODES }),
      F('a-status', 'Clinical Status'),
      F('a-rec', 'What Needs to Be Done and Why'),
    ],
  },
  {
    title: 'Plan (P)',
    fields: [F('p-plan', 'Treatment Plan'), F('p-follow', 'Follow-up')],
  },
];

const LCD_SECTIONS: SectionDef[] = [
  {
    title: 'History of Amputation',
    fields: [
      F('l-cause', 'Cause of Amputation', 6),
      F('l-date', 'Date, Side & Level', 6),
      F('l-dx', 'Diagnosis Code (ICD-10)', 12, 'Choose the diagnosis code', { required: true, options: ICD_CODES }),
      F('l-course', 'Clinical Course & Prognosis', 12, 'Interventions, results, prognosis'),
    ],
  },
  {
    title: 'Physical Examination',
    fields: [
      F('l-limb', 'Condition of Residual Limb'),
      F('l-body', 'Height, Weight & Recent Change', 12, 'Height, weight, recent loss or gain'),
      F('l-gait', 'Strength, ROM, Gait, Balance', 12, 'Strength, range of motion, gait, balance, coordination'),
    ],
  },
  {
    title: 'Functional Limitations',
    fields: [
      F('l-limits', 'Limitations from Condition or Comorbidities'),
      F('l-assist', 'Ambulatory Assistance', 12, 'Cane, walker, wheelchair, caregiver, now or before amputation'),
    ],
  },
  {
    title: 'Functional Level (K-Level)',
    fields: [
      F('l-prior', 'Activities Prior to Amputation', 12, 'Real activities before the amputation', { required: true }),
      F('l-current', 'Current Activities'),
      F('l-desired', 'Desired / Potential Activities'),
      F('l-k', 'Functional Level (K-Level)', 12, 'Choose the K-level that the activities above support', { required: true, options: K_LEVELS }),
    ],
  },
  {
    title: 'Current Prosthesis',
    fields: [
      F('l-comp', 'Condition of Each Component'),
      F('l-reason', 'Reason for Replacement'),
      F('l-prev', 'Previous Prostheses', 12, 'Components tried before, and the result'),
    ],
  },
  {
    title: 'Desire and Motivation',
    fields: [F('l-desire', 'Desire to Use the New Prosthesis & Motivation to Ambulate')],
  },
  {
    title: 'Recommendation and Medical Necessity',
    fields: [
      F('l-rec', 'Recommendation & Medical Reason'),
      F('l-plan', 'Plan to Reach Potential K-Level', 12, 'If a higher K-level is expected: explanation, plan, and how long it will take'),
    ],
  },
];

const SOAP_SECTION: Record<Section, string> = {
  S: 'Subjective Evaluation (S)', O: 'Objective Evaluation (O)', A: 'Assessment (A)', P: 'Plan (P)',
};

/** LCD documentation is organised by topic, so items are placed by what they are, not by SOAP letter. */
const LCD_PLACE: Record<string, string> = {
  level: 'History of Amputation', history: 'History of Amputation',
  'l2-pain': 'Physical Examination',
  condition: 'Current Prosthesis', 'l2-foot': 'Current Prosthesis', prevdev: 'Current Prosthesis',
  assist: 'Functional Limitations',
  activity: 'Functional Level (K-Level)', prior: 'Functional Level (K-Level)', 'l2-dog': 'Functional Level (K-Level)', 'l2-hike': 'Functional Level (K-Level)',
  goals: 'Desire and Motivation',
};

const BASE: TemplateDef[] = [
  {
    id: 'soap', label: 'SOAP note', sections: SOAP_SECTIONS,
    place: (_id, section) => SOAP_SECTION[section],
    fieldOf: {},
    sources: [
      { label: 'O&P SOAP guidance', url: 'https://progress.oandp.com/Articles/ViewArticle/2014-08-23/2014-09_13' },
      { label: 'Ottobock exam elements', url: 'https://cdn.cascade-usa.com/Assets/PDFs/LLP_DocumentationPkt_02280.pdf' },
    ],
  },
  {
    id: 'lcd', label: 'Prosthetic evaluation (LCD)', sections: LCD_SECTIONS,
    place: (id, section) => LCD_PLACE[id] ?? SOAP_SECTION[section] ?? 'Recommendation and Medical Necessity',
    fieldOf: { prior: 'l-prior', assist: 'l-assist', prevdev: 'l-prev' },
    sources: [
      { label: 'Ottobock LLP packet (LCD L33787)', url: 'https://cdn.cascade-usa.com/Assets/PDFs/LLP_DocumentationPkt_02280.pdf' },
      { label: 'Össur K-level guide', url: 'https://www.ossur.com/en-us/professionals/ossur-rr/documenting-functional-levels' },
    ],
  },
  {
    id: 'clean', label: 'Cleaned transcript', sections: [],
    place: () => 'Clinician Additions',
    fieldOf: {},
    sources: [],
  },
];

/** The options for the template picker. */
export const TEMPLATE_OPTIONS = BASE.map((t) => ({ value: t.id, label: t.label }));

const cleanLabel = (l: TranscriptLine) => `${fmtClock(l.tSec)} · ${l.speaker}`;

/** A template's definition. The cleaned transcript is built from the conversation itself. */
export function templateDef(id: TemplateId, transcript: TranscriptLine[]): TemplateDef {
  const base = BASE.find((t) => t.id === id)!;
  if (id !== 'clean') return base;
  return {
    ...base,
    sections: [
      { title: 'Conversation', fields: transcript.map((l) => F(`clean-${l.id}`, cleanLabel(l))) },
      { title: 'Clinician Additions', fields: [] },
    ],
  };
}

/** What the mock AI writes into a template for this visit, as note lines (before any clinician edits). */
export function linesFor(id: TemplateId, scenario: Scenario): NoteLineT[] {
  if (id === 'clean') {
    return scenario.transcript.map((l) => ({
      id: `clean-${l.id}`, section: 'Conversation', label: cleanLabel(l), span: 12 as const,
      text: l.text, sourceLineIds: [l.id], status: 'ai_inferred' as const,
    }));
  }
  const ai = scenario.ai[id] ?? {};
  return templateDef(id, scenario.transcript).sections.flatMap((s) =>
    s.fields
      .filter((f) => ai[f.id])
      .map((f) => ({
        id: f.id, section: s.title, label: f.label, span: f.span, text: ai[f.id].text, sourceLineIds: ai[f.id].sources, status: 'ai_inferred' as const,
      })),
  );
}
