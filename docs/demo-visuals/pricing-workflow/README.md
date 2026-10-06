# Pricing workflow · v1

32-second clip, 1280×720, 30 fps, no audio, in English. It sketches the successful SPHERE → SPACE → TomatoMeter workflow, with polling time compressed. It is not a recording of the applications.

- `index.html`: HyperFrames composition and GSAP timeline. Edit the video here.
- `index.motion.json`: motion specification.
- `pricing-workflow.mp4` and `poster.png`: the output.
- `player.html`: the player, which links to the architecture diagram.
- `check.json`: composition check, with no lint, runtime, layout, motion or contrast findings.
- `receipt.json`: MP4 receipt.
- `snapshots/`, `rendered-20s.png`, `rendered-29s.png`, `render.log`: render evidence.

MP4 verified with ffprobe: H.264, 1280×720, 30 fps, 960 frames, 32 s, no audio. Perceptual review covered the detection frame (8.9 s), the final-result frame (30.2 s), and the MP4 frames decoded at 20 s and 29 s.

## Regenerate

From this directory:

```sh
npx --yes hyperframes@0.8.112 check . --snapshots
npx --yes hyperframes@0.8.112 render . --output ./pricing-workflow.mp4 --fps 30 --quality delivery --workers 2
ffmpeg -ss 29 -i pricing-workflow.mp4 -frames:v 1 -y poster.png
```

Rendering overwrites the MP4. A backup of the approved version is kept in `../pricing-v1-snapshot/`.
