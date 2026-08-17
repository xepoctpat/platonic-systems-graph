---
name: researcher
description: >
  Web-backed survey of one tradition, slot-family, or present-day field into
  candidate graph nodes. Use when the user wants to crawl/search for nodes,
  expand historical coverage, find data points, survey a system from the web,
  or runs /researcher. Do not vacuum all of history in one pass.
user-invocable: true
argument-hint: tradition, slot, or period to survey
---

# Researcher

Use the web to **propose** nodes. Do not dump encyclopedias into YAML.

This graph is a field of peer systems and collisions, not a timeline of everyone who ever thought. Plato is an on-ramp. Gnosticism is a collision. An organic spine is an output.

## Hard limits

- One pass = **one** tradition, **or** one slot-family (craftsman / matter / time / ascent / summit / fall / return), **or** one named present-day field.
- **Corpus-complete, not culture-complete.** Encode every actor in a *named primary cycle or list* (Heliopolitan Ennead, Baal Cycle, Enūma Eliš, Ṛgvedic major deities, later a Purāṇic set). Do not encode every nome, epithet, village god, or avatāra.
- Hinduism and similar explosions are **several passes** (Vedic, then epic-Purāṇic, then darśana), never one dump of “all gods.”
- A named cycle may exceed 12 nodes if the corpus is that size. Still no encyclopedia sweep.
- Systems before principles. A stub `system` with real refs beats invented principles.
- No living individuals as the unit of analysis. A named school or book is fine; a person-brand is not.
- No node without a `refs` entry you actually opened or can name.
- Do not write YAML until the user accepts the batch, unless they said “add them.”
- Then use `/add-entry`. After a write, `/viewer-server` so they can see it.

## Queue

`data/research-queue.yaml` is the list to walk. It is chronological by earliest *sourced* cosmology, not a spine.

- If the user names a tradition, slot, or id, do that item.
- If they say “start from the beginning” / “next” / give no target, take the **earliest `empty` or `stub`** item in that file.
- After a batch is accepted and written, set that item to `partial` or `surveyed`.
- Do not invent a second queue.

## Steps

1. `/viewer-server` if the inspector is down.
2. Read `data/research-queue.yaml`, then existing nodes in that cluster in `data/nodes.yaml`.
3. Search the web (`web_search`, then `open_page` on 2–5 primary or standard sources — dialogues, tractates, critical editions, review articles). Skip the V1–V11 JPGs as inventory.
4. For each candidate, fill:

   `id` · `kind` (system|principle) · `cluster` · slot · one-sentence claim · `refs` · suggested edges (type + existing `to`/`from`)

5. Show the batch as a table. Flag weak or holding items. Say what you did **not** add and why.
6. Stop. Wait for accept / reject / “add them.”

## What “present day” means

Allowed: a living *system* that occupies a slot (process thought, modern cosmology, information theory, contemporary Gnostic reception, perennialist theosophy).

Not allowed: news, influencers, or every 20th-century commentator.

If the user asks to “find all nodes throughout history,” do not sweep. Walk `data/research-queue.yaml` from the earliest empty/stub item. Preliterate items are archaeological (sites/images), not reconstructed myths. One pass, then stop.
