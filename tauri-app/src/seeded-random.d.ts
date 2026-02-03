declare module 'seeded-random' {
  interface SeededRandom {
    decimal(seed: string): number;
    range(seed: string, min: number, max: number): number;
  }

  const seededRandom: SeededRandom;
  export default seededRandom;
}
