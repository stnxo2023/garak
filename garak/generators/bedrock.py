"""AWS Bedrock generator

Supports foundation models available through AWS Bedrock using standard AWS authentication.

To get started with this generator:

#. Visit https://docs.aws.amazon.com/bedrock/latest/userguide/models-supported.html
   to see available models
#. Set up AWS credentials: https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html or a Bedrock API Key
#. Run garak with --target_type bedrock and --target_name <model-id>

"""

import logging
import os
from typing import List, Union

import backoff

from garak import _config
from garak.attempt import Message, Conversation
import garak.exception
from garak.generators.base import Generator

MODEL_ALIASES = {
    "claude-4-5-haiku": "global.anthropic.claude-haiku-4-5-20251001-v1:0",
    "claude-4-5-sonnet": "global.anthropic.claude-sonnet-4-5-20250929-v1:0",
    "claude-4-1-opus": "us.anthropic.claude-opus-4-1-20250805-v1:0",  # US Inference Endpoint
    "claude-4-opus": "us.anthropic.claude-opus-4-20250514-v1:0",  # US Inference Endpoint
    "claude-4-sonnet": "global.anthropic.claude-sonnet-4-20250514-v1:0",
    "nova-premier": "us.amazon.nova-premier-v1:0",  # US Inference Endpoint
    "nova-pro": "us.amazon.nova-pro-v1:0",  # US Inference Endpoint
    "nova-lite": "us.amazon.nova-lite-v1:0",  # US Inference Endpoint
    "nova-micro": "us.amazon.nova-micro-v1:0",  # US Inference Endpoint
}

DEFAULT_CLASS = "BedrockGenerator"


