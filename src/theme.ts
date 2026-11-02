import { Badge, createTheme, type CSSVariablesResolver, type MantineColorsTuple } from '@mantine/core';

/**
 * EVERI design language, kept minimal.
 * Core: Everi Blue (#0163B8, from the logo SVG) + cool slate neutrals + white.
 * Status: amber = missing / at-risk, green = captured / confirmed.
 * Red is reserved for the recording dot only.
 */

// Everi Blue — shade 6 is the brand blue from everi-logo.svg (white text ≈ 6:1)
const everiBlue: MantineColorsTuple = [
  '#E8F1FA', '#CFE2F4', '#A0C5E9', '#6EA7DE', '#3F8AD2',
  '#1675C3', '#0163B8', '#01539A', '#01427B', '#00315B',
];

// Everi Slate — neutrals (also replaces Mantine "gray" so internals match)
const everiSlate: MantineColorsTuple = [
  '#F6F8FA', '#EEF1F5', '#DFE4EA', '#C7CFD9', '#9AA5B3',
  '#6E7A89', '#525D6C', '#3C4655', '#28303C', '#161C25',
];

const amber: MantineColorsTuple = [
  '#FFF7E8', '#FFEDC8', '#FFDC92', '#FFC95A', '#F7B230',
  '#E39A10', '#C27F06', '#965F04', '#6E4503', '#4A2E02',
];

const green: MantineColorsTuple = [
  '#EAF7EF', '#CDEDD9', '#9DD9B6', '#6CC392', '#45AF76',
  '#2E9962', '#238150', '#1B6A41', '#145232', '#0D3A23',
];

// Recording dot ONLY
const recordRed: MantineColorsTuple = [
  '#FFECEC', '#FFD3D3', '#FFA6A6', '#FF7878', '#F45050',
  '#E53434', '#D12626', '#B01C1C', '#8A1414', '#640D0D',
];

const BODY_FONT = "system-ui, -apple-system, 'Segoe UI', 'Helvetica Neue', sans-serif";
const DISPLAY_FONT = `'Plus Jakarta Sans', ${BODY_FONT}`;

/** Non-spacing size tokens. Components reference these, never raw numbers. */
export const tokens = {
  header: 64,
  navbar: { open: 240, collapsed: 72 },
  wideQuery: '(min-width: 80em)', // 1280px: room for expanded nav + transcript column
  logo: { full: 40, mark: 32 },
  avatar: 40, // initials render at 40% of this: 16px, on the type scale
  panelHeader: 56, // every panel header shares this height so titles align
  dot: 8, // recording dot
  checkIndent: 28, // 20px checkbox + 8px gap: text under a checkbox lines up with its label
  transcriptW: 336,
  dialogW: 448, // choice dialogs: wide enough for two clear options, no wrapped buttons
  toolbarW: 640, // template picker + fill button, when they sit in the header
  modalW: 1040, // the expanded template window (a dialog over a dimmed page, not full screen)
  docW: 880,
  fieldActionsW: 56, // room for two small icons inside a field (update from transcript + more options) // readable line length for the full-screen template
  rail: 56,
  ring: { size: 32, thickness: 4 },
  // Patient strip chips (8px grid). Each chip carries its own small caption, so no separate labels.
  chip: { patient: 224, type: 272, device: 304, captionW: 72 },
  stampW: 48,
  tooltipW: 256,
  successIcon: 56,
  skeleton: { title: 16, line: 8 },
  icon: { xs: 12, sm: 16, md: 20, lg: 24, xl: 32 },
  border: {
    none: '1px solid transparent',
    card: '1px solid var(--mantine-color-everiSlate-2)',
    selected: '1px solid var(--mantine-color-everiBlue-6)',
    amber: '1px solid var(--mantine-color-amber-3)',
  },
} as const;

