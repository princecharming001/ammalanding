#!/bin/bash

echo "============================================================"
echo "🔍 VERIFYING PATIENT FILE ANALYZER SETUP"
echo "============================================================"
echo ""

cd /Users/home/Downloads/unicornwaitlist

# Check 1: Virtual environment
echo "1️⃣  Checking virtual environment..."
if [ -d "venv" ]; then
    echo "   ✅ Virtual environment exists"
else
    echo "   ❌ Virtual environment NOT found"
    exit 1
fi

# Check 2: Activate venv
echo ""
echo "2️⃣  Activating virtual environment..."
source venv/bin/activate
echo "   ✅ Virtual environment activated"

# Check 3: Python packages
echo ""
echo "3️⃣  Checking required packages..."

if python3 -c "import agents" 2>/dev/null; then
    echo "   ✅ openai-agents installed"
else
    echo "   ❌ openai-agents NOT installed"
    echo "      Fix: pip install openai-agents"
    exit 1
fi

if python3 -c "import supabase" 2>/dev/null; then
    echo "   ✅ supabase installed"
else
    echo "   ❌ supabase NOT installed"
    echo "      Fix: pip install supabase"
    exit 1
fi

# Check 4: Test imports
echo ""
echo "4️⃣  Testing imports..."
if python3 -c "from agents import Agent, Runner; from supabase import create_client, Client" 2>/dev/null; then
    echo "   ✅ All imports working"
else
    echo "   ❌ Import failed"
    exit 1
fi

# Check 5: Agent file exists
echo ""
echo "5️⃣  Checking agent.py file..."
if [ -f "videogenagentt/agent.py" ]; then
    echo "   ✅ agent.py exists"
else
    echo "   ❌ agent.py NOT found"
    exit 1
fi

# Check 6: API key
echo ""
echo "6️⃣  Checking OPENAI_API_KEY..."
if [ -z "$OPENAI_API_KEY" ]; then
    echo "   ⚠️  OPENAI_API_KEY not set (optional for testing)"
else
    echo "   ✅ OPENAI_API_KEY is set"
fi

# Final test
echo ""
echo "7️⃣  Testing agent startup..."
export OPENAI_API_KEY=test-key
if echo "" | python3 videogenagentt/agent.py 2>&1 | grep -q "UNICORN PATIENT FILE ANALYZER"; then
    echo "   ✅ Agent starts successfully"
else
    echo "   ❌ Agent failed to start"
    exit 1
fi

echo ""
echo "============================================================"
echo "✅ ALL CHECKS PASSED!"
echo "============================================================"
echo ""
echo "📝 To use the agent:"
echo "   1. export OPENAI_API_KEY='sk-your-key'"
echo "   2. ./videogenagentt/run.sh"
echo ""
echo "   OR"
echo ""
echo "   1. source venv/bin/activate"
echo "   2. export OPENAI_API_KEY='sk-your-key'"
echo "   3. python3 videogenagentt/agent.py"
echo ""

