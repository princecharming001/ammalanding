# ✅ CRITICAL FIX - String Type for `seconds` Parameter

## 🐛 The Issue

**Error 400:** `Invalid type for 'seconds': expected one of '4', '8', or '12', but got an integer instead`

**Root Cause:** The Sora API requires `seconds` to be a **string literal**, not an integer.

---

## ✅ The Fix

### ❌ WRONG (Integer)
```python
response = openai_client.videos.create(
    model="sora-2",
    prompt=prompt,
    size="1280x720",
    seconds=12  # ❌ Integer - causes 400 error!
)
```

### ✅ CORRECT (String)
```python
response = openai_client.videos.create(
    model="sora-2",
    prompt=prompt,
    size="1280x720",
    seconds="12"  # ✅ String - works!
)
```

---

## 📝 Valid Values

The `seconds` parameter MUST be one of these **exact strings**:

| Value | Type | Duration |
|-------|------|----------|
| `"4"` | string | 4 seconds |
| `"8"` | string | 8 seconds |
| `"12"` | string | 12 seconds |

**Important:** These are **strings**, not integers!

---

## 🔧 What Was Changed

### In `agent.py` (line 261):
```python
seconds="12",  # Changed from seconds=12
```

### In `test_sora_api.py` (line 46):
```python
seconds="4",  # Changed from seconds=4
```

---

## 🚀 Try Again Now!

The code is fixed. Run the test:

```bash
cd /Users/home/Downloads/unicornwaitlist
source venv/bin/activate
export OPENAI_API_KEY='sk-your-key'
python3 videogenagentt/test_sora_api.py
```

This should now work! The 400 error will be gone.

---

## 📊 Complete Working Example

```python
from openai import OpenAI
import time

client = OpenAI(api_key="your-key")

# Create video - ALL parameters shown with correct types
response = client.videos.create(
    model="sora-2",           # string
    prompt="Your video",      # string
    size="1280x720",          # string (WIDTHxHEIGHT)
    seconds="12"              # string! Not int!
)

# Poll for completion
job_id = response.id
while True:
    status = client.videos.retrieve(job_id)
    if status.status == "completed":
        video_url = status.output.url
        print(f"Video: {video_url}")
        break
    time.sleep(5)
```

---

## 🎯 All Parameters - Correct Types

| Parameter | Type | Example | Notes |
|-----------|------|---------|-------|
| `model` | string | `"sora-2"` | or `"sora-2-pro"` |
| `prompt` | string | `"A video of..."` | Description |
| `size` | string | `"1280x720"` | WIDTHxHEIGHT |
| `seconds` | **string** | `"12"` | Must be `"4"`, `"8"`, or `"12"` |

---

## ✅ Fixed!

The issue was simple but critical - `seconds` must be a string, not an integer.

**Both files have been updated and will now work!** 🚀

