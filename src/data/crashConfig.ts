// Target house edge for the crash game. With the crash-point formula in
// useCrashEngine.ts, P(crashPoint >= m) = (1 - CRASH_HOUSE_EDGE) / m for any
// cashout target m >= 1, so EV of cashing out at m is a constant
// (1 - CRASH_HOUSE_EDGE) no matter when the player cashes out — matching how
// real crash games work.
export const CRASH_HOUSE_EDGE = 0.04
export const CRASH_RTP = 1 - CRASH_HOUSE_EDGE
