export interface HelpResource {
  name: string
  phone?: string
  url?: string
  description: string
}

export const HELP_RESOURCES: HelpResource[] = [
  {
    name: 'National Council on Problem Gambling',
    phone: '1-800-522-4700',
    url: 'https://www.ncpgambling.org',
    description: '24/7 confidential helpline and treatment referrals across the US.',
  },
  {
    name: 'National Problem Gambling Helpline (Call/Text/Chat)',
    phone: '1-800-GAMBLER',
    url: 'https://www.1800gambler.net',
    description: 'Free, confidential support by phone, text, or chat.',
  },
  {
    name: 'Gamblers Anonymous',
    url: 'https://www.gamblersanonymous.org',
    description: 'Peer support meetings and recovery program, in-person and online.',
  },
]
