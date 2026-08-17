"""Serve the repository root so the 2D viewer can fetch YAML.

Binds 127.0.0.1:8765 (a high port; not 8000/3000/5000/8080).
Stdlib only. Run from anywhere; the script finds the repo root.

  python tools/serve.py          # start (no-op if already up)
  python tools/serve.py check    # exit 0 if up, 1 if down
  python tools/serve.py stop     # stop the process we started
  python tools/serve.py url
"""

from __future__ import annotations

import argparse
import os
import signal
import socket
import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

HOST = "127.0.0.1"
PORT = 8765
ROOT = Path(__file__).resolve().parent.parent
PID_FILE = ROOT / ".viewer-serve.pid"
URL = f"http://{HOST}:{PORT}/viewer/"


def _listening() -> bool:
    try:
        with socket.create_connection((HOST, PORT), timeout=0.4):
            return True
    except OSError:
        return False


def _pid_alive(pid: int) -> bool:
    if pid <= 0:
        return False
    try:
        os.kill(pid, 0)
    except OSError:
        return False
    return True


def _read_pid() -> int | None:
    if not PID_FILE.exists():
        return None
    try:
        pid = int(PID_FILE.read_text(encoding="utf-8").strip())
    except ValueError:
        return None
    return pid if _pid_alive(pid) else None


def cmd_url() -> int:
    print(URL)
    return 0


def cmd_check() -> int:
    if _listening():
        print(f"up  {URL}")
        return 0
    print(f"down  {URL}")
    return 1


def cmd_stop() -> int:
    pid = _read_pid()
    if pid is None and not _listening():
        print("not running")
        if PID_FILE.exists():
            PID_FILE.unlink()
        return 0
    if pid is None:
        print(f"port {PORT} is in use, but not by this script (no pid file). Stop it by hand.")
        return 1
    if sys.platform == "win32":
        os.system(f"taskkill /PID {pid} /F >NUL 2>&1")
    else:
        try:
            os.kill(pid, signal.SIGTERM)
        except OSError as exc:
            print(exc)
            return 1
    if PID_FILE.exists():
        PID_FILE.unlink()
    print("stopped")
    return 0


def cmd_start() -> int:
    if _listening():
        print(f"already up  {URL}")
        return 0
    os.chdir(ROOT)
    PID_FILE.write_text(str(os.getpid()), encoding="utf-8")
    handler = SimpleHTTPRequestHandler
    try:
        server = ThreadingHTTPServer((HOST, PORT), handler)
    except OSError as exc:
        print(f"could not bind {HOST}:{PORT}: {exc}")
        if PID_FILE.exists():
            PID_FILE.unlink()
        return 1
    print(f"serving {ROOT}")
    print(URL)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nstopped")
    finally:
        server.server_close()
        if PID_FILE.exists():
            PID_FILE.unlink()
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description="Serve the systems-graph viewer.")
    parser.add_argument(
        "command",
        nargs="?",
        default="start",
        choices=("start", "check", "stop", "url"),
    )
    args = parser.parse_args()
    return {"start": cmd_start, "check": cmd_check, "stop": cmd_stop, "url": cmd_url}[
        args.command
    ]()


if __name__ == "__main__":
    raise SystemExit(main())
