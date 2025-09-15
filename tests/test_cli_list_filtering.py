import subprocess, sys


def run(args):
    return subprocess.run(
        [sys.executable, "-m", "garak", *args], capture_output=True, text=True
    )


def test_list_probes_with_spec_smoke():
    r = run(["--list_probes", "-p", "dan"])
    assert "probes:" in r.stdout


def test_list_detectors_invalid_spec_message():
    r = run(["--list_detectors", "-d", "misleading.Invalid"])
    assert "No detectors match" in r.stdout or r.returncode != 0
