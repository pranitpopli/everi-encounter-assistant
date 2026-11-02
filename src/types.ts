export type EncounterType = 'initial' | 'prosthetic' | 'followup';
export type Risk = 'high' | 'medium' | 'low';
export type GapStatus = 'open' | 'answered' | 'later' | 'not_relevant';
export type NoteStatus = 'ai_inferred' | 'confirmed' | 'from_checkpoint' | 'open_gap';
export type Section = 'S' | 'O' | 'A' | 'P';
export type TemplateId = 'clean' | 'soap' | 'lcd';
/** Where a "What you need to capture" item came from */
export type CaptureSource = 'type' | 'history' | 'conversation';

export interface PastEncounter {
  id: string;
  date: string;
  type: EncounterType;
  device: string;
  status: 'signed' | 'draft' | 'open_gaps';
  openGaps?: string[];
}
/** Something a previous visit left undocumented. It surfaces as a flagged field in today's form. */
export interface HistoryGap {
  fieldId: string; // the template field that is still missing
  label: string; // short name for the patient strip
  note: string; // shown under the empty field
}
export interface Patient {
  id: string;
  name: string;
  dob: string;
  device?: string;
  diagnosis?: string;
  /** Encounter type booked on the patient profile for today's visit */
  scheduledType?: EncounterType;
  historyGaps?: HistoryGap[];
  encounters: PastEncounter[];
}

interface QuestionBase {
  id: string;
  /** Templates that actually need this item (a SOAP note needs no LCD criteria) */
  templates: TemplateId[];
  label: string;
  section: Section;
  question: string;
  risk: Risk;
  why: string;
  answerType: 'coded' | 'text';
  options?: string[];
  suggestedPhrase: string;
  voiceAnswer: string;
}
export interface Layer1Item extends QuestionBase {
  evidenceLineIds?: string[];
}
export interface Layer2Item extends QuestionBase {
  evidenceLineIds: string[];
}

/** Unified item shown in "What you need to capture" / "Before they leave" */
export interface CaptureItem extends QuestionBase {
  source: CaptureSource;
  sourceNote?: string;
  evidenceLineIds: string[];
  captured: boolean;
  status: GapStatus;
  answer?: string;
}

/** A field as rendered in the form: a note line, or an empty slot waiting for content */
export type FieldView = NoteLineT & { empty: boolean };

export interface TranscriptLine {
  id: string;
  tSec: number;
  speaker: 'Clinician' | 'Patient';
  text: string;
  /** Layer 1 item ids this line "satisfies" when heard (mock detection) */
  captures?: string[];
}

export interface NoteLineT {
  id: string;
  /** Section heading within the active template */
  section: string;
  /** Form field label, and its width in the 12-column form grid */
  label: string;
  span: 4 | 6 | 12;
  text: string;
  /** Hint shown inside an empty field */
  placeholder?: string;
  /** Medicare-critical: Finalize warns while it is empty */
  required?: boolean;
  /** Pick-from-list field instead of free text */
  options?: string[];
  /** Reminder from a previous visit, shown while the field is empty */
  carryNote?: string;
  status: NoteStatus;
  risk?: Risk;
  sourceLineIds: string[];
  edited?: boolean;
  /** Clinician edit/confirm that survived a re-fill */
  kept?: boolean;
}

/** Everything the mock "AI" knows about one patient's visit: what was said, what it raised, what it wrote. */
export interface Scenario {
  id: string;
  transcript: TranscriptLine[];
  layer2: Layer2Item[];
  /** AI-written value of each template field, by template then field id. Fields not listed stay empty. */
  ai: Partial<Record<TemplateId, Record<string, { text: string; sources: string[] }>>>;
}
