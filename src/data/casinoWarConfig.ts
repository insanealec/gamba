/**
 * Same honesty caveat as Blackjack/Video Poker: Casino War has a genuine
 * decision point (surrender vs. go to war on a tie), so the true RTP
 * depends on which the player picks. 97.12% is the well-documented,
 * published figure for "always go to war" — which is also the
 * *mathematically better* of the two options (surrender-every-tie is worse,
 * historically documented around 96.3%). Both are cited real-world values,
 * not derived by this app.
 */
export const CASINO_WAR_RTP = 0.9712
export const CASINO_WAR_HOUSE_EDGE = 1 - CASINO_WAR_RTP
