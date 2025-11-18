#!/bin/bash

# Simple wrapper script to run the patient file analyzer

echo "❤️ Starting Patient File Analyzer..."
echo ""

# Navigate to project root
cd /Users/home/Downloads/unicornwaitlist

# Check if venv exists
if [ ! -d "venv" ]; then
    echo "❌ Virtual environment not found!"
    echo "Please run: python3 -m venv venv"
    exit 1
fi

# Activate virtual environment
source venv/bin/activate

# Check if OPENAI_API_KEY is set
if [ -z "$OPENAI_API_KEY" ]; then
    echo "⚠️  OPENAI_API_KEY not set!"
    echo ""
    echo "Please set it first:"
    echo "  export OPENAI_API_KEY='sk-your-key-here'"
    echo ""
    echo "Or run this script with:"
    echo "  OPENAI_API_KEY='sk-your-key' ./videogenagentt/run.sh"
    echo ""
    exit 1
fi

# Run the agent
python3 videogenagentt/agent.py

