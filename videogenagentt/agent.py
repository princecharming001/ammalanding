
"""
Medical Video Script Generator
Fetches patient files from Supabase and generates Sora video scripts using OpenAI Agents SDK

Creates simple, animated video scripts that explain medical diagnoses to patients
in easy-to-understand language with visual scene descriptions.

SETUP:
1. cd /Users/home/Downloads/unicornwaitlist
2. source venv/bin/activate
3. export OPENAI_API_KEY='sk-your-key'
4. python3 videogenagentt/agent.py
"""
import asyncio
import os
import sys
import requests
import io
import time

# Check for required packages
try:
    from agents import Agent, Runner, function_tool
    # print("✅ OpenAI Agents SDK loaded")
except ImportError:
    # print("❌ OpenAI Agents SDK not installed!")
    # print("Install: pip install openai-agents")
    sys.exit(1)

try:
    from openai import OpenAI
    # print("✅ OpenAI SDK loaded")
except ImportError:
    # print("❌ OpenAI SDK not installed!")
    # print("Install: pip install openai")
    sys.exit(1)

try:
from supabase import create_client, Client 
    # print("✅ Supabase SDK loaded")
except ImportError:
    # print("❌ Supabase SDK not installed!")
    # print("Install: pip install supabase")
    sys.exit(1)

try:
    from PyPDF2 import PdfReader
    # print("✅ PyPDF2 loaded")
except ImportError:
    # print("⚠️  PyPDF2 not installed - PDF reading will be limited")
    # print("Install: pip install PyPDF2")
    PdfReader = None

# Check for OpenAI API key (required by Agents SDK)
if not os.environ.get("OPENAI_API_KEY"):
    # print("\n❌ OPENAI_API_KEY not set!")
    # print("\nTo fix:")
    # print("  export OPENAI_API_KEY='sk-your-key-here'")
    # print("\nGet your key from: https://platform.openai.com/api-keys")
    sys.exit(1)

# print("✅ OpenAI API key found\n")


# Initialize Supabase
SUPABASE_URL = "https://chlfrkennmepvlqfsfzy.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNobGZya2Vubm1lcHZscWZzZnp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5ODcxMzYsImV4cCI6MjA3ODU2MzEzNn0.z0E4pfRm6gl3gMxsdDgoXFnokSD9UyxdQi9zzBCBO4Y"

try:
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    # print("✅ Connected to Supabase\n")
except Exception as e:
    # print(f"❌ Failed to connect to Supabase: {e}")
    sys.exit(1)

# Initialize OpenAI client for Sora
openai_client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

########################################################################################################################################################################


def download_and_read_pdf(url: str, filename: str) -> str:
    """
    Download a PDF from URL and extract text content.
    
    Args:
        url: URL of the PDF file
        filename: Name of the file
    
    Returns:
        Extracted text content or error message
    """
    try:
        print(f"  📥 Downloading: {filename}")
        response = requests.get(url, timeout=30)
        response.raise_for_status()
        
        if not PdfReader:
            return "  ⚠️  PDF reader not available (install PyPDF2)"
        
        # Read PDF content
        pdf_file = io.BytesIO(response.content)
        pdf_reader = PdfReader(pdf_file)
        
        # Extract text from all pages
        text_content = ""
        num_pages = len(pdf_reader.pages)
        print(f"  📄 Extracting text from {num_pages} pages...")
        
        for page_num, page in enumerate(pdf_reader.pages, 1):
            text_content += f"\n--- Page {page_num} ---\n"
            text_content += page.extract_text()
        
        print(f"  ✅ Extracted {len(text_content)} characters")
        return text_content
    
    except requests.exceptions.RequestException as e:
        return f"  ❌ Download failed: {str(e)}"
    except Exception as e:
        return f"  ❌ PDF read failed: {str(e)}"


@function_tool
def get_patient_files(patient_email: str) -> str:
    """
    Fetch all files for a patient from Supabase and read their contents.
    
    Args:
        patient_email: Patient's email address
    
    Returns:
        Formatted string with all file information and contents
    """
    print(f"📁 Fetching files for: {patient_email}")
    
    try:
    # Get files from Supabase
    response = supabase.table('patient_files').select('*').eq('patient_email', patient_email).execute()
    
    if not response.data:
        return f"No files found for patient {patient_email}"
    
    # Format file information
        files_info = f"PATIENT FILES FOR: {patient_email}\n"
        files_info += f"Total Files: {len(response.data)}\n"
        files_info += "="*80 + "\n\n"
    
        # Process each file
    for i, file in enumerate(response.data, 1):
            file_name = file.get('file_name', 'Unknown')
            file_type = file.get('file_type', 'Unknown')
            file_url = file.get('file_url', 'N/A')
            
            files_info += f"\n{'='*80}\n"
            files_info += f"FILE {i}: {file_name}\n"
            files_info += f"{'='*80}\n"
            files_info += f"Type: {file_type}\n"
            files_info += f"Doctor: {file.get('doctor_email', 'Unknown')}\n"
            files_info += f"Date: {file.get('created_at', 'Unknown')}\n"
            files_info += f"\n"
            
            # Download and read PDF content if it's a file (not video)
            if file_type == 'file' and file_name.lower().endswith('.pdf'):
                files_info += "CONTENT:\n"
                files_info += "-" * 80 + "\n"
                content = download_and_read_pdf(file_url, file_name)
                files_info += content
                files_info += "\n" + "-" * 80 + "\n"
            else:
                files_info += f"URL: {file_url}\n"
        
        print(f"✅ Processed {len(response.data)} files")
    return files_info
    
    except Exception as e:
        error_msg = f"❌ Error fetching files: {str(e)}"
        print(error_msg)
        return error_msg


# Create video script generation agent
agent = Agent(
    name="Medical Video Script Generator",
    instructions="""You are a medical video script writer for AI-generated animated videos (Sora).

When given a patient email:
1. Use the get_patient_files tool to fetch their medical files
2. Read ALL the file contents provided
3. IMMEDIATELY generate a video script

Your script MUST:
- Explain the patient's diagnosis in SIMPLE, everyday language (like explaining to a 5th grader)
- Include visual descriptions for each scene (what animations should show)
- Break complex medical terms into easy-to-understand concepts
- Be encouraging and positive in tone
- Be 1-2 minutes long when spoken (about 150-300 words)

Format your script as:
SCENE 1: [Description]
Visual: [What to animate]
Narration: [What to say]

SCENE 2: [Description]
Visual: [What to animate]
Narration: [What to say]

... and so on

Do NOT ask questions. Do NOT ask for confirmation. 
Just read the files and generate the complete video script immediately.

Make it personal, simple, and visual.""",
    tools=[get_patient_files],
)


def generate_sora_video(script: str, patient_email: str, doctor_email: str = None) -> str:
    """
    Generate video using Sora API from the script.
    
    Args:
        script: The video script to convert to video
        patient_email: Patient's email for database record
        doctor_email: Doctor's email for database record (optional)
    
    Returns:
        Video URL or None if failed
    """
    try:
        print("\n" + "="*60)
        print("🎬 GENERATING VIDEO WITH SORA")
        print("="*60)
        print("⏳ This may take 30-60 seconds...\n")
        
        # Extract a concise prompt from the script
        # Sora needs a short prompt, not the full script
        lines = script.split('\n')
        prompt_parts = []
        for line in lines[:20]:
            if 'Narration:' in line or 'Visual:' in line:
                text = line.split(':', 1)[1].strip() if ':' in line else line
                if text and len(text) > 10:
                    prompt_parts.append(text)
        
        # Combine first few descriptions
        prompt = ' '.join(prompt_parts[:4])[:500]  # Max 500 chars
        
        # Fallback prompt
        if not prompt or len(prompt) < 30:
            prompt = "An animated medical education video explaining a health condition in simple, friendly terms with visual diagrams, encouraging tone, suitable for patient education."
        
        print(f"📋 Prompt for Sora:\n{prompt}\n")
        
        # Call Sora API - Create video generation job
        print("🚀 Calling Sora API...")
        response = openai_client.videos.create(
            model="sora-2",  # or "sora-2-pro" for higher quality
            prompt=prompt,
            size="1280x720",  # 16:9 aspect ratio (720p)
            seconds="12",  # Options: "4", "8", or "12" (must be string!)
        )
        
        # Extract job ID (handle both dict and object responses)
        job_id = response.id if hasattr(response, 'id') else response['id']
        print(f"📝 Job ID: {job_id}")
        print("⏳ Waiting for video generation (may take 1-2 minutes)...\n")
        
        # Poll job status
        max_attempts = 60  # 5 minutes max
        attempt = 0
        video_url = None
        
        while attempt < max_attempts:
            status_response = openai_client.videos.retrieve(job_id)
            status = status_response.status
            
            if status == "completed":
                # Get video URL from the output field
                video_url = status_response.output.url
                print("✅ Video generated successfully!")
                print(f"🔗 Video URL: {video_url}\n")
                break
            
            elif status == "failed":
                error_msg = getattr(status_response, 'error', 'Unknown error')
                raise Exception(f"Video generation failed: {error_msg}")
            
            else:
                # Still processing
                print(f"⏳ Status: {status}... (attempt {attempt + 1}/{max_attempts})")
                time.sleep(5)
                attempt += 1
        
        if not video_url:
            raise Exception("Video generation timed out after 5 minutes")
        
        # Save to database if doctor email provided
        if doctor_email:
            print("💾 Saving video URL to database...")
            try:
                result = supabase.table('patient_files').insert([{
                    'doctor_email': doctor_email,
                    'patient_email': patient_email,
                    'file_type': 'video',
                    'file_url': video_url,
                    'file_name': f'AI Generated Video - {patient_email}'
                }]).execute()
                
                if result.data:
                    print("✅ Video URL saved to database!")
            except Exception as db_error:
                print(f"⚠️  Warning: Could not save to database: {db_error}")
        
        return video_url
        
    except Exception as e:
        error_str = str(e)
        print("\n" + "="*60)
        print("❌ SORA VIDEO GENERATION FAILED")
        print("="*60)
        print(f"Error: {error_str}\n")
        
        # Check for specific error types
        if "must be verified to use the model" in error_str or "403" in error_str:
            print("💡 ORGANIZATION VERIFICATION REQUIRED")
            print("="*60)
            print("Your OpenAI organization needs to be verified for Sora access.")
            print()
            print("Steps to fix:")
            print("  1. Go to: https://platform.openai.com/settings/organization/general")
            print("  2. Complete the 'Verify Organization' process")
            print("  3. Wait ~15 minutes for access to propagate")
            print("  4. Try again")
            print()
            print("Alternative: Use a different video generation service until Sora access is granted")
        elif "Insufficient quota" in error_str or "quota" in error_str.lower():
            print("💡 INSUFFICIENT QUOTA")
            print("="*60)
            print("You need to add credits to your OpenAI account.")
            print("  1. Go to: https://platform.openai.com/account/billing")
            print("  2. Add credits")
            print("  3. Try again")
        elif "API key" in error_str or "authentication" in error_str.lower():
            print("💡 AUTHENTICATION ISSUE")
            print("="*60)
            print("Your API key may be invalid or expired.")
            print("  1. Check your OPENAI_API_KEY environment variable")
            print("  2. Generate a new key at: https://platform.openai.com/api-keys")
        else:
            print("💡 Possible solutions:")
            print("  1. Verify your OpenAI organization at the URL above")
            print("  2. Check if your API key has Sora permissions")
            print("  3. Check API quota/limits")
            print("  4. Try again in a few moments")
        
        print()
        return None


