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
│   └── versions.md           # what each diagram was for
├── analysis/                 # NetworkX → stdout
├── viewer/                   # 2D inspector (HTML + CSS + JS)
├── .grok/skills/             # repo-scoped Grok skills
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
python analysis/centrality.py
python analysis/communities.py
python analysis/paths.py
python analysis/paths.py platonism gnosticism
python analysis/feedback.py
```

High-betweenness nodes and mixed green/red cycles are **candidates** for an organic spine. Do not treat Platonic centrality as confirmation of a backbone.

## Viewer

Static files: `viewer/index.html`, `viewer/css/styles.css`, `viewer/js/app.js`. Browsers block `file://` fetches, so serve the **repository root** on a free high port (avoid 8000 / 3000 / 5000 / 8080):

```powershell
python -m http.server 8765
```

Open <http://localhost:8765/viewer/>.

- Node colour = cluster; system nodes are larger than principles.
- Filter by kind, cluster, and edge type.
- **Laterals only** shows cyan + orange (the V5 view).
- Click a node to focus its neighbourhood.
- Search matches label or id.

Keep CSS and JS out of the HTML.

## Extending

1. Research the cluster from sources (`/cluster-research`).
2. Add nodes and edges (`/add-entry`). Prefer laterals and collisions.
3. Re-run analysis (`/organic-spine`) and refresh the viewer.
4. Holding nodes (`mythology`, some system stubs) exist so laterals have a landing site. Replace them when the interior is surveyed.

One node per functionally distinct system or principle, not one node per author.

## Design constraints

- Solo-researcher maintainable.
- 2D inspector only. Time / influence is a later directed layer, not a spatial axis.
- YAML canonical; `.venv` and caches gitignored.
