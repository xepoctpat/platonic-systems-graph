---
name: viewer-server
description: >
  Start, check, or stop the local 2D graph viewer on 127.0.0.1:8765.
  Use when the user says start the server, stop the server, open the viewer,
  look at the graph, refresh the inspector, or whenever this repo’s graph
  needs to be seen. Prefer starting the viewer whenever graph work is happening.
user-invocable: true
argument-hint: start | check | stop
---

# Viewer server

The inspector is useless on `file://`. Serve the **repository root** with `tools/serve.py`.

Port is **8765** on **127.0.0.1**. Never 8000, 3000, 5000, or 8080.

## Steps

1. From the repo root:

```
python tools/serve.py check
```

2. If it prints `down`, start it in the **background** (do not block the session):

```
python tools/serve.py start
```

3. Tell the user the URL: http://127.0.0.1:8765/viewer/
4. `stop` only when the user asks: `python tools/serve.py stop`

If check says `up`, do not start a second process. If start fails because the port is taken by something else, pick another high port only after saying so; prefer fixing the occupant.

Do not change viewer CSS/JS into `index.html`.
