// Addendum A3: category mapping lives in ONE file. Unknown is never defaulted to free.
export type VisaCategory = 'free' | 'permit' | 'visa' | 'unknown';

const MAP: Record<string, VisaCategory> = {
  // vendor (Travel Buddy) rule names
  'visa not required': 'free',
  'freedom of movement': 'free',
  'visa free': 'free',
  'visa on arrival': 'free',
  'evisa': 'permit',
  'e-visa': 'permit',
  'eta': 'permit',
  'visa-waiver registration': 'permit',
  'mandatory registration': 'permit',
  'tourist card': 'permit',
  'electronic visa waiver': 'permit',
  'visa required': 'visa',
  'visa or online visa required': 'visa',
  'not admitted': 'unknown',
};

export function categorizeRule(ruleName: string | null | undefined, durationDays?: number | null): VisaCategory {
  if (durationDays != null && durationDays > 0) return 'free'; // snapshot: number of visa-free days
  if (!ruleName) return 'unknown';
  const key = ruleName.trim().toLowerCase();
  if (key in MAP) return MAP[key];
  if (/^\d+$/.test(key)) return 'free';
  return 'unknown';
}

export function parseDays(duration?: string | null): number | null {
  if (!duration) return null;
  const m = duration.match(/(\d+)/);
  return m ? parseInt(m[1], 10) : null;
}

// Snapshot (Passport Index dataset) requirement -> category + days
export function categorizeSnapshot(req: string): { category: VisaCategory; days: number | null } {
  const k = (req || '').trim().toLowerCase();
  if (/^\d+$/.test(k)) return { category: 'free', days: parseInt(k, 10) };
  return { category: categorizeRule(k), days: null };
}
