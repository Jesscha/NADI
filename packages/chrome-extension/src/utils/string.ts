export function isKoreanComposing(target: string, input: string): boolean {
  if (target === input) return true;

  const targetChar = target.charCodeAt(0);
  const inputChar = input.charCodeAt(0);

  // Check if target is Hangul syllable
  const isTargetKorean = targetChar >= 0xac00 && targetChar <= 0xd7a3;
  const isInputKorean =
    (inputChar >= 0x1100 && inputChar <= 0x11ff) || // Jamo
    (inputChar >= 0x3130 && inputChar <= 0x318f) || // Compatibility Jamo
    (inputChar >= 0xac00 && inputChar <= 0xd7a3); // Syllables

  if (!isTargetKorean || !isInputKorean) return false;

  const targetJamo = target.normalize("NFD");
  const inputJamo = input.normalize("NFD");

  // For compatibility Jamo (ㅎ), convert to the corresponding lead consonant range
  if (inputChar >= 0x3130 && inputChar <= 0x318f) {
    // Convert compatibility Jamo to lead consonant
    const compatibilityToLeadConsonant: { [key: string]: string } = {
      ㄱ: "ᄀ",
      ㄲ: "ᄁ",
      ㄴ: "ᄂ",
      ㄷ: "ᄃ",
      ㄸ: "ᄄ",
      ㄹ: "ᄅ",
      ㅁ: "ᄆ",
      ㅂ: "ᄇ",
      ㅃ: "ᄈ",
      ㅅ: "ᄉ",
      ㅆ: "ᄊ",
      ㅇ: "ᄋ",
      ㅈ: "ᄌ",
      ㅉ: "ᄍ",
      ㅊ: "ᄎ",
      ㅋ: "ᄏ",
      ㅌ: "ᄐ",
      ㅍ: "ᄑ",
      ㅎ: "ᄒ",
    };
    const convertedInput = compatibilityToLeadConsonant[input] || input;
    return targetJamo.startsWith(convertedInput);
  }

  return targetJamo.startsWith(inputJamo);
}
