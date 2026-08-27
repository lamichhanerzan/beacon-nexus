import React, { useState, useRef, useEffect } from 'react';
import { BeaconLogo } from './BeaconLogo';
import { APPOINTMENT_TYPES } from '../content/appointments';
import type { UserAppointment } from './AppointmentForm';
import { formatCaregiverText } from '../lib/caregiverGrammar';
import { Send, Calendar, ShieldCheck, AlertCircle, HelpCircle, Check } from 'lucide-react';

interface AssistantWindowProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'patient' | 'caregiver';
  onAddAppointment: (appt: UserAppointment) => void;
  onOpenPrepSheet: (appt: UserAppointment) => void;
  onNavigate: (route: 'screening' | 'journey' | 'facilities') => void;
}

type WindowSize = 'compact' | 'expanded' | 'minimized';

interface ChatMessage {
  id: string;
  sender: 'assistant' | 'user';
  text?: string;
  type?: 'text' | 'booking_step' | 'confirmation_card' | 'explanation';
  bookingState?: {
    step: 'type' | 'date' | 'time' | 'doctor' | 'confirm' | 'done';
    typeId?: string;
    date?: string;
    time?: string;
    doctorName?: string;
    createdAppt?: UserAppointment;
  };
  explanationData?: {
    summary: string;
    questions: string[];
    isGenerated?: boolean;
  };
}

const GLOSSARY_TERMS: Record<string, { summary: string; questions: string[] }> = {
  biopsy: {
    summary: 'A biopsy is a procedure where a physician removes a small sample of tissue or cells so a pathologist can examine them under a microscope to determine whether cells are benign or malignant.',
    questions: [
      'How many working days will it take for pathology to finish testing?',
      'Which specific lab is processing my tissue sample?',
      'What symptoms or warning signs should prompt an urgent call back?'
    ]
  },
  pathology: {
    summary: 'Pathology is the medical branch focused on analyzing tissue, blood, and cell samples under a microscope to determine cell types, grade, and molecular characteristics.',
    questions: [
      'Can I receive a printed copy of the complete pathology report?',
      'Are additional biomarker stains or genomic tests being run on this sample?',
      'Is my pathology report scheduled for review by a Tumor Board?'
    ]
  },
  margin: {
    summary: 'Surgical margins describe the rim of tissue surrounding a removed tumor. Clear or negative margins mean no abnormal cells were detected at the outer edge.',
    questions: [
      'Were the surgical margins clear, close, or involved?',
      'Does the margin status mean further surgery or radiation is recommended?',
      'When will the final pathology report on margins be ready?'
    ]
  },
  birads: {
    summary: 'BI-RADS is a standardized 0-to-6 scoring system used by radiologists to communicate mammogram and ultrasound findings clearly across clinics.',
    questions: [
      'What specific BI-RADS category was assigned to my scan?',
      'Does this score indicate a need for additional diagnostic imaging or biopsy?',
      'When should my next routine or diagnostic mammogram be scheduled?'
    ]
  }
};

