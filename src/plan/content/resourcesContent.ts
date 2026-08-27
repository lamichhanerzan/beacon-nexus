export interface ResourceEntry {
  name: string;
  whatItDoes: string;
  whoQualifies: string;
  howToStart: string;
  source: string;
  verified: boolean;
  forInsurance?: string[];
  forTransport?: string[];
}

export const RESOURCE_DIRECTORY: ResourceEntry[] = [
  {
    name: 'Cancer Financial Assistance Coalition (CFAC)',
    whatItDoes: 'Searchable database of financial assistance programs covering copays, transportation, housing, childcare, and more.',
    whoQualifies: 'Anyone with a cancer diagnosis.',
    howToStart: 'Search at cancerfac.org by the type of help you need.',
    source: 'cancerfac.org',
    verified: true,
  },
  {
    name: 'PAN Foundation',
    whatItDoes: 'Copay assistance for underinsured patients. Covers cost-sharing for specific disease funds.',
    whoQualifies: 'Insured patients with qualifying diagnoses and financial need. Funds open and close as funding cycles refill.',
    howToStart: 'Search by diagnosis at panfoundation.org. If your fund is closed, request reopening notification.',
    source: 'panfoundation.org',
    verified: true,
  },
  {
    name: 'HealthWell Foundation',
    whatItDoes: 'Copay and premium assistance for specific disease categories.',
    whoQualifies: 'Insured patients with qualifying diagnoses.',
    howToStart: 'Apply at healthwellfoundation.org.',
    source: 'healthwellfoundation.org',
    verified: true,
  },
  {
    name: 'Patient Advocate Foundation Co-Pay Relief',
    whatItDoes: 'Direct financial assistance for copays, helping patients afford prescribed treatments.',
    whoQualifies: 'Insured patients who meet financial and diagnosis criteria.',
    howToStart: 'Apply at copays.org or call 1-866-512-3861.',
    source: 'copays.org',
    verified: true,
  },
  {
    name: 'CancerCare',
    whatItDoes: 'Financial grants covering transportation, childcare, and home care. Also provides counseling and support groups.',
    whoQualifies: 'Cancer patients and caregivers. Grants available for specific cancer types.',
    howToStart: 'Apply at cancercare.org or call 1-800-813-HOPE.',
    source: 'cancercare.org',
    verified: true,
  },
  {
    name: 'Leukemia & Lymphoma Society',
    whatItDoes: 'Copay assistance, travel aid, and financial support specifically for blood cancer patients.',
    whoQualifies: 'Patients with blood cancers (leukemia, lymphoma, myeloma).',
    howToStart: 'Apply at lls.org or call 1-800-955-4572.',
    source: 'lls.org',
    verified: true,
  },
  {
    name: 'American Cancer Society Hope Lodge',
    whatItDoes: 'Free lodging near treatment centers for cancer patients and their caregivers.',
    whoQualifies: 'Cancer patients traveling for treatment.',
    howToStart: 'Search at cancer.org/hopelodge or call 1-800-227-2345.',
    source: 'cancer.org',
    verified: true,
    forTransport: ['none_reliable', 'transit_rideshare'],
  },
  {
    name: 'Patient Advocate Foundation',
    whatItDoes: 'Case management, insurance appeals assistance, and financial aid including transportation grants.',
    whoQualifies: 'Any cancer patient facing financial or insurance barriers.',
    howToStart: 'Call 1-800-532-5274 or apply online at patientadvocate.org.',
    source: 'patientadvocate.org',
    verified: true,
  },
  {
    name: 'NeedyMeds',
    whatItDoes: 'Database of patient assistance programs, discount drug cards, and clinic directories.',
    whoQualifies: 'Anyone needing help with medication costs.',
    howToStart: 'Search at needymeds.org.',
    source: 'needymeds.org',
    verified: true,
  },
  {
    name: 'Angel Flight',
    whatItDoes: 'Free air travel to cancer treatment centers for patients who cannot afford or are unable to fly commercially.',
    whoQualifies: 'Cancer patients needing air travel for treatment.',
    howToStart: 'Request a flight at angelflight.com or the regional Angel Flight office.',
    source: 'angelflight.com',
    verified: true,
    forTransport: ['none_reliable'],
  },
  {
    name: 'Social Security Disability Insurance (SSDI)',
    whatItDoes: 'Monthly disability payments for people unable to work. Compassionate Allowances fast-track for certain cancers.',
    whoQualifies: 'Workers with sufficient work history who are unable to perform substantial gainful activity.',
    howToStart: 'Apply at ssa.gov or call 1-800-772-1213. Expect ~6 month wait.',
    source: 'ssa.gov',
    verified: true,
  },
];
