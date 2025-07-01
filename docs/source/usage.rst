..  headings: = - ^ "
Getting Started
===============

The general syntax is:

.. code-block:: console

   garak <options>

You must specify at least the model to scan with the ``--model_name`` option.
By default, garak runs all the probes on the model and uses the vulnerability detectors recommended by each probe.
You can limit the probes to run by specifying more options.

You can list the probes by running the following command:

.. code-block:: console

    garak --list_probes

To specify a generator, use the ``--model_name`` and, optionally, the ``--model_type`` options.
Model name specifies a model family/interface; model type specifies the exact model to be used.
The "Intro to generators" section below describes some of the generators supported.
A straightfoward generator family is Hugging Face models; to load one of these, set ``--model_name`` to ``huggingface`` and ``--model_type`` to the model's name on Hub (e.g. "RWKV/rwkv-4-169m-pile").
Some generators might need an API key to be set as an environment variable, and they'll let you know if they need that.

``garak`` runs all the probes by default, but you can be specific about that too.
``--probes promptinject`` will use only the `PromptInject <https://github.com/agencyenterprise/promptinject>`_ framework's methods, for example.
You can also specify one specific plugin instead of a plugin family by adding the plugin name after a ``.``; for example, ``--probes lmrc.SlurUsage`` will use an implementation of checking for models generating slurs based on the `Language Model Risk Cards <https://arxiv.org/abs/2303.18190>`_ framework.


Sample Usage
------------

Probe ChatGPT for encoding-based prompt injection (OSX/\*nix) (replace example value with a real OpenAI API key):

.. code-block:: console

    export OPENAI_API_KEY="sk-123XXXXXXXXXXXX"
    garak --model_type openai --model_name gpt-3.5-turbo --probes encoding


See if the Hugging Face version of GPT2 is vulnerable to DAN 11.0:

.. code-block:: console

    garak --model_type huggingface --model_name gpt2 --probes dan.Dan_11_0
