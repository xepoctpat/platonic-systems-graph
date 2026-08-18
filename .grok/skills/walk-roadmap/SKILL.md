---
name: walk-roadmap
description: >
  Walk ROADMAP.md: next unchecked phase item, survey, encode, validate,
  snapshot. Use when the user says continue, iterate, autonomous, AFK,
  walk the roadmap, or next phase.
user-invocable: true
argument-hint: next | phase letter | named item
---

# Walk the roadmap

`ROADMAP.md` is leverage order. `data/research-queue.yaml` is the inventory. Do not invent a third list.

## When

- User said continue / iterate / autonomous / AFK / next phase, **or**
- `/walk-roadmap`, **or**
- a phase letter or named item (Manichaeism, early China, …).

Encode without waiting. “Add them” is implied.

## Loop (one item per pass)

1. `/viewer-server` if down.
2. Read `ROADMAP.md`. Take the next unchecked Phase B/C/D line, unless the user named an item.
3. `/researcher` that item (web, corpus-complete). Then `/add-entry`.
4. `python tools/validate.py`. Fix errors. Add a viewer colour if the cluster is new.
5. `python analysis/centrality.py`. Tick the ROADMAP box. Refresh the latest “After …” row. Update `SESSION-HANDOFF.md`.
6. Stop after **one** tradition unless the user said iterate / autonomous / AFK — then start the next item.

## Hard limits

Same as `/researcher`: one tradition or slot-family per pass; no bag hubs; no encyclopedia; Hinduism-scale lists stay split. Skip leftover names (Nabta, Inana, Uṣas) unless a comparison is blocked.

Phase lists live only in `ROADMAP.md`. This skill does not copy them.

## Workflows

Same loop, as background runs (`.grok/workflows/`):

- `/walk-one` — one tradition, encode implied (`{"item":"hindu-3"}` or omit item; `{"encode":false}` to survey only). After a successful write it **automatically** validates, runs the four audit skeptics, then snapshots and interprets. Gate reject or validate ERROR stops the chain.
- `/survey-tradition` — candidate table, no YAML (does not chain)
- `/collision-audit` — same skeptics, standalone (when you are not walking)
- `/spine-snapshot` — measure + interpret, standalone (`{"write":true}` updates the After row)

A workflow cannot launch another workflow. The chain lives inside `walk-one` as conditions, not as `/collision-audit` after `/walk-one`. Skills stay the conversational path. Do not invent a third list.
