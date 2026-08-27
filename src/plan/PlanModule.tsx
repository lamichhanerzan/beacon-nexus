import React, { useState } from 'react';
import { usePlanStore, getSectionCompletion } from './store';
import type { PlanSectionId } from './types';
import { PLAN_SECTIONS } from './types';
import { SituationSection } from './sections/SituationSection';
import { CostSection } from './sections/CostSection';
import { DiagnosisSection } from './sections/DiagnosisSection';
import { AppointmentsSection } from './sections/AppointmentsSection';
import { LifeSection } from './sections/LifeSection';
import { ResourcesSection } from './sections/ResourcesSection';
import { WhatWeNeverAsk } from './components/WhatWeNeverAsk';
import { DEMO_UNINSURED, DEMO_UNCAPPED_MEDICARE } from './content/demoProfiles';
import {
  ClipboardList, DollarSign, BookOpen, Calendar, Briefcase,
  FolderOpen, Shield, Trash2, Menu, X, ChevronRight,
} from 'lucide-react';

const SECTION_ICONS: Record<string, React.ReactNode> = {
  situation: <ClipboardList className="w-5 h-5" />,
  cost: <DollarSign className="w-5 h-5" />,
  diagnosis: <BookOpen className="w-5 h-5" />,
  appointments: <Calendar className="w-5 h-5" />,
  life: <Briefcase className="w-5 h-5" />,
  resources: <FolderOpen className="w-5 h-5" />,
};

function renderSection(id: PlanSectionId): React.ReactNode {
  switch (id) {
    case 'situation': return <SituationSection />;
    case 'cost': return <CostSection />;
    case 'diagnosis': return <DiagnosisSection />;
    case 'appointments': return <AppointmentsSection />;
    case 'life': return <LifeSection />;
    case 'resources': return <ResourcesSection />;
    case 'privacy': return <WhatWeNeverAsk />;
    default: return null;
  }
}