class BedrockGenerator(Generator):
    """Interface for AWS Bedrock foundation models using Converse API"""

    active = True
    generator_family_name = "Bedrock"
    supports_multiple_generations = False

    DEFAULT_PARAMS = Generator.DEFAULT_PARAMS | {
        "temperature": 0.7,
        "top_p": 1.0,
        "stop": [],
        "region": None,
    }

    def __init__(self, name="", config_root=_config):
        """Initialize the Bedrock generator.

        Args:
            name: Model name or alias (e.g., "claude-3-sonnet" or full model ID)
            config_root: Configuration root object
        """
        self.name = name
        self._load_config(config_root)

        # Resolve model aliases to full model IDs
        if self.name in MODEL_ALIASES:
            resolved_name = MODEL_ALIASES[self.name]
            logging.info(f"Resolved model alias '{self.name}' to: {resolved_name}")
            self.name = resolved_name

        # Validate model ID is supported
        if self.name and self.name not in MODEL_ALIASES.values():
            supported_models = "\n  - ".join(sorted(MODEL_ALIASES.values()))
            supported_aliases = "\n  - ".join(sorted(MODEL_ALIASES.keys()))
            raise ValueError(
                f"Model '{self.name}' is not in the list of supported Bedrock models.\n"
                f"Supported model IDs:\n  - {supported_models}\n"
                f"Supported aliases:\n  - {supported_aliases}"
            )

        # Call parent __init__
        super().__init__(self.name, config_root=config_root)

        # Load the boto3 client
        self._load_client()

    def _load_client(self):
        """Load and configure the boto3 bedrock-runtime client.

        Uses boto3's standard credential chain for authentication.
        """
        try:
            import boto3
        except ImportError:
            raise ImportError(
                "boto3 is required for the Bedrock generator. "
                "Install it with: pip install boto3"
            )

        # Determine region
        region = (
            self.region
            or os.getenv("AWS_REGION")
            or os.getenv("AWS_DEFAULT_REGION")
            or "us-east-1"
        )
        self.client = boto3.client(
            service_name="bedrock-runtime",
            region_name=region,
        )

        logging.info(f"Loaded boto3 bedrock-runtime client for region {region}")

    def _clear_client(self):
        """Clear the boto3 client to enable object pickling."""
        if hasattr(self, "client"):
            self.client = None

    def __getstate__(self):
        """Prepare object for pickling by clearing the boto3 client."""
        self._clear_client()
        return self.__dict__

    def __setstate__(self, state):
        """Restore object from pickle and reload the boto3 client."""
        self.__dict__.update(state)
        self._load_client()

    @staticmethod
    def _should_not_retry(exception) -> bool:
        """Determine if an exception should not be retried."""
        try:
            from botocore.exceptions import ClientError

            if isinstance(exception, ClientError):
                error_code = exception.response.get("Error", {}).get("Code", "")
                # Don't retry on validation errors or access denied
                if error_code in ["ValidationException", "AccessDeniedException"]:
                    return True
        except ImportError:
            pass

        return False

    @backoff.on_exception(
        backoff.fibo,
        (
            Exception,  # Catch boto3 ClientError and other exceptions
            garak.exception.GarakBackoffTrigger,
        ),
        max_value=70,
        giveup=lambda e: BedrockGenerator._should_not_retry(e),
    )
    def _call_model(
        self, prompt: Conversation, generations_this_call: int = 1
    ) -> List[Union[Message, None]]:
        """Call the Bedrock model using the Converse API.

        Args:
            prompt: Conversation object containing the prompt turns
            generations_this_call: Number of generations to request (currently only 1 is supported)

        Returns:
            List of Message objects containing the generated text, or [None] on error
        """
        if self.client is None:
            self._load_client()

        # Convert Conversation to Converse API message format
        messages = []
        for turn in prompt.turns:
            if turn.role in ["user", "assistant"]:
                messages.append(
                    {"role": turn.role, "content": [{"text": turn.content.text}]}
                )

        if not messages:
            logging.error("No valid messages to send to Bedrock")
            return [None]

        # Build inference configuration
        inference_config = {}
        if hasattr(self, "temperature") and self.temperature is not None:
            inference_config["temperature"] = float(self.temperature)
        if hasattr(self, "max_tokens") and self.max_tokens is not None:
            inference_config["maxTokens"] = int(self.max_tokens)
        if hasattr(self, "top_p") and self.top_p is not None:
            inference_config["topP"] = float(self.top_p)
        if hasattr(self, "stop") and self.stop and len(self.stop) > 0:
            inference_config["stopSequences"] = list(self.stop)

        # Prepare API call arguments
        call_args = {
            "modelId": self.name,
            "messages": messages,
        }

        # Only add inferenceConfig if it has parameters
        if inference_config:
            call_args["inferenceConfig"] = inference_config

        try:
            # Call the Converse API
            response = self.client.converse(**call_args)

            # Extract text from response
            if not response or "output" not in response:
                logging.error("Malformed response from Bedrock: missing 'output' field")
                return [None]

            if "message" not in response["output"]:
                logging.error(
                    "Malformed response from Bedrock: missing 'message' in output"
                )
                return [None]

            message = response["output"]["message"]
            if "content" not in message or not message["content"]:
                logging.error(
                    "Malformed response from Bedrock: missing or empty 'content' in message"
                )
                return [None]

            # Extract text from the first content block
            content_block = message["content"][0]
            if "text" not in content_block:
                logging.error(
                    "Malformed response from Bedrock: missing 'text' in content block"
                )
                return [None]

            text = content_block["text"]
            return [Message(text=text)]

        except Exception as e:
            try:
                from botocore.exceptions import ClientError

                if isinstance(e, ClientError):
                    error_code = e.response.get("Error", {}).get("Code", "")
                    error_message = e.response.get("Error", {}).get("Message", "")

                    logging.error(f"Bedrock API error [{error_code}]: {error_message}")

                    # Check if we should retry (throttling and service unavailable are transient)
                    if error_code in [
                        "ThrottlingException",
                        "ServiceUnavailableException",
                    ]:
                        raise garak.exception.GarakBackoffTrigger from e

                    # For non-retriable errors (validation, access denied), return None
                    return [None]
            except ImportError:
                pass

            # Re-raise for backoff decorator to handle
            logging.exception("Error calling Bedrock model")
            raise
