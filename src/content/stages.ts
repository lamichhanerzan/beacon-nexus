export type Source = 'NCI' | 'ASCO' | 'ACS' | 'NCCN';

export interface Question {
  text: string;
  source: Source;
}

export interface TimelineRange {
  minDays: number;
  maxDays: number;
  note?: string;
  sourceLabel: string;
}

export interface CaregiverInfo {
  situation: string;
  actions: string[];
  atAppointment: string;
  stopDoing: string;
}

export interface Stage {
  id: string;
  label: string; // full label
  shortLabel: string; // for the spine
  order: number;
  whatsHappening: string;
  whoIsDoing: string;
  timeline: TimelineRange | null;
  escalateAfterDays: number | null;
  callScript: string | null;
  misconception: string;
  questions: Question[];
  caregiver: CaregiverInfo;
}

export const STAGES: Stage[] = [
  {
    id: 'finding',
    label: "Something was found",
    shortLabel: "Something was found",
    order: 1,
    whatsHappening: "A screening test or an exam turned up something that needs a closer look. This is very common, and most of the time it turns out not to be cancer. Right now nobody knows what it is — that's what the next tests are for.",
    whoIsDoing: "Your primary care provider or the screening center, working with a radiologist.",
    timeline: null,
    escalateAfterDays: 14,
    callScript: "I was told something was found on my [test] on [date]. I haven't heard about next steps yet. What's the plan, and who schedules it?",
    misconception: "\"Abnormal\" usually means \"incomplete — we need more pictures.\" On a mammogram, a BI-RADS 0 result means exactly that. It is not a diagnosis.",
    questions: [
      { text: "What exactly did you find, and where?", source: "NCI" },
      { text: "Does this need more testing, or can we watch it?", source: "NCI" },
      { text: "Who will schedule the next test, and when should I expect a call?", source: "ACS" },
      { text: "Should I be doing anything differently in the meantime?", source: "ACS" },
      { text: "If I don't hear from anyone, who do I call?", source: "NCI" }
    ],
    caregiver: {
      situation: "They've been told something needs a second look. No diagnosis exists yet. The hardest part right now is not knowing.",
      actions: [
        "Offer to be on the call when results come in.",
        "Help them write down exactly what they were told, while it's fresh.",
        "Ask if they want you to track dates and appointments.",
        "Don't research statistics yet — there's no diagnosis to research."
      ],
      atAppointment: "Write down the exact words used, including any test names or codes. You'll need them later.",
      stopDoing: "Don't say \"I'm sure it's nothing.\" It's well-meant, but it closes the conversation."
    }
  },
  {
    id: 'imaging_wait',
    label: "Waiting for more imaging",
    shortLabel: "Waiting for imaging",
    order: 2,
    whatsHappening: "More detailed pictures have been ordered — a diagnostic mammogram, ultrasound, MRI, or CT. These are more focused than a screening test. Insurance sometimes has to approve the scan first, which can add days.",
    whoIsDoing: "Scheduling staff, radiology technologists, and a radiologist who will read the images.",
    timeline: {
      minDays: 5,
      maxDays: 13,
      sourceLabel: "National Quality Measures for Breast Centers",
      note: "This benchmark comes from breast imaging. Other cancers vary."
    },
    escalateAfterDays: 14,
    callScript: "My doctor ordered a [scan] on [date] and I haven't been scheduled yet. Can you tell me where that stands, and whether insurance approval is holding it up?",
    misconception: "People assume a delay means nobody's worried. Usually it means paperwork — pre-authorization, scheduling, or a referral sitting in a queue.",
    questions: [
      { text: "What scan was ordered, and what is it looking for?", source: "NCI" },
      { text: "Does this need insurance pre-authorization? Has it been submitted?", source: "ACS" },
      { text: "How soon should this be done?", source: "ASCO" },
      { text: "Where do I go, and do I need to prepare?", source: "ACS" },
      { text: "When and how will I get the results?", source: "NCI" }
    ],
    caregiver: {
      situation: "They're waiting to be scheduled for a more detailed scan. Delay here is usually administrative, not medical.",
      actions: [
        "Offer to call scheduling on their behalf — it's often a hold-music task, and that's a real gift.",
        "Check whether insurance pre-authorization is the holdup.",
        "Offer a ride, especially if the imaging center is far.",
        "Put the appointment in your own calendar too."
      ],
      atAppointment: "Ask when and how results will be delivered, and get a direct phone number.",
      stopDoing: "Don't ask daily whether they've heard anything. Ask instead: \"Want me to call and check?\""
    }
  },
  {
    id: 'biopsy_sched',
    label: "Biopsy is scheduled",
    shortLabel: "Biopsy scheduled",
    order: 3,
    whatsHappening: "A biopsy takes a small tissue sample so a specialist can look at the cells directly. It's the only way to know for certain whether something is cancer. Most are done with a needle and local numbing, and you go home the same day.",
    whoIsDoing: "A radiologist, surgeon, or other proceduralist, with nursing staff.",
    timeline: {
      minDays: 4,
      maxDays: 14,
      sourceLabel: "National Quality Measures for Breast Centers"
    },
    escalateAfterDays: 14,
    callScript: "I'm scheduled for a biopsy on [date]. I want to confirm the instructions — should I stop any medications, and can I drive myself home?",
    misconception: "Many people fear a biopsy will \"spread\" cancer. Major cancer organizations are clear that this is not a meaningful risk, and biopsies are standard practice everywhere.",
    questions: [
      { text: "What kind of biopsy is this — needle or surgical?", source: "NCI" },
      { text: "Do I need to stop any medications, like blood thinners?", source: "ACS" },
      { text: "Will you place a marker clip, and what does that mean?", source: "NCI" },
      { text: "Who reads the sample, and how long will results take?", source: "NCI" },
      { text: "What should I watch for afterward?", source: "ACS" }
    ],
    caregiver: {
      situation: "A biopsy is coming. They will likely need a ride and someone with them afterward.",
      actions: [
        "Confirm you can drive them — many biopsies require it.",
        "Ask what medications need to be stopped and when.",
        "Plan a quiet evening afterward; the site will be sore.",
        "Write down the biopsy date — the wait clock starts here."
      ],
      atAppointment: "Ask for written aftercare instructions and the number to call if something goes wrong overnight.",
      stopDoing: "Don't fill the waiting room silence with reassurance. Just be there."
    }
  },
  {
    id: 'path_wait',
    label: "Biopsy done, waiting on results",
    shortLabel: "Waiting on results",
    order: 4,
    whatsHappening: "Your tissue is being preserved, sliced very thin, stained, and examined under a microscope by a pathologist. It isn't sitting in a pile somewhere — there are real steps, and each takes time. If extra stains or molecular tests are needed, that adds more.",
    whoIsDoing: "Histotechnologists prepare the sample; a pathologist reads it and writes the report.",
    timeline: {
      minDays: 2,
      maxDays: 5,
      sourceLabel: "College of American Pathologists",
      note: "If special stains or molecular tests are needed, this can take 1–2 weeks longer. That's common, and it usually means they're being thorough."
    },
    escalateAfterDays: 10,
    callScript: "I had a biopsy on [date]. It's been [N] days and I'm checking on my results. When should I expect them, and who will call me?",
    misconception: "The first report may not be the whole story. Additional tests can still be pending, and results sometimes appear in a patient portal before your doctor has reviewed them with you.",
    questions: [
      { text: "Can I have a copy of my pathology report?", source: "NCI" },
      { text: "Is this invasive, or in situ?", source: "NCI" },
      { text: "What is the grade, and how is that different from stage?", source: "NCI" },
      { text: "Are any further tests being run on the sample?", source: "NCCN" },
      { text: "Can a second pathologist review the slides if I want that?", source: "NCI" }
    ],
    caregiver: {
      situation: "They're waiting on the result that determines everything. This is usually the hardest stretch of the whole process.",
      actions: [
        "Offer to make the follow-up call — use the script on this page.",
        "Ask if they want a printed copy of the report requested.",
        "Keep the day count so they don't have to.",
        "Line up who they want with them when the result comes."
      ],
      atAppointment: "Write down every term you don't recognize, exactly as spelled. Ask for the report in writing.",
      stopDoing: "Stop asking \"any news?\" Ask \"want me to call them?\" instead — it offers help rather than asking them to report on their own anxiety."
    }
  },
  {
    id: 'diagnosed',
    label: "I have my diagnosis",
    shortLabel: "Diagnosis received",
    order: 5,
    whatsHappening: "The pathology report is back and a diagnosis has been made. Most people remember very little of this conversation — that's normal, not a failing. The next step is finding out more about the specific cancer and whether it has spread.",
    whoIsDoing: "Your diagnosing clinician, who will refer you to oncology specialists.",
    timeline: null,
    escalateAfterDays: 10,
    callScript: "I was diagnosed on [date]. I haven't been scheduled with an oncologist yet. Who is coordinating my referrals, and when should I expect appointments?",
    misconception: "A diagnosis is not the same as a plan. There is more testing ahead before anyone can tell you what treatment will look like, and that's normal.",
    questions: [
      { text: "What exactly is my diagnosis, in writing?", source: "NCI" },
      { text: "What does the grade mean for me?", source: "NCI" },
      { text: "What tests come next, and how long will they take?", source: "ASCO" },
      { text: "Who is my main point of contact from here?", source: "ACS" },
      { text: "Is there a nurse navigator I can work with?", source: "ACS" }
    ],
    caregiver: {
      situation: "They have a diagnosis. They are probably in shock and will not remember much of what was said.",
      actions: [
        "Write down what was said, today, before it fades.",
        "Ask whether the practice has a nurse navigator and get that number.",
        "Help them decide who to tell and when — that's their choice, not yours.",
        "Offer to be the person who updates everyone else."
      ],
      atAppointment: "Ask for everything in writing, and ask what the next appointment is and who books it.",
      stopDoing: "Don't start researching survival statistics and sharing them. Staging isn't done yet, so nothing you find applies."
    }
  },
  {
    id: 'staging',
    label: "Staging tests",
    shortLabel: "Staging tests",
    order: 6,
    whatsHappening: "More scans and lab tests figure out the size of the cancer and whether it has spread. Your tissue may also be tested for specific genes or proteins — this is called biomarker or molecular testing, and it can determine whether targeted treatments will work for you. These results are worth waiting for.",
    whoIsDoing: "Radiologists, pathologists, and specialized molecular labs.",
    timeline: {
      minDays: 10,
      maxDays: 21,
      sourceLabel: "CAP / IASLC / AMP guideline",
      note: "Guidelines suggest under 14 days, but real-world results average closer to 3 weeks."
    },
    escalateAfterDays: 25,
    callScript: "My biomarker testing was sent on [date]. It's been [N] days. Can you tell me whether results are back, and whether we're waiting on them before making a treatment plan?",
    misconception: "It feels like nothing is happening. In fact this is often when the most consequential information is being gathered — molecular results can completely change which treatments are available to you.",
    questions: [
      { text: "Is my tumor being tested for biomarkers? Which ones?", source: "NCCN" },
      { text: "When will those results come back?", source: "NCCN" },
      { text: "Could the results change my treatment options?", source: "NCCN" },
      { text: "What is my stage, and what does it mean?", source: "ASCO" },
      { text: "Are we waiting on anything before deciding treatment?", source: "ASCO" }
    ],
    caregiver: {
      situation: "More tests, more waiting. This phase can feel like limbo again right after they thought the waiting was over.",
      actions: [
        "Track which tests were sent and when.",
        "Ask specifically whether biomarker testing was ordered — it's occasionally missed.",
        "Handle scan logistics: rides, prep instructions, fasting.",
        "Start a folder for reports."
      ],
      atAppointment: "Ask which results are still outstanding and what decision is waiting on them.",
      stopDoing: "Don't treat this as a delay. It's not idle time — it's the work that determines the plan."
    }
  },
  {
    id: 'consults',
    label: "Meeting specialists",
    shortLabel: "Meeting specialists",
    order: 7,
    whatsHappening: "You may see several different oncologists — medical (drug treatments), surgical (operations), and radiation. Your case may also be discussed at a tumor board, where specialists review it together and agree on recommendations. Seeing multiple doctors is standard, not a sign that something is wrong.",
    whoIsDoing: "Medical, surgical, and radiation oncologists; often a multidisciplinary tumor board.",
    timeline: null,
    escalateAfterDays: 21,
    callScript: "I've seen [doctor] and I'm waiting on the next consultation. Has my case been through tumor board, and what's the next appointment?",
    misconception: "Repeating your story to each specialist feels like disorganization. It's usually deliberate — each specialist is assessing a different treatment angle.",
    questions: [
      { text: "Will my case be reviewed by a tumor board?", source: "ASCO" },
      { text: "Which specialists will I see, and what does each one decide?", source: "ASCO" },
      { text: "Do the specialists agree on the recommendation?", source: "ASCO" },
      { text: "Am I eligible for any clinical trials?", source: "NCI" },
      { text: "How do I get records sent if I want a second opinion?", source: "NCI" }
    ],
    caregiver: {
      situation: "Multiple appointments with different specialists, often in different places. This is where logistics get heavy.",
      actions: [
        "Keep one shared calendar of every appointment.",
        "Bring the running question list to each one.",
        "Track what each specialist said separately — they may emphasize different things.",
        "Ask about parking, travel, and whether any visit can be virtual."
      ],
      atAppointment: "Ask each specialist the same question: \"If this were your family member, what would you recommend and why?\"",
      stopDoing: "Don't try to referee between specialists. Bring the differences back to the team and ask them directly."
    }
  },
  {
    id: 'plan_given',
    label: "I have a treatment plan",
    shortLabel: "Treatment plan given",
    order: 8,
    whatsHappening: "Your team has recommended a plan — which treatments, in what order. There may be more than one reasonable option. This is the point to ask questions, understand tradeoffs, and decide whether you want a second opinion.",
    whoIsDoing: "Your treating oncologist, with input from the wider team.",
    timeline: {
      minDays: 1,
      maxDays: 27,
      sourceLabel: "National Cancer Database",
      note: "This is a national median across many cancers. Yours may reasonably differ."
    },
    escalateAfterDays: 35,
    callScript: "I received my treatment plan on [date] and I'm ready to move forward. What's the next step to get scheduled, and is there anything holding it up — insurance, or another test?",
    misconception: "People fear a second opinion will cause a dangerous delay or offend their doctor. Second opinions are routine, usually covered by insurance, and rarely delay treatment meaningfully.",
    questions: [
      { text: "What are all my options, including doing nothing right now?", source: "NCI" },
      { text: "What is the goal — cure, control, or comfort?", source: "ASCO" },
      { text: "What are the side effects, short-term and long-term?", source: "NCI" },
      { text: "Is treatment before surgery (neoadjuvant) an option for me?", source: "ASCO" },
      { text: "What will this cost, and is there a financial counselor?", source: "ASCO" },
      { text: "Are there clinical trials I should consider?", source: "NCI" }
    ],
    caregiver: {
      situation: "A plan exists. Now there are decisions to make and logistics to arrange.",
      actions: [
        "Help them compare options against what matters to them, not what you'd choose.",
        "Ask about a financial counselor before treatment starts.",
        "Map out the treatment schedule and who drives when.",
        "Ask whether a second opinion is worth getting — and support it if they want one."
      ],
      atAppointment: "Ask what the first week of treatment actually looks like, hour by hour.",
      stopDoing: "Don't push your preferred option. Your job is to make sure they understand the choices, not to make the choice."
    }
  },
  {
    id: 'benign',
    label: "It wasn't cancer",
    shortLabel: "Not cancer",
    order: 9,
    whatsHappening: "Your results came back without cancer. This is the most common outcome after an abnormal screening result. There may still be follow-up recommended — sometimes a repeat scan in six months to make sure nothing changes.",
    whoIsDoing: "Your care team, who should tell you what follow-up (if any) you need.",
    timeline: null,
    escalateAfterDays: null,
    callScript: null,
    misconception: "Relief can be followed by lingering anxiety, and that's normal. It doesn't mean something was missed.",
    questions: [
      { text: "Do I need any follow-up imaging, and when?", source: "ACS" },
      { text: "Should my screening schedule change going forward?", source: "ACS" },
      { text: "What was it, if not cancer?", source: "NCI" },
      { text: "Is there anything I should watch for?", source: "ACS" }
    ],
    caregiver: {
      situation: "Good news. They may still be shaken — that's normal after weeks of fear.",
      actions: [
        "Note any follow-up date in your calendar too.",
        "Let them feel however they feel, including not immediately relieved.",
        "Ask whether their regular screening schedule changes."
      ],
      atAppointment: "Confirm the follow-up interval in writing.",
      stopDoing: "Don't say \"See? Nothing to worry about.\" Weeks of fear were real, and dismissing them isn't kind."
    }
  }
];
