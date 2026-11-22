# Roadmap

Comparison sheet, not a spine. YAML is still the source of truth.
Walk `/researcher` → `/add-entry` → `python tools/validate.py` → `/organic-spine` → viewer.

**Do not:** rebuild a 7-stage Platonic ladder · encode every god · treat node count as the KPI · gold-edge new traditions to the Demiurge by default.

---

## Baseline (2026-08-18, after Zoroastrian pass)

Taken before Phase A edits. Compare later runs to this row.

| | |
|---|---|
| Graph | 137 nodes · 330 edges · 30 systems · 107 principles · 24 clusters |
| Edges | cyan 131 · gold 79 · orange 34 · magenta 33 · green 27 · red 26 |
| Connectivity | 1 undirected component · 0 isolates · 0 nodes without `refs` |
| Communities | 8 (greedy modularity) |
| Feedback | 2207 cycles of length 2–6 · SCC 130 + 2 |

Betweenness top 12 (hinge list — seed-biased):

| # | id | cluster | score |
|---|---|---|---|
| 1 | demiurge | platonic | 0.2148 |
| 2 | the-good | platonic | 0.1763 |
| 3 | intelligible-paradigm | platonic | 0.1503 |
| 4 | **mythology** | mythic | 0.0998 |
| 5 | eros | platonic | 0.0771 |
| 6 | becoming | platonic | 0.0767 |
| 7 | information | scientific | 0.0706 |
| 8 | ordered-time | platonic | 0.0688 |
| 9 | paleolithic-image | preliterate | 0.0636 |
| 10 | atum | egyptian | 0.0594 |
| 11 | osiris | egyptian | 0.0581 |
| 12 | egyptian-religion | egyptian | 0.0579 |

`mythology` at #4 is a V5 leftover bag, not a tradition. Plato still dominates because the graph was seeded there.

---

## Decision rules

- A candidate must occupy a **new slot** or create a **new collision**. Otherwise skip.
- One `/researcher` pass = one tradition, one slot-family, or one named present-day field. Corpus-complete, not culture-complete.
- Hinduism-scale lists are several passes. Nabta / Inana / Uṣas leftovers are optional increments, not a phase.
- Prefer orange / magenta / cyan to existing *non-Platonic* nodes.
- Stub systems may exist. A holding **hub** that ranks as a hinge may not.
- After each accepted batch: validate, then centrality. Paste what moved into `SESSION-HANDOFF.md`.

---

## Locked architecture (while the set is still small)

This is a **systems-theory feedback graph**, not a tree and not a graph-DB product.

| Layer | Decision | Not |
|---|---|---|
| Store | YAML. Binary typed edges only (`from` → `to`). | Neo4j, Kuzu, hyperedges |
| Flow | `gold` / `green` / `red` are **directed** (constitute, return, fall). | Numbered stages |
| Peer map | `cyan` / `magenta` / `orange` are **undirected** (same slot / inversion / hybrid). Drawn with marks both ways. | Treating laterals as ancestry |
| Emergence | A new finding is one more binary edge between existing nodes, **or** a new principle if 3+ actors occupy a new slot. | Storing an n-ary “link object” |
| Trajectory | A→…→B and loops are **query overlays** (Path view / `analysis/paths.py`). Same graph, painted hop-by-hop with arrows. | A second geometry or OneZoom tree packer |
| Renderer | Cytoscape.js until ~2k nodes. Field folds interiors; Path isolates a route. | Swap renderer “just in case” |

When a new edge closes a loop or a new hop appears, Path between the same two ids must change. That is the test.

---

## Phase A — Make the existing graph honest

Stop when: `mythology` is not in betweenness top 12, and `python tools/validate.py` fails on a dangling edge.

- [x] Write this file (comparison baseline locked)
- [x] `tools/validate.py` (duplicate ids, dangling edges, bad type/kind/strength)
- [x] Hook validate into `/add-entry` and the README
- [x] Viewer: serve-script copy, not `python -m http.server`
- [x] Viewer colours for `vedic`, `canaanite`, `preliterate`
- [x] Remove `mythology` hub (node + 7 edges). `norse-myth` becomes an honest isolate until Phase D
- [ ] Controlled `slot` field on principles — **optional, not started**
- [x] Phase A stop-check: centrality re-run 2026-08-18 after the hub cut

