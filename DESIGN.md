---
name: "Metro NY"
description: "A precise, calm operations system built around signal clarity and dense metro data."
colors:
  signal-blue: "#2563eb"
  deep-signal-blue: "#1d4ed8"
  skyline-cyan: "#0ea5e9"
  dispatch-navy: "#101828"
  dispatch-hover-slate: "#1d2939"
  console-mist: "#f4f7fb"
  work-surface: "#ffffff"
  control-ink: "#172033"
  field-ink: "#344054"
  muted-copy: "#667085"
  quiet-copy: "#98a2b3"
  divider-fog: "#e4e7ec"
  info-ink: "#175cd3"
  info-surface: "#eff8ff"
  clear-signal: "#12b76a"
  success-ink: "#027a48"
  success-surface: "#ecfdf3"
  caution-amber: "#f79009"
  warning-ink: "#b54708"
  warning-surface: "#fffaeb"
  incident-red: "#f04438"
  danger-ink: "#b42318"
  danger-surface: "#fef3f2"
  entry-indigo: "#0505a9"
typography:
  display:
    fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "clamp(38px, 4.4vw, 64px)"
    fontWeight: 700
    lineHeight: 1.04
    letterSpacing: "-0.045em"
  headline:
    fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "27px"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.03em"
  title:
    fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "16px"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "normal"
  body:
    fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  navigation:
    fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "14px"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "normal"
  label:
    fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "11px"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0.06em"
  mono:
    fontFamily: "SFMono-Regular, Consolas, Liberation Mono, monospace"
    fontSize: "11px"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "normal"
rounded:
  status: "5px"
  chip: "6px"
  control: "8px"
  navigation: "9px"
  input: "11px"
  card: "13px"
  dialog: "15px"
  entry: "30px"
  pill: "999px"
  circle: "50%"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "20px"
  2xl: "24px"
  shell: "30px"
  section: "40px"
components:
  button-primary:
    backgroundColor: "{colors.signal-blue}"
    textColor: "{colors.work-surface}"
    typography: "{typography.label}"
    rounded: "{rounded.navigation}"
    padding: "0 15px"
    height: "42px"
  button-primary-hover:
    backgroundColor: "{colors.deep-signal-blue}"
    textColor: "{colors.work-surface}"
    typography: "{typography.label}"
    rounded: "{rounded.navigation}"
    padding: "0 15px"
    height: "42px"
  button-text:
    backgroundColor: "transparent"
    textColor: "{colors.signal-blue}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "7px 9px"
  field-standard:
    backgroundColor: "{colors.work-surface}"
    textColor: "{colors.control-ink}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "0 12px"
    height: "42px"
  navigation-default:
    backgroundColor: "transparent"
    textColor: "{colors.quiet-copy}"
    typography: "{typography.navigation}"
    rounded: "{rounded.navigation}"
    padding: "10px 13px"
    height: "46px"
  navigation-active:
    backgroundColor: "{colors.signal-blue}"
    textColor: "{colors.work-surface}"
    typography: "{typography.navigation}"
    rounded: "{rounded.navigation}"
    padding: "10px 13px"
    height: "46px"
  card-operational:
    backgroundColor: "{colors.work-surface}"
    textColor: "{colors.control-ink}"
    rounded: "{rounded.card}"
    padding: "20px"
  chip-success:
    backgroundColor: "{colors.success-surface}"
    textColor: "{colors.success-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "5px 8px"
  dialog:
    backgroundColor: "{colors.work-surface}"
    textColor: "{colors.control-ink}"
    rounded: "{rounded.dialog}"
    width: "min(720px, 100%)"
  button-entry-signature:
    backgroundColor: "{colors.work-surface}"
    textColor: "{colors.entry-indigo}"
    typography: "{typography.label}"
    rounded: "{rounded.entry}"
    padding: "0 28px"
    height: "56px"
---

# Design System: Metro NY

## Overview

**Creative North Star: "The Dispatch Console"**

The Dispatch Console treats the interface as a calm, dependable operations room: Dispatch Navy anchors the shell, Signal Blue identifies action and active state, and Console Mist keeps dense administrative data readable for long sessions. The system is professional and specific to metro work, using route discs, status signals, operational labels, tables, and live-state cues instead of decorative dashboard tropes.

Routine screens stay compact and decisive, with precise spacing, restrained interaction, and a clear progression from page heading to summary, filters, and records. Visual intensity is reserved for meaningful state and exceptional entry moments; the login may become more expressive, while the working console remains quiet enough for scanning and decision-making.

**Key Characteristics:**

- Dark Dispatch Navy navigation paired with bright, low-noise work surfaces.
- Compact Inter typography with small uppercase operational labels and firm numeric emphasis.
- Signal Blue reserved for action, selection, focus, and information—not ambient decoration.
- Thin dividers, quiet tonal layering, and restrained shadows supporting dense data.
- Metro-specific status discs, route markers, tables, and operational language.

## Colors

The palette combines cool operational neutrals with a single confident blue action signal and semantic colors that behave like system indicators.

### Primary

