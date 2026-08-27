/**
/**
 * Systematic transform layer for Caregiver Mode grammar.
 * Converts second-person phrases ("you", "your", "you've", "you're") to third-person
 * singular ("they", "their", "they've", "they're") so copy never drifts out of sync.
 */
export function formatCaregiverText(text: string, isCaregiver: boolean): string {
  if (!isCaregiver || !text) return text;

  return text
    .replace(/\bYou have\b/g, 'They have')
    .replace(/\byou have\b/g, 'they have')
    .replace(/\bYou've\b/g, "They've")
    .replace(/\byou've\b/g, "they've")
    .replace(/\bYou're\b/g, "They're")
    .replace(/\byou're\b/g, "they're")
    .replace(/\bYour\b/g, 'Their')
    .replace(/\byour\b/g, 'their')
    .replace(/\bYou are\b/g, 'They are')
    .replace(/\byou are\b/g, 'they are')
    .replace(/\bYou\b/g, 'They')
    .replace(/\byou\b/g, 'they');
}
