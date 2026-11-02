# Everi Labs · Clinical Encounter Assistant (Prototype)

An AI-assisted ambient clinical encounter assistant prototype tailored for Orthotics & Prosthetics (O&P) clinicians, designed to capture documentation, guide compliance in real time without breaking patient eye contact, and resolve claim-denial gaps before discharge.

🔗 **Live Prototype:** [https://everi-x-pranit.vercel.app/](https://everi-x-pranit.vercel.app/)  
📄 **Design & Process Documentation:** https://miro.com/app/board/uXjVJf8d_58=/?share_link_id=730430137539

---

## 🚀 Key Interaction Features

1. **Context Scoping (The Clinical Filter):**
   - Automatically pre-populates the encounter by **Patient**, **Encounter Type**, and **Device on Record**.
   - Dynamically filters the compliance checklist to only the 5–7 high-stakes requirements for that visit, preventing clinical cognitive overload.

2. **Passive In-Visit Tracking (Eye Contact First):**
   - Operates silently during physical exams without intrusive modals, sound alerts, or blinking banners.
   - Topics tick off hands-free in the background as spoken naturally in dialogue.

3. **"Before They Leave" Gap Detection (The Pivot at Stop):**
   - Transforms the checklist at the moment recording stops into an actionable 60-second in-room gap resolution list.
   - Allows instant in-room resolution via voice mic or coded pick-lists, preventing missing Medicare justifications and billing denials.

4. **1-Click Verifiable Provenance & Citations:**
   - Every AI-inferred note field links directly to its source with an exact timestamp (e.g. `[01:42]`).
   - Clicking any citation jumps directly to and highlights the verbatim quote in the collapsible transcript. Items not spoken carry zero ghost citations.

5. **Patient-Specific Safety Guardrails:**
   - **Daniel Alvarez (Prosthetic Eval · Trans-tibial):** Evaluated against Medicare LCD L33787 guidelines and official CMS K-level definitions (K0–K4).
   - **Priya Raman (Follow-up · AFO Orthosis):** Automatic non-amputee guardrail marks amputation and K-level criteria as *Not Applicable* with clinical reasoning and an undo option.

---

## 🛠️ Tech Stack & Frontend Craft

- **Framework:** React 19 + TypeScript (Strict Mode)
- **Component Library & Design System:** Mantine v9 (`@mantine/core`, `@mantine/hooks`, `@mantine/notifications`)
- **Icons:** Tabler Icons (`@tabler/icons-react`)
- **Styling & Tokens:** Strict 8-point spacing grid, custom Everi brand palettes, and Plus Jakarta Sans typography
- **Bundler:** Vite 8 (Zero console errors, WCAG 2.2 AA accessible)

---

## 💻 Local Development

```bash
# 1. Install dependencies
npm install

# 2. Start local development server
npm run dev

# 3. Production build & typecheck
npm run build
```

---

## 📂 Project Structure

```
everi-assistant/
├── src/
│   ├── components/       # Modular UI components (SessionBar, CapturePanel, TemplatePanel, etc.)
│   ├── data/             # Authentic O&P mock data (checklists, Medicare LCD templates, transcripts)
│   ├── screens/          # Primary workspace & evolution iterations
│   ├── state/            # Encounter state machine and dispatch store
│   ├── theme.ts          # Mantine design tokens, typography scale & color variables
│   ├── types.ts          # Strict TypeScript domain interfaces
│   ├── App.tsx           # Main application shell with iteration switcher
│   └── main.tsx          # Application entry point
├── docs/                 # Detailed PRD, trade-offs, and reflections
├── package.json
└── tsconfig.json
```
