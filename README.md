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
│   ├── slots.yaml            # curated collisions (not a stage index)
│   ├── tours.yaml            # V7–V11 illustrations
│   ├── view.json             # derived reading; validate rewrites it
│   └── versions.md           # what each diagram was for
├── analysis/                 # NetworkX → stdout
├── tools/serve.py            # local viewer on 127.0.0.1:8765
├── tools/validate.py         # schema + dangling-edge check
├── viewer/                   # 2D inspector (HTML + CSS + ES modules)
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

- Node colour = cluster; system nodes are larger (pale ring) than principles. **Communities** recolours the border only. Fill stays the cluster.
- Default **Field** shows all six edge types. **Heavy** keeps each school’s three strongest lines among pairs with at least three findings. **All pairs** draws every pair. Schools sit on a ring ordered by shared findings (a layout, not a chronology). A line’s words are the mix, and its width is the count. Rest on the line or click it. **Findings** still lists every cross-cluster edge.
- **Open interiors** shows every edge, schools in that same order. Click a node to open one school: same-cluster principles on the left, other clusters on the right, grouped by relation.
- **Slots** lists curated collisions (`data/slots.yaml`). **Tours** lays V7–V11 left to right. A tour is an illustration, not the law of the graph.
- **Path**: two clicks, explicit A→…→B. **Loop**: one click, a short cycle (prefers mixed green/red). Both are query overlays.
- Directed flow has one arrow. Peer maps have arrows both ways. An aggregated school line has no arrow.
- Legend groups Flow and Map. Cluster colour stays in the cluster filter. **How to** in the right sidebar is the tutorial.
- Filter by kind, cluster, and edge type.
- **Laterals only** shows cyan + orange.
- Click a node to focus its neighbourhood. The sidebar splits inside / outside and shows each note.
- **Findings** lists every cross-cluster edge. **New** highlights the last accepted pass (`data/latest.yaml`).
- **Hinges** is the unweighted betweenness top 12. It does not resize the ring. **Hide Platonic** unchecks that cluster and reports the precomputed component count (`data/view.json`). One component is the success test.
- Permalink: `http://127.0.0.1:8765/viewer/#id=maya`
- Search matches label or id.

`python tools/validate.py` rewrites `data/view.json` from the YAML. The viewer reads that file for the ring order, communities, hinges, slots, and tours. js-yaml and Cytoscape are vendored in `viewer/vendor/` (js-yaml 4.1.0, cytoscape 3.30.4).

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
