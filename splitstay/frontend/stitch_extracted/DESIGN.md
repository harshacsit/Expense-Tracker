---
name: SplitStay Living
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#434655'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#747686'
  outline-variant: '#c4c5d7'
  surface-tint: '#2151da'
  primary: '#0037b0'
  on-primary: '#ffffff'
  primary-container: '#1d4ed8'
  on-primary-container: '#cad3ff'
  inverse-primary: '#b7c4ff'
  secondary: '#0051d5'
  on-secondary: '#ffffff'
  secondary-container: '#316bf3'
  on-secondary-container: '#fefcff'
  tertiary: '#004e47'
  on-tertiary: '#ffffff'
  tertiary-container: '#00685f'
  on-tertiary-container: '#7be7d9'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dce1ff'
  primary-fixed-dim: '#b7c4ff'
  on-primary-fixed: '#001551'
  on-primary-fixed-variant: '#0039b5'
  secondary-fixed: '#dbe1ff'
  secondary-fixed-dim: '#b4c5ff'
  on-secondary-fixed: '#00174b'
  on-secondary-fixed-variant: '#003ea8'
  tertiary-fixed: '#89f5e7'
  tertiary-fixed-dim: '#6bd8cb'
  on-tertiary-fixed: '#00201d'
  on-tertiary-fixed-variant: '#005049'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  display:
    fontFamily: Plus Jakarta Sans
    fontSize: 56px
    fontWeight: '800'
    lineHeight: 64px
    letterSpacing: -0.03em
  display-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 38px
    fontWeight: '800'
    lineHeight: 44px
    letterSpacing: -0.025em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.025em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 30px
    letterSpacing: -0.015em
  title-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  numerical-balance:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-desktop: 2rem
  margin: 1.25rem
  margin-tablet: 2.5rem
  margin-desktop: 4rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
  space-2xl: 4rem
---

## Brand & Style
This design system powers a modern shared-expense and household management platform designed for roommates, co-living spaces, and shared flats. It merges the reliability of institutional fintech with the warmth and approachability of contemporary shared living.

### Target Audience & Emotional Impact
The interface serves young professionals, urban sharers, and co-living tenants who require transparency, frictionless splitting, and complete financial clarity without awkward friction. The visual experience must evoke:
- **Absolute Trust:** Friction-free ledger math with crisp structural balance.
- **Harmony & Modernity:** Soft tones combined with energetic royal blue anchors.
- **Relief:** Eliminating household financial ambiguity through immediate, scannable data layouts.

### Design Movement: Modern Precision SaaS
A hybrid of high-clarity **Modern Corporate** structure and **Soft Modernist** styling. The framework prioritizes generous breathing room, architectural cards framed by refined royal blue accents, structural precision, and subtle atmospheric depth over heavy skeuomorphism.

## Colors
The palette balances pure luminance, soft blue-gray atmospheric surfaces, and deep royal blue accents to communicate institutional security with consumer vibrancy.

### Core Roles
- **Primary (`#1D4ED8`):** Deep royal blue used for primary calls-to-action, key headers, active states, and focal card borders.
- **Secondary (`#2563EB`):** Bright cobalt royal blue for hover states, focus rings, interactive toggles, and live metric indicators.
- **Tertiary (`#0D9488`):** Deep teal reserved strictly for positive balances, settled debts, and positive settlement milestones.
- **Neutral Core (`#0F172A`):** Deep slate ink for primary high-contrast typography, avoiding pure pitch black for visual elegance.

### Surface Tones & Backgrounds
- **Base Background:** `#FFFFFF` pure white canvas ensuring unmatched clarity.
- **Subtle Surface 1 (`#F8FAFC`):** Slate-tinted neutral surface for nested containers, structural sections, and secondary cards.
- **Subtle Surface 2 (`#F1F5F9`):** Soft blue-gray foundation for tables, input troughs, tab lists, and inactive chips.
- **Card Border Tint (`#DBEAFE` / `#93C5FD`):** Light royal blue border shades providing precise boundary definition without harsh dark strokes.

## Typography
Plus Jakarta Sans provides geometric balance with contemporary rounded terminals, imparting a clean, human fintech presence.

### Typographic Guidelines
- **Weight Pairing:** Pair bold headers (`700`/`800`) with regular body text (`400`) to enforce a sharp vertical hierarchy without visual clutter.
- **Numbers & Metrics:** Use tabular numbers (`font-variant-numeric: tabular-nums`) across all expense ledgers, balance statements, and card metrics to preserve vertical alignment.
- **Microcopy:** Apply uppercase tracking sparingly, strictly on `label-md` category tags or split allocation indicators.

## Layout & Spacing
The layout follows a 12-column responsive fluid grid capped at a maximum inner container width of 1280px.

