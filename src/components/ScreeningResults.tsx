import React, { useState } from 'react';
import type { ScreeningResult, ScreeningInput } from '../lib/screening';
import { findMatchingFacilities } from '../lib/facilities';
import { Printer, Share2, ExternalLink, ChevronDown, ChevronUp, ShieldCheck, HeartHandshake, BookOpen } from 'lucide-react';

interface ScreeningResultsProps {
  input: ScreeningInput;
  results: ScreeningResult[];
  mode: 'patient' | 'caregiver';
  onEditInputs: () => void;
}

const READING_LIST = [
  {
    source: 'National Cancer Institute',
    title: 'NCI Cancer Screening Overview',
    url: 'https://www.cancer.gov/about-cancer/screening',
    description: 'Evidence-based summaries on screening benefits, risks, and recommended testing guidelines.'
  },
  {
    source: 'American Cancer Society',
    title: 'ACS Cancer Screening Guidelines by Age',
    url: 'https://www.cancer.org/healthy/find-cancer-early/screening-recommendations-by-age.html',
    description: 'Clear breakdown of which cancer screening tests to get throughout adulthood.'
  },
  {
    source: 'Centers for Disease Control and Prevention',
    title: 'CDC Cancer Prevention & Control',
    url: 'https://www.cdc.gov/cancer/prevention/index.html',
    description: 'Public health guidance on lowering cancer risk and staying up to date on screenings.'
  },
  {
    source: 'U.S. Preventive Services Task Force',
    title: 'USPSTF Published Recommendations',
    url: 'https://www.uspreventiveservicestaskforce.org/uspstf/recommendation-topics/uspstf-a-and-b-recommendations',
    description: 'The authoritative national scientific panel recommendations for preventive screening.'
  },
  {
    source: 'Louisiana Department of Health',
    title: 'Louisiana Breast & Cervical Health Program',
    url: 'https://www.lbchp.org/',
    description: 'Statewide program offering no-cost mammograms and Pap tests for qualifying Louisiana residents.'
  }
];

function getStatusBadge(status: string) {
  switch (status) {
    case 'due':
      return (
        <span className="font-clinical text-xs font-bold px-3 py-1 rounded bg-signal text-paper uppercase">
          DUE
        </span>
      );
    case 'discuss':
      return (
        <span className="font-clinical text-xs font-bold px-3 py-1 rounded bg-[#856828] text-paper uppercase">
          DISCUSS
        </span>
      );
    case 'eligible':
      return (
        <span className="font-clinical text-xs font-bold px-3 py-1 rounded bg-blue-700 text-paper uppercase">
          ELIGIBLE
        </span>
      );
    case 'up_to_date':
      return (
        <span className="font-clinical text-xs font-bold px-3 py-1 rounded bg-ink-soft text-paper uppercase">
          UP TO DATE
        </span>
      );
    default:
      return (
        <span className="font-clinical text-xs font-bold px-3 py-1 rounded bg-gray-200 text-gray-800 uppercase">
          NOT APPLICABLE
        </span>
      );
  }
}

