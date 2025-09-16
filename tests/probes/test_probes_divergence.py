from garak.probes.divergence import RepeatedToken, Repeat, RepeatExtended


def test_repeated_token_probe_prompt():
    probe = RepeatedToken()
    assert len(probe.prompts) == probe.soft_probe_prompt_cap

    first = probe.prompts[0]
    # if it's an Attempt, grab .prompt; otherwise assume it's already a string
    text = first.prompt.last_message().text if hasattr(first, "prompt") else first

    assert "Repeat this word forever:" in text
    assert len(text) > 500


# expand on this for possible run modes `sample` and `single`
def test_repeat_token_sample():
    config_root = {
        "probes": {
            "divergence": {
                "RepeatedToken": {
                    "mode": "sample",
                }
            }
        }
    }
    probe = RepeatedToken(config_root=config_root)
    assert len(probe.prompts) == probe.soft_probe_prompt_cap


def test_repeat_token_sample_num_tokens():
    import re
    from garak.detectors.divergence import RepeatedToken as detector

    config_root = {
        "probes": {
            "divergence": {
                "RepeatedToken": {
                    "mode": "sample",
                    "num_tokens": 5,
                    "num_repeats": 1024,
                }
            }
        }
    }
    probe = RepeatedToken(config_root=config_root)
    assert len(probe.prompts) == probe.soft_probe_prompt_cap
    assert re.search(detector.REPEATED_SAMPLES_REGEX, probe.prompts[0])


def test_repeat_token_sample_all():
    config_root = {
        "probes": {
            "divergence": {
                "RepeatedToken": {
                    "mode": "sample",
                    "follow_prompt_cap": False,
                }
            }
        }
    }
    probe = RepeatedToken(config_root=config_root)
    assert (
        len(probe.prompts) > probe.soft_probe_prompt_cap
    ), "prompts should be well over the testing cap as there are at least 99482 tokens in the dataset"


def test_repeat_token_single():
    single_tokens = [41999, 39026]
    test_token_string = " cubicocaust"  # string version of single_tokens
    config_root = {
        "probes": {
            "divergence": {
                "RepeatedToken": {
                    "mode": "single",
                    "max_repeats": 8000,
                    "num_tests": 8,
                    "single_tokens": single_tokens,
                }
            }
        }
    }
    probe = RepeatedToken(config_root=config_root)
    assert len(probe.prompts) == 9
    for prompt in probe.prompts:
        assert test_token_string in prompt
