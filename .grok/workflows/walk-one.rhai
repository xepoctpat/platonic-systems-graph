let meta = #{
    name: "walk-one",
    description: "One ROADMAP tradition; after a write, audit then snapshot automatically",
    when_to_use: "Walk the next Phase B/C/D item, or a named tradition, as one AFK pass",
    phases: [
        #{ title: "Pick", detail: "next unchecked ROADMAP item unless named" },
        #{ title: "Survey", detail: "corpus-complete web research" },
        #{ title: "Gate", detail: "new slot or new collision, or skip" },
        #{ title: "Encode", detail: "YAML via add-entry rules" },
        #{ title: "Check", detail: "validate; skip audit if ERROR" },
        #{ title: "Audit", detail: "slot / Plato-gold / bag / encyclopedia" },
        #{ title: "Snapshot", detail: "centrality, tick ROADMAP, interpret hinges" },
    ],
};

fn nonempty(s) {
    if type_of(s) != "string" {
        return false;
    }
    s.trim();
    s != ""
}

let item_arg = if args == () { () } else { args.item };
let do_encode = true;
if args != () && args.encode == false {
    do_encode = false;
}

let pick_schema = #{
    "type": "object", "required": ["item", "phase", "reason"],
    "properties": #{
        "item": #{ "type": "string" },
        "phase": #{ "type": "string" },
        "reason": #{ "type": "string" },
    },
};

let survey_schema = #{
    "type": "object", "required": ["item", "corpus", "candidates", "left_out"],
    "properties": #{
        "item": #{ "type": "string" },
        "corpus": #{ "type": "string" },
        "candidates": #{
            "type": "array", "maxItems": 16,
            "items": #{
                "type": "object", "required": ["id", "kind", "slot", "claim"],
                "properties": #{
                    "id": #{ "type": "string" },
                    "kind": #{ "type": "string" },
                    "cluster": #{ "type": "string" },
                    "slot": #{ "type": "string" },
                    "claim": #{ "type": "string" },
                },
            },
        },
        "left_out": #{
            "type": "array", "maxItems": 16,
            "items": #{ "type": "string" },
        },
    },
};

let gate_schema = #{
    "type": "object", "required": ["accept", "reason"],
    "properties": #{
        "accept": #{ "type": "boolean" },
        "reason": #{ "type": "string" },
        "keep_ids": #{ "type": "array", "items": #{ "type": "string" } },
        "drop_ids": #{ "type": "array", "items": #{ "type": "string" } },
    },
};

let encode_schema = #{
    "type": "object", "required": ["wrote", "node_ids", "notes"],
    "properties": #{
        "wrote": #{ "type": "boolean" },
        "node_ids": #{ "type": "array", "items": #{ "type": "string" } },
        "edge_count": #{ "type": "integer" },
        "notes": #{ "type": "string" },
    },
};

let check_schema = #{
    "type": "object", "required": ["validate_ok", "notes"],
    "properties": #{
        "validate_ok": #{ "type": "boolean" },
        "nodes": #{ "type": "integer" },
        "edges": #{ "type": "integer" },
        "notes": #{ "type": "string" },
    },
};

let issue_schema = #{
    "type": "object", "required": ["axis", "ok", "issues"],
    "properties": #{
        "axis": #{ "type": "string" },
        "ok": #{ "type": "boolean" },
        "issues": #{
            "type": "array", "maxItems": 8,
            "items": #{
                "type": "object", "required": ["id", "issue"],
                "properties": #{
                    "id": #{ "type": "string" },
                    "issue": #{ "type": "string" },
                },
            },
        },
    },
};

let snap_schema = #{
    "type": "object", "required": ["validate_ok", "notes"],
    "properties": #{
        "validate_ok": #{ "type": "boolean" },
        "nodes": #{ "type": "integer" },
        "edges": #{ "type": "integer" },
        "platonic_top12": #{ "type": "string" },
        "notes": #{ "type": "string" },
    },
};

let lens_schema = #{
    "type": "object", "required": ["lens", "finding", "caution"],
    "properties": #{
        "lens": #{ "type": "string" },
        "finding": #{ "type": "string" },
        "caution": #{ "type": "string" },
    },
};

