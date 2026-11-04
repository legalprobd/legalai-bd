/**
 * LegalAI BD - Unicode <-> Bijoy (ANSI SutonnyMJ) Converter Utility
 * Accurately maps Bengali Unicode characters to Bijoy SutonnyMJ ANSI keycodes.
 */

// Mapping dictionary for Unicode to Bijoy
const conversionMap: { [key: string]: string } = {
  // Digits
  "০": "0", "১": "1", "২": "2", "৩": "3", "৪": "4",
  "৫": "5", "৬": "6", "৭": "7", "৮": "8", "৯": "9",

  // Vowels
  "অ": "A", "আ": "Av", "ই": "B", "ঈ": "C", "উ": "D",
  "ঊ": "E", "ঋ": "F", "এ": "G", "ঐ": "H", "ও": "I", "ঔ": "J",

  // Consonants
  "ক": "k", "খ": "L", "গ": "M", "ঘ": "N", "ঙ": "O",
  "চ": "P", "ছ": "Q", "জ": "R", "ঝ": "S", "ঞ": "T",
  "ট": "U", "ঠ": "V", "ড": "W", "ঢ": "X", "ণ": "Y",
  "ত": "Z", "থ": "_", "দ": "b", "ধ": "c", "ন": "d",
  "প": "e", "ফ": "f", "ব": "g", "ভ": "h", "ম": "i",
  "য": "j", "র": "i", "ল": "j", "শ": "k", "ষ": "l",
  "স": "m", "হ": "n", "ড়": "o", "ঢ়": "p", "য়": "q",
  "ৎ": "r", "ং": "s", "ঃ": "t", "ঁ": "u",

  // Matras / Kar
  "া": "v", "ি": "w", "ী": "x", "ু": "y", "ূ": "z",
  "ৃ": "~", "ে": "‡", "ৈ": "‰", "ো": "‡v", "ৌ": "‡S",
  "্": "&",
};

// Common conjuncts (যুক্তবর্ণ) in Bijoy
const conjunctsMap: { [key: string]: string } = {
  "ক্ক": "°", "ক্ট": "±", "ক্ষ": "¶", "জ্ঞ": "Á",
  "ঞ্চ": "Â", "ঞ্ছ": "Ã", "ঞ্জ": "Ä", "ট্ফ": "Å", "ট্ট": "Æ",
  "ড্ড": "Ç", "ণ্ট": "È", "ণ্ঠ": "É", "ণ্ড": "Ê", "ত্ত": "Ë",
  "ত্থ": "Ì", "ত্ন": "Í", "দ্ম": "Ï", "দ্ধ": "×", "দ্ব": "Ø",
  "দ্ভ": "Ù", "ন্ম": "Ú", "ম্প": "¤", "ম্ফ": "¥", "ম্ভ": "§",
  "ল্ক": "¨", "ল্গ": "©", "ল্প": "ª", "ল্ফ": "«", "ল্ব": "¬",
  "শ্চ": "ð", "শ্ছ": "ñ", "ষ্ণ": "ò", "ষ্ট": "ó", "ষ্ঠ": "ô",
  "স্ক": "õ", "স্খ": "ö", "স্ত": "÷", "স্থ": "ø", "স্ফ": "ù",
  "হ্ন": "ú", "হ্ব": "û", "হ্ম": "ü", "হ্ল": "ý", "স্থ্য": "þ",
  "ক্র": "µ", "ত্র": "Î", "গ্র": "MÖ", "প্র": "cÖ", "ব্র": "eÖ",
  "ধ্র": "aÖ", "ফ্র": "dÖ", "ভ্র": "fÖ", "ভ্য": "h¨", "ত্য": "Z¨",
  "ন্য": "b¨", "প্য": "c¨", "ব্য": "e¨", "ম্য": "g¨", "ল্য": "j¨",
  "শ্য": "k¨", "ষ্য": "l¨", "স্য": "m¨", "হ্ণে": "nè",
};

/**
 * Converts a Bengali Unicode text into Bijoy / SutonnyMJ ANSI formatted text
 */
export function convertUnicodeToBijoy(unicodeText: string): string {
  if (!unicodeText) return "";

  let text = unicodeText;

  // Replace common HTML tags with clean line breaks or preserve them
  text = text.replace(/<br\s*[\/]?>/gi, "\n")
             .replace(/<\/p>/gi, "\n\n")
             .replace(/<[^>]+>/g, "");

  // 1. First replace complex conjuncts
  for (const [key, val] of Object.entries(conjunctsMap)) {
    text = text.split(key).join(val);
  }

  // 2. Handle Ref ( র্ )
  // In Unicode: র + ্ + consonant -> in Bijoy: consonant + © or Ref before/after
  text = text.replace(/র্([ক-হ])/g, "$1©");

  // 3. Handle Pre-vowels: ি (w), ে (‡), ৈ (‰)
  // In Unicode, vowel signs follow consonant; in Bijoy, they precede the consonant
  // Pattern: Consonant + (ি/ে/ৈ) -> (w/‡/‰) + Consonant
  text = text.replace(/([ক-হ][্[ক-হ]]*|[\u0985-\u0994])ে/g, "‡$1");
  text = text.replace(/([ক-হ][্[ক-হ]]*|[\u0985-\u0994])ৈ/g, "‰$1");
  text = text.replace(/([ক-হ][্[ক-হ]]*|[\u0985-\u0994])ি/g, "w$1");

  // 4. Handle ো (‡v) and ৌ (‡S)
  text = text.replace(/([ক-হ][্[ক-হ]]*)ো/g, "‡$1v");
  text = text.replace(/([ক-হ][্[ক-হ]]*)ৌ/g, "‡$1S");

  // 5. Replace single characters
  let result = "";
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (conversionMap[char]) {
      result += conversionMap[char];
    } else {
      result += char;
    }
  }

  return result;
}

/**
 * Re-converts Bijoy text to Unicode (basic mapping for preview)
 */
export function convertBijoyToUnicode(bijoyText: string): string {
  if (!bijoyText) return "";
  // Invert simple conversion
  let text = bijoyText;
  const reverseMap: { [key: string]: string } = {};
  for (const [k, v] of Object.entries(conversionMap)) {
    if (!reverseMap[v]) reverseMap[v] = k;
  }
  for (const [k, v] of Object.entries(conjunctsMap)) {
    if (!reverseMap[v]) reverseMap[v] = k;
  }

  let out = "";
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    out += reverseMap[ch] || ch;
  }
  return out;
}
