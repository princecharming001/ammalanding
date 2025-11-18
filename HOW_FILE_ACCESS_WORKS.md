# 📁 How File Access Works (Simple Explanation)

## 🎯 The Simple Version

When you upload a file, it's stored in **2 places**:

1. **Supabase Storage** = The actual PDF file
2. **Database Table** = Info about the file (name, URL, who uploaded it)

---

## 📊 Step-by-Step Flow

### 1️⃣ Upload

```
Doctor uploads "diagnosis.pdf"
       ↓
File goes to Supabase Storage
       ↓
Storage gives back a URL
       ↓
URL saved to database
```

**What gets stored**:
- **Storage**: The actual file bytes (PDF content)
- **Database**: `{ name: "diagnosis.pdf", url: "https://...", doctor: "...", patient: "..." }`

---

### 2️⃣ View

```
Patient clicks "View"
       ↓
App looks up file in database
       ↓
Gets the URL
       ↓
Browser opens URL
       ↓
Storage serves the file
```

**The URL points to** Supabase Storage, which serves the file like any website serves images.

---

### 3️⃣ Delete

```
Doctor clicks "Delete"
       ↓
Delete from Storage (removes file)
       ↓
Delete from Database (removes record)
       ↓
File gone!
```

---

## 🔗 What the URL Looks Like

```
https://chlfrkennmepvlqfsfzy.supabase.co/storage/v1/object/public/patient-files/anish.polakala@gmail.com/1234567890-diagnosis.pdf
                                                                    ↑                    ↑                        ↑
                                                                 bucket            patient folder           actual file
```

---

## 🤖 How the Agent Accesses Files

```
Agent asks: "Get files for patient X"
       ↓
Database returns URLs
       ↓
Agent downloads PDFs from URLs
       ↓
PyPDF2 extracts text
       ↓
Text sent to OpenAI
       ↓
AI generates video script
```

---

## 🔐 Security

- **Storage Policies** = Who can upload/download/delete
- **Database RLS** = Who can see which records (disabled for simplicity)
- **URLs** = Long & random (hard to guess)

---

## 📦 Summary

**2 Systems Working Together:**

| System | Stores | Purpose |
|--------|--------|---------|
| **Storage** | Actual files | File hosting |
| **Database** | File metadata | Track who/what/when |

Like YouTube:
- **Storage** = The actual video file
- **Database** = Video title, uploader, date, views

**That's it!** 🎉

