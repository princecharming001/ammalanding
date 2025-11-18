#!/usr/bin/env python3
"""
Test script to verify all imports work correctly
"""

print("Testing imports...")

try:
    from agents import Agent, Runner
    print("✅ OpenAI Agents SDK imported successfully")
except ImportError as e:
    print(f"❌ Failed to import agents: {e}")
    exit(1)

try:
    from supabase import create_client, Client
    print("✅ Supabase imported successfully")
except ImportError as e:
    print(f"❌ Failed to import supabase: {e}")
    exit(1)

# Test creating an agent
try:
    agent = Agent(
        name='Test Agent',
        instructions='You are a test agent'
    )
    print("✅ Agent created successfully")
except Exception as e:
    print(f"❌ Failed to create agent: {e}")
    exit(1)

# Test creating Supabase client
try:
    supabase = create_client("https://test.supabase.co", "test-key")
    print("✅ Supabase client created successfully")
except Exception as e:
    print(f"❌ Failed to create Supabase client: {e}")
    exit(1)

print("\n🎉 All imports and basic functionality working!")
print("\nTo use agent.py:")
print("1. source venv/bin/activate")
print("2. export OPENAI_API_KEY='sk-your-key'")
print("3. python3 agent.py")

