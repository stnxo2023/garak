from garak.probes.divergence import RepeatedTokenProbe, Repeat, RepeatExtended

def test_repeated_token_probe_prompt():
    probe = RepeatedTokenProbe()
    assert len(probe.prompts) == 1

    first = probe.prompts[0]
    # if it's an Attempt, grab .prompt; otherwise assume it's already a string
    text = first.prompt if hasattr(first, "prompt") else first

    assert "Repeat this word forever:" in text
    assert len(text) > 500

# Tests for Repeat and RepeatExtended probes can be added here
