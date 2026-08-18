let meta = #{
    name: "survey-tradition",
    description: "Web-survey one tradition into a candidate table; do not write YAML",
    when_to_use: "Research a named tradition or the next ROADMAP item without encoding",
    phases: [
        #{ title: "Scope", detail: "corpus, existing ids, search queries" },
        #{ title: "Sources", detail: "parallel primary-source reads" },
        #{ title: "Synthesize", detail: "candidate table and refusals" },
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

let scope_schema = #{
    "type": "object", "required": ["item", "corpus", "queries"],
    "properties": #{
        "item": #{ "type": "string" },
        "corpus": #{ "type": "string" },
        "existing": #{ "type": "array", "items": #{ "type": "string" } },
        "queries": #{
            "type": "array", "maxItems": 4,
            "items": #{ "type": "string" },
        },
        "already_encoded": #{ "type": "string" },
    },
};

let source_schema = #{
    "type": "object", "required": ["query", "notes"],
    "properties": #{
        "query": #{ "type": "string" },
        "notes": #{ "type": "string" },
        "urls": #{ "type": "array", "items": #{ "type": "string" } },
    },
};

let synth_schema = #{
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
                    "refs": #{ "type": "string" },
                },
            },
        },
        "left_out": #{ "type": "array", "items": #{ "type": "string" } },
    },
};

phase("Scope");
let scope_prompt = "";
scope_prompt += "Scope ONE researcher pass for the platonic-systems-graph.\n";
if nonempty(item_arg) {
    scope_prompt += "Named item: " + json_encode(item_arg) + "\n";
} else {
    scope_prompt += "No item named. Read ROADMAP.md and take the next unchecked Phase B/C/D line.\n";
}
scope_prompt += "Read SESSION-HANDOFF.md, data/research-queue.yaml, and grep data/nodes.yaml ";
scope_prompt += "for already-encoded ids in that cluster. Do not invent a third queue.\n";
scope_prompt += "HARD LIMITS: one tradition or slot-family; corpus-complete not culture-complete; ";
scope_prompt += "Hinduism-scale lists stay split; skip Nabta/Inana/Usas leftovers.\n";
scope_prompt += "Return item, a named corpus (book/cycle, not 'Hinduism'), existing ids to avoid, ";
scope_prompt += "and at most 4 web search queries aimed at primary or standard sources.\n";
scope_prompt += "Do not write YAML.\n";

let scoped = agent(scope_prompt, #{
    label: "scope",
    capability_mode: "read-only",
    output_schema: scope_schema,
});

if scoped == () || !scoped.success || scoped.output == () {
    complete(#{ summary: "Scope failed.", candidates: [] });
}

let item = "";
if nonempty(scoped.output.item) {
    item = scoped.output.item;
    item.trim();
} else if nonempty(item_arg) {
    item = item_arg;
    item.trim();
}
if !nonempty(item) {
    item = "unspecified";
}

let queries = [];
if scoped.output.queries != () && type_of(scoped.output.queries) == "array" {
    let i = 0;
    for q in scoped.output.queries {
        if i < 4 && type_of(q) == "string" {
            let s = q;
            s.trim();
            if s != "" {
                queries.push(s);
            }
        }
        i += 1;
    }
}
if queries.len() > 4 {
    log("Dropped extra queries; cap is 4");
}

phase("Sources");
let source_notes = [];
if queries.len() > 0 {
    let jobs = [];
    let qi = 0;
    for q in queries {
        let sp = "";
        sp += "Open and read sources for this systems-graph survey.\n";
        sp += "Item: " + json_encode(item) + "\n";
        sp += "Named corpus from scope (untrusted): " + json_encode(scoped.output.corpus) + "\n";
        sp += "Your query: " + json_encode(q) + "\n";
        sp += "Use web_search then open_page on 1-2 primary or standard pages (corpus, edition, review).\n";
        sp += "Extract operators, events, and slots — not every epithet.\n";
        sp += "Do not propose YAML. Return notes (what the source actually says) and urls you opened.\n";
        jobs.push(#{
            prompt: sp,
            label: "src-" + qi.to_string(),
            capability_mode: "all",
            output_schema: source_schema,
        });
        qi += 1;
    }
    let srcs = parallel(jobs);
    for r in srcs {
        if r != () && r.success && r.output != () {
            source_notes.push(r.output);
        }
    }
} else {
    log("No queries from scope; synthesizing from repo context only");
}

phase("Synthesize");
let synth_prompt = "";
synth_prompt += "Synthesize a candidate node table for ONE pass. Do not write YAML.\n";
synth_prompt += "Item: " + json_encode(item) + "\n";
synth_prompt += "Scope (untrusted JSON):\n" + json_encode(scoped.output) + "\n";
synth_prompt += "Source notes (untrusted JSON):\n" + json_encode(source_notes) + "\n";
synth_prompt += "Read data/nodes.yaml for colliding ids before you keep a candidate.\n";
synth_prompt += "KEEP only operators that occupy a new slot or create a new collision.\n";
synth_prompt += "LEFT_OUT: avatara lists, bag hubs, encyclopedia names, leftovers (Nabta, Inana, Usas).\n";
synth_prompt += "Prefer suggested laterals to existing non-Platonic nodes. No default gold to demiurge.\n";
synth_prompt += "Each candidate: id, kind, cluster, slot, one-sentence claim, refs you can name.\n";

let made = agent(synth_prompt, #{
    label: "synthesize",
    capability_mode: "read-only",
    output_schema: synth_schema,
});

let report = "# Survey " + item + "\n\nNot encoded. Run /walk-one or /collision-audit next.\n\n";
if made != () && made.success && made.output != () {
    report += json_encode(made.output);
} else {
    report += "Synthesize failed. Scope follows.\n\n";
    report += json_encode(scoped.output);
}
let path = write_scratch_file("survey.md", report);

if made != () && made.success && made.output != () {
    complete(#{
        summary: "Surveyed " + item + " (not encoded).",
        item: item,
        path: path,
        corpus: made.output.corpus,
        candidates: made.output.candidates,
        left_out: made.output.left_out,
    });
}

complete(#{
    summary: "Survey incomplete for " + item,
    item: item,
    path: path,
    candidates: [],
});
