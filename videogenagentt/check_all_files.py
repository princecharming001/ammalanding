#!/usr/bin/env python3
"""
Check all patient files in the database
"""

from supabase import create_client, Client

SUPABASE_URL = "https://chlfrkennmepvlqfsfzy.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNobGZya2Vubm1lcHZscWZzZnp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5ODcxMzYsImV4cCI6MjA3ODU2MzEzNn0.z0E4pfRm6gl3gMxsdDgoXFnokSD9UyxdQi9zzBCBO4Y"

print("🔗 Connecting to Supabase...")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
print("✅ Connected!\n")

print("📊 Checking all patients and files...\n")

# Get all users
users = supabase.table('users').select('*').execute()
print(f"👥 Total users in database: {len(users.data)}")

# Get all patient files
all_files = supabase.table('patient_files').select('*').execute()
print(f"📁 Total files in database: {len(all_files.data)}\n")

if all_files.data:
    print("="*60)
    print("FILES IN DATABASE:")
    print("="*60)
    for file in all_files.data:
        print(f"  Patient: {file.get('patient_email')}")
        print(f"  File: {file.get('file_name')}")
        print(f"  Type: {file.get('file_type')}")
        print(f"  Doctor: {file.get('doctor_email')}")
        print(f"  Date: {file.get('created_at')}")
        print("-"*60)
else:
    print("ℹ️  No files have been uploaded yet!")
    print("\n💡 To test the agent:")
    print("   1. Log in as a doctor on the web app")
    print("   2. Add a patient")
    print("   3. Upload some files for that patient")
    print("   4. Then run the agent with that patient's email")

