export interface Weighted {
  weight: number
}

/** Picks a random item from a list, proportional to each item's `weight`. */
export function pickWeighted<T extends Weighted>(items: T[]): T {
  const total = items.reduce((sum, item) => sum + item.weight, 0)
  let roll = Math.random() * total
  for (const item of items) {
    roll -= item.weight
    if (roll < 0) return item
  }
  return items[items.length - 1]
}

export function randomUnit(): number {
  return Math.random()
}