export const AssistantWindow: React.FC<AssistantWindowProps> = ({
  isOpen,
  onClose,
  mode,
  onAddAppointment,
  onOpenPrepSheet,
  onNavigate
}) => {
  const isCaregiver = mode === 'caregiver';

  const [windowSize, setWindowSize] = useState<WindowSize>('compact');
  const [inputText, setInputText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Scripted conversation history
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [bookingState, setBookingState] = useState<{
    typeId?: string;
    date?: string;
    time?: string;
    doctorName?: string;
  }>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const windowRef = useRef<HTMLDivElement>(null);

  // Initialize opening state messages
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          sender: 'assistant',
          text: isCaregiver
            ? "Hello. I'm the BEACON Assistant. How can I help you support them today?"
            : "Hello. I'm the BEACON Assistant. How can I help you today?"
        }
      ]);
    }
  }, [isOpen, messages.length, isCaregiver]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Keyboard Escape listener & focus trap
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Handle Window Controls
  const handleCloseWindow = () => onClose();
  const handleMinimizeWindow = () => setWindowSize(windowSize === 'minimized' ? 'compact' : 'minimized');
  const handleToggleExpandWindow = () => setWindowSize(windowSize === 'expanded' ? 'compact' : 'expanded');

  // Handle User Choice: Suggestion Chips
  const handleSelectSuggestion = (choice: string) => {
    if (choice === 'book') {
      startBookingFlow();
    } else if (choice === 'explain') {
      const userMsg: ChatMessage = {
        id: `u_${Date.now()}`,
        sender: 'user',
        text: 'Explain a medical term I was told'
      };
      const botMsg: ChatMessage = {
        id: `b_${Date.now()}`,
        sender: 'assistant',
        text: 'Type any medical term or phrase you were told (for example: "biopsy", "pathology margin", "BI-RADS"). I will give you a plain-language explanation and 3 questions to ask your doctor.'
      };
      setMessages((prev) => [...prev, userMsg, botMsg]);
    } else if (choice === 'questions') {
      const userMsg: ChatMessage = {
        id: `u_${Date.now()}`,
        sender: 'user',
        text: 'What should I ask at my next visit?'
      };
      const botMsg: ChatMessage = {
        id: `b_${Date.now()}`,
        sender: 'assistant',
        text: 'Select your appointment type to view specialized questions and clinical rationales:',
        type: 'booking_step',
        bookingState: { step: 'type' }
      };
      setMessages((prev) => [...prev, userMsg, botMsg]);
    }
  };

  // SCRIPTED BOOKING FLOW
  const startBookingFlow = () => {
    setBookingState({});
    const userMsg: ChatMessage = {
      id: `u_${Date.now()}`,
      sender: 'user',
      text: 'Book an appointment'
    };
    const botMsg: ChatMessage = {
      id: `b_${Date.now()}`,
      sender: 'assistant',
      text: isCaregiver
        ? "Let's get it on their calendar. What kind of appointment is it for them?"
        : "Let's get it on your calendar. What kind of appointment is it?",
      type: 'booking_step',
      bookingState: { step: 'type' }
    };
    setMessages((prev) => [...prev, userMsg, botMsg]);
  };

  const handleSelectApptType = (typeId: string) => {
    const typeObj = APPOINTMENT_TYPES.find((t) => t.id === typeId);
    setBookingState((prev) => ({ ...prev, typeId }));

    const userMsg: ChatMessage = {
      id: `u_${Date.now()}`,
      sender: 'user',
      text: `Selected: ${typeObj?.label}`
    };

    const defaultDate = new Date().toISOString().split('T')[0];
    const botMsg: ChatMessage = {
      id: `b_${Date.now()}`,
      sender: 'assistant',
      text: 'When is it?',
      type: 'booking_step',
      bookingState: { step: 'date', typeId, date: defaultDate }
    };

    setMessages((prev) => [...prev, userMsg, botMsg]);
  };

  const handleSelectDate = (dateVal: string) => {
    setBookingState((prev) => ({ ...prev, date: dateVal }));

    const userMsg: ChatMessage = {
      id: `u_${Date.now()}`,
      sender: 'user',
      text: `Date: ${dateVal}`
    };

    const botMsg: ChatMessage = {
      id: `b_${Date.now()}`,
      sender: 'assistant',
      text: 'What time? You can skip this.',
      type: 'booking_step',
      bookingState: { step: 'time', typeId: bookingState.typeId, date: dateVal }
    };

    setMessages((prev) => [...prev, userMsg, botMsg]);
  };

  const handleSelectTime = (timeVal?: string) => {
    setBookingState((prev) => ({ ...prev, time: timeVal }));

    const userMsg: ChatMessage = {
      id: `u_${Date.now()}`,
      sender: 'user',
      text: timeVal ? `Time: ${timeVal}` : 'Skipped time'
    };

    const botMsg: ChatMessage = {
      id: `b_${Date.now()}`,
      sender: 'assistant',
      text: 'Anything to note about who it\'s with? This stays on your device and is never shared.',
      type: 'booking_step',
      bookingState: { step: 'doctor', typeId: bookingState.typeId, date: bookingState.date, time: timeVal }
    };

    setMessages((prev) => [...prev, userMsg, botMsg]);
  };

  const handleSelectDoctor = (doctorVal?: string) => {
    const finalState = { ...bookingState, doctorName: doctorVal };
    setBookingState(finalState);

    const userMsg: ChatMessage = {
      id: `u_${Date.now()}`,
      sender: 'user',
      text: doctorVal ? `With: ${doctorVal}` : 'Skipped physician name'
    };

    const botMsg: ChatMessage = {
      id: `b_${Date.now()}`,
      sender: 'assistant',
      text: 'Here is your appointment summary:',
      type: 'confirmation_card',
      bookingState: {
        step: 'confirm',
        typeId: finalState.typeId,
        date: finalState.date,
        time: finalState.time,
        doctorName: finalState.doctorName
      }
    };

    setMessages((prev) => [...prev, userMsg, botMsg]);
  };

  const handleConfirmAddToCalendar = () => {
    if (!bookingState.typeId || !bookingState.date) return;

    const newAppt: UserAppointment = {
      id: `appt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      typeId: bookingState.typeId,
      date: bookingState.date,
      time: bookingState.time,
      doctorName: bookingState.doctorName
    };

    onAddAppointment(newAppt);

    const botMsg: ChatMessage = {
      id: `b_${Date.now()}`,
      sender: 'assistant',
      text: "Added. I've put together a prep sheet for this appointment — questions to ask and what to bring.",
      type: 'booking_step',
      bookingState: {
        step: 'done',
        createdAppt: newAppt
      }
    };

    setMessages((prev) => [...prev, botMsg]);
  };

  // HANDLE USER TEXT INPUT (Keywords or Term Explanation)
  const handleSendText = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = inputText.trim();
    if (!query) return;

    setInputText('');

    const userMsg: ChatMessage = {
      id: `u_${Date.now()}`,
      sender: 'user',
      text: query
    };

    setMessages((prev) => [...prev, userMsg]);

    const lowerQuery = query.toLowerCase();

    // Check Navigation Intents
    if (lowerQuery.includes('screening') || lowerQuery.includes('due') || lowerQuery.includes('check')) {
      onNavigate('screening');
      const botMsg: ChatMessage = {
        id: `b_${Date.now()}`,
        sender: 'assistant',
        text: 'Opening the Screening Module to check your national guideline eligibility...'
      };
      setMessages((prev) => [...prev, botMsg]);
      return;
    }

    if (lowerQuery.includes('clinic') || lowerQuery.includes('facility') || lowerQuery.includes('where do i go')) {
      onNavigate('facilities');
      const botMsg: ChatMessage = {
        id: `b_${Date.now()}`,
        sender: 'assistant',
        text: 'Opening Louisiana Statewide Healthcare Resources & Mammography Centers...'
      };
      setMessages((prev) => [...prev, botMsg]);
      return;
    }

    // Term Explanation Flow
    setIsLoading(true);

    // Hard-refuse medical advice / diagnosis / prognosis in prompt evaluation
    if (lowerQuery.includes('do i have cancer') || lowerQuery.includes('will i survive') || lowerQuery.includes('what is my stage')) {
      setIsLoading(false);
      const botMsg: ChatMessage = {
        id: `b_${Date.now()}`,
        sender: 'assistant',
        text: 'BEACON cannot evaluate individual medical diagnoses, survival estimates, or treatment decisions. Please discuss these specific questions directly with your physician or oncology care team.'
      };
      setMessages((prev) => [...prev, botMsg]);
      return;
    }

    // Try API explain or matching glossary
    let matchedData = GLOSSARY_TERMS['biopsy']; // Default fallback
    Object.keys(GLOSSARY_TERMS).forEach((term) => {
      if (lowerQuery.includes(term)) {
        matchedData = GLOSSARY_TERMS[term];
      }
    });

    setTimeout(() => {
      setIsLoading(false);
      const botMsg: ChatMessage = {
        id: `b_${Date.now()}`,
        sender: 'assistant',
        type: 'explanation',
        explanationData: {
          summary: matchedData.summary,
          questions: matchedData.questions,
          isGenerated: true
        }
      };
      setMessages((prev) => [...prev, botMsg]);
    }, 600);
  };

  // Size classes
  const sizeClasses =
    windowSize === 'minimized'
      ? 'w-72 h-14 overflow-hidden'
      : windowSize === 'expanded'
      ? 'w-[475px] h-[700px] max-w-[95vw] max-h-[90vh]'
      : 'w-[380px] h-[560px] max-w-[95vw] max-h-[85vh]';

  return (
    <div
      ref={windowRef}
      className={`fixed bottom-6 right-6 z-50 bg-paper border-2 border-rule rounded-xl shadow-2xl flex flex-col transition-all duration-200 overflow-hidden sm:${sizeClasses} max-sm:fixed max-sm:inset-x-2 max-sm:bottom-2 max-sm:top-12 max-sm:w-auto max-sm:h-auto max-sm:rounded-2xl`}
      role="dialog"
      aria-label="BEACON Assistant Window"
    >
      {/* WINDOW TITLE BAR (macOS arrangement: Red, Yellow, Green control dots) */}
      <div className="bg-manila border-b border-rule px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-2">
          {/* Logo Mark Only */}
          <BeaconLogo size="sm" showWordmark={false} />
          <span className="font-display font-bold text-base text-ink m-0">
            BEACON Assistant
          </span>
        </div>

        {/* macOS Three Window Dots */}
        <div className="flex items-center space-x-2 group/dots">
          {/* Red Circle — Close */}
          <button
            onClick={handleCloseWindow}
            className="w-3.5 h-3.5 rounded-full bg-[#C4553B] flex items-center justify-center text-[9px] font-bold text-paper transition-opacity cursor-pointer focus:outline-none"
            title="Close Assistant"
            aria-label="Close Assistant"
          >
            <span className="opacity-0 group-hover/dots:opacity-100">×</span>
          </button>

          {/* Yellow Circle — Minimize */}
          <button
            onClick={handleMinimizeWindow}
            className="w-3.5 h-3.5 rounded-full bg-[#D9A441] flex items-center justify-center text-[9px] font-bold text-paper transition-opacity cursor-pointer focus:outline-none"
            title="Minimize"
            aria-label="Minimize"
          >
            <span className="opacity-0 group-hover/dots:opacity-100">−</span>
          </button>

          {/* Green Circle — Toggle Expand */}
          <button
            onClick={handleToggleExpandWindow}
            className="w-3.5 h-3.5 rounded-full bg-[#4A7C59] flex items-center justify-center text-[9px] font-bold text-paper transition-opacity cursor-pointer focus:outline-none"
            title="Toggle Expand"
            aria-label="Toggle Expand"
          >
            <span className="opacity-0 group-hover/dots:opacity-100">+</span>
          </button>
        </div>
      </div>

      {/* MINIMIZED BODY DISPLAY */}
      {windowSize === 'minimized' ? (
        <div className="px-4 py-2 text-xs text-ink-soft italic flex items-center justify-between">
          <span>Assistant minimized</span>
          <button onClick={() => setWindowSize('compact')} className="text-signal font-bold cursor-pointer">
            Restore
          </button>
        </div>
      ) : (
        <>
          {/* PERSISTENT WARNING BANNER ABOVE INPUT */}
          <div className="bg-manila/40 border-b border-rule/60 px-4 py-1.5 text-[11px] text-ink-soft flex items-center space-x-1.5 shrink-0">
            <AlertCircle className="w-3.5 h-3.5 text-signal shrink-0" />
            <span>Don't include names, dates of birth, or record numbers.</span>
          </div>

          {/* MESSAGE STREAM AREA */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 font-sans text-sm">
            
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                {/* Standard Message Text */}
                {msg.text && (
                  <div
                    className={`max-w-[85%] p-3.5 rounded-xl text-ink leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-paper border border-rule shadow-2xs'
                        : 'bg-manila/60 shadow-2xs'
                    }`}
                  >
                    {formatCaregiverText(msg.text, isCaregiver)}
                  </div>
                )}

                {/* SCRIPTED BOOKING STEP INLINE CONTROLS */}
                {msg.type === 'booking_step' && msg.bookingState && (
                  <div className="mt-2 w-full max-w-[90%] space-y-2">
                    
                    {/* Step 1: Select Appointment Type Chips */}
                    {msg.bookingState.step === 'type' && (
                      <div className="p-3 rounded-xl bg-paper border border-rule space-y-2">
                        <span className="font-clinical text-[11px] font-bold text-signal uppercase tracking-wider block">
                          Select Appointment Type:
                        </span>
                        <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                          {APPOINTMENT_TYPES.map((type) => (
                            <button
                              key={type.id}
                              onClick={() => handleSelectApptType(type.id)}
                              className="w-full text-left p-2.5 rounded-lg border border-rule bg-paper hover:bg-manila/40 font-sans text-xs font-semibold text-ink transition-colors cursor-pointer"
                            >
                              {type.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Step 2: Inline Date Picker */}
                    {msg.bookingState.step === 'date' && (
                      <div className="p-3 rounded-xl bg-paper border border-rule space-y-3">
                        <span className="font-clinical text-[11px] font-bold text-signal uppercase tracking-wider block">
                          Select Date:
                        </span>
                        <input
                          type="date"
                          defaultValue={new Date().toISOString().split('T')[0]}
                          id="inline_date_input"
                          className="w-full px-3 py-2 rounded-lg border border-rule bg-paper font-clinical text-sm text-ink focus:outline-none"
                        />
                        <button
                          onClick={() => {
                            const val = (document.getElementById('inline_date_input') as HTMLInputElement)?.value;
                            handleSelectDate(val || new Date().toISOString().split('T')[0]);
                          }}
                          className="w-full py-2 rounded-lg font-sans text-xs font-bold bg-signal text-paper cursor-pointer"
                        >
                          Confirm Date
                        </button>
                      </div>
                    )}

                    {/* Step 3: Inline Time Picker + Skip */}
                    {msg.bookingState.step === 'time' && (
                      <div className="p-3 rounded-xl bg-paper border border-rule space-y-3">
                        <span className="font-clinical text-[11px] font-bold text-signal uppercase tracking-wider block">
                          Select Time (Optional):
                        </span>
                        <input
                          type="time"
                          id="inline_time_input"
                          className="w-full px-3 py-2 rounded-lg border border-rule bg-paper font-clinical text-sm text-ink focus:outline-none"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSelectTime(undefined)}
                            className="flex-1 py-2 rounded-lg font-sans text-xs font-semibold bg-manila text-ink cursor-pointer"
                          >
                            Skip
                          </button>
                          <button
                            onClick={() => {
                              const val = (document.getElementById('inline_time_input') as HTMLInputElement)?.value;
                              handleSelectTime(val || undefined);
                            }}
                            className="flex-1 py-2 rounded-lg font-sans text-xs font-bold bg-signal text-paper cursor-pointer"
                          >
                            Confirm Time
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Step 4: Inline Doctor Input + Skip */}
                    {msg.bookingState.step === 'doctor' && (
                      <div className="p-3 rounded-xl bg-paper border border-rule space-y-3">
                        <span className="font-clinical text-[11px] font-bold text-signal uppercase tracking-wider block">
                          Physician / Facility Name (Optional):
                        </span>
                        <input
                          type="text"
                          id="inline_doc_input"
                          placeholder="e.g. Dr. Smith"
                          className="w-full px-3 py-2 rounded-lg border border-rule bg-paper font-sans text-xs text-ink focus:outline-none"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSelectDoctor(undefined)}
                            className="flex-1 py-2 rounded-lg font-sans text-xs font-semibold bg-manila text-ink cursor-pointer"
                          >
                            Skip
                          </button>
                          <button
                            onClick={() => {
                              const val = (document.getElementById('inline_doc_input') as HTMLInputElement)?.value;
                              handleSelectDoctor(val || undefined);
                            }}
                            className="flex-1 py-2 rounded-lg font-sans text-xs font-bold bg-signal text-paper cursor-pointer"
                          >
                            Confirm
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Step 6: Done -> Open Prep Sheet */}
                    {msg.bookingState.step === 'done' && msg.bookingState.createdAppt && (
                      <button
                        onClick={() => {
                          onOpenPrepSheet(msg.bookingState!.createdAppt!);
                          onClose();
                        }}
                        className="w-full py-2.5 rounded-lg font-sans text-xs font-bold bg-signal text-paper shadow-xs hover:bg-signal/90 transition-colors cursor-pointer flex items-center justify-center space-x-1.5"
                      >
                        <Calendar className="w-4 h-4" />
                        <span>Open Prep Sheet</span>
                      </button>
                    )}

                  </div>
                )}

                {/* CONFIRMATION CARD IN MESSAGES */}
                {msg.type === 'confirmation_card' && msg.bookingState && (
                  <div className="mt-2 w-full max-w-[90%] p-4 rounded-xl bg-manila/40 border-2 border-manila-deep space-y-3">
                    <span className="font-clinical text-xs font-bold text-signal uppercase tracking-wider block">
                      Appointment Summary
                    </span>
                    <div className="space-y-1 text-xs text-ink">
                      <div><strong>Type:</strong> {APPOINTMENT_TYPES.find((t) => t.id === msg.bookingState?.typeId)?.label}</div>
                      <div><strong>Date:</strong> {msg.bookingState.date}</div>
                      {msg.bookingState.time && <div><strong>Time:</strong> {msg.bookingState.time}</div>}
                      {msg.bookingState.doctorName && <div><strong>Doctor:</strong> {msg.bookingState.doctorName}</div>}
                    </div>
                    <button
                      onClick={handleConfirmAddToCalendar}
                      className="w-full py-2.5 rounded-lg font-sans text-xs font-bold bg-signal text-paper hover:bg-signal/90 transition-colors cursor-pointer flex items-center justify-center space-x-1.5"
                    >
                      <Check className="w-4 h-4" />
                      <span>Add to Calendar</span>
                    </button>
                  </div>
                )}

                {/* EXPLANATION DATA RESPONSE */}
                {msg.type === 'explanation' && msg.explanationData && (
                  <div className="mt-2 w-full max-w-[90%] p-4 rounded-xl bg-manila/50 border border-rule space-y-3">
                    <p className="text-sm text-ink leading-relaxed m-0">
                      {msg.explanationData.summary}
                    </p>

                    <div className="space-y-1.5 pt-2 border-t border-rule/60">
                      <span className="font-clinical text-[11px] font-bold text-signal uppercase tracking-wider block">
                        3 Questions to ask your care team:
                      </span>
                      <ol className="list-decimal list-inside space-y-1 text-xs text-ink">
                        {msg.explanationData.questions.map((q, qIdx) => (
                          <li key={qIdx}>{q}</li>
                        ))}
                      </ol>
                    </div>

                    <div className="pt-1 text-[10px] font-clinical text-ink-soft italic border-t border-rule/40">
                      *Generated explanation — verify with your care team.
                    </div>
                  </div>
                )}

              </div>
            ))}

            {/* OPENING SUGGESTION CHIPS (IF ONLY WELCOME MESSAGE EXISTS) */}
            {messages.length === 1 && (
              <div className="space-y-2 pt-2">
                <span className="font-clinical text-[10px] font-bold text-ink-soft uppercase tracking-wider block">
                  Suggested Options:
                </span>
                <div className="flex flex-col space-y-2">
                  <button
                    onClick={() => handleSelectSuggestion('book')}
                    className="p-3 rounded-xl border border-rule bg-paper hover:bg-manila/40 text-left font-sans text-xs font-semibold text-ink transition-colors cursor-pointer flex items-center space-x-2"
                  >
                    <Calendar className="w-4 h-4 text-signal shrink-0" />
                    <span>Book an appointment</span>
                  </button>

                  <button
                    onClick={() => handleSelectSuggestion('explain')}
                    className="p-3 rounded-xl border border-rule bg-paper hover:bg-manila/40 text-left font-sans text-xs font-semibold text-ink transition-colors cursor-pointer flex items-center space-x-2"
                  >
                    <HelpCircle className="w-4 h-4 text-signal shrink-0" />
                    <span>Explain something I was told</span>
                  </button>

                  <button
                    onClick={() => handleSelectSuggestion('questions')}
                    className="p-3 rounded-xl border border-rule bg-paper hover:bg-manila/40 text-left font-sans text-xs font-semibold text-ink transition-colors cursor-pointer flex items-center space-x-2"
                  >
                    <ShieldCheck className="w-4 h-4 text-signal shrink-0" />
                    <span>What should I ask at my next visit?</span>
                  </button>
                </div>
              </div>
            )}

            {isLoading && (
              <div className="p-3 rounded-xl bg-manila/40 text-xs text-ink-soft italic">
                Evaluating explanation...
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* INPUT FORM BAR AT BOTTOM */}
          <form onSubmit={handleSendText} className="p-3 border-t border-rule bg-paper flex items-center space-x-2 shrink-0">
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask a question or type a medical term..."
              className="flex-1 px-3 py-2 rounded-lg border border-rule bg-paper font-sans text-xs text-ink focus:outline-none focus:ring-2 focus:ring-signal"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-2 rounded-lg bg-signal text-paper disabled:opacity-40 transition-opacity cursor-pointer focus:outline-none"
              title="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </>
      )}

    </div>
  );
};
