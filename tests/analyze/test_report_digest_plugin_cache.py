# SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
# SPDX-License-Identifier: Apache-2.0

import io
import json

import pytest

from garak import _config
import garak._plugins
import garak.analyze.report_digest as report_digest


def _complete_plugin_cache():
    return {
        "probes": {
            "probes.test.Blank": {
                "description": "Frozen probe description",
                "tags": [],
                "tier": 1,
            }
        },
        "detectors": {
            "detectors.always.Pass": {
                "description": "Frozen detector description",
            }
        },
    }


def _write_report(
    tmp_path,
    plugin_cache=None,
    eval_probe="test.Blank",
    eval_detector="always.Pass",
):
    _config.load_base_config()
    report_path = tmp_path / "plugin_cache.report.jsonl"
    records = [
        {
            "entry_type": "start_run setup",
            "plugins.probe_spec": eval_probe,
            "plugins.target_type": "test",
            "plugins.target_name": "Blank",
        },
        {
            "entry_type": "init",
            "garak_version": "test",
            "start_time": "2026-01-01T00:00:00",
            "run": "test-run",
        },
    ]
    if plugin_cache is not None:
        records.append(
            {
                "entry_type": "plugin_cache",
                "run": "test-run",
                "plugin_cache": plugin_cache,
            }
        )
    records.append(
        {
            "entry_type": "eval",
            "probe": eval_probe,
            "detector": eval_detector,
            "passed": 1,
            "total_evaluated": 1,
            "fails": 0,
            "nones": 0,
            "total_processed": 1,
        }
    )

    with report_path.open("w", encoding="utf-8") as reportfile:
        for record in records:
            reportfile.write(json.dumps(record, ensure_ascii=False) + "\n")

    return report_path


def test_parse_report_captures_plugin_cache_entries_and_merges():
    report = io.StringIO(
        "\n".join(
            [
                json.dumps(
                    {
                        "entry_type": "plugin_cache",
                        "plugin_cache": {
                            "probes": {"probes.test.Blank": {"tags": []}}
                        },
                    }
                ),
                json.dumps(
                    {
                        "entry_type": "plugin_cache",
                        "plugin_cache": {
                            "probes": {
                                "probes.test.Test": {"tags": ["avid:test"]}
                            }
                        },
                    }
                ),
            ]
        )
    )

    *_, plugin_cache = report_digest._parse_report(report)

    assert set(plugin_cache["probes"]) == {
        "probes.test.Blank",
        "probes.test.Test",
    }


def test_resolve_plugin_info_prefers_header(mocker):
    live_cache = mocker.patch.object(
        garak._plugins.PluginCache,
        "plugin_info",
        side_effect=AssertionError("live cache should not be used"),
    )

    meta, source = report_digest._resolve_plugin_info(
        "probes.test.Blank",
        _complete_plugin_cache(),
        required_fields=("description", "tags", "tier"),
    )

    assert source == "header"
    assert meta["description"] == "Frozen probe description"
    live_cache.assert_not_called()


def test_resolve_plugin_info_uses_live_cache_for_legacy_reports(mocker):
    live_cache = mocker.patch.object(
        garak._plugins.PluginCache,
        "plugin_info",
        return_value={"description": "Live description", "tags": [], "tier": 1},
    )

    meta, source = report_digest._resolve_plugin_info(
        "probes.test.Blank",
        None,
        required_fields=("description", "tags", "tier"),
    )

    assert source == "live_cache"
    assert meta["description"] == "Live description"
    live_cache.assert_called_once_with("probes.test.Blank")


def test_build_digest_rejects_missing_plugin_cache_entry(tmp_path):
    report_path = _write_report(
        tmp_path,
        plugin_cache={
            "probes": {
                "probes.test.Blank": {
                    "description": "Frozen probe description",
                    "tags": [],
                    "tier": 1,
                }
            }
        },
    )

    with pytest.raises(ValueError, match="plugin_cache missing metadata"):
        report_digest.build_digest(str(report_path))


def test_build_digest_rejects_missing_required_plugin_cache_field(tmp_path):
    report_path = _write_report(
        tmp_path,
        plugin_cache={
            "probes": {
                "probes.test.Blank": {
                    "description": "Frozen probe description",
                    "tags": [],
                }
            },
            "detectors": {
                "detectors.always.Pass": {
                    "description": "Frozen detector description",
                }
            },
        },
    )

    with pytest.raises(ValueError, match="missing fields"):
        report_digest.build_digest(str(report_path))


def test_build_digest_records_header_plugin_cache_source(tmp_path):
    report_path = _write_report(tmp_path, plugin_cache=_complete_plugin_cache())

    digest = report_digest.build_digest(str(report_path))

    assert digest["meta"]["plugin_cache_source"] == "header"


def test_build_digest_records_live_cache_source_for_legacy_report(tmp_path):
    report_path = _write_report(tmp_path)

    digest = report_digest.build_digest(str(report_path))

    assert digest["meta"]["plugin_cache_source"] == "live_cache"
