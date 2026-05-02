import os
import pytest
import tempfile
import garak.generators.ggml
from garak.attempt import Conversation, Message, Turn

STORED_ENV = os.getenv(garak.generators.ggml.ENV_VAR)
MODEL_NAME = None


@pytest.fixture(autouse=True)
def set_fake_env() -> None:
    os.environ[garak.generators.ggml.ENV_VAR] = os.path.abspath(__file__)


def test_init_bad_app():
    with pytest.raises(RuntimeError) as exc_info:
        del os.environ[garak.generators.ggml.ENV_VAR]
        garak.generators.ggml.GgmlGenerator(MODEL_NAME)
    assert "not provided by environment" in str(exc_info.value)


def test_init_missing_model():
    model_name = tempfile.TemporaryFile().name
    with pytest.raises(FileNotFoundError) as exc_info:
        garak.generators.ggml.GgmlGenerator(model_name)
    assert "File not found" in str(exc_info.value)


def test_init_bad_model():
    with tempfile.NamedTemporaryFile(
        mode="w", suffix="_test_model.gguf", encoding="utf-8", delete=False
    ) as file:
        file.write(file.name)
        file.close()
        with pytest.raises(RuntimeError) as exc_info:
            garak.generators.ggml.GgmlGenerator(file.name)
        os.remove(file.name)
        assert "not in GGUF" in str(exc_info.value)


def test_init_good_model():
    with tempfile.NamedTemporaryFile(suffix="_test_model.gguf", delete=False) as file:
        file.write(garak.generators.ggml.GGUF_MAGIC)
        file.close()
        g = garak.generators.ggml.GgmlGenerator(file.name)
        os.remove(file.name)
        assert type(g) is garak.generators.ggml.GgmlGenerator


def test_command_args_list():
    """ensure command list overrides apply and `extra_ggml_params` are in correct relative order"""
    with tempfile.NamedTemporaryFile(suffix="_test_model.gguf", delete=False) as file:
        file.write(garak.generators.ggml.GGUF_MAGIC)
        file.close()

        gen_config = {
            "extra_ggml_flags": [
                "test_value",
                "another_value",
            ],
            "extra_ggml_params": {
                "custom_param": "custom_value",
            },
        }

        config_root = {"generators": {"ggml": {"GgmlGenerator": gen_config}}}

        g = garak.generators.ggml.GgmlGenerator(file.name, config_root=config_root)
        arg_list = g._command_args_list()
        for arg in gen_config["extra_ggml_flags"]:
            assert arg in arg_list
        for arg, value in gen_config["extra_ggml_params"].items():
            assert arg in arg_list
            assert value in arg_list
            arg_index = arg_list.index(arg)
            value_index = arg_list.index(value)
            assert arg_index + 1 == value_index

        os.remove(file.name)
        assert type(g) is garak.generators.ggml.GgmlGenerator


def test_call_model_removes_echoed_prompt(tmp_path, monkeypatch):
    model_path = tmp_path / "test_model.gguf"
    model_path.write_bytes(garak.generators.ggml.GGUF_MAGIC)

    fake_llama = tmp_path / "llama-cli"
    fake_llama.write_text("", encoding="utf-8")
    monkeypatch.setenv(garak.generators.ggml.ENV_VAR, str(fake_llama))

    generator = garak.generators.ggml.GgmlGenerator(str(model_path))
    prompt = Conversation([Turn("user", Message("prompt:"))])
    captured = {}

    def fake_run(command, stdout, stderr, check):
        captured["command"] = command
        assert stdout == garak.generators.ggml.subprocess.PIPE
        assert stderr == garak.generators.ggml.subprocess.PIPE
        assert check == generator.exception_on_failure
        prompt_arg = command[command.index("-p") + 1]
        return garak.generators.ggml.subprocess.CompletedProcess(
            args=command,
            returncode=0,
            stdout=f"{prompt_arg}response\n".encode("utf-8"),
            stderr=b"",
        )

    monkeypatch.setattr(garak.generators.ggml.subprocess, "run", fake_run)

    result = generator._call_model(prompt)

    command = captured["command"]
    assert command[0] == str(fake_llama)
    assert command[command.index("-p") + 1] == "prompt:"
    assert command[command.index("-m") + 1] == str(model_path)
    assert len(result) == 1
    assert isinstance(result[0], Message)
    assert result[0].text == "response\n"