export const theme = createTheme({
  primaryColor: 'everiBlue',
  primaryShade: 6,
  autoContrast: true,
  luminanceThreshold: 0.45,
  colors: { everiBlue, everiSlate, gray: everiSlate, amber, green, recordRed },
  black: '#161C25',
  white: '#FFFFFF',
  fontFamily: BODY_FONT,
  // Two weights only: 400 and 600
  fontWeights: { regular: '400', medium: '600', bold: '600' },
  headings: {
    fontFamily: DISPLAY_FONT,
    fontWeight: '600',
    sizes: {
      h1: { fontSize: '1.875rem', fontWeight: '600', lineHeight: '1.2' }, // 30
      h2: { fontSize: '1.5rem', fontWeight: '600', lineHeight: '1.25' }, // 24
      h3: { fontSize: '1.25rem', fontWeight: '600', lineHeight: '1.3' }, // 20
      h4: { fontSize: '1rem', fontWeight: '600', lineHeight: '1.35' }, // 16
      h5: { fontSize: '0.875rem', fontWeight: '600', lineHeight: '1.4' }, // 14
      h6: { fontSize: '0.75rem', fontWeight: '600', lineHeight: '1.4' }, // 12
    },
  },
  fontSizes: { xs: '0.75rem', sm: '0.875rem', md: '1rem', lg: '1.125rem', xl: '1.25rem' }, // 12 14 16 18 20
  // Controls use md (8). Panels use lg (12). A container inset by 8 inside a 12px panel gets 12 - 8 = 4 (sm).
  defaultRadius: 'md',
  radius: { xs: '2px', sm: '4px', md: '8px', lg: '12px', xl: '16px' },
  spacing: { xs: '0.25rem', sm: '0.5rem', md: '1rem', lg: '1.5rem', xl: '2rem' }, // 4 8 16 24 32
  shadows: {
    xs: '0 1px 2px rgba(22,28,37,0.04)',
    sm: '0 1px 3px rgba(22,28,37,0.06)',
    md: '0 4px 16px rgba(22,28,37,0.08)',
    lg: '0 8px 28px rgba(22,28,37,0.10)',
    xl: '0 16px 48px rgba(22,28,37,0.12)',
  },
  components: {
    // Library-standard compact sizes (Button/Input sm = 36px), matching the Everi product density
    Button: { defaultProps: { fw: 600, size: 'sm' } },
    ActionIcon: { defaultProps: { size: 'lg', variant: 'subtle' } },
    // 12px text and a 24px height keep badges on the type scale and the 8px grid
    Badge: Badge.extend({
      defaultProps: { fw: 600, variant: 'light', tt: 'none', size: 'md' },
      vars: () => ({ root: { '--badge-fz': 'var(--mantine-font-size-xs)', '--badge-height': '1.5rem' } }),
    }),
    Card: { defaultProps: { withBorder: true, padding: 'md', radius: 'lg' } },
    Alert: { defaultProps: { variant: 'light' } },
    Select: { defaultProps: { size: 'sm' } },
    Textarea: { defaultProps: { size: 'sm' } },
    TextInput: { defaultProps: { size: 'sm' } },
    NavLink: { defaultProps: { variant: 'filled', color: 'everiBlue' } },
    Tooltip: { defaultProps: { color: 'everiSlate.9' } },
    // Toasts are transient status messages: auto-dismiss, no tiny unlabeled close button
    Notification: { defaultProps: { withCloseButton: false } },
  },
  other: { displayFont: DISPLAY_FONT },
});

/** AA contrast for dimmed text; calm canvas; borderless "default" buttons on slate. */
export const cssVariablesResolver: CSSVariablesResolver = () => ({
  variables: {},
  light: {
    '--mantine-color-body': '#FFFFFF',
    '--mantine-color-text': 'var(--mantine-color-everiSlate-9)',
    '--mantine-color-dimmed': 'var(--mantine-color-everiSlate-6)',
  },
  dark: {},
});
