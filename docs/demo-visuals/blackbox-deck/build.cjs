// Builds blackbox-deck.pptx: three click-animated slides for the ICSOC 2026 demo video.
//   node build.cjs              -> blackbox-deck.pptx (animated) + blackbox-deck.storyboard.pptx (one slide per click)
//   node build.cjs --frames DIR -> one single-slide .pptx per click into DIR (visual QA)
// Every element is declared with an optional animation spec:
//   { in: n, fx, delay, dur }  appears on click n   (fx: fade | wl | wr | wu | wd  = wipe from left/right/bottom/top)
//   { out: n, outDelay, outDur } fades out on click n
//   { in: n, path: { pts, delay, dur } } also moves along pts (cumulative inch offsets) on click n
const pptxgen = require("pptxgenjs");
const JSZip = require("jszip");
const fs = require("fs");
const path = require("path");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");
const { FaUserTie, FaUser, FaLock } = require("react-icons/fa");

const OUT = __dirname;
const SLIDE_W = 13.333, SLIDE_H = 7.5;
const FONT = "Arial";
const C = {
  ink: "1D1D1F", text: "3A3A3C", muted: "6E6E73", line: "2B2B2B", hair: "E5E5EA",
  sphere: "D9622B", sphereDark: "B84D1C", sphereTint: "FDF1EC", sphereSoft: "FBE0D3", sphereEdge: "E7A383",
  space: "5A4FCF", spaceDark: "4A40B8", spaceTint: "F0EEFD",
  tm: "2F9E6E", tmDark: "237A55", tmTint: "EAF6F0",
  tomato: "B8432F", paper: "FCF9F4", paperEdge: "CFC8BE", locked: "E3DED7",
};

async function icon(Comp, color, size = 256) {
  const svg = ReactDOMServer.renderToStaticMarkup(React.createElement(Comp, { color: "#" + color, size: String(size) }));
  const png = await sharp(Buffer.from(svg)).png().toBuffer();
  return "image/png;base64," + png.toString("base64");
}

// ---------------------------------------------------------------- element context
function makeCtx(pres, slide, slideNo, step, registry) {
  let n = 0;
  const show = (a) => step === null || ((!a || !a.in || a.in <= step) && (!a || !a.out || a.out > step));
  const nm = (label, a) => {
    const name = `s${slideNo}-${++n}-${label}`;
    if (a && registry) registry.push({ slide: slideNo, name, ...a });
    return name;
  };
  return {
    shape(type, o, a, label = "shape") { const name = nm(label, a); if (show(a)) slide.addShape(type, { ...o, objectName: name }); },
    text(t, o, a, label = "text") {
      const name = nm(label, a);
      if (show(a)) slide.addText(t, { fontFace: FONT, margin: 0, isTextBox: true, ...o, objectName: name });
    },
    image(data, o, a, label = "icon") { const name = nm(label, a); if (show(a)) slide.addImage({ data, ...o, objectName: name }); },
    // Axis-aligned line from (x1,y1) to (x2,y2). Arrows and flow segments wipe in from their start;
    // backwards lines put the head at the start instead of flipping, so the wipe direction stays literal.
    line(x1, y1, x2, y2, o, a, label = "line") {
      if (x1 !== x2 && y1 !== y2) throw new Error("diagonal line: " + label);
      const back = x2 < x1 || y2 < y1;
      const dir = x1 !== x2 ? (x2 > x1 ? "wl" : "wr") : (y2 > y1 ? "wd" : "wu");
      const flows = o.arrow !== false || o.flow;
      if (a && a.in && !a.fx) a = { ...a, fx: flows ? dir : "fade" };
      const name = nm(label, a);
      if (!show(a)) return;
      const head = o.arrow === false ? undefined : "triangle";
      slide.addShape(pres.shapes.LINE, {
        x: Math.min(x1, x2), y: Math.min(y1, y2), w: Math.abs(x2 - x1), h: Math.abs(y2 - y1),
        line: { color: o.color || C.line, width: o.width || 1.75, dashType: o.dash ? "dash" : "solid",
          beginArrowType: back ? head : undefined, endArrowType: back ? undefined : head },
        objectName: name,
      });
    },
  };
}

// ---------------------------------------------------------------- cover
function slideCover(pres, ctx) {
  ctx.text("SPHERE x SPACE", { x: 3.98, y: 2.84, w: 5.56, h: 0.91, fontSize: 48, fontFace: "Aharoni", color: "000000", align: "center", valign: "middle" }, null, "title");
}

