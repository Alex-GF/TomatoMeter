# Change the pricing, not the code

Animation for non-technical audiences. It uses a **generic SaaS** ("Your SaaS") so the demo is not tied to one specific application. 48 s, 1280×720, 30 fps, no audio, in English. Standalone project: it does not change the other animations.

The story follows a fictional user, Ana, on the Basic plan:

1. **0–6 s** · Every paid app has a pricing page… and behind it, every plan is wired by hand (`if (plan === …)` code snippets).
2. **6–12 s** · The idea: the pricing as a single readable document that drives the app.
3. **12–20 s** · The three pieces: SPHERE *publishes*, SPACE *enforces*, your SaaS *adapts*.
4. **20–28 s** · Ana (3/3 projects this month) tries to turn on Dark mode; the app asks SPACE, and the answer is "not on Basic".
5. **28–37 s** · The team marks Dark mode as included in Basic in SPHERE and publishes; the change travels SPHERE → SPACE (contracts migrated, usage kept) → your SaaS.
6. **37–44 s** · Ana's app unlocks with no download or new release; when Ana turns it on, **the whole video switches to dark mode**.
7. **44–48 s** · Closing line: *Change the pricing. Not the code.*

The app, its features (Email alerts, Dark mode, Weekly reports, Advanced analytics) and the project limit are fictional. The structure (three plans at $0/$3.99/$9.99, a 3/10/15 limit, features included per plan) is inspired by `../../../api/resources/TomatoMeter.yml`, and the Dark mode unlock mirrors TomatoMeter's real feature gating. The screens are stylized, the sync wait is compressed, and the code snippets in scene 1 are caricatures.

- `index.html`: HyperFrames composition and GSAP timeline. Edit visuals, copy and timing here.
- `player.html`: MP4 player.
- `pricing-for-everyone.mp4`, `poster.png` (frame at 46.5 s), `check.json`, `snapshots/`, `render.log`.

## Regenerate

From this directory:

```sh
npx --yes hyperframes@0.8.112 check . --snapshots
npx --yes hyperframes@0.8.112 render . --output ./pricing-for-everyone.mp4 --fps 30 --quality delivery --workers 2
ffmpeg -ss 46.5 -i pricing-for-everyone.mp4 -frames:v 1 -y poster.png
```

Latest check: no lint, runtime, layout or motion findings; 99/99 text checks pass WCAG AA contrast. MP4: H.264, 1280×720, 30 fps, 1440 frames.