export const PlanModule: React.FC = () => {
  const { profile, activeSection, setActiveSection, clearAll, setFields } = usePlanStore();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  const handleClear = () => {
    if (confirmClear) {
      sessionStorage.removeItem('beacon-plan-store');
      clearAll();
      setConfirmClear(false);
    } else {
      setConfirmClear(true);
      setTimeout(() => setConfirmClear(false), 4000);
    }
  };

  const handleSectionClick = (id: PlanSectionId) => {
    setActiveSection(id);
    setMobileNavOpen(false);
  };

  const currentSection = activeSection === 'privacy'
    ? { id: 'privacy' as const, label: 'What we never ask you', description: '' }
    : PLAN_SECTIONS.find((s) => s.id === activeSection);

  return (
    <div className="w-full max-w-[95vw] mx-auto flex flex-col lg:flex-row gap-0 lg:gap-8 min-h-[80vh]">

      {/* ---- MOBILE TOP BAR ---- */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-[#E4E1DA]">
        <button
          onClick={() => setMobileNavOpen(!mobileNavOpen)}
          className="inline-flex items-center space-x-2 text-[#1C1B19] font-sans text-sm font-bold cursor-pointer bg-transparent border-0 p-0"
        >
          {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          <span>{currentSection?.label || 'My Plan'}</span>
        </button>
      </div>

      {/* ---- MOBILE NAV DRAWER ---- */}
      {mobileNavOpen && (
        <div className="lg:hidden bg-white border-b border-[#E4E1DA] px-4 py-4 space-y-1 animate-in fade-in duration-200">
          {PLAN_SECTIONS.map((section) => {
            const comp = getSectionCompletion(profile, section.id);
            const isCurrent = activeSection === section.id;
            return (
              <button
                key={section.id}
                onClick={() => handleSectionClick(section.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-sans text-sm transition-colors cursor-pointer border-0 ${
                  isCurrent ? 'bg-[#2F5D50]/10 text-[#2F5D50] font-bold' : 'text-[#1C1B19] hover:bg-[#FAF9F6]'
                }`}
              >
                <div className="flex items-center space-x-3">
                  {SECTION_ICONS[section.id]}
                  <span>{section.label}</span>
                </div>
                {comp.total > 0 && (
                  <span className="text-xs text-[#5A5751]">{comp.answered}/{comp.total}</span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* ---- DESKTOP SIDEBAR ---- */}
      <aside className="hidden lg:flex lg:flex-col lg:w-[280px] lg:shrink-0 lg:sticky lg:top-4 lg:self-start lg:max-h-[calc(100vh-2rem)] bg-white border border-[#E4E1DA] rounded-2xl p-5 space-y-1">
        <div className="pb-4 border-b border-[#E4E1DA] mb-2">
          <h2 className="font-serif text-xl font-bold text-[#1C1B19] m-0" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>
            My Plan
          </h2>
          <p className="text-xs text-[#5A5751] mt-1 m-0">Your personalized guide</p>
        </div>

        {PLAN_SECTIONS.map((section) => {
          const comp = getSectionCompletion(profile, section.id);
          const isCurrent = activeSection === section.id;
          return (
            <button
              key={section.id}
              onClick={() => handleSectionClick(section.id)}
              className={`w-full flex items-center justify-between px-3 py-3 rounded-xl font-sans text-sm transition-all cursor-pointer border-0 ${
                isCurrent
                  ? 'bg-[#2F5D50] text-white font-bold shadow-sm'
                  : 'text-[#1C1B19] hover:bg-[#FAF9F6]'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <span className={isCurrent ? 'text-white' : 'text-[#5A5751]'}>{SECTION_ICONS[section.id]}</span>
                <span>{section.label}</span>
              </div>
              <div className="flex items-center space-x-2">
                {comp.total > 0 && (
                  <span className={`text-xs ${
                    isCurrent ? 'text-white/70' : comp.answered === comp.total ? 'text-[#2F5D50]' : 'text-[#5A5751]/60'
                  }`}>
                    {comp.answered}/{comp.total}
                  </span>
                )}
                <ChevronRight className={`w-3.5 h-3.5 ${isCurrent ? 'text-white/60' : 'text-[#E4E1DA]'}`} />
              </div>
            </button>
          );
        })}

        {/* Privacy link */}
        <button
          onClick={() => handleSectionClick('privacy')}
          className={`w-full flex items-center space-x-2.5 px-3 py-3 rounded-xl font-sans text-sm cursor-pointer border-0 mt-3 ${
            activeSection === 'privacy'
              ? 'bg-[#2F5D50] text-white font-bold'
              : 'text-[#5A5751] hover:bg-[#FAF9F6]'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>What we never ask you</span>
        </button>

        {/* Demo profiles (only in DEV mode) */}
        {import.meta.env.DEV && (
          <div className="pt-4 border-t border-[#E4E1DA] space-y-2 mt-4">
            <span className="text-[10px] font-mono text-[#5A5751]/60 uppercase tracking-widest block font-bold">Demo Profiles</span>
            <button
              onClick={() => setFields(DEMO_UNINSURED)}
              className="w-full text-left px-3 py-1.5 rounded-lg font-sans text-xs font-semibold text-[#2F5D50] bg-[#2F5D50]/5 hover:bg-[#2F5D50]/15 cursor-pointer border-0"
            >
              Load Uninsured Demo
            </button>
            <button
              onClick={() => setFields(DEMO_UNCAPPED_MEDICARE)}
              className="w-full text-left px-3 py-1.5 rounded-lg font-sans text-xs font-semibold text-[#2F5D50] bg-[#2F5D50]/5 hover:bg-[#2F5D50]/15 cursor-pointer border-0"
            >
              Load Uncapped Medicare Demo
            </button>
          </div>
        )}

        {/* Clear */}
        <div className="pt-4 mt-auto border-t border-[#E4E1DA]">
          <button
            onClick={handleClear}
            className={`w-full flex items-center justify-center space-x-2 px-3 py-2.5 rounded-xl font-sans text-sm font-semibold cursor-pointer border-0 transition-colors ${
              confirmClear
                ? 'bg-[#8C2F1E] text-white'
                : 'text-[#8C2F1E] hover:bg-[#FDF4F2]'
            }`}
          >
            <Trash2 className="w-4 h-4" />
            <span>{confirmClear ? 'Confirm clear' : 'Clear my answers'}</span>
          </button>
        </div>
      </aside>

      {/* ---- MAIN CONTENT ---- */}
      <main className="flex-1 min-w-0 px-4 sm:px-0 py-6 lg:py-0">
        {renderSection(activeSection)}

        {/* Persistent footer disclaimer */}
        <div className="mt-12 pt-6 border-t border-[#E4E1DA]">
          <p className="text-xs text-[#5A5751]/70 leading-relaxed m-0 max-w-2xl">
            This tool explains guidelines and costs. It does not give medical advice and cannot tell you what will happen with your cancer. Always confirm with your care team.
          </p>
          <p className="text-xs text-[#5A5751]/50 mt-2 m-0 font-mono" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            2026 plan year figures
          </p>
        </div>
      </main>
    </div>
  );
};