- **Signal Blue** (`signal-blue`): The main action, selected navigation, focus, and informational emphasis color.
- **Deep Signal Blue** (`deep-signal-blue`): The controlled hover and pressed-state companion to Signal Blue.

### Secondary

- **Skyline Cyan** (`skyline-cyan`): A limited companion used in the circular brand-mark gradient and entry-surface atmosphere.
- **Entry Indigo** (`entry-indigo`): Reserved for the animated signature entry button; it is not a routine administrative action color.

### Tertiary

- **Clear Signal** (`clear-signal`) with **Success Ink** and **Success Surface**: Healthy, active, on-time, and completed states.
- **Caution Amber** (`caution-amber`) with **Warning Ink** and **Warning Surface**: Delays, partial service, pending attention, and medium-severity states.
- **Incident Red** (`incident-red`) with **Danger Ink** and **Danger Surface**: Errors, destructive actions, active incidents, and high-severity states.
- **Information Ink** and **Information Surface**: Low-intensity informational notices and category treatments.

### Neutral

- **Dispatch Navy** (`dispatch-navy`): The stable sidebar and primary shell anchor.
- **Dispatch Hover Slate** (`dispatch-hover-slate`): Hover and secondary layering inside the dark shell.
- **Console Mist** (`console-mist`): The cool application background separating work surfaces without visual noise.
- **Work Surface** (`work-surface`): Cards, tables, fields, top bars, dialogs, and menus.
- **Control Ink** (`control-ink`): Primary headings and high-priority values.
- **Field Ink** (`field-ink`): Strong labels, row identities, and secondary headings.
- **Muted Copy** (`muted-copy`): Supporting descriptions and routine secondary text.
- **Quiet Copy** (`quiet-copy`): Metadata, timestamps, placeholders, and low-priority labels.
- **Divider Fog** (`divider-fog`): Structural borders and separators.

### Named Rules

**The Signal, Not Spectacle Rule.** Signal Blue marks action, selection, focus, and useful information; it does not wash entire routine screens in color.

**The Status Has Meaning Rule.** Green, amber, and red always communicate operational state and must be paired with text, icons, or labels rather than color alone.

## Typography

**Display Font:** Inter with the system sans-serif stack  
**Body Font:** Inter with the system sans-serif stack  
**Label/Mono Font:** Inter for interface labels; SFMono-Regular, Consolas, or Liberation Mono for credentials and code-like values

**Character:** One practical sans-serif family creates an exact, contemporary control-room voice. Hierarchy comes from size, weight, compact line height, and disciplined letter spacing rather than decorative type pairing.

### Hierarchy

- **Display** (700, `display`, 1.04): Large entry-surface statements only, especially the split login panel.
- **Headline** (700, `headline`, 1.2): Page titles for administrative modules; reduce to 23px on narrow screens.
- **Title** (700, `title`, 1.25): Card headers, panel titles, and compact section headings.
- **Body** (400, `body`, 1.5): Page descriptions, field content, and explanatory copy.
- **Navigation** (500, `navigation`, 1.4): Persistent module navigation with enough weight for rapid scanning.
- **Label** (700, `label`, 0.06em): Eyebrows, table headers, compact actions, and status language; uppercase is reserved for short operational labels.
- **Mono** (400, `mono`, 1.4): Demo credentials and other values users may need to transcribe exactly.

### Named Rules

**The Compact Hierarchy Rule.** Dense screens use small labels and restrained body text, but page titles, key values, and actions must remain immediately distinguishable.

## Layout

The authenticated application uses a fixed operational shell: a 270px sticky Dispatch Navy sidebar, an 86px sticky top bar, and a fluid work area capped at 1600px. Desktop modules follow a repeatable vertical rhythm of heading, optional notice, four-column summary grid, tabs or charts, toolbar, and data surface. Primary page gutters are 30px, recurring panel padding is 20px, and adjacent data regions generally use 16–24px gaps.

Summary metrics use equal-height 112px cards. Dashboard analysis areas use asymmetric two-column grids, while management records use full-width tables with horizontal overflow instead of compressing essential columns. Tables favor 13px by 14px cells, compact 9px headers, and 11px row content.

Responsiveness is a controlled compression of the console. Summary grids collapse from four to two columns around 1100–1200px and to one column at 720px. The sidebar becomes an off-canvas drawer below 900px, search and secondary identity details recede as width tightens, module headings stack, and mobile dialogs become bottom sheets below 640px.

**The Operational Horizon Rule.** Preserve scan lines, aligned controls, and readable records; collapse structure by priority instead of shrinking dense content past usability.

## Elevation & Depth

The system uses layered operational elevation. Thin borders and tonal contrast establish normal hierarchy; a nearly ambient shadow supports cards without making every region float. Blue-tinted shadows reinforce primary actions, while menus, popovers, dialogs, and modals receive visibly stronger shadows because they cross the working plane. Backdrop blur belongs to the sticky top bar and modal context, not to routine cards.

### Shadow Vocabulary

