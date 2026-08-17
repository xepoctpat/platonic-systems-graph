---
name: organic-spine
description: >
  Run graph analysis and interpret hubs, communities, and feedback as a
  falsifiable spine proposal — never as proof that Plato is the backbone.
  Use when running centrality, communities, paths, feedback, looking for
  hinges, or the user runs /organic-spine.
user-invocable: true
---

# Organic spine

A spine is an **output**. High Platonic centrality in the current YAML is partly an artifact of how the graph was first seeded. Report what the numbers say, then say what would falsify it.

## Steps

1. From the repo root, with `.venv` active:

```
python analysis/centrality.py
python analysis/communities.py
python analysis/feedback.py
```

2. Treat **betweenness** as the hinge list (nodes that sit on many paths between clusters).
3. Treat **communities** as a proposed grouping. Compare to the `cluster` field — disagreement is interesting.
4. Treat **mixed green/red cycles** as places a cosmos can both run down and return. Recurring nodes on those cycles are spine candidates.
5. Use `python analysis/paths.py A B` for named collisions (`platonism`/`gnosticism`, `demiurge`/`gnostic-demiurge`, etc.).
6. `/viewer-server` so the inspector is up (http://127.0.0.1:8765/viewer/).

## What not to do

- Do not re-rank nodes into seven stages.
- Do not describe gold edges as “the spine.”
- Do not conclude “the Good is the attractor” from PageRank alone.
