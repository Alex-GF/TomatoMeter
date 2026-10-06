# Pricing becomes experience · V2

Independent English animation project. Original project, architecture, player and video are unchanged. An additional copy of the current v1 source and MP4 is saved in `../pricing-v1-snapshot`. `preserved-v1.json` records the original SHA-256 values. Its paths predate the reorganisation: `pricing-video/` is now `../pricing-workflow/`, and `architecture.*` lives in `../architecture/`.

42 seconds, 1280×720, 30 fps, no audio. Three stylized application scenes:

1. A stakeholder changes Basic's daily quota from 3 to 5 and includes Daily summary in SPHERE, then publishes.
2. SPACE detects the public version, validates the pricing, migrates existing bindings under all_last and retains consumption and billing dates.
3. TomatoMeter refreshes contract, pricing and token. UI and business logic allow another session. Usage changes from 3/5 to 4/5 after starting the timer.

Baseline values and feature names come from `../../../api/resources/TomatoMeter.yml`. The new quota and summary entitlement are illustrative changes, not changes to the actual lab or its database. The screens are designed explainers, not recordings of the live applications. Real lab polling is every minute; wait time is compressed. Summary bars are illustration.

Edit `index.html` for visuals, copy or the GSAP timeline. Edit `design.md` for the creative brief. `player.html` only plays the generated video.

From this directory:

```sh
pnpx hyperframes@0.8.112 check . --snapshots
```

After the check passes:

```sh
pnpx hyperframes@0.8.112 render . --output ./pricing-story-v2.mp4 --fps 30 --quality delivery --workers 2
```

To update the player poster after rendering:

```sh
ffmpeg -ss 39 -i pricing-story-v2.mp4 -frames:v 1 -y poster.png
```

Brand palette and typography preserve v1. GSAP is bundled locally. HyperFrames can fetch its own runtime dependencies when invoked. Verification receipts are local and are refreshed when the project is regenerated.
