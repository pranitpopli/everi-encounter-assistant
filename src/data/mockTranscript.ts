import { SEC_PER_LINE, TIME_SCALE } from '../constants';
import type { TranscriptLine } from '../types';

type Raw = [TranscriptLine['speaker'], string, string[]?];
const C = 'Clinician' as const;
const P = 'Patient' as const;

const build = (raw: Raw[]): TranscriptLine[] =>
  raw.map(([speaker, text, captures], i) => ({
    id: `t${i + 1}`,
    tSec: (i + 1) * SEC_PER_LINE * TIME_SCALE,
    speaker,
    text,
    captures,
  }));

/** Daniel Alvarez: prosthetic evaluation, trans-tibial prosthesis. Also used for patients without their own scenario. */
export const danielTranscript = build([
  [C, "Thanks for coming in. Let's go over how things have been with the prosthesis."],
  [P, "It's been okay, but the socket is getting loose and the liner is worn through.", ['condition']],
  [C, 'Remind me, this is the left leg, below the knee?'],
  [P, 'Yes, left trans-tibial. I lost it about four years ago.', ['level']],
  [C, 'And that was from the vascular disease, right?'],
  [P, 'Right, complications from diabetes.'],
  [C, 'What are you hoping to get out of a new device?'],
  [P, 'I want to keep up with my grandkids and get back to work on my feet.', ['goals']],
  [C, 'What does a normal week look like for you?'],
  [P, 'I walk my dog sometimes, and I do some yard work.', ['activity']],
  [C, 'Anything more demanding?'],
  [P, "We try to get out hiking when the weather's good, mostly on trails."],
  [C, 'Any pain or skin issues?'],
  [P, 'It rubs at the end of the day, mostly around the distal end of the socket.'],
  [C, 'How is the current foot holding up?'],
  [P, "The old foot cracked last spring. I had it patched but it's not the same."],
  [C, "Okay. Let's take a look at the limb and the socket fit."],
  [C, 'I see mild redness at the distal tibia, no open areas. Volume looks reduced.'],
  [P, "That's about what I feel."],
  [C, 'I think we should look at a new socket and a more responsive foot.'],
  [P, 'Sounds good to me.'],
]);

/** Priya Raman: follow-up for an ankle-foot orthosis (AFO), foot drop after a stroke. */
export const priyaTranscript = build([
  [C, 'Good to see you again. How has the brace been since the last visit?'],
  [P, 'Mostly fine, but the strap on the calf has stretched out and the plastic is cracking near the ankle.', ['condition']],
  [C, 'Does it still hold your foot up when you walk?'],
  [P, "Mostly. My toes catch a little when I'm tired, and it rubs on the outside of my ankle.", ['fit']],
  [C, 'How much are you walking these days?'],
  [P, 'I walk around the neighborhood most mornings and I do my own grocery shopping.', ['activity']],
  [C, 'Any stairs at home?'],
  [P, 'Yes, ten steps up to the bedroom. I take them slowly, holding the rail.'],
  [C, 'Any falls?'],
  [P, 'One stumble last month, nothing serious.'],
  [C, "Okay. Let's take a look at the brace and the ankle."],
  [C, 'The back strap is stretched and there is a crack at the inner ankle trim line. The foot clears the floor but with less lift than before.'],
  [P, 'That matches what I feel.'],
  [C, 'I think we should replace the strap and either repair or remake the shell.'],
  [P, 'Okay, whatever keeps me walking.'],
  [C, 'One last thing. The foot drop is still from your stroke two years ago, correct?'],
  [P, 'Yes, two years ago in March.'],
]);
