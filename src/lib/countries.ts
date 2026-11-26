// ISO alpha-2 -> localized country name + flag emoji via Intl.DisplayNames.
export function countryName(code: string, locale: string): string {
  try {
    const dn = new Intl.DisplayNames([locale], { type: 'region' });
    return dn.of(code) || code;
  } catch {
    return code;
  }
}

export function flagEmoji(code: string): string {
  if (!/^[A-Z]{2}$/i.test(code)) return '';
  return String.fromCodePoint(
    ...code.toUpperCase().split('').map((c) => 0x1f1e6 + c.charCodeAt(0) - 65),
  );
}
