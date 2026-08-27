interface DiagnosisExplanation {
  title: string;
  text: string;
  practicalMeaning: string;
  source: string;
}

type DetailLevel = 'simple' | 'balanced' | 'full';

const STAGE_EXPLANATIONS: Record<string, Record<string, Record<DetailLevel, DiagnosisExplanation>>> = {
  breast: {
    '0': {
      simple: { title: 'Stage 0 breast cancer', text: 'The abnormal cells are only in the milk ducts or lobules. They have not spread into nearby breast tissue.', practicalMeaning: 'This is the earliest form, often found on a mammogram. Treatment is usually very effective.', source: 'NCCN Guidelines for Patients: Breast Cancer 2026' },
      balanced: { title: 'Stage 0 breast cancer (DCIS/LCIS)', text: 'Ductal carcinoma in situ means abnormal cells are in the lining of a milk duct but have not spread into surrounding breast tissue. Lobular carcinoma in situ is similar but in the lobules.', practicalMeaning: 'DCIS is typically treated with surgery (lumpectomy or mastectomy) and sometimes radiation. LCIS is often monitored rather than treated. Your oncologist will explain which applies.', source: 'NCCN Guidelines for Patients: Breast Cancer 2026' },
      full: { title: 'Stage 0 breast cancer (Tis, N0, M0)', text: 'Stage 0 encompasses ductal carcinoma in situ (DCIS) and lobular carcinoma in situ (LCIS). DCIS is classified as Tis — tumor in situ. There is no lymph node involvement (N0) and no distant metastasis (M0). LCIS is considered a risk factor rather than a true precancer by some guidelines.', practicalMeaning: 'DCIS treatment typically involves breast-conserving surgery with radiation, or mastectomy. Hormone receptor testing guides whether endocrine therapy is recommended. Recurrence rates after appropriate treatment are low.', source: 'AJCC Cancer Staging Manual, 8th Ed.; NCCN Guidelines v4.2026' },
    },
    'I': {
      simple: { title: 'Stage I breast cancer', text: 'The cancer is small and only in the breast tissue, or a tiny amount is in nearby lymph nodes.', practicalMeaning: 'Early-stage breast cancer. Treatment options usually include surgery and may include radiation, hormone therapy, or chemotherapy.', source: 'NCCN Guidelines for Patients: Breast Cancer 2026' },
      balanced: { title: 'Stage I breast cancer', text: 'The tumor is up to 2 centimeters and cancer has either not spread to lymph nodes (IA) or tiny amounts are found in lymph nodes (IB).', practicalMeaning: 'This is considered early-stage. Most people have surgery first, followed by radiation if breast-conserving surgery was chosen. Your care team will test the tumor to decide if chemotherapy or hormone therapy is needed.', source: 'NCCN Guidelines for Patients: Breast Cancer 2026' },
      full: { title: 'Stage I breast cancer (T1, N0-N1mi, M0)', text: 'Stage IA: Tumor ≤2cm (T1), no lymph node involvement (N0), no metastasis (M0). Stage IB: Tumor ≤2cm with micrometastases in 1–3 axillary lymph nodes (N1mi). Receptor status (ER, PR, HER2) and genomic assays (e.g., Oncotype DX) further guide treatment.', practicalMeaning: 'Surgery (lumpectomy + radiation or mastectomy), sentinel lymph node biopsy, and adjuvant therapy guided by receptor status and genomic risk scores. Five-year treatment response rates are high for this stage.', source: 'AJCC Cancer Staging Manual, 8th Ed.; NCCN Guidelines v4.2026' },
    },
    'II': {
      simple: { title: 'Stage II breast cancer', text: 'The cancer is in the breast and may have spread to a few nearby lymph nodes.', practicalMeaning: 'Still considered early-stage in many cases. Treatment usually includes surgery, and additional treatments based on your specific situation.', source: 'NCCN Guidelines for Patients: Breast Cancer 2026' },
      balanced: { title: 'Stage II breast cancer', text: 'Stage IIA or IIB. The tumor may be up to 5 centimeters, and cancer may have spread to 1–3 axillary lymph nodes. Or the tumor is larger than 5cm without lymph node spread.', practicalMeaning: 'Treatment planning typically involves imaging, possible neoadjuvant (before surgery) chemotherapy, surgery, radiation, and ongoing systemic therapy. Your oncologist will build a treatment plan based on your tumor characteristics.', source: 'NCCN Guidelines for Patients: Breast Cancer 2026' },
      full: { title: 'Stage II breast cancer (T0-T3, N0-N1, M0)', text: 'Stage IIA: T0-T1 with N1, or T2 with N0. Stage IIB: T2 with N1, or T3 with N0. No distant metastasis (M0). HER2 status, hormone receptor status, and Ki-67 index influence whether neoadjuvant chemotherapy is recommended.', practicalMeaning: 'Neoadjuvant chemotherapy may be recommended to shrink the tumor before surgery, particularly for HER2-positive or triple-negative subtypes. Pathologic complete response (pCR) after neoadjuvant therapy provides additional prognostic information.', source: 'AJCC Cancer Staging Manual, 8th Ed.; NCCN Guidelines v4.2026' },
    },
    'III': {
      simple: { title: 'Stage III breast cancer', text: 'The cancer has spread more extensively in the breast area or to many nearby lymph nodes, but not to distant parts of the body.', practicalMeaning: 'Locally advanced. Treatment typically involves multiple approaches working together.', source: 'NCCN Guidelines for Patients: Breast Cancer 2026' },
      balanced: { title: 'Stage III breast cancer', text: 'Locally advanced cancer. The tumor may be large, may involve chest wall or skin, or cancer has spread to many lymph nodes near the breast. It has not spread to distant organs.', practicalMeaning: 'Treatment usually starts with systemic therapy (chemotherapy and/or targeted therapy) to shrink the cancer, followed by surgery and radiation. This is a treatable stage with multiple options.', source: 'NCCN Guidelines for Patients: Breast Cancer 2026' },
      full: { title: 'Stage III breast cancer (T0-T4, N1-N3, M0)', text: 'Encompasses IIIA (T0-T3/N2 or T3/N1), IIIB (T4/any N), and IIIC (any T/N3). Includes inflammatory breast cancer (T4d). Neoadjuvant systemic therapy is standard of care. Response guides surgical planning and adjuvant therapy.', practicalMeaning: 'Multimodal treatment is standard: neoadjuvant systemic therapy, surgery, radiation, and ongoing adjuvant therapy. Clinical trial eligibility should be evaluated. Treatment plans are highly individualized at this stage.', source: 'AJCC Cancer Staging Manual, 8th Ed.; NCCN Guidelines v4.2026' },
    },
    'IV': {
      simple: { title: 'Stage IV breast cancer', text: 'The cancer has spread to other parts of the body, such as bones, liver, lungs, or brain.', practicalMeaning: 'Treatment focuses on controlling the cancer, managing symptoms, and maintaining quality of life. Many people live with stage IV breast cancer for years with treatment.', source: 'NCCN Guidelines for Patients: Breast Cancer 2026' },
      balanced: { title: 'Stage IV breast cancer (metastatic)', text: 'Cancer has spread beyond the breast and nearby lymph nodes to distant organs. Common sites include bone, liver, lungs, and brain. This is also called metastatic breast cancer.', practicalMeaning: 'Treatment is ongoing and aims to control the cancer. Options include systemic therapy (chemotherapy, targeted therapy, immunotherapy, hormone therapy) tailored to your specific tumor characteristics. Many people live with metastatic breast cancer for extended periods.', source: 'NCCN Guidelines for Patients: Breast Cancer 2026' },
      full: { title: 'Stage IV breast cancer (any T, any N, M1)', text: 'Distant metastasis confirmed (M1). Sites of metastasis, receptor status of metastatic lesion(s), and overall tumor burden guide therapy selection. De novo stage IV and recurrent metastatic disease may have different treatment approaches.', practicalMeaning: 'Treatment is tailored to molecular subtype and metastatic sites. CDK4/6 inhibitors for HR+/HER2-, anti-HER2 agents including ADCs for HER2+, immunotherapy for PD-L1+ TNBC. Clinical trials should be actively explored. Palliative care consultation is recommended alongside active treatment.', source: 'AJCC Cancer Staging Manual, 8th Ed.; NCCN Guidelines v4.2026' },
    },
  },
};

