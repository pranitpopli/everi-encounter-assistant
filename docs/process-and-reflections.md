# Clinical Encounter Assistant: process, decisions and reflections

Case: Everi Labs, *Clinical Encounter Assistant*. Prototype: React + TypeScript + Mantine, mock data, no backend.
The brief asks for three things: **set context**, **stay on track during the visit without the interface getting in the way**, and **review and document after**.

---

## 1. How the work evolved (the short story)

| Round | What I tried | What I learned |
|---|---|---|
| 1. My own PRD | Four screens: Setup → Live → Checkpoint ("Before they leave") → Note. Strict design rules (theme first, tokens, red only for recording). | The structure worked, but four screens means four context switches for a clinician. |
| 2. Visual direction | Kept only the Everi left menu. Tried a Tandem Health-style minimal look. | Minimal is right, but it has to *feel like Everi*. I went back to Everi blue, the Everi logo and Everi's real layout. |
| 3. One page | Rebuilt as one AI Transcription workspace, like the current Everi page: patient strip, "What you need to capture", Generated Template, collapsible Live Transcript. | Everything in one place beats separate screens. The clinician never navigates. |
| 4. Real content | Researched real O&P documentation: Medicare LCD L33787 criteria (Ottobock packet), official K-level definitions, an O&P SOAP article, and Everi's own Subjective Evaluation fields. | A believable template made every other decision easier to judge. |
| 5. Simplify | Removed what didn't earn its place: Pause, Flag, Ask patient now, risk chips, confirm buttons, recording animation, duplicate text. | Every removal made the screen calmer and the remaining actions clearer. |
| 6. Second patient | Added Priya Raman (ankle-foot orthosis follow-up) with her own conversation. | Testing a non-amputee exposed wording and fields that only made sense for prosthetics. |

---

## 2. The flows I designed

### Flow A: the main visit (one page)
1. **Pick the patient.** The encounter type, device, age, referral and last visit fill in from the profile.
2. **Start recording.** A red dot, the time and "Recording". Nothing moves on screen.
3. **During the visit (passive).** The checklist ticks itself as topics are heard. Follow-up questions the conversation raises appear quietly ("Patient walks the dog sometimes. How far?"). The clinician doesn't need to look.
4. **Stop.** The checklist becomes **"Before they leave"**, and the note is **written automatically**.
5. **Close the gaps while the patient is still there.** Answer by typing, voice or a pick-list, then **Add to note**. Or choose **Later** (becomes a follow-up question) or **Not relevant** (the AI was wrong).
6. **Review the note.** Every AI-written field shows *AI-inferred* and a **timestamp** of where it came from. Click the timestamp to open the transcript at that moment.
7. **Fill what's missing.** Use the **‹ ›** arrows to jump between missing fields. Pick the diagnosis code and K-level from official lists, and mark fields **Not applicable** where needed.
8. **Sign off and finalize.** One checkbox, "I've reviewed this note", then **Note ready**.

### Flow B: mid-visit fill
Press **Fill from transcript** at any time. It fills only from what's been heard so far. **Update from transcript** later keeps the clinician's edits, marked "kept your edit".

### Flow C: checking a source (trust)
Timestamp → the transcript panel opens → the line is highlighted. The transcript also has a search bar. Only things the conversation produced have a timestamp. A requirement nobody has mentioned has nothing to point at.

### Flow D: recording control
**Start → Stop → Resume**, in one recording per visit. No pause, no "start new" inside a visit. A new visit is a new encounter. A microphone problem shows an inline alert with Retry.

### Flow E: answering a question and seeing where it went
**Add to note** → a toast says the section (for example "Added to Objective Evaluation (O)") → the form scrolls to that field and highlights it. If the form already has a matching field, the answer fills it. Otherwise it's added at the end of the right section.

### Flow F: choosing the document
SOAP note, Prosthetic evaluation (LCD), or Cleaned transcript. The default follows the encounter type (prosthetic evaluation → LCD, otherwise SOAP) until the clinician picks one. The template is always visible as a form, even before it's filled.

### Flow G: reading and editing at length
The **Expand** icon opens the template in a **dialog over a dimmed page**. Click outside or press Esc to close. Edits are kept. A timestamp inside it closes the dialog and shows the transcript.

### Flow H: saving
**Save session** (transcript + note + capture list), or **transcript only** or **note only**.

