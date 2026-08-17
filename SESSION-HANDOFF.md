# Session handoff (2026-08-17)

Stop point: Zoroastrian interior encoded. Operator wrapping up for the day.

## How to resume

```powershell
cd C:\Users\xepoc\OneDrive\Grok\platonic-systems-graph
.\.venv\Scripts\python.exe tools\serve.py check
# if down:
.\.venv\Scripts\python.exe tools\serve.py start   # background; 127.0.0.1:8765 only
```

Viewer: http://127.0.0.1:8765/viewer/

Skills: `/viewer-server` · `/researcher` · `/add-entry` · `/organic-spine` · `/cluster-research`

Policy: `AGENTS.md`. YAML is source of truth. No Platonic spine. **Corpus-complete, not culture-complete** (named cycle/list, not every local god). Hinduism = several passes.

## What this session did

- Recoded the graph as peer clusters (`kind` + `cluster`); dropped privileged stages.
- 2D viewer: cluster/kind filters, search, neighbourhood, laterals-only.
- `tools/serve.py` on **8765**; never 8000/3000/5000/8080.
- Queue: `data/research-queue.yaml`. Walk earliest empty/stub unless named.
- Encoded, in order:
  - Preliterate: marks, Lion-man, PPN/Göbekli, Nabta, Lepenski Vir, Vinča
  - Mesopotamia (Enki, *me*, Tiamat, Marduk, …)
  - Egypt (slots + **full Heliopolitan Ennead**)
  - Canaanite (Baal Cycle only)
  - Vedic (Ṛgvedic core, not Purāṇa)
  - Zoroastrian (asha/druj, Amesha Spentas as a **set**, Zurvan)

## Graph size at handoff

137 nodes, 330 typed edges (confirmed after Zoroastrian pass).

## Do next (suggested order)

1. **`/organic-spine`** — centrality, communities, feedback. Betweenness is a hinge proposal, not proof of a backbone. Note seed bias (Plato still heavy).
2. **Biblical increment** (`biblical-religion` is partial): wisdom, merkabah precursors, exile-time — only if they occupy new slots. Do not duplicate Genesis creator / tohu.
3. **Vedic leftover names** if comparison needs them: Uṣas, Aśvins, Viṣṇu, Rudra. Or skip to **early China** (`empty`) or **Manichaeism** (`empty`, major dualist collision with Zoroastrian/Gnostic).
4. **Mesopotamia leftover** only if useful: Inana, Atrahasis/flood, netherworld — not a dump.
5. **Purāṇic Hindu pass** later (Śiva / Viṣṇu / Devī). Do not explode 330 million gods.
6. Commit was requested at end of this session; if the next session starts dirty, `git status` first.

## Do not

- Rebuild a 7-stage Platonic spine.
- Encode every Egyptian nome or every Hindu deity in one pass.
- Start the viewer on 8000/3000/5000/8080.
- Put CSS/JS inline in `viewer/index.html`.
- Write YAML from the V1–V11 JPGs as inventory.

## Open collisions worth clicking in the viewer

Marduk ↔ Demiurge · Tiamat ↔ Receptacle · Nun ↔ Tiamat · Indra ↔ Baal · Ṛta ↔ Ma'at ↔ Asha · Zurvan ↔ ordered-time · Puruṣa ↔ Tiamat · Lion-man ↔ Lepenski fish-human
