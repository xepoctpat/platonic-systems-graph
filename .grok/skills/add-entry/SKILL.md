---
name: add-entry
description: >
  Add or edit a node or typed edge in this systems graph. Use when the user
  wants to add a node, add an edge, extend the graph, encode a collision, or
  runs /add-entry.
user-invocable: true
argument-hint: node or edge to add
---

# Add a graph entry

YAML in `data/nodes.yaml` and `data/edges.yaml` is the only source of truth. Read the schema comments at the top of those files before editing. Do not invent a second schema here.

## Rules

- `kind` is `system` (peer tradition/field) or `principle` (operator, event, slot).
- `cluster` is a peer label, never a rank. Do not add `stage` or `domain`.
- A new node does **not** have to touch Plato. Prefer a lateral (orange) or collision (magenta) to something already in the field.
- Gold is constitutive or genealogical dependence in any historical direction — not “descends from Plato.”
- Quote YAML `note` / `description` values that contain `: `.
- One node per functionally distinct system or principle, **or** per actor in a named primary cycle (corpus-complete). Not every epithet or local god.
- Hinduism-scale lists are split across passes. Do not add an author unless they occupy a unique slot.
- Holding / stub systems are allowed if marked pending in `refs`. Replace them when surveyed. Do not add a bag hub whose only job is laterals.
- Keep CSS/JS out of `viewer/index.html` if you touch the viewer.

## Steps

1. Search `data/nodes.yaml` for an existing id or label before creating one.
2. If this is a new tradition, use `/researcher` (web) or `/cluster-research` (already-sourced).
3. Add the node with `id`, `label`, `kind`, `cluster`, `description`, optional `role` and `refs`.
4. Add only the strongest edges. Every edge needs `from`, `to`, `type`, `directed`, `strength`, `note`. `versions` is optional.
5. Run `python tools/validate.py`. Fix errors before anything else. Then `python analysis/paths.py FROM TO` or `python analysis/centrality.py` if you need a path or hinge check.
6. After a write, `/viewer-server` so the inspector is up on http://127.0.0.1:8765/viewer/
