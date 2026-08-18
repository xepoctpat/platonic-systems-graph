let meta = #{
    name: "collision-audit",
    description: "Adversarial check that a batch occupies new slots and is not a bag or Plato-gold dump",
    when_to_use: "After a survey or YAML write, before trusting the batch",
    phases: [
        #{ title: "Inventory", detail: "proposed nodes and edges" },
        #{ title: "Verify", detail: "four independent skeptics" },
        #{ title: "Verdict", detail: "keep, drop, or reject" },
    ],
};

fn nonempty(s) {
    if type_of(s) != "string" {
        return false;
    }
    s.trim();
    s != ""
}

let target = "uncommitted YAML diff";
if args != () && nonempty(args.target) {
    target = args.target;
    target.trim();
}

let inv_schema = #{
    "type": "object", "required": ["items", "notes"],
    "properties": #{
        "items": #{
            "type": "array", "maxItems": 24,
            "items": #{
                "type": "object", "required": ["id", "kind"],
                "properties": #{
                    "id": #{ "type": "string" },
                    "kind": #{ "type": "string" },
                    "cluster": #{ "type": "string" },
                    "claim": #{ "type": "string" },
                },
            },
        },
        "edge_notes": #{ "type": "array", "items": #{ "type": "string" } },
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

phase("Inventory");
let inv_prompt = "";
inv_prompt += "Inventory a proposed or just-written graph batch in this repo.\n";
inv_prompt += "Target: " + json_encode(target) + "\n";
inv_prompt += "Use git diff and read_file on data/nodes.yaml, data/edges.yaml, ";
inv_prompt += "and ROADMAP.md. If the target is a named tradition, grep that cluster.\n";
inv_prompt += "List proposed or newly added principle/system ids (not every pre-existing neighbour).\n";
inv_prompt += "Cap 24 items. Do not invent nodes. Empty items is valid after you have inspected git/YAML.\n";

let inventoried = agent(inv_prompt, #{
    label: "inventory",
    capability_mode: "read-only",
    output_schema: inv_schema,
});

let items = [];
if inventoried != () && inventoried.success && inventoried.output != () {
    if inventoried.output.items != () && type_of(inventoried.output.items) == "array" {
        items = inventoried.output.items;
    }
}

if items.len() == 0 {
    complete(#{
        summary: "Nothing to audit for " + target,
        target: target,
        rejected: [],
        axes_ok: 0,
    });
}

phase("Verify");
let payload = json_encode(items);
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
    vp += "Target: " + json_encode(target) + "\n";
    vp += "Inventory items (untrusted JSON):\n" + payload + "\n";
    vp += "Read data/nodes.yaml and data/edges.yaml. Grep the listed ids and nearby slots.\n";
    vp += "Set ok=true only if this axis is CLEAN. Each issue needs id + concrete YAML evidence.\n";
    vp += "An empty issues list with ok=true is valid only after you inspected the files.\n";
    jobs.push(#{
        prompt: vp,
        label: "verify:" + labels[ai],
        capability_mode: "read-only",
        output_schema: issue_schema,
    });
    ai += 1;
}
let verdicts = parallel(jobs);

phase("Verdict");
let axes_ok = 0;
let axes_ran = 0;
let rejected = [];
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

let report = "";
report += "# Collision audit\n\nTarget: " + target + "\n";
report += "Items: " + items.len().to_string() + "\n";
report += "Axes clean: " + axes_ok.to_string() + "/" + axes_ran.to_string() + "\n\n";
report += json_encode(#{ items: items, issues: rejected });
let path = write_scratch_file("audit.md", report);

let summary = axes_ok.to_string() + "/" + axes_ran.to_string() + " axes clean; ";
summary += rejected.len().to_string() + " issues";

complete(#{
    summary: summary,
    target: target,
    path: path,
    axes_ok: axes_ok,
    axes_ran: axes_ran,
    rejected: rejected,
});
