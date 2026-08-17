---
name: cluster-research
description: >
  Survey a tradition or field into peer systems and principles from sources,
  not from the V1–V11 diagrams. Use when identifying clusters, researching a
  system’s interior, expanding Gnostic/Hermetic/Kabbalistic/scientific/religious
  coverage, or the user runs /cluster-research.
user-invocable: true
argument-hint: tradition or cluster to survey
---

# Cluster research

Naming nodes is source work. The JPGs in `diagrams/` are illustrations. Do not transcribe them as the inventory.

## Stance

- Traditions are peers. Platonism is an on-ramp, not the sun.
- Gnosticism is a collision (same slots, opposite valuation), not a fallen copy of Timaeus.
- There is no required spine. Do not assign stage numbers.
- Interiors are uneven: a stub `system` node is better than a fake principle list.

## Steps

1. Read existing nodes in that `cluster` in `data/nodes.yaml` so you do not duplicate ids.
2. Work from primary or standard sources (dialogues, tractates, named scientific papers). Record them in `refs`.
3. Split **system** (the tradition as a peer) from **principles** (distinct operators/events/slots only).
4. Ask what slots the tradition actually occupies: craftsman, matter, time, ascent, summit, fall, return. Only create a principle if the tradition has a distinct occupant.
5. Link first to peers — magenta collision, cyan isomorphism, orange hybrid. A gold edge to a Platonic node is allowed only as real genealogy, and is never required.
6. Mark unfinished interiors (`refs` containing “pending” or “survey”) instead of inventing structure.
7. Apply `/add-entry` to write the YAML.

If the user names no tradition, propose the next stub that is most connected on V5 laterals and least surveyed (Sufism, Mesopotamian, Norse, Theosophy interiors).
