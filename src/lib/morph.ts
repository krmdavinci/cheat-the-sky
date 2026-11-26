// Section 6: pixel icons + icon-to-text morph units.
// Palette: k ink #1F2430, b harbour #7DA3BB, w white, p peach #DDAD95
export const PIXEL_ICONS: string[][] = [
  [ // plane
    '........k', '......kkb', '....kkwkb', '..kkwwkb.', 'kkwwwkbb.',
    '..kkkbb..', '....kb...', '....k....', '.........',
  ],
  [ // suitcase
    '...kkk...', '..k...k..', 'kkkkkkkkk', 'kbbbbbbbk', 'kbwbbbwbk',
    'kbbbbbbbk', 'kbbbbbbbk', 'kkkkkkkkk', '.k.....k.',
  ],
  [ // bed
    'k........', 'k..kkk...', 'k.kwwwk..', 'kkkkkkkkk', 'kbbbbbbbk',
    'kbbbbbbbk', 'kkkkkkkkk', 'k.......k', '.........',
  ],
  [ // compass
    '..kkkkk..', '.kwwbwwk.', 'kwwwbwwwk', 'kwwpkpwwk', 'kwwwpwwwk',
    'kwwwpwwwk', '.kwwwwwk.', '..kkkkk..', '.........',
  ],
  [ // passport
    '.kkkkkkk.', 'kbbbbbbbk', 'kbbkkkbbk', 'kbkwwwkbk', 'kbkwkwkbk',
    'kbbkkkbbk', 'kbbbbbbbk', 'kbbwwwbbk', '.kkkkkkk.',
  ],
  [ // pin
    '..kkkkk..', '.kbbbbbk.', 'kbbwwwbbk', 'kbbwkwbbk', 'kbbwwwbbk',
    '.kbbbbbk.', '..kbbbk..', '...kbk...', '....k....',
  ],
  [ // sun
    '....p....', '.p..k..p.', '...kpk...', '..kpppk..', 'pkpppppkp',
    '..kpppk..', '...kpk...', '.p..k..p.', '....p....',
  ],
];
for (const icon of PIXEL_ICONS) for (const row of icon) {
  if (row.length !== 9) throw new Error(`pixel row not 9 chars: "${row}"`);
}

export const PIXEL_COLORS: Record<string, string> = {
  k: '#1F2430', b: '#7DA3BB', w: '#FFFFFF', p: '#DDAD95',
};

// Morph units: English splits into letters (incl. spaces), Arabic into whole words.
export function headlineUnits(headline: string, isArabic: boolean): string[] {
  if (isArabic) return headline.split(' ');
  return headline.split('');
}