// ---------------------------------------------------------------- the black box
// order says on which click the black box and TomatoMeter appear (John is always click 1):
//   { box: 2, app: 3 }  John → black box → TomatoMeter
//   { box: 3, app: 2 }  John → TomatoMeter → black box in between
function slideBlackBox(pres, ctx, I, order = { box: 2, app: 3 }) {
  const S = pres.shapes;
  const BOX = order.box, APP = order.app;

  // 1 · John
  const A1 = { in: 1 };
  ctx.image(I.pablo, { x: 0.6, y: 2.95, w: 0.95, h: 0.95 }, A1, "john-icon");
  ctx.text("John", { x: 0.2, y: 4.05, w: 1.75, h: 0.35, fontSize: 18, bold: true, color: C.ink, align: "center" }, A1, "john-name");

  // the black box, whose only visible face is a pricing editor
  const A2 = { in: BOX };
  ctx.line(1.68, 3.45, 2.42, 3.45, {}, { in: BOX, delay: 300 }, "arrow-john-box");
  ctx.shape(S.ROUNDED_RECTANGLE, { x: 2.45, y: 1.55, w: 5.6, h: 4.85, rectRadius: 0.18, fill: { color: C.ink }, line: { color: C.ink } }, A2, "blackbox");
  ctx.text("Our solution", { x: 2.75, y: 1.72, w: 3.5, h: 0.4, fontSize: 18, bold: true, color: "FFFFFF" }, A2, "blackbox-label");
  ctx.text("?", { x: 6.55, y: 2.7, w: 1.35, h: 1.4, fontSize: 80, bold: true, color: "5A5A5E", align: "center", valign: "middle" }, A2, "blackbox-q");
  ctx.text("how it works stays hidden from John", { x: 6.55, y: 4.2, w: 1.35, h: 0.9, fontSize: 11, color: "A1A1A6", align: "center", valign: "top" }, A2, "blackbox-note");

  // pricing editor window
  const ex = 2.75, ey = 2.3, ew = 3.7, eh = 3.8;
  ctx.shape(S.ROUNDED_RECTANGLE, { x: ex, y: ey, w: ew, h: eh, rectRadius: 0.1, fill: { color: "FFFFFF" }, line: { color: "FFFFFF" } }, A2, "editor");
  // title bar: rounded top corners = rounded rect + white strip hiding its lower corners
  ctx.shape(S.ROUNDED_RECTANGLE, { x: ex, y: ey, w: ew, h: 0.54, rectRadius: 0.1, fill: { color: "F2F2F4" }, line: { color: "F2F2F4" } }, A2, "editor-chrome");
  ctx.shape(S.RECTANGLE, { x: ex + 0.01, y: ey + 0.42, w: ew - 0.02, h: 0.14, fill: { color: "FFFFFF" }, line: { type: "none" } }, A2, "editor-chrome-cut");
  ["FF5F57", "FEBC2E", "28C840"].forEach((c, i) =>
    ctx.shape(S.OVAL, { x: ex + 0.18 + i * 0.2, y: ey + 0.14, w: 0.13, h: 0.13, fill: { color: c }, line: { color: c } }, A2, "editor-dot"));
  ctx.text("Pricing editor", { x: ex + 0.85, y: ey + 0.06, w: 1.8, h: 0.3, fontSize: 11, color: C.muted, valign: "middle" }, A2, "editor-title");
  ctx.text("Basic plan", { x: ex + 0.25, y: ey + 0.62, w: 2.5, h: 0.35, fontSize: 16, bold: true, color: C.ink }, A2, "editor-plan");
  const rows = [["Price / month", "$0"], ["Pomodoros / day", "3"], ["Daily summary", "Off"]];
  rows.forEach(([k, v], i) => {
    const ry = ey + 1.12 + i * 0.52;
    ctx.text(k, { x: ex + 0.25, y: ry, w: 2.0, h: 0.4, fontSize: 14, color: C.text, valign: "middle" }, A2, "editor-key");
    ctx.text(v, { x: ex + 2.4, y: ry, w: 1.05, h: 0.4, fontSize: 14, bold: true, color: C.ink, align: "center", valign: "middle" },
      i === 0 ? A2 : { in: BOX, out: 4 }, "editor-val-old");
    ctx.line(ex + 0.25, ry + 0.46, ex + ew - 0.25, ry + 0.46, { color: C.hair, width: 0.75, arrow: false }, A2, "editor-rule");
  });
  // 4 · John edits the plan
  [["5", 1], ["Included", 2]].forEach(([v, i], j) => {
    const ry = ey + 1.12 + i * 0.52;
    ctx.shape(S.ROUNDED_RECTANGLE, { x: ex + 2.4, y: ry + 0.03, w: 1.05, h: 0.34, rectRadius: 0.08, fill: { color: C.sphereTint }, line: { color: C.sphere, width: 1.25 } },
      { in: 4, delay: j * 350 }, "editor-val-pill");
    ctx.text(v, { x: ex + 2.4, y: ry, w: 1.05, h: 0.4, fontSize: 14, bold: true, color: C.sphere, align: "center", valign: "middle" },
      { in: 4, delay: j * 350 }, "editor-val-new");
  });
  // publish button: disabled until the edit, pressed on click 5
  ctx.shape(S.ROUNDED_RECTANGLE, { x: ex + 0.25, y: ey + 2.85, w: ew - 0.5, h: 0.52, rectRadius: 0.08, fill: { color: "F2F2F4" }, line: { color: "F2F2F4" } }, A2, "publish-off");
  ctx.text("Publish new version", { x: ex + 0.25, y: ey + 2.85, w: ew - 0.5, h: 0.52, fontSize: 14, bold: true, color: "AEAEB2", align: "center", valign: "middle" }, A2, "publish-off-label");
  const A5 = { in: 5 };
  ctx.shape(S.ROUNDED_RECTANGLE, { x: ex + 0.25, y: ey + 2.85, w: ew - 0.5, h: 0.52, rectRadius: 0.08, fill: { color: C.sphere }, line: { color: C.sphere } }, A5, "publish-on");
  ctx.text("Publish new version", { x: ex + 0.25, y: ey + 2.85, w: ew - 0.5, h: 0.52, fontSize: 14, bold: true, color: "FFFFFF", align: "center", valign: "middle" }, A5, "publish-on-label");
  ctx.shape(S.ROUNDED_RECTANGLE, { x: ex + ew - 1.3, y: ey + 0.08, w: 1.15, h: 0.26, rectRadius: 0.13, fill: { color: C.tm }, line: { color: C.tm } }, { in: 5, delay: 300 }, "published-pill");
  ctx.text("✓ PUBLISHED", { x: ex + ew - 1.3, y: ey + 0.08, w: 1.15, h: 0.26, fontSize: 9, bold: true, color: "FFFFFF", align: "center", valign: "middle" }, { in: 5, delay: 300 }, "published-pill-label");

  // TomatoMeter as the end user sees it; the arrow comes with whichever of box and app appears last
  const A3 = { in: APP };
  ctx.line(8.08, 3.95, 8.62, 3.95, {}, { in: Math.max(BOX, APP), delay: 300 }, "arrow-box-app");
  const tx = 8.65, ty = 2.1, tw = 4.15, th = 3.7;
  ctx.shape(S.ROUNDED_RECTANGLE, { x: tx, y: ty, w: tw, h: th, rectRadius: 0.12, fill: { color: C.paper }, line: { color: C.paperEdge, width: 1.25 },
    shadow: { type: "outer", color: "000000", opacity: 0.12, blur: 8, offset: 3, angle: 90 } }, A3, "app");
  ctx.shape(S.OVAL, { x: tx + 0.22, y: ty + 0.15, w: 0.17, h: 0.17, fill: { color: C.tomato }, line: { color: C.tomato } }, A3, "app-logo");
  ctx.text("TomatoMeter", { x: tx + 0.48, y: ty + 0.08, w: 1.8, h: 0.32, fontSize: 13, bold: true, color: C.ink, valign: "middle" }, A3, "app-name");
  ctx.text("BASIC PLAN", { x: tx + tw - 1.6, y: ty + 0.08, w: 1.4, h: 0.32, fontSize: 10, color: C.muted, align: "right", valign: "middle", charSpacing: 1 }, A3, "app-plan");
  ctx.line(tx, ty + 0.48, tx + tw, ty + 0.48, { color: "E4DED5", width: 0.75, arrow: false }, A3, "app-rule");
  ctx.text("Time for focused work.", { x: tx + 0.25, y: ty + 0.68, w: 2.4, h: 0.32, fontSize: 14, bold: true, color: C.text }, A3, "app-h");
  ctx.text("25:00", { x: tx + 0.25, y: ty + 1.05, w: 2.4, h: 0.8, fontSize: 44, fontFace: "Cambria", color: C.ink, valign: "middle" }, A3, "app-timer");
  // before / after (click 6)
  const OLD = { in: APP, out: 6 }, NEW = { in: 6, delay: 200 };
  ctx.text("3 of 3 pomodoros used", { x: tx + 0.25, y: ty + 1.92, w: 2.5, h: 0.32, fontSize: 13, color: C.text }, OLD, "app-usage-old");
  ctx.text("3 of 5 pomodoros used", { x: tx + 0.25, y: ty + 1.92, w: 2.5, h: 0.32, fontSize: 13, color: C.text }, NEW, "app-usage-new");
  ctx.shape(S.ROUNDED_RECTANGLE, { x: tx + 0.25, y: ty + 2.4, w: 2.3, h: 0.5, rectRadius: 0.07, fill: { color: "DCD6CE" }, line: { color: "DCD6CE" } }, OLD, "app-btn-old");
  ctx.text("Daily limit reached", { x: tx + 0.25, y: ty + 2.4, w: 2.3, h: 0.5, fontSize: 13, bold: true, color: C.muted, align: "center", valign: "middle" }, OLD, "app-btn-old-label");
  ctx.shape(S.ROUNDED_RECTANGLE, { x: tx + 0.25, y: ty + 2.4, w: 2.3, h: 0.5, rectRadius: 0.07, fill: { color: C.tomato }, line: { color: C.tomato } }, NEW, "app-btn-new");
  ctx.text("Start focus session", { x: tx + 0.25, y: ty + 2.4, w: 2.3, h: 0.5, fontSize: 13, bold: true, color: "FFFFFF", align: "center", valign: "middle" }, NEW, "app-btn-new-label");
  ctx.line(tx + 2.78, ty + 0.75, tx + 2.78, ty + 3.0, { color: "E4DED5", width: 0.75, arrow: false }, A3, "app-divider");
  const rx = tx + 2.93;
  ctx.text("Daily summary", { x: rx, y: ty + 0.68, w: 1.15, h: 0.55, fontSize: 13, bold: true, color: C.ink, valign: "top" }, A3, "summary-h");
  ctx.text("Available on Advanced", { x: rx, y: ty + 1.25, w: 1.15, h: 0.45, fontSize: 10, color: C.muted, valign: "top" }, OLD, "summary-old");
  ctx.text("Included in Basic", { x: rx, y: ty + 1.25, w: 1.15, h: 0.45, fontSize: 10, bold: true, color: C.tmDark, valign: "top" }, NEW, "summary-new");
  const base = ty + 2.9;
  [0.4, 0.75, 0.55, 0.95].forEach((h, i) => {
    const b = { x: rx + 0.03 + i * 0.27, y: base - h, w: 0.19, h };
    ctx.shape(S.RECTANGLE, { ...b, fill: { color: C.locked }, line: { color: C.locked } }, OLD, "bar-old");
    ctx.shape(S.RECTANGLE, { ...b, fill: { color: C.tomato }, line: { color: C.tomato } }, { in: 6, fx: "wu", delay: 300 + i * 120 }, "bar-new");
  });
  ctx.shape(S.OVAL, { x: rx + 0.28, y: ty + 1.99, w: 0.54, h: 0.54, fill: { color: C.paper }, line: { color: C.locked, width: 1 } }, OLD, "summary-lock-bg");
  ctx.image(I.lock, { x: rx + 0.39, y: ty + 2.1, w: 0.32, h: 0.32 }, OLD, "summary-lock");
  ctx.shape(S.ROUNDED_RECTANGLE, { x: tx + tw - 2.05, y: ty + th - 0.55, w: 1.85, h: 0.34, rectRadius: 0.17, fill: { color: C.tmTint }, line: { color: C.tm, width: 1 } }, { in: 6, delay: 700 }, "app-updated");
  ctx.text("✓ PRICING UPDATED", { x: tx + tw - 2.05, y: ty + th - 0.55, w: 1.85, h: 0.34, fontSize: 10, bold: true, color: C.tmDark, align: "center", valign: "middle" }, { in: 6, delay: 700 }, "app-updated-label");

  // 7 · takeaway
  ctx.text("No code changes  ·  no redeploy  ·  the app adapts almost in real time",
    { x: 0.6, y: 6.68, w: 12.13, h: 0.45, fontSize: 16, italic: true, color: C.text, align: "center", valign: "middle" }, { in: 7 }, "takeaway");
}