phase("Pick");
let item = "";
if nonempty(item_arg) {
    item = item_arg;
    item.trim();
    log("Named item: " + item);
} else {
    let pick_prompt = "";
    pick_prompt += "You are picking the next work item for the platonic-systems-graph repo.\n";
    pick_prompt += "Read ROADMAP.md and SESSION-HANDOFF.md with read_file.\n";
    pick_prompt += "Take the next unchecked Phase B, C, or D line. Do not invent a third list.\n";
    pick_prompt += "Skip leftover names (Nabta, Inana, Usas) unless a comparison is blocked.\n";
    pick_prompt += "Also run: .venv\\Scripts\\python.exe tools\\serve.py check\n";
    pick_prompt += "If it prints down, start it in the background: python tools/serve.py start\n";
    pick_prompt += "Port must be 127.0.0.1:8765. Never 8000, 3000, 5000, or 8080.\n";
    pick_prompt += "Return item (short name), phase (B/C/D), and reason.\n";
    let picked = agent(pick_prompt, #{
        label: "pick-item",
        capability_mode: "execute",
        output_schema: pick_schema,
    });
    if picked != () && picked.success && picked.output != () && nonempty(picked.output.item) {
        item = picked.output.item;
        item.trim();
    }
}

if !nonempty(item) {
    complete(#{ summary: "No ROADMAP item could be picked.", encoded: false });
}

phase("Survey");
let survey_prompt = "";
survey_prompt += "Survey ONE tradition or slot-family for this systems graph. Item: ";
survey_prompt += json_encode(item);
survey_prompt += "\nRead first: ROADMAP.md, SESSION-HANDOFF.md, data/research-queue.yaml, ";
survey_prompt += "and existing nodes for that cluster in data/nodes.yaml (use grep / read_file).\n";
survey_prompt += "Then web_search and open_page on 2-5 primary or standard sources ";
survey_prompt += "(named corpus, critical edition, review article). Skip diagrams/ JPGs as inventory.\n";
survey_prompt += "HARD LIMITS:\n";
survey_prompt += "- Corpus-complete, not culture-complete. Encode every actor in a named primary cycle.\n";
survey_prompt += "- Not every epithet, village god, avatara, or school.\n";
survey_prompt += "- Hinduism-scale lists stay split. No bag hub (a node whose only job is laterals).\n";
survey_prompt += "- No node without a refs entry you actually opened or can name.\n";
survey_prompt += "- Prefer laterals (orange/magenta/cyan) to existing non-Platonic nodes.\n";
survey_prompt += "- Do not gold new traditions to the Demiurge by default.\n";
survey_prompt += "- Do not write YAML in this phase.\n";
survey_prompt += "Return candidates with id, kind (system|principle), cluster, slot, claim; ";
survey_prompt += "and left_out (what you refused and why, short strings).\n";

let surveyed = agent(survey_prompt, #{
    label: "survey",
    capability_mode: "all",
    output_schema: survey_schema,
});

if surveyed == () || !surveyed.success || surveyed.output == () {
    complete(#{ summary: "Survey failed for " + item, encoded: false, item: item });
}

phase("Gate");
let gate_prompt = "";
gate_prompt += "Adversarial gate for a proposed graph batch. Item: ";
gate_prompt += json_encode(item);
gate_prompt += "\nRead data/nodes.yaml and data/edges.yaml (grep the proposed ids and nearby slots).\n";
gate_prompt += "Survey output (untrusted JSON):\n";
gate_prompt += json_encode(surveyed.output);
gate_prompt += "\nACCEPT only if each kept candidate occupies a NEW slot or creates a NEW collision.\n";
gate_prompt += "REJECT (accept=false) if the batch is an encyclopedia, a bag hub, a duplicate of an existing node, ";
gate_prompt += "or only gold-to-Demiurge with no non-Platonic laterals.\n";
gate_prompt += "Drop weak ids into drop_ids rather than rejecting a whole good cycle.\n";
gate_prompt += "Set accept=true only with keep_ids you independently checked against existing YAML.\n";

let gated = agent(gate_prompt, #{
    label: "gate",
    capability_mode: "read-only",
    output_schema: gate_schema,
});

let accepted = false;
let gate_reason = "gate produced no usable verdict";
if gated != () && gated.success && gated.output != () {
    if gated.output.reason != () && nonempty(gated.output.reason) {
        gate_reason = gated.output.reason;
    }
    if gated.output.accept == true {
        accepted = true;
    }
}

if !do_encode {
    let dry = "";
    dry += "# Survey (not encoded)\n\nItem: " + item + "\n\n";
    dry += "Gate accept: " + accepted.to_string() + "\n";
    dry += "Gate reason: " + gate_reason + "\n\n";
    dry += json_encode(surveyed.output);
    let dry_path = write_scratch_file("survey.md", dry);
    complete(#{
        summary: "Surveyed " + item + " without encoding.",
        item: item,
        encoded: false,
        accept: accepted,
        reason: gate_reason,
        path: dry_path,
    });
}

