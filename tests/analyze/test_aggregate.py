# SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
# SPDX-License-Identifier: Apache-2.0

import filecmp
import json
import subprocess
import sys

from garak import _config
import garak.analyze.report_digest

TEMP_PREFIX = "_garak_internal_test_temp"


def test_aggregate_executes() -> None:

    _config.load_base_config()

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
            "tests/_assets/enc.report.jsonl",
        ],
        check=True,
    )
    assert result.returncode == 0, "aggregate_reports failed"

    digest = garak.analyze.report_digest._get_report_digest(agg_jsonl_output_path)
    assert digest != False, "digest record missing from aggregated jsonl"

    agg_digest_eval_keys = set(digest["eval"].keys())
    assert agg_digest_eval_keys == {
        "lmrc",
        "encoding",
    }, f"aggregated digest eval keys not as expected (got {agg_digest_eval_keys})"

    with open(agg_jsonl_output_path, encoding="utf-8") as agg_jsonl_output_file:
        agg_lines = agg_jsonl_output_file.readlines()

    with open("tests/_assets/agg.jsonl", encoding="utf-8") as ref_jsonl_output_file:
        ref_lines = ref_jsonl_output_file.readlines()

    assert len(agg_lines) == len(
        ref_lines
    ), f"unexpected aggregate line count, expected {len(ref_lines)} got {len(agg_lines)}"

    # skip calibration
    agg_lines.pop(0)
    ref_lines.pop(0)

    for i in range(len(agg_lines)):
        agg_rec = json.loads(agg_lines[i])
        ref_rec = json.loads(ref_lines[i])

        if i == 0:  # init line
            assert agg_rec["orig_uuid"] == ref_rec["orig_uuid"]
            assert agg_rec["orig_start_time"] == ref_rec["orig_start_time"]
            continue

        if "uuid" in ref_rec:
            del (
                ref_rec["uuid"],
                agg_rec["uuid"],
            )  # key not found in agg rec means agg rec is out of sync (test fail)

        if ref_rec["entry_type"] == "digest":
            del ref_rec["meta"]["run_uuid"], agg_rec["meta"]["run_uuid"]

        assert (
            agg_rec == ref_rec
        ), f"aggregated data mismatch in line {i+1}, expected\n{ref_rec}\ngot\n{agg_rec}"

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
