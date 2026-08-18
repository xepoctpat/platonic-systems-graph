let meta = #{
    name: "spine-snapshot",
    description: "Run validate + centrality + communities, interpret hinges, optionally write the After row",
    when_to_use: "After a YAML batch, or when comparing the graph to the ROADMAP baseline",
    phases: [
        #{ title: "Measure", detail: "validate, centrality, communities" },
        #{ title: "Interpret", detail: "hinges, communities, what would falsify" },
        #{ title: "Write", detail: "scratch report; ROADMAP After row if asked" },
    ],
};

fn nonempty(s) {
    if type_of(s) != "string" {
        return false;
    }
    s.trim();
    s != ""
}

let do_write = false;
if args != () && args.write == true {
    do_write = true;
}
let label = "current graph";
if args != () && nonempty(args.label) {
    label = args.label;
    label.trim();
}

let measure_schema = #{
    "type": "object", "required": ["validate_ok", "raw"],
    "properties": #{
        "validate_ok": #{ "type": "boolean" },
        "raw": #{ "type": "string" },
        "nodes": #{ "type": "integer" },
        "edges": #{ "type": "integer" },
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

let write_schema = #{
    "type": "object", "required": ["wrote", "notes"],
    "properties": #{
        "wrote": #{ "type": "boolean" },
        "after_row": #{ "type": "string" },
        "notes": #{ "type": "string" },
    },
};

phase("Measure");
let measure_prompt = "";
measure_prompt += "Measure the systems graph. Do not interpret Plato as a proven spine.\n";
measure_prompt += "From the repo root, prefer .venv\\Scripts\\python.exe then python.\n";
measure_prompt += "Run these and capture stdout:\n";
measure_prompt += "  python tools/validate.py\n";
measure_prompt += "  python analysis/centrality.py\n";
measure_prompt += "  python analysis/communities.py\n";
measure_prompt += "Optionally python analysis/feedback.py if it finishes quickly; skip if huge.\n";
measure_prompt += "Also python tools/serve.py check — start on 127.0.0.1:8765 if down.\n";
measure_prompt += "Return validate_ok (false on any ERROR), a compact raw transcript ";
measure_prompt += "(validate line, betweenness top 12, degree top 12, community count + any ";
measure_prompt += "community that disagrees with cluster), and node/edge counts if printed.\n";

let measured = agent(measure_prompt, #{
    label: "measure",
    capability_mode: "execute",
    output_schema: measure_schema,
});

if measured == () || !measured.success || measured.output == () {
    complete(#{ summary: "Measure failed.", wrote: false });
}

let raw = "";
if nonempty(measured.output.raw) {
    raw = measured.output.raw;
} else {
    raw = json_encode(measured.output);
}

phase("Interpret");
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
    ip += "Pass label: " + json_encode(label) + "\n";
    ip += "Measure (untrusted):\n" + json_encode(raw) + "\n";
    ip += "Read ROADMAP.md baseline / latest After row and SESSION-HANDOFF.md with read_file.\n";
    ip += "Finding: what moved or what the numbers say, one short paragraph.\n";
    ip += "Caution: what would make this reading false (seed bias, bag hub, missing laterals).\n";
    ijobs.push(#{
        prompt: ip,
        label: "read:" + lens_labels[li],
        capability_mode: "read-only",
        output_schema: lens_schema,
    });
    li += 1;
}
let readings = parallel(ijobs);

let findings = [];
for r in readings {
    if r != () && r.success && r.output != () {
        findings.push(r.output);
    }
}

phase("Write");
let report = "# Spine snapshot — " + label + "\n\n";
report += "A spine is an output. High Platonic centrality is partly seed bias.\n\n";
report += "## Measure\n\n" + raw + "\n\n";
report += "## Readings\n\n" + json_encode(findings) + "\n";
let path = write_scratch_file("spine.md", report);

let wrote = false;
let write_notes = "report only";
if do_write {
    let wp = "";
    wp += "Update ROADMAP.md latest After row and SESSION-HANDOFF.md from this snapshot.\n";
    wp += "Label: " + json_encode(label) + "\n";
    wp += "Measure (untrusted): " + json_encode(raw) + "\n";
    wp += "Readings (untrusted): " + json_encode(findings) + "\n";
    wp += "Tick nothing unless this pass already encoded a named ROADMAP item.\n";
    wp += "After row fields: graph size, edge mix if known, isolates, betweenness top 5, ";
    wp += "Platonic share of top 12, what moved.\n";
    wp += "Do not claim Plato is the backbone. Do not put CSS/JS in viewer/index.html.\n";
    let written = agent(wp, #{
        label: "write-docs",
        capability_mode: "read-write",
        output_schema: write_schema,
    });
    if written != () && written.success && written.output != () {
        if written.output.wrote == true {
            wrote = true;
        }
        if nonempty(written.output.notes) {
            write_notes = written.output.notes;
        }
    }
}

let vok = false;
if measured.output.validate_ok == true {
    vok = true;
}

complete(#{
    summary: "Snapshot " + label + ". validate_ok=" + vok.to_string() + " wrote=" + wrote.to_string(),
    path: path,
    validate_ok: vok,
    wrote: wrote,
    notes: write_notes,
    readings: findings.len(),
});