// ---------------------------------------------------------------- slide 2: inside the black box
// Coordinates follow bridge-workflow.svg (990 x 580 px), mapped onto the 13.33" x 7.5" slide.
const K = 0.01167, OX = 0.773, OY = 0.608;
const X = (v) => OX + v * K, Y = (v) => OY + v * K, L = (v) => v * K;

function slideInside(pres, ctx, I) {
  const S = pres.shapes;

  const box = (x, y, w, h, o, a, label) => ctx.shape(S.ROUNDED_RECTANGLE, { x: X(x), y: Y(y), w: L(w), h: L(h), rectRadius: o.r ?? 0.1,
    fill: { color: o.fill }, line: { color: o.stroke, width: o.sw ?? 1.25 } }, a, label);
  // text whose SVG anchor is (x, baseline y)
  const txt = (s, x, y, o, a, label) => {
    const fs = o.fs, w = o.w ?? 3, anchor = o.anchor ?? "start";
    const bx = anchor === "middle" ? X(x) - w / 2 : anchor === "end" ? X(x) - w : X(x);
    ctx.text(s, { x: bx, y: Y(y) - fs / 72 * 0.95, w, h: fs / 72 * 1.3, fontSize: fs, color: o.color ?? C.text, bold: o.bold, italic: o.italic,
      fontFace: o.mono ? "Courier New" : FONT, align: anchor === "middle" ? "center" : anchor === "end" ? "right" : "left", valign: "middle" }, a, label);
  };
  // label with a background halo, centred on (x, baseline y)
  const lbl = (s, x, y, a, bg = "FFFFFF") => {
    const w = s.length * 0.083 + 0.14;
    ctx.text(s, { x: X(x) - w / 2, y: Y(y) - 0.2, w, h: 0.26, fontSize: 11, color: C.line, fill: { color: bg }, align: "center", valign: "middle" }, a, "lbl");
  };
  const badge = (n, cx, cy, a) => {
    ctx.shape(S.OVAL, { x: X(cx) - 0.15, y: Y(cy) - 0.15, w: 0.3, h: 0.3, fill: { color: C.ink }, line: { color: "FFFFFF", width: 1.5 } }, a, "badge");
    ctx.text(String(n), { x: X(cx) - 0.15, y: Y(cy) - 0.15, w: 0.3, h: 0.3, fontSize: 11, bold: true, color: "FFFFFF", align: "center", valign: "middle" }, a, "badge-n");
  };
  const arrow = (x1, y1, x2, y2, a, o = {}) => ctx.line(X(x1), Y(y1), X(x2), Y(y2), o, a, "arrow");
  const actor = (img, cx, name, sub) => {
    ctx.image(img, { x: X(cx) - 0.33, y: Y(12), w: 0.66, h: 0.66 }, null, "actor-icon");
    ctx.text([{ text: name, options: { bold: true, color: C.ink } }, { text: sub ? "  " + sub : "", options: { color: C.muted } }],
      { x: X(cx) - 1.6, y: Y(72), w: 3.2, h: 0.28, fontSize: 12, align: "center", valign: "middle" }, null, "actor-name");
  };

  // ---- step 0: actors, TomatoMeter and the closed box
  actor(I.pablo, 160, "John");
  box(700, 115, 280, 450, { fill: C.tmTint, stroke: C.tm, sw: 2, r: 0.14 }, null, "tm");
  txt("TomatoMeter", 716, 142, { fs: 18, bold: true, color: C.tmDark }, null, "tm-head");
  txt("host application", 716, 162, { fs: 12, italic: true }, null, "tm-role");
  const CLOSED = { out: 1 };
  arrow(160, 100, 160, 113, CLOSED);
  box(10, 115, 625, 450, { fill: C.ink, stroke: C.ink, r: 0.16 }, CLOSED, "blackbox");
  txt("Our solution", 30, 145, { fs: 18, bold: true, color: "FFFFFF" }, CLOSED, "blackbox-label");
  ctx.text("?", { x: X(10), y: Y(250), w: L(625), h: 1.5, fontSize: 96, bold: true, color: "5A5A5E", align: "center", valign: "middle" }, CLOSED, "blackbox-q");
  arrow(637, 340, 698, 340, CLOSED);

  // ---- step 1: open the box — SPHERE and SPACE as empty components, TomatoMeter split
  const OPEN = { in: 1, delay: 250 };
  box(10, 115, 280, 450, { fill: C.sphereTint, stroke: C.sphere, sw: 2, r: 0.14 }, OPEN, "sphere");
  txt("SPHERE", 26, 142, { fs: 18, bold: true, color: C.sphereDark }, OPEN, "sphere-head");
  txt("pricing design", 26, 162, { fs: 12, italic: true }, OPEN, "sphere-role");
  box(250, 180, 20, 365, { fill: C.sphere, stroke: C.sphere, r: 0.05 }, OPEN, "sphere-api");
  ctx.text("Public API", { x: X(250), y: Y(180), w: L(20), h: L(365), vert: "vert270", fontSize: 12, bold: true,
    color: "FFFFFF", align: "center", valign: "middle" }, OPEN, "sphere-api-label");
  box(355, 115, 280, 450, { fill: C.spaceTint, stroke: C.space, sw: 2, r: 0.14 }, OPEN, "space");
  txt("SPACE", 371, 142, { fs: 18, bold: true, color: C.spaceDark }, OPEN, "space-head");
  txt("runtime enforcement", 371, 162, { fs: 12, italic: true }, OPEN, "space-role");
  box(718, 180, 222, 70, { fill: "FFFFFF", stroke: C.tm }, OPEN, "frontend");
  txt("Frontend (UI)", 829, 212, { fs: 15, bold: true, color: C.ink, anchor: "middle" }, OPEN, "frontend-title");
  box(718, 380, 222, 75, { fill: "FFFFFF", stroke: C.tm }, OPEN, "backend");
  txt("Backend (API)", 829, 414, { fs: 15, bold: true, color: C.ink, anchor: "middle" }, OPEN, "backend-title");

  // ---- step 2 (badge 1): Pablo edits the pricing in SPHERE
  const S1 = { in: 2 };
  arrow(160, 100, 160, 178, { in: 2 });
  box(28, 180, 204, 80, { fill: "FFFFFF", stroke: C.sphere }, { in: 2, delay: 300 }, "editor");
  txt("Pricing editor", 130, 214, { fs: 15, bold: true, color: C.ink, anchor: "middle" }, { in: 2, delay: 300 }, "editor-title");
  txt("visual or YAML editing", 130, 238, { fs: 12, anchor: "middle" }, { in: 2, delay: 300 }, "editor-sub");
  badge(1, 28, 180, { in: 2, delay: 450 });

  // ---- step 3 (badge 2): publish a new version
  arrow(130, 260, 130, 318, { in: 3 });
  lbl("publish", 172, 294, { in: 3 }, C.sphereTint);
  const S2 = { in: 3, delay: 300 };
  box(28, 320, 204, 150, { fill: "FFFFFF", stroke: C.sphere }, S2, "history");
  txt("Version history", 130, 348, { fs: 15, bold: true, color: C.ink, anchor: "middle" }, S2, "history-title");
  [["v1.0", 362], ["v1.1", 396]].forEach(([v, y]) => {
    box(44, y, 172, 26, { fill: C.sphereTint, stroke: C.sphereEdge, sw: 0.75, r: 0.05 }, S2, "version");
    txt(v, 56, y + 18, { fs: 12, mono: true, w: 1 }, S2, "version-label");
  });
  const NEWV = { in: 3, delay: 650 };
  box(44, 430, 172, 26, { fill: C.sphereSoft, stroke: C.sphere, sw: 1.75, r: 0.05 }, NEWV, "version-new");
  txt("v1.2", 56, 448, { fs: 12, mono: true, bold: true, w: 1 }, NEWV, "version-new-label");
  txt("new", 204, 448, { fs: 12, bold: true, color: C.sphereDark, anchor: "end", w: 0.6 }, NEWV, "version-new-tag");
  badge(2, 28, 320, { in: 3, delay: 650 });

  // ---- step 4 (badge 3): SPACE polls SPHERE
  const S3 = { in: 4 };
  box(373, 180, 244, 60, { fill: "FFFFFF", stroke: C.space }, S3, "sync");
  txt("Sync worker", 495, 206, { fs: 15, bold: true, color: C.ink, anchor: "middle" }, S3, "sync-title");
  txt("polls every N minutes", 495, 228, { fs: 12, anchor: "middle" }, S3, "sync-sub");
  arrow(373, 210, 272, 210, { in: 4, delay: 300 }, { dash: true });
  lbl("poll", 321, 202, { in: 4, delay: 300 });
  badge(3, 373, 180, { in: 4, delay: 450 });

  // ---- step 5 (badge 4): the new version is pulled and imported
  arrow(270, 298, 371, 298, { in: 5 });
  lbl("new version", 321, 290, { in: 5 });
  lbl("YAML", 321, 318, { in: 5 });
  const S4 = { in: 5, delay: 300 };
  box(373, 268, 244, 60, { fill: "FFFFFF", stroke: C.space }, S4, "import");
  txt("Snapshot import", 495, 294, { fs: 15, bold: true, color: C.ink, anchor: "middle" }, S4, "import-title");
  txt("verify hash · validate", 495, 316, { fs: 12, anchor: "middle" }, S4, "import-sub");
  badge(4, 373, 268, { in: 5, delay: 450 });

  // ---- step 6 (badge 5): contracts of current users are migrated
  arrow(495, 328, 495, 354, { in: 6 });
  const S5 = { in: 6, delay: 250 };
  box(373, 356, 244, 102, { fill: "FFFFFF", stroke: C.space }, S5, "migration");
  txt("Contract migration", 495, 382, { fs: 15, bold: true, color: C.ink, anchor: "middle" }, S5, "migration-title");
  txt("applies configured policy", 495, 403, { fs: 12, anchor: "middle" }, S5, "migration-sub");
  txt("all_last · new_last", 495, 425, { fs: 11, mono: true, anchor: "middle" }, S5, "migration-p1");
  txt("all_pick · new_pick", 495, 444, { fs: 11, mono: true, anchor: "middle" }, S5, "migration-p2");
  badge(5, 373, 356, { in: 6, delay: 400 });

  // ---- step 7 (badge 6): an event announces the change
  arrow(495, 458, 495, 484, { in: 7 });
  const S6 = { in: 7, delay: 250 };
  box(373, 486, 244, 59, { fill: "FFFFFF", stroke: C.space }, S6, "events");
  txt("Event service", 495, 511, { fs: 15, bold: true, color: C.ink, anchor: "middle" }, S6, "events-title");
  txt("notifies pricing changes", 495, 533, { fs: 12, anchor: "middle" }, S6, "events-sub");
  badge(6, 373, 486, { in: 7, delay: 400 });

  // ---- step 8 (badge 7): WebSocket events update TomatoMeter's UI and API
  ctx.line(X(617), Y(515), X(960), Y(515), { arrow: false, flow: true }, { in: 8, dur: 500 }, "ws-1");
  ctx.line(X(960), Y(515), X(960), Y(215), { arrow: false, flow: true }, { in: 8, delay: 500, dur: 450 }, "ws-2");
  ctx.line(X(960), Y(215), X(942), Y(215), {}, { in: 8, delay: 950, dur: 150 }, "ws-3");
  ctx.shape(S.OVAL, { x: X(829) - 0.05, y: Y(515) - 0.05, w: 0.1, h: 0.1, fill: { color: C.line }, line: { color: C.line } }, { in: 8, delay: 350 }, "ws-dot");
  ctx.line(X(829), Y(515), X(829), Y(457), {}, { in: 8, delay: 350, dur: 300 }, "ws-backend");
  ctx.text("Events(WebSocket)", { x: 9.069, y: 6.2015, w: 1.2615, h: 0.26, fontSize: 11, color: C.line, fill: { color: C.tmTint }, align: "center", valign: "middle" }, { in: 8 }, "lbl");
  const S7 = { in: 8, delay: 1100 };
  txt("updates components", 829, 236, { fs: 12, anchor: "middle" }, S7, "frontend-sub");
  txt("updates business logic", 829, 438, { fs: 12, anchor: "middle" }, S7, "backend-sub");
  badge(7, 718, 180, S7);
  badge(7, 718, 380, S7);
}

