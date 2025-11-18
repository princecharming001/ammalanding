#!/usr/bin/env python3
"""
Quick test to verify Supabase connection and file fetching works
No OpenAI API key needed!
"""

from supabase import create_client, Client

SUPABASE_URL = "https://chlfrkennmepvlqfsfzy.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNobGZya2Vubm1lcHZscWZzZnp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5ODcxMzYsImV4cCI6MjA3ODU2MzEzNn0.z0E4pfRm6gl3gMxsdDgoXFnokSD9UyxdQi9zzBCBO4Y"

print("🔗 Connecting to Supabase...")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
print("✅ Connected!\n")

# Get patient email from command line or use default
import sys
patient_email = sys.argv[1] if len(sys.argv) > 1 else "apolakala@berkeley.edu"

print(f"📁 Fetching files for: {patient_email}\n")

try:
    response = supabase.table('patient_files').select('*').eq('patient_email', patient_email).execute()
    
    if not response.data:
        print(f"❌ No files found for {patient_email}")
        print("\nℹ️  This patient hasn't had any files uploaded yet.")
        print("   Doctors can upload files through the web interface.")
    else:
        print(f"✅ Found {len(response.data)} file(s)!\n")
        
        for i, file in enumerate(response.data, 1):
            print(f"{'='*60}")
            print(f"File #{i}")
            print(f"{'='*60}")
            print(f"  📄 Name: {file.get('file_name', 'Unknown')}")
            print(f"  📋 Type: {file.get('file_type', 'Unknown')}")
            print(f"  🔗 URL: {file.get('file_url', 'N/A')}")
            print(f"  👨‍⚕️ Doctor: {file.get('doctor_email', 'Unknown')}")
            print(f"  📅 Uploaded: {file.get('created_at', 'Unknown')}")
            print()
            
except Exception as e:
    print(f"❌ Error: {str(e)}")
    
print("\n✅ Supabase connection test complete!")

