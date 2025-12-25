import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../utils/supabaseClient'
import { getCurrentSession, logout } from '../utils/sessionManager'
import { FiArrowLeft, FiLogOut, FiUpload, FiVideo, FiFileText, FiTrash2, FiExternalLink, FiRefreshCw, FiDatabase, FiImage, FiFile, FiX, FiChevronDown, FiChevronUp } from 'react-icons/fi'

function PatientFilesPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { patientEmail, patientName } = location.state || {}
  
  const [doctorEmail, setDoctorEmail] = useState('')
  const [files, setFiles] = useState([])
  const [videoUrl, setVideoUrl] = useState('')
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [generating, setGenerating] = useState(false)
  
  // Patient data state
  const [patientData, setPatientData] = useState(null)
  const [syncingData, setSyncingData] = useState(false)
  
  // File preview state
  const [previewFile, setPreviewFile] = useState(null)
  
  // Collapsible sections state
  const [patientDataExpanded, setPatientDataExpanded] = useState(true)

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
    await Promise.all([
      loadFiles(session.email, patientEmail),
      loadPatientData(session.email, patientEmail)
    ])
  }

  const loadFiles = async (docEmail, patEmail) => {
    try {
      const { data, error } = await supabase
        .from('patient_files')
        .select('*')
        .eq('patient_email', patEmail)
        .order('uploaded_at', { ascending: false })
      
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

const loadPatientData = async (docEmail, patEmail) => {
    try {
      // Try to load from epic_patient_data using patient email as epic_patient_id
      const { data, error } = await supabase
        .from('epic_patient_data')
        .select('*')
        .eq('doctor_email', docEmail)
        .eq('epic_patient_id', patEmail)
        .single()
      
      if (data) {
        // Transform to our display format
        setPatientData({
          ...data,
          conditions: data.diagnoses,
          date_of_birth: data.patient_dob
        })
      }
    } catch (error) {
      console.log('No patient data found:', error)
    }
  }

  // Pre-built demo patient data based on the patients in the system
  const getDemoPatientData = (email, name) => {
    // Normalize for matching
    const e = (email || '').toLowerCase()
    const n = (name || '').toLowerCase()
    
    // Anish Polakala - Neuro-Oncology
    if (e.includes('anish') || n.includes('anish')) {
      return {
        patient_name: 'Polakala, Anish R.',
        patient_dob: '03/14/1992',
        gender: 'Male',
        epic_mrn: 'MRN-2847591',
        insurance: 'Blue Cross Blue Shield PPO',
        pcp: 'Dr. Sarah Chen, MD',
        last_visit: '12/15/2024',
        clinical_notes: `CHIEF COMPLAINT: Follow-up for glioblastoma multiforme, adjuvant chemotherapy cycle 4.

HISTORY OF PRESENT ILLNESS: Mr. Polakala is a 32-year-old male with Grade IV GBM of the right temporal lobe diagnosed June 2024 after presenting with new-onset seizures and word-finding difficulty. Underwent craniotomy with gross total resection 06/18/2024 (Dr. Martinez). Pathology: GBM, IDH-wildtype, MGMT unmethylated. Completed concurrent chemoradiation per Stupp protocol. Now in cycle 4 of adjuvant temozolomide.

Current symptoms: Mild fatigue (grade 1), occasional nausea managed with ondansetron. No new neurological symptoms. Seizure-free on levetiracetam. ECOG PS 1.

PHYSICAL EXAM: A&Ox3, CN II-XII intact, no focal deficits, speech fluent, gait steady.

ASSESSMENT & PLAN:
1. GBM right temporal lobe - Continue TMZ cycle 5 starting 01/12/2025. MRI brain w/contrast 01/08/2025.
2. Seizure disorder - Well-controlled on Keppra. Continue current dose.
3. Cerebral edema - Dex taper in progress, reduce to 2mg daily next week.
4. Supportive care - Continue omeprazole, ondansetron PRN.

Return 4 weeks. Clinical trial discussion pending MRI results.`,
        diagnoses: [
          { name: 'Malignant neoplasm of brain, unspecified', code: 'C71.9', status: 'Active', onset: '06/15/2024', priority: 'Primary' },
          { name: 'Cerebral edema', code: 'G93.6', status: 'Active', onset: '06/20/2024', priority: 'Secondary' },
          { name: 'Epilepsy, unspecified, not intractable', code: 'G40.909', status: 'Controlled', onset: '07/01/2024', priority: 'Secondary' },
          { name: 'Encounter for antineoplastic chemotherapy', code: 'Z51.11', status: 'Active', onset: '07/15/2024', priority: 'Secondary' }
        ],
        medications: [
          { name: 'Temozolomide 140mg', sig: 'Take 1 capsule by mouth daily on days 1-5 every 28 days', prescriber: 'Dr. James Wilson', pharmacy: 'CVS Specialty #4521', refills: 2 },
          { name: 'Dexamethasone 4mg', sig: 'Take 1 tablet by mouth twice daily with food', prescriber: 'Dr. James Wilson', pharmacy: 'CVS Specialty #4521', refills: 3 },
          { name: 'Levetiracetam 500mg', sig: 'Take 1 tablet by mouth twice daily', prescriber: 'Dr. James Wilson', pharmacy: 'CVS Specialty #4521', refills: 5 },
          { name: 'Omeprazole 20mg', sig: 'Take 1 capsule by mouth daily before breakfast', prescriber: 'Dr. James Wilson', pharmacy: 'CVS Specialty #4521', refills: 5 },
          { name: 'Ondansetron 8mg ODT', sig: 'Dissolve 1 tablet under tongue every 8 hours as needed for nausea', prescriber: 'Dr. James Wilson', pharmacy: 'CVS Specialty #4521', refills: 2 }
        ],
        allergies: [
          { substance: 'Iodinated contrast media', reaction: 'Urticaria (hives)', severity: 'Mild', verified: '06/14/2024' }
        ],
        vitals: {
          date: '12/15/2024 09:32 AM',
          bp_systolic: '122',
          bp_diastolic: '78',
          pulse: '76',
          temp: '98.4',
          resp: '16',
          spo2: '98',
          weight: '175',
          height: '70',
          bmi: '25.1'
        },
        labs: [
          { name: 'WBC', value: '5.2', unit: 'K/uL', range: '4.5-11.0', date: '12/10/2024' },
          { name: 'Hemoglobin', value: '13.8', unit: 'g/dL', range: '13.5-17.5', date: '12/10/2024' },
          { name: 'Platelets', value: '185', unit: 'K/uL', range: '150-400', date: '12/10/2024' },
          { name: 'ANC', value: '3.1', unit: 'K/uL', range: '>1.5', date: '12/10/2024' },
          { name: 'Creatinine', value: '0.9', unit: 'mg/dL', range: '0.7-1.3', date: '12/10/2024' },
          { name: 'ALT', value: '28', unit: 'U/L', range: '7-56', date: '12/10/2024' }
        ]
      }
    }
    
    // Keisha Washington - Pulmonology
    if (e.includes('keisha') || n.includes('keisha') || n.includes('washington')) {
      return {
        patient_name: 'Washington, Keisha M.',
        patient_dob: '11/22/1988',
        gender: 'Female',
        epic_mrn: 'MRN-3847562',
        insurance: 'Aetna HMO',
        pcp: 'Dr. Michael Roberts, MD',
        last_visit: '12/12/2024',
        clinical_notes: `CHIEF COMPLAINT: Asthma follow-up, routine maintenance visit.

HISTORY OF PRESENT ILLNESS: Ms. Washington is a 36-year-old female with moderate persistent asthma since age 27, complicated by aspirin-exacerbated respiratory disease (AERD). Current control: well-controlled on ICS/LABA + LTRA. Last exacerbation 3 months ago triggered by viral URI, required 5-day prednisone burst, resolved completely. No ED visits or hospitalizations in past year.

Current symptoms: Occasional nighttime cough 1-2x/month, uses rescue inhaler 1-2x/week. Denies wheezing at rest, exercise-limited symptoms, or nocturnal awakening. Peak flow diary: 85-95% personal best consistently. Avoids known triggers (cats, NSAIDs, smoke).

PHYSICAL EXAM: Lungs clear to auscultation bilaterally, no wheezes/rhonchi. No nasal polyps visualized. Oropharynx clear.

ASSESSMENT & PLAN:
1. Moderate persistent asthma - Well controlled. Continue Advair 250/50 BID, albuterol PRN. Inhaler technique reviewed - good form.
2. AERD - Strict NSAID avoidance. Medical alert bracelet discussed.
3. Allergic rhinitis - Stable on montelukast.
4. Prevention - Influenza vaccine administered today. COVID booster discussed, patient to schedule.
5. Vitamin D deficiency - Stable on supplementation, recheck level in 6 months.

Return 3 months or PRN for exacerbation. Asthma action plan reviewed.`,
        diagnoses: [
          { name: 'Moderate persistent asthma, uncomplicated', code: 'J45.40', status: 'Active', onset: '04/10/2015', priority: 'Primary' },
          { name: 'Allergic rhinitis, unspecified', code: 'J30.9', status: 'Active', onset: '04/10/2015', priority: 'Secondary' },
          { name: 'Aspirin-induced asthma', code: 'J45.991', status: 'Active', onset: '05/22/2018', priority: 'Secondary' },
          { name: 'Vitamin D deficiency, unspecified', code: 'E55.9', status: 'Active', onset: '01/15/2023', priority: 'Secondary' }
        ],
        medications: [
          { name: 'Fluticasone-Salmeterol 250-50mcg', sig: 'Inhale 1 puff by mouth twice daily. Rinse mouth after use.', prescriber: 'Dr. Lisa Park', pharmacy: 'Walgreens #1847', refills: 3 },
          { name: 'Albuterol HFA 90mcg', sig: 'Inhale 2 puffs by mouth every 4-6 hours as needed for shortness of breath', prescriber: 'Dr. Lisa Park', pharmacy: 'Walgreens #1847', refills: 5 },
          { name: 'Montelukast 10mg', sig: 'Take 1 tablet by mouth at bedtime', prescriber: 'Dr. Lisa Park', pharmacy: 'Walgreens #1847', refills: 5 },
          { name: 'Vitamin D3 2000 IU', sig: 'Take 1 softgel by mouth daily with food', prescriber: 'Dr. Michael Roberts', pharmacy: 'Walgreens #1847', refills: 11 }
        ],
        allergies: [
          { substance: 'Aspirin', reaction: 'Bronchospasm, respiratory distress', severity: 'Severe', verified: '05/22/2018' },
          { substance: 'NSAIDs (class)', reaction: 'Wheezing, chest tightness', severity: 'Moderate', verified: '05/22/2018' },
          { substance: 'Cat dander', reaction: 'Asthma exacerbation, rhinitis', severity: 'Moderate', verified: '04/10/2015' }
        ],
        vitals: {
          date: '12/12/2024 02:15 PM',
          bp_systolic: '118',
          bp_diastolic: '74',
          pulse: '72',
          temp: '98.6',
          resp: '14',
          spo2: '99',
          weight: '145',
          height: '65',
          bmi: '24.1',
          peak_flow: '420'
        },
        labs: [
          { name: 'Vitamin D, 25-OH', value: '42', unit: 'ng/mL', range: '30-100', date: '11/15/2024' },
          { name: 'IgE, Total', value: '285', unit: 'IU/mL', range: '<100', flag: 'H', date: '09/20/2024' }
        ]
      }
    }
    
    // Mei Lin Zhang - Psychiatry
    if (e.includes('meilin') || e.includes('mei') || n.includes('mei') || n.includes('zhang')) {
      return {
        patient_name: 'Zhang, Mei Lin',
        patient_dob: '07/08/1995',
        gender: 'Female',
        epic_mrn: 'MRN-4958271',
        insurance: 'United Healthcare',
        pcp: 'Dr. Jennifer Lee, MD',
        last_visit: '12/08/2024',
        clinical_notes: `CHIEF COMPLAINT: Psychiatric follow-up for anxiety disorders.

HISTORY OF PRESENT ILLNESS: Ms. Zhang is a 29-year-old female with generalized anxiety disorder and panic disorder, first diagnosed in 2021 during graduate school. Initially presented with persistent worry, muscle tension, and panic attacks occurring 3-4x/week with significant avoidance behaviors. Started sertraline 50mg, titrated to 100mg over 3 months with good response.

Current status: Significant improvement. Panic attacks reduced to ~1/month, less intense, shorter duration. Uses hydroxyzine PRN 2x/week (down from daily). Worry more manageable. Sleep improved with sleep hygiene measures - falling asleep within 30 min, sleeping 7 hours. Engaged in weekly CBT with Dr. Martinez - finds cognitive restructuring helpful.

MENTAL STATUS EXAM: Well-groomed, cooperative. Speech normal rate/volume. Mood "pretty good." Affect euthymic, full range. Thought process linear, goal-directed. No SI/HI. Insight/judgment good.

SCREENING: PHQ-9: 6 (mild), GAD-7: 8 (mild) - both improved from initial scores of 14 and 16.

ASSESSMENT & PLAN:
1. GAD - Stable on sertraline 100mg. Continue current dose.
2. Panic disorder - In partial remission. Continue PRN hydroxyzine for breakthrough symptoms.
3. Insomnia - Improved with sleep hygiene. Continue melatonin PRN.
4. Psychotherapy - Continue weekly CBT. Patient finds it beneficial.

Return 8 weeks. Call sooner if symptoms worsen or new concerns arise.`,
        diagnoses: [
          { name: 'Generalized anxiety disorder', code: 'F41.1', status: 'Active', onset: '09/15/2021', priority: 'Primary' },
          { name: 'Panic disorder without agoraphobia', code: 'F41.0', status: 'In Remission', onset: '03/20/2022', priority: 'Primary' },
          { name: 'Insomnia, unspecified', code: 'G47.00', status: 'Improved', onset: '10/01/2021', priority: 'Secondary' }
        ],
        medications: [
          { name: 'Sertraline 100mg', sig: 'Take 1 tablet by mouth every morning', prescriber: 'Dr. Amanda Foster', pharmacy: 'CVS #2847', refills: 3 },
          { name: 'Hydroxyzine 25mg', sig: 'Take 1 tablet by mouth every 6 hours as needed for anxiety', prescriber: 'Dr. Amanda Foster', pharmacy: 'CVS #2847', refills: 2 },
          { name: 'Melatonin 3mg', sig: 'Take 1 tablet by mouth 30 minutes before bedtime as needed', prescriber: 'Dr. Jennifer Lee', pharmacy: 'CVS #2847', refills: 'OTC' }
        ],
        allergies: [
          { substance: 'Sulfonamide antibiotics', reaction: 'Maculopapular rash', severity: 'Moderate', verified: '03/15/2019' }
        ],
        vitals: {
          date: '12/08/2024 10:45 AM',
          bp_systolic: '110',
          bp_diastolic: '70',
          pulse: '68',
          temp: '98.2',
          resp: '14',
          spo2: '99',
          weight: '125',
          height: '63',
          bmi: '22.1'
        },
        labs: [
          { name: 'TSH', value: '2.1', unit: 'mIU/L', range: '0.4-4.0', date: '10/01/2024' }
        ],
        screenings: [
          { name: 'PHQ-9', score: '6', interpretation: 'Mild depression', date: '12/08/2024' },
          { name: 'GAD-7', score: '8', interpretation: 'Mild anxiety', date: '12/08/2024' }
        ]
      }
    }
    
    // Jamal Thompson - Orthopedics
    if (e.includes('jamal') || n.includes('jamal') || n.includes('thompson')) {
      return {
        patient_name: 'Thompson, Jamal D.',
        patient_dob: '02/28/1968',
        gender: 'Male',
        epic_mrn: 'MRN-1847392',
        insurance: 'Medicare Part B + Medigap',
        pcp: 'Dr. Robert Kim, MD',
        last_visit: '12/10/2024',
        clinical_notes: `CHIEF COMPLAINT: Bilateral knee pain, worse on right, follow-up visit.

HISTORY OF PRESENT ILLNESS: Mr. Thompson is a 56-year-old male with primary osteoarthritis bilateral knees, right worse than left, diagnosed 2018. K-L Grade III right knee, Grade II left. Previous right knee arthroscopy (2020) with medial meniscectomy provided temporary relief (~18 months). Also manages HTN and obesity.

Current symptoms: Right knee pain 5/10 at rest, 7/10 with activity. Left knee 3/10. Morning stiffness ~30 minutes. Pain worse with stairs, prolonged standing. Improved with rest, ice, medications. Completed 6 weeks PT - reports 40% functional improvement. Using cane occasionally for long distances.

PHYSICAL EXAM: BMI 31.9. Bilateral knee exam: Mild effusions, R>L. Crepitus with ROM. ROM: R 5-115°, L 0-125°. Varus alignment R knee. Tenderness medial joint line bilaterally. No instability. Gait antalgic on right.

ASSESSMENT & PLAN:
1. Bilateral knee OA - Continue conservative management. Meloxicam + topical diclofenac providing adequate relief. Consider viscosupplementation (Synvisc) if symptoms plateau. Discussed TKR - patient prefers to delay surgical intervention.
2. Obesity - Contributing to knee symptoms. Counseled on weight loss goal 10% over 6 months. Referred to nutritionist.
3. HTN - Well-controlled on lisinopril. Continue current dose. Monitor renal function given NSAID use.

Ortho referral placed for surgical evaluation when ready. Return 3 months or PRN for worsening symptoms.`,
        diagnoses: [
          { name: 'Primary osteoarthritis, bilateral knees', code: 'M17.0', status: 'Active', onset: '05/20/2018', priority: 'Primary' },
          { name: 'Obesity, unspecified', code: 'E66.9', status: 'Active', onset: '01/01/2015', priority: 'Secondary' },
          { name: 'Essential hypertension', code: 'I10', status: 'Controlled', onset: '08/15/2019', priority: 'Secondary' }
        ],
        medications: [
          { name: 'Meloxicam 15mg', sig: 'Take 1 tablet by mouth daily with food', prescriber: 'Dr. Robert Kim', pharmacy: 'Rite Aid #847', refills: 2 },
          { name: 'Diclofenac gel 1%', sig: 'Apply to affected knees 4 times daily. Do not exceed 32g/day.', prescriber: 'Dr. Robert Kim', pharmacy: 'Rite Aid #847', refills: 3 },
          { name: 'Glucosamine-Chondroitin 1500-1200mg', sig: 'Take 1 tablet by mouth daily', prescriber: 'Dr. Robert Kim', pharmacy: 'Rite Aid #847', refills: 'OTC' },
          { name: 'Lisinopril 20mg', sig: 'Take 1 tablet by mouth every morning', prescriber: 'Dr. Robert Kim', pharmacy: 'Rite Aid #847', refills: 5 }
        ],
        allergies: [
          { substance: 'Codeine', reaction: 'Severe nausea, vomiting', severity: 'Moderate', verified: '03/12/2010' }
        ],
        vitals: {
          date: '12/10/2024 11:20 AM',
          bp_systolic: '134',
          bp_diastolic: '84',
          pulse: '78',
          temp: '98.6',
          resp: '16',
          spo2: '97',
          weight: '235',
          height: '72',
          bmi: '31.9',
          pain_r: '5',
          pain_l: '3'
        },
        labs: [
          { name: 'Creatinine', value: '1.0', unit: 'mg/dL', range: '0.7-1.3', date: '11/05/2024' },
          { name: 'Potassium', value: '4.2', unit: 'mEq/L', range: '3.5-5.0', date: '11/05/2024' },
          { name: 'Uric Acid', value: '6.8', unit: 'mg/dL', range: '3.5-7.2', date: '11/05/2024' }
        ],
        imaging: [
          { name: 'XR Knee Bilateral', result: 'Moderate OA changes R knee, mild L knee. Joint space narrowing, osteophytes.', date: '10/15/2024' }
        ]
      }
    }
    
    // Priya Sharma - Cardiology
    if (e.includes('priya') || n.includes('priya') || n.includes('sharma')) {
      return {
        patient_name: 'Sharma, Priya K.',
        patient_dob: '12/05/1975',
        gender: 'Female',
        epic_mrn: 'MRN-5739281',
        insurance: 'Cigna PPO',
        pcp: 'Dr. David Chen, MD',
        last_visit: '12/14/2024',
        clinical_notes: `CHIEF COMPLAINT: Cardiology follow-up, 8 months post-STEMI.

HISTORY OF PRESENT ILLNESS: Mrs. Sharma is a 49-year-old female with history of anterior STEMI in April 2024, treated with emergent PCI to LAD with drug-eluting stent. Initial EF 35% with anterior wall hypokinesis. Completed 12-week cardiac rehabilitation program with excellent progress. Also manages T2DM and hyperlipidemia.

Current status: No angina, dyspnea, palpitations, or edema. Exercise tolerance excellent - walking 2 miles daily, climbing stairs without difficulty. Adherent to all medications (uses pill organizer). Following heart-healthy diet. Recent TTE shows improved EF 48% with only mild anterior hypokinesis.

REVIEW OF SYSTEMS: Denies chest pain, SOB, orthopnea, PND, palpitations, syncope, leg swelling.

PHYSICAL EXAM: BP 126/76, HR 62 regular. JVP not elevated. Lungs clear. Heart RRR, S1/S2 normal, no murmurs/gallops. No peripheral edema. Radial pulses 2+ bilaterally.

LABS REVIEW: A1c 6.8% (down from 8.2%), LDL 68 mg/dL (at goal), BNP 125 (mildly elevated, improved from 450).

ASSESSMENT & PLAN:
1. CAD s/p STEMI, s/p LAD PCI - Continue DAPT (ASA + clopidogrel) through April 2025 (12 months), then reassess for de-escalation. Guideline-directed medical therapy optimized.
2. HFrEF, improving - EF improved to 48%. Continue beta-blocker, ACEi. Repeat TTE in 6 months.
3. T2DM - Well-controlled, A1c at goal. Continue metformin.
4. Hyperlipidemia - At goal on high-intensity statin. Continue atorvastatin 80mg.
5. Lifestyle - Reinforce medication adherence, diet, exercise. Patient doing well.

Return 3 months. Call for any chest pain, SOB, or concerning symptoms.`,
        diagnoses: [
          { name: 'STEMI involving LAD, status post PCI', code: 'I21.02', status: 'Resolved', onset: '04/15/2024', priority: 'Primary' },
          { name: 'Coronary artery disease of native vessel', code: 'I25.10', status: 'Active', onset: '04/15/2024', priority: 'Primary' },
          { name: 'Heart failure with reduced EF (HFrEF)', code: 'I50.22', status: 'Improved', onset: '04/15/2024', priority: 'Secondary' },
          { name: 'Type 2 diabetes mellitus without complications', code: 'E11.9', status: 'Controlled', onset: '03/10/2020', priority: 'Secondary' },
          { name: 'Hyperlipidemia, unspecified', code: 'E78.5', status: 'Controlled', onset: '06/01/2019', priority: 'Secondary' }
        ],
        medications: [
          { name: 'Aspirin 81mg EC', sig: 'Take 1 tablet by mouth daily', prescriber: 'Dr. Mark Stevens', pharmacy: 'CVS Caremark', refills: 5 },
          { name: 'Clopidogrel 75mg', sig: 'Take 1 tablet by mouth daily', prescriber: 'Dr. Mark Stevens', pharmacy: 'CVS Caremark', refills: 2 },
          { name: 'Metoprolol succinate ER 50mg', sig: 'Take 1 tablet by mouth every morning', prescriber: 'Dr. Mark Stevens', pharmacy: 'CVS Caremark', refills: 5 },
          { name: 'Atorvastatin 80mg', sig: 'Take 1 tablet by mouth at bedtime', prescriber: 'Dr. Mark Stevens', pharmacy: 'CVS Caremark', refills: 5 },
          { name: 'Lisinopril 10mg', sig: 'Take 1 tablet by mouth daily', prescriber: 'Dr. Mark Stevens', pharmacy: 'CVS Caremark', refills: 5 },
          { name: 'Metformin 1000mg', sig: 'Take 1 tablet by mouth twice daily with meals', prescriber: 'Dr. David Chen', pharmacy: 'CVS Caremark', refills: 5 }
        ],
        allergies: [
          { substance: 'Captopril', reaction: 'Angioedema (facial swelling)', severity: 'Severe', verified: '02/20/2019' },
          { substance: 'Shellfish', reaction: 'Urticaria', severity: 'Mild', verified: '01/15/2010' }
        ],
        vitals: {
          date: '12/14/2024 03:30 PM',
          bp_systolic: '126',
          bp_diastolic: '76',
          pulse: '62',
          temp: '98.4',
          resp: '14',
          spo2: '98',
          weight: '158',
          height: '64',
          bmi: '27.1'
        },
        labs: [
          { name: 'HbA1c', value: '6.8', unit: '%', range: '<7.0', date: '12/01/2024' },
          { name: 'LDL-C', value: '68', unit: 'mg/dL', range: '<70', date: '12/01/2024' },
          { name: 'HDL-C', value: '52', unit: 'mg/dL', range: '>40', date: '12/01/2024' },
          { name: 'Triglycerides', value: '138', unit: 'mg/dL', range: '<150', date: '12/01/2024' },
          { name: 'BNP', value: '125', unit: 'pg/mL', range: '<100', flag: 'H', date: '12/01/2024' },
          { name: 'Creatinine', value: '0.8', unit: 'mg/dL', range: '0.6-1.1', date: '12/01/2024' }
        ],
        imaging: [
          { name: 'TTE (Echocardiogram)', result: 'LVEF 48% (improved from 35%). Mild hypokinesis anterior wall. No significant valvular disease.', date: '11/15/2024' }
        ]
      }
    }
    
    // Default - Generic patient
    return {
      patient_name: name || 'Patient, Unknown',
      patient_dob: 'Unknown',
      gender: 'Unknown',
      epic_mrn: 'MRN-' + Date.now().toString().slice(-7),
      insurance: 'Unknown',
      pcp: 'Not assigned',
      last_visit: new Date().toLocaleDateString(),
      clinical_notes: 'New patient record. No clinical documentation available. Please sync with EMR to retrieve patient data.',
      diagnoses: [],
      medications: [],
      allergies: [{ substance: 'NKDA (No Known Drug Allergies)', reaction: 'N/A', severity: 'None', verified: 'Unverified' }],
      vitals: null,
      labs: []
    }
  }

  const handleSyncPatientData = async () => {
    setSyncingData(true)
    
    try {
      // Get the pre-built demo data for this patient
      const demoPatientInfo = getDemoPatientData(patientEmail, patientName)
      
      // Check if data already exists in database
      const { data: existing } = await supabase
        .from('epic_patient_data')
        .select('id')
        .eq('doctor_email', doctorEmail)
        .eq('epic_patient_id', patientEmail)
        .single()
      
      // Prepare data for database (matches epic_patient_data schema)
      const dbData = {
        doctor_email: doctorEmail,
        epic_patient_id: patientEmail,
        epic_mrn: demoPatientInfo.epic_mrn,
        patient_name: demoPatientInfo.patient_name,
        patient_dob: demoPatientInfo.patient_dob,
        clinical_notes: demoPatientInfo.clinical_notes,
        diagnoses: demoPatientInfo.diagnoses,
        medications: demoPatientInfo.medications,
        last_synced: new Date().toISOString()
      }
      
      if (existing) {
        const { error } = await supabase
          .from('epic_patient_data')
          .update(dbData)
          .eq('id', existing.id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('epic_patient_data')
          .insert([dbData])
        if (error) throw error
      }
      
      // Set the full display data directly (already in correct format)
      setPatientData({
        ...demoPatientInfo,
        last_synced: new Date().toISOString()
      })
      
      alert('✅ Patient data synced from EMR!')
    } catch (error) {
      console.error('Error syncing patient data:', error)
      // Even if database save fails, still show the demo data
      const demoPatientInfo = getDemoPatientData(patientEmail, patientName)
      setPatientData({
        ...demoPatientInfo,
        last_synced: new Date().toISOString()
      })
      console.log('Showing demo data (database save failed)')
    }
    
    setSyncingData(false)
  }

  // Upload file - tries Supabase Storage first, falls back to base64
  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be under 10MB')
      return
    }
    
    setUploading(true)
    
    try {
      let fileUrl = ''
      let uploadMethod = 'storage'
      
      // Try Supabase Storage first
      const timestamp = Date.now()
      const sanitizedEmail = patientEmail.replace(/[^a-zA-Z0-9]/g, '_')
      const filePath = `${sanitizedEmail}/${timestamp}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('patient-files')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })
      
      if (!uploadError && uploadData) {
        // Get public URL
      const { data: urlData } = supabase.storage
        .from('patient-files')
        .getPublicUrl(filePath)
        fileUrl = urlData.publicUrl
        console.log('✅ Uploaded to Supabase Storage:', fileUrl)
      } else {
        // Fall back to base64 for smaller files
        console.log('⚠️ Storage failed, using base64:', uploadError?.message)
        uploadMethod = 'base64'
        
        if (file.size > 5 * 1024 * 1024) {
          alert('Storage bucket not configured. Files over 5MB require storage setup.\n\nSee console for setup instructions.')
          console.log(`
╔══════════════════════════════════════════════════════════════╗
║           SUPABASE STORAGE BUCKET SETUP                      ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  1. Go to: https://supabase.com/dashboard                    ║
║  2. Select your project                                      ║
║  3. Click "Storage" in the left sidebar                      ║
║  4. Click "New bucket"                                       ║
║  5. Name: patient-files                                      ║
║  6. Check "Public bucket" ✓                                  ║
║  7. Click "Create bucket"                                    ║
║                                                              ║
║  Then add this policy (click bucket → Policies → New):       ║
║  ─────────────────────────────────────────────────────────   ║
║  Policy name: Allow all operations                           ║
║  Allowed operations: SELECT, INSERT, UPDATE, DELETE          ║
║  Target roles: anon, authenticated                           ║
║  Policy: true                                                ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
          `)
          setUploading(false)
          return
        }
        
        // Convert to base64 for smaller files
        fileUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onloadend = () => resolve(reader.result)
          reader.onerror = reject
          reader.readAsDataURL(file)
        })
      }
      
      // Determine file category for preview
      const ext = file.name.toLowerCase().split('.').pop()
      const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(ext)
      const isPdf = ext === 'pdf'
      
      // Save to database
      const { error: dbError } = await supabase
        .from('patient_files')
        .insert([{
          patient_email: patientEmail,
          file_type: 'file',
          file_url: fileUrl,
          file_name: file.name,
          file_size: file.size
        }])
      
      if (dbError) {
        console.error('❌ Database error:', dbError)
        alert('❌ Database error: ' + dbError.message)
        setUploading(false)
        return
      }
      
      await loadFiles(doctorEmail, patientEmail)
      alert(`✅ File uploaded successfully! (${uploadMethod === 'storage' ? 'Cloud Storage' : 'Embedded'})`)
      
    } catch (error) {
      console.error('❌ Upload failed:', error)
      alert('❌ Upload failed: ' + error.message)
    }
    
    setUploading(false)
    // Reset file input
    e.target.value = ''
  }

  const handleDeleteFile = async (fileId, fileName) => {
    if (!confirm(`Delete "${fileName}"?`)) return
    
    try {
      const { error: dbError } = await supabase
        .from('patient_files')
        .delete()
        .eq('id', fileId)
      
      if (dbError) {
        alert('❌ Error deleting file: ' + dbError.message)
        return
      }
      
      await loadFiles(doctorEmail, patientEmail)
      alert('✅ File deleted!')
      
    } catch (error) {
      console.error('❌ Delete failed:', error)
      alert('❌ Delete failed: ' + error.message)
    }
  }

  const handleGenerateVideo = async () => {
    setGenerating(true)
    
    setTimeout(async () => {
      const diagnosisVideoUrl = '/images/diagnosis-video.mp4'
      
      try {
        const { data: existingVideo } = await supabase
          .from('patient_files')
          .select('id')
          .eq('patient_email', patientEmail)
          .eq('file_type', 'video')
          .single()
        
        if (existingVideo) {
          const { error } = await supabase
            .from('patient_files')
            .update({ file_url: diagnosisVideoUrl, file_name: `diagnosis_video_${Date.now()}.mp4` })
            .eq('id', existingVideo.id)
          if (error) console.error('Error updating video:', error)
        } else {
          const { error } = await supabase
        .from('patient_files')
        .insert([{
          patient_email: patientEmail,
          file_type: 'video',
              file_url: diagnosisVideoUrl,
              file_name: `diagnosis_video_${Date.now()}.mp4`
            }])
          if (error) console.error('Error saving video:', error)
        }
        
        setVideoUrl(diagnosisVideoUrl)
        alert('✅ Video generated and sent to patient!')
    } catch (error) {
      console.error('Error generating video:', error)
        // Still show the video even if database fails
        setVideoUrl(diagnosisVideoUrl)
      }
      
      setGenerating(false)
    }, 2000)
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  // Check if file is an image
  const isImage = (fileName) => {
    const ext = fileName?.toLowerCase().split('.').pop()
    return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(ext)
  }

  // Parse JSON safely
  const parseJSON = (str) => {
    try {
      return typeof str === 'string' ? JSON.parse(str) : str
    } catch {
      return null
    }
  }

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#FAFAFA'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid #E5E5E5',
            borderTopColor: '#0A0A0A',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 1rem'
          }} />
          <p style={{ color: '#525252', fontSize: '0.875rem' }}>Loading patient files...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAFA' }}>
        {/* Header */}
      <header style={{
        background: '#FFFFFF',
        borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ 
          maxWidth: '900px', 
          margin: '0 auto', 
          padding: '1rem 2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button 
              onClick={() => navigate('/doctor')}
              style={{
                padding: '0.5rem',
                background: 'transparent',
                border: '1px solid rgba(0, 0, 0, 0.08)',
                borderRadius: '8px',
                color: '#525252',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s ease-out'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#0A0A0A'; e.currentTarget.style.color = '#0A0A0A' }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.08)'; e.currentTarget.style.color = '#525252' }}
            >
              <FiArrowLeft size={18} />
            </button>
            <div>
              <h1 style={{ 
                margin: 0, 
                fontSize: '1.25rem', 
                fontWeight: '600',
                color: '#0A0A0A',
                letterSpacing: '-0.02em'
              }}>
                {patientName || 'Patient Files'}
              </h1>
              <p style={{ margin: 0, fontSize: '0.8125rem', color: '#A3A3A3' }}>
                {patientEmail}
              </p>
            </div>
          </div>

            <button 
              onClick={handleLogout}
              style={{
              padding: '0.5rem 0.875rem',
              background: '#0A0A0A',
                border: 'none',
              borderRadius: '8px',
                color: 'white',
              fontSize: '0.8125rem',
              fontWeight: '500',
                cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              transition: 'opacity 0.15s ease-out',
              fontFamily: 'inherit'
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.85'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
          >
            <FiLogOut size={14} />
              Logout
            </button>
          </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
        
        {/* Section 1: Sync Patient Data - Collapsible */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '12px',
          border: '1px solid rgba(0, 0, 0, 0.06)',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
          marginBottom: '1.5rem',
          overflow: 'hidden'
        }}>
          {/* Collapsible Header */}
          <div 
                style={{
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              padding: '1rem 1.5rem',
              background: patientData ? '#FAFAFA' : 'transparent',
              borderBottom: patientDataExpanded && patientData ? '1px solid rgba(0,0,0,0.06)' : 'none',
              cursor: patientData ? 'pointer' : 'default'
            }}
            onClick={() => patientData && setPatientDataExpanded(!patientDataExpanded)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {patientData && (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  transition: 'transform 0.2s ease'
                }}>
                  {patientDataExpanded ? <FiChevronUp size={18} color="#A3A3A3" /> : <FiChevronDown size={18} color="#A3A3A3" />}
                </div>
              )}
              <FiDatabase size={18} color="#0A0A0A" />
              <div>
                <h2 style={{ fontSize: '0.9375rem', fontWeight: '600', color: '#0A0A0A', margin: 0, letterSpacing: '-0.02em' }}>
                  Patient Health Data
                </h2>
                {patientData && !patientDataExpanded && (
                  <p style={{ margin: '0.125rem 0 0 0', fontSize: '0.75rem', color: '#A3A3A3' }}>
                    {patientData.patient_name} · {patientData.epic_mrn}
                  </p>
                )}
              </div>
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); handleSyncPatientData(); }}
              disabled={syncingData}
              style={{
                padding: '0.5rem 1rem',
                background: '#0A0A0A',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.8125rem',
                fontWeight: '500',
                cursor: syncingData ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
                transition: 'opacity 0.15s ease-out',
                fontFamily: 'inherit',
                opacity: syncingData ? 0.6 : 1
              }}
              onMouseEnter={(e) => { if (!syncingData) e.currentTarget.style.opacity = '0.85' }}
              onMouseLeave={(e) => { if (!syncingData) e.currentTarget.style.opacity = '1' }}
            >
              <FiRefreshCw size={14} className={syncingData ? 'spin' : ''} />
              {syncingData ? 'Syncing...' : 'Sync Data'}
            </button>
        </div>

          {/* Collapsible Content */}
          <div style={{
            maxHeight: patientDataExpanded ? '2000px' : '0',
            overflow: 'hidden',
            transition: 'max-height 0.3s ease-out',
            padding: patientDataExpanded ? '1.5rem' : '0 1.5rem'
          }}>
{patientData ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Patient Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: '1rem', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                <div>
                  <h3 style={{ margin: '0 0 0.375rem 0', fontSize: '1.125rem', fontWeight: '600', color: '#0A0A0A', letterSpacing: '-0.02em' }}>
                    {patientData.patient_name}
            </h3>
                  <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.8125rem', color: '#525252' }}>
                    <span>DOB: <strong>{patientData.patient_dob}</strong></span>
                    <span>Sex: <strong>{patientData.gender}</strong></span>
                    <span>MRN: <strong style={{ fontFamily: 'monospace' }}>{patientData.epic_mrn}</strong></span>
            </div>
          </div>
                <div style={{ textAlign: 'right', fontSize: '0.75rem', color: '#A3A3A3' }}>
                  <div>{patientData.insurance}</div>
                  <div>PCP: {patientData.pcp}</div>
                </div>
              </div>


              {/* Clinical Notes - TOP & PROMINENT */}
              {patientData.clinical_notes && (
            <div style={{
                  background: '#FAFAFA', 
                  borderRadius: '8px',
                  padding: '1rem',
                  border: '1px solid rgba(0,0,0,0.04)'
                }}>
                  <h4 style={{ margin: '0 0 0.625rem 0', fontSize: '0.6875rem', fontWeight: '600', color: '#A3A3A3', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Clinical Notes
                  </h4>
                  <div style={{ 
                    fontSize: '0.8125rem',
                    color: '#0A0A0A',
                    lineHeight: '1.7',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {patientData.clinical_notes}
              </div>
                </div>
              )}

              {/* Vitals - Compact inline */}
              {patientData.vitals && (
                <div style={{ 
                      display: 'flex',
                      alignItems: 'center',
                  gap: '1.5rem', 
                  padding: '0.75rem 1rem',
                  background: '#F9FAFB', 
                  borderRadius: '6px',
                  flexWrap: 'wrap'
                }}>
                  <span style={{ fontSize: '0.6875rem', fontWeight: '600', color: '#A3A3A3', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Vitals</span>
                  <span style={{ fontSize: '0.8125rem', color: '#0A0A0A' }}>BP <strong>{patientData.vitals.bp_systolic}/{patientData.vitals.bp_diastolic}</strong></span>
                  <span style={{ fontSize: '0.8125rem', color: '#0A0A0A' }}>HR <strong>{patientData.vitals.pulse}</strong></span>
                  <span style={{ fontSize: '0.8125rem', color: '#0A0A0A' }}>Temp <strong>{patientData.vitals.temp}°F</strong></span>
                  <span style={{ fontSize: '0.8125rem', color: '#0A0A0A' }}>SpO2 <strong>{patientData.vitals.spo2}%</strong></span>
                  <span style={{ fontSize: '0.8125rem', color: '#0A0A0A' }}>Wt <strong>{patientData.vitals.weight}</strong> lbs</span>
                  <span style={{ fontSize: '0.8125rem', color: '#0A0A0A' }}>BMI <strong>{patientData.vitals.bmi}</strong></span>
                  <span style={{ fontSize: '0.6875rem', color: '#A3A3A3', marginLeft: 'auto' }}>{patientData.vitals.date}</span>
                </div>
              )}

              {/* Two Column Layout - Compact */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {/* Diagnoses - Compact list */}
                <div>
                  <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.6875rem', fontWeight: '600', color: '#A3A3A3', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Active Problems
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    {(patientData.diagnoses || []).map((d, i) => (
                      <div key={i} style={{ 
                        padding: '0.5rem 0.625rem', 
                        background: '#FAFAFA', 
                        borderRadius: '4px',
                      display: 'flex',
                      justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <span style={{ fontSize: '0.8125rem', color: '#0A0A0A' }}>{d.name}</span>
                        <span style={{ fontSize: '0.6875rem', color: '#A3A3A3', fontFamily: 'monospace' }}>{d.code}</span>
                        </div>
                      ))}
                    </div>
                </div>

                {/* Medications - Compact list */}
                <div>
                  <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.6875rem', fontWeight: '600', color: '#A3A3A3', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Medications
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    {(patientData.medications || []).map((m, i) => (
                      <div key={i} style={{ 
                        padding: '0.5rem 0.625rem', 
                        background: '#FAFAFA', 
                        borderRadius: '4px'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.8125rem', fontWeight: '500', color: '#0A0A0A' }}>{m.name}</span>
                          <span style={{ fontSize: '0.625rem', color: '#A3A3A3' }}>Refills: {m.refills}</span>
                        </div>
                        <div style={{ fontSize: '0.6875rem', color: '#525252', marginTop: '0.125rem' }}>{m.sig}</div>
                      </div>
                    ))}
                    {(!patientData.medications || patientData.medications.length === 0) && (
                      <p style={{ fontSize: '0.8125rem', color: '#A3A3A3', margin: 0 }}>No active medications</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Labs */}
              {patientData.labs && patientData.labs.length > 0 && (
                <div>
                  <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.75rem', fontWeight: '600', color: '#0A0A0A', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Recent Lab Results
                  </h4>
                  <div style={{ background: '#FAFAFA', borderRadius: '8px', overflow: 'hidden' }}>
                    <table style={{ width: '100%', fontSize: '0.8125rem', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                          <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: '500', color: '#A3A3A3', fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Test</th>
                          <th style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: '500', color: '#A3A3A3', fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Result</th>
                          <th style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: '500', color: '#A3A3A3', fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Reference</th>
                          <th style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: '500', color: '#A3A3A3', fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {patientData.labs.map((lab, i) => (
                          <tr key={i} style={{ borderBottom: i < patientData.labs.length - 1 ? '1px solid rgba(0,0,0,0.04)' : 'none' }}>
                            <td style={{ padding: '0.625rem 1rem', color: '#0A0A0A' }}>{lab.name}</td>
                            <td style={{ padding: '0.625rem 1rem', textAlign: 'right', fontWeight: '600', color: lab.flag === 'H' ? '#DC2626' : lab.flag === 'L' ? '#2563EB' : '#0A0A0A' }}>
                              {lab.value} <span style={{ fontWeight: '400', color: '#A3A3A3' }}>{lab.unit}</span>
                            </td>
                            <td style={{ padding: '0.625rem 1rem', textAlign: 'right', color: '#A3A3A3' }}>{lab.range}</td>
                            <td style={{ padding: '0.625rem 1rem', textAlign: 'right', color: '#A3A3A3' }}>{lab.date}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Screenings */}
              {patientData.screenings && patientData.screenings.length > 0 && (
                <div>
                  <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.75rem', fontWeight: '600', color: '#0A0A0A', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Screenings
                  </h4>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    {patientData.screenings.map((s, i) => (
                      <div key={i} style={{ flex: 1, padding: '1rem', background: '#FAFAFA', borderRadius: '8px', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.6875rem', color: '#A3A3A3', marginBottom: '0.25rem' }}>{s.name}</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0A0A0A' }}>{s.score}</div>
                        <div style={{ fontSize: '0.6875rem', color: '#525252' }}>{s.interpretation}</div>
                        </div>
                      ))}
                    </div>
                </div>
              )}

              {/* Imaging */}
              {patientData.imaging && patientData.imaging.length > 0 && (
                <div>
                  <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.75rem', fontWeight: '600', color: '#0A0A0A', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Imaging
                  </h4>
                  {patientData.imaging.map((img, i) => (
                    <div key={i} style={{ padding: '0.75rem 1rem', background: '#FAFAFA', borderRadius: '6px', marginBottom: '0.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
                        <span style={{ fontSize: '0.8125rem', fontWeight: '500', color: '#0A0A0A' }}>{img.name}</span>
                        <span style={{ fontSize: '0.6875rem', color: '#A3A3A3' }}>{img.date}</span>
                      </div>
                      <div style={{ fontSize: '0.8125rem', color: '#525252', lineHeight: '1.5' }}>{img.result}</div>
                    </div>
                  ))}
                </div>
              )}

            </div>
          ) : (
            <div style={{
              padding: '2rem',
              textAlign: 'center',
              background: '#F9FAFB',
                      borderRadius: '8px',
              border: '1px dashed rgba(0, 0, 0, 0.08)'
            }}>
              <FiDatabase size={28} color="#A3A3A3" style={{ opacity: 0.5 }} />
              <p style={{ fontSize: '0.875rem', color: '#525252', margin: '0.75rem 0 0.25rem 0', fontWeight: '500' }}>
                No patient data synced
              </p>
              <p style={{ fontSize: '0.8125rem', color: '#A3A3A3', margin: 0 }}>
                Click "Sync Data" to load patient health information
              </p>
                    </div>
                  )}
                </div>
            </div>

        {/* Section 2: Medical Files (Upload + List combined) */}
            <div style={{
          background: '#FFFFFF',
              borderRadius: '12px',
          padding: '1.5rem',
          border: '1px solid rgba(0, 0, 0, 0.06)',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
          marginBottom: '1.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: '600', color: '#0A0A0A', margin: 0, letterSpacing: '-0.02em' }}>
              Medical Files ({files.length})
            </h2>
            <label
              htmlFor="file-upload"
              style={{
                padding: '0.5rem 1rem',
                background: '#0A0A0A',
                color: 'white',
                borderRadius: '8px',
                fontSize: '0.8125rem',
                fontWeight: '500',
                cursor: uploading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
                gap: '0.375rem',
                transition: 'opacity 0.15s ease-out',
                opacity: uploading ? 0.6 : 1
              }}
            >
              <FiUpload size={14} />
              {uploading ? 'Uploading...' : 'Upload File'}
            </label>
            <input 
              id="file-upload" 
              type="file" 
              onChange={handleFileUpload} 
              style={{ display: 'none' }} 
              disabled={uploading}
              accept="image/*,.pdf,.doc,.docx,.txt"
            />
            </div>
            
            {files.length === 0 ? (
              <div style={{
                padding: '3rem 2rem',
                textAlign: 'center',
              background: '#F9FAFB',
              borderRadius: '8px',
              border: '1px dashed rgba(0, 0, 0, 0.08)'
            }}>
              <FiFileText size={32} color="#A3A3A3" style={{ opacity: 0.5 }} />
              <p style={{ fontSize: '0.875rem', color: '#525252', margin: '0.75rem 0 0.25rem 0', fontWeight: '500' }}>
                No files uploaded yet
              </p>
              <p style={{ fontSize: '0.8125rem', color: '#A3A3A3', margin: 0 }}>
                Upload medical documents, lab results, or images
              </p>
              </div>
            ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
                {files.map((file, index) => (
                <div 
                  key={index} 
                  style={{
                    background: '#F9FAFB',
                    borderRadius: '8px',
                    border: '1px solid rgba(0, 0, 0, 0.04)',
                    overflow: 'hidden',
                    transition: 'all 0.15s ease-out',
                    cursor: 'pointer'
                  }}
                  onClick={() => setPreviewFile(file)}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.12)'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.04)'}
                >
                  {/* Preview */}
                  <div style={{ 
                    height: '100px', 
                    background: '#E5E5E5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden'
                  }}>
                    {isImage(file.file_name) && file.file_url?.startsWith('data:') ? (
                      <img 
                        src={file.file_url} 
                        alt={file.file_name} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                      />
                    ) : isImage(file.file_name) ? (
                      <FiImage size={28} color="#A3A3A3" />
                    ) : (
                      <FiFile size={28} color="#A3A3A3" />
                    )}
                  </div>
                  
                  {/* File info */}
                  <div style={{ padding: '0.75rem' }}>
                    <p style={{ 
                      fontWeight: '500', 
                      fontSize: '0.8125rem', 
                      color: '#0A0A0A',
                      margin: 0,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {file.file_name}
                    </p>
                    <p style={{ fontSize: '0.6875rem', color: '#A3A3A3', margin: '0.25rem 0 0 0' }}>
                      {new Date(file.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  
                  {/* Actions */}
                  <div style={{ 
                    padding: '0 0.75rem 0.75rem',
                    display: 'flex',
                    gap: '0.5rem'
                  }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); setPreviewFile(file) }}
                        style={{
                        flex: 1,
                        padding: '0.375rem',
                        background: '#0A0A0A',
                          color: 'white',
                          border: 'none',
                        borderRadius: '4px',
                        fontSize: '0.6875rem',
                        fontWeight: '500',
                          cursor: 'pointer',
                        fontFamily: 'inherit'
                        }}
                      >
                        View
                    </button>
                      <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteFile(file.id, file.file_name) }}
                        style={{
                        padding: '0.375rem 0.5rem',
                        background: 'transparent',
                        color: '#EF4444',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: '4px',
                        fontSize: '0.6875rem',
                          cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        fontFamily: 'inherit'
                        }}
                      >
                      <FiTrash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        {/* Section 3: Video Generation */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '12px',
          padding: '1.5rem',
          border: '1px solid rgba(0, 0, 0, 0.06)',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: '600', color: '#0A0A0A', margin: 0, letterSpacing: '-0.02em' }}>
              Diagnosis Video
            </h2>
            <button 
              onClick={handleGenerateVideo}
              disabled={generating}
              style={{
                padding: '0.625rem 1rem',
                background: '#0A0A0A',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: generating ? 'not-allowed' : 'pointer',
                transition: 'opacity 0.15s ease-out',
                fontFamily: 'inherit',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                opacity: generating ? 0.6 : 1
              }}
              onMouseEnter={(e) => { if (!generating) e.currentTarget.style.opacity = '0.85' }}
              onMouseLeave={(e) => { if (!generating) e.currentTarget.style.opacity = '1' }}
            >
              <FiVideo size={16} />
              {generating ? 'Generating...' : 'Generate Video'}
            </button>
        </div>

          <div style={{
            background: '#F9FAFB',
            borderRadius: '8px',
            border: '1px solid rgba(0, 0, 0, 0.04)',
            overflow: 'hidden'
          }}>
            {videoUrl ? (
              <video 
                controls 
                style={{ width: '100%', display: 'block', maxHeight: '500px' }}
                src={videoUrl}
              />
            ) : (
              <div style={{
                padding: '4rem',
                textAlign: 'center'
              }}>
                <FiVideo size={40} color="#A3A3A3" style={{ opacity: 0.4 }} />
                <p style={{ fontSize: '0.95rem', color: '#A3A3A3', margin: '1rem 0 0.25rem 0' }}>
                  No video generated yet
                </p>
                <p style={{ fontSize: '0.8125rem', color: '#D4D4D4', margin: 0 }}>
                  Click "Generate Video" to create a personalized diagnosis video
                </p>
      </div>
            )}
          </div>
        </div>
      </main>

      {/* File Preview Modal */}
      {previewFile && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            padding: '2rem'
          }}
          onClick={() => setPreviewFile(null)}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '12px',
              maxWidth: '90vw',
              maxHeight: '90vh',
              overflow: 'auto',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ 
              padding: '1rem 1.5rem', 
              borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              position: 'sticky',
              top: 0,
              background: 'white'
            }}>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '600', color: '#0A0A0A' }}>
                {previewFile.file_name}
            </h3>
              <button
                onClick={() => setPreviewFile(null)}
                style={{
                  padding: '0.375rem',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#525252'
                }}
              >
                <FiX size={20} />
              </button>
            </div>

            <div style={{ padding: '1.5rem' }}>
              {isImage(previewFile.file_name) ? (
                <img 
                  src={previewFile.file_url} 
                  alt={previewFile.file_name} 
                  style={{ maxWidth: '100%', maxHeight: '70vh', display: 'block', margin: '0 auto' }} 
                />
              ) : previewFile.file_url?.startsWith('data:application/pdf') ? (
                <iframe
                  src={previewFile.file_url}
                  style={{ width: '100%', height: '70vh', border: 'none' }}
                  title={previewFile.file_name}
                />
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                  <FiFile size={48} color="#A3A3A3" />
                  <p style={{ margin: '1rem 0', color: '#525252' }}>
                    Preview not available for this file type
                  </p>
                  <a
                    href={previewFile.file_url}
                    download={previewFile.file_name}
                      style={{
                      padding: '0.5rem 1rem',
                      background: '#0A0A0A',
                      color: 'white',
                        borderRadius: '8px',
                      textDecoration: 'none',
                      fontSize: '0.875rem',
                      fontWeight: '500'
                    }}
                  >
                    Download File
                  </a>
              </div>
            )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  )
}

export default PatientFilesPage
