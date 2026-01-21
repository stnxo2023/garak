Run analysis
============

Processing run results is a core part of getting actionable information out of a ``garak`` run.
We provide a range of scripts and constructs under ``garak.analyze`` that assist in this.

aggregate_reports
-----------------

Aggregate multiple garak reports on the same generator. 
Useful for e.g. assembling a report that's been run one probe at a time.

Invoke and see usage via command line via ``python -m garak.analyze.aggregate_reports``

.. automodule:: garak.analyze.aggregate_reports
   :members:
   :undoc-members:
   :show-inheritance:


analyze_log
-----------

Analyze a garak ``report.jsonl`` log file.
Print out summary stats, and which prompts led to failures.

Invoke and see usage via command line via ``python -m garak.analyze.analyze_log``

.. automodule:: garak.analyze.analyze_log
   :members:
   :undoc-members:
   :show-inheritance:

calibration
-----------

Module for code around calibrating garak (i.e. calculating bases for relative/Z-scores)

.. automodule:: garak.analyze.calibration
   :members:
   :undoc-members:
   :show-inheritance:


count_tokens
------------

Count the number of characters sent and received based on prompts, outputs, and generations

Invoke and see usage via command line via ``python -m garak.analyze.count_tokens``

.. automodule:: garak.analyze.count_tokens
   :members:
   :undoc-members:
   :show-inheritance:


get_tree
--------

If a TreeSearchProbe probe was used (:doc:`garak.probes.base`), display the tree of items explored during the run.

Invoke and see usage via command line via ``python -m garak.analyze.get_tree``

.. automodule:: garak.analyze.get_tree
   :members:
   :undoc-members:
   :show-inheritance:


misp
----

Reporting on category-level information; categories denoted internally in MISP format.

Invoke and see usage via command line via ``python -m garak.analyze.misp``

.. automodule:: garak.analyze.misp
   :members:
   :undoc-members:
   :show-inheritance:



perf_stats
----------

Calculate a ``garak`` calibration from a set of ``report.jsonl`` outputs.
For more details, see :doc:`reporting.calibration`

Invoke and see usage via command line via ``python -m garak.analyze.perf_stats``

.. automodule:: garak.analyze.perf_stats
   :members:
   :undoc-members:
   :show-inheritance:



qual_review
-----------

Generate a qualitative review of a garak report, and highlight heavily failing probes in Markdown report.
Gives ten positive and ten negative examples from failing probes
Takes a ``report.jsonl``, and an optional ``bag.json`` (e.g. ``data/calibration/calibration.json`` by default) as input


Invoke and see usage via command line via ``python -m garak.analyze.qual_review``

.. automodule:: garak.analyze.qual_review
   :members:
   :undoc-members:
   :show-inheritance:

report_avid
-----------

Prints an AVID (`<https://avidml.org/>`_) report given a garak report in jsonl.

Invoke and see usage via command line via ``python -m garak.analyze.report_avid``

.. automodule:: garak.analyze.report_avid
   :members:
   :undoc-members:
   :show-inheritance:


report_digest
-------------

Generate reports from garak report JSONL.

Invoke and see usage via command line via ``python -m garak.analyze.report_digest``

.. automodule:: garak.analyze.report_digest
   :members:
   :undoc-members:
   :show-inheritance:




