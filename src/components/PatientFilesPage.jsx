import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { getCurrentSession, logout } from '../sessionManager'
import './Profile.css'

function PatientFilesPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { patientEmail, patientName } = location.state || {}
  
  const [doctorEmail, setDoctorEmail] = useState('')
  const [files, setFiles] = useState([])
  const [videoUrl, setVideoUrl] = useState('')
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    checkSessionAndLoadData()
  }, [])

  const checkSessionAndLoadData = async () => {
    const session = await getCurrentSession()
    
    if (!session || session.userType !== 'doctor') {
      alert('⚠️ No active session found! Please log in.')
      navigate('/login')
      return
    }
    
    if (!patientEmail) {
      alert('⚠️ Missing patient information')
      navigate('/doctor')
      return
    }
    
    setDoctorEmail(session.email)
    loadFiles(session.email, patientEmail)
  }

  const loadFiles = async (docEmail, patEmail) => {
    try {
      const { data, error } = await supabase
        .from('patient_files')
        .select('*')
        .eq('patient_email', patEmail)
        .eq('doctor_email', docEmail)
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('Error loading files:', error)
      } else if (data) {
        const filesList = data.filter(f => f.file_type === 'file')
        const video = data.find(f => f.file_type === 'video')
        setFiles(filesList)
        setVideoUrl(video?.file_url || '')
      }
    } catch (error) {
      console.log('Error loading files:', error)
    }
    setLoading(false)
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    setUploading(true)
    
    try {
      // Create unique file path: patient-files/{patientEmail}/{timestamp}-{filename}
      const timestamp = Date.now()
      const filePath = `${patientEmail}/${timestamp}-${file.name}`
      
      console.log('📤 Uploading to Supabase Storage...')
      console.log('📁 Bucket: patient-files')
      console.log('📂 Path:', filePath)
      
      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('patient-files')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })
      
      if (uploadError) {
        console.error('❌ Storage upload error:', uploadError)
        alert('❌ Storage upload failed: ' + uploadError.message + '\n\nMake sure storage policies are set up.')
        setUploading(false)
        return
      }
      
      console.log('✅ File uploaded to storage:', uploadData)
      
      // Get public URL for the uploaded file
      const { data: urlData } = supabase.storage
        .from('patient-files')
        .getPublicUrl(filePath)
      
      const publicUrl = urlData.publicUrl
      console.log('🔗 Public URL:', publicUrl)
      
      // Save file metadata to database
      console.log('💾 Saving metadata to database...')
      
      const { data: insertData, error: dbError } = await supabase
        .from('patient_files')
        .insert([{
          doctor_email: doctorEmail,
          patient_email: patientEmail,
          file_type: 'file',
          file_url: publicUrl,
          file_name: file.name
        }])
        .select()
      
      if (dbError) {
        console.error('❌ Database error:', dbError)
        alert('❌ Database error: ' + dbError.message)
        setUploading(false)
        return
      }
      
      console.log('✅ Complete! File uploaded and saved.')
      await loadFiles(doctorEmail, patientEmail)
      alert('✅ File uploaded successfully!')
      
    } catch (error) {
      console.error('❌ Upload failed:', error)
      alert('❌ Upload failed: ' + error.message)
    }
    
    setUploading(false)
  }

  const handleDeleteFile = async (fileId, fileName, fileUrl) => {
    if (!confirm(`Delete "${fileName}"?`)) return
    
    try {
      console.log('🗑️ Deleting file:', { fileId, fileName, fileUrl })
      
      // Extract file path from URL
      // URL format: https://.../storage/v1/object/public/patient-files/email@example.com/timestamp-file.pdf
      const urlParts = fileUrl.split('/patient-files/')
      const filePath = urlParts[1]
      
      // Delete from storage
      if (filePath) {
        console.log('🗑️ Deleting from storage:', filePath)
        const { error: storageError } = await supabase.storage
          .from('patient-files')
          .remove([filePath])
        
        if (storageError) {
          console.warn('⚠️ Storage delete warning:', storageError)
          // Continue anyway - might already be deleted
        }
      }
      
      // Delete from database
      const { error: dbError } = await supabase
        .from('patient_files')
        .delete()
        .eq('id', fileId)
      
      if (dbError) {
        alert('❌ Error deleting file: ' + dbError.message)
        return
      }
      
      console.log('✅ File deleted successfully')
      await loadFiles(doctorEmail, patientEmail)
      alert('✅ File deleted!')
      
    } catch (error) {
      console.error('❌ Delete failed:', error)
      alert('❌ Delete failed: ' + error.message)
    }
  }

  const handleGenerateVideo = () => {
    alert('Video generation functionality will be added later!')
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafafa' }}><div>Loading...</div></div>

  return (
    <div style={{ minHeight: '100vh', background: '#fafafa', padding: '2rem 6%' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
          <h1 style={{ 
            fontSize: '3rem', 
            fontWeight: '800', 
            marginBottom: '0.5rem',
            background: 'linear-gradient(135deg, #E879F9 0%, #F472B6 50%, #A855F7 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Manage Files for {patientName} 📁
          </h1>
          <p style={{ fontSize: '1.125rem', color: '#666' }}>Patient: {patientEmail}</p>
          <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button 
              onClick={() => navigate('/doctor')}
              style={{
                padding: '0.75rem 1.75rem',
                background: 'white',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                color: '#666',
                fontWeight: '500',
                cursor: 'pointer',
                fontSize: '0.95rem'
              }}
            >
              ← Back to Dashboard
            </button>
            <button 
              onClick={handleLogout}
              style={{
                padding: '0.75rem 1.75rem',
                background: 'linear-gradient(135deg, #E879F9 0%, #A855F7 100%)',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '0.95rem'
              }}
            >
              Logout
            </button>
          </div>
        </div>

        {/* Main Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          
          {/* Left: File Upload & Generate Video */}
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '2rem',
            border: '1px solid #e0e0e0',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
          }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem', color: '#1a1a1a' }}>
              Upload Files & Generate Video
            </h3>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label htmlFor="file-upload" style={{
                display: 'block',
                padding: '1rem 1.5rem',
                background: '#f0f0f0',
                border: '2px dashed #e0e0e0',
                borderRadius: '8px',
                textAlign: 'center',
                cursor: 'pointer',
                color: '#666',
                fontWeight: '500',
                transition: 'background-color 0.3s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e8e8e8'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
              >
                {uploading ? 'Uploading...' : 'Click to Upload File'}
              </label>
              <input 
                id="file-upload" 
                type="file" 
                onChange={handleFileUpload} 
                style={{ display: 'none' }} 
                disabled={uploading}
              />
            </div>

            <button 
              onClick={handleGenerateVideo}
              style={{
                width: '100%',
                padding: '1rem',
                background: 'linear-gradient(135deg, #E879F9 0%, #A855F7 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(232, 121, 249, 0.3)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              Generate Video 🎬
            </button>

            <div style={{ marginTop: '2rem' }}>
              <h4 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.75rem', color: '#1a1a1a' }}>
                Generated Video Preview:
              </h4>
              <div style={{
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                padding: '2rem',
                textAlign: 'center',
                background: '#fafafa',
                minHeight: '200px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column'
              }}>
                {videoUrl ? (
                  <>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎥</div>
                    <p style={{ color: '#999', fontSize: '1rem', marginBottom: '0.5rem' }}>Video available!</p>
                    <p style={{ color: '#ccc', fontSize: '0.875rem' }}>(Video player coming soon)</p>
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📹</div>
                    <p style={{ color: '#999', fontSize: '1rem', marginBottom: '0.5rem' }}>No video generated yet</p>
                    <p style={{ color: '#ccc', fontSize: '0.875rem' }}>Click "Generate Video" above</p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right: Patient Files List */}
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '2rem',
            border: '1px solid #e0e0e0',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
          }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem', color: '#1a1a1a' }}>
              Uploaded Files ({files.length})
            </h3>
            
            {files.length === 0 ? (
              <div style={{
                border: '2px dashed #e0e0e0',
                borderRadius: '8px',
                padding: '4rem 2rem',
                textAlign: 'center',
                background: '#fafafa',
                minHeight: '400px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📄</div>
                <p style={{ color: '#999', fontSize: '1.125rem', marginBottom: '0.5rem' }}>No files uploaded yet</p>
                <p style={{ color: '#ccc', fontSize: '0.95rem' }}>Upload files using the section on the left</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '500px', overflowY: 'auto' }}>
                {files.map((file, index) => (
                  <div key={index} style={{
                    padding: '1.25rem',
                    background: '#fafafa',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    border: '1px solid #e0e0e0'
                  }}>
                    <div style={{ fontSize: '2rem' }}>📄</div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: '600', fontSize: '1rem', marginBottom: '0.25rem', color: '#1a1a1a' }}>{file.file_name}</p>
                      <p style={{ fontSize: '0.85rem', color: '#999' }}>
                        Uploaded {new Date(file.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <a 
                        href={file.file_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{
                          padding: '0.5rem 1rem',
                          background: 'linear-gradient(135deg, #E879F9 0%, #A855F7 100%)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '0.8rem',
                          fontWeight: '600',
                          cursor: 'pointer',
                          textDecoration: 'none'
                        }}
                      >
                        View
                      </a>
                      <button
                        onClick={() => handleDeleteFile(file.id, file.file_name, file.file_url)}
                        style={{
                          padding: '0.5rem 1rem',
                          background: '#ff4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '0.8rem',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}

export default PatientFilesPage

