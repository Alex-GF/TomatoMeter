# Black-box deck · animated slides for the demo video

A cover plus four click-animated PowerPoint slides (16:9) for narrating the demo. All text is in English; the narration script is in each slide's speaker notes, with `[Click n]` cues.

| Slide | Clicks | What appears |
| --- | --- | --- |
| 1 · Cover | 0 | *SPHERE x SPACE*. |
| 2 · Black box | 7 | John → black box with a pricing editor → TomatoMeter UI. John raises Basic from 3 to 5 pomodoros/day and includes the daily summary, then publishes; the TomatoMeter UI switches from "Daily limit reached" to "Start focus session" and unlocks the summary. |
| 3 · Black box, alternative order | 7 | Same as slide 2, but John appears first, then TomatoMeter, and the black box appears last, between them. Pick one of slides 2 and 3. |
| 4 · Following the change | 8 | SPHERE holds the pricing editor and TomatoMeter its real UI. John's edit is published as v1.2, a `v1.2 · YAML` token travels through the public API into SPACE, contracts move to v1.2, and `event` tokens ride the WebSocket line to the backend (new limits) and the UI (which switches to the new plan). |
| 5 · Inside the black box | 8 | The black box fades out to reveal empty SPHERE / SPACE / TomatoMeter (frontend + backend). Then steps 1–7 of `bridge-workflow.svg` appear one per click: edit, publish, poll, import, contract migration, event, WebSocket update. |

- `blackbox-deck.pptx`: the animated deck (fade entrances, arrows wiping in their own direction, fade exits, motion paths on slide 3, fade transition).
- `blackbox-deck.storyboard.pptx`: the same content with one static slide per click, as a backup or for exporting frames.
- `build.cjs`: the generator. Each shape is declared with its click (`{ in: n }` / `{ out: n }`); the animation timing XML is injected after `pptxgenjs` writes the file. Edits made directly in PowerPoint are lost on rebuild — carry them into `build.cjs`.

Rebuild (needs `pptxgenjs jszip react react-dom react-icons sharp`):

```bash
node build.cjs
```
