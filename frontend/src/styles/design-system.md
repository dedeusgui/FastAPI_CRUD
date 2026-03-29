# Avel Frontend Design System

## Visual direction
- Simple, premium, restrained.
- Apple-adjacent in discipline, not imitation.
- One primary accent color, neutral surfaces, low-noise depth.

## Tokens
- Colors live in `tokens.css`.
- Use neutral canvas and surface colors first.
- Reserve accent blue for actions, focus, and active states.
- Keep success, warning, and danger only for semantic feedback.

## Layout
- Default content container: `1240px`.
- App shell container: `1480px`.
- Section spacing should prefer `96 / 64 / 48 / 32 / 24 / 16`.
- Large blocks should breathe before adding more cards or dividers.

## Typography
- Manrope is the current system font.
- Headlines should be short and direct.
- Supporting text should explain one idea, not stack multiple promises.
- Prefer strong hierarchy over decorative labels.

## Surfaces
- Use solid cards with subtle borders and light shadows.
- Avoid heavy blur and excessive gradients.
- Keep radii within the shared token scale.

## Components
- Buttons: `primary`, `secondary`, `ghost`, `soft`.
- Feedback: `status-badge` and `form-feedback`.
- Layout primitives: `surface-card`, `page-hero-card`, `header-chip`, `inline-metric-card`.
- Inputs: `field`, `field-input`, `field-textarea`.

## Interaction rules
- Hover states should be subtle.
- Motion should support clarity, not decoration.
- Focus states must always remain visible.

## Rollout rule
- New pages should compose existing tokens and primitives first.
- Add new variants only when the current system cannot express the need cleanly.
