# Session handoff (2026-08-18, wrap — weekly limit)

Stop point: **Known-good is Hindu 2.** Do not start a new tradition this session. A `walk-one` for Hindu 3 may still be in **Gate** on the *old* script (survey → gate → encode → snapshot; **no** auto-audit). If that run writes YAML after you leave, run `python tools/validate.py` before trusting it.

Viewer (live): https://xepoctpat.github.io/platonic-systems-graph/  
Local: http://127.0.0.1:8765/viewer/  (hard-refresh if JS is cached)

## How to resume (next session)

```powershell
cd C:\Users\xepoc\OneDrive\Grok\platonic-systems-graph
.\.venv\Scripts\python.exe tools\serve.py check
.\.venv\Scripts\python.exe tools\validate.py
```

If check prints `down`: `python tools/serve.py start` in the background. Port **8765** only.

This folder is in `~/.grok/trusted_folders.toml` so project workflows resolve. Do not copy them to `~/.grok/workflows/`.

Then **one** pass: `/walk-roadmap` or `/walk-one {"item":"hindu-3"}` (new script: encode → validate → audit → snapshot). Or `/researcher` Hindu 3 if you want the table in chat.

YAML is the source of truth. `ROADMAP.md` is leverage order. `data/research-queue.yaml` is the inventory. Do not invent a third list.

## Graph now (Hindu 2, audited)

206 nodes · 574 edges · 42 systems · 164 principles · 31 clusters.

| | |
|---|---|
| Edges | cyan 207 · gold 151 · magenta 85 · orange 52 · red 41 · green 38 |
| Validate | OK · **no isolates** |
| Betweenness top 5 | demiurge 0.199 · the-Good 0.160 · paradigm 0.138 · information 0.077 · receptacle 0.074 |
| Platonic share of top 12 | still **8/12** |
| Degree note | Tiamat is **#4**. Ma'at #7 degree / **#9 betweenness**. |

`collision-audit` on Hindu 2: **4/4 axes clean, 0 issues** (`brahma`, `vishnu`, `shiva`, `devi`, `rudra`).

`spine-snapshot` (report only, no ROADMAP rewrite): Ma'at is the new hinge; operators sit with ṛta / Ma'at / Asha / Yijing (community 4); Brahman stayed in the summit mix (community 3). Knocking Plato off the list needs a peer mesh, not more Timaeus.

## What this calendar day encoded

| Pass | Cluster | What landed | What stayed out |
|---|---|---|---|
| C | `mandaean` | Four Lives, Ruha, yardna, masbuta, Manda d-Hayyi | Hibil list, Ur, Seven/Twelve, John as a person |
| D | `norse` | Völuspá cycle | dwarf catalogue, every Æsir |
| D | `mesoamerican` | Popol Vuh cycle | Seven Macaw, every Xibalba lord, Mexica suns |
| D | `yoruba` | Ifá cosmogony | every orisha, 256 Odù, Santería |
| D | `hindu` + `vedic` | Brahmā, Viṣṇu, Śiva, Devī; Rudra stem | avatāra list, Kālī/Durgā/Mātṛkās, every Purāṇa, darśana |

Phase D stop is met (Popol Vuh). Ifá and Hindu 2 are extra laterals.

## Phase status

| Phase | Status |
|---|---|
| A Honest graph | Done (`mythology` hub gone; `validate.py` exists) |
| B Collisions | All 9 encoded. Stop failed on purpose (still 8/12 Platonic) |
| C Split interiors | Required done. Palamite / Hermetica only if a **new slot** |
| D Parallel peers | Norse, Popol Vuh, Ifá, Hindu 2 done. **Hindu 3 next** |
| Viewer | Field / Path / Loop usable. Open: `#id=` permalinks, `analysis/report.py`, vendor JS |
| Workflows | Project-only under `.grok/workflows/` |

## Do next (one pass — after the limit resets)

**Hindu 3.** Darśana increment **only if a school occupies a new slot**. Do not encode every school.

Already in the graph (do not duplicate):

- `vedic` — Ṛgvedic cycle, including Rudra
- `hinduism` — umbrella + Purāṇic operators
- `brahman` — nirguṇa summit
- `purusha-prakriti` — Sāṃkhya pair (already the Sāṃkhya occupant)
- `brahma` / `vishnu` / `shiva` / `devi` — Hindu 2

Nyāya, Mīmāṃsā, or Advaita is only worth it if it is not another name for Brahman, the Sāṃkhya pair, or a trimūrti operator. After that: Buddhist 2 (pratītyasamutpāda / Yogācāra if new slot) or science cosmology (only if distinct from entropy + ordered-time).

If the in-flight Hindu 3 `walk-one` already wrote nodes when you return: validate, then `/collision-audit {"target":"hindu-3"}` and `/spine-snapshot {"write":true}`. That run will **not** have auto-chained. Newer `/walk-one` launches will.

## Do not

- Start another tradition to “use the last tokens.”
- Avatāra lists, every Devī form, every Purāṇa, every darśana as a sticker.
- Fold Vedic into Hinduism or gold new gods to the Demiurge by default.
- Encode leftover names (Nabta, Inana, Uṣas, nomes, Mexica suns, Eshu).
- Treat remaining Platonic betweenness as a spine.
- Copy project workflows to `~/.grok/workflows/`.
- Put CSS/JS into `viewer/index.html`.

## Workflows (this repo only)

A workflow **cannot** launch another workflow. Sequential work is **inside** `/walk-one` (encode → validate → audit → snapshot). Standalone `/collision-audit` and `/spine-snapshot` are manual.

`/walk-one {"encode":false}` surveys and stops.

## Click in the viewer

Devī ↔ Tiamat · Devī ↔ Anat · Viṣṇu ↔ Incarnation · Viṣṇu ↔ Escape Gnosis · Śiva ↔ Ragnarök · Śiva ↔ Yijing Change · Brahmā ↔ Obatala · Rudra → Śiva