### Patient variants (to show the logic, not just one path)
- **Daniel Alvarez:** prosthetic evaluation, Medicare-style LCD note. The last visit left the K-level undocumented, so the form flags it.
- **Priya Raman:** orthosis follow-up, SOAP note. She's not an amputee, so the amputation fields are **Not applicable automatically**, with a reason and an Undo. Her stroke history comes from the conversation.
- **Walter Chen:** first visit with no diagnosis on the referral. The visit type is inferred, and the strip flags "Not on referral".

### Demo-only controls
Skip to the end of the conversation, simulate a microphone issue, restart.

---

## 3. Key interaction decisions (and why)

1. **One page instead of four screens.** The brief cares about not interrupting care. Moving between screens is an interruption, and one page keeps context.
2. **Guidance is passive during the visit.** The clinician is looking at the patient, not the screen. I removed the pinned reminder, the animation and the risk chips. The screen still shows everything for a quick glance.
3. **"Before they leave" happens in place, at Stop.** The value moment is catching gaps while the patient is still in the room, so the same panel turns into the gap list. There's no new screen.
4. **The checklist holds only questions to ask.** Diagnosis code, Medicare criteria, K-level and medical necessity are things the *clinician* judges or looks up, not questions for the patient. They live in the form, with pick-lists using official wording. The checklist added the questions a normal chat skips (activities before amputation, walking aids, previous prostheses).
5. **The checklist does not change with the note format.** At first, picking SOAP hid the Medicare items. I reversed that: claim requirements come from the visit, not from how the note is laid out. Hiding them could cause a denied claim.
6. **Provenance is a timestamp, and only where it's true.** "2:00" says exactly where the AI got something. Items nobody mentioned have no source, rather than a misleading link.
7. **Trust states are quiet unless they matter.** The default "AI-inferred" is plain grey text. Only *Confirmed*, *Clinician answer* and *Needs answer* get a badge, so ten AI fields in a row don't shout.
8. **One sign-off instead of confirm buttons.** Confirming every field or section felt like busywork and invited rubber-stamping. Editing a field confirms it, and finalizing needs one honest review checkbox. It warns, without a number, when required fields are still empty.
9. **Arrows through missing fields.** Like Google Forms pointing at the next unanswered question. A long form needs navigation, not scanning. *Not applicable* stops intentional blanks from nagging. Required fields can't be skipped.
10. **Counts say what they count.** "7 fields need attention" (form) versus "3 questions open" (checklist). Mixing a "required" number into the footer made the numbers look contradictory, so required is marked on the field itself.
11. **The patient strip shows values, not empty fields.** Type and device are *mandatory but autofilled*. They're shown as chips that open on click. Below them are three captioned facts: age, referral, last visit.
12. **Stop and Resume only.** Pause duplicated Stop. One recording per visit removes a dialog and a decision.
13. **The note writes itself on Stop.** Otherwise the clinician's answers had nowhere visible to go.
14. **Expand is a standard dialog.** I tried widening in place, full screen, and a focus mode. A centered dialog over a dimmed page is the familiar pattern, keeps the page in view, and gives the form the height it needs.
15. **A real template.** Sections and fields follow real Medicare and O&P documentation, cited in the UI. Only the AI-written values are mock.
16. **Design constraints first.** An 8-point spacing grid, a fixed type scale (12/14/16/18/20/24/30), nested-radius rules, two font weights, Everi blue, and red only for recording. I cut helper text that only restated the layout, and used a squint test to quiet repeated elements.

---

## 4. Assumptions

- **Users:** prosthetists and orthotists, using a laptop or tablet near the patient. During the visit they mostly don't look at the screen.
- **Recording:** one visit is one recording. A new visit is a new encounter.
- **The patient profile already holds** diagnosis or referral, the device on record, the booked visit type, and past visits with their open items.
- **Payer:** Daniel is treated as a Medicare patient, so LCD rules apply. In reality the payer would decide this.
- **The AI can be wrong.** That's why *Not relevant* exists and why everything AI-written is marked and traceable.
- **Claim denials come mainly from missing documentation**, so catching gaps before the patient leaves is the highest-value moment.
- **Real-world rules:** LCD content is based on the Ottobock packet (Medicare LCD L33787). Search results suggested a 2026 policy revision, which I did not verify.
- **Mock only:** the AI, transcription and timing are all scripted. This is a prototype.

---

## 5. Trade-offs I made

