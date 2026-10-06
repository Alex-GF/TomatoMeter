# Architecture · SPHERE, SPACE and TomatoMeter

Interactive architecture diagram with animated tracing, themes, zoom and export. It is in English; the Archify viewer is configured with `meta.locale: en`.

- `architecture.json`: editable Archify source.
- `architecture.html`: the generated diagram. Open it in a browser.
- `architecture.delivery.json`: delivery receipt with the SHA-256 of the specification and the HTML; 9/9 showcase checks, 0 errors, 0 warnings.
- `acceptance.json`: acceptance summary for the diagram.
- `architecture.visual-check.json`, `architecture.visual-check.html` and their `*.png` files: browser evidence for the same HTML, with four screen sizes and no overflow, plus screenshots of both themes.

What it shows:

- The SPACE → TomatoMeter UI event (Socket.IO/WebSockets, `/events`, `/pricings` namespace) is kept separate from the REST read TomatoMeter API → SPACE. Evidence: `../space-api/api/src/main/services/EventService.ts:19–26` and `src/utils/subscriptionSynchronization.ts:38–49`. No HTTP webhook was found in this workflow.
- The SPHERE database is shown explicitly: MongoDB `sphere_lab`, with identities and versions, per `docker/lab/docker-compose.yml:4–7` and `../SPHERE/api/src/main/repositories/mongoose/models/PricingMongoose.ts:5–17`.
- Both event subscriptions are shown. UI ↔ API is HTTP request/response; there is no WebSocket between them.

Perceptual review: done on browser screenshots in light (2048×1320) and dark (1440×900) themes, with no visible crossings or collisions. Authoring corrections in this review: 1.

The shared code evidence is in the [`demo-visuals` README](../README.md#evidence-for-the-technical-workflow).