// Generic fallback for cancer types not in the detailed map
const GENERIC_STAGES: Record<string, Record<DetailLevel, DiagnosisExplanation>> = {
  '0': {
    simple: { title: 'Stage 0', text: 'Abnormal cells are present but have not spread into nearby tissue. This is sometimes called "in situ."', practicalMeaning: 'The earliest stage. Treatment is often very effective at this point.', source: 'AJCC Cancer Staging Manual, 8th Ed.' },
    balanced: { title: 'Stage 0 (in situ)', text: 'Abnormal cells are found in the place they first formed and have not spread to nearby tissue. Not all stage 0 findings are treated the same way — some are monitored, others are removed.', practicalMeaning: 'Your care team will explain whether your specific situation calls for active treatment or close monitoring. This varies by cancer type.', source: 'AJCC Cancer Staging Manual, 8th Ed.' },
    full: { title: 'Stage 0 (Tis, N0, M0)', text: 'Carcinoma in situ. Abnormal cells are present but have not invaded beyond the basement membrane of the tissue of origin. No lymph node involvement (N0), no distant metastasis (M0).', practicalMeaning: 'Management varies significantly by site of origin. Some in situ lesions (e.g., DCIS) are treated with surgery and possibly radiation; others (e.g., LCIS) may be managed with surveillance alone.', source: 'AJCC Cancer Staging Manual, 8th Ed.; NCI Cancer Staging Fact Sheet' },
  },
  'I': {
    simple: { title: 'Stage I', text: 'The cancer is small and only in one area.', practicalMeaning: 'This is early-stage cancer. Treatment options depend on the type of cancer.', source: 'AJCC Cancer Staging Manual, 8th Ed.' },
    balanced: { title: 'Stage I', text: 'A small tumor that has not grown deeply into nearby tissues and has not spread to lymph nodes or other parts of the body.', practicalMeaning: 'Early-stage cancer with multiple treatment options. Your oncologist will explain what is recommended for your specific type.', source: 'AJCC Cancer Staging Manual, 8th Ed.' },
    full: { title: 'Stage I (T1-T2, N0, M0)', text: 'Small primary tumor with no lymph node involvement and no distant metastasis. Specific T classification varies by cancer type. Anatomic and pathologic staging may differ.', practicalMeaning: 'Treatment is typically curative in intent. Modalities depend on histology, location, and molecular features.', source: 'AJCC Cancer Staging Manual, 8th Ed.' },
  },
  'II': {
    simple: { title: 'Stage II', text: 'The cancer is larger or has spread to a few nearby lymph nodes.', practicalMeaning: 'Treatment usually involves a combination of approaches.', source: 'AJCC Cancer Staging Manual, 8th Ed.' },
    balanced: { title: 'Stage II', text: 'The tumor may be larger and/or cancer may have spread to nearby lymph nodes, but it has not spread to distant parts of the body.', practicalMeaning: 'Your care team will likely discuss surgery, radiation, systemic therapy, or a combination based on your specific cancer type and characteristics.', source: 'AJCC Cancer Staging Manual, 8th Ed.' },
    full: { title: 'Stage II', text: 'Locally larger tumor or limited regional lymph node involvement. No distant metastasis. Sub-staging (IIA/IIB) depends on tumor size and nodal status specific to the cancer type.', practicalMeaning: 'Multimodal treatment is common. Neoadjuvant therapy may be considered depending on histology.', source: 'AJCC Cancer Staging Manual, 8th Ed.' },
  },
  'III': {
    simple: { title: 'Stage III', text: 'The cancer is larger and may have spread to several nearby lymph nodes but not to distant parts of the body.', practicalMeaning: 'Locally advanced. Treatment is more intensive but aims to be effective.', source: 'AJCC Cancer Staging Manual, 8th Ed.' },
    balanced: { title: 'Stage III (locally advanced)', text: 'The cancer has spread more extensively in the local area — to multiple lymph nodes or into nearby structures — but has not reached distant organs.', practicalMeaning: 'Treatment typically involves multiple modalities (surgery, radiation, systemic therapy) and may start with chemotherapy to shrink the tumor. Clinical trial options should be explored.', source: 'AJCC Cancer Staging Manual, 8th Ed.' },
    full: { title: 'Stage III (locally advanced)', text: 'Extensive local/regional disease. May involve invasion of adjacent structures or extensive lymph node involvement. No distant metastasis (M0). Substages vary by cancer type.', practicalMeaning: 'Curative intent treatment is typically multimodal. Neoadjuvant systemic therapy, surgery, and adjuvant therapy are commonly combined. Multidisciplinary tumor board review is standard.', source: 'AJCC Cancer Staging Manual, 8th Ed.' },
  },
  'IV': {
    simple: { title: 'Stage IV', text: 'The cancer has spread to distant parts of the body.', practicalMeaning: 'Treatment focuses on controlling the cancer and maintaining quality of life. Many people live with stage IV cancer with ongoing treatment.', source: 'AJCC Cancer Staging Manual, 8th Ed.' },
    balanced: { title: 'Stage IV (metastatic)', text: 'Cancer has spread from where it started to distant organs or tissues. This is also called metastatic cancer.', practicalMeaning: 'Treatment is ongoing and tailored to your specific cancer type and where it has spread. The goal is to control the cancer, manage symptoms, and maintain quality of life. Advances in treatment mean many people live longer with stage IV cancer than in the past.', source: 'AJCC Cancer Staging Manual, 8th Ed.' },
    full: { title: 'Stage IV (any T, any N, M1)', text: 'Distant metastasis confirmed (M1). Staging includes identification of metastatic sites and molecular profiling of metastatic lesions when possible. Oligometastatic disease may be treated differently than widespread metastasis.', practicalMeaning: 'Treatment selection is guided by histology, molecular markers, sites and burden of metastatic disease, performance status, and patient goals. Palliative care consultation alongside active treatment is recommended by all major guidelines.', source: 'AJCC Cancer Staging Manual, 8th Ed.; NCI Cancer Staging Fact Sheet' },
  },
};

export function getDiagnosisExplanation(
  cancerType: string | null,
  stage: string | null,
  detailLevel: DetailLevel
): DiagnosisExplanation | null {
  if (!stage || stage === 'not_staged' || stage === 'unsure') return null;
  
  const typeKey = cancerType?.toLowerCase() || '';
  const typeMap = STAGE_EXPLANATIONS[typeKey];
  if (typeMap && typeMap[stage]) {
    return typeMap[stage][detailLevel];
  }
  
  if (GENERIC_STAGES[stage]) {
    return GENERIC_STAGES[stage][detailLevel];
  }
  
  return null;
}