// ---------------------------------------------------------------- slide 3: inside the black box, following the change
// Same workflow as slide 2, but SPHERE shows the editor John used and TomatoMeter shows its real UI, so the
// change can be followed from the editor to the screen. Tokens ride motion paths between components.
function slideFlow(pres, ctx, I) {
  const S = pres.shapes;
  const rr = (x, y, w, h, fill, stroke, a, label, o = {}) => ctx.shape(S.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: o.r ?? 0.08,
    fill: { color: fill }, line: { color: stroke, width: o.sw ?? 1.25 } }, a, label);
  const t = (s, x, y, w, h, o, a, label = "text") => ctx.text(s, { x, y, w, h, color: C.text, valign: "middle", ...o }, a, label);
  const pill = (s, x, y, w, h, fill, color, a, label, o = {}) => ctx.text(s, { x, y, w, h, shape: S.ROUNDED_RECTANGLE, rectRadius: h / 2,
    fill: { color: fill }, line: { color: o.stroke ?? fill, width: 1 }, fontSize: o.fs ?? 10, bold: true, color, align: "center", valign: "middle",
    fontFace: o.mono ? "Courier New" : FONT }, a, label);
  const badge = (n, x, y, a) => {
    ctx.shape(S.OVAL, { x: x - 0.15, y: y - 0.15, w: 0.3, h: 0.3, fill: { color: C.ink }, line: { color: "FFFFFF", width: 1.5 } }, a, "badge");
    t(String(n), x - 0.15, y - 0.15, 0.3, 0.3, { fontSize: 11, bold: true, color: "FFFFFF", align: "center" }, a, "badge-n");
  };
  const lbl = (s, cx, cy, a, bg = "FFFFFF") => {
    const w = s.length * 0.083 + 0.14;
    t(s, cx - w / 2, cy - 0.13, w, 0.26, { fontSize: 11, color: C.line, fill: { color: bg }, align: "center" }, a, "lbl");
  };
  const step = (x, y, w, h, title, sub, color, a, label) => {
    rr(x, y, w, h, "FFFFFF", color, a, label);
    t(title, x, y + 0.1, w, 0.3, { fontSize: 14, bold: true, color: C.ink, align: "center" }, a, label + "-title");
    if (sub) t(sub, x, y + 0.42, w, 0.26, { fontSize: 11, align: "center" }, a, label + "-sub");
  };

  // ---- step 0: John, the closed box and TomatoMeter as its users see it
  ctx.image(I.pablo, { x: 1.77, y: 0.28, w: 0.6, h: 0.6 }, null, "john-icon");
  t("John", 1.07, 0.92, 2.0, 0.28, { fontSize: 13, bold: true, color: C.ink, align: "center" }, null, "john-name");
  rr(8.7, 1.45, 4.3, 5.75, C.tmTint, C.tm, null, "tm", { r: 0.14, sw: 2 });
  t("TomatoMeter", 8.9, 1.55, 3, 0.36, { fontSize: 18, bold: true, color: C.tmDark }, null, "tm-head");
  t("host application", 8.9, 1.9, 3, 0.25, { fontSize: 12, italic: true }, null, "tm-role");
  const CLOSED = { out: 1 };
  ctx.line(2.07, 1.24, 2.07, 1.43, {}, CLOSED, "arrow-john-box");
  rr(0.35, 1.45, 7.85, 5.75, C.ink, C.ink, CLOSED, "blackbox", { r: 0.16 });
  t("Our solution", 0.6, 1.6, 4, 0.4, { fontSize: 18, bold: true, color: "FFFFFF" }, CLOSED, "blackbox-label");
  t("?", 0.35, 3.5, 7.85, 1.6, { fontSize: 96, bold: true, color: "5A5A5E", align: "center" }, CLOSED, "blackbox-q");
  ctx.line(8.22, 4.3, 8.68, 4.3, {}, CLOSED, "arrow-box-tm");

  // TomatoMeter UI (frontend); switches to the new pricing on click 8
  const ux = 8.9, uy = 2.5, uw = 3.7, uh = 2.62;
  const OLD = { out: 8, outDelay: 1550 }, NEW = { in: 8, delay: 1600 };
  rr(ux, uy, uw, uh, C.paper, C.paperEdge, null, "ui", { r: 0.1 });
  ctx.shape(S.OVAL, { x: ux + 0.18, y: uy + 0.13, w: 0.15, h: 0.15, fill: { color: C.tomato }, line: { color: C.tomato } }, null, "ui-logo");
  t("TomatoMeter", ux + 0.4, uy + 0.06, 1.6, 0.3, { fontSize: 12, bold: true, color: C.ink }, null, "ui-name");
  t("BASIC PLAN", ux + uw - 1.4, uy + 0.06, 1.25, 0.3, { fontSize: 9, color: C.muted, align: "right", charSpacing: 1 }, null, "ui-plan");
  ctx.line(ux, uy + 0.42, ux + uw, uy + 0.42, { color: "E4DED5", width: 0.75, arrow: false }, null, "ui-rule");
  t("Time for focused work.", ux + 0.2, uy + 0.52, 2.2, 0.26, { fontSize: 11, bold: true }, null, "ui-h");
  t("25:00", ux + 0.2, uy + 0.8, 2.1, 0.6, { fontSize: 32, fontFace: "Cambria", color: C.ink }, null, "ui-timer");
  t("3 of 3 pomodoros used", ux + 0.2, uy + 1.42, 2.2, 0.26, { fontSize: 11 }, OLD, "ui-usage-old");
  t("3 of 5 pomodoros used", ux + 0.2, uy + 1.42, 2.2, 0.26, { fontSize: 11 }, NEW, "ui-usage-new");
  rr(ux + 0.2, uy + 1.78, 2.0, 0.42, "DCD6CE", "DCD6CE", OLD, "ui-btn-old", { r: 0.06 });
  t("Daily limit reached", ux + 0.2, uy + 1.78, 2.0, 0.42, { fontSize: 11, bold: true, color: C.muted, align: "center" }, OLD, "ui-btn-old-label");
  rr(ux + 0.2, uy + 1.78, 2.0, 0.42, C.tomato, C.tomato, NEW, "ui-btn-new", { r: 0.06 });
  t("Start focus session", ux + 0.2, uy + 1.78, 2.0, 0.42, { fontSize: 11, bold: true, color: "FFFFFF", align: "center" }, NEW, "ui-btn-new-label");
  ctx.line(ux + 2.38, uy + 0.55, ux + 2.38, uy + 2.2, { color: "E4DED5", width: 0.75, arrow: false }, null, "ui-divider");
  const sx = ux + 2.5, base = uy + 2.2;
  t("Daily summary", sx, uy + 0.52, 1.1, 0.42, { fontSize: 11, bold: true, color: C.ink, valign: "top" }, null, "ui-summary-h");
  t("Available on Advanced", sx, uy + 0.95, 1.1, 0.36, { fontSize: 9, color: C.muted, valign: "top" }, OLD, "ui-summary-old");
  t("Included in Basic", sx, uy + 0.95, 1.1, 0.36, { fontSize: 9, bold: true, color: C.tmDark, valign: "top" }, NEW, "ui-summary-new");
  [0.3, 0.55, 0.4, 0.7].forEach((h, i) => {
    const b = { x: sx + 0.04 + i * 0.25, y: base - h, w: 0.16, h };
    ctx.shape(S.RECTANGLE, { ...b, fill: { color: C.locked }, line: { color: C.locked } }, OLD, "ui-bar-old");
    ctx.shape(S.RECTANGLE, { ...b, fill: { color: C.tomato }, line: { color: C.tomato } }, { in: 8, fx: "wu", delay: 1650 + i * 100 }, "ui-bar-new");
  });
  ctx.shape(S.OVAL, { x: sx + 0.275, y: base - 0.57, w: 0.44, h: 0.44, fill: { color: C.paper }, line: { color: C.locked, width: 1 } }, OLD, "ui-lock-bg");
  ctx.image(I.lock, { x: sx + 0.365, y: base - 0.48, w: 0.26, h: 0.26 }, OLD, "ui-lock");
  pill("✓ PRICING UPDATED", ux + uw - 1.6, uy + uh - 0.33, 1.45, 0.24, C.tmTint, C.tmDark, { in: 8, delay: 1900 }, "ui-updated", { fs: 9, stroke: C.tm });

  // ---- step 1: open the box
  const OPEN = { in: 1, delay: 250 };
  rr(0.35, 1.45, 3.75, 5.75, C.sphereTint, C.sphere, OPEN, "sphere", { r: 0.14, sw: 2 });
  t("SPHERE", 0.55, 1.55, 2, 0.36, { fontSize: 18, bold: true, color: C.sphereDark }, OPEN, "sphere-head");
  t("pricing design", 0.55, 1.9, 2, 0.25, { fontSize: 12, italic: true }, OPEN, "sphere-role");
  rr(3.72, 2.3, 0.24, 4.7, C.sphere, C.sphere, OPEN, "api", { r: 0.05 });
  ctx.text("Public API", { x: 3.72, y: 2.3, w: 0.24, h: 4.7, vert: "vert270", fontSize: 12, bold: true, color: "FFFFFF", align: "center", valign: "middle" }, OPEN, "api-label");
  rr(4.6, 1.45, 3.6, 5.75, C.spaceTint, C.space, OPEN, "space", { r: 0.14, sw: 2 });
  t("SPACE", 4.8, 1.55, 2, 0.36, { fontSize: 18, bold: true, color: C.spaceDark }, OPEN, "space-head");
  t("runtime enforcement", 4.8, 1.9, 3, 0.25, { fontSize: 12, italic: true }, OPEN, "space-role");
  t("FRONTEND (UI)", 9.12, 2.22, 2, 0.24, { fontSize: 9, bold: true, color: C.tmDark, charSpacing: 1 }, OPEN, "fe-label");
  rr(8.9, 5.3, 3.7, 0.95, "FFFFFF", C.tm, OPEN, "backend");
  t("Backend (API)", 8.9, 5.36, 3.7, 0.3, { fontSize: 13, bold: true, color: C.ink, align: "center" }, OPEN, "backend-title");
  const BOLD = { in: 1, delay: 250, out: 8, outDelay: 600 }, BNEW = { in: 8, delay: 650 };
  const mono = { fontSize: 11, fontFace: "Courier New", align: "center" };
  t("limit: 3 pomodoros / day", 8.9, 5.68, 3.7, 0.24, mono, BOLD, "backend-limit-old");
  t("daily summary: locked", 8.9, 5.93, 3.7, 0.24, mono, BOLD, "backend-summary-old");
  t("limit: 5 pomodoros / day", 8.9, 5.68, 3.7, 0.24, { ...mono, bold: true, color: C.tmDark }, BNEW, "backend-limit-new");
  t("daily summary: enabled", 8.9, 5.93, 3.7, 0.24, { ...mono, bold: true, color: C.tmDark }, BNEW, "backend-summary-new");

  // the pricing editor John uses (same as slide 1)
  const ex = 0.55, ey = 2.3, ew = 3.05, eh = 2.5;
  rr(ex, ey, ew, eh, "FFFFFF", C.sphere, OPEN, "editor");
  ["FF5F57", "FEBC2E", "28C840"].forEach((c, i) =>
    ctx.shape(S.OVAL, { x: ex + 0.15 + i * 0.17, y: ey + 0.13, w: 0.11, h: 0.11, fill: { color: c }, line: { color: c } }, OPEN, "editor-dot"));
  t("Pricing editor", ex + 0.7, ey + 0.06, 1.3, 0.26, { fontSize: 10, color: C.muted }, OPEN, "editor-title");
  ctx.line(ex, ey + 0.38, ex + ew, ey + 0.38, { color: C.hair, width: 0.75, arrow: false }, OPEN, "editor-chrome-rule");
  t("Basic plan", ex + 0.2, ey + 0.5, 2, 0.3, { fontSize: 13, bold: true, color: C.ink }, OPEN, "editor-plan");
  [["Pomodoros / day", "3", "5"], ["Daily summary", "Off", "Included"]].forEach(([k, v0, v1], i) => {
    const ry = ey + 0.9 + i * 0.43;
    t(k, ex + 0.2, ry, 1.75, 0.36, { fontSize: 12 }, OPEN, "editor-key");
    t(v0, ex + 2.0, ry, 0.85, 0.36, { fontSize: 12, bold: true, color: C.ink, align: "center" }, { in: 1, delay: 250, out: 2, outDelay: 300 + i * 350 }, "editor-val-old");
    ctx.line(ex + 0.2, ry + 0.4, ex + ew - 0.2, ry + 0.4, { color: C.hair, width: 0.75, arrow: false }, OPEN, "editor-rule");
    pill(v1, ex + 2.0, ry + 0.03, 0.85, 0.3, C.sphereTint, C.sphere, { in: 2, delay: 300 + i * 350 }, "editor-val-new", { fs: 12, stroke: C.sphere });
  });
  rr(ex + 0.2, ey + 1.92, ew - 0.4, 0.42, "F2F2F4", "F2F2F4", OPEN, "publish-off", { r: 0.06 });
  t("Publish new version", ex + 0.2, ey + 1.92, ew - 0.4, 0.42, { fontSize: 12, bold: true, color: "AEAEB2", align: "center" }, OPEN, "publish-off-label");

  // ---- step 2 (badge 1): John edits the Basic plan
  ctx.line(2.07, 1.24, 2.07, 2.28, {}, { in: 2 }, "arrow-john-editor");
  badge(1, ex, ey, { in: 2, delay: 200 });

  // ---- step 3 (badge 2): publish a new version
  rr(ex + 0.2, ey + 1.92, ew - 0.4, 0.42, C.sphere, C.sphere, { in: 3 }, "publish-on", { r: 0.06 });
  t("Publish new version", ex + 0.2, ey + 1.92, ew - 0.4, 0.42, { fontSize: 12, bold: true, color: "FFFFFF", align: "center" }, { in: 3 }, "publish-on-label");
  pill("✓ PUBLISHED", ex + ew - 1.1, ey + 0.07, 0.98, 0.22, C.tm, "FFFFFF", { in: 3, delay: 200 }, "published", { fs: 8 });
  ctx.line(2.07, 4.8, 2.07, 5.28, {}, { in: 3, delay: 300 }, "arrow-publish");
  lbl("publish", 2.62, 5.04, { in: 3, delay: 300 }, C.sphereTint);
  const H = { in: 3, delay: 500 };
  rr(0.55, 5.3, 3.05, 1.7, "FFFFFF", C.sphere, H, "history");
  t("Version history", 0.55, 5.38, 3.05, 0.3, { fontSize: 13, bold: true, color: C.ink, align: "center" }, H, "history-title");
  [["v1.0", 5.8], ["v1.1", 6.18]].forEach(([v, y]) => {
    rr(0.75, y, 2.65, 0.3, C.sphereTint, C.sphereEdge, H, "version", { r: 0.05, sw: 0.75 });
    t(v, 0.87, y, 1, 0.3, { fontSize: 11, fontFace: "Courier New" }, H, "version-label");
  });
  const HV = { in: 3, delay: 850 };
  rr(0.75, 6.56, 2.65, 0.3, C.sphereSoft, C.sphere, HV, "version-new", { r: 0.05, sw: 1.75 });
  t("v1.2", 0.87, 6.56, 1, 0.3, { fontSize: 11, fontFace: "Courier New", bold: true, color: C.ink }, HV, "version-new-label");
  t("new", 2.6, 6.56, 0.7, 0.3, { fontSize: 11, bold: true, color: C.sphereDark, align: "right" }, HV, "version-new-tag");
  badge(2, 0.55, 5.3, HV);

  // ---- step 4 (badge 3): SPACE polls SPHERE
  step(4.8, 2.3, 3.2, 0.75, "Sync worker", "polls every N minutes", C.space, { in: 4 }, "sync");
  ctx.line(4.78, 2.68, 3.98, 2.68, { dash: true }, { in: 4, delay: 300 }, "arrow-poll");
  lbl("poll", 4.38, 2.46, { in: 4, delay: 300 });
  badge(3, 4.8, 2.3, { in: 4, delay: 450 });

  // ---- step 5 (badge 4): v1.2 travels from the version history into SPACE
  pill("v1.2 · YAML", 1.52, 6.56, 1.1, 0.3, C.sphere, "FFFFFF",
    { in: 5, dur: 200, path: { pts: [[1.77, 0], [1.77, -2.93], [3.33, -2.93]], delay: 150, dur: 1800 }, out: 5, outDelay: 1950, outDur: 300 }, "token-yaml", { fs: 10 });
  ctx.line(3.98, 3.78, 4.78, 3.78, {}, { in: 5, delay: 1500, dur: 450 }, "arrow-new-version");
  lbl("v1.2", 4.3, 3.58, { in: 5, delay: 1500 });
  lbl("YAML", 4.3, 4.0, { in: 5, delay: 1500 });
  step(4.8, 3.4, 3.2, 0.75, "Snapshot import", "verify hash · validate", C.space, { in: 5, delay: 1850 }, "import");
  badge(4, 4.8, 3.4, { in: 5, delay: 2050 });

  // ---- step 6 (badge 5): current contracts move to v1.2
  ctx.line(6.4, 4.15, 6.4, 4.48, {}, { in: 6 }, "arrow-import-migration");
  const M = { in: 6, delay: 250 };
  step(4.8, 4.5, 3.2, 1.3, "Contract migration", "applies configured policy", C.space, M, "migration");
  t("active contracts", 5.05, 5.3, 1.6, 0.3, { fontSize: 11 }, M, "migration-contracts");
  pill("v1.1", 6.85, 5.3, 0.9, 0.3, "F2F2F4", C.muted, { in: 6, delay: 250, out: 6, outDelay: 900 }, "contract-old", { fs: 11, mono: true });
  pill("v1.2", 6.85, 5.3, 0.9, 0.3, C.sphere, "FFFFFF", { in: 6, delay: 950 }, "contract-new", { fs: 11, mono: true });
  badge(5, 4.8, 4.5, { in: 6, delay: 400 });

  // ---- step 7 (badge 6): an event announces the change
  ctx.line(6.4, 5.8, 6.4, 6.18, {}, { in: 7 }, "arrow-migration-events");
  step(4.8, 6.2, 3.2, 0.75, "Event service", "notifies pricing changes", C.space, { in: 7, delay: 250 }, "events");
  badge(6, 4.8, 6.2, { in: 7, delay: 400 });

  // ---- step 8 (badge 7): the event reaches backend and frontend over WebSocket, and the UI updates
  ctx.line(8.0, 6.58, 12.85, 6.58, { arrow: false, flow: true }, { in: 8, dur: 900 }, "ws-1");
  ctx.line(12.85, 6.58, 12.85, 3.72, { arrow: false, flow: true }, { in: 8, delay: 900, dur: 550 }, "ws-2");
  ctx.line(12.85, 3.72, 12.62, 3.72, {}, { in: 8, delay: 1450, dur: 100 }, "ws-3");
  ctx.shape(S.OVAL, { x: 10.7, y: 6.53, w: 0.1, h: 0.1, fill: { color: C.line }, line: { color: C.line } }, { in: 8, delay: 500 }, "ws-dot");
  ctx.line(10.75, 6.58, 10.75, 6.27, {}, { in: 8, delay: 510, dur: 150 }, "ws-backend");
  lbl("events (WebSocket)", 9.6, 6.58, { in: 8 }, C.tmTint);
  const EV = (pts, dur) => ({ in: 8, dur: 150, path: { pts, delay: 0, dur }, out: 8, outDelay: dur, outDur: 200 });
  pill("event", 8.04, 6.46, 0.62, 0.24, C.ink, "FFFFFF", EV([[2.4, 0], [2.4, -0.4]], 600), "token-event-api", { fs: 9 });
  pill("event", 8.04, 6.46, 0.62, 0.24, C.ink, "FFFFFF", EV([[4.5, 0], [4.5, -2.86]], 1450), "token-event-ui", { fs: 9 });
  badge(7, 8.9, 5.3, { in: 8, delay: 650 });
  badge(7, ux, uy, { in: 8, delay: 1600 });
}

