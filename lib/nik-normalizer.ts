export function normalizeNik(nik: string | undefined | null): string {
  if (!nik) return "";
  
  const cleanNik = nik.trim().toUpperCase();
  
  const prefixMap: Record<string, string> = {
    'AC': '25',
    'Q': '90',
    'R': '970',
    'M': '60',
    'U': '98',
    'G': '40',
    'H': '80',
    'I': '85',
    'J': '95',
    'K': '96',
    'P': '94',
    'B': '20',
    'N': '99',
    'T': '26',
    'A': '27'

  };

  for (const [letter, number] of Object.entries(prefixMap)) {
    if (cleanNik.startsWith(letter)) {
      return cleanNik.replace(letter, number);
    }
  }
  return cleanNik;
}