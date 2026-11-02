import type { Layer2Item } from '../types';

/**
 * Conversation-derived follow-ups. Each one is revealed (quietly, live) once the
 * first of its evidence lines has been heard in the mock transcript.
 */
export const danielLayer2: Layer2Item[] = [
  {
    id: 'l2-dog', templates: ['soap', 'lcd'], label: 'Dog walking', section: 'S', risk: 'high', answerType: 'text',
    question: 'Patient said they walk their dog sometimes. How often, and how far?',
    why: 'Frequency and distance show real-world activity, which supports the device choice.',
    evidenceLineIds: ['t10'],
    suggestedPhrase: 'When you walk the dog, about how far do you go, and how many days a week?',
    voiceAnswer: 'About three times a week, roughly half a mile on level sidewalks.',
  },
  {
    id: 'l2-hike', templates: ['soap', 'lcd'], label: 'Hiking', section: 'S', risk: 'medium', answerType: 'text',
    question: 'Patient hikes on trails. What terrain and typical distance?',
    why: 'Uneven terrain supports a higher-activity foot.',
    evidenceLineIds: ['t12'],
    suggestedPhrase: 'On those hikes, how rough is the ground and how far do you usually go?',
    voiceAnswer: 'Packed dirt trails with moderate hills, about two miles.',
  },
  {
    id: 'l2-pain', templates: ['soap', 'lcd'], label: 'Socket pain', section: 'S', risk: 'medium', answerType: 'coded',
    question: 'Distal socket rubbing was reported. How severe is the pain?',
    why: 'Pain level supports the case for socket replacement.',
    options: ['None', 'Mild (1-3)', 'Moderate (4-6)', 'Severe (7-10)'],
    evidenceLineIds: ['t14', 't18'],
    suggestedPhrase: 'On a scale of 0 to 10, how bad does the rubbing get by evening?',
    voiceAnswer: 'Mild (1-3)',
  },
  {
    id: 'l2-foot', templates: ['soap', 'lcd'], label: 'Prior foot failure', section: 'S', risk: 'low', answerType: 'text',
    question: 'The old foot cracked last spring. When exactly, and what repair was done?',
    why: 'Documents device failure for replacement justification.',
    evidenceLineIds: ['t16'],
    suggestedPhrase: 'Do you remember roughly when the foot cracked, and who patched it?',
    voiceAnswer: 'Cracked in April; patched in-clinic with epoxy.',
  },
];

/** Priya Raman: ankle-foot orthosis (AFO) follow-up. Questions the conversation raised but did not finish. */
export const priyaLayer2: Layer2Item[] = [
  {
    id: 'p2-walk', templates: ['soap', 'lcd'], label: 'Walking distance', section: 'S', risk: 'high', answerType: 'text',
    question: 'Patient walks the neighborhood most mornings. How far, and for how long?',
    why: 'Distance and time show how much the brace is used, and support a replacement.',
    evidenceLineIds: ['t6'],
    suggestedPhrase: 'About how far do you walk in the morning, and for how long?',
    voiceAnswer: 'About half a mile, around 20 minutes, on flat sidewalks.',
  },
  {
    id: 'p2-fall', templates: ['soap', 'lcd'], label: 'Recent stumble', section: 'S', risk: 'medium', answerType: 'text',
    question: 'There was a stumble last month. What happened, and was anyone hurt?',
    why: 'Falls and near-falls are a safety item and affect the plan.',
    evidenceLineIds: ['t10'],
    suggestedPhrase: 'Tell me about the stumble. What happened?',
    voiceAnswer: 'Caught the toe on a curb. No injury.',
  },
  {
    id: 'p2-stairs', templates: ['soap', 'lcd'], label: 'Stairs at home', section: 'S', risk: 'low', answerType: 'text',
    question: 'Ten stairs at home, taken slowly with the rail. Any difficulty?',
    why: 'Stairs show how much support the brace needs.',
    evidenceLineIds: ['t8'],
    suggestedPhrase: 'How do you manage the stairs at home?',
    voiceAnswer: 'Slow but steady. Needs the rail.',
  },
];