// ---------------------------------------------------------------- notes
const NOTES1 = `[Start] The idea behind our tool is pretty simple.
[Click 1] We've got a stakeholder, John, who usually has no technical knowledge, and who wants to apply certain changes to the pricing model of his software as a service — in this case TomatoMeter, a fictitious productivity app.
[Click 2] To John, our solution appears as a black box: a UI where he can change the pricing model.
[Click 3] On the other side, TomatoMeter as its users see it today: the Basic plan allows 3 pomodoros a day and has no daily summary.
[Click 4] John raises the limit to 5 pomodoros a day and includes the daily summary in Basic.
[Click 5] He publishes the new version.
[Click 6] And the behaviour of the app is immediately updated: the limit and the daily summary follow the new pricing.
[Click 7] If he adds or removes features or usage limits in a plan, the app reflects these changes automatically, almost in real time.`;

const NOTES1B = `[Start] The idea behind our tool is pretty simple.
[Click 1] We've got a stakeholder, John, who usually has no technical knowledge...
[Click 2] ...and who wants to apply certain changes to the pricing of his software as a service — in this case TomatoMeter, a fictitious productivity app. Today its Basic plan allows 3 pomodoros a day and has no daily summary.
[Click 3] Between John and TomatoMeter sits our solution, which John sees as a black box: a UI where he can change the pricing model.
[Click 4] John raises the limit to 5 pomodoros a day and includes the daily summary in Basic.
[Click 5] He publishes the new version.
[Click 6] And the behaviour of the app is immediately updated: the limit and the daily summary follow the new pricing.
[Click 7] If he adds or removes features or usage limits in a plan, the app reflects these changes automatically, almost in real time.`;

