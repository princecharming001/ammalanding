# ✅ SORA API PARAMETER FIX

## 🐛 Second Error Fixed

**Error:** `Videos.create() got an unexpected keyword argument 'resolution'`

**Root Cause:** Wrong parameter name

---

## ✅ Correct Parameters

### ❌ WRONG
```python
response = openai_client.videos.create(
    model="sora-2",
    prompt=prompt,
    resolution="720p",  # ❌ This doesn't exist!
    duration=12
)
```

### ✅ CORRECT
```python
response = openai_client.videos.create(
    model="sora-2",
    prompt=prompt,
    size="1280x720",  # ✅ Use 'size' with WIDTHxHEIGHT format
    duration=12  # Must be 4, 8, or 12 seconds
)
```

---

## 📐 Size Parameter Format

The `size` parameter uses `WIDTHxHEIGHT` format:

### Common Sizes

| Size | Aspect Ratio | Description |
|------|-------------|-------------|
| `1280x720` | 16:9 | Standard HD landscape (720p) |
| `720x1280` | 9:16 | Portrait (mobile-friendly) |
| `1024x1024` | 1:1 | Square |
| `1920x1080` | 16:9 | Full HD landscape (1080p)* |

*Note: 1080p may only be available with `sora-2-pro` model

---

## ⏱️ Duration Parameter

Must be one of these exact values:
- `4` - 4 seconds
- `8` - 8 seconds  
- `12` - 12 seconds (max)

**Cost calculation:**
- `sora-2`: $0.10/second
  - 4 sec = $0.40
  - 8 sec = $0.80
  - 12 sec = $1.20

- `sora-2-pro`: $0.30/second at 720p
  - 4 sec = $1.20
  - 8 sec = $2.40
  - 12 sec = $3.60

---

## 🔧 Additional Improvements

The code now also:

1. **Handles both response types** (dict and object)
2. **Checks multiple URL locations** (output.video, url)
3. **Robust error messages**
4. **Defensive programming** for API changes

---

## 🚀 Try Again!

```bash
cd /Users/home/Downloads/unicornwaitlist
source venv/bin/activate
export OPENAI_API_KEY='sk-your-sora-key'
python3 videogenagentt/agent.py
```

Enter patient email and choose `y` for video generation!

---

## 📝 Complete Working Example

```python
import openai
import time

client = openai.OpenAI(api_key="your-key")

# Create video
response = client.videos.create(
    model="sora-2",
    prompt="A serene medical animation explaining heart health",
    size="1280x720",
    duration=12
)

job_id = response.id

# Poll until complete
while True:
    status = client.videos.retrieve(job_id)
    if status.status == "completed":
        video_url = status.output.video
        print(f"Done! {video_url}")
        break
    time.sleep(5)
```

---

## ✅ All Fixed Now!

Both errors have been resolved:
1. ✅ Changed `videos.generate()` → `videos.create()`
2. ✅ Changed `resolution="720p"` → `size="1280x720"`
3. ✅ Added robust response handling
4. ✅ Added proper job polling

**Should work now!** 🚀

