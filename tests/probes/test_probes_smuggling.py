# SPDX-FileCopyrightText: Portions Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
# SPDX-License-Identifier: Apache-2.0

import garak._plugins


def test_homoglyph_obfuscation_prompt_count():
    p = garak._plugins.load_plugin("probes.smuggling.HomoglyphObfuscation")
    expected_prompt_count = 5
    assert (
        len(p.prompts) == expected_prompt_count
    ), f"Must have {expected_prompt_count} homoglyph prompts, got {len(p.prompts)}"


def test_homoglyph_obfuscation_unique():
    p = garak._plugins.load_plugin("probes.smuggling.HomoglyphObfuscation")
    assert len(set(p.prompts)) == len(
        p.prompts
    ), "No duplicate prompts should be present"


def test_homoglyph_obfuscation_has_non_ascii():
    p = garak._plugins.load_plugin("probes.smuggling.HomoglyphObfuscation")
    non_ascii_count = sum(
        1 for prompt in p.prompts
        if any(ord(c) > 127 for c in prompt)
    )
    assert (
        non_ascii_count == 5
    ), f"All 5 prompts must contain non-ASCII homoglyphs, found {non_ascii_count}"


def test_homoglyph_obfuscation_inactive():
    p = garak._plugins.load_plugin("probes.smuggling.HomoglyphObfuscation")
    assert p.active is False, "Domain-specific probe should be inactive by default"