const NOTES2 = `[Start] Let's open the black box.
[Click 1] Our solution is mainly composed of two components: SPHERE and SPACE. TomatoMeter is split into its frontend and its backend.
[Click 2] SPHERE is the UI through which the stakeholder edits the pricing...
[Click 3] ...and releases a new version of it.
[Click 4] SPACE is, let's say, the brain: the logic that determines which features are available to each user. It synchronizes with SPHERE through a polling system whose interval can be configured — for example every minute, or every five minutes.
[Click 5] When a new version is found, SPACE downloads and validates it.
[Click 6] SPACE is in charge of applying all the required changes to the contracts of the users currently using the application.
[Click 7] Then it notifies the pricing change.
[Click 8] In our demo scenario, SPACE is connected to the TomatoMeter UI and the TomatoMeter API through WebSockets, so both update their behaviour without touching the code.`;

const NOTES3 = `[Start] Let's open the black box and follow John's change all the way to the screen.
[Click 1] Inside there are two components: SPHERE, where John edits the pricing, and SPACE. TomatoMeter has a frontend — the UI its users see — and a backend.
[Click 2] In SPHERE's editor, John gives Basic users 5 pomodoros a day and includes the daily summary...
[Click 3] ...and publishes it as a new version of the pricing, v1.2.
[Click 4] SPACE is the brain: it decides which features each user can access. It synchronizes with SPHERE through polling, with a configurable interval — every minute, every five minutes, and so on.
[Click 5] On the next poll, SPACE finds v1.2 and pulls it through SPHERE's public API as YAML, then validates it.
[Click 6] SPACE applies the required changes to the contracts of the users currently using the application: they move to v1.2.
[Click 7] Then it notifies the pricing change.
[Click 8] In our demo, SPACE is connected to the TomatoMeter UI and API through WebSockets. The backend now allows five pomodoros and the daily summary, and the UI updates on its own: no code changes, no redeploy.`;

