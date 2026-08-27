export interface AppointmentQuestion {
  text: string;
  why: string; // clinical rationale — WHY this question matters
  source: 'NCI' | 'ASCO' | 'ACS' | 'NCCN';
}

export interface AppointmentType {
  id: string;
  label: string;
  whatThisIs: string;       // 2-3 sentences, plain language
  whatHappens: string[];    // the actual sequence of the visit
  whatItTellsYou: string;   // what information comes out of it
  typicalLength: string;    // e.g. "30 to 60 minutes"
  bringWith: string[];      // what to physically bring
  questions: AppointmentQuestion[];
  afterward: string;        // what to confirm before leaving
  caregiverNotes: string[]; // third person, about the patient
}

export const APPOINTMENT_TYPES: AppointmentType[] = [
  // 1. Primary Care Visit
  {
    id: 'primary_care',
    label: 'Primary Care Visit',
    whatThisIs: 'A consultation with your primary physician or practitioner to discuss an abnormal screening result, suspicious physical finding, or new symptoms. This visit serves as the initial evaluation point to initiate specialist referrals and order required diagnostic imaging.',
    whatHappens: [
      'Review of your overall medical history, symptoms, and recent test results',
      'Physical examination focused on your specific concern or finding',
      'Discussion of initial diagnostic tests or specialized referrals needed',
      'Submitting formal referral orders to specialists or imaging centers'
    ],
    whatItTellsYou: 'An initial medical assessment of your situation and a concrete referral plan to specialists or diagnostic imaging centers.',
    typicalLength: '20 to 40 minutes',
    bringWith: [
      'Photo ID and health insurance cards',
      'Any recent diagnostic reports, lab sheets, or imaging CDs you possess',
      'List of all current medications, vitamins, and supplements',
      'Written notes on when your symptoms or findings were first noticed'
    ],
    questions: [
      {
        text: 'What specific specialist or facility are you referring me to, and why?',
        why: 'Knowing the exact referral target lets you verify in-network coverage and track the referral status yourself if delays happen.',
        source: 'NCI'
      },
      {
        text: 'What is the expected timeframe for the referral center to contact me?',
        why: 'Establishes a baseline timeline so you know exactly when a wait has run unusually long and requires a follow-up call.',
        source: 'ASCO'
      },
      {
        text: 'Should I obtain copies of my lab results and imaging records to carry myself?',
        why: 'Having your own physical records prevents administrative delays when transferring between different health systems.',
        source: 'ACS'
      },
      {
        text: 'Are there any physical symptoms or warning signs that should prompt an immediate call back?',
        why: 'Clear red-flag boundaries keep you safe while waiting for specialist appointments.',
        source: 'NCCN'
      },
      {
        text: 'Who in your office handles referral tracking if I haven\'t heard back in a week?',
        why: 'Direct contact names save hours of generic receptionist phone trees when following up on referrals.',
        source: 'ASCO'
      },
      {
        text: 'Does this referral require prior authorization from my insurance company?',
        why: 'Prior authorization is a common cause of diagnostic delays; knowing early lets you call your insurer proactively.',
        source: 'ACS'
      }
    ],
    afterward: 'Confirm that referral orders have been submitted and obtain the direct phone number for the referral coordinator.',
    caregiverNotes: [
      'Help gather past medical records and medication lists before the visit',
      'Take written notes during the referral discussion',
      'Ask for the name and direct phone number of the referral coordinator'
    ]
  },

  // 2. Diagnostic Imaging Appointment
  {
    id: 'diagnostic_imaging',
    label: 'Imaging Appointment (Mammogram, Ultrasound, CT, MRI)',
    whatThisIs: 'A specialized radiologic scan to visualize internal tissue, evaluate suspicious areas, or gather detailed anatomical measurements. It provides key visual information required before a biopsy or specialist consult.',
    whatHappens: [
      'Check-in and completion of safety screening questionnaires',
      'Changing into a medical gown if required for the specific body area',
      'Positioning on the scanner table or mammography equipment',
      'Image acquisition by the radiology technologist',
      'Verification of image clarity before you leave the facility'
    ],
    whatItTellsYou: 'Detailed radiologic views and standardized scoring (such as BI-RADS or lesion descriptions) that determine if a biopsy or follow-up scan is needed.',
    typicalLength: '30 to 90 minutes',
    bringWith: [
      'Photo ID and insurance card',
      'Prior imaging CDs or film records from other facilities for comparison',
      'Written imaging order or requisition form from your doctor',
      'Comfortable clothing without metal snaps, zippers, or underwires'
    ],
    questions: [
      {
        text: 'How soon will the radiologist review these images and issue a written report?',
        why: 'Knowing the reading timeframe prevents unnecessary anxiety and sets a clear target date for checking results.',
        source: 'NCI'
      },
      {
        text: 'Will this imaging report be available on my patient portal, or sent directly to my doctor?',
        why: 'Ensures you know where to check for the report first so you aren\'t waiting on a phone call that may lag.',
        source: 'ASCO'
      },
      {
        text: 'Does this scan require comparison with my prior mammograms or scans from other facilities?',
        why: 'Radiologists compare new scans to older ones to spot subtle changes; missing priors can delay a definitive interpretation.',
        source: 'ACS'
      },
      {
        text: 'If the radiologist spots something ambiguous, do you perform additional views today?',
        why: 'Some centers do diagnostic workups in one session, while others require a separate callback appointment.',
        source: 'NCCN'
      },
      {
        text: 'Can I request a copy of the images on a CD before I leave today?',
        why: 'Carrying your own image CD to your next specialist appointment eliminates weeks of inter-hospital record transfer delays.',
        source: 'ASCO'
      },
      {
        text: 'What is the specific severity scale or code used for this type of imaging report?',
        why: 'Standardized scoring codes give objective clarity on whether findings are benign, indeterminate, or require biopsy.',
        source: 'NCI'
      }
    ],
    afterward: 'Confirm the exact date results will be sent to your doctor and request an image CD if transferring centers.',
    caregiverNotes: [
      'Wait comfortably in the waiting area while imaging is completed',
      'Ensure previous imaging CDs are handed to the technologist upon arrival',
      'Remind the patient to request an image copy CD before leaving'
    ]
  },

  // 3. Biopsy Procedure
  {
    id: 'biopsy',
    label: 'Biopsy Procedure',
    whatThisIs: 'A clinical procedure to collect a small tissue or cell sample from a suspicious area for microscopic pathology analysis. It is the definitive way to determine whether tissue is benign or cancerous.',
    whatHappens: [
      'Procedure explanation and signing informed consent forms',
      'Administration of local anesthesia or mild sedation for comfort',
      'Image-guided or direct collection of the tissue sample',
      'Application of pressure and wound dressing to prevent bleeding',
      'Brief recovery observation and post-procedure care review'
    ],
    whatItTellsYou: 'Definitive cellular pathology diagnosis — identifying whether cells are benign, pre-cancerous, or malignant.',
    typicalLength: '1 to 2 hours total',
    bringWith: [
      'Photo ID and insurance cards',
      'A driver or support person if sedation is administered',
      'Loose, comfortable clothing that opens easily',
      'List of blood thinners or medications reviewed before the procedure'
    ],
    questions: [
      {
        text: 'How many working days does pathology typically take to process this sample?',
        why: 'Pathology processing requires fixing, slicing, staining, and expert review. Knowing the timeline sets realistic expectations.',
        source: 'NCI'
      },
      {
        text: 'What specific pathology lab will be processing my tissue specimen?',
        why: 'Knowing the lab name helps if your insurance requires in-network pathology or if secondary opinions are requested.',
        source: 'ASCO'
      },
      {
        text: 'What signs of bleeding, infection, or pain should prompt an urgent call?',
        why: 'Distinguishes normal post-biopsy soreness from rare procedural complications requiring clinical attention.',
        source: 'NCCN'
      },
      {
        text: 'Are there any physical activity or lifting restrictions while the site heals?',
        why: 'Prevents accidental bleeding or hematoma formation at the biopsy site during the initial recovery window.',
        source: 'ACS'
      },
      {
        text: 'If the initial pathology result is indeterminate, what is the protocol for secondary review?',
        why: 'Complex tissue sometimes requires specialized biomarker staining; knowing this prevents alarm if results take longer.',
        source: 'ASCO'
      },
      {
        text: 'How will the results be delivered to me — in person, by phone, or via portal?',
        why: 'Ensures you aren\'t left waiting by the phone if your clinic requires an in-person appointment to discuss findings.',
        source: 'NCI'
      }
    ],
    afterward: 'Obtain written wound-care instructions and confirm the date and method for receiving pathology results.',
    caregiverNotes: [
      'Drive the patient home safely if sedation or local anesthesia was administered',
      'Help manage ice packs and wound dressings as instructed',
      'Record the pathology lab name and expected report delivery date'
    ]
  },

  // 4. Results Appointment
  {
    id: 'results',
    label: 'Results Appointment',
    whatThisIs: 'A critical meeting with your clinician to review biopsy pathology reports or imaging findings, understand what the microscopic results mean, and discuss next steps.',
    whatHappens: [
      'Review of the official pathology or diagnostic report',
      'Explanation of microscopic cell types, grade, and characteristics in plain terms',
      'Discussion of whether additional staging scans or specialist consults are needed',
      'Answering your questions and establishing an immediate action plan'
    ],
    whatItTellsYou: 'Your definitive diagnosis, cell characteristics, grade, receptor status (if applicable), and clear next steps.',
    typicalLength: '30 to 60 minutes',
    bringWith: [
      'A family member, caregiver, or trusted friend',
      'Notepad and pen for writing down key terms',
      'List of prioritized questions',
      'Audio recording device or app (ask permission first)'
    ],
    questions: [
      {
        text: 'Can I have a printed copy of the complete pathology report to keep?',
        why: 'Your pathology report is the master blueprint for all future care. Having your own copy empowers you across consultations.',
        source: 'NCI'
      },
      {
        text: 'In plain language, what exact cell types or tissue changes were found?',
        why: 'Clinical terms can sound overwhelming; asking for plain language ensures clear understanding of the core diagnosis.',
        source: 'ASCO'
      },
      {
        text: 'Are additional biomarker tests or genomic profiles being run on this specimen?',
        why: 'Modern oncology uses molecular markers (like ER/PR/HER2 or genomic risk scores) which take extra days to complete.',
        source: 'NCCN'
      },
      {
        text: 'What additional staging scans or specialist consults are needed before planning treatment?',
        why: 'Prevents rushing into decisions before the full picture (staging, organ function, specialist input) is complete.',
        source: 'ACS'
      },
      {
        text: 'Is my case scheduled for review by a multidisciplinary Tumor Board?',
        why: 'Tumor board reviews bring surgeons, oncologists, radiologists, and pathologists together for collective expert consensus.',
        source: 'ASCO'
      },
      {
        text: 'What is the realistic timeline for my next consultation or staging appointment?',
        why: 'Maintains clarity during the high-anxiety transition between diagnostic results and treatment planning.',
        source: 'NCI'
      }
    ],
    afterward: 'Request a physical copy of the complete pathology report before leaving the office.',
    caregiverNotes: [
      'Be the dedicated note-taker so the patient can focus entirely on listening',
      'Ensure a printed copy of the pathology report is in hand before leaving',
      'Help review notes immediately after the appointment while details are fresh'
    ]
  },

  // 5. Medical Oncology Consultation
  {
    id: 'medical_onc',
    label: 'Medical Oncology Consultation',
    whatThisIs: 'A comprehensive consultation with a medical oncologist to evaluate systemic treatment options, such as chemotherapy, immunotherapy, targeted therapy, or hormone therapy.',
    whatHappens: [
      'Review of full medical history, pathology reports, and staging scans',
      'Physical examination and general health assessment',
      'Detailed discussion of systemic treatment options, evidence, and schedules',
      'Review of supportive medications to manage potential side effects',
      'Discussion of clinical trial eligibility and decision points'
    ],
    whatItTellsYou: 'Recommended systemic treatment regimens, treatment goals, session schedules, expected benefits, and side-effect management plans.',
    typicalLength: '45 to 90 minutes',
    bringWith: [
      'Complete pathology report and imaging CDs',
      'List of current medications, supplements, and allergies',
      'Prioritized list of questions',
      'A support person for note-taking'
    ],
    questions: [
      {
        text: 'What is the primary goal of this treatment — cure, control, or comfort?',
        why: 'These are genuinely different goals, and treatments that make sense for one may not make sense for another. Asking directly makes sure you and your team are working toward the same thing.',
        source: 'ASCO'
      },
      {
        text: 'What is the specific name and evidence behind the treatment regimen you recommend?',
        why: 'Knowing the precise regimen name allows you to read official NCI/ASCO patient materials and understand expected schedules.',
        source: 'NCI'
      },
      {
        text: 'What are the most common side effects, and how will we prevent or manage them?',
        why: 'Proactive supportive care (like anti-nausea medication) works best when planned before treatment begins.',
        source: 'NCCN'
      },
      {
        text: 'Are there any clinical trials available at this center or nearby that fit my profile?',
        why: 'Clinical trials often offer access to advanced therapies; asking early ensures all options are considered before starting standard care.',
        source: 'ACS'
      },
      {
        text: 'How will this treatment affect my daily life, work ability, and long-term health?',
        why: 'Helps you organize family support, work leave, and home assistance ahead of time.',
        source: 'ASCO'
      },
      {
        text: 'Who do I call if I experience a fever or side effect after clinic hours?',
        why: '24/7 oncology triage contact info is essential for safe side-effect management at home.',
        source: 'NCCN'
      }
    ],
    afterward: 'Confirm 24/7 emergency triage phone numbers and obtain written regimen summaries.',
    caregiverNotes: [
      'Write down the specific regimen name and cycle schedule',
      'Note the direct 24/7 phone number for after-hours oncology triage',
      'Help organize a home side-effect management kit (thermometer, medications)'
    ]
  },

  // 6. Surgical Oncology Consultation
  {
    id: 'surgical_onc',
    label: 'Surgical Oncology Consultation',
    whatThisIs: 'A consultation with a surgical oncologist to evaluate surgical options, tissue removal goals, lymph node evaluation, and potential reconstruction strategies.',
    whatHappens: [
      'Surgical history review and physical examination',
      'Discussion of surgical approaches (e.g., localized vs. broader removal)',
      'Review of lymph node evaluation procedures',
      'Discussion of surgical recovery time, hospital stay, and potential risks',
      'Coordinating surgical timing with other planned treatments'
    ],
    whatItTellsYou: 'Surgical candidacy, recommended surgical techniques, expected recovery timeline, and reconstruction timing.',
    typicalLength: '45 to 75 minutes',
    bringWith: [
      'Pathology reports and diagnostic imaging CDs',
      'List of past surgeries and medical conditions',
      'List of current blood thinners or supplements',
      'Questions regarding surgical choices and recovery'
    ],
    questions: [
      {
        text: 'What are all the surgical options available for my situation, and pros/cons of each?',
        why: 'Different surgical approaches have distinct recovery times, cosmetic outcomes, and re-excision risks; understanding options empowers decision-making.',
        source: 'ASCO'
      },
      {
        text: 'Will lymph node sampling or biopsy be performed during the surgery?',
        why: 'Lymph node evaluation is essential for accurate staging, and knowing in advance prepares you for potential post-op care.',
        source: 'NCCN'
      },
      {
        text: 'What is your typical volume for this specific surgical procedure each year?',
        why: 'Surgical volume and experience strongly correlate with surgical precision and lower complication rates.',
        source: 'NCI'
      },
      {
        text: 'How does the timing of surgery fit with other treatments like chemotherapy or radiation?',
        why: 'Oncology treatments follow coordinated sequences; understanding order prevents confusion between specialties.',
        source: 'ACS'
      },
      {
        text: 'What should I expect regarding post-surgical pain, drains, and recovery time at home?',
        why: 'Knowing recovery specifics allows you to set up a comfortable home environment and arrange caregiver assistance.',
        source: 'ASCO'
      },
      {
        text: 'Will a plastic surgeon be involved if reconstructive options are being considered?',
        why: 'Coordinating surgical removal with immediate or delayed reconstruction requires early joint planning.',
        source: 'NCCN'
      }
    ],
    afterward: 'Obtain pre-operative testing instructions and confirm surgical scheduling details.',
    caregiverNotes: [
      'Note pre-operative medication restriction guidelines',
      'Ask detailed questions about post-op home care, drains, and mobility limits',
      'Confirm who will be driving the patient home post-surgery'
    ]
  },

  // 7. Radiation Oncology Consultation
  {
    id: 'radiation_onc',
    label: 'Radiation Oncology Consultation',
    whatThisIs: 'A consultation with a radiation oncologist to discuss radiation therapy techniques, targeted beam schedules, and local control benefits.',
    whatHappens: [
      'Review of diagnostic scans, pathology reports, and surgical findings',
      'Physical examination and anatomical assessment',
      'Discussion of radiation techniques (e.g., external beam, IMRT, brachytherapy)',
      'Explanation of simulation scanning and field design',
      'Review of skin care and side effect management during treatment'
    ],
    whatItTellsYou: 'Radiation treatment plan, session count and frequency, mapping simulation timeline, and localized side-effect protocols.',
    typicalLength: '45 to 60 minutes',
    bringWith: [
      'Pathology and operative reports',
      'Imaging CDs (CT, MRI, PET)',
      'List of skin products or creams currently used',
      'Questions about daily schedule flexibility'
    ],
    questions: [
      {
        text: 'What is the goal of radiation therapy in my overall treatment plan?',
        why: 'Radiation may be given to eradicate microscopic residual cells, shrink tumors before surgery, or manage symptoms.',
        source: 'NCI'
      },
      {
        text: 'How many total sessions will I need, and how many weeks will treatment span?',
        why: 'Daily radiation requires significant daily logistics; knowing the exact schedule allows you to plan transportation and daily routines.',
        source: 'ASCO'
      },
      {
        text: 'What specific radiation technique will be used, and how do you protect healthy surrounding organs?',
        why: 'Modern techniques like DIBH or IMRT spare normal heart, lung, or bowel tissue, minimizing long-term risks.',
        source: 'NCCN'
      },
      {
        text: 'What skin changes or side effects should I expect, and what creams are safe to use?',
        why: 'Using unapproved lotions can interfere with radiation beams or worsen skin irritation; specific recommendations are vital.',
        source: 'ACS'
      },
      {
        text: 'What is a simulation appointment, and when will it take place?',
        why: 'Simulation is the planning scan where custom molds and tiny alignment marks are made before real treatments begin.',
        source: 'ASCO'
      },
      {
        text: 'Will radiation therapy cause fatigue, and can I continue working during treatment?',
        why: 'Fatigue often builds up over weeks; setting expectations helps you pace daily activities.',
        source: 'NCI'
      }
    ],
    afterward: 'Schedule your radiation simulation appointment and receive recommended skin care guidelines.',
    caregiverNotes: [
      'Confirm the daily appointment schedule and plan consistent transportation',
      'Review recommended skin care and bathing instructions',
      'Help track energy levels and manage fatigue throughout the treatment weeks'
    ]
  },

  // 8. Treatment Planning Visit
  {
    id: 'treatment_planning',
    label: 'Treatment Planning Visit',
    whatThisIs: 'A dedicated meeting with your care team to consolidate diagnostic results, review multidisciplinary recommendations, and finalize your master treatment roadmap.',
    whatHappens: [
      'Presentation of unified treatment recommendations from all specialists',
      'Review of treatment sequence (e.g. surgery first vs. systemic therapy first)',
      'Detailed discussion of start dates, logistics, and supportive care',
      'Signing consent forms and scheduling baseline lab or cardiac testing',
      'Introduction to your nurse navigator or care coordinator'
    ],
    whatItTellsYou: 'Your complete, step-by-step master treatment sequence, start dates, and primary point-of-contact details.',
    typicalLength: '45 to 90 minutes',
    bringWith: [
      'Notepad and binder for organizing treatment documents',
      'List of all healthcare team members',
      'Calendar for scheduling appointments',
      'Support person for note-taking'
    ],
    questions: [
      {
        text: 'What is the recommended sequence of my treatments, and why is this order best for my situation?',
        why: 'Understanding why therapy precedes surgery (or vice versa) provides clarity on the clinical strategy.',
        source: 'ASCO'
      },
      {
        text: 'Who is my primary nurse navigator or coordinator, and how do I contact them between visits?',
        why: 'Having one clear contact person prevents getting lost in large healthcare system switchboards.',
        source: 'NCI'
      },
      {
        text: 'What baseline tests (e.g., cardiac echo, blood work, dental clearance) must be completed before treatment starts?',
        why: 'Completing baseline organ health checks prevents unexpected day-one treatment delays.',
        source: 'NCCN'
      },
      {
        text: 'What financial navigation or social work resources are available to help with medication costs or travel?',
        why: 'Financial navigators help manage co-pays, foundation grants, and transportation assistance before expenses pile up.',
        source: 'ACS'
      },
      {
        text: 'What adjustments should I make to my daily diet, exercise, or lifestyle during this treatment plan?',
        why: 'Empowers you to take safe, evidence-based actions that support physical endurance during therapy.',
        source: 'ASCO'
      },
      {
        text: 'What is the target date to start the first phase of treatment?',
        why: 'Establishes an anchor date so you can organize leave, child care, and family schedules.',
        source: 'NCI'
      }
    ],
    afterward: 'Obtain your written treatment roadmap and the direct contact info for your nurse navigator.',
    caregiverNotes: [
      'Store all scheduling contacts and navigator phone numbers in your phone',
      'Organize a physical master binder for treatment documents',
      'Help map out the upcoming calendar of baseline scans and treatment start dates'
    ]
  },

  // 9. Second Opinion Consultation
  {
    id: 'second_opinion',
    label: 'Second Opinion Consultation',
    whatThisIs: 'A consultation with an independent specialist at another medical center to review your diagnosis, pathology, and proposed treatment plan.',
    whatHappens: [
      'Independent review of all pathology slides, diagnostic scans, and records',
      'Discussion of agreement or alternative perspectives on diagnosis and staging',
      'Evaluation of alternative treatment regimens or available clinical trials',
      'Discussion of whether care can be delivered locally or requires specialized transfer'
    ],
    whatItTellsYou: 'Confirmation of diagnosis, validation of your proposed treatment plan, or alternative options to consider.',
    typicalLength: '45 to 60 minutes',
    bringWith: [
      'Complete medical record folder',
      'Original pathology slides and paraffin block (if requested)',
      'Diagnostic imaging CDs and reports',
      'Written copy of your original doctor\'s proposed plan'
    ],
    questions: [
      {
        text: 'Do you agree with the original diagnosis, staging, and pathology findings?',
        why: 'Validates whether the foundation of your diagnosis is universally agreed upon by independent experts.',
        source: 'NCI'
      },
      {
        text: 'Do you agree with the recommended treatment plan, or would you suggest a different approach?',
        why: 'Uncovers subtle differences in clinical philosophy or access to alternative therapies.',
        source: 'ASCO'
      },
      {
        text: 'If you recommend a different plan, what is the scientific evidence or clinical rationale supporting it?',
        why: 'Helps you objectively weigh choices between standard options and alternative recommendations.',
        source: 'NCCN'
      },
      {
        text: 'Are there clinical trials or specialized techniques available here that are not available at my local clinic?',
        why: 'Major academic centers often host specialized clinical trials or advanced technology.',
        source: 'ACS'
      },
      {
        text: 'Can this recommended treatment be coordinated with my local oncologist closer to home?',
        why: 'Allows you to benefit from major center expertise while receiving routine infusions or care near family.',
        source: 'ASCO'
      },
      {
        text: 'How should I communicate your findings back to my primary care team?',
        why: 'Ensures collaborative communication between physicians rather than awkward transitions.',
        source: 'NCI'
      }
    ],
    afterward: 'Request a written copy of the second opinion report to share with your primary team.',
    caregiverNotes: [
      'Ensure all original pathology and imaging CDs brought to the visit are returned to you',
      'Take notes on any differences between the first and second opinion',
      'Help organize a follow-up conversation with the primary care team'
    ]
  },

  // 10. Genetic Counseling
  {
    id: 'genetic_counseling',
    label: 'Genetic Counseling',
    whatThisIs: 'A consultation with a certified genetic counselor to evaluate personal and family health history, assess hereditary cancer risk patterns, and guide testing decisions.',
    whatHappens: [
      'Detailed family health history mapping (pedigree creation)',
      'Assessment of hereditary cancer risk patterns (e.g. BRCA, Lynch Syndrome)',
      'Explanation of genetic test options, benefits, limitations, and insurance coverage',
      'Saliva or blood sample collection if testing is selected',
      'Discussion of genetic privacy laws (GINA) and family communication strategies'
    ],
    whatItTellsYou: 'Personal hereditary cancer risk profile, genetic testing eligibility, specific gene mutation results (if tested), and family screening implications.',
    typicalLength: '45 to 60 minutes',
    bringWith: [
      'Detailed family cancer history (who had cancer, what type, age at diagnosis)',
      'Prior genetic testing reports of family members',
      'Insurance card',
      'List of questions about genetic risk'
    ],
    questions: [
      {
        text: 'Based on my family tree, what is the likelihood that a hereditary gene mutation is present?',
        why: 'Establishes whether genetic testing is strongly indicated or low probability before deciding to test.',
        source: 'NCI'
      },
      {
        text: 'What specific gene panel do you recommend testing, and what types of cancers does it cover?',
        why: 'Multi-gene panels test for many hereditary syndromes at once; understanding the scope clarifies what results can reveal.',
        source: 'ASCO'
      },
      {
        text: 'How does Genetic Information Nondiscrimination Act (GINA) protect my insurance and employment privacy?',
        why: 'Relieves privacy concerns by explaining federal protections regarding genetic data.',
        source: 'ACS'
      },
      {
        text: 'How might a positive genetic test result alter my current treatment or surgical decisions?',
        why: 'Genetic results (like BRCA mutations) directly influence surgical choices, such as prophylactic options.',
        source: 'NCCN'
      },
      {
        text: 'If a mutation is found, what does that mean for my children, siblings, or extended family?',
        why: 'Hereditary mutations can be passed down; understanding cascade testing helps protect family members.',
        source: 'ASCO'
      },
      {
        text: 'Does my health insurance cover genetic testing, and what out-of-pocket costs might I face?',
        why: 'Genetic counselors often check criteria so insurance pre-authorization avoids surprise bills.',
        source: 'NCI'
      }
    ],
    afterward: 'Confirm the turnaround time for genetic lab results (typically 2 to 4 weeks) and schedule follow-up.',
    caregiverNotes: [
      'Help gather accurate family medical histories (cancers, ages) before the appointment',
      'Take notes on GINA privacy rules and insurance authorization details',
      'Note the expected turnaround time for genetic test results'
    ]
  },

  // 11. Follow-up or Surveillance Visit
  {
    id: 'follow_up',
    label: 'Follow-up or Surveillance Visit',
    whatThisIs: 'A routine clinical visit after initial diagnostic workups or treatments to monitor health, review surveillance scans, and manage ongoing recovery.',
    whatHappens: [
      'Physical examination and clinical symptom review',
      'Review of routine surveillance blood work or imaging scans',
      'Evaluation of ongoing side effects or recovery progress',
      'Discussion of healthy survivorship and lifestyle guidance',
      'Setting the schedule for future routine checkups'
    ],
    whatItTellsYou: 'Current clinical status, surveillance scan results, long-term side-effect management, and ongoing monitoring schedule.',
    typicalLength: '20 to 30 minutes',
    bringWith: [
      'List of any new symptoms or physical changes',
      'List of current medications',
      'Questions about long-term recovery',
      'Surveillance scan reports if done at outside facility'
    ],
    questions: [
      {
        text: 'What specific surveillance scans or blood tests will be used to monitor my health, and how often?',
        why: 'Knowing your long-term monitoring schedule provides structure and peace of mind.',
        source: 'ASCO'
      },
      {
        text: 'Are the physical symptoms I am experiencing normal long-term recovery effects or cause for concern?',
        why: 'Helps distinguish expected healing signs from symptoms requiring evaluation.',
        source: 'NCI'
      },
      {
        text: 'What symptoms or signs should prompt me to call your office between scheduled follow-up visits?',
        why: 'Gives you clear guidelines so you don\'t hesitate to reach out if new concerns arise.',
        source: 'NCCN'
      },
      {
        text: 'Are there long-term side effects or late effects of my treatments that I should watch for?',
        why: 'Some treatments have late effects months or years later; knowing what to monitor supports long-term health.',
        source: 'ACS'
      },
      {
        text: 'Can you provide a written Survivorship Care Plan summarizing my diagnosis and follow-up care schedule?',
        why: 'A formal Survivorship Care Plan provides a master record for your primary care doctor and future providers.',
        source: 'ASCO'
      },
      {
        text: 'What lifestyle changes, diet, or exercise habits support optimal recovery and overall wellness?',
        why: 'Focuses on proactive, evidence-based lifestyle choices that enhance quality of life.',
        source: 'NCI'
      }
    ],
    afterward: 'Schedule your next surveillance appointment and obtain written summary of scan results.',
    caregiverNotes: [
      'Keep an ongoing journal of any symptoms or changes reported by the patient',
      'Help maintain the schedule of routine surveillance appointments',
      'Ensure the patient obtains a written Survivorship Care Plan for their records'
    ]
  }
];
