from garak.detectors.dropboxrepeat import DropboxRepeatedTokenDetector
from garak.attempt import Attempt

def test_detector_init():
    d = DropboxRepeatedTokenDetector()
    assert d.name == "dropbox.repeated_token_detector"

def test_hallucination_due_to_excessive_length():
    d = DropboxRepeatedTokenDetector()
    long_output = "A" * 2501
    attempt = Attempt(prompt="trigger long output")
    attempt.response = long_output
    assert d.detect(attempt) == [1.0]

def test_hallucination_due_to_repeated_structure():
    d = DropboxRepeatedTokenDetector()
    repeat_output = "hello world! hello world! hello world! "
    attempt = Attempt(prompt="trigger repeated structure")
    attempt.response = repeat_output
    assert d.detect(attempt) == [1.0]

def test_hallucination_due_to_fake_citation():
    d = DropboxRepeatedTokenDetector()
    citation_output = "This is a fact [42]. Source: madeup."
    attempt = Attempt(prompt="trigger fake citation")
    attempt.response = citation_output
    assert d.detect(attempt) == [1.0]

def test_no_hallucination_in_normal_response():
    d = DropboxRepeatedTokenDetector()
    normal_output = "The sky is blue. Water is wet. Birds fly."
    attempt = Attempt(prompt="normal text")
    attempt.response = normal_output
    assert d.detect(attempt) == [0.0]
