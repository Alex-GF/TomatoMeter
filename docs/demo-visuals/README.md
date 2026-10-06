# Demo · SPHERE, SPACE and TomatoMeter

Visual material for the demo. Each diagram or video lives in its own folder, together with its editable source, final output, player and verification evidence. All visuals are in English.

| Folder | What it is | Audience | Open |
| --- | --- | --- | --- |
| [`architecture/`](architecture/) | Interactive architecture diagram (Archify) of SPHERE, SPACE and TomatoMeter | Technical | `architecture/architecture.html` |
| [`pricing-workflow/`](pricing-workflow/) | Video v1, 32 s: the SPHERE → SPACE → TomatoMeter workflow | Technical | `pricing-workflow/player.html` |
| [`pricing-story-v2/`](pricing-story-v2/) | Video v2, 42 s: *Pricing becomes experience*, with screens from the three apps | Mixed | `pricing-story-v2/player.html` |
| [`pricing-for-everyone/`](pricing-for-everyone/) | Video, 48 s: *Change the pricing, not the code*, using a generic SaaS | Non-technical | `pricing-for-everyone/player.html` |
| [`pricing-v1-snapshot/`](pricing-v1-snapshot/) | Backup of the v1 source and MP4, identical to `pricing-workflow/` | — | — |

Every video folder (HyperFrames) follows the same convention:

- `index.html`: the composition and its GSAP timeline. Edit the video here.
- `*.mp4` and `poster.png`: the output.
- `player.html`: the player only. Editing it does not change the video.
- `check.json`, `snapshots/`, `render.log` and receipts: verification evidence.
- `README.md`: how to regenerate it.

## Evidence for the technical workflow

Shared by the diagram and video v1. Paths are relative to the TomatoMeter repository root.

| What is shown | Local code |
| --- | --- |
| Linking through `/p/{pricingId}`, `all_last` policy, 1-minute interval | `docker/lab/bootstrap.mjs:81–83` |
| Manifest lookup and public YAML download | `../space-api/api/src/main/services/sphere/SphereClient.ts:61–76` |
| Persistence, cache invalidation and post-apply event | `../space-api/api/src/main/services/sphere/SphereSyncService.ts:198–209` |
| Contract and pricing read with SDK cache invalidation | `api/routes/contract.ts:34–45` |
| Refresh on events, reconnection, focus, network and visibility | `src/utils/subscriptionSynchronization.ts:38–53` |
| Contract, pricing and subscription applied to React | `src/contexts/subscriptionContext/index.tsx:24–38` |
| Billing and compatible usage preserved; fallback and locks | `../space-api/docs/sphere-synchronization.md`, policies and recovery |

The 1-minute interval is specific to the lab; the general SPACE default is five minutes. A remote failure or an incompatible migration can stop the workflow shown from completing. JWTs already issued follow their own renewal and expiry rules; invalidating caches does not revoke them.

The SDKs on both sides connect to SPACE: the UI in `src/App.tsx:19–24` and `../space-react-client/src/main/clients/SpaceClient.ts:24–37`; the API in `api/utils/configurators.ts:22–35` and `../space-node-client/src/main/config/SpaceClient.ts:73–86`.
