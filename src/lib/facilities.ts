import type { Facility } from '../content/facilities';
import { LOUISIANA_FACILITIES } from '../content/facilities';

export interface MatchedFacility {
  facility: Facility;
  matchLabel: 'In your area' | 'Nearby' | 'In your region' | 'In your parish';
}

export function findMatchingFacilities(zip?: string, parishSlug?: string): MatchedFacility[] {
  const results: MatchedFacility[] = [];
  const addedSet = new Set<string>();

  const cleanZip = zip ? zip.trim() : '';

  if (cleanZip.length === 5) {
    const zipPrefix3 = cleanZip.substring(0, 3);
    const zipPrefix2 = cleanZip.substring(0, 2);

    // 1. Exact zip match — "In your area"
    for (const f of LOUISIANA_FACILITIES) {
      if (f.zip === cleanZip && !addedSet.has(f.name)) {
        results.push({ facility: f, matchLabel: 'In your area' });
        addedSet.add(f.name);
      }
    }

    // 2. Same first 3 digits of zip — "Nearby"
    if (results.length < 5) {
      for (const f of LOUISIANA_FACILITIES) {
        if (f.zip.substring(0, 3) === zipPrefix3 && !addedSet.has(f.name)) {
          results.push({ facility: f, matchLabel: 'Nearby' });
          addedSet.add(f.name);
          if (results.length >= 5) break;
        }
      }
    }

    // 3. Same first 2 digits of zip — "In your region"
    if (results.length < 5) {
      for (const f of LOUISIANA_FACILITIES) {
        if (f.zip.substring(0, 2) === zipPrefix2 && !addedSet.has(f.name)) {
          results.push({ facility: f, matchLabel: 'In your region' });
          addedSet.add(f.name);
          if (results.length >= 5) break;
        }
      }
    }
  }

  // Fallback to Parish if ZIP had no results or wasn't provided
  if (results.length < 5 && parishSlug) {
    for (const f of LOUISIANA_FACILITIES) {
      if (f.parishSlug === parishSlug && !addedSet.has(f.name)) {
        results.push({ facility: f, matchLabel: 'In your parish' });
        addedSet.add(f.name);
        if (results.length >= 5) break;
      }
    }
  }

  // Final fallback: if still fewer than 5, fill with top statewide centers
  if (results.length === 0) {
    for (const f of LOUISIANA_FACILITIES.slice(0, 3)) {
      results.push({ facility: f, matchLabel: 'In your region' });
    }
  }

  return results.slice(0, 5);
}
