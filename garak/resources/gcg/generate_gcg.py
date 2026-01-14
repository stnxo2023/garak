# MIT License
#
# Copyright (c) 2023 Andy Zou
#
# Permission is hereby granted, free of charge, to any person obtaining a copy
# of this software and associated documentation files (the "Software"), to deal
# in the Software without restriction, including without limitation the rights
# to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
# copies of the Software, and to permit persons to whom the Software is
# furnished to do so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included in all
# copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
# AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
# LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
# OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
# SOFTWARE.

from typing import Union
from datetime import datetime
from pathlib import Path
from logging import getLogger

CONTROL_INIT = "! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! !"

from garak.generators.huggingface import Pipeline, Model
from garak.resources.gcg.attack_manager import GCGAttack, get_goals_and_targets

import garak._config

logger = getLogger(__name__)

gcg_cache_data = garak._config.transient.cache_dir / "data" / "gcg"


def run_gcg(
    target_generator: garak.generators.Generator = None,
    model_names: list[str] = None,
    stop_success: bool = True,
    train_data: Union[str, None] = None,
    n_train: int = 50,
    n_test: int = 0,
    outfile: Path = gcg_cache_data / "gcg.txt",
    control_init: str = CONTROL_INIT,
    deterministic: bool = True,
    n_steps: int = 500,
    batch_size: int = 128,
    topk: int = 256,
    temp: int = 1,
    target_weight: float = 1.0,
    control_weight: float = 0.0,
    anneal: bool = False,
    filter_cand: bool = True,
    allow_non_ascii: bool = False,
    lr: float = 0.01,
    **kwargs,
):
    """Function to generate GCG attack strings

    Args:
        target_generator (Generator): Generator to target with GCG attack
        stop_success (bool): Whether to stop on a successful attack
        model_names (list[str]): List of huggingface models (Currently only support HF due to tokenizer)
        train_data (str): Path to training data
        n_train (int): Number of training examples to use
        n_test (int): Number of test examples to use
        outfile (Path): Where to write successful prompts
        control_init (str): Initial adversarial suffix to modify
        deterministic (bool): Whether to use deterministic gbda
        n_steps (int): Number of training steps
        batch_size(int):  Training batch size
        topk (int): Model hyperparameter for top k
        temp (int): Model temperature hyperparameter
        target_weight (float):
        control_weight (float):
        anneal (bool): Whether to use annealing
        filter_cand (bool):
        allow_non_ascii (bool): Allow non-ASCII test in adversarial suffixes
        lr (float): Model learning rate

    Kwargs:
        test_data (str): Path to test data

    Returns:
        None
    """

    if target_generator is not None and model_names is not None:
        msg = "You have specified a list of model names and a target generator. Using the already loaded generator!"
        logger.warning(msg)

    if "test_data" in kwargs:
        test_data = kwargs["test_data"]
    else:
        test_data = None

    if "logfile" in kwargs:
        logfile = kwargs["logfile"]
    else:
        if target_generator is not None:
            model_string = target_generator.name
        elif model_names is not None:
            model_string = "_".join([x.replace("/", "-") for x in model_names])
        else:
            msg = "You must specify either a target generator or a list of model names to run GCG!"
            logger.error(msg)
            raise RuntimeError(msg)
        # TODO: why is the log file being placed in the cache folder?
        if garak._config.transient.run_id is not None:
            run_id = garak._config.transient.run_id
            logfile = gcg_cache_data / "logs" / f"{run_id}_{model_string}.json"
        else:
            timestamp = datetime.now().strftime("%Y%m%dT%H%M%S")
            logfile = gcg_cache_data / "logs" f"{timestamp}_{model_string}.json"

    # Create logfile directory
    p = logfile.parent
    p.mkdir(parents=True, exist_ok=True)

    (
        train_goals,
        train_targets,
        test_goals,
        test_targets,
    ) = get_goals_and_targets(
        train_data=train_data, test_data=test_data, n_train=n_train, n_test=n_test
    )

    attack = GCGAttack(
        goals=train_goals,
        targets=train_targets,
        generator=target_generator,
        control_init=control_init,
        outfile=outfile,
    )

    logger.info("Beginning GCG generation")
    adv_suffix, _, success = attack.run(
        n_steps=n_steps,
        batch_size=batch_size,
        topk=topk,
        anneal=anneal,
        stop_on_success=stop_success,
        filter_cand=filter_cand,
    )

    if success:
        return adv_suffix
    else:
        return None