| Chose | Over | Why / cost |
|---|---|---|
| One fixed screen | A scrolling page | Calm and predictable, with controls always visible. On very short windows the panels get tight, and the Expand dialog compensates. |
| Passive guidance | Live nudges | Protects eye contact. The risk is that a clinician never glances and only learns about gaps at Stop. |
| Library-default control sizes (36px), matching Everi density | 44px touch targets | Matches the product. Still meets the WCAG 2.2 AA minimum (24px), but is less comfortable on a tablet. |
| Real templates for two cases | Many encounter types | Depth over breadth. Initial and Follow-up checklists are shorter stubs. |
| Scripted scenarios per patient | Generic mock | Believable demos, but each new patient needs hand-written content. |
| Sign-off at finalize | Field-by-field confirmation | Less busywork. Weaker per-field audit trail. |
| Device as a label only | Device-driven rules | Kept scope down. In reality the device should pick the coverage rules (for example, K-level only for lower-limb prostheses). |
| No Patients page | Building profile management | Out of scope. The patient picker stands in for the profile. |
| Auto-fill on Stop | Clinician-triggered fill only | Answers always have a destination. Less explicit control at that moment. |
| Removed Flag, Pause and Ask patient now | Keeping more controls | Fewer decisions. Flag is listed as future work. |

---

## 6. With more time

- **Real AI:** incremental transcription and question detection during the visit, with confidence levels, and learning from *Not relevant* per clinician or clinic.
- **Rules engine:** visit purpose + device category + payer → which questions and fields apply. Device and payer become meaningful, not labels.
- **Patients page:** payer, devices on record (components, delivery date, age), and "last verified" dates. Facts already on file count as captured, with a "From profile" source, and an "Update the profile?" prompt when the clinician corrects something.
- **Clinician testing:** usability sessions with prosthetists and orthotists, measuring missed items, time to finalize, and how often people glance at the screen during a visit.
- **Tablet and voice:** larger touch mode, phone as microphone, and a hands-free "add to note" by voice.
- **Policy accuracy:** verify the current LCD and policy wording (2026 revision), and add payer-specific variants.
- **Audit and compliance:** edit history per field, signature, and timestamped sign-off.
- **The "Later" loop:** after the visit, a follow-up workflow (message the patient, or ask the referring physician).
- **Flag this moment:** bookmarks during recording.
- **Process artifacts:** a clean flow diagram, a decision log, and a copy ban-list for the design system.

---

## 7. What I would do differently

1. **Start with flows and sketches, not code.** The case asks for process artifacts. I'd have avoided several rebuilds by agreeing the flow on paper first.
2. **Confirm the source of truth early.** I worked from my own detailed PRD before re-reading Everi's much shorter brief. The brief leaves layout open, and my PRD over-constrained it.
3. **Pick the visual language once.** I went through three looks (custom, Tandem-style, Everi). Starting from the Everi product would have saved a round.
4. **Clarify ambiguous requests before building.** "Expand" went through four versions (wider panel, full screen, focus mode, scrolling page) before landing on a dialog. One clarifying question at the start would have saved all of that.
5. **Decide what the checklist is for, up front.** I mixed "questions to ask" with "fields to fill" and only separated them late. That one distinction simplified the checklist, the form and the counts.
6. **Keep a decision log as I go,** instead of reconstructing it at the end.
7. **Respect the timebox.** The brief suggests 4–6 hours. A tighter first version and a clear "with more time" list would show prioritization better than polishing every edge.

---

## 8. How it was checked

- **Automated walkthrough:** a script drives the real app in Microsoft Edge at tablet (1024×768) and desktop (1440×900) sizes. It covers Daniel's and Priya's full paths, the dialogs, the arrows, Not applicable, saving and finalizing: **181 checks passing**.
- **Accessibility audit** (axe, WCAG 2.2 AA) on every state: clean.
- **Design-constraint checks:** every font size on the type scale, every target ≥ 24px, only one animation (the transcript glow while recording), no console errors.

---

## 9. Sources used for the template content

- Ottobock, *Lower Limb Prosthesis Documentation Packet* (2020), Medicare LCD L33787 criteria and official K-level definitions.
- Össur, *Documenting Functional Levels*.
- O&P trade article, *SOAP Notes Can Clean up Your Records* (2014).
- Everi Labs' own Subjective Evaluation form (from the product screenshot).