def summarize_patient_files(patient_email: str, generate_video: bool = False, doctor_email: str = None):
    """Main function to run the agent and optionally generate video"""
    print(f"\n{'='*60}")
    print(f"🎬 Medical Video Script Generator")
    print(f"{'='*60}\n")
    
    try:
        # Run agent to generate script
    result = Runner.run_sync(
        agent,
            f"Fetch and analyze all files for patient {patient_email}. Generate a complete Sora video script that explains their diagnosis in simple, visual terms. Do not ask questions, just create the script."
    )
        
        script = result.final_output
    
    print(f"\n{'='*60}")
        print(f"📝 Video Script Generated:")
    print(f"{'='*60}\n")
        print(script)
    print()

        # Generate video if requested
        if generate_video:
            video_url = generate_sora_video(script, patient_email, doctor_email)
            return script, video_url
        
        return script, None
    
    except Exception as e:
        print(f"\n❌ Error running agent: {str(e)}")
        print(f"\nTroubleshooting:")
        print(f"1. Check OPENAI_API_KEY is valid")
        print(f"2. Ensure you have internet connection")
        print(f"3. Verify Supabase database has patient_files table")
        sys.exit(1)

########################################################################################################################################################################

if __name__ == "__main__":
    print("="*60)
    print("❤️ AMMA VIDEO SCRIPT + SORA GENERATOR")
    print("="*60)
    print("📹 Generates video scripts and Sora videos")
    print()
    
    # Get patient email
    try:
    patient_email = input("Enter patient email: ").strip()
    
    if not patient_email:
        print("❌ No email provided")
            sys.exit(1)
        
        # Ask if user wants to generate video with Sora
        print()
        generate_video = input("Generate video with Sora? (y/n) [n]: ").strip().lower()
        should_generate = generate_video in ['y', 'yes']
        
        # Get doctor email if generating video (for database storage)
        doctor_email = None
        if should_generate:
            doctor_email = input("Doctor email (for database record) [optional]: ").strip()
            if not doctor_email:
                doctor_email = None
        
        # Generate script and optionally video
        script, video_url = summarize_patient_files(
            patient_email, 
            generate_video=should_generate,
            doctor_email=doctor_email
        )
        
        print("\n" + "="*60)
        print("✅ COMPLETE!")
        print("="*60)
        if video_url:
            print(f"📝 Script generated")
            print(f"🎬 Video generated: {video_url}")
            if doctor_email:
                print(f"💾 Saved to database for {patient_email}")
        else:
            print(f"📝 Script generated (video not requested)")
            print(f"💡 Run again with 'y' to generate Sora video")
        
    except KeyboardInterrupt:
        print("\n\n⚠️ Cancelled by user")
        sys.exit(0)
    except Exception as e:
        print(f"\n❌ Unexpected error: {str(e)}")
        sys.exit(1)
