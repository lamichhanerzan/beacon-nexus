# Cost & Coverage — prototype spec

Part of "My Plan," a module in a patient-facing cancer navigation app. Build only this one section. Stub the rest.

**Hard rule:** never predicts clinical outcomes. No survival, progression, recurrence, or prognosis. This predicts cost and coverage only, using fixed 2026 figures and plain arithmetic.

## Stack
Vite + React + TypeScript, Tailwind, Zustand, lucide-react, recharts. No backend. State in sessionStorage.

## Questions

1. Insurance type → Employer / Marketplace / Medicaid / Original Medicare / Medicare Advantage / VA or Tricare / None / Not sure
2. *(Original Medicare only)* Have Medigap? → Yes / No / Not sure. Helper: "This matters more than anything else on this page."
3. *(any Medicare)* Have Part D? → Yes / No / Not sure
4. *(employer or marketplace)* High-deductible plan with HSA? → Yes / No / Not sure
5. Deductible left this year → Met it / Under $1k / $1k–3k / $3k–6k / Over $6k / Not sure
6. Paid out of pocket so far → Under $500 / $500–2k / $2k–5k / Over $5k / Not sure
7. Confirmed in-network? → Yes / No / Not sure
8. How are meds given? (multi) → Pills at home / Infusion / Injection / Nothing yet
9. Any bills in collections? → Yes / No / Not sure
10. Check assistance programs? → Yes / Not now
11. *(only if yes)* Household size → 1 / 2 / 3 / 4 / 5+
12. *(only if yes)* Income range → FPL bands / Prefer not to say

Income questions render only after opt-in at 10. Every question skippable. "Not sure" styled identically to real options.

**Never collect:** name, DOB, full ZIP, address, phone, exact income, symptoms, medications, biomarkers, uploads.

## Constants

```ts
export const C = {
  acaOopMax: 10600,
  hdhpOopMax: 8500,
  partBPremium: 202.90,
  partBDeductible: 283,
  partBCoinsurance: 0.20,
  partAInpatientDeductible: 1736,  // per benefit period, not per year
  partDMaxDeductible: 615,
  partDOopCap: 2100,
  advantageMoop: 9250,
};
```
Label all figures "2026 plan year" in the UI.

## Ceiling logic

- Employer/marketplace, not HDHP → `acaOopMax`
- Employer/marketplace, HDHP → `hdhpOopMax`
- Medicare Advantage → `advantageMoop`, plus separate `partDOopCap` if Part D
- Original Medicare + Medigap → low exposure, note the Medigap premium
- **Original Medicare, no Medigap → uncapped.** Render as a card, not a number: "Original Medicare has no annual limit on what you pay out of pocket. Part B covers 80% after a $283 deductible and you owe the other 20% with no ceiling. Medigap or Medicare Advantage is what creates a cap. Worth a conversation this week."
- Medicaid → near zero, skip the math
- VA/Tricare → point to the facility beneficiary counselor
- None → skip projection, show the uninsured pathway

## Warnings, ranked in this order

1. Uncapped Medicare (above)
2. **Screening vs diagnostic.** "A screening colonoscopy is $0 on most plans and Medicare. Billed as diagnostic, it is not. Federal rules since 2022 say if a polyp is removed during a screening, the whole thing stays preventive at $0. If you're billed anyway, that's appealable. Ask billing before the procedure: which code, and does finding something change it?"
3. **Part D cap doesn't cover Part B drugs.** Show for Medicare + infusion/injection. "The $2,100 cap protects pill-form drugs. Infused chemo is usually Part B, which has no cap."
4. Out-of-network doesn't count toward your max. Show if network unconfirmed.
5. Premiums don't count toward your max. Show for all insured.
6. Part A resets per benefit period. Show for all Medicare. "Two hospital stays can mean paying $1,736 twice."
7. Bills in collections → "If a nonprofit hospital sent your bill to collections without first screening you for financial assistance, that may violate IRS Section 501(r). Raise it with billing."

## Assistance matching

- **Manufacturer copay cards** → employer/marketplace only. For any Medicare user, suppress and show instead: "Copay cards are not legal with Medicare. Nonprofit foundations are your path."
- **Foundation funds** (PAN, HealthWell, Patient Advocate Foundation Co-Pay Relief, CancerCare, LLS for blood cancers) → any insured user. Always add: "These funds close when depleted and reopen when refilled. If yours is closed, ask to be added to the notification list."
- **cancerfac.org** (CFAC database) → always, as catch-all
- **Hospital charity care** → everyone. Script: "Call billing and say, I'd like to request an application for your Section 501(r) Financial Assistance Policy." Nonprofit hospitals are legally required to have one and it's badly underused.
- **Medicaid BCCTP** → uninsured, under 65, breast or cervical. Some states extend to colorectal and prostate.
- **SSDI** → not working, or in treatment with no paid leave. Note Compassionate Allowances fast track and the ~6 month wait.

## Uninsured pathway

Replace the projection with an ordered list:
1. Check Medicaid, including BCCTP
2. Check marketplace special enrollment (job loss qualifies, a diagnosis alone does not)
3. Get treated at a nonprofit hospital and apply to its financial assistance policy immediately
4. Request a written Good Faith Estimate before non-emergency care. A final bill exceeding it by $400+ is disputable under the No Surprises Act

## UI

One horizontal stacked bar (recharts): paid so far, remaining exposure, ceiling. Uncapped case renders open-ended with a dashed right edge and no number. Below it the ranked warning cards, then matched programs with a one-line "why you match" each.

Guidance renders progressively. With only insurance type answered, already show something. Never a blank wall.

## Design

Not the default health-app look. No clinical blue, no gradient hero, no stock patient photo. Think well-made benefits paperwork: calm, honest, steady.

```
--paper:   #FAF9F6
--surface: #FFFFFF
--ink:     #1C1B19
--soft:    #5A5751
--accent:  #2F5D50   (selection, buttons)
--caution: #A66A21   (warnings only, never decorative)
--rule:    #E4E1DA
```

Serif for headers and the one big number. Sans for everything else. Tabular mono for dollar figures. Question text 20px/600, options 16px, helper 13px at 70%. Options are full-width cards, min 56px tall. 24px between question blocks, 12px between options. Line height 1.5 minimum.

**Signature element:** the warning stack. Each card gets a thin left rule in `--caution`, a declarative headline, two sentences, and one action for today. Spend the design effort here, keep everything else quiet.

Motion: guidance panel fades and rises 8px on unlock. Respect prefers-reduced-motion. Nothing else animates.

Copy: active voice, sentence case, no exclamation marks. Buttons name the outcome ("See my costs," not "Submit").

## Required

- Footer on every page: "This tool explains guidelines and costs. It does not give medical advice and cannot tell you what will happen with your cancer. Always confirm with your care team."
- "Clear my answers" button that wipes sessionStorage
- Dev-mode demo toggle: one uninsured profile, one uncapped-Medicare profile
- Works at 375px with visible keyboard focus

## Build order

1. Store + types + question components
2. costEngine.ts with all ceiling branches and warnings
3. The page UI, chart, warning stack
4. Demo profiles
5. Design and mobile pass
