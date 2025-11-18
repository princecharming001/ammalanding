# 🚀 Quick Start: File Upload System

## ⚡ 3 Steps to Get Started

### Step 1: Create Supabase Storage Bucket (2 minutes)

1. Visit: https://supabase.com/dashboard/project/chlfrkennmepvlqfsfzy/storage/buckets
2. Click **"New Bucket"**
3. Enter:
   - Name: `patient-files`
   - Check: ✅ **Public bucket**
4. Click **"Create Bucket"**

✅ Done! Your storage is ready.

---

### Step 2: Test File Upload (Web App)

```bash
# Start the web app
cd /Users/home/Downloads/unicornwaitlist
npm run dev -- --port 5182
```

Then:
1. Open: http://localhost:5182
2. Log in as doctor
3. Add/select a patient
4. Click "📁 Manage Files"
5. Upload a PDF file
6. See: ✅ "File uploaded successfully!"

---

### Step 3: Test Agent Analysis (Terminal)

```bash
# In a new terminal
cd /Users/home/Downloads/unicornwaitlist
source venv/bin/activate
export OPENAI_API_KEY='sk-your-actual-key-here'
python3 videogenagentt/agent.py
```

When prompted, enter patient email (e.g., `anish.polakala@gmail.com`)

The agent will:
- 📥 Download the PDF
- 📄 Extract text
- 🤖 Analyze with AI
- 📝 Generate video script

---

## ✅ What's Ready

- ✅ Frontend code (file upload UI)
- ✅ Backend code (Supabase integration)
- ✅ Agent code (PDF reading + AI analysis)
- ✅ PyPDF2 installed
- ⏳ Just need: Supabase bucket

---

## 📁 Key Files Changed

- `src/components/PatientFilesPage.jsx` - Real file uploads
- `src/components/PatientProfile.jsx` - File viewing
- `videogenagentt/agent.py` - PDF content reading

---

## 🎯 Expected Results

### Upload Test
```
Doctor uploads "diagnosis.pdf"
  ↓
File stored in Supabase
  ↓
URL: https://chlfrkennmepvlqfsfzy.supabase.co/storage/v1/object/public/patient-files/...
  ↓
✅ Success!
```

### Agent Test
```
Agent fetches file
  ↓
Downloads PDF
  ↓
Extracts: "Patient diagnosed with..."
  ↓
AI analyzes content
  ↓
Generates Sora video script
  ↓
✅ Complete!
```

---

## 🆘 Issues?

**"Bucket not found"**
→ Create bucket (Step 1 above)

**"Upload failed"**
→ Check internet connection
→ Verify bucket is "Public"

**"Agent can't read PDF"**
→ Check file URL is valid
→ Run: `pip install PyPDF2`

---

## 📚 More Info

- Full details: `FILE_UPLOAD_IMPLEMENTATION.md`
- Supabase setup: `SUPABASE_STORAGE_SETUP.md`
- Agent docs: `videogenagentt/README.md`

**Ready to go! 🎉**

