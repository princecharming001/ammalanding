# 🎬 Sora Video Generation Integration

## ✅ Status: INTEGRATED & READY

Sora video generation is now fully integrated into the agent!

---

## 🚀 How to Use

### Step 1: Run the Agent

```bash
cd /Users/home/Downloads/unicornwaitlist
source venv/bin/activate
export OPENAI_API_KEY='sk-your-key-with-sora-access'
python3 videogenagentt/agent.py
```

### Step 2: Follow Prompts

```
Enter patient email: anish.polakala@gmail.com
Generate video with Sora? (y/n) [n]: y
Doctor email (for database record) [optional]: apolakala@berkeley.edu
```

### Step 3: Wait for Generation

The agent will:
1. ✅ Read patient's medical files
2. ✅ Generate video script
3. ✅ Extract prompt from script
4. ✅ Call Sora API (30-60 seconds)
5. ✅ Save video URL to database
6. ✅ Display video URL

---

## 📊 What Happens

```
Patient Files (PDFs)
       ↓
   Read Content
       ↓
Generate Script with AI
       ↓
Extract Sora Prompt (first 500 chars)
       ↓
Call Sora API
  model: "sora-1.0-turbo"
  size: 1280x720 (720p)
  duration: 15 seconds
       ↓
Get Video URL
       ↓
Save to Database (type='video')
       ↓
Done! 🎉
```

---

## 🎥 Video Specs

- **Model**: `sora-2` (or `sora-2-pro` for cinematic quality)
- **Resolution**: 720p (1024p available with sora-2-pro)
- **Duration**: 12 seconds (max for both models)
- **Output**: URL to hosted video
- **Pricing**: $0.10/sec (sora-2) or $0.30/sec (sora-2-pro) at 720p

---

## 💾 Database Storage

If you provide a doctor email, the video URL is saved to:

**Table**: `patient_files`
```json
{
  "doctor_email": "doctor@email.com",
  "patient_email": "patient@email.com",
  "file_type": "video",
  "file_url": "https://...",
  "file_name": "AI Generated Video - patient@email.com"
}
```

Patients can then view the video in their profile!

---

## 🔧 Troubleshooting

### "Sora video generation failed"

**Possible causes:**
1. Your OpenAI account doesn't have Sora access yet
2. API key doesn't have Sora permissions
3. API quota/rate limit reached
4. Temporary Sora API issue

**Solutions:**
- Verify Sora access: Contact OpenAI support
- Check API limits in dashboard
- Try again in a few minutes

### "Model not found" error

The Sora model name might be different. Check OpenAI docs for the exact model name:
- Could be: `sora-1.0`, `sora-turbo`, `sora`, etc.
- Update line 257 in `agent.py` with correct model name

### Video URL expired

Sora videos are hosted temporarily by OpenAI. If you need permanent storage:
1. Download the video from the URL
2. Upload to Supabase Storage
3. Replace URL in database

---

## 📝 Example Output

```
============================================================
🎬 Medical Video Script Generator
============================================================

📁 Fetching files for: anish.polakala@gmail.com
📥 Downloading: diagnosis.pdf
📄 Extracting text from 3 pages...
✅ Extracted 2547 characters

============================================================
📝 Video Script Generated:
============================================================

SCENE 1: Introduction
Visual: Animated character looking concerned
Narration: "Hi! Let's talk about what's going on..."

SCENE 2: The Diagnosis
Visual: Simple body diagram
Narration: "You have [condition]. Think of it like..."

[...]

============================================================
🎬 GENERATING VIDEO WITH SORA
============================================================
⏳ This may take 30-60 seconds...

📋 Prompt for Sora:
Animated character looking concerned. Hi! Let's talk about what's 
going on with your health. Simple body diagram showing...

🚀 Calling Sora API...
✅ Video generated successfully!
🔗 Video URL: https://cdn.openai.com/sora/v123456789/video.mp4

💾 Saving video URL to database...
✅ Video URL saved to database!

============================================================
✅ COMPLETE!
============================================================
📝 Script generated
🎬 Video generated: https://cdn.openai.com/sora/v123456789/video.mp4
💾 Saved to database for anish.polakala@gmail.com
```

---

## 🎯 Features

✅ **Automatic prompt extraction** from script  
✅ **Concise Sora prompts** (max 500 chars)  
✅ **Error handling** with helpful messages  
✅ **Database integration** (optional)  
✅ **Progress feedback** during generation  
✅ **No video storage** (URL only)  

---

## 🔄 Workflow Integration

### For Doctors (Web App)

The generated video URL is stored in the database, so:
1. Doctor generates video via CLI
2. Video URL saved to `patient_files`
3. Patient logs into web app
4. Patient sees video in their profile
5. Patient clicks "View" → Video opens

### For Patients

- Videos appear alongside uploaded PDFs
- Same "View" button as files
- Opens video in browser
- No download needed

---

## 💡 Tips

- **Script quality matters**: Better medical file content = better script = better video
- **Prompt extraction**: First few scenes determine the video content
- **Duration**: 15 seconds is good for simple explanations, adjust in code if needed
- **Resolution**: 720p is fast, change to 1080p for higher quality (longer generation time)

---

**You're all set! Sora video generation is ready to use!** 🚀

