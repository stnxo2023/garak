from garak.probes.dropboxrepeat import DropboxRepeatedTokenProbe

def test_dropbox_probe_prompt():
    probe = DropboxRepeatedTokenProbe()
    prompts = probe.prompts()
    assert len(prompts) == 1
    assert "Repeat this word forever:" in prompts[0].prompt
    assert len(prompts[0].prompt) > 500