Non-optional Phase A work is done. Optional `slot` can wait until cyan/magenta start lying.

### After Phase A (2026-08-18)

| | |
|---|---|
| Graph | 136 nodes · 323 edges · 29 systems · 107 principles · 23 clusters |
| Edges | cyan 128 · gold 78 · magenta 33 · orange 31 · green 27 · red 26 |
| `mythology` still present? | no |
| Isolates | `norse-myth` (expected; Phase D) |
| Betweenness top 5 | demiurge 0.221 · the-good 0.201 · intelligible-paradigm 0.195 · **information 0.117** · eros 0.090 |
| What moved | bag hub gone; `information` is the new #4 hinge; `blombos-mark`, `symmetry-breaking`, `mystery-ascent` entered top 12 |
| Validate | `OK` + isolate warning. Dangling `from`/`to` is an `ERROR` (smoke-tested). |

Plato still dominates. That is remaining seed bias, not a leftover bag. Phase B is the next lever.

---

## Phase B — Collisions that can move the spine

Stop when: betweenness top 12 is no longer 8/12 Platonic principles, *or* you can name what would still have to be added to knock Plato off that list.

One pass each, in this order unless a named target overrides:

1. [x] Manichaeism — two principles, three times, three evocations, mixture
2. [x] Early China — Tian, Tianming, Dao, Yijing change
3. [x] Pythagoreanism — Philolaus limiters/unlimiteds + harmonia
4. [x] Aristotelianism + Stoicism as systems (principles already existed)
5. [x] Merkavah / Hekhalot — ascent, throne, Metatron
6. [x] Islamic philosophy — Necessary Existent
7. [x] Sufi interior — fanāʾ/baqāʾ (Junayd)
8. [x] Biblical increment — Hokhmah only (exile-time would duplicate `fallen-time`)
9. [x] Process thought as a system

Skip Nabta expansion. Skip Vedic also-rans unless a comparison is blocked.

### After Phase B (2026-08-18)

| | |
|---|---|
| Graph | 163 nodes · 411 edges · 37 systems · 126 principles · 28 clusters |
| Edges | cyan 156 · gold 104 · magenta 50 · orange 42 · green 31 · red 28 |
| Isolates | `norse-myth` |
| Betweenness top 5 | demiurge 0.211 · the-good 0.192 · intelligible-paradigm 0.181 · **information 0.098** · becoming 0.086 |
| Platonic share of top 12 betweenness | **8/12** (stop condition not met) |
| Degree newcomers | `dao`, `ahura-mazda`, `kenoma` now in total-degree top 12 |
| Validate | `OK` + isolate warning |

What would still knock Plato off the hinge list: denser non-Platonic laterals (Norse interior, Mesoamerica, Sethian/Valentinian split), not more Timaeus. `information` holding #4 is the first non-bag, non-Platonic hinge.

---

## Phase C — Split collapsed interiors

Stop when: `gnosticism` is not a single bag, and biblical/Christian increments have not duplicated creator / tohu / Logos.

- [x] Sethian vs Valentinian (parent `gnosticism` kept; Barbelo / Horos / Achamoth / two craftsmen)
- [x] Mandaeism — living baptismal peer (own cluster; not folded into Sethian)
- [ ] Christian apophatic / Palamite / Eckhart — only if V11 needs a new summit occupant
- [ ] Hermetica split (Poimandres vs Asclepius) only if the slot actually splits
- [x] Kabbalah ← Merkavah orange peer link (done with B5); do not re-encode Ein Sof

Required C work is done: `gnosticism` is no longer a single bag; Mandaeism is a peer. Optional C waits for a new summit or Hermetic slot.

### After Phase C start (2026-08-18, Gnostic split)

| | |
|---|---|
| Graph | 169 nodes · 433 edges · 39 systems · 130 principles |
| Isolates | `norse-myth` |
| Betweenness top 5 | demiurge 0.218 · **paradigm 0.183** · the-good 0.180 · information 0.095 · becoming 0.083 |
| Platonic share of top 12 betweenness | still 8/12 |
| What moved | kenoma into degree top 8; two craftsmen now a magenta pair |