// ---------------------------------------------------------------- deck assembly
const SLIDES = [
  { build: slideCover, steps: 0, notes: "", section: "Cover" },
  { build: slideBlackBox, steps: 7, notes: NOTES1, section: "Black box" },
  { build: (p, c, i) => slideBlackBox(p, c, i, { box: 3, app: 2 }), steps: 7, notes: NOTES1B, section: "Black box (John, app, box)" },
  { build: slideFlow, steps: 8, notes: NOTES3, section: "Following the change" },
  { build: slideInside, steps: 8, notes: NOTES2, section: "Inside the black box" },
];

function newPres() {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_WIDE";
  pres.title = "Pricing-driven self-adaptation · demo diagrams";
  pres.author = "ICSOC 2026 demo";
  pres.theme = { headFontFace: FONT, bodyFontFace: FONT };
  return pres;
}

async function icons() {
  return { pablo: await icon(FaUserTie, C.ink), user: await icon(FaUser, C.ink), lock: await icon(FaLock, "A39C92") };
}

// wl/wr/wu/wd = wipe from left/right/bottom/top; the filter names the side the wipe starts from
const FX = { fade: [10, 0, "fade"], wl: [22, 8, "wipe(left)"], wr: [22, 2, "wipe(right)"], wu: [22, 4, "wipe(down)"], wd: [22, 1, "wipe(up)"] };

