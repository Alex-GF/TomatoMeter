# Architecture · Black-box view

Same story as [`../architecture/`](../architecture/) with SPHERE + SPACE collapsed into one box: a stakeholder edits the pricing in an intuitive UI and TomatoMeter adapts without anyone touching it. English; Archify `meta.locale: en`.

- `architecture.json`: editable Archify source. `architecture.html`: the diagram.
- `architecture.visual-check.*`: browser evidence (9/9 showcase checks, no overflow).
- Rebuild: `archify deliver architecture architecture.json architecture.html --quality showcase`, then `python3 ../add-user-icon.py architecture.html` (the stakeholder user icon is post-processed because Archify has no actor type).
