import type { Scenario } from '../types';
import { danielLayer2, priyaLayer2 } from './mockLayer2';
import { danielTranscript, priyaTranscript } from './mockTranscript';

const v = (text: string, ...sources: string[]) => ({ text, sources });

/** Daniel Alvarez: prosthetic evaluation. Also the default for any patient without their own scenario. */
const daniel: Scenario = {
  id: 'daniel',
  transcript: danielTranscript,
  layer2: danielLayer2,
  ai: {
    soap: {
      's-reason': v('Socket is getting loose and the liner is worn through.', 't2'),
      's-cause': v('Complications from diabetes (vascular disease)', 't6'),
      's-date': v('About 4 years ago', 't4'),
      's-level': v('Left trans-tibial', 't4'),
      's-goals': v('Keep up with grandchildren and get back to work on their feet.', 't8'),
      's-history': v('Diabetes-related vascular disease. Current foot cracked last spring and was patched.', 't6', 't16'),
      's-lifestyle': v('Walks the dog sometimes, does yard work, and hikes on trails when the weather is good.', 't10', 't12'),
      's-pain': v('Rubbing at the distal end of the socket by the end of the day.', 't14'),
      'o-limb': v('Mild redness at the distal tibia, no open areas. Volume appears reduced.', 't18'),
      'o-device': v('Socket loose and liner worn through; foot cracked and patched.', 't2', 't16'),
      'a-status': v('Socket volume loss with distal pressure; current foot compromised by crack.', 't2', 't14', 't16', 't18'),
      'a-rec': v('New socket and a more responsive foot, because the socket no longer fits after limb volume loss.', 't18', 't20'),
      'p-plan': v('Fabricate a new socket and provide an updated foot.', 't20'),
      'p-follow': v('Patient agrees with the plan. No follow-up timeframe was stated.', 't20', 't21'),
    },
    lcd: {
      'l-cause': v('Complications from diabetes (vascular disease)', 't6'),
      'l-date': v('About 4 years ago, left trans-tibial', 't4'),
      'l-limb': v('Mild redness at the distal tibia, no open areas. Volume appears reduced.', 't18'),
      'l-limits': v('Diabetes-related vascular disease.', 't6'),
      'l-current': v('Walks the dog sometimes, does yard work, and hikes on trails when the weather is good.', 't10', 't12'),
      'l-desired': v('Keep up with grandchildren and get back to work on their feet.', 't8'),
      'l-comp': v('Socket loose, liner worn through; foot cracked last spring and was patched.', 't2', 't16'),
      'l-reason': v('Due to physical changes (reduced limb volume) the socket no longer fits.', 't2', 't18'),
      'l-desire': v('Wants to keep up with grandchildren and get back to work on their feet.', 't8'),
      'l-rec': v('New socket and a more responsive foot: the existing socket no longer fits due to limb volume loss.', 't18', 't20'),
    },
  },
};

/**
 * Priya Raman: follow-up for an ankle-foot orthosis after a stroke. Not an amputee, so the amputation fields
 * in the SOAP form stay empty and can be marked Not applicable. There is no LCD paperwork for this visit.
 */
const priya: Scenario = {
  id: 'priya',
  transcript: priyaTranscript,
  layer2: priyaLayer2,
  ai: {
    soap: {
      's-reason': v('Calf strap has stretched and the plastic is cracking near the ankle.', 't2'),
      's-goals': v('Keep walking independently.', 't15'),
      's-history': v('Foot drop after a stroke about two years ago.', 't16', 't17'),
      's-lifestyle': v('Walks around the neighborhood most mornings and does her own grocery shopping. Climbs ten stairs at home, slowly, holding the rail.', 't6', 't8'),
      's-pain': v('Rubbing on the outside of the ankle. Toes catch when tired.', 't4'),
      'o-device': v('Back strap stretched; crack at the inner ankle trim line.', 't2', 't12'),
      'o-gait': v('Foot clears the floor with less lift than before. Toes catch when tired.', 't4', 't12'),
      'a-status': v('Worn strap and cracked shell reduce lift, with rubbing at the outer ankle.', 't2', 't4', 't12'),
      'a-rec': v('Replace the strap and repair or remake the shell to keep walking safely.', 't12', 't14'),
      'p-plan': v('Replace the back strap; repair or remake the shell.', 't14'),
      'p-follow': v('Patient agrees with the plan. No follow-up timeframe was stated.', 't14', 't15'),
    },
  },
};

export const scenarioFor = (patientId: string | null): Scenario => (patientId === 'p2' ? priya : daniel);