const ORDER = { in: 0, path: 1, out: 2 };
function timingXml(effects, picIds) {
  let id = 2;
  const grp = {};
  const steps = [...new Set(effects.map((e) => e.step))].sort((a, b) => a - b);
  const effectXml = (e, nodeType) => {
    const g = (grp[e.spid] = grp[e.spid] || []);
    const grpId = g.length; g.push(grpId);
    const dur = e.dur || 500, d = e.delay || 0, t = `<p:tgtEl><p:spTgt spid="${e.spid}"/></p:tgtEl>`;
    const set = (vis, at) => `<p:set><p:cBhvr><p:cTn id="${++id}" dur="1" fill="hold"><p:stCondLst><p:cond delay="${at}"/></p:stCondLst></p:cTn>${t}<p:attrNameLst><p:attrName>style.visibility</p:attrName></p:attrNameLst></p:cBhvr><p:to><p:strVal val="${vis}"/></p:to></p:set>`;
    if (e.kind === "in") {
      const [preset, sub, filter] = FX[e.fx || "fade"];
      const head = `<p:par><p:cTn id="${++id}" presetID="${preset}" presetClass="entr" presetSubtype="${sub}" fill="hold" grpId="${grpId}" nodeType="${nodeType}"><p:stCondLst><p:cond delay="${d}"/></p:stCondLst><p:childTnLst>`;
      return head + set("visible", 0) + `<p:animEffect transition="in" filter="${filter}"><p:cBhvr><p:cTn id="${++id}" dur="${dur}"/>${t}</p:cBhvr></p:animEffect></p:childTnLst></p:cTn></p:par>`;
    }
    if (e.kind === "path") {
      // pts: cumulative offsets in inches from the shape's own position; PowerPoint wants slide fractions
      const path = "M 0 0 " + e.pts.map(([dx, dy]) => `L ${(dx / SLIDE_W).toFixed(4)} ${(dy / SLIDE_H).toFixed(4)}`).join(" ") + " E";
      return `<p:par><p:cTn id="${++id}" presetID="0" presetClass="path" presetSubtype="0" fill="hold" grpId="${grpId}" nodeType="${nodeType}"><p:stCondLst><p:cond delay="${d}"/></p:stCondLst><p:childTnLst>` +
        `<p:animMotion origin="layout" path="${path}" pathEditMode="relative"><p:cBhvr><p:cTn id="${++id}" dur="${dur}" fill="hold"/>${t}<p:attrNameLst><p:attrName>ppt_x</p:attrName><p:attrName>ppt_y</p:attrName></p:attrNameLst></p:cBhvr></p:animMotion></p:childTnLst></p:cTn></p:par>`;
    }
    const head = `<p:par><p:cTn id="${++id}" presetID="10" presetClass="exit" presetSubtype="0" fill="hold" grpId="${grpId}" nodeType="${nodeType}"><p:stCondLst><p:cond delay="${d}"/></p:stCondLst><p:childTnLst>`;
    return head + `<p:animEffect transition="out" filter="fade"><p:cBhvr><p:cTn id="${++id}" dur="${dur}"/>${t}</p:cBhvr></p:animEffect>` + set("hidden", dur - 1) + `</p:childTnLst></p:cTn></p:par>`;
  };
  let clicks = "";
  for (const s of steps) {
    const outer = ++id, inner = ++id;
    const list = effects.filter((e) => e.step === s).sort((a, b) => (a.delay || 0) - (b.delay || 0) || ORDER[a.kind] - ORDER[b.kind]);
    const body = list.map((e, i) => effectXml(e, i === 0 ? "clickEffect" : "withEffect")).join("");
    clicks += `<p:par><p:cTn id="${outer}" fill="hold"><p:stCondLst><p:cond delay="indefinite"/></p:stCondLst><p:childTnLst><p:par><p:cTn id="${inner}" fill="hold"><p:stCondLst><p:cond delay="0"/></p:stCondLst><p:childTnLst>${body}</p:childTnLst></p:cTn></p:par></p:childTnLst></p:cTn></p:par>`;
  }
  const bld = Object.entries(grp).filter(([spid]) => !picIds.has(spid))
    .flatMap(([spid, g]) => g.map((gid) => `<p:bldP spid="${spid}" grpId="${gid}" animBg="1"/>`)).join("");
  return `<p:timing><p:tnLst><p:par><p:cTn id="1" dur="indefinite" restart="never" nodeType="tmRoot"><p:childTnLst><p:seq concurrent="1" nextAc="seek"><p:cTn id="2" dur="indefinite" nodeType="mainSeq"><p:childTnLst>${clicks}</p:childTnLst></p:cTn><p:prevCondLst><p:cond evt="onPrev" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:prevCondLst><p:nextCondLst><p:cond evt="onNext" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:nextCondLst></p:seq></p:childTnLst></p:cTn></p:par></p:tnLst>${bld ? `<p:bldLst>${bld}</p:bldLst>` : ""}</p:timing>`;
}

async function injectAnimations(file, registry) {
  const zip = await JSZip.loadAsync(fs.readFileSync(file));
  for (let s = 1; s <= SLIDES.length; s++) {
    const p = `ppt/slides/slide${s}.xml`;
    let xml = await zip.file(p).async("string");
    const ids = {};
    for (const m of xml.matchAll(/<p:cNvPr id="(\d+)" name="([^"]+)"/g)) ids[m[2]] = m[1];
    const picIds = new Set([...xml.matchAll(/<p:pic>.*?<p:cNvPr id="(\d+)"/gs)].map((m) => m[1]));
    const effects = [];
    for (const r of registry.filter((r) => r.slide === s)) {
      const spid = ids[r.name];
      if (!spid) throw new Error("shape not found: " + r.name);
      if (r.in) effects.push({ spid, kind: "in", step: r.in, fx: r.fx, delay: r.delay, dur: r.dur });
      if (r.path) effects.push({ spid, kind: "path", step: r.in, delay: r.path.delay, dur: r.path.dur, pts: r.path.pts });
      if (r.out) effects.push({ spid, kind: "out", step: r.out, delay: r.outDelay, dur: r.outDur });
    }
    if (!effects.length) continue;
    const transition = `<p:transition spd="med"><p:fade/></p:transition>`;
    xml = xml.replace("</p:clrMapOvr></p:sld>", `</p:clrMapOvr>${transition}${timingXml(effects, picIds)}</p:sld>`);
    zip.file(p, xml);
  }
  fs.writeFileSync(file, await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" }));
}

async function main() {
  const I = await icons();
  const framesDir = process.argv.includes("--frames") ? process.argv[process.argv.indexOf("--frames") + 1] : null;

  if (framesDir) {
    fs.mkdirSync(framesDir, { recursive: true });
    for (let s = 0; s < SLIDES.length; s++)
      for (let k = 0; k <= SLIDES[s].steps; k++) {
        const pres = newPres();
        const slide = pres.addSlide();
        slide.background = { color: "FFFFFF" };
        SLIDES[s].build(pres, makeCtx(pres, slide, s + 1, k, null), I);
        await pres.writeFile({ fileName: path.join(framesDir, `s${s + 1}-k${String(k).padStart(2, "0")}.pptx`) });
      }
    return;
  }

  // animated deck
  const registry = [];
  const pres = newPres();
  SLIDES.forEach((d, i) => {
    pres.addSection({ title: d.section });
    const slide = pres.addSlide({ sectionTitle: d.section });
    slide.background = { color: "FFFFFF" };
    d.build(pres, makeCtx(pres, slide, i + 1, null, registry), I);
    if (d.notes) slide.addNotes(d.notes);
  });
  const deck = path.join(OUT, "blackbox-deck.pptx");
  await pres.writeFile({ fileName: deck });
  await injectAnimations(deck, registry);

  // storyboard: one static slide per click (backup without animations)
  const sb = newPres();
  SLIDES.forEach((d, i) => {
    sb.addSection({ title: d.section });
    for (let k = 0; k <= d.steps; k++) {
      const slide = sb.addSlide({ sectionTitle: d.section });
      slide.background = { color: "FFFFFF" };
      d.build(sb, makeCtx(sb, slide, i + 1, k, null), I);
      slide.addNotes(`Click ${k} of ${d.steps}`);
    }
  });
  await sb.writeFile({ fileName: path.join(OUT, "blackbox-deck.storyboard.pptx") });
  console.log("ok", registry.length, "animated shapes");
}

main().catch((e) => { console.error(e); process.exit(1); });