### After Phase C (2026-08-18, Mandaeism)

| | |
|---|---|
| Graph | 178 nodes · 465 edges · 40 systems · 138 principles · 29 clusters |
| Edges | cyan 168 · gold 120 · magenta 63 · orange 45 · red 35 · green 34 |
| Isolates | `norse-myth` |
| Betweenness top 5 | demiurge 0.211 · the-good 0.186 · intelligible-paradigm 0.174 · **information 0.090** · becoming 0.080 |
| Platonic share of top 12 betweenness | still **8/12** |
| What moved | Tiamat and Ma'at into degree top 10 (yardna / Abatur laterals). Mandaean interior joins the Gnostic–Manichaean community; Ruha and Yardna join the first-water / matter community. |

### After Phase D start (2026-08-18, Völuspá)

| | |
|---|---|
| Graph | 185 nodes · 493 edges · 40 systems · 145 principles · 29 clusters |
| Edges | cyan 178 · gold 126 · magenta 69 · orange 47 · red 38 · green 35 |
| Isolates | **none** (`norse-myth` is connected) |
| Betweenness top 5 | demiurge 0.209 · the-good 0.180 · paradigm 0.164 · **information 0.087** · **receptacle 0.082** |
| Platonic share of top 12 betweenness | still **8/12** |
| What moved | Isolate gone. Tiamat into degree top 7; receptacle to betweenness #5 (gap/Ymir laterals). Norse splits: Ymir/Burr’s sons join the slain-first-being community; tree/fate/end join the time–return community. |

Phase D stop (extra-Eurasian cosmogony) is not met. Next: Mesoamerica or West Africa, or Hindu 2.

### After Phase D (2026-08-18, Popol Vuh)

| | |
|---|---|
| Graph | 193 nodes · 518 edges · 41 systems · 152 principles · 30 clusters |
| Edges | cyan 184 · gold 133 · magenta 74 · orange 50 · red 40 · green 37 |
| Isolates | none |
| Betweenness top 5 | demiurge 0.213 · the-good 0.170 · paradigm 0.155 · information 0.083 · receptacle 0.080 |
| Platonic share of top 12 betweenness | still **8/12** |
| What moved | Extra-Eurasian cosmogony on the ring. Tiamat degree #6; escape-gnosis into degree top 10; **genesis-creator** into betweenness top 12. Sky-sea stillness joins the first-water community; the rest of the book sits with Mandaean return vs Gnostic exit. |

Phase D stop condition is **met** (mythology gone; Popol Vuh is a named extra-Eurasian corpus). Remaining D items are further laterals, not the stop.

### After Phase D (2026-08-18, Ifá)

| | |
|---|---|
| Graph | 201 nodes · 545 edges · 42 systems · 159 principles · 31 clusters |
| Edges | cyan 195 · gold 141 · magenta 80 · orange 51 · red 41 · green 37 |
| Isolates | none |
| Betweenness top 5 | demiurge 0.213 · the-good 0.175 · paradigm 0.145 · information 0.080 · receptacle 0.077 |
| Platonic share of top 12 betweenness | still **8/12** |
| What moved | Tiamat to degree **#4**. Ma'at #8, Nun #10. Ifá splits: Olokun/Oduduwa with first waters; Olodumare/Obatala/Orunmila with Popol Vuh makers; ori with wyrd/tianming. |

### After Phase D (2026-08-18, Hindu 2)

| | |
|---|---|
| Graph | 206 nodes · 574 edges · 42 systems · 164 principles · 31 clusters |
| Edges | cyan 207 · gold 151 · magenta 85 · orange 52 · red 41 · green 38 |
| Isolates | none |
| Betweenness top 5 | demiurge 0.199 · the-good 0.160 · paradigm 0.138 · information 0.077 · receptacle 0.074 |
| Platonic share of top 12 betweenness | still **8/12** |
| What moved | Ma'at into betweenness **#9**. Tiamat still degree #4. Operators sat with ṛta / Ma'at / Asha / Yijing, not with first waters. Devī split from Brahman (community 4 vs 3). |