export const ScreeningResults: React.FC<ScreeningResultsProps> = ({
  input,
  results,
  mode,
  onEditInputs
}) => {
  const isCaregiver = mode === 'caregiver';
  const [showNotApplicable, setShowNotApplicable] = useState(false);
  const [copied, setCopied] = useState(false);

  const matchedFacilities = findMatchingFacilities(input.zip, input.parishSlug);

  // Group results by status
  const dueList = results.filter((r) => r.status === 'due');
  const discussList = results.filter((r) => r.status === 'discuss');
  const eligibleList = results.filter((r) => r.status === 'eligible');
  const upToDateList = results.filter((r) => r.status === 'up_to_date');
  const notApplicableList = results.filter((r) => r.status === 'not_applicable');

  const totalDueCount = dueList.length;

  const handleCopyShareLink = async () => {
    const origin = window.location.origin;
    const params = new URLSearchParams();
    params.set('a', input.age.toString());
    params.set('s', input.sex);
    params.set('sm', input.smokingStatus);
    if (input.packYears) params.set('py', input.packYears.toString());
    if (input.yearsSinceQuit) params.set('yq', input.yearsSinceQuit.toString());
    if (input.familyHistory.length > 0) params.set('fh', input.familyHistory.join(','));
    if (input.zip) params.set('z', input.zip);
    if (input.parishSlug) params.set('p', input.parishSlug);

    const shareUrl = `${origin}/screening?${params.toString()}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: 'BEACON Screening Eligibility Summary',
          text: 'Here is the cancer screening eligibility summary based on national USPSTF guidelines.',
          url: shareUrl
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch (err) {
      console.log('Share canceled or failed:', err);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 space-y-8 animate-in fade-in duration-300 print:p-0">
      
      {/* Header Banner */}
      <div className="bg-manila border-2 border-manila-deep rounded-2xl p-6 sm:p-8 shadow-sm space-y-3 print:bg-white print:border-b-2 print:border-black print:p-0">
        <div className="flex items-center justify-between">
          <span className="font-clinical text-xs font-bold text-signal uppercase tracking-wider">
            USPSTF National Guidelines Check
          </span>
          <button
            onClick={onEditInputs}
            className="text-xs font-semibold text-signal hover:underline cursor-pointer print:hidden"
          >
            Edit Inputs
          </button>
        </div>

        <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-ink leading-tight m-0">
          {totalDueCount > 0
            ? `${isCaregiver ? "They're" : "You're"} currently due for ${totalDueCount} screening(s).`
            : `${isCaregiver ? "They appear" : "You appear"} up to date on the screenings ${isCaregiver ? "they're" : "you're"} eligible for.`}
        </h1>

        <p className="text-sm sm:text-base text-ink-soft m-0">
          Evaluated for a {input.age}-year-old {input.sex === 'unspecified' ? 'individual' : input.sex}.
        </p>
      </div>

      {/* Cost Block */}
      <div className="p-5 rounded-xl border border-rule bg-paper shadow-xs space-y-2 print:border-black">
        <h3 className="font-display text-lg font-bold text-ink m-0 flex items-center space-x-2">
          <ShieldCheck className="w-5 h-5 text-signal" />
          <span>Most of these are free.</span>
        </h3>
        <p className="text-base text-ink leading-relaxed m-0">
          Under the Affordable Care Act, most insurance plans cover preventive cancer screening with no copay. If you're uninsured, Louisiana's Breast and Cervical Health Program covers mammograms and Pap tests for people who qualify — <strong className="font-clinical text-signal font-bold">1-888-599-1073</strong>.
        </p>
      </div>

      {/* Caregiver Action Block (if mode === 'caregiver') */}
      {isCaregiver && (
        <div className="p-5 rounded-xl border-2 border-signal bg-signal-light/40 space-y-2 print:border-black">
          <h3 className="font-display text-lg font-bold text-signal m-0 flex items-center space-x-2">
            <HeartHandshake className="w-5 h-5" />
            <span>What you can do</span>
          </h3>
          <p className="text-base text-ink leading-relaxed m-0">
            Offer to make the appointment call. People often put off screening because scheduling feels like a hurdle, not because they don't want to go. If travel is the barrier, ask about the at-home stool test.
          </p>
        </div>
      )}

      {/* SCREENING CARDS (due -> discuss -> eligible -> up_to_date -> not_applicable) */}
      <div className="space-y-6">
        
        {/* 1. DUE */}
        {dueList.map((item) => (
          <ScreeningCard
            key={item.id}
            item={item}
            matchedFacilities={matchedFacilities}
            zip={input.zip}
            parishSlug={input.parishSlug}
            isCaregiver={isCaregiver}
          />
        ))}

        {/* 2. DISCUSS */}
        {discussList.map((item) => (
          <ScreeningCard
            key={item.id}
            item={item}
            matchedFacilities={matchedFacilities}
            zip={input.zip}
            parishSlug={input.parishSlug}
            isCaregiver={isCaregiver}
          />
        ))}

        {/* 3. ELIGIBLE */}
        {eligibleList.map((item) => (
          <ScreeningCard
            key={item.id}
            item={item}
            matchedFacilities={matchedFacilities}
            zip={input.zip}
            parishSlug={input.parishSlug}
            isCaregiver={isCaregiver}
          />
        ))}

        {/* 4. UP TO DATE */}
        {upToDateList.map((item) => (
          <ScreeningCard
            key={item.id}
            item={item}
            matchedFacilities={matchedFacilities}
            zip={input.zip}
            parishSlug={input.parishSlug}
            isCaregiver={isCaregiver}
          />
        ))}

        {/* 5. NOT APPLICABLE (Collapsed under expander) */}
        {notApplicableList.length > 0 && (
          <div className="border border-rule rounded-xl overflow-hidden bg-paper/60 print:bg-white print:border-black">
            <button
              onClick={() => setShowNotApplicable(!showNotApplicable)}
              className="w-full p-4 flex items-center justify-between text-left font-sans font-semibold text-base text-ink-soft hover:text-ink transition-colors cursor-pointer print:hidden"
            >
              <span>Not applicable to {isCaregiver ? 'them' : 'you'} ({notApplicableList.length})</span>
              {showNotApplicable ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>

            <div className={`p-4 space-y-4 border-t border-rule ${showNotApplicable ? 'block' : 'hidden print:block'}`}>
              {notApplicableList.map((item) => (
                <ScreeningCard
                  key={item.id}
                  item={item}
                  matchedFacilities={matchedFacilities}
                  zip={input.zip}
                  parishSlug={input.parishSlug}
                  isCaregiver={isCaregiver}
                />
              ))}
            </div>
          </div>
        )}

      </div>

      {/* WORTH READING SECTION */}
      <div className="p-6 rounded-xl border border-rule bg-paper shadow-xs space-y-4 print:border-black">
        <h3 className="font-display text-xl font-bold text-ink m-0 flex items-center space-x-2">
          <BookOpen className="w-5 h-5 text-signal" />
          <span>Worth reading</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {READING_LIST.map((article, aIdx) => (
            <a
              key={aIdx}
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-4 rounded-lg border border-rule bg-paper hover:bg-manila/30 transition-colors group space-y-1.5"
            >
              <div className="font-clinical text-[11px] font-bold text-signal uppercase tracking-wider flex items-center justify-between">
                <span>{article.source}</span>
                <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <div className="font-sans font-bold text-base text-ink group-hover:text-signal transition-colors">
                {article.title}
              </div>
              <p className="text-xs text-ink-soft m-0 leading-relaxed">
                {article.description}
              </p>
            </a>
          ))}
        </div>
      </div>

      {/* STATEWIDE RESOURCES BLOCK */}
      <div className="p-6 rounded-xl border border-rule bg-paper shadow-xs space-y-4 print:border-black">
        <h3 className="font-display text-xl font-bold text-ink m-0">
          Louisiana Statewide Screening & Healthcare Resources
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans text-sm text-ink border-collapse">
            <thead>
              <tr className="border-b border-rule font-clinical uppercase text-xs text-ink-soft">
                <th className="py-2 pr-4">Name</th>
                <th className="py-2 px-4">Phone</th>
                <th className="py-2 pl-4">What it does</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rule/60">
              <tr>
                <td className="py-3 pr-4 font-semibold">Louisiana Breast & Cervical Health Program</td>
                <td className="py-3 px-4 font-clinical font-bold text-signal">1-888-599-1073</td>
                <td className="py-3 pl-4 text-ink-soft">Free mammograms and Pap tests for qualifying residents</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-semibold">American Cancer Society</td>
                <td className="py-3 px-4 font-clinical font-bold text-signal">1-800-227-2345</td>
                <td className="py-3 pl-4 text-ink-soft">24/7 information, rides, lodging</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-semibold">Louisiana 211</td>
                <td className="py-3 px-4 font-clinical font-bold text-signal">211</td>
                <td className="py-3 pl-4 text-ink-soft">Local health and social services, all 64 parishes</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="text-xs font-clinical text-ink-soft text-right m-0 italic">
          Last reviewed August 2026. Please verify current details by calling.
        </p>
      </div>

      {/* Mandatory Screening Results Disclaimer (One of exactly two disclaimers in the app) */}
      <div className="p-4 rounded-lg border border-rule/60 bg-paper/50 text-xs text-ink-soft italic leading-relaxed">
        *Based on national screening guidelines from the U.S. Preventive Services Task Force. This doesn't tell you whether you have cancer — only which tests you're eligible for. Your doctor may recommend something different based on your history.
      </div>

      {/* Bottom Actions: Print & Share */}
      <div className="flex flex-col sm:flex-row gap-4 pt-2 print:hidden">
        <button
          onClick={() => window.print()}
          className="flex-1 inline-flex items-center justify-center space-x-2 py-3.5 px-6 rounded-xl font-sans text-base font-semibold bg-manila hover:bg-manila-deep text-ink transition-colors border border-rule cursor-pointer"
        >
          <Printer className="w-5 h-5 text-signal" />
          <span>Print This List</span>
        </button>

        <button
          onClick={handleCopyShareLink}
          className="flex-1 inline-flex items-center justify-center space-x-2 py-3.5 px-6 rounded-xl font-sans text-base font-semibold bg-signal text-paper hover:bg-signal/90 transition-colors shadow-xs cursor-pointer"
        >
          {copied ? (
            <span>Link Copied!</span>
          ) : (
            <>
              <Share2 className="w-5 h-5" />
              <span>Share With Someone</span>
            </>
          )}
        </button>
      </div>

    </div>
  );
};

/* INDIVIDUAL SCREENING RESULT CARD COMPONENT */
interface ScreeningCardProps {
  item: ScreeningResult;
  matchedFacilities: ReturnType<typeof findMatchingFacilities>;
  zip?: string;
  parishSlug?: string;
  isCaregiver?: boolean;
}

const ScreeningCard: React.FC<ScreeningCardProps> = ({ item, matchedFacilities, zip, parishSlug, isCaregiver }) => {
  const reasonText = isCaregiver
    ? item.reason.replace(/\bYou are\b/gi, 'They are').replace(/\bYou have\b/gi, 'They have').replace(/\bYou indicated\b/gi, 'They indicated').replace(/\bYour\b/gi, 'Their').replace(/\bYou\b/gi, 'They')
    : item.reason;

  return (
    <div className="p-6 rounded-xl border border-rule bg-paper shadow-xs space-y-4 print:border-black print:p-4 print:shadow-none break-inside-avoid">
      <div className="flex items-start justify-between gap-4 border-b border-rule/60 pb-3">
        <h3 className="font-display text-xl font-bold text-ink m-0">
          {item.name}
        </h3>
        {getStatusBadge(item.status)}
      </div>

      <p className="text-base text-ink leading-relaxed m-0 font-medium">
        {reasonText}
      </p>

      {/* Colorectal Options if present */}
      {item.options && item.options.length > 0 && (
        <div className="p-4 rounded-lg bg-manila/30 border border-rule space-y-2">
          <h4 className="font-sans font-semibold text-sm text-ink m-0">
            Test options available:
          </h4>
          <ul className="list-disc list-inside text-sm text-ink space-y-1.5 m-0 pl-1">
            {item.options.map((opt, oIdx) => (
              <li key={oIdx}>{opt}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Notes if present */}
      {item.notes && (
        <p className="text-sm text-ink-soft italic m-0">
          {item.notes}
        </p>
      )}

      {/* USPSTF Guideline Line */}
      <div className="pt-2 border-t border-rule/60 text-xs font-clinical text-ink-soft">
        <strong>Source:</strong> {item.guideline}
      </div>

      {/* Facility Matching / Where to Go Block */}
      {item.id === 'breast' ? (
        <div className="p-4 rounded-lg bg-paper border border-rule space-y-3">
          <h4 className="font-sans font-semibold text-sm text-ink m-0">
            Where to go for mammography {zip ? `near ${zip}` : parishSlug ? `in ${parishSlug} Parish` : 'in Louisiana'}:
          </h4>
          <div className="space-y-2">
            {matchedFacilities.map((mf, fIdx) => (
              <div key={fIdx} className="flex flex-col sm:flex-row sm:items-center justify-between text-xs p-2 rounded bg-manila/20 gap-1">
                <div>
                  <span className="font-semibold text-ink">{mf.facility.name}</span> — {mf.facility.address}, {mf.facility.city} ({mf.facility.zip})
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-clinical font-bold text-signal">{mf.matchLabel}</span>
                  <a href={`tel:${mf.facility.phone.replace(/\D/g, '')}`} className="font-clinical font-bold text-signal hover:underline">
                    {mf.facility.phone}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-lg bg-paper border border-rule space-y-2 text-xs text-ink">
          <h4 className="font-sans font-semibold text-sm text-ink m-0">
            Where to go:
          </h4>
          <p className="m-0 leading-relaxed text-ink-soft">
            Ask {isCaregiver ? 'their' : 'your'} primary care provider, or find a community health center near you. They serve everyone regardless of ability to pay, on a sliding scale.
          </p>
          <div className="flex flex-wrap items-center gap-4 pt-1">
            <a
              href="https://findahealthcenter.hrsa.gov"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1 font-clinical font-bold text-signal hover:underline"
            >
              <span>Find a Health Center</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <span className="text-ink-soft">•</span>
            <span className="font-clinical">Call <strong>Louisiana 211</strong> — dial 211</span>
          </div>
        </div>
      )}

    </div>
  );
};
