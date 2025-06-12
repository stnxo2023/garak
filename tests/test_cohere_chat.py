#!/usr/bin/env python3
"""
Simple test script to demonstrate the correct usage of Cohere v5.15.0 chat API.
"""
import os
import sys
import logging
import cohere

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def test_cohere_chat():
    """Test different formats of the Cohere chat API to find the correct one."""
    api_key = os.environ.get('COHERE_API_KEY')
    if not api_key:
        logging.error("COHERE_API_KEY environment variable not set")
        return
        
    # Check if we're running as a pytest test or as a standalone script
    is_pytest = 'PYTEST_CURRENT_TEST' in os.environ

    client = cohere.ClientV2(api_key=api_key)
    prompt = "Tell me a simple programming joke"
    
    # Print module and class info
    logging.info(f"Cohere version: {cohere.__version__}")
    logging.info(f"Available chat-related classes:")
    chat_classes = [c for c in dir(cohere) if 'chat' in c.lower() or 'message' in c.lower()]
    logging.info("\n".join(chat_classes))
    
    # Try different message formats
    formats = [
        {
            "name": "Format 1 - Direct messages list with dicts",
            "call": lambda: client.chat(
                model="command", 
                messages=[{"role": "USER", "message": prompt}]
            )
        },
        {
            "name": "Format 2 - Using ChatMessage class",
            "call": lambda: client.chat(
                model="command", 
                messages=[cohere.ChatMessage(role="USER", message=prompt)]
            )
        },
        {
            "name": "Format 3 - Using UserMessage class",
            "call": lambda: client.chat(
                model="command", 
                messages=[cohere.UserMessage(content=prompt)]
            )
        },
        {
            "name": "Format 4 - Using UserChatMessageV2 class",
            "call": lambda: client.chat(
                model="command", 
                messages=[cohere.UserChatMessageV2(content=prompt)]
            )
        }
    ]
    
    # Try each format and see which one works
    for fmt in formats:
        logging.info(f"\nTrying {fmt['name']}...")
        try:
            response = fmt["call"]()
            logging.info(f"SUCCESS! Response type: {type(response)}")
            logging.info(f"Response has 'text' attribute: {hasattr(response, 'text')}")
            if hasattr(response, 'text'):
                logging.info(f"Response text: {response.text}")
            else:
                logging.info(f"Full response: {response}")
            
            # If we got a successful response
            if not is_pytest:  # Only return values when running as a script
                return fmt["name"], response
            else:  # In pytest mode, just log the success
                logging.info(f"Test successful with {fmt['name']}")
                return  # Don't return values in pytest mode
        except Exception as e:
            logging.error(f"Error with {fmt['name']}: {e}")
    
    if not is_pytest:  # Only return values when running as a script
        return None, None

if __name__ == "__main__":
    format_name, response = test_cohere_chat()
    if format_name:
        print(f"\nSuccessful format: {format_name}")
        print(f"Response: {response.text if hasattr(response, 'text') else response}")
    else:
        print("\nAll formats failed.")