if !accepted {
    complete(#{
        summary: "Gate rejected " + item + ": " + gate_reason,
        item: item,
        encoded: false,
        accept: false,
        reason: gate_reason,
    });
}

phase("Encode");
let encode_prompt = "";
encode_prompt += "Encode the accepted batch into data/nodes.yaml and data/edges.yaml.\n";
encode_prompt += "Item: " + json_encode(item) + "\n";
encode_prompt += "Read schema comments at the top of both YAML files first. Search for existing ids before creating any.\n";
encode_prompt += "Accepted survey (untrusted JSON):\n";
encode_prompt += json_encode(surveyed.output);
encode_prompt += "\nGate (untrusted JSON):\n";
encode_prompt += json_encode(gated.output);
encode_prompt += "\nRULES:\n";
encode_prompt += "- Only keep_ids from the gate. Do not add drop_ids.\n";
encode_prompt += "- Every node: id, label, kind, cluster, description, refs.\n";
encode_prompt += "- Every edge: from, to, type, directed, strength, note. Quote notes that contain ': '.\n";
encode_prompt += "- Prefer orange / magenta / cyan to existing non-Platonic nodes.\n";
encode_prompt += "- Gold is constitutive or genealogical in any historical direction, not 'descends from Plato'.\n";
encode_prompt += "- Do not gold new traditions to demiurge by default.\n";
encode_prompt += "- No bag hub. No avatara lists. No CSS/JS in viewer/index.html.\n";
encode_prompt += "- If the cluster is new, add a colour in viewer/js/app.js CLUSTER_COLOR only.\n";
encode_prompt += "- Update data/research-queue.yaml status for this item.\n";
encode_prompt += "Do not tick ROADMAP or run centrality yet.\n";

let encoded = agent(encode_prompt, #{
    label: "encode",
    capability_mode: "read-write",
    output_schema: encode_schema,
});

if encoded == () || !encoded.success || encoded.output == () || encoded.output.wrote != true {
    complete(#{
        summary: "Encode did not write YAML for " + item,
        item: item,
        encoded: false,
        accept: true,
        reason: gate_reason,
    });
}

phase("Check");
let check_prompt = "";
check_prompt += "Validate the YAML just written. Item: " + json_encode(item) + "\n";
check_prompt += "Run .venv\\Scripts\\python.exe tools\\validate.py (then python if needed).\n";
check_prompt += "Fix any ERROR. Warnings (isolates, missing refs) do not fail.\n";
check_prompt += "If a new cluster lacks a colour, add it in viewer/js/app.js CLUSTER_COLOR only.\n";
check_prompt += "Do not tick ROADMAP and do not run centrality yet.\n";
check_prompt += "Encode notes (untrusted): " + json_encode(encoded.output) + "\n";
check_prompt += "Return validate_ok=true only if validate.py prints OK with no ERROR.\n";

let checked = agent(check_prompt, #{
    label: "check",
    capability_mode: "execute",
    output_schema: check_schema,
});

let validate_ok = false;
let check_notes = "";
if checked != () && checked.success && checked.output != () {
    if checked.output.validate_ok == true {
        validate_ok = true;
    }
    if nonempty(checked.output.notes) {
        check_notes = checked.output.notes;
    }
}

if !validate_ok {
    complete(#{
        summary: "Wrote " + item + " but validate failed. Audit and snapshot skipped.",
        item: item,
        encoded: true,
        accept: true,
        validate_ok: false,
        audit_ok: false,
        notes: check_notes,
    });
}