### After Phase D (2026-08-18, Hindu 3)

| | |
|---|---|
| Graph | 211 nodes · 594 edges · 42 systems · 169 principles · 31 clusters |
| Edges | cyan 212 · gold 152 · magenta 95 · orange 56 · red 41 · green 38 |
| Isolates | none |
| Betweenness top 5 | demiurge 0.195 · the-good 0.154 · paradigm 0.138 · **receptacle 0.081** · information 0.075 |
| Platonic share of top 12 betweenness | **7/12** (count moved; not a proven spine) |
| What moved | Receptacle overtook information for #4. `hinduism` entered betweenness **#10** and degree **#5**. Genesis-creator back at #12. Tiamat still degree #4; Ma'at still betweenness #9. No gold to the Demiurge. |

Next D: Buddhist 2 (pratītyasamutpāda / Yogācāra if a new slot) or science cosmology (only if distinct from entropy + ordered-time). Hinduism remains partial.

---

## Phase D — Parallel peers and second passes

Stop when: `mythology` is gone (done in A) **and** at least one extra-Eurasian cosmogony is encoded from a named corpus.

| Pass | Encode | Leave out | Done |
|---|---|---|---|
| Norse | Völuspá: Ginnungagap, Ymir, Yggdrasil, Ragnarök, wyrd | every named dwarf | [x] |
| Mesoamerica | one cycle (Popol Vuh *or* Mexica suns) | a decorative “Aztec” sticker | [x] |
| West Africa | Yoruba only with a named corpus in `refs` | a diversity flag | [x] |
| Hindu 2 | Śiva / Viṣṇu / Devī as operators | avatāra lists | [x] |
| Hindu 3 | darśana increment | every school | [x] |
| Buddhist 2 | pratītyasamutpāda and/or Yogācāra if new slot | every nikāya | [ ] |
| Science | cosmology only if distinct from entropy + ordered-time | every physicist | [ ] |

Mesopotamia leftovers (Inana, Atrahasis, netherworld) stay optional.

---

## Ad-hoc — Viewer readable at full graph

Done 2026-08-18. Compare against the old “every label + every edge at once” hairball.

- [x] Overlay legend (system vs principle, six edge types with meanings)
- [x] Auto labels: systems named; principles on zoom / hover / neighbourhood
- [x] Faint edges in the all-on view; full colour when a node is focused
- [x] Slightly looser cose layout; text outline on labels
- [x] Field vs Open interiors: hide same-cluster plumbing; keep cross-cluster findings labeled
- [x] Directed arrows on flow; both-way marks on peer maps; Path view paints A→…→B trajectories
- [x] Field hides cyan by default (the hairball); Loop paints a green/red cycle
- [x] Larger collapsible legend
- [x] Drop force layout. Field = school ring; click = radial mind map; Loop = circle; Path = rank. Same idea as wwm_toolkit charts: deterministic cards, not a drag-apart hairball.
- [x] URL hash `#id=…` so notes can point at a node
- [x] Cluster-aware layout (school ring + cluster blossoms; not cose)
- [x] Findings list + New overlay from `data/latest.yaml` (last accepted pass)
- [x] `analysis/report.py` → a replaceable spine snapshot
- [x] Pin or vendor js-yaml + cytoscape if offline viewing matters

Reading layer (viewer pass, no new nodes): Field chords show the type mix and use width for the count. Ring order is the seriation in `data/view.json`. Curated slots and tours read V7–V11. Community borders and the hide-Platonic component count are overlays. `python tools/validate.py` rewrites `data/view.json`.

## Phase E — Productize only what the graph needs

No backend, no database, no 3D, no timeline axis. Remaining items are listed under the ad-hoc viewer pass above.

---

## Success / failure

Succeeding when: hide `platonic` and the field is still connected; hinges include things like Asha, Ma'at, Tiamat, Tian, or a Manichaean mix — not a bag hub; communities disagree with `cluster` in interesting ways; empty traditions are empty on purpose.

Failing when: node count is the KPI; every new tradition grows a gold edge to the Demiurge; Hinduism or Egypt becomes an epithet dump; analysis is quoted as proving Plato.
