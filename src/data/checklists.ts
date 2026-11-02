import type { EncounterType, Layer1Item } from '../types';

export const TYPE_LABEL: Record<EncounterType, string> = {
  initial: 'Initial Evaluation',
  prosthetic: 'Prosthetic Evaluation',
  followup: 'Follow-up',
};

/**
 * The checklist is only things to ASK the patient or OBSERVE.
 * Things the clinician fills in or judges (diagnosis code, K-level, Medicare criteria, medical necessity)
 * are fields in the template, flagged there when missing. They are not questions.
 * These apply to every note format, because the claim needs the answers whichever template is chosen.
 */
const BOTH: Layer1Item['templates'] = ['soap', 'lcd'];

const ITEMS: Record<string, Layer1Item> = {
  level: {
    id: 'level', templates: BOTH, label: 'Amputation level / limb', section: 'S', risk: 'medium', answerType: 'text',
    question: 'Which limb and amputation level?',
    why: 'Determines the component codes that can be billed.',
    suggestedPhrase: 'Just to confirm, which side and what level was the amputation?',
    voiceAnswer: 'Left trans-tibial.',
  },
  condition: {
    id: 'condition', templates: BOTH, label: 'Current device condition', section: 'O', risk: 'medium', answerType: 'text',
    question: 'What is the condition of the current device?',
    why: 'Supports medical necessity for replacement.',
    suggestedPhrase: 'Tell me about how the current device is holding up.',
    voiceAnswer: 'Socket loose, liner worn through.',
  },
  goals: {
    id: 'goals', templates: BOTH, label: 'Patient goals', section: 'S', risk: 'low', answerType: 'text',
    question: 'What are the patient goals?',
    why: 'Anchors the plan to function the payer recognizes.',
    suggestedPhrase: 'What would you most like to be able to do?',
    voiceAnswer: 'Keep up with grandchildren.',
  },
  activity: {
    id: 'activity', templates: BOTH, label: 'Activity / lifestyle', section: 'S', risk: 'medium', answerType: 'text',
    question: 'What does the patient do in a typical week?',
    why: 'Real activities are the evidence behind the functional level.',
    suggestedPhrase: 'Walk me through a typical week.',
    voiceAnswer: 'Daily walking and yard work.',
  },
  // The three questions the LCD form needs that a normal conversation skips
  prior: {
    id: 'prior', templates: BOTH, label: 'Activities before amputation', section: 'S', risk: 'high', answerType: 'text',
    question: 'What did the patient do before the amputation?',
    why: 'Shows the activity level they can return to. Medicare asks for it.',
    suggestedPhrase: 'What was a normal week like for you before the amputation?',
    voiceAnswer: 'Walked daily, worked on their feet, no walking aids.',
  },
  assist: {
    id: 'assist', templates: BOTH, label: 'Walking aids', section: 'S', risk: 'medium', answerType: 'text',
    question: 'Does the patient use a cane, walker or wheelchair?',
    why: 'Any assistive device, now or before, and when it is used.',
    suggestedPhrase: 'Do you use a cane or walker, and when?',
    voiceAnswer: 'Uses a cane on uneven ground.',
  },
  prevdev: {
    id: 'prevdev', templates: BOTH, label: 'Previous prostheses', section: 'S', risk: 'medium', answerType: 'text',
    question: 'What prostheses has the patient tried, and how did they work?',
    why: 'Components tried before, and the result, support the new choice.',
    suggestedPhrase: 'What have you worn before, and how did it work out?',
    voiceAnswer: 'One earlier foot, replaced because it gave little energy return.',
  },
  history: {
    id: 'history', templates: BOTH, label: 'Relevant medical history', section: 'S', risk: 'medium', answerType: 'text',
    question: 'Is relevant medical history captured?',
    why: 'Comorbidities affect component selection and coverage.',
    suggestedPhrase: 'Any other conditions I should know about?',
    voiceAnswer: 'Type 2 diabetes, hypertension.',
  },
  fit: {
    id: 'fit', templates: BOTH, label: 'Fit & comfort', section: 'O', risk: 'medium', answerType: 'text',
    question: 'How is the fit and comfort?',
    why: 'Documents the need for adjustment or replacement.',
    suggestedPhrase: 'How does it feel when you wear it all day?',
    voiceAnswer: 'Loose at end of day.',
  },
  skin: {
    id: 'skin', templates: BOTH, label: 'Skin integrity', section: 'O', risk: 'high', answerType: 'coded',
    question: 'Skin integrity checked?',
    why: 'Skin breakdown changes the plan and is a safety item.',
    options: ['Intact', 'Redness, no open areas', 'Open area present'],
    suggestedPhrase: 'May I check the skin on your limb?',
    voiceAnswer: 'Redness, no open areas',
  },
};

const IDS: Record<EncounterType, string[]> = {
  prosthetic: ['level', 'condition', 'goals', 'activity', 'prior', 'assist', 'prevdev'],
  initial: ['level', 'history', 'goals', 'activity', 'prior'],
  followup: ['condition', 'fit', 'skin', 'activity'],
};

export const RISK_ORDER = { high: 0, medium: 1, low: 2 } as const;

/** Questions to ask for a visit type, most important first. */
export function checklistFor(type: EncounterType): Layer1Item[] {
  return IDS[type].map((id) => ITEMS[id]).sort((a, b) => RISK_ORDER[a.risk] - RISK_ORDER[b.risk]);
}
