export const ROWS = 12
export const BINS = ROWS + 1
const TARGET_RTP = 0.95

function binomialCoeff(n: number, k: number): number {
  let coeff = 1
  for (let i = 0; i < k; i++) {
    coeff = (coeff * (n - i)) / (i + 1)
  }
  return coeff
}

const TOTAL_OUTCOMES = 2 ** ROWS

function binProbability(k: number): number {
  return binomialCoeff(ROWS, k) / TOTAL_OUTCOMES
}

// Every peg bounce is an honest, unbiased 50/50 — the house edge comes
// entirely from how the (real, binomial) landing-position probabilities are
// weighted against the payout curve below, same as a real Galton-board
// Plinko game. Shape is the classic "smile" curve: rare edges pay huge,
// the common middle pays little. The whole curve is scaled by a single
// factor so it hits the exact target RTP, rather than hand-tuning each
// value and hoping — same principle as every other game's config.
const SHAPE = [1000, 130, 26, 9, 4, 2, 1, 2, 4, 9, 26, 130, 1000]

function computeMultipliers(): number[] {
  const probs = Array.from({ length: BINS }, (_, k) => binProbability(k))
  const rawEv = probs.reduce((sum, p, k) => sum + p * SHAPE[k], 0)
  const scale = TARGET_RTP / rawEv
  return SHAPE.map((m) => m * scale)
}

export const PLINKO_MULTIPLIERS = computeMultipliers()

export const PLINKO_RTP = PLINKO_MULTIPLIERS.reduce((sum, m, k) => sum + binProbability(k) * m, 0)
export const PLINKO_HOUSE_EDGE = 1 - PLINKO_RTP
