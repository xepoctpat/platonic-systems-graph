# Session handoff (2026-11-22, compact)

Stop point: **242 nodes · 626 edges.** Validate was **OK**. Working tree is **clean** at this commit. `main` is pushed to `origin/main`, including `e6c14de` and this commit.

Read [ROADMAP.md](ROADMAP.md) and [RESEARCH_PLAN.md](RESEARCH_PLAN.md) before encoding. This file is the resume note. The older handoff (213 nodes, 3D as a view, Buddhist 2 as latest) is superseded.

## What this session changed

Emergence means laterals: schools that look unrelated share an origin or an attribute. It is not a history of each school, and it is not a Platonic spine.

The reading is a **tab**, taken from `xepoctpat/wwm_toolkit`: one origin, a small Mermaid chart, and the claim beside it. The paragraph does not go on the arrow. An open question stays in the card and does not become an edge. Mermaid is the only finding drawing. 3D is retired. The button, the canvas, and `space.js` are gone. No force-directed view.

YAML is still the store. SQLite or Neo4j only when a real attribute query hurts. Kaggle and scrapes are name checks, never `refs`. A medieval hidden or condemnatory name is not the old node unless the function is sourced on both sides.

Cursor user setting, outside this repo: `files.autoSave` is `afterDelay`, delay `1000`.

## Git

`main` matches `origin/main` after this push. `e6c14de` and this commit are both on the remote.

| Commit | What |
|---|---|
| `6987a71` | Mitra ~ Jesus unclassified. No node, no edge, no link. `space.js` removed |
| `43d92ee` | Avestan Miθra. One cyan covenant lateral. New node `avestan-mithra` |
| `e6c14de` | Unsleeping eye. Partial swap. One orange lateral. No new node |
| HEAD | Kingship. Partial swap. One orange lateral. No new node |

## Graph now

| | |
|---|---|
| Edges | cyan 224 · gold 154 · magenta 102 · orange 67 · red 41 · green 38 |
| Latest pass | kingship — partial swap, Mitra and Miθra |
| Clusters added | `hellenic`, `roman` |

Greco-Roman twelve (Livy 22.10.9, plus Liber) is a **drawing check, not an origin**. Cyan where only a translated name was sourced. Orange for Mars, Venus Erycina, Mercury, Vesta, Ceres, Liber. Gold for Apollo Medicus (vowed 433, Livy 4.25.3).

Ma'at · ṛta · Asha: three cyan edges already present. Open sharing, not a loop. Drawn in the research plan.

Solar: Sūrya–Helios cyan. Sūrya–Re and Helios–Re orange (barque, not chariot). Mitra–Sūrya orange (covenant, not the sun; Ṛgveda 3.59.1). Mitra–Varuṇa cyan. Jesus not encoded.

Avestan Miθra: one cyan lateral to Mitra on the covenant (Ṛgveda 3.59.1 and Yt. 10.2). New node `avestan-mithra`. The chariot is only Yt. 10.124–125. The companion does not match. Mills’s Gathas do not name Mithra. `zoroastrianism` stays partial.

Unsleeping eye: partial swap. One orange lateral, undirected, between `mitra` and `avestan-mithra`. The watch is shared, and the work of the eyes did not transfer. Ṛgveda 3.59.1 beholds the peoples with eyes that do not close. Yt. 10.7 counts ten thousand eyes and calls him sleepless beside that count. Yt. 10.13 looks over the Aryan abode with a beneficent eye. The covenant edge is unchanged. No new node.

Kingship: partial swap. One orange lateral, undirected, between `mitra` and `avestan-mithra`. The rule is shared, and the act did not transfer: birth as king (Ṛgveda 3.59.4) versus bringing sovereignty (Yt. 10.16) and lordship of countries (Yt. 10.145). The covenant edge and the eye edge are unchanged. No new node. `data/latest.yaml` is this encode.

Side findings, seen and not scored, not encoded:

- Yt. 10.0, before §1: “Unto Mithra, the lord of wide pastures, who has a thousand ears, ten thousand eyes, a Yazata invoked by his own name, and unto Rama Hvastra.”
- Yt. 10.15: “On Arezahi and Sawahi, on Fradadhafshu and Widadhafshu, on Wouru-bareshti and Wourujareshti, on this bright karshwar of Xwaniratha, the abode of cattle, the dwelling of cattle, the powerful Mithra looks with a health-bringing eye.”
- Yt. 10.82: “To whom Ahura Mazda gave a thousand senses and ten thousand eyes to see. With those eyes and those senses, he watches the man who injures Mithra, the man who lies unto Mithra. Through those eyes and those senses, he is undeceivable, he, of the ten thousand spies, the powerful, all-knowing, undeceivable god.”
- Yt. 10.65: “increase-giving, fatness-giving, cattle-giving, sovereignty-giving, son-giving, cheerfulness-giving, and bliss-giving.”
- Yt. 10.67: he drives from Arezahi to Xwaniratha “accompanied by the wheel of sovereignty, the Glory made by Mazda, and the Victory made by Ahura.” That wheel sits on the chariot passage.
- Yt. 10.109: “To whom shall I give in return, without his thinking of it, the awful sovereignty, beautifully arrayed, with many armies, and most perfect; the sovereignty of an all-powerful tyrant, who fells down heads…”
- Yt. 10.111: “From whom shall I take away, without his thinking of it, the awful sovereignty,” in the same words as §109.

Latest pass: mitra-jesus stayed unclassified. No Jesus node. No edge. The drawing has no link.

## How to resume

```powershell
cd C:\Users\xepoc\OneDrive\Grok\platonic-systems-graph
.\.venv\Scripts\python.exe tools\serve.py check
.\.venv\Scripts\python.exe tools\validate.py
```

If check prints `down`: `python tools/serve.py start` in the background. Port **8765** only. Viewer: http://127.0.0.1:8765/viewer/

`data/research-queue.yaml` is the tradition inventory. `RESEARCH_PLAN.md` is the lateral order. Do not invent a third list.

## Do next, only if the operator asks

1. The chariot is only Yt. 10.124–125. The Vedic cell is empty.
2. The companion does not match. Yt. 10.145 names Ahura. No Vedic verse was opened.
3. Do not encode Jesus without a sourced shared attribute.
4. Roman Mithras stays the pending mystery interior.
5. Yt. 10.0, 10.15, 10.82, 10.65, 10.67, 10.109, and 10.111 stay unscored.

## Do not

- Treat the Greco-Roman twelve as an origin.
- Encode Jesus without a sourced shared attribute.
- Add a Miθra lateral from Yt. 10.0, 10.15, 10.82, 10.65, 10.67, 10.109, or 10.111 unless a later pass is asked for.
- Change the covenant edge or the eye edge, or add a gold edge.
- Fold Roman Mithras into `avestan-mithra`, or mark `zoroastrianism` surveyed.
- Turn Malachi 4:2 or Luke 22:20 into an edge.
- Encode every god, or write a school’s chronicle and call it emergence.
- Edge `nabta-playa` to force one component.
- Turn a lateral into a descent arrow.
- Switch the store to SQLite or Neo4j yet.
- Bring 3D or a force-directed view back.
- Commit or push unless asked.
