# Session handoff (2026-11-22, compact)

Stop point: **241 nodes · 623 edges.** Validate was **OK**. Working tree is **clean**. Do not push unless the operator asks.

Read [ROADMAP.md](ROADMAP.md) and [RESEARCH_PLAN.md](RESEARCH_PLAN.md) before encoding. This file is the resume note. The older handoff (213 nodes, 3D as a view, Buddhist 2 as latest) is superseded.

## What this session changed

Emergence means laterals: schools that look unrelated share an origin or an attribute. It is not a history of each school, and it is not a Platonic spine.

The reading is a **tab**, taken from `xepoctpat/wwm_toolkit`: one origin, a small Mermaid chart, and the claim beside it. The paragraph does not go on the arrow. An open question stays in the card and does not become an edge. Mermaid is the only finding drawing. 3D is retired (the button is still in the viewer). No force-directed view.

YAML is still the store. SQLite or Neo4j only when a real attribute query hurts. Kaggle and scrapes are name checks, never `refs`. A medieval hidden or condemnatory name is not the old node unless the function is sourced on both sides.

Cursor user setting, outside this repo: `files.autoSave` is `afterDelay`, delay `1000`.

## Git

`main` is **4 commits ahead** of `origin/main` and has not been pushed.

| Commit | What |
|---|---|
| `0b304d3` | Reading layer: mix chords, `view.json`, slots, tours |
| `caafd26` | Yogācāra, pendant laterals, grouped field, 3D canvas |
| `9c07d59` | Handoff before the lateral turn |
| HEAD | Greco-Roman transfer, solar attribute, comparison sheet, research plan |

## Graph now

| | |
|---|---|
| Edges | cyan 223 · gold 154 · magenta 102 · orange 65 · red 41 · green 38 |
| Latest pass | `solar-attribute` — Helios, Mitra (`data/latest.yaml`) |
| Clusters added | `hellenic`, `roman` |

Greco-Roman twelve (Livy 22.10.9, plus Liber) is a **drawing check, not an origin**. Cyan where only a translated name was sourced. Orange for Mars, Venus Erycina, Mercury, Vesta, Ceres, Liber. Gold for Apollo Medicus (vowed 433, Livy 4.25.3).

Ma'at · ṛta · Asha: three cyan edges already present. Open sharing, not a loop. Drawn in the research plan.

Solar: Sūrya–Helios cyan. Sūrya–Re and Helios–Re orange (barque, not chariot). Mitra–Sūrya orange (covenant, not the sun; Ṛgveda 3.59.1). Mitra–Varuṇa cyan. Jesus not encoded. Avestan Miθra open.

## How to resume

```powershell
cd C:\Users\xepoc\OneDrive\Grok\platonic-systems-graph
.\.venv\Scripts\python.exe tools\serve.py check
.\.venv\Scripts\python.exe tools\validate.py
```

If check prints `down`: `python tools/serve.py start` in the background. Port **8765** only. Viewer: http://127.0.0.1:8765/viewer/

`data/research-queue.yaml` is the tradition inventory. `RESEARCH_PLAN.md` is the lateral order. Do not invent a third list.

## Do next, only if the operator asks

1. Phase 4 in the research plan: one thinner overlap, unclassified until a source types it.
2. Viewer tabs: one origin, Mermaid, note beside it. Sheet stays the spine check.
3. Remove the 3D button.

## Do not

- Treat the Greco-Roman twelve as an origin.
- Encode Jesus, or Avestan Miθra, without a sourced shared attribute.
- Encode every god, or write a school’s chronicle and call it emergence.
- Edge `nabta-playa` to force one component.
- Turn a lateral into a descent arrow.
- Switch the store to SQLite or Neo4j yet.
- Bring 3D or a force-directed view back.
- Commit or push unless asked.
