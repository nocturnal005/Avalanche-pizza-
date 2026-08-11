---
name: Avalanche Elite
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#393939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#201f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353534'
  on-surface: '#e5e2e1'
  on-surface-variant: '#e6beb2'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#ad897e'
  outline-variant: '#5c4037'
  surface-tint: '#ffb59e'
  primary: '#ffb59e'
  on-primary: '#5e1700'
  primary-container: '#ff571a'
  on-primary-container: '#521300'
  inverse-primary: '#ae3200'
  secondary: '#ffdf9e'
  on-secondary: '#3f2e00'
  secondary-container: '#fabd00'
  on-secondary-container: '#6a4e00'
  tertiary: '#ffb4a8'
  on-tertiary: '#690000'
  tertiary-container: '#fb5945'
  on-tertiary-container: '#5c0000'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffdbd0'
  primary-fixed-dim: '#ffb59e'
  on-primary-fixed: '#3a0b00'
  on-primary-fixed-variant: '#852400'
  secondary-fixed: '#ffdf9e'
  secondary-fixed-dim: '#fabd00'
  on-secondary-fixed: '#261a00'
  on-secondary-fixed-variant: '#5b4300'
  tertiary-fixed: '#ffdad4'
  tertiary-fixed-dim: '#ffb4a8'
  on-tertiary-fixed: '#410000'
  on-tertiary-fixed-variant: '#920703'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353534'
typography:
  display-lg:
    fontFamily: Metrophobic
    fontSize: 48px
    fontWeight: '400'
    lineHeight: '1.1'
    letterSpacing: 0.15em
  headline-lg:
    fontFamily: Metrophobic
    fontSize: 32px
    fontWeight: '400'
    lineHeight: '1.2'
    letterSpacing: 0.1em
  headline-lg-mobile:
    fontFamily: Metrophobic
    fontSize: 24px
    fontWeight: '400'
    lineHeight: '1.2'
    letterSpacing: 0.08em
  body-lg:
    fontFamily: Manrope
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: 0.02em
  body-md:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: 0.01em
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1'
    letterSpacing: 0.2em
spacing:
  unit: 8px
  container-max: 1280px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 64px
---

## Brand & Style

This design system is built upon a foundation of power, rebirth, and high-end culinary excellence. It draws inspiration from the phoenix—a symbol of rising above and intense heat—translated into a digital interface that feels premium, authoritative, and cinematic.

The design style is **Minimalist with a High-Contrast/Bold edge**. By utilizing a "Dark Mode First" philosophy, we allow the vibrant, fiery gradients of the brand to act as the primary light source within the UI. Large amounts of negative space (black) create a luxury gallery feel, while wide-spaced typography communicates a sophisticated, methodical approach to the craft. The visual mood is serious and professional, catering to an audience that values quality over novelty.

## Colors

The palette is anchored in a "Stark Black" environment to maximize the impact of the fiery phoenix hues. 

- **Primary:** A vibrant, high-energy orange-red (#FF4D00) used for key actions and brand accents.
- **Secondary:** A warm, golden yellow (#FFC107) used for highlights, warnings, and secondary accents within gradients.
- **Tertiary:** A deep, burnt crimson (#8B0000) used for subtle backgrounds or depth in gradients.
- **Neutral:** A range of rich blacks and deep charcoals. The true black (#000000) is reserved for the primary background, while #121212 and #1E1E1E are used for elevated containers.

Gradients are a core component of this system, specifically linear or radial sweeps from Primary to Secondary to mimic the glow of a wood-fired oven and the phoenix icon.

## Typography

The typography mirrors the logo's clean, wide-spaced sans-serif aesthetic. 

- **Headlines:** We use **Metrophobic** for its geometric, architectural quality. It should always be used with increased letter-spacing (tracking) to maintain the "Elite" brand voice.
- **Body:** **Manrope** provides a modern, highly legible contrast for descriptions, menus, and long-form content, maintaining the professional tone.
- **Labels:** **JetBrains Mono** is introduced for technical details (e.g., temperatures, prices, preparation times) to add a precise, "engineered" feel to the culinary process.

All headlines should be treated with intentional breathing room. Avoid tight tracking at all costs.

## Layout & Spacing

The layout follows a **Fluid Grid** model with significant horizontal margins to enforce the minimalist aesthetic. 

- **Desktop:** A 12-column grid with wide 64px margins. Content is often centered or offset to create an asymmetrical, high-end editorial feel.
- **Mobile:** A 4-column grid with 16px margins. 
- **Rhythm:** An 8px linear scale is used for all internal padding and margins. 

The philosophy here is "Density is the enemy of Luxury." Use generous vertical padding (64px+) between major sections to allow the brand's fiery imagery and typography to stand out against the black background.

## Elevation & Depth

In a dark, high-contrast system, depth is created through **Tonal Layers** and **Subtle Glows** rather than traditional shadows.

1.  **Surfaces:** The base layer is #000000. Interactive cards use #121212.
2.  **Glows:** Instead of drop shadows, high-importance elements (like a primary "Order" card) may use a very faint, blurred outer glow in the Primary color (opacity 10-15%) to suggest heat and energy.
3.  **Outlines:** Use low-contrast, thin (1px) borders in #2A2A2A to define boundaries without breaking the minimalist flow. 
4.  **Overlays:** Use 60% opacity black overlays for background images to ensure typography remains the focal point.

## Shapes

To maintain the "Powerful" and "Professional" persona, the design system utilizes **Sharp (0px)** roundedness. 

The phoenix icon features sharp, feathered wings; the UI reflects this through crisp 90-degree corners on all buttons, input fields, and containers. This angularity communicates precision and a modern, high-fashion aesthetic. 
*Note: In rare cases for mobile accessibility, a 2px "micro-radius" can be applied to ensure touch targets don't feel visually painful, but the intent remains sharp.*

## Components

### Buttons
- **Primary:** Sharp corners, solid Primary color background, white or black text (depending on contrast), uppercase typography with wide tracking.
- **Secondary:** Ghost style with a 1px Primary color border and wide-spaced text.

### Cards
- Background: #121212 or #1E1E1E.
- Border: None, or 1px stroke of #2A2A2A.
- Content: Images should occupy the full width of the card, often bleeding to the edges.

### Input Fields
- Underline-only or 4-sided 1px border (#2A2A2A). 
- Focus state: Border color changes to Primary with a subtle glow.

### Chips/Tags
- Used for dietary info or "Elite" statuses. 
- Rectangular with label-caps typography. Dark background with Primary color text.

### Navigation
- Minimalist top bar. Links are Metrophobic, uppercase, and have high tracking. Active states are indicated by a thin Primary color line *above* the text.