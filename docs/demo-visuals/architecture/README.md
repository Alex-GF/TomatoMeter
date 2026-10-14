# Architecture · SPHERE, SPACE and TomatoMeter

Interactive architecture diagram with animated tracing, themes, zoom and export. It is in English; the Archify viewer is configured with `meta.locale: en`.

- `architecture.json`: editable Archify source.
- `architecture.html`: the generated diagram. Open it in a browser.
- `architecture.delivery.json` and `acceptance.json`: receipts from the previous version of the diagram (before removing the databases and changing the stakeholder icon); regenerate with `archify deliver` if you need up-to-date ones.
- `architecture.visual-check.json`, `architecture.visual-check.html` and their `*.png` files: browser evidence for the same HTML, with four screen sizes and no overflow, plus screenshots of both themes.

What it shows:

- The SPACE → TomatoMeter UI event (Socket.IO/WebSockets, `/events`, `/pricings` namespace) is kept separate from the REST read TomatoMeter API → SPACE. Evidence: `../space-api/api/src/main/services/EventService.ts:19–26` and `src/utils/subscriptionSynchronization.ts:38–49`. No HTTP webhook was found in this workflow.
- Databases are intentionally not shown: the audience does not need to know what the services persist to.
- The stakeholder is drawn as a user icon. Archify has no actor type, so `../add-user-icon.py` post-processes the delivered HTML; rerun it after every `archify deliver`.
- This is the *opened* view of the black-box diagram in [`../architecture-blackbox/`](../architecture-blackbox/).
- Both event subscriptions are shown. UI ↔ API is HTTP request/response; there is no WebSocket between them.

Perceptual review: done on browser screenshots in light (2048×1320) and dark (1440×900) themes, with no visible crossings or collisions. Authoring corrections in this review: 1.

The shared code evidence is in the [`demo-visuals` README](../README.md#evidence-for-the-technical-workflow).
