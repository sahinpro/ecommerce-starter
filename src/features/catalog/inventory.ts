export function availableQuantity(onHand: number, committed = 0): number {
  return Math.max(0, onHand - committed);
}
