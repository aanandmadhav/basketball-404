# Reusable implementation prompt

Build a custom 404 page for my existing website using the following interaction model:

- Present 5–7 important destinations as realistic basketballs with centered text labels.
- On page load, let the balls fall under gravity, bounce on the floor, and collide with each other.
- Let pointer users pick up, drag, and flick any ball from anywhere on the stage.
- Place a basketball backboard and hoop near the upper-middle of the stage.
- Navigate to a ball’s URL only after the user has deliberately grabbed and released it and its center crosses downward through the inner rim area.
- Disable scoring during the initial fall animation so accidental navigation is impossible.
- Split the hoop artwork into depth layers: the backboard remains behind the balls while only the rim and front net appear above them. The scored ball should visually pass through the hoop.
- Keep dragged balls above the heading and other interface text.
- Do not navigate on ordinary pointer click or release.
- For keyboard input and `prefers-reduced-motion: reduce`, disable physics and show the same balls as simple clickable navigation buttons.
- Add a visible reset action and clear instructions.
- Make the layout responsive and touch-friendly.

Technical constraints:

- Use lightweight custom `requestAnimationFrame` physics instead of a large physics dependency unless my existing stack already includes one.
- Scope the component, styles, and visual assets to the 404 route so they do not add weight to normal pages.
- Preserve proper HTTP 404 behavior.
- Use semantic buttons, useful accessible names, visible focus states, and no essential motion-only information.
- Match my existing typography, colors, spacing, and visual language. Do not introduce a disconnected design system.

My destinations are:

1. [Label] — [URL]
2. [Label] — [URL]
3. [Label] — [URL]
4. [Label] — [URL]
5. [Label] — [URL]
6. [Label] — [URL]

Before implementation, inspect my site’s existing design tokens and routing conventions. After implementation, test desktop, mobile, keyboard navigation, reduced motion, initial-drop safety, rim-crossing accuracy, and the production build.
