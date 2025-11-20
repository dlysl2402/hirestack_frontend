# HireStack Brand Guidelines

**Version:** 1.1
**Last Updated:** November 2025
**Design Philosophy:** Sophisticated Minimalism for Professional Tools

---

## Design Principles

### 1. **Eye Comfort First**
Our users (headhunters, recruiters) spend 16+ hours/day in our interface. Every decision prioritizes:
- Reduced eye strain through warm-tinted grays (not cold blue-grays)
- High contrast for readability without harshness
- Minimized blue light exposure
- Soft, sophisticated tones over clinical whites

### 2. **Minimalist Tool Design**
We are a professional tool, not a consumer app:
- **Monochrome palette** - warm grays only, no bright colors
- **Subtle depth** through opacity and shadow variations
- **Sharp geometry** - minimal border radius (2px)
- **Information density** over decoration

### 3. **Sophisticated Restraint**
We signal quality through what we don't do:
- No playful colors or gradients
- No cartoon-like elements
- No unnecessary ornamentation
- Brutalist simplicity meets warm professionalism

---

## Color Palette: Sophisticated Monochrome

**Philosophy:** Warm-tinted grays only. No colors. Depth through opacity and shadows.

### Foundation Colors

```css
/* Background - Very Light Warm Gray */
--color-background: oklch(98% 0.005 60)
/* HEX: #FAFAF9 (approx) */
/* Usage: Main app background, page backgrounds */
/* Note: 60° hue = subtle warm tint (imperceptible but prevents cold feel) */

/* Card - Pure White */
--color-card: oklch(100% 0 0)
/* HEX: #FFFFFF */
/* Usage: Cards, modals, elevated surfaces */
/* Note: True white for maximum elevation contrast */

/* Muted - Light Warm Gray */
--color-muted: oklch(92% 0.005 60)
/* HEX: #EEEEEC (approx) */
/* Usage: Subtle backgrounds, disabled states, secondary surfaces */

/* Border - Warm Medium-Light Gray */
--color-border: oklch(88% 0.005 60)
/* HEX: #E1E1DE (approx) */
/* Usage: Borders, dividers, separators */

/* Input - Slightly Darker Than Muted */
--color-input: oklch(94% 0.005 60)
/* HEX: #F2F2F0 (approx) */
/* Usage: Input fields, form controls */
```

### Text Colors

```css
/* Foreground - Very Dark Charcoal */
--color-foreground: oklch(15% 0.01 240)
/* HEX: #1A1A1D (approx) */
/* Usage: Headings, body text, primary content */
/* Contrast Ratio: 14:1+ (WCAG AAA) */

/* Muted Foreground - Medium Warm Gray */
--color-muted-foreground: oklch(52% 0.005 60)
/* HEX: #767672 (approx) */
/* Usage: Secondary text, labels, descriptions, metadata */
/* Contrast Ratio: 4.5:1+ (WCAG AA) */
```

### Action Colors (Still Monochrome)

```css
/* Primary - Deep Slate Gray */
--color-primary: oklch(28% 0.015 240)
/* HEX: #2E2E35 (approx) */
/* Usage: Primary buttons, important actions, links */
/* Note: Very dark gray, not black. Subtle blue undertone for digital feel */

--color-primary-foreground: oklch(100% 0 0)
/* HEX: #FFFFFF */
/* Usage: White text on dark buttons */

/* Secondary - Same as Muted */
--color-secondary: oklch(92% 0.005 60)
/* Light warm gray for secondary buttons */

--color-secondary-foreground: oklch(15% 0.01 240)
/* Dark text on light buttons */

/* Accent - Same as Primary (No Separate Color) */
--color-accent: oklch(28% 0.015 240)
/* Same deep slate gray */

--color-accent-foreground: oklch(100% 0 0)
/* White text */
```

### Status Colors (Monochrome Variants)

```css
/* Destructive - Darker Gray (Not Red) */
--color-destructive: oklch(22% 0.015 240)
/* HEX: #242428 (approx) */
/* Usage: Delete actions, critical errors */
/* Note: Even darker than primary for visual weight */

--color-destructive-foreground: oklch(100% 0 0)
/* White text */

/* Ring (Focus States) - Same as Primary */
--color-ring: oklch(28% 0.015 240)
/* Dark slate focus rings */
```

### Border Radius

```css
--radius: 0.125rem /* 2px - Sharp, minimal, brutalist */
```

**Note on Status Colors:**
- ✅ **Success**: Use primary gray + checkmark icon
- ⚠️ **Warning**: Use muted background + warning icon
- ❌ **Error**: Use destructive (darker gray) + X icon
- **Icons carry meaning, not colors**

---

