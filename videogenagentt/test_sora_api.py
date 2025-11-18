#!/usr/bin/env python3
"""
Minimal Sora API test script
Tests if the OpenAI Sora API is working with your credentials
"""
import os
import sys
import time

try:
    from openai import OpenAI
except ImportError:
    print("❌ OpenAI package not installed")
    print("Run: pip install openai")
    sys.exit(1)

# Check API key
api_key = os.environ.get("OPENAI_API_KEY")
if not api_key:
    print("❌ OPENAI_API_KEY not set!")
    print("\nSet it with:")
    print("  export OPENAI_API_KEY='sk-your-key-here'")
    sys.exit(1)

print("="*60)
print("🎬 SORA API TEST")
print("="*60)
print(f"✅ API Key found: {api_key[:20]}...")
print()

# Initialize client
client = OpenAI(api_key=api_key)

# Test video generation
try:
    print("🚀 Creating video generation job...")
    print("   Prompt: 'A simple animated medical diagram'")
    print("   Size: 1280x720")
    print("   Duration: 4 seconds (shortest/cheapest)")
    print()
    
    response = client.videos.create(
        model="sora-2",
        prompt="A simple animated medical diagram showing a heart",
        size="1280x720",
        seconds="4"  # Shortest duration to minimize cost (must be string!)
    )
    
    video_id = response.id
    print(f"✅ Job created!")
    print(f"📝 Video ID: {video_id}")
    print()
    print("⏳ Waiting for completion (usually 30-60 seconds)...")
    print()
    
    # Poll for completion
    max_attempts = 30  # 2.5 minutes max
    for attempt in range(max_attempts):
        status_response = client.videos.retrieve(video_id)
        status = status_response.status
        
        print(f"   [{attempt + 1}/{max_attempts}] Status: {status}")
        
        if status == "completed":
            video_url = status_response.output.url
            print()
            print("="*60)
            print("✅ SUCCESS! VIDEO GENERATED!")
            print("="*60)
            print(f"🔗 Video URL: {video_url}")
            print()
            print("💡 The API is working! You can now use it in your agent.")
            print(f"💰 Cost: ~$0.40 (4 seconds at $0.10/sec)")
            print()
            sys.exit(0)
        
        elif status == "failed":
            error = getattr(status_response, 'error', 'Unknown error')
            print()
            print("="*60)
            print("❌ VIDEO GENERATION FAILED")
            print("="*60)
            print(f"Error: {error}")
            print()
            sys.exit(1)
        
        # Still processing
        time.sleep(5)
    
    # Timeout
    print()
    print("="*60)
    print("⚠️  TIMEOUT")
    print("="*60)
    print("Video generation took longer than expected.")
    print("This might still complete - check OpenAI dashboard")
    sys.exit(1)

except AttributeError as e:
    print()
    print("="*60)
    print("❌ API STRUCTURE ERROR")
    print("="*60)
    print(f"Error: {e}")
    print()
    print("💡 This means:")
    print("   - The OpenAI SDK might not support Sora yet")
    print("   - Or you need to upgrade: pip install --upgrade openai")
    print("   - Or Sora API is not available to your account")
    print()
    print("Check your OpenAI account for Sora API access")
    sys.exit(1)

except Exception as e:
    error_str = str(e)
    print()
    print("="*60)
    print("❌ ERROR")
    print("="*60)
    print(f"Error: {error_str}")
    print()
    
    # Check for specific error types
    if "must be verified to use the model" in error_str or "403" in error_str:
        print("💡 ORGANIZATION VERIFICATION REQUIRED")
        print("="*60)
        print("Your OpenAI organization needs verification for Sora access.")
        print()
        print("Fix this:")
        print("  1. Go to: https://platform.openai.com/settings/organization/general")
        print("  2. Click 'Verify Organization' and complete the process")
        print("  3. Wait ~15 minutes for access to activate")
        print("  4. Run this test again")
        print()
    elif "Insufficient quota" in error_str or "quota" in error_str.lower():
        print("💡 INSUFFICIENT QUOTA")
        print("="*60)
        print("Add credits to your OpenAI account:")
        print("  https://platform.openai.com/account/billing")
        print()
    elif "API key" in error_str or "authentication" in error_str.lower():
        print("💡 AUTHENTICATION ISSUE")
        print("="*60)
        print("Check your OPENAI_API_KEY or generate a new one:")
        print("  https://platform.openai.com/api-keys")
        print()
    else:
        print("💡 Possible issues:")
        print("   1. Your account doesn't have Sora API access yet")
        print("   2. API key is invalid")
        print("   3. Network connection problem")
        print("   4. OpenAI service issue")
        print()
    
    sys.exit(1)

