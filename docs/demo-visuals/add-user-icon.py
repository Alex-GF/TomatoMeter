#!/usr/bin/env python3
"""Replace the `author` node box of an Archify architecture HTML with a user icon + label.

Archify has no user/actor component type, so this post-processes the delivered HTML.
Usage: add-user-icon.py <architecture.html>
"""
import re, sys

p = sys.argv[1]
h = open(p, encoding='utf-8').read()
start = h.index('<g id="node-author"')
# node group ends at the closing </g> that follows its label text (sigil <g> is nested)
end = h.index('</text>', h.index('data-node-label=""', start)) + len('</text>')
tail = h.index('</g>', end) + 4
grp = h[start:tail]
x, y, w, hh = map(float, re.search(r'<rect x="([\d.]+)" y="([\d.]+)" width="([\d.]+)" height="([\d.]+)"', grp).groups())
cx, cy = x + w / 2, y + 52
head = re.match(r'<g [^>]*>', grp).group(0)
title = re.search(r'<title>.*?</title>', grp).group(0)
label = re.search(r'<text data-node-label=.*?>(.*?)</text>', grp).group(1)
fs = re.search(r'data-node-label="".*?font-size="([\d.]+)"', grp).group(1)
icon = f'''
          <g aria-hidden="true" data-user-icon="">
            <circle cx="{cx}" cy="{cy - 22}" r="20" class="t-primary"/>
            <path d="M {cx-38} {cy+46} C {cx-38} {cy+8}, {cx-20} {cy+2}, {cx} {cy+2} C {cx+20} {cy+2}, {cx+38} {cy+8}, {cx+38} {cy+46} Z" class="t-primary"/>
          </g>'''
new = f'''{head}
          {title}
          {icon}
          <text data-node-label="" x="{cx}" y="{y + hh - 12}" class="t-primary" font-size="{fs}" font-weight="600" text-anchor="middle">{label}</text>
        </g>'''
h = h[:start] + new + h[tail:]
open(p, 'w', encoding='utf-8').write(h)

# Black-box view only: paint the `blackbox` node literally black with white text.
h = open(p, encoding='utf-8').read()
if '<g id="node-blackbox"' in h:
    s = h.index('<g id="node-blackbox"')
    e = h.index('data-node-id=', s + 30) if 'data-node-id=' in h[s + 30:] else len(h)
    e = h.find('<g id="node-', s + 10)
    e = e if e != -1 else len(h)
    g = h[s:e]
    g = re.sub(r'(<rect [^>]*?class="c-cloud"[^>]*?style=")', r'\1fill:#000;stroke:#000;', g)
    g = re.sub(r'(<text [^>]*?class="t-[a-z]+")', r'\1 style="fill:#fff"', g)
    g = re.sub(r'(<g [^>]*data-semantic-sigil[^>]*?)(>)', r'\1 style="color:#fff;stroke:#fff"\2', g, count=1)
    h = h[:s] + g + h[e:]
    open(p, 'w', encoding='utf-8').write(h)
