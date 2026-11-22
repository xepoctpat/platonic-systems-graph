# Session handoff (2026-11-22, reading layer)

Stop point: **Graph still Hindu 3** (no tradition encode). The viewer now reads `data/view.json`: mix chords, seriation ring, slots, tours, community borders, hide-Platonic count, hinges list. Local serve is up at http://127.0.0.1:8765/viewer/ until stopped. Do not treat remaining Platonic betweenness as a proven spine.

This session: representation only. Vendored js-yaml 4.1.0 and cytoscape 3.30.4. Split the viewer into ES modules. Buddhist 2 was not started.

Viewer (live): https://xepoctpat.github.io/platonic-systems-graph/  
Local: http://127.0.0.1:8765/viewer/  (no-store when up. GitHub Pages needs this commit pushed, then a hard refresh)

## How to resume (next session)

```powershell
cd C:\Users\xepoc\OneDrive\Grok\platonic-systems-graph
.\.venv\Scripts\python.exe tools\serve.py check
.\.venv\Scripts\python.exe tools\validate.py
```

If check prints `down`: `python tools/serve.py start` in the background. Port **8765** only.

This folder is in `~/.grok/trusted_folders.toml` so project workflows resolve. Do not copy them to `~/.grok/workflows/`.

Then **one** pass: `/walk-roadmap` or `/walk-one {"item":"buddhist-2"}`. Or `/researcher` Buddhist 2 if you want the table in chat.

YAML is the source of truth. `ROADMAP.md` is leverage order. `data/research-queue.yaml` is the inventory. Do not invent a third list.

## Graph now (Hindu 3, audited)

211 nodes · 594 edges · 42 systems · 169 principles · 31 clusters.

| | |
|---|---|
| Edges | cyan 212 · gold 152 · magenta 95 · orange 56 · red 41 · green 38 |
| Validate | OK · **no isolates** |
| Betweenness top 5 | demiurge 0.195 · the-Good 0.154 · paradigm 0.138 · **receptacle 0.081** · information 0.075 |
| Platonic share of top 12 | **7/12** (count moved; not a proven spine) |
| Degree note | Tiamat still **#4**. `hinduism` is **#5** degree / **#10** betweenness. Ma'at still #9 betweenness. |

`hindu` cluster colour already existed; no `CLUSTER_COLOR` edit.

## What landed (Hindu 3)

Five darśana occupants, keep_ids only. No new system, no new cluster, no gold to the Demiurge.

| id | Slot | Laterals |
|---|---|---|
| `maya` | adhyāsa / mithyā overlay | magenta → prakṛti, Devī |
| `apaurusheya` | authorless Vedic injunction | orange → ṛta; magenta → genesis-creator |
| `paramanu` | Vaiśeṣika atom | magenta → receptacle, prakṛti |
| `kaivalya` | isolation-exit | gold ← Sāṃkhya pair; magenta → escape-gnosis, fanāʾ/baqāʾ, Brahman |
| `nyaya-ishvara` | inferred product-designer | orange → paramāṇu, apauruṣeya, Brahmā; magenta → unmoved mover, Śiva |

Five cyan interiors from `hinduism` to those five. Edge mix this pass: cyan +5 · gold +1 · magenta +10 · orange +4.

## What stayed out

Avatāra lists, every Devī form, every Purāṇa, school stickers, pramāṇa/padārtha lists, person-nodes, Vedānta subschools, kalām atoms, Buddhist 2. `research-queue` `hinduism` remains **partial**.

## What this calendar day encoded

| Pass | Cluster | What landed | What stayed out |
|---|---|---|---|
| C | `mandaean` | Four Lives, Ruha, yardna, masbuta, Manda d-Hayyi | Hibil list, Ur, Seven/Twelve, John as a person |
| D | `norse` | Völuspá cycle | dwarf catalogue, every Æsir |
| D | `mesoamerican` | Popol Vuh cycle | Seven Macaw, every Xibalba lord, Mexica suns |
| D | `yoruba` | Ifá cosmogony | every orisha, 256 Odù, Santería |
| D | `hindu` + `vedic` | Brahmā, Viṣṇu, Śiva, Devī; Rudra stem | avatāra list, Kālī/Durgā/Mātṛkās, every Purāṇa |
| D | `hindu` | Māyā, apauruṣeya, paramāṇu, kaivalya, Nyāya Īśvara | every school, pramāṇa lists, Buddhist 2 |

Phase D stop was already met (Popol Vuh). Hindu 3 is a darśana lateral.

## Phase status

| Phase | Status |
|---|---|
| A Honest graph | Done (`mythology` hub gone; `validate.py` exists) |
| B Collisions | All 9 encoded. Share is now **7/12** Platonic — count only, not a spine proof |
| C Split interiors | Required done. Palamite / Hermetica only if a **new slot** |
| D Parallel peers | Norse, Popol Vuh, Ifá, Hindu 2, **Hindu 3** done. **Buddhist 2 next** |
| Viewer | Mix chords, seriation ring, slots, tours, communities, hide-Platonic, hinges. Vendored JS. `data/view.json` from validate |
| Workflows | Project-only under `.grok/workflows/` |

## Do next (one pass — after the weekly limit resets)

Do **not** start Buddhist 2 on leftover tokens. The live Pages site updates when this commit is pushed.

**Buddhist 2.** Pratītyasamutpāda and/or Yogācāra **only if a new slot**. Not every nikāya.

Already in the graph (do not duplicate):

- `vedic` — Ṛgvedic cycle, including Rudra
- `hinduism` — umbrella + Purāṇic operators + ṣaḍ-darśana occupants
- `brahman` — nirguṇa summit
- `purusha-prakriti` — Sāṃkhya pair
- `maya` / `apaurusheya` / `paramanu` / `kaivalya` / `nyaya-ishvara` — Hindu 3
- `brahma` / `vishnu` / `shiva` / `devi` — Hindu 2

After Buddhist 2: science cosmology only if distinct from entropy + ordered-time.

## Do not

- Start another tradition to “use the last tokens.”
- Avatāra lists, every Devī form, every Purāṇa, every darśana as a sticker.
- Fold Vedic into Hinduism or gold new gods to the Demiurge by default.
- Encode leftover names (Nabta, Inana, Uṣas, nomes, Mexica suns, Eshu).
- Treat remaining Platonic betweenness as a spine. 7/12 is a count, not a proof.
- Copy project workflows to `~/.grok/workflows/`.
- Put CSS/JS into `viewer/index.html`.

## Workflows (this repo only)

A workflow **cannot** launch another workflow. Sequential work is **inside** `/walk-one` (encode → validate → audit → snapshot). Standalone `/collision-audit` and `/spine-snapshot` are manual.

`/walk-one {"encode":false}` surveys and stops.

## Click in the viewer

**New** then a row, or permalink http://127.0.0.1:8765/viewer/#id=maya

Māyā ↔ prakṛti · Māyā ↔ Devī · Apauruṣeya ↔ ṛta · Apauruṣeya ↔ Genesis creator · Paramāṇu ↔ Receptacle · Kaivalya ↔ Escape Gnosis · Kaivalya ↔ fanāʾ/baqāʾ · Nyāya Īśvara ↔ Unmoved mover
