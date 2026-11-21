---
name: dev-ui-ux
description: This skill should be used before and after building new UI (a new page, screen, component or visibly changed layout) — to show the user a mockup first and to run a cheap browser smoke check afterwards — and when the user asks about UI/UX best practices, frontend UI implementation, interactive affordances, micro-interactions, motion/animation guidance, accessibility for interactive elements, or improving interactive feedback (including hover and focus states). Provide practical, implementation-focused guidance for visible feedback, performance, and accessibility.
version: 1.3.1
---

# UI/UX Best Practices — Hover & Clickable Feedback

## Extension counterpart

Before doing anything else, check the available skills for one named `dev-ui-ux` in a plugin called `agency-<ext_name>` (for example `agency-extension:dev-ui-ux`). If one exists, load it now and follow it together with this skill; where the two differ, the counterpart wins. With several, the last one wins; the `context-management` skill gives the order. If none exists, carry on with this skill's defaults.

## Building new UI

These two steps apply whenever you build new UI: a new page, screen, dialog or component, or a visibly changed layout. They don't apply to a change with no visible effect, or to a fix that leaves the layout as it was (a typo, a colour value).

### Before: show a mockup

Before writing the UI code, show the user a mockup and wait for their go-ahead or changes.

- Make it cheap: one static HTML file (or an Artifact, or an image), with the project's existing styles and real-looking sample data where you can. It shows layout, content and the main states (empty, loading, error) that matter; it is not the implementation.
- Show it the way this environment allows: an Artifact, a file sent to the user, or a screenshot. If none of these is possible, describe the layout in a short text sketch and say why there is no visual mockup.
- Show only the controls and states the request needs, and only edit paths that exist today (see `dev-guidelines`, "Stay inside the current flow"). Never add a control for something the product cannot do yet.
- Skip the mockup only when the user explicitly asks to skip it (for example "no mockup", "just build it"). That skip covers the request it was given for, not later ones.

### After: a cheap smoke check in a real browser

After building the UI, look at it once in a real browser to catch visible bugs. This is not the `test:e2e` suite and not a click-through of every flow; keep it to a few seconds of tool time.

1. Start the app (or its preview with sample data) and run one short Playwright script that, for each new or changed page only:
   - loads it at a phone width (390 px) and a desktop width (1280 px), with `deviceScaleFactor: 1`;
   - records console errors and failed requests;
   - checks for horizontal overflow (`document.documentElement.scrollWidth > innerWidth`);
   - saves one screenshot per width.
2. Look at the screenshots once, for broken layout, overlapping or cut-off text, missing styles or images, and unreadable contrast.
3. If you find a bug, fix it immediately, in the same piece of work, then re-run the script for that page only. Don't report the UI as done while a bug you found is still open.
4. Keep the screenshots and the script out of the commit.

How this fits the other skills: the smoke check finds bugs, it does not verify the change. Verification is still the `test:e2e` run that `token-saver` and `dev-init-project` (section 5) define, and the spec for the new UI is still written there. Their rule "do not open a browser to verify" is about verification and doesn't forbid this check; for the smoke check itself, this skill wins.

## Hover and clickable feedback

Purpose: Ensure consistent, accessible, and pleasant micro-interactions by requiring visible hover feedback for clickable elements and recommending smooth, respectful animations.

When to use:
- This skill should be used when the user asks about UI feedback, hover states, clickable affordances, interactive micro-interactions, or requests guidance on animation, motion, or accessibility for interactive components.

Guiding rule
- Every clickable element must give visual feedback when hovered. Smoothly animated feedback is preferred, but always respect user motion preferences and accessibility needs.

Recommendations
- Provide a clear, perceivable hover state for buttons, links, controls, cards, and other interactive elements.
- Prefer GPU-accelerated properties (transform, opacity) for animation to preserve performance and avoid layout thrashing.
- Use short durations (100–200ms), with ~150ms as a practical default. Use gentle easing (e.g., cubic-bezier(.2,.9,.2,1)).
- Respect `prefers-reduced-motion` and disable or simplify animations for users who opt out.
- Ensure hover feedback is not the sole cue; include focus-visible and active/pressed states for keyboard and touch users.

Practical examples

Example: primary button (accessible, animated)

```css
.button {
  transition: background-color 160ms cubic-bezier(.2,.9,.2,1),
              transform 160ms cubic-bezier(.2,.9,.2,1),
              box-shadow 160ms ease;
  will-change: transform, box-shadow;
}

.button:hover,
.button:focus-visible {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0,0,0,0.08);
  background-color: #1e40af; /* stronger contrast on hover */
}

/* Respect user preference for reduced motion */
@media (prefers-reduced-motion: reduce) {
  .button {
    transition: none;
    transform: none;
  }
}
```

Links
- Provide a visible underline or color transition on hover and ensure the contrast meets accessibility guidelines. Example: `a { text-decoration-skip-ink: auto; transition: color 140ms ease; }`.

Cards & interactive regions
- Use a subtle lift (translateY(-2px) + soft shadow) or a highlight outline on hover to show interactivity.
- For touch-first contexts, provide an immediate press/active state (background tint or ripple) — do not rely on hover.

Accessibility & keyboard
- Implement `:focus-visible` styles that mirror hover styles so keyboard users receive the same feedback.
- Do not use color alone to indicate interactivity; combine color with movement, underline, shadow, or an icon state change.

Performance and best practices
- Animate transform and opacity where possible; avoid animating layout properties (width/height/top/left) in critical paths.
- Limit heavy box-shadows and large blurs; use subtle shadows for hover affordance.

Testing checklist
- Verify hover, focus, and active states for all interactive elements.
- Test with keyboard-only navigation and screen reader on/off to confirm affordance and semantics.
- Test with `prefers-reduced-motion: reduce` enabled to ensure no disruptive motion.
- Validate color contrast for hover states.

Common pitfalls
- Relying solely on color changes (fails color-blind users).
- Long, slow transitions ( > 300ms ) that feel laggy.
- Animating properties that force layout and cause jank.

Examples of prompts to use this skill
- "Make the hover state for primary buttons more visible and accessible."
- "Add hover feedback to all clickable cards and ensure keyboard focus matches hover styles."
- "Suggest an accessible animation for link hover that respects reduced-motion."

References
- Prefer short, actionable examples and include code snippets where helpful.
