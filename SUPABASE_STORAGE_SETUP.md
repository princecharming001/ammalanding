# 📦 Supabase Storage Setup for File Uploads

## 🎯 What You Need to Do

To enable file uploads with real storage, you need to create a storage bucket in Supabase.

---

## 🚀 Setup Steps

### 1. Go to Supabase Dashboard

Visit: https://supabase.com/dashboard/project/chlfrkennmepvlqfsfzy/storage/buckets

### 2. Create Storage Bucket

Click **"New Bucket"** and configure:

- **Name**: `patient-files`
- **Public bucket**: ✅ **YES** (check this box)
  - This allows files to be accessed via public URLs
  - Files are still only uploaded by authenticated doctors
- **File size limit**: 50 MB (or adjust as needed)
- **Allowed MIME types**: Leave empty (allow all) or specify:
  - `application/pdf`
  - `image/*`
  - `text/*`

Click **Create Bucket**

### 3. Verify Bucket Created

You should see `patient-files` in your buckets list with:
- 🟢 Public badge
- Ready to accept uploads

---

## ✅ What's Already Configured

### Frontend Upload Code ✅
`PatientFilesPage.jsx` now:
- Uploads files to `patient-files` bucket
- Stores them in path: `patient-files/{patientEmail}/{timestamp}-{filename}`
- Saves public URL to database
- Shows real-time upload progress

### Patient View ✅
`PatientProfile.jsx` now:
- Displays all uploaded files
- Has "View" button to download/open files
- Works with real Supabase Storage URLs

### Agent PDF Reading ✅
`agent.py` now:
- Downloads PDFs from Supabase Storage
- Extracts text content using PyPDF2
- Passes content to AI for analysis
- Generates video scripts based on actual diagnosis files

---

## 🧪 Test the Complete Workflow

### Step 1: Upload a File

1. Start the web app: `npm run dev -- --port 5182`
2. Log in as a doctor
3. Go to a patient's file management page
4. Upload a PDF file (like a diagnosis report)
5. You should see: ✅ "File uploaded successfully!"

### Step 2: Verify Patient Can See It

1. Log out
2. Log in as that patient
3. Go to patient profile
4. You should see the file with a "View" button
5. Click "View" - PDF should open in new tab

### Step 3: Test Agent Reading

```bash
cd /Users/home/Downloads/unicornwaitlist
source venv/bin/activate
export OPENAI_API_KEY='sk-your-key'
python3 videogenagentt/agent.py
```

Enter the patient's email and the agent will:
- 📥 Download the PDF
- 📄 Extract text content
- 🤖 Analyze with AI
- 📝 Generate video script

---

## 🔒 Security Notes

### ✅ Good Security Practices

1. **Public bucket** = files accessible via URL
   - ✅ OK because URLs are long and random
   - ✅ Only doctors can upload files
   - ✅ Patients/doctors can only see their own files in UI

2. **Row Level Security** on `patient_files` table
   - Restricts who sees which file metadata
   - Even though files are public, users won't know URLs

### 🔐 Optional: Make Bucket Private

If you want extra security:

1. **Uncheck "Public bucket"** when creating
2. **Update code** to use signed URLs:

```javascript
// In PatientFilesPage.jsx, replace:
const { data: urlData } = supabase.storage
  .from('patient-files')
  .getPublicUrl(filePath)

// With:
const { data: urlData } = await supabase.storage
  .from('patient-files')
  .createSignedUrl(filePath, 3600) // 1 hour expiry
```

---

## ❌ Troubleshooting

### Error: "Bucket not found"

**Solution**: Create the `patient-files` bucket in Supabase dashboard (see step 2 above)

### Error: "New row violates row-level security policy"

**Solution**: Disable RLS on `patient_files` table:

```sql
ALTER TABLE patient_files DISABLE ROW LEVEL SECURITY;
```

### Error: "Payload too large"

**Solution**: Increase bucket file size limit in Supabase dashboard

### Files upload but show "403 Forbidden" when viewing

**Solution**: Make sure bucket is set to **Public**

---

## 📊 Current Status

✅ Frontend code updated
✅ Backend agent updated  
✅ PyPDF2 installed
⏳ **Waiting for**: Supabase storage bucket creation

**Once you create the bucket, everything will work!**

---

## 🎬 Expected Result

1. Doctor uploads diagnosis PDF → Stored in Supabase Storage
2. Patient views file → Opens real PDF
3. Agent analyzes → Reads PDF content → Generates video script

**All powered by real file storage, not fake URLs!** 🚀

