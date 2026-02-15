export function analyzeMistakes(typedText, targetText) {
  const errors = {};

  for (let i = 0; i < typedText.length; i++) {
    const t = typedText[i];
    const expected = targetText[i];

    if (!expected) break;
    if (t !== expected) {
      errors[expected] = (errors[expected] || 0) + 1;
    }
  }

  return errors;
}
