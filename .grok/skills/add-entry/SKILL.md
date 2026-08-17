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
- One node per functionally distinct system or principle. Do not add an author unless they occupy a unique slot.
- Holding / stub systems are allowed if marked pending in `refs`. Replace them when surveyed.
- Keep CSS/JS out of `viewer/index.html` if you touch the viewer.

## Steps

1. Search `data/nodes.yaml` for an existing id or label before creating one.
2. If this is a new tradition, consider `/cluster-research` first.
3. Add the node with `id`, `label`, `kind`, `cluster`, `description`, optional `role` and `refs`.
4. Add only the strongest edges. Every edge needs `from`, `to`, `type`, `directed`, `strength`, `note`. `versions` is optional.
5. Run `python analysis/paths.py FROM TO` or `python analysis/centrality.py` to confirm the graph still loads.
6. Do not start a web server unless asked. If you must, use a free high port such as `8765`, never 8000/3000/5000/8080.
