# ⚡ QUICK FIX - PARAMETER ERROR RESOLVED

## ✅ FIXED!

Changed parameter from `resolution` to `size`

---

## 🎯 Correct API Call

```python
response = openai_client.videos.create(
    model="sora-2",
    prompt="Your video description",
    size="1280x720",     # ✅ THIS (not 'resolution')
    duration=12           # Must be 4, 8, or 12
)
```

---

## 📐 Size Options

| Value | Description |
|-------|-------------|
| `"1280x720"` | 720p landscape (16:9) |
| `"720x1280"` | Portrait mode (9:16) |
| `"1024x1024"` | Square (1:1) |

---

## 🚀 Run It Now

```bash
cd /Users/home/Downloads/unicornwaitlist
source venv/bin/activate
python3 videogenagentt/agent.py
```

Should work! 🎉

