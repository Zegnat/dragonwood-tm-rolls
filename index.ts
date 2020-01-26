import {product} from 'cartesian-product-generator';

// const sum = (v: number[]) => v.reduce((o, n) => o + n);
const max = (v: number[]) => v.reduce((o, n) => Math.max(o, n));
const zeros = (n: number) => Array.from(Array(n), _ => 0);
const cumsum = (v: number[]) => v.reduce((o, n, i) => o.concat((o[i - 1] || 0) + n), [] as number[]);
const cumsumRight = (v: number[]) => {
  for (let i = v.length - 2; i >= 0; --i) { v[i] += v[i + 1]; }
};

// Hat tip: https://math.stackexchange.com/a/1469254/81266
const prob2odds = (p: number) => p > 0.5 ? [1 / (1 - p) - 1, 1] : [1, 1 / p - 1];

function omitSmallest(v: number[]) {
  let minidx = 0;
  let min = v[minidx];
  for (let i = 1; i < v.length; i++) {
    if (v[i] < min) {
      min = v[i];
      minidx = i;
    }
  }
  v.splice(minidx, 1);
  return v;
}

// I want to let this be very barebones and user-unfriendly to preserve maximal speed.
function enumerateAllDices(sides: number[], maxDice: number, rerollOne: boolean) {
  const fakeMaxDice = maxDice + (rerollOne ? 1 : 0);
  const maxSide = max(sides);
  let frequencies = Array.from(Array(maxDice), (_, i) => zeros(1 + maxSide * (i + 1)));
  const repeatSides = Array.from(Array(fakeMaxDice), _ => sides);
  if (rerollOne) {
    for (let x of product(...repeatSides)) { cumsum(omitSmallest(x)).forEach((sum, i) => frequencies[i][sum]++); }
  } else {
    for (let x of product(...repeatSides)) { cumsum(x).forEach((sum, i) => frequencies[i][sum]++); }
  }
  return frequencies;
}

export type SumCumlProb = {
  sum: number,
  prob: number,
};
/**
 * This deserves some explanation. For speed, I use *an array* to map the sum of a roll to its frequency (number of
 * times occurred). That happened above in `enumerateAllDices`. *This function* converts that array, where each index is
 * the sum and each value the frequency of occurrence, to an array of objects with `sum` and `prob` entries, where
 * `prob` indicates the probability (between 0 and 1 inclusive) that the sum of dice rolls is **at least** `sum`.
 * @param sumFreqs array where each value is the number of times its index was seen
 */
function sumFreqsToProbOfAtleast(sumFreqs: number[]): SumCumlProb[] {
  let cuml = sumFreqs.slice();
  cumsumRight(cuml);
  return cuml.map(x => x / cuml[0]).map((prob, sum) => ({sum, prob})).slice(1);
};

export function enumerateDice(sides: number[], maxDice: number, rerollOne = false) {
  let dice2Frequencies: Map<number, SumCumlProb[]> = new Map([]);
  enumerateAllDices(sides, maxDice, rerollOne)
      .forEach((sumFreqs, didx) => dice2Frequencies.set(didx + 1, sumFreqsToProbOfAtleast(sumFreqs)))
  return dice2Frequencies;
}

const numToPercent = (n: number) => ((Math.round(n * 1000) / 1000) * 100).toFixed(1);
const numToOdds = (n: number) => prob2odds(n).map(x => Math.round(x * 10) / 10).join('：');
export function print(dice2Freqs: Map<number, SumCumlProb[]>, withReroll?: Map<number, SumCumlProb[]>) {
  for (let [numDice, table] of dice2Freqs) {
    console.log(`\n## ${numDice} dice`);

    let tableReroll: SumCumlProb[] = [];
    if (withReroll) { tableReroll = withReroll.get(numDice) || []; } // TypeScript pacification

    for (let [tableIdx, {sum, prob}] of table.entries()) {
      if (prob >= 1) { continue; }
      let probReroll = -1;
      if (withReroll) { probReroll = tableReroll[tableIdx].prob; }
      console.log(
          `- ≥${sum}, ${numToPercent(prob)}% or ${numToOdds(prob)}` +
          (probReroll >= 0 ? ` (rerolling? Then ${numToPercent(probReroll)}% or ${numToOdds(probReroll)})` : ''));
    }
  }
}

if (require.main === module) {
  const dragonwoodDiceSides = [1, 2, 2, 3, 3, 4];
  const maxDice = 6;
  const reroll = false;
  let dice2prob = enumerateDice(dragonwoodDiceSides, maxDice, reroll);
  print(dice2prob, enumerateDice(dragonwoodDiceSides, maxDice, !reroll));
}