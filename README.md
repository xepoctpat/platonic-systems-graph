# Systems graph

A lean, version-controllable knowledge graph of cosmological and related systems. Plato is an **entry cluster**, not the axis. Gnosticism is a colliding peer. Other traditions attach by laterals, hybrids, and inversions. If a spine exists, analysis has to find it.

Diagrams in `diagrams/` are illustrative. V5 is the growth pattern that stopped forcing a Platonic ladder. YAML is the source of truth.

No backend, no database, no build step.

## Contents

```
├── diagrams/                 # V1–V11 illustrations
├── data/
│   ├── nodes.yaml            # systems + principles
│   ├── edges.yaml            # typed relations
│   ├── research-queue.yaml   # survey order (not a spine)
│   ├── latest.yaml           # last accepted pass (viewer New overlay)
│   └── versions.md           # what each diagram was for
├── analysis/                 # NetworkX → stdout
├── tools/serve.py            # local viewer on 127.0.0.1:8765
├── tools/validate.py         # schema + dangling-edge check
├── viewer/                   # 2D inspector (HTML + CSS + JS)
├── .grok/skills/             # researcher, add-entry, walk-roadmap, …
├── .grok/workflows/          # walk-one, survey-tradition, collision-audit, spine-snapshot
├── ROADMAP.md                # phases to compare later runs against
├── requirements.txt
└── README.md
```

## Setup

Python 3.10+. From this directory:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
```

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
pip install -r requirements.txt
```

## Data model

`data/nodes.yaml` and `data/edges.yaml` are canonical. Schema comments live in those files.

| Node field | Meaning |
|---|---|
| `id` | Stable kebab-case key |
| `label` | Display name |
| `kind` | `system` (peer tradition / field) or `principle` (operator, event, slot) |
| `cluster` | Peer group label, **not a rank** (`platonic`, `gnostic`, `hermetic`, …) |
| `role` | Optional functional hint |
| `description`, `refs` | Research note and citations |

There is no `stage` field. A new node does not have to touch Plato.

| Edge type | Relation |
|---|---|
| `gold` | Constitutive or genealogical dependence (any direction of history) |
| `cyan` | Isomorphism |
| `magenta` | Contrast / inversion |
| `green` | Return / integration / negative feedback |
| `red` | Fall / positive feedback / shattering |
| `orange` | Hybrid / lateral (the default way the graph grows) |

`versions` on an edge is an optional pointer at an illustration, not a requirement.

## Analysis

```powershell
python tools/validate.py
python analysis/report.py
python analysis/centrality.py
python analysis/communities.py
python analysis/paths.py
python analysis/paths.py platonism gnosticism
python analysis/feedback.py
python -m unittest tests.test_graph
```

High-betweenness nodes and mixed green/red cycles are **candidates** for an organic spine. Do not treat Platonic centrality as confirmation of a backbone.

## Viewer

Static files: `viewer/index.html`, `viewer/css/styles.css`, `viewer/js/app.js`. Browsers block `file://` fetches. From the repo root:

```powershell
python tools/serve.py          # start (no-op if already up)
python tools/serve.py check
python tools/serve.py stop
```

Live (GitHub Pages): <https://xepoctpat.github.io/platonic-systems-graph/>

Local: open <http://127.0.0.1:8765/viewer/>. Or tell the agent `/viewer-server` or “start the server.” Port is 8765 on localhost only — not 8000 / 3000 / 5000 / 8080. `tools/serve.py` sends `Cache-Control: no-store` for YAML/JS/CSS so local edits show without a hard refresh.

- Node colour = cluster; system nodes are larger (pale ring) than principles.
- Default **Field** is a **ring of schools** (mind map, not a force hairball). A line between schools is an aggregated finding. Click a school for a radial neighbourhood. **Loop** places the cycle on a circle. **Path** is left-to-right.
- **Open interiors** shows every edge. Click a node to open one school.
- **Path**: two clicks, explicit A→…→B. **Loop**: one click, a short cycle (prefers mixed green/red). Both are query overlays.
- Directed flow has one arrow. Peer maps have arrows both ways.
- Legend is larger and can be collapsed.
- Overlay legend (large, collapsible). **How to** in the right sidebar is the tutorial.
- Filter by kind, cluster, and edge type.
- **Laterals only** shows cyan + orange (the V5 view).
- Click a node to focus its neighbourhood. The sidebar lists every connection.
- **Findings** lists every cross-cluster edge. **New** highlights the last accepted pass (`data/latest.yaml`).
- Permalink: `http://127.0.0.1:8765/viewer/#id=maya`
- Search matches label or id.

Keep CSS and JS out of the HTML.

## Extending

1. Web survey one tradition or slot (`/researcher`). Walks `data/research-queue.yaml` from the earliest sourced cosmology unless you name a target. Small batches, sources first.
2. Encode accepted nodes (`/add-entry`). Prefer laterals and collisions. Run `python tools/validate.py`.
3. Re-run analysis (`/organic-spine`) and keep the viewer up (`/viewer-server`).
4. System stubs (`sufism`, `theosophy`, `jungian-psychology`) may exist as landing sites. Replace interiors when surveyed. Do not add a bag hub.
5. Compare progress to `ROADMAP.md`.

One node per functionally distinct system or principle, not one node per author.

## Design constraints

- Solo-researcher maintainable.
- 2D inspector only. Time / influence is a later directed layer, not a spatial axis.
- YAML canonical; `.venv` and caches gitignored.
