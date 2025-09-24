export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, "") // Remove punctuation
    .replace(/\s+/g, " ") // Normalize whitespace
    .trim()
}

export function levenshteinDistance(a: string, b: string): number {
  const matrix = Array(b.length + 1)
    .fill(null)
    .map(() => Array(a.length + 1).fill(null))

  for (let i = 0; i <= a.length; i++) {
    matrix[0][i] = i
  }

  for (let j = 0; j <= b.length; j++) {
    matrix[j][0] = j
  }

  for (let j = 1; j <= b.length; j++) {
    for (let i = 1; i <= a.length; i++) {
      if (b.charAt(j - 1) === a.charAt(i - 1)) {
        matrix[j][i] = matrix[j - 1][i - 1]
      } else {
        matrix[j][i] = Math.min(
          matrix[j - 1][i - 1] + 1, // substitution
          matrix[j][i - 1] + 1, // insertion
          matrix[j - 1][i] + 1, // deletion
        )
      }
    }
  }

  return matrix[b.length][a.length]
}

export function calcWER(reference: string, hypothesis: string): { wer: number; accuracy: number } {
  const refWords = normalizeText(reference)
    .split(" ")
    .filter((w) => w.length > 0)
  const hypWords = normalizeText(hypothesis)
    .split(" ")
    .filter((w) => w.length > 0)

  if (refWords.length === 0) {
    return { wer: hypWords.length > 0 ? 1 : 0, accuracy: hypWords.length > 0 ? 0 : 1 }
  }

  const distance = levenshteinDistance(refWords.join(" "), hypWords.join(" "))
  const wer = distance / refWords.length
  const accuracy = Math.max(0, 1 - wer)

  return { wer, accuracy }
}