- **Card Ambient** (`0 3px 12px rgb(16 24 40 / 3%)`): Summary cards, dashboard cards, and management panels at rest.
- **Primary Action Lift** (`0 6px 16px rgb(37 99 235 / 20%)`): Main module actions and selected navigation.
- **Floating Panel** (`0 18px 45px rgb(15 23 42 / 16%)`): Search results, notifications, and account menus.
- **Dialog Lift** (`0 24px 60px rgb(15 23 42 / 28%)`): Dialogs and modal forms above the dimmed application.
- **Focus Halo** (`0 0 0 3px rgb(37 99 235 / 10%)`): Inputs and composite controls receiving keyboard or text focus.

### Named Rules

**The Layered Operational Rule.** Borders and tone do the everyday structural work; strong shadows appear only when a surface genuinely moves above the console.

## Shapes

The form language is gently rounded and pragmatic. Routine controls cluster around 8–9px corners, inputs and icon tiles use 10–11px, operational cards use 13px, and dialogs use 15–16px. Pills are reserved for statuses, counts, and compact categorical metadata. Circles carry identity and transit meaning: brand marks, avatars, live indicators, and route codes.

The signature entry action uses a 30px capsule because it belongs to an exceptional moment. That silhouette should not leak into ordinary create, save, filter, or table actions.

**The Soft, Not Playful Rule.** Corners reduce visual friction, but geometry remains compact, aligned, and task-oriented rather than bubbly or ornamental.

## Components

Components feel compact and decisive, with exact spacing, short transitions, and visible state changes that do not compete with the data.

### Buttons

- **Shape:** Routine primary controls use gently rounded 8–9px corners and 40–42px minimum height.
- **Primary:** Signal Blue fill, white label, compact 12px bold text, and restrained blue lift; hover deepens the blue without changing layout.
- **Text / Ghost:** Transparent at rest, using Signal Blue or muted ink; hover adds a pale blue or neutral surface.
- **Focus:** Use a clear blue halo or equivalent visible focus treatment without removing the semantic control outline unless replaced.
- **Signature Entry:** The 56px animated blob capsule is preserved for login and exceptional entry moments only, including a reduced-motion path.

### Chips

- **Style:** Compact 5px by 8px padding, 6px or pill corners, bold 9–10px labels, and paired pale-surface/strong-ink semantic colors.
- **State:** Status labels always include text; live states may add a small circular indicator.

### Cards / Containers

- **Corner Style:** Operational cards use gently rounded 13px corners.
- **Background:** Work Surface over Console Mist.
- **Shadow Strategy:** Card Ambient at most; many inner containers stay border-only.
- **Border:** One-pixel Divider Fog or a nearby cool neutral.
- **Internal Padding:** Usually 16–20px, reaching 23px in form layouts.

### Inputs / Fields

- **Style:** White fill, one-pixel cool border, 8–11px corners, 40–52px height, and compact internal padding.
- **Focus:** Border shifts to a light blue and receives the Focus Halo.
- **Error / Disabled:** Error uses the danger surface and ink with explicit copy; disabled or submitting controls reduce opacity and preserve their label.

### Navigation

The desktop sidebar is dark, persistent, and module-led. Links are 46px high with a 9px radius, quiet gray default text, a darker navy hover surface, and a Signal Blue active state. Hover movement is limited to a 2px horizontal nudge. Below 900px, navigation becomes a dismissible off-canvas drawer with a dimmed backdrop.

### Tables and Toolbars

Management panels combine underlined tabs, a Console Mist–adjacent toolbar, search and select controls, and horizontally scrollable tables. Table headers are uppercase and quiet; row identity uses stronger ink, and hover adds only a faint neutral wash. Row actions remain small icon controls at the edge of the record.

### Dialogs

Dialogs use Work Surface, a 15px radius, divided header/body/footer regions, and Dialog Lift. Desktop forms use two columns where appropriate; below 640px, dialogs dock as bottom sheets and actions share the available width.

### Signature Entry Button

The blob button is a deliberate entry ritual: Entry Indigo outlines the capsule, animated fill rises through four organic lobes, and label color reverses to white. Preserve the interaction at login and similarly exceptional gates, honor `prefers-reduced-motion`, and never use it as the default administrative CTA.

### Named Rules

**The Routine vs. Entry Rule.** Routine work uses quiet, rectangular controls; expressive motion and the blob capsule belong only to exceptional entry moments.

## Do's and Don'ts

### Do:

- **Do** preserve the Dispatch Navy shell, Console Mist canvas, and white operational surfaces as the stable hierarchy.
- **Do** use Signal Blue consistently for primary action, active navigation, focus, and useful information.
- **Do** keep status color semantic and reinforce it with readable labels or icons.
- **Do** preserve compact tables, aligned toolbars, and responsive priority-based collapse.
- **Do** reserve expressive gradients and the animated blob treatment for brand and entry moments.

### Don't:

- **Don't** turn the console into a futuristic neon or cyberpunk control room.
- **Don't** use excessive glassmorphism, exaggerated gradients, or pervasive translucent cards.
- **Don't** default to a generic card-heavy SaaS dashboard when a table, route marker, status signal, or operational panel is more specific.
- **Don't** repeat the blob button across routine create, save, filter, or row actions.
- **Don't** visually imply that Metro NY is an official MTA product or reproduce an official identity it does not own.