## Typography

### Font Stack
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto',
             'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans',
             'Helvetica Neue', sans-serif;
```

### Font Sizes
- **Headings H1**: 30px (1.875rem) - Page titles
- **Headings H2**: 24px (1.5rem) - Section titles
- **Headings H3**: 20px (1.25rem) - Card titles
- **Body**: 15px (0.9375rem) - Main content (NOT 14px for reduced strain)
- **Small**: 13px (0.8125rem) - Captions, labels
- **Tiny**: 12px (0.75rem) - Metadata, timestamps

### Font Weights
- **Bold**: 600-700 - Headings, emphasis
- **Medium**: 500 - Subheadings, buttons
- **Normal**: 450 - Body text (NOT 400 for easier reading)
- **Light**: 400 - Secondary text

### Line Heights
- **Headings**: 1.2 - Tight for impact
- **Body**: 1.65 - Comfortable for extended reading
- **UI Elements**: 1.5 - Balanced for components

---

## Component Patterns

### Buttons

**Primary Button (AI Actions)**
- Background: `--primary` (Purple)
- Text: `--primary-foreground` (White)
- Border: None
- Shadow: `0 1px 3px rgba(124, 77, 255, 0.12)`
- Hover: `hsl(260, 60%, 50%)` (Slightly darker)
- Usage: Import LinkedIn, Create, Submit

**Secondary Button**
- Background: `--secondary` (Warm beige)
- Text: `--secondary-foreground` (Dark charcoal)
- Border: `1px solid --border`
- Shadow: `0 1px 2px rgba(0, 0, 0, 0.05)`
- Hover: `hsl(40, 18%, 90%)`
- Usage: Cancel, Back, Alternative actions

**Destructive Button**
- Background: `--destructive` (Muted red)
- Text: `--destructive-foreground` (White)
- Border: None
- Shadow: `0 1px 3px rgba(232, 76, 61, 0.12)`
- Hover: `hsl(0, 70%, 50%)`
- Usage: Delete, Remove

**Ghost Button**
- Background: Transparent
- Text: `--foreground`
- Border: None
- Hover: `--accent` (Warm beige)
- Usage: Icon buttons, inline actions

### Cards

**Default Card**
- Background: `--card` (Lighter cream)
- Border: `1px solid --border`
- Border Radius: `--radius` (8px)
- Shadow: `0 1px 3px rgba(0, 0, 0, 0.04)`
- Padding: 24px (1.5rem)

**AI-Generated Content Card**
- Background: Linear gradient overlay
  ```css
  background: linear-gradient(135deg,
    hsl(260, 60%, 98%) 0%,
    hsl(40, 15%, 99%) 100%
  );
  ```
- Border: `1px solid hsl(260, 30%, 90%)`
- Purple tint signals AI origin

### Badges

**Default Badge**
- Background: `--muted` (Warm beige)
- Text: `--muted-foreground` (Warm gray)
- Padding: 4px 10px
- Font Size: 12px
- Font Weight: 600

**AI Badge (Purple)**
- Background: `hsl(260, 60%, 95%)`
- Text: `hsl(260, 60%, 40%)`
- Icon: Sparkles or AI icon

**Status Badges**
- **Success**: Green background with dark green text
- **Warning**: Amber background with dark amber text
- **Error**: Red background with white text

### Forms

**Input Fields**
- Background: `--input` (Slightly darker beige)
- Border: `1px solid --border`
- Border Radius: `--radius`
- Focus: `2px solid --ring` (Purple)
- Padding: 8px 12px
- Font Size: 15px (NOT 14px)

**Labels**
- Color: `--foreground` (Dark charcoal)
- Font Size: 14px
- Font Weight: 500
- Margin Bottom: 6px

### Tables

**Header Row**
- Background: `--muted` (Warm beige)
- Text: `--foreground` (Dark charcoal)
- Font Weight: 600
- Font Size: 13px
- Text Transform: Uppercase
- Letter Spacing: 0.05em

**Body Rows**
- Background: `--card` (Lighter cream)
- Border Bottom: `1px solid --border`
- Hover: `hsl(40, 20%, 96%)`

**Striped Variant**
- Alternate rows: `--background` and `--card`

---

## AI Visual Indicators

### AI-Generated Content
- **Purple gradient overlay** on cards containing AI-generated text
- **Purple left border** (4px) on AI suggestions
- **Sparkles icon** in purple next to AI-generated fields

### AI Actions/Buttons
- **Purple primary color** for all AI-powered actions
- **Gradient hover state**: Purple → Blue-Purple
  ```css
  background: linear-gradient(135deg,
    hsl(260, 60%, 55%) 0%,
    hsl(250, 60%, 60%) 100%
  );
  ```

### Conversational AI Features
- **Green accent** for chat interfaces
- **Green badges** for AI assistant responses
- **Green → Purple gradient** for loading states
  ```css
  background: linear-gradient(90deg,
    hsl(150, 50%, 50%) 0%,
    hsl(260, 60%, 55%) 100%
  );
  ```

### AI Loading States
- **Purple spinner** with opacity animation
- **Gradient shimmer** for skeleton screens
  ```css
  background: linear-gradient(90deg,
    hsl(40, 18%, 94%) 0%,
    hsl(260, 60%, 98%) 50%,
    hsl(40, 18%, 94%) 100%
  );
  ```

---

## Dark Mode (Future)

When implementing dark mode:

```css
[data-theme="dark"] {
  --background: 40 15% 12%;        /* Warm dark charcoal */
  --card: 40 12% 15%;              /* Slightly lighter */
  --foreground: 40 15% 92%;        /* Warm off-white */
  --muted: 40 10% 20%;             /* Dark warm gray */
  --muted-foreground: 40 10% 65%;  /* Medium warm gray */
  --border: 40 10% 25%;            /* Dark borders */
  --primary: 260 70% 65%;          /* Brighter purple for dark */
  --accent: 150 50% 55%;           /* Brighter green */
}
```

**Dark Mode Principles:**
- Warm undertones (40° hue) throughout
- Lower brightness (12-20% lightness for backgrounds)
- Higher saturation for accents (70% vs 60%)
- Maintain same purple/green AI signals

---

## Accessibility Standards

### Contrast Ratios (WCAG 2.1)

**Body Text (15px)**
- `--foreground` on `--background`: **12.5:1** (AAA ✓)
- `--muted-foreground` on `--background`: **4.8:1** (AA+ ✓)

**UI Components**
- `--primary` on white: **4.6:1** (AA ✓)
- `--accent` on white: **3.8:1** (AA for large text ✓)
- `--destructive` on white: **4.9:1** (AA ✓)

**Minimum Requirements**
- Body text: 7:1 (AAA)
- UI components: 4.5:1 (AA)
- Large text (18px+): 3:1 (AA)

### Colorblind Considerations
- Purple and green are distinguishable for most colorblind types
- Never rely on color alone (use icons + text)
- Test with Coblis or Stark plugin

### Focus Indicators
- All interactive elements have 2px purple ring on focus
- High contrast (4.5:1) against all backgrounds
- Never remove focus indicators

---

## Usage Guidelines

### Do's ✅
- Use purple for all AI-powered features
- Use warm neutrals for all backgrounds
- Maintain high contrast for text (12:1+)
- Use green for conversational/chat AI
- Add subtle gradients to AI-generated content
- Use 15px minimum for body text

### Don'ts ❌
- Never use pure white (#FFFFFF) for backgrounds
- Never use pure black (#000000) for text
- Never use cool grays (avoid blue undertones)
- Never use primary purple for non-AI features
- Never use text smaller than 12px
- Never reduce contrast below WCAG AA

### When to Use Each Color

**Purple (Primary)**
- Import from LinkedIn button
- AI-powered search
- Smart filters
- Generate resume
- AI suggestions/recommendations

**Green (Accent)**
- AI chat/assistant
- Conversational interfaces
- AI feedback responses
- "Ask AI" buttons

**Warm Neutrals**
- All backgrounds
- Borders and dividers
- Disabled states
- Secondary buttons

**Status Colors**
- Success: Import completed, save successful
- Warning: Validation errors, important notices
- Destructive: Delete actions, critical errors

---

## Implementation Checklist

- [ ] Update `src/index.css` with new CSS variables
- [ ] Test all existing components with new palette
- [ ] Verify contrast ratios in DevTools
- [ ] Add purple AI badges to import features
- [ ] Design AI loading states with gradients
- [ ] Update button hover states
- [ ] Test with colorblind simulators
- [ ] Document component-specific usage
- [ ] Create dark mode variant
- [ ] Export Figma/design system assets

---

## Resources

**Design Tools**
- Color Contrast Checker: https://webaim.org/resources/contrastchecker/
- Colorblind Simulator: https://www.color-blindness.com/coblis-color-blindness-simulator/
- Palette Generator: https://coolors.co/

**AI Design Inspiration**
- Midjourney UI
- ChatGPT interface
- Notion AI features
- Linear's purple accents

**Accessibility**
- WCAG 2.1 Guidelines: https://www.w3.org/WAI/WCAG21/quickref/
- Accessible color palettes: https://accessible-colors.com/

---

**Maintained by:** Design Team
**Questions?** Refer to this guide first, then discuss in #design channel
