import React, { useState, useRef, useEffect } from 'react';
import { BeaconLogo } from './BeaconLogo';
import { APPOINTMENT_TYPES } from '../content/appointments';
import type { UserAppointment } from './AppointmentForm';
import { formatCaregiverText } from '../lib/caregiverGrammar';
import { Send, Calendar, ShieldCheck, AlertCircle, HelpCircle, Check, Clock, Activity, MessageSquare } from 'lucide-react';

interface AssistantWindowProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'patient' | 'caregiver';
  onAddAppointment: (appt: UserAppointment) => void;
  onOpenPrepSheet: (appt: UserAppointment) => void;
  onNavigate: (route: 'screening' | 'journey' | 'facilities') => void;
}

type WindowSize = 'compact' | 'expanded' | 'minimized';
type ActiveTab = 'chat' | 'recent';

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
  },
  staging: {
    summary: 'Staging describes the extent and spread of a cancer, using a standardized system (usually TNM) that measures tumor size, lymph node involvement, and whether it has spread to other organs.',
    questions: [
      'What stage was assigned, and what does each letter-number mean?',
      'Are there any additional staging tests still pending?',
      'How does the staging result affect which treatments are offered?'
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
  const [activeTab, setActiveTab] = useState<ActiveTab>('chat');
  const [inputText, setInputText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Scripted conversation history
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatHistory, setChatHistory] = useState<Array<{ id: string; preview: string; timestamp: string }>>([]);
  const [bookingState, setBookingState] = useState<{
    typeId?: string;
    date?: string;
    time?: string;
    doctorName?: string;
  }>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

  // Keyboard Escape listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCloseWindow = () => onClose();
  const handleMinimizeWindow = () => setWindowSize(windowSize === 'minimized' ? 'compact' : 'minimized');
  const handleToggleExpandWindow = () => setWindowSize(windowSize === 'expanded' ? 'compact' : 'expanded');

  // Handle new chat
  const handleNewChat = () => {
    if (messages.length > 1) {
      const preview = messages.find((m) => m.sender === 'user')?.text || 'New conversation';
      setChatHistory((prev) => [
        { id: `chat_${Date.now()}`, preview, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
        ...prev
      ]);
    }
    setMessages([]);
    setBookingState({});
    setActiveTab('chat');
  };

  // Handle User Choice: Suggestion Chips
  const handleSelectSuggestion = (choice: string) => {
    if (choice === 'book') {
      startBookingFlow();
    } else if (choice === 'explain') {
      const userMsg: ChatMessage = { id: `u_${Date.now()}`, sender: 'user', text: 'Explain a medical term I was told' };
      const botMsg: ChatMessage = { id: `b_${Date.now()}`, sender: 'assistant', text: 'Type any medical term or phrase you were told (for example: "biopsy", "pathology margin", "BI-RADS"). I will give you a plain-language explanation and 3 questions to ask your doctor.' };
      setMessages((prev) => [...prev, userMsg, botMsg]);
    } else if (choice === 'questions') {
      const userMsg: ChatMessage = { id: `u_${Date.now()}`, sender: 'user', text: 'What should I ask at my next visit?' };
      const botMsg: ChatMessage = { id: `b_${Date.now()}`, sender: 'assistant', text: 'Select your appointment type to view specialized questions and clinical rationales:', type: 'booking_step', bookingState: { step: 'type' } };
      setMessages((prev) => [...prev, userMsg, botMsg]);
    } else if (choice === 'screening') {
      onNavigate('screening');
      const userMsg: ChatMessage = { id: `u_${Date.now()}`, sender: 'user', text: 'Check my screening eligibility' };
      const botMsg: ChatMessage = { id: `b_${Date.now()}`, sender: 'assistant', text: 'Opening the Screening Module now...' };
      setMessages((prev) => [...prev, userMsg, botMsg]);
    } else if (choice === 'journey') {
      onNavigate('journey');
      const userMsg: ChatMessage = { id: `u_${Date.now()}`, sender: 'user', text: 'Open my diagnostic journey' };
      const botMsg: ChatMessage = { id: `b_${Date.now()}`, sender: 'assistant', text: 'Opening the Diagnostic Journey view...' };
      setMessages((prev) => [...prev, userMsg, botMsg]);
    }
  };

  // SCRIPTED BOOKING FLOW
  const startBookingFlow = () => {
    setBookingState({});
    const userMsg: ChatMessage = { id: `u_${Date.now()}`, sender: 'user', text: 'Book an appointment' };
    const botMsg: ChatMessage = {
      id: `b_${Date.now()}`, sender: 'assistant',
      text: isCaregiver ? "Let's get it on their calendar. What kind of appointment is it for them?" : "Let's get it on your calendar. What kind of appointment is it?",
      type: 'booking_step', bookingState: { step: 'type' }
    };
    setMessages((prev) => [...prev, userMsg, botMsg]);
  };

  const handleSelectApptType = (typeId: string) => {
    const typeObj = APPOINTMENT_TYPES.find((t) => t.id === typeId);
    setBookingState((prev) => ({ ...prev, typeId }));
    const userMsg: ChatMessage = { id: `u_${Date.now()}`, sender: 'user', text: `Selected: ${typeObj?.label}` };
    const botMsg: ChatMessage = { id: `b_${Date.now()}`, sender: 'assistant', text: 'When is it?', type: 'booking_step', bookingState: { step: 'date', typeId } };
    setMessages((prev) => [...prev, userMsg, botMsg]);
  };

  const handleSelectDate = (dateVal: string) => {
    setBookingState((prev) => ({ ...prev, date: dateVal }));
    const userMsg: ChatMessage = { id: `u_${Date.now()}`, sender: 'user', text: `Date: ${dateVal}` };
    const botMsg: ChatMessage = { id: `b_${Date.now()}`, sender: 'assistant', text: 'What time? You can skip this.', type: 'booking_step', bookingState: { step: 'time', typeId: bookingState.typeId, date: dateVal } };
    setMessages((prev) => [...prev, userMsg, botMsg]);
  };

  const handleSelectTime = (timeVal?: string) => {
    setBookingState((prev) => ({ ...prev, time: timeVal }));
    const userMsg: ChatMessage = { id: `u_${Date.now()}`, sender: 'user', text: timeVal ? `Time: ${timeVal}` : 'Skipped time' };
    const botMsg: ChatMessage = { id: `b_${Date.now()}`, sender: 'assistant', text: "Anything to note about who it's with? This stays on your device and is never shared.", type: 'booking_step', bookingState: { step: 'doctor', typeId: bookingState.typeId, date: bookingState.date, time: timeVal } };
    setMessages((prev) => [...prev, userMsg, botMsg]);
  };

  const handleSelectDoctor = (doctorVal?: string) => {
    const finalState = { ...bookingState, doctorName: doctorVal };
    setBookingState(finalState);
    const userMsg: ChatMessage = { id: `u_${Date.now()}`, sender: 'user', text: doctorVal ? `With: ${doctorVal}` : 'Skipped physician name' };
    const botMsg: ChatMessage = { id: `b_${Date.now()}`, sender: 'assistant', text: 'Here is your appointment summary:', type: 'confirmation_card', bookingState: { step: 'confirm', typeId: finalState.typeId, date: finalState.date, time: finalState.time, doctorName: finalState.doctorName } };
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
    const botMsg: ChatMessage = { id: `b_${Date.now()}`, sender: 'assistant', text: "Added. I've put together a prep sheet for this appointment — questions to ask and what to bring.", type: 'booking_step', bookingState: { step: 'done', createdAppt: newAppt } };
    setMessages((prev) => [...prev, botMsg]);
  };

  // HANDLE USER TEXT INPUT
  const handleSendText = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = inputText.trim();
    if (!query) return;
    setInputText('');
    const userMsg: ChatMessage = { id: `u_${Date.now()}`, sender: 'user', text: query };
    setMessages((prev) => [...prev, userMsg]);
    const lowerQuery = query.toLowerCase();

    if (lowerQuery.includes('screening') || lowerQuery.includes('due') || lowerQuery.includes('check')) {
      onNavigate('screening');
      setMessages((prev) => [...prev, { id: `b_${Date.now()}`, sender: 'assistant', text: 'Opening the Screening Module...' }]);
      return;
    }
    if (lowerQuery.includes('book') || lowerQuery.includes('appointment') || lowerQuery.includes('schedule')) {
      startBookingFlow();
      return;
    }
    if (lowerQuery.includes('clinic') || lowerQuery.includes('facility') || lowerQuery.includes('where do i go')) {
      onNavigate('facilities');
      setMessages((prev) => [...prev, { id: `b_${Date.now()}`, sender: 'assistant', text: 'Opening Healthcare Resources...' }]);
      return;
    }
    if (lowerQuery.includes('do i have cancer') || lowerQuery.includes('will i survive') || lowerQuery.includes('what is my stage')) {
      setMessages((prev) => [...prev, { id: `b_${Date.now()}`, sender: 'assistant', text: 'BEACON cannot evaluate individual medical diagnoses, survival estimates, or treatment decisions. Please discuss these directly with your physician.' }]);
      return;
    }

    setIsLoading(true);
    let matchedData = GLOSSARY_TERMS['biopsy'];
    Object.keys(GLOSSARY_TERMS).forEach((term) => { if (lowerQuery.includes(term)) matchedData = GLOSSARY_TERMS[term]; });

    setTimeout(() => {
      setIsLoading(false);
      setMessages((prev) => [...prev, { id: `b_${Date.now()}`, sender: 'assistant', type: 'explanation', explanationData: { summary: matchedData.summary, questions: matchedData.questions, isGenerated: true } }]);
    }, 600);
  };

  // Size classes — TALLER ratio, not wider
  const sizeClasses =
    windowSize === 'minimized'
      ? 'w-80 h-14 overflow-hidden'
      : windowSize === 'expanded'
      ? 'w-[420px] h-[85vh] max-h-[900px] max-w-[95vw]'
      : 'w-[380px] h-[75vh] max-h-[750px] max-w-[95vw]';

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 bg-paper border-2 border-rule/80 rounded-2xl shadow-2xl flex flex-col transition-all duration-200 overflow-hidden ${sizeClasses} max-sm:fixed max-sm:inset-x-2 max-sm:bottom-2 max-sm:top-12 max-sm:w-auto max-sm:h-auto max-sm:rounded-2xl`}
      role="dialog"
      aria-label="BEACON Assistant Window"
    >
      {/* DARK TITLE BAR with oval window controls */}
      <div className="bg-[#1E1E1E] px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-2.5">
          <BeaconLogo size="sm" showWordmark={false} className="text-paper" />
          <span className="font-display font-bold text-sm text-paper/90 m-0">
            BEACON Assistant
          </span>
        </div>

        {/* Oval Window Controls — macOS style */}
        <div className="flex items-center space-x-2.5 group/dots">
          {/* Close (Red) */}
          <button
            onClick={handleCloseWindow}
            className="w-5 h-3.5 rounded-full bg-[#C4553B] flex items-center justify-center text-[10px] font-bold text-[#1E1E1E] transition-all cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#C4553B] hover:brightness-110"
            title="Close" aria-label="Close"
          >
            <span className="opacity-0 group-hover/dots:opacity-100 transition-opacity">×</span>
          </button>
          {/* Minimize (Yellow) */}
          <button
            onClick={handleMinimizeWindow}
            className="w-5 h-3.5 rounded-full bg-[#D9A441] flex items-center justify-center text-[10px] font-bold text-[#1E1E1E] transition-all cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#D9A441] hover:brightness-110"
            title="Minimize" aria-label="Minimize"
          >
            <span className="opacity-0 group-hover/dots:opacity-100 transition-opacity">−</span>
          </button>
          {/* Expand (Green) */}
          <button
            onClick={handleToggleExpandWindow}
            className="w-5 h-3.5 rounded-full bg-[#4A7C59] flex items-center justify-center text-[10px] font-bold text-[#1E1E1E] transition-all cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#4A7C59] hover:brightness-110"
            title="Expand" aria-label="Expand"
          >
            <span className="opacity-0 group-hover/dots:opacity-100 transition-opacity">{windowSize === 'expanded' ? '−' : '+'}</span>
          </button>
        </div>
      </div>

      {windowSize === 'minimized' ? (
        <div className="px-4 py-2 bg-paper text-xs text-ink-soft italic flex items-center justify-between">
          <span>Assistant minimized</span>
          <button onClick={() => setWindowSize('compact')} className="text-signal font-bold cursor-pointer">Restore</button>
        </div>
      ) : (
        <>
          {/* TAB BAR — Chat / Recent */}
          <div className="bg-[#282828] border-b border-[#3a3a3a] flex items-center shrink-0">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex-1 py-2.5 flex items-center justify-center space-x-1.5 text-xs font-bold cursor-pointer transition-colors ${
                activeTab === 'chat' ? 'text-paper bg-[#333] border-b-2 border-signal' : 'text-paper/50 hover:text-paper/80'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Chat</span>
            </button>
            <button
              onClick={() => setActiveTab('recent')}
              className={`flex-1 py-2.5 flex items-center justify-center space-x-1.5 text-xs font-bold cursor-pointer transition-colors ${
                activeTab === 'recent' ? 'text-paper bg-[#333] border-b-2 border-signal' : 'text-paper/50 hover:text-paper/80'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Recent</span>
            </button>
            <button
              onClick={handleNewChat}
              className="px-3 py-2.5 text-signal text-xs font-bold cursor-pointer hover:text-signal/80 transition-colors"
              title="New chat"
            >
              + New
            </button>
          </div>

          {/* WARNING BANNER */}
          <div className="bg-manila/40 border-b border-rule/60 px-4 py-1.5 text-[11px] text-ink-soft flex items-center space-x-1.5 shrink-0">
            <AlertCircle className="w-3.5 h-3.5 text-signal shrink-0" />
            <span>Don't include names, dates of birth, or record numbers.</span>
          </div>

          {activeTab === 'recent' ? (
            /* RECENT CHATS TAB */
            <div className="flex-1 p-4 overflow-y-auto space-y-2">
              {chatHistory.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <MessageSquare className="w-8 h-8 text-ink-soft/30 mx-auto" />
                  <p className="text-sm text-ink-soft italic m-0">No recent conversations yet.</p>
                  <button onClick={() => setActiveTab('chat')} className="text-signal text-sm font-bold cursor-pointer">Start a chat</button>
                </div>
              ) : (
                chatHistory.map((chat) => (
                  <div
                    key={chat.id}
                    onClick={() => setActiveTab('chat')}
                    className="p-3.5 rounded-xl border border-rule bg-paper hover:bg-manila/20 transition-colors cursor-pointer flex items-center justify-between"
                  >
                    <div className="min-w-0">
                      <div className="font-sans text-sm font-medium text-ink truncate">{chat.preview}</div>
                      <div className="font-clinical text-[10px] text-ink-soft mt-0.5">{chat.timestamp}</div>
                    </div>
                    <MessageSquare className="w-4 h-4 text-ink-soft shrink-0 ml-2" />
                  </div>
                ))
              )}
            </div>
          ) : (
            /* CHAT TAB */
            <>
              <div className="flex-1 p-4 overflow-y-auto space-y-3.5 font-sans text-sm">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                    {msg.text && (
                      <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-ink leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-signal/10 border border-signal/20'
                          : 'bg-manila/50'
                      }`}>
                        <span className="text-[13px]">{formatCaregiverText(msg.text, isCaregiver)}</span>
                      </div>
                    )}

                    {/* Booking step inline controls */}
                    {msg.type === 'booking_step' && msg.bookingState && (
                      <div className="mt-2 w-full max-w-[92%] space-y-2">
                        {msg.bookingState.step === 'type' && (
                          <div className="p-3.5 rounded-xl bg-paper border border-rule space-y-2.5">
                            <span className="font-clinical text-[11px] font-bold text-signal uppercase tracking-wider block">Select Appointment Type:</span>
                            <div className="max-h-52 overflow-y-auto space-y-1.5 pr-1">
                              {APPOINTMENT_TYPES.map((type) => (
                                <button key={type.id} onClick={() => handleSelectApptType(type.id)} className="w-full text-left p-3 rounded-lg border border-rule bg-paper hover:bg-manila/40 font-sans text-[13px] font-semibold text-ink transition-colors cursor-pointer">{type.label}</button>
                              ))}
                            </div>
                          </div>
                        )}
                        {msg.bookingState.step === 'date' && (
                          <div className="p-3.5 rounded-xl bg-paper border border-rule space-y-3">
                            <span className="font-clinical text-[11px] font-bold text-signal uppercase tracking-wider block">Select Date:</span>
                            <input type="date" defaultValue={new Date().toISOString().split('T')[0]} id="inline_date_input" className="w-full px-3 py-2.5 rounded-lg border border-rule bg-paper font-clinical text-sm text-ink focus:outline-none focus:ring-2 focus:ring-signal" />
                            <button onClick={() => { const val = (document.getElementById('inline_date_input') as HTMLInputElement)?.value; handleSelectDate(val || new Date().toISOString().split('T')[0]); }} className="w-full py-2.5 rounded-lg font-sans text-sm font-bold bg-signal text-paper cursor-pointer hover:bg-signal/90 transition-colors">Confirm Date</button>
                          </div>
                        )}
                        {msg.bookingState.step === 'time' && (
                          <div className="p-3.5 rounded-xl bg-paper border border-rule space-y-3">
                            <span className="font-clinical text-[11px] font-bold text-signal uppercase tracking-wider block">Select Time (Optional):</span>
                            <input type="time" id="inline_time_input" className="w-full px-3 py-2.5 rounded-lg border border-rule bg-paper font-clinical text-sm text-ink focus:outline-none focus:ring-2 focus:ring-signal" />
                            <div className="flex gap-2">
                              <button onClick={() => handleSelectTime(undefined)} className="flex-1 py-2.5 rounded-lg font-sans text-sm font-semibold bg-manila hover:bg-manila-deep text-ink cursor-pointer transition-colors">Skip</button>
                              <button onClick={() => { const val = (document.getElementById('inline_time_input') as HTMLInputElement)?.value; handleSelectTime(val || undefined); }} className="flex-1 py-2.5 rounded-lg font-sans text-sm font-bold bg-signal text-paper cursor-pointer hover:bg-signal/90 transition-colors">Confirm</button>
                            </div>
                          </div>
                        )}
                        {msg.bookingState.step === 'doctor' && (
                          <div className="p-3.5 rounded-xl bg-paper border border-rule space-y-3">
                            <span className="font-clinical text-[11px] font-bold text-signal uppercase tracking-wider block">Physician / Facility (Optional):</span>
                            <input type="text" id="inline_doc_input" placeholder="e.g. Dr. Smith" className="w-full px-3 py-2.5 rounded-lg border border-rule bg-paper font-sans text-sm text-ink focus:outline-none focus:ring-2 focus:ring-signal" />
                            <div className="flex gap-2">
                              <button onClick={() => handleSelectDoctor(undefined)} className="flex-1 py-2.5 rounded-lg font-sans text-sm font-semibold bg-manila hover:bg-manila-deep text-ink cursor-pointer transition-colors">Skip</button>
                              <button onClick={() => { const val = (document.getElementById('inline_doc_input') as HTMLInputElement)?.value; handleSelectDoctor(val || undefined); }} className="flex-1 py-2.5 rounded-lg font-sans text-sm font-bold bg-signal text-paper cursor-pointer hover:bg-signal/90 transition-colors">Confirm</button>
                            </div>
                          </div>
                        )}
                        {msg.bookingState.step === 'done' && msg.bookingState.createdAppt && (
                          <button onClick={() => { onOpenPrepSheet(msg.bookingState!.createdAppt!); onClose(); }} className="w-full py-3 rounded-xl font-sans text-sm font-bold bg-signal text-paper shadow-md hover:bg-signal/90 transition-colors cursor-pointer flex items-center justify-center space-x-2">
                            <Calendar className="w-4 h-4" />
                            <span>Open Prep Sheet</span>
                          </button>
                        )}
                      </div>
                    )}

                    {/* Confirmation Card */}
                    {msg.type === 'confirmation_card' && msg.bookingState && (
                      <div className="mt-2 w-full max-w-[92%] p-4 rounded-xl bg-manila/40 border-2 border-manila-deep space-y-3">
                        <span className="font-clinical text-xs font-bold text-signal uppercase tracking-wider block">Appointment Summary</span>
                        <div className="space-y-1.5 text-[13px] text-ink">
                          <div><strong>Type:</strong> {APPOINTMENT_TYPES.find((t) => t.id === msg.bookingState?.typeId)?.label}</div>
                          <div><strong>Date:</strong> {msg.bookingState.date}</div>
                          {msg.bookingState.time && <div><strong>Time:</strong> {msg.bookingState.time}</div>}
                          {msg.bookingState.doctorName && <div><strong>Doctor:</strong> {msg.bookingState.doctorName}</div>}
                        </div>
                        <button onClick={handleConfirmAddToCalendar} className="w-full py-2.5 rounded-xl font-sans text-sm font-bold bg-signal text-paper hover:bg-signal/90 transition-colors cursor-pointer flex items-center justify-center space-x-2">
                          <Check className="w-4 h-4" />
                          <span>Add to Calendar</span>
                        </button>
                      </div>
                    )}

                    {/* Explanation */}
                    {msg.type === 'explanation' && msg.explanationData && (
                      <div className="mt-2 w-full max-w-[92%] p-4 rounded-xl bg-manila/40 border border-rule space-y-3">
                        <p className="text-[13px] text-ink leading-relaxed m-0">{msg.explanationData.summary}</p>
                        <div className="space-y-1.5 pt-2 border-t border-rule/60">
                          <span className="font-clinical text-[11px] font-bold text-signal uppercase tracking-wider block">3 Questions to ask your care team:</span>
                          <ol className="list-decimal list-inside space-y-1 text-xs text-ink">
                            {msg.explanationData.questions.map((q, qIdx) => <li key={qIdx}>{q}</li>)}
                          </ol>
                        </div>
                        <div className="pt-1 text-[10px] font-clinical text-ink-soft italic border-t border-rule/40">*Generated explanation — verify with your care team.</div>
                      </div>
                    )}
                  </div>
                ))}

                {/* 5 SUGGESTED QUESTIONS */}
                {messages.length === 1 && (
                  <div className="space-y-2 pt-3">
                    <span className="font-clinical text-[10px] font-bold text-ink-soft uppercase tracking-widest block">Quick Actions:</span>
                    <div className="flex flex-col space-y-2">
                      {[
                        { key: 'book', icon: <Calendar className="w-4 h-4 text-signal shrink-0" />, label: 'Book an appointment' },
                        { key: 'explain', icon: <HelpCircle className="w-4 h-4 text-signal shrink-0" />, label: 'Explain something I was told' },
                        { key: 'questions', icon: <ShieldCheck className="w-4 h-4 text-signal shrink-0" />, label: 'What should I ask at my next visit?' },
                        { key: 'screening', icon: <Activity className="w-4 h-4 text-signal shrink-0" />, label: 'Check my screening eligibility' },
                        { key: 'journey', icon: <Activity className="w-4 h-4 text-signal shrink-0" />, label: 'Open my diagnostic journey' },
                      ].map((opt) => (
                        <button
                          key={opt.key}
                          onClick={() => handleSelectSuggestion(opt.key)}
                          className="p-3 rounded-xl border border-rule bg-paper hover:bg-manila/30 text-left font-sans text-[13px] font-semibold text-ink transition-colors cursor-pointer flex items-center space-x-2.5 hover:border-manila-deep"
                        >
                          {opt.icon}
                          <span>{opt.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {isLoading && (
                  <div className="p-3 rounded-xl bg-manila/30 text-xs text-ink-soft italic flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-signal animate-pulse" />
                    <span>Thinking...</span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* INPUT BAR */}
              <form onSubmit={handleSendText} className="p-3 border-t border-rule bg-paper flex items-center space-x-2 shrink-0">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Ask a question or type a medical term..."
                  className="flex-1 px-4 py-2.5 rounded-xl border border-rule bg-paper font-sans text-[13px] text-ink focus:outline-none focus:ring-2 focus:ring-signal"
                />
                <button type="submit" disabled={!inputText.trim()} className="p-2.5 rounded-xl bg-signal text-paper disabled:opacity-30 transition-opacity cursor-pointer focus:outline-none" title="Send message">
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          )}
        </>
      )}
    </div>
  );
};
