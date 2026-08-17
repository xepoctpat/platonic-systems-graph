# Platonic Systems Graph

A minimal, version-controllable knowledge graph for research on Plato’s cosmological system (primarily *Timaeus*, *Statesman*, and *Symposium*) and its relationships with later mystical/occult, scientific/philosophical, and religious/mythological systems.

The graph is built to sit under a set of eleven diagrams (V1–V11). Those diagrams treat the Timaean spine as a systems-theoretic backbone — hierarchy, feedback, attractors, symmetry breaking, entropy, and negative entropy — and then map how other systems root in it, mirror it, invert it, hybridize with it, or return along it.

This repository is intentionally lean: YAML in, NetworkX on the command line, one static viewer (HTML + CSS + JS, no build). No backend, no database.

## Contents

```
platonic-systems-graph/
├── diagrams/           # the eleven final V1–V11 .jpg files
├── data/
│   ├── nodes.yaml      # source of truth for nodes
│   ├── edges.yaml      # source of truth for typed relationships
│   └── versions.md     # what each diagram version contains
├── analysis/           # NetworkX scripts (print to stdout)
├── viewer/
│   ├── index.html      # markup only
│   ├── css/styles.css
│   └── js/app.js
├── requirements.txt
└── README.md
```

## Setup

Python 3.10+ is enough. On Windows, from this directory:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
```

On macOS / Linux:

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
pip install -r requirements.txt
```

If PowerShell blocks activation, run `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` once, or call the interpreter directly: `.\.venv\Scripts\python.exe analysis\centrality.py`.

## Data model

`data/nodes.yaml` and `data/edges.yaml` are the single source of truth. Edit those files; do not duplicate the graph elsewhere.

### Nodes

| Field | Meaning |
|---|---|
| `id` | Stable kebab-case key. Referenced by edges. |
| `label` | Display name. |
| `domain` | `platonic` \| `mystical` \| `scientific` \| `religious` |
| `stage` | `1`–`7` on the core Platonic spine only. |
| `role` | Optional systems-theoretic function (`attractor`, `governor`, `noise`, …). |
| `description` | Short research note. |
| `refs` | Optional textual citations (dialogues, later sources). |

### Edges

| Field | Meaning |
|---|---|
| `from`, `to` | Node ids. |
| `type` | Visual / analytic relation class (see below). |
| `directed` | `true` for constitutive or causal arrows; `false` for symmetric maps. |
| `strength` | `0.0`–`1.0`. Use high values for the strongest, diagram-central links. |
| `versions` | Which of V1–V11 this edge is drawn from. |
| `note` | One-sentence rationale. |

Edge types follow the diagram colour language:

| Type | Colour sense | Relation |
|---|---|---|
| `gold` | direct rooting | Constitutive dependence; usually higher → lower on the spine, or a later system rooted in a Platonic node. |
| `cyan` | isomorphism | Structural analogy without identity. |
| `magenta` | contrast / inversion | Same slot, opposite valuation (the V7–V11 tensions live here). |
| `green` | return / integration / negative feedback | Ascent, restoration, homeostatic closure. |
| `red` | fall / positive feedback / shattering | Runaway, exile, dismemberment, cosmic run-down. |
| `orange` | hybrid / lateral | Cross-domain mixing that does not pass through the spine. |

Diagram inventory: [data/versions.md](data/versions.md).

## Analysis

All four scripts load the YAML through `analysis/graph_io.py` and print to the terminal. Run them from the repository root with the virtual environment active.

```powershell
python analysis/centrality.py
python analysis/communities.py
python analysis/paths.py
python analysis/paths.py the-good becoming
python analysis/feedback.py
```

| Script | What it reports |
|---|---|
| `centrality.py` | Degree, betweenness, PageRank. High-centrality nodes are the research “hubs”. |
| `communities.py` | Greedy modularity communities (undirected projection). |
| `paths.py` | Default: a few theoretically loaded shortest paths. Optional: `from_id to_id`. |
| `feedback.py` | Directed cycles and a coarse split into return (green) vs fall (red) loops. |

Add nodes or edges in YAML, re-run the script. That is the whole workflow.

## Viewer

The viewer is static markup plus separate assets: `viewer/index.html`, `viewer/css/styles.css`, `viewer/js/app.js`. It fetches the YAML over HTTP (browsers block `file://` fetches), so serve the **repository root**:

```powershell
python -m http.server 8000
```

Then open <http://localhost:8000/viewer/>.

- Colour of a node = domain; colour of an edge = type.
- Checkboxes filter by domain and edge type.
- Click a node or edge for its note.
- The layout is force-directed (`cose`). Drag nodes; use **Fit** if the graph walks off-canvas.

Cytoscape.js and js-yaml are loaded from a CDN. There is no npm build. Keep CSS and JS out of the HTML when you change the viewer.

## Extending the graph

1. Add or edit a node in `data/nodes.yaml`.
2. Add edges in `data/edges.yaml` with a `versions` citation.
3. If you introduce a new diagram, add a `V12` section to `data/versions.md` and cite it on the new edges.
4. Drop the corresponding `.jpg` in `diagrams/` (current names: `V1_Core_Platonic_Spine.jpg` … `V11_Highest_Principle_Tension.jpg`).
5. Re-run the analysis scripts and refresh the viewer.

Keep new nodes coarse. This is a systems graph, not a doxographical encyclopedia: one node per *functionally distinct* principle or later system, not one node per author.

## Design constraints

- Solo-researcher maintainable.
- YAML is canonical; generated artifacts (if any) are gitignored.
- Scripts stay short and readable.
- No web framework, no database, no notebook required to use the repo.
