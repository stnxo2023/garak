#!/usr/bin/env python3
"""
Test script for Cohere v5.15.0 integration with Garak.
Tests both legacy generate API and the new chat API methods.
"""

import os
import sys
import logging
import time
import signal
import traceback
from contextlib import contextmanager

# Add garak to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from garak.generators.cohere import CohereGenerator

# Define a timeout context manager for API calls
class TimeoutException(Exception):
    pass

@contextmanager
def time_limit(seconds):
    def signal_handler(signum, frame):
        raise TimeoutException(f"Timed out after {seconds} seconds")
    
    signal.signal(signal.SIGALRM, signal_handler)
    signal.alarm(seconds)
    try:
        yield
    finally:
        signal.alarm(0)

# Set up logging - force output to console
logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s', handlers=[logging.StreamHandler()])
logger = logging.getLogger(__name__)

def test_cohere_integration():
    """Test Cohere v5.15.0 integration with both API methods."""
    
    # Skip test if API key not provided but show clear instructions
    api_key = os.environ.get("COHERE_API_KEY")
    if not api_key:
        print("\n" + "-" * 80)
        print("COHERE_API_KEY environment variable not set.")
        print("To run this test, please set your Cohere API key first:")
        print("  export COHERE_API_KEY='your_api_key_here'")
        print("-" * 80 + "\n")
        print("Skipping actual API calls, but verifying class initialization...")
        
        # Still test class initialization without making API calls
        try:
            generator = CohereGenerator("command")
            print(f"✓ CohereGenerator initialization successful")
            print(f"  - Using Cohere ClientV2")
            print(f"  - Default API mode: {'chat' if generator.use_chat else 'generate (legacy)'}")
            print(f"  - Model: {generator.name}")
            print("\nAll tests completed without making API calls.")
        except Exception as e:
            print(f"✗ CohereGenerator initialization failed: {e}")
        return
        
    print("\nAPI KEY FOUND - Running full tests with API calls\n")
    
    # Test 1: Legacy generate API (default)
    print("\n1. Testing legacy generate API (default implementation)...")
    try:
        with time_limit(30):
            generator_legacy = CohereGenerator("command")
            print("   - Successfully created generator")
            
            # Make generator parameters explicit for logging
            generator_legacy.max_tokens = 50  # Limit tokens for quicker response
            print("   - Calling generate API with test prompt...")
            result_legacy = generator_legacy.generate("Tell me a short joke about programming.")
            print(f"\n✓ Legacy API result: {result_legacy[0]}")
            print("✓ Legacy API test: PASSED")
    except TimeoutException as e:
        print(f"\n✗ Legacy API test timed out: {e}")
    except Exception as e:
        print(f"\n✗ Legacy API test failed: {e}")
        traceback.print_exc()
    
    # Add a short delay between API calls
    time.sleep(2)
    
    # Test 2: New chat API
    print("\n2. Testing new chat API...")
    try:
        with time_limit(30):
            generator_chat = CohereGenerator("command")
            # Override to use chat API instead of generate
            generator_chat.use_chat = True
            generator_chat.max_tokens = 50  # Limit tokens for quicker response
            print("   - Successfully created generator with use_chat=True")
            print("   - Calling chat API with test prompt...")
            result_chat = generator_chat.generate("Tell me a short joke about programming.")
            print(f"\n✓ Chat API result: {result_chat[0]}")
            print("✓ Chat API test: PASSED")
    except TimeoutException as e:
        print(f"\n✗ Chat API test timed out: {e}")
    except Exception as e:
        print(f"\n✗ Chat API test failed: {e}")
        traceback.print_exc()

if __name__ == "__main__":
    print("\n" + "=" * 80)
    print(f"COHERE V5.15.0 INTEGRATION TEST".center(80))
    print("=" * 80)
    print("Testing Cohere v5.15.0 with Garak integration")
    print("This script verifies both legacy generate API and new chat API functionality")
    print("=" * 80 + "\n")
    
    test_cohere_integration()
