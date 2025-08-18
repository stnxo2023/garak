# SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
# SPDX-License-Identifier: Apache-2.0

import filecmp
import json
import subprocess
import sys

from garak import _config

TEMP_PREFIX = "_garak_internal_test_temp"


def test_aggregate_executes() -> None:

    agg_jsonl_output_path = str(
        _config.transient.data_dir
        / _config.reporting.report_dir
        / f"{TEMP_PREFIX}.agg.report.jsonl"
    )
    result = subprocess.run(
        [
            sys.executable,
            "-m",
            "garak.analyze.aggregate_reports",
            "-o",
            agg_jsonl_output_path,
            "tests/_assets/lmrc.report.jsonl",
            "tests/_assets/enc.report.json",
        ],
        check=True,
    )
    assert result.returncode == 0, "aggregate_reports failed"

    with open(agg_jsonl_output_path, "r", encoding="utf8") as agg_f:
        for record in [json.loads(line.strip()) for line in agg_f if line.strip()]:
            pass
    digest = json.loads(record)
    assert (
        record["entry_type"] == "digest"
    ), "digest record missing from aggregated jsonl"
    agg_digest_eval_keys = set(record["eval"].keys())
    assert agg_digest_eval_keys == {
        "lmrc",
        "enc",
    }, f"aggregated digest eval keys not as expected (got {agg_digest_eval_keys})"

    assert filecmp.cmp(
        agg_jsonl_output_path, "tests/_assets/agg.jsonl"
    ), "aggregation output did not match reference"

    result = subprocess.run(
        [
            sys.executable,
            "-m",
            "garak.analyze.report_digest",
            "-r",
            agg_jsonl_output_path,
        ],
        check=True,
    )
    assert result.returncode == 0, "report html generation failed over aggregate"
