# Cohere v5.15.0 Upgrade Guide

## Overview
This guide explains the changes made to Garak's Cohere integration to support Cohere v5.15.0. The main change in Cohere v5 is that the `generate` API is now considered legacy, with the `chat` API being the recommended replacement.

## Changes Made

1. **Requirements.txt**: Updated from `cohere>=4.5.1,<5` to `cohere>=5.15.0`

2. **Cohere Error Handling**: Updated from `cohere.error.CohereAPIError` to the base error class `cohere.core.api_error.ApiError`

3. **API Options**: Added a new parameter `use_chat` (default: `False`) to toggle between:
   - Legacy `generate` API (default for backwards compatibility)
   - New `chat` API (recommended by Cohere for v5+)

4. **Documentation**: Updated inline documentation to reflect API changes

## Using the Updated Integration

### Legacy Generate API (Default)
The default behavior remains unchanged for backward compatibility:

```python
from garak.generators.cohere import CohereGenerator

generator = CohereGenerator("command")  # or any other model name
responses = generator.generate("Your prompt here")
```

### New Chat API
To use Cohere's recommended Chat API instead of the legacy Generate API:

```python
from garak.generators.cohere import CohereGenerator

generator = CohereGenerator("command")  # or any other model name
generator.use_chat = True  # Switch to using Chat API
responses = generator.generate("Your prompt here")
```

## Key Differences Between APIs

### Parameter Support
Some parameters from the Generate API are not supported in the Chat API:

- `num_generations`: To achieve the same outcome in Chat, call `co.chat()` multiple times
- `stop_sequences` and `end_sequences`: Trim model outputs on your side instead
- `return_likelihoods`: Not supported in Chat API
- `logit_bias`: Not supported in Chat API
- `truncate`: Not supported in Chat API
- `preset`: Not supported in Chat API

### Input Format
- Generate API uses the `prompt` parameter
- Chat API uses the `message` parameter (handled internally by the adapter)

## Testing
A test script (`tests/test_cohere_v5.py`) is provided to verify that both API methods work correctly. To run it:

1. Set your Cohere API key:
   ```bash
   export COHERE_API_KEY='your_api_key_here'
   ```
   
2. Run the test:
   ```bash
   python tests/test_cohere_v5.py
   ```

## Security Testing Considerations
When using Garak for security testing (like with the DropboxRepeatedTokenProbe), both API methods will work, but be aware of potential differences in model behavior between the Generate and Chat APIs, as they may handle edge cases differently.

## References
- [Cohere API v1 to v2 Migration Guide](https://docs.cohere.com/docs/migrating-v1-to-v2)
- [Migrating from Generate to Chat API](https://docs.cohere.com/docs/migrating-from-cogenerate-to-cochat)
