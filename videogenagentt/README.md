# 🎬 Medical Video Script + Sora Generator

AI agent that generates video scripts AND creates actual Sora videos from patient medical files.

## ✅ Status: FULLY INTEGRATED

Reads PDFs, generates scripts, and creates Sora videos!

## 🎯 What It Does

1. **Fetches patient files** from Supabase Storage
2. **Reads PDF content** using PyPDF2
3. **Analyzes diagnosis** with AI
4. **Generates video script** with:
   - Scene-by-scene breakdown
   - Visual descriptions for animation
   - Simple narration (5th grade level)
   - Encouraging tone
5. **Creates actual Sora video** (optional):
   - Generates 15-second 720p video
   - Saves URL to database
   - Ready to view in patient profile

Perfect for patient education videos!

## 🚀 How to Use

### ⚡ Quick Start (Easiest)

```bash
# 1. Set your API key (must have Sora access)
export OPENAI_API_KEY='sk-your-key-here'

# 2. Run the script
./videogenagentt/run.sh

# 3. Enter patient email when prompted
# 4. Choose whether to generate Sora video (y/n)
# 5. Optionally provide doctor email for database storage
```

### 📝 Manual Method

```bash
# 1. Navigate to project root
cd /Users/home/Downloads/unicornwaitlist

# 2. Activate virtual environment
source venv/bin/activate

# 3. Set your OpenAI API key
export OPENAI_API_KEY='sk-your-actual-key-here'

# 4. Run the agent
python3 videogenagentt/agent.py

# 5. Enter patient email when prompted
# Example: patient1@test.com
```

### 🔍 Verify Installation

Run this to check everything is set up correctly:

```bash
./videogenagentt/verify.sh
```

This will check:
- ✅ Virtual environment exists
- ✅ All packages installed
- ✅ Imports work correctly
- ✅ Agent starts successfully

## 📋 Example Output

The agent generates a structured video script like this:

```
SCENE 1: Introduction
Visual: Animated character (representing patient) looking concerned
Narration: "Hi! Let's talk about what's been going on with your health..."

SCENE 2: The Diagnosis
Visual: Simple diagram of the affected area
Narration: "You have [condition]. Think of it like..."

SCENE 3: Treatment Plan
Visual: Calendar with checkmarks and medicine icons
Narration: "Here's how we'll help you feel better..."

SCENE 4: Encouragement
Visual: Character feeling better, smiling
Narration: "You've got this! Remember to..."
```

Ready to be used with Sora for video generation!

## 🔧 Troubleshooting

### "OpenAI Agents SDK not installed"
```bash
pip install openai-agents
```

### "Supabase SDK not installed"
```bash
pip install supabase
```

### "OPENAI_API_KEY not set"
```bash
export OPENAI_API_KEY='sk-your-key'
```

Get your API key from: https://platform.openai.com/api-keys

## ✨ Features

- ✅ Comprehensive error handling
- ✅ Clear status messages
- ✅ Validates all dependencies before running
- ✅ Connects to your existing Supabase database
- ✅ AI-powered analysis using OpenAI Agents SDK

## 📊 Example Output

```
✅ OpenAI Agents SDK loaded
✅ Supabase SDK loaded
✅ OpenAI API key found
✅ Connected to Supabase

============================================================
❤️ AMMA PATIENT FILE ANALYZER
============================================================

Enter patient email: patient@example.com

============================================================
🏥 Patient File Summary Agent
============================================================

📁 Fetching files for: patient@example.com
✅ Found 3 files

============================================================
📊 Summary:
============================================================

This patient has 3 files total:
- 2 document files uploaded by doctor@example.com
- 1 video file uploaded by doctor@example.com

Most recent upload was 2 days ago. Files are well organized
with clear naming conventions.

✅ Analysis complete!
```

## 🛠️ Technical Details

- **Framework**: OpenAI Agents SDK
- **Database**: Supabase
- **Language**: Python 3
- **Dependencies**: openai-agents, supabase

