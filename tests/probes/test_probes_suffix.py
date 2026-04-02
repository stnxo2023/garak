# SPDX-FileCopyrightText: Portions Copyright (c) 2023 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
# SPDX-License-Identifier: Apache-2.0

from garak import _config


def test_gcgcached_respects_soft_probe_prompt_cap():
    original_cap = _config.run.soft_probe_prompt_cap
    _config.run.soft_probe_prompt_cap = 10
    try:
        from garak.probes.suffix import GCGCached

        probe = GCGCached()
        assert (
            len(probe.prompts) <= 10
        ), f"GCGCached has {len(probe.prompts)} prompts, expected at most 10"
    finally:
        _config.run.soft_probe_prompt_cap = original_cap
