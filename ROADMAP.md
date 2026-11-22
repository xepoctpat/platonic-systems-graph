# Roadmap

Living note. Replace a section when the picture changes. Date the change in **Now**. This file is not a phase ladder and not a spine.

The point is emergence, and emergence means laterals. Schools and concepts that look unrelated can share an origin. Ma'at, ṛta, and Asha are the pattern: Egypt, Vedic India, and Iran, one order that must be kept, and no claim that one school descended from another. The work is finding those sharings. It is not a history of each school.

The comparison sheet stays. It is the check that a reading has not collapsed into a single spine. It is not the picture of emergence.

Walk `/researcher` → `/add-entry` → `python tools/validate.py` → `/organic-spine` → viewer.

**Do not:** encode every god · treat node count as the KPI · write the chronicle of a school and call it emergence · draw every lateral at once · read a likeness as descent · bring the 3D view back.

---

## Now (2026-11-22)

| | |
|---|---|
| Graph | 242 nodes · 628 edges · 42 systems · 200 principles · 33 clusters |
| Edges | cyan 225 · gold 154 · magenta 102 · orange 68 · red 41 · green 38 |
| Store | `data/nodes.yaml` and `data/edges.yaml` |
| Sheet | comparison check, in the viewer |
| 3D | retired. Loops are planar |
| Drawings | Mermaid only. Documented laterals are typed. Unclassified clusters are a loose subgraph with generic links |
| Open reading | Ma'at · ṛta · Asha re-read and skipped. Shared attribute. The three cyan edges stay. No fourth lateral. Ptahhotep, Ṛgveda 5.15.2, and Yasna 28.11 each name only their own word. Restoration (Tutankhamun stela, Yasna 30.5) stays a side finding inside each tradition. Solar table drawn for Sūrya, Helios, Re, Mitra. Mitra ~ Jesus was tested and stayed unclassified. No Jesus node. No edge. The drawing has no link. Avestan Miθra keeps the cyan covenant, the orange eye, the orange kingship, and the cyan chariot (Ṛgveda 5.63.1 and Yt. 10.124–125). The companion is an orange partial swap: Varuṇa (Ṛgveda 5.72.1 and 5.72.3) versus Ahura (Yt. 10.145). Yt. 10.13’s before-the-sun crossing does not fill the Vedic cell. Roman Mithras skipped. Unclassified. Statius, Thebaid 1.719–720. No node. No edge. Eleusis skipped. Unclassified. Homeric Hymn to Demeter 480 (Evelyn-White 1914): blessedness of the one who has seen these things. No node. No edge. The cyan interior edge stays. `mystery-religions` stays stub |

`nabta-playa` stays unlinked on purpose. Palamite and Hermetica wait until a lateral actually opens.

---

## The pattern

One origin. A lateral to a school that did not look related. An attribute they share (order, craftsman, sun, matter, return).

The same pattern repeats at every scale. Inside one school, between two schools, across a cluster of clusters. A smaller drawing is not a different kind of fact. That is the fractal. Do not invent a second geometry for the small scale.

A likeness is an attribute, not a genealogy. Mitra and Jesus can share a solar parallel without either being the parent of the other. Record the likeness as a lateral when a source supports the shared attribute. Do not draw an arrow of descent for it.

When three or more actors share an origin that has no node yet, add the principle and the laterals. That is a new slot. A gold edge that only continues one school’s own motion is not this finding.

---

## Representation

Mermaid is the only drawing for a finding. Two kinds. Neither is the whole graph. No force-directed view. No 3D. Loops are planar.

The reading is a tab, not a viz-heavy field. One tab is one origin. The chart carries the typed marks only. The claim, the attribute table, what is confirmed, and what is still open sit beside the chart, as in the quest cards of `wwm_toolkit`. A paragraph does not go inside a node.

### Documented laterals

A lateral that already has a type. Draw it as a relation with a shape, not as a straight bar.

| Relation | Drawing |
|---|---|
| Direction (constitute, fall, return) | one arrow |
| Mutual reinforcement | double-headed arrow |
| Reinforcing loop (positive feedback) | a cycle, arrow around the arc |
| Balancing loop (negative feedback) | a cycle, arrow around the arc, marked balancing |
| Recursive loop | a cycle that returns to its own start |
| Same slot, inversion, hybrid | a lateral mark both ways, no descent arrow |

Closed feedback is an arc. An open sharing is not forced into a circle. A documented picture shows one origin, the schools it reaches, and the typed laterals among them. Ma'at · ṛta · Asha is the first one to draw this way.

### Unclassified clusters

A set of schools that keep meeting and do not yet have a type. Draw a loose Mermaid subgraph with generic links. No arrow that pretends the type is known. When a cluster earns a type, it leaves this drawing and becomes a documented lateral.

Field stays folded for browsing. One origin at a time is how the picture stays readable. The comparison sheet checks that the reading has not collapsed into a spine. It is not where a lateral is discovered.

---

## Store

YAML is the store: `data/nodes.yaml`, `data/edges.yaml`. Binary edges, `from` and `to`, one type each.

That holds while a finding is one lateral or one new principle. It gets thin when a node carries many attributes, when a likeness is Mitra ~ Jesus rather than a single typed edge, and when the question is “who else shares this attribute?” across the whole graph. At that point add a queryable store, SQLite or Neo4j. YAML stays the import format. Do not keep two sources of truth. Do not switch before a real query hurts.

---

## Adding

One pass is one tradition, one slot, or one likeness. Corpus-complete, not a whole culture. Hinduism-scale lists stay several passes.

A candidate has to show a shared origin between things that do not already look related, or name a new slot they occupy. Otherwise skip.

After a batch: `python tools/validate.py`, then note what the new lateral changed, in **Now** and in `SESSION-HANDOFF.md`.

---

## Open

- [x] Mermaid for Ma'at · ṛta · Asha: open cyan sharing in `RESEARCH_PLAN.md`. Not a loop. Not yet a viewer tab.
- [ ] A second drawing for one unclassified cluster: loose Mermaid, generic links, no invented type. The Mitra · Jesus card is an open question with no link, not a typed lateral.
- [x] Remove the 3D button from the viewer. The button, canvas, and space.js are gone; loops stay planar.
- [ ] Keep the comparison sheet as the spine check only.
- [ ] Revisit the store when likenesses and attributes stop fitting a single typed edge. YAML imports into SQLite or Neo4j. Not before.