### Grid Rhythm & Adapters
- **Desktop (1024px+):** 12 columns with 32px (`gutter-desktop`) gutters and 64px (`margin-desktop`) outer padding. Supports multi-column dashboard preview cards, side-by-side expense feeds, and interactive settlement splits.
- **Tablet (768px - 1023px):** 8 columns with 24px (`gutter`) gutters and 40px (`margin-tablet`) outer margin. Hero layouts collapse from horizontal two-column sections into stacked orientation.
- **Mobile (320px - 767px):** 4 columns with 16px gutters and 20px outer margin. Metric cards convert into horizontal swipe rails or stacked 100% width units.

### Spacing Principles
- Internal card padding strictly utilizes `space-lg` (24px) to sustain roominess.
- Section-to-section breaks use `space-2xl` (64px) to retain breathing room against crisp card borders.

## Elevation & Depth
Depth is created through low-contrast outlines coupled with cool-tinted ambient illumination rather than harsh, dark drop shadows.

### Atmospheric Shadow Structure
- **Level 0 (Flat):** Neutral white or off-white background with a 1px solid border (`#E2E8F0` or `#DBEAFE`). No shadow.
- **Level 1 (Card Rest):** Surface white `#FFFFFF` layered over `#F8FAFC`. Shadow: `0 2px 8px -2px rgba(15, 23, 42, 0.04), 0 6px 16px -4px rgba(37, 99, 235, 0.04)`. Outer stroke: 1px solid `#DBEAFE`.
- **Level 2 (Interactive Hover / Floating Panels):** Lifted cards on cursor engagement. Shadow: `0 12px 28px -6px rgba(15, 23, 42, 0.08), 0 4px 12px -2px rgba(37, 99, 235, 0.06)`. Border transitions to `#93C5FD`.
- **Level 3 (Modals & Settlement Popovers):** High-priority focus layers. Shadow: `0 24px 48px -12px rgba(15, 23, 42, 0.12), 0 8px 24px -4px rgba(29, 78, 216, 0.08)`. Border: 1px solid `#93C5FD`.

## Shapes
The design uses an intentional 14px to 20px radius geometry (`roundedness: 2`) that evokes consumer approachability while maintaining a clean, structured edge.

### Radius Distribution
- **Cards & Primary Surface Blocks:** 16px to 20px (`rounded-xl` / 1.25rem), yielding friendly, inviting enclosures for debt trees, expense cards, and summary modules.
- **Buttons, Text Inputs & Select Fields:** 12px to 14px for precise tactile feel.
- **Badges, Avatars & Status Indicators:** Full pill geometry (`rounded-full`) for quick categorical scanning and participant identification.

## Components

### Buttons
- **Primary CTA:** Background `#1D4ED8`, text `#FFFFFF`, radius 12px, font `label-lg`. Padding: 12px 24px. Subtle internal highlight overlay with hover shift to `#2563EB`. Active state transitions slightly downward (`scale(0.99)`).
- **Secondary / Soft Button:** Background `#EFF6FF`, border 1px solid `#BFDBFE`, text `#1D4ED8`. Hover background shifts to `#DBEAFE`.
- **Ghost Action:** Borderless, text `#475569`, hover text `#1D4ED8`, hover background `#F1F5F9`.

### Cards & Expense Containers
- **Standard Card:** Background `#FFFFFF`, border `1px solid #DBEAFE`, corner radius 18px, padding 24px.
- **Focal / Featured Card:** Background `#FFFFFF`, border `2px solid #2563EB`, paired with an internal soft top accent tint (`#F8FAFC`). Includes subtle Level 1 ambient blue glow.
- **Metric Micro-Card:** Background `#F8FAFC`, border `1px solid #E2E8F0`, corner radius 14px, padding 16px.

### Inputs & Form Elements
- **Text Inputs:** Height 48px, background `#FFFFFF`, border `1px solid #CBD5E1`, text `#0F172A`, placeholder `#94A3B8`, radius 12px, padding 0 16px. Focus state triggers border `1.5px solid #2563EB` and a 3px ring of `rgba(37, 99, 235, 0.15)`.
- **Checkboxes & Radios:** 20px square/circle, border 1.5px solid `#94A3B8`, background `#FFFFFF`. Selected state fills `#1D4ED8` with a crisp white tick.

### Chips & Badges
- **Status Chips:** Height 28px, radius 9999px (pill), horizontal padding 12px.
  - **Settled / Paid:** Background `#F0FDF4`, border `1px solid #BBF7D0`, text `#15803D`.
  - **Pending Split:** Background `#EFF6FF`, border `1px solid #BFDBFE`, text `#1D4ED8`.
  - **Overdue:** Background `#FEF2F2`, border `1px solid #FECACA`, text `#B91C1C`.

### Lists & Split Breakdown Rows
- **List Item:** Flex row layout, padding 14px 16px, alternating subtle backgrounds `#FFFFFF` and `#F8FAFC` on hover. Separator line 1px solid `#F1F5F9`.
- **Participant Split Pill:** Avatar circle (32px), label text in `label-lg`, and right-aligned amount with dedicated positive/negative color coding.