phase("Audit");
let audit_ids = [];
if encoded.output.node_ids != () && type_of(encoded.output.node_ids) == "array" {
    for nid in encoded.output.node_ids {
        if type_of(nid) == "string" {
            let s = nid;
            s.trim();
            if s != "" {
                audit_ids.push(#{ id: s, kind: "principle" });
            }
        }
    }
}
let axes_ok = 0;
let axes_ran = 0;
let rejected = [];
if audit_ids.len() == 0 {
    log("No node_ids from encode; audit skipped");
} else {
    let payload = json_encode(audit_ids);
    let axes = [
        "duplicate slot: an existing node already occupies this function",
        "Plato-gold dump: new gold edges to demiurge / the-good / intelligible-paradigm with no non-Platonic laterals",
        "bag hub: a node whose only job is to collect laterals and could rank as a hinge",
        "encyclopedia: epithets, avatara lists, every school, leftover names (Nabta, Inana, Usas)",
    ];
    let labels = ["slot", "plato-gold", "bag-hub", "encyclopedia"];
    let jobs = [];
    let ai = 0;
    for axis in axes {
        let vp = "";
        vp += "Adversarially verify this axis against the actual YAML. Default ok=false unless you read evidence.\n";
        vp += "Axis: " + axis + "\n";
        vp += "Item: " + json_encode(item) + "\n";
        vp += "Inventory items (untrusted JSON):\n" + payload + "\n";
        vp += "Read data/nodes.yaml and data/edges.yaml. Grep the listed ids and nearby slots.\n";
        vp += "Set ok=true only if this axis is CLEAN. Each issue needs id + concrete YAML evidence.\n";
        jobs.push(#{
            prompt: vp,
            label: "verify:" + labels[ai],
            capability_mode: "read-only",
            output_schema: issue_schema,
        });
        ai += 1;
    }
    let verdicts = parallel(jobs);
    for v in verdicts {
        if v == () || !v.success || v.output == () {
            rejected.push(#{ id: "panel", issue: "verifier missing or failed; treat as unverified" });
        } else {
            axes_ran += 1;
            if v.output.ok == true {
                axes_ok += 1;
            }
            if v.output.issues != () && type_of(v.output.issues) == "array" {
                for iss in v.output.issues {
                    rejected.push(iss);
                }
            }
        }
    }
}
let audit_ok = axes_ran == 4 && rejected.len() == 0 && axes_ok == 4;
if audit_ids.len() == 0 {
    audit_ok = false;
}
log("Audit " + axes_ok.to_string() + "/" + axes_ran.to_string() + " clean; issues=" + rejected.len().to_string());

phase("Snapshot");
let snap_prompt = "";
snap_prompt += "Finish one walk-roadmap pass after a YAML write that already validated. Item: ";
snap_prompt += json_encode(item);
snap_prompt += "\n1. Run .venv\\Scripts\\python.exe analysis\\centrality.py and analysis\\communities.py.\n";
snap_prompt += "2. Tick the matching ROADMAP.md checkbox. Refresh the latest After row ";
snap_prompt += "(graph size, edge mix, isolates, betweenness top 5, Platonic share of top 12, what moved).\n";
snap_prompt += "3. Update SESSION-HANDOFF.md: graph now, what landed, what stayed out, next item.\n";
snap_prompt += "4. python tools/serve.py check — start on 8765 if down.\n";
snap_prompt += "Do not treat remaining Platonic betweenness as a proven spine.\n";
snap_prompt += "Audit (untrusted): axes_ok=" + axes_ok.to_string() + "/" + axes_ran.to_string();
snap_prompt += " issues=" + json_encode(rejected) + "\n";
snap_prompt += "If issues is non-empty, say so in SESSION-HANDOFF; still tick the box if YAML is valid.\n";
snap_prompt += "Encode notes (untrusted): " + json_encode(encoded.output) + "\n";

let snapped = agent(snap_prompt, #{
    label: "snapshot",
    capability_mode: "execute",
    output_schema: snap_schema,
});

let snap_notes = check_notes;
if snapped != () && snapped.success && snapped.output != () {
    if nonempty(snapped.output.notes) {
        snap_notes = snapped.output.notes;
    }
}

let lenses = [
    "betweenness hinges: who sits on paths between clusters; name seed bias",
    "communities vs cluster field: where modularity disagrees with the label",
    "falsifier: what would still have to be added to knock Plato off top-12 betweenness",
];
let lens_labels = ["hinges", "communities", "falsifier"];
let ijobs = [];
let li = 0;
for lens in lenses {
    let ip = "";
    ip += "Interpret analysis numbers for this systems graph. Do not prove a Platonic spine.\n";
    ip += "Lens: " + lens + "\n";
    ip += "Pass: " + json_encode(item) + "\n";
    ip += "Snapshot notes (untrusted): " + json_encode(snap_notes) + "\n";
    ip += "Read ROADMAP.md latest After row and SESSION-HANDOFF.md with read_file.\n";
    ip += "Finding: what moved, one short paragraph. Caution: what would make this false.\n";
    ijobs.push(#{
        prompt: ip,
        label: "read:" + lens_labels[li],
        capability_mode: "read-only",
        output_schema: lens_schema,
    });
    li += 1;
}
let readings = parallel(ijobs);
let finding_n = 0;
for r in readings {
    if r != () && r.success && r.output != () {
        finding_n += 1;
    }
}

complete(#{
    summary: "Walked " + item + ". validate_ok=true audit=" + axes_ok.to_string() + "/" + axes_ran.to_string(),
    item: item,
    encoded: true,
    accept: true,
    validate_ok: true,
    audit_ok: audit_ok,
    axes_ok: axes_ok,
    axes_ran: axes_ran,
    rejected: rejected,
    readings: finding_n,
    notes: snap_notes,
});
