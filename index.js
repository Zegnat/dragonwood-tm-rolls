"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
var __values = (this && this.__values) || function (o) {
    var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
    if (m) return m.call(o);
    return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
};
Object.defineProperty(exports, "__esModule", { value: true });
var cartesian_product_generator_1 = require("cartesian-product-generator");
var sum = function (v) { return v.reduce(function (o, n) { return o + n; }); };
var max = function (v) { return v.reduce(function (o, n) { return Math.max(o, n); }); };
var zeros = function (n) { return Array.from(Array(n), function (_) { return 0; }); };
var cumsum = function (v) { return v.reduce(function (o, n, i) { return o.concat((o[i - 1] || 0) + n); }, []); };
var cumsumRight = function (v) {
    for (var i = v.length - 2; i >= 0; --i) {
        v[i] += v[i + 1];
    }
};
// Hat tip: https://math.stackexchange.com/a/1469254/81266
var prob2odds = function (p) { return p > 0.5 ? [1 / (1 - p) - 1, 1] : [1, 1 / p - 1]; };
function omitSmallest(v) {
    var minidx = 0;
    var min = v[minidx];
    for (var i = 1; i < v.length; i++) {
        if (v[i] < min) {
            min = v[i];
            minidx = i;
        }
    }
    v.splice(minidx, 1);
    return v;
}
// I want to let this be very barebones and user-unfriendly to preserve maximal speed.
function enumerateAllDices(sides, maxDice, rerollOne) {
    var e_1, _a, e_2, _b;
    var fakeMaxDice = maxDice + (rerollOne ? 1 : 0);
    var maxSide = max(sides);
    var frequencies = Array.from(Array(maxDice), function (_, i) { return zeros(1 + maxSide * (i + 1)); });
    var repeatSides = Array.from(Array(fakeMaxDice), function (_) { return sides; });
    if (rerollOne) {
        try {
            for (var _c = __values(cartesian_product_generator_1.product.apply(void 0, __spread(repeatSides))), _d = _c.next(); !_d.done; _d = _c.next()) {
                var x = _d.value;
                cumsum(omitSmallest(x)).forEach(function (sum, i) { return frequencies[i][sum]++; });
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
            }
            finally { if (e_1) throw e_1.error; }
        }
    }
    else {
        try {
            for (var _e = __values(cartesian_product_generator_1.product.apply(void 0, __spread(repeatSides))), _f = _e.next(); !_f.done; _f = _e.next()) {
                var x = _f.value;
                cumsum(x).forEach(function (sum, i) { return frequencies[i][sum]++; });
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_f && !_f.done && (_b = _e.return)) _b.call(_e);
            }
            finally { if (e_2) throw e_2.error; }
        }
    }
    return frequencies;
}
/**
 * This deserves some explanation. For speed, I use *an array* to map the sum of a roll to its frequency (number of
 * times occurred). That happened above in `enumerateAllDices`. *This function* converts that array, where each index is
 * the sum and each value the frequency of occurrence, to an array of objects with `sum` and `prob` entries, where
 * `prob` indicates the probability (between 0 and 1 inclusive) that the sum of dice rolls is **at least** `sum`.
 * @param sumFreqs array where each value is the number of times its index was seen
 */
function sumFreqsToProbOfAtleast(sumFreqs) {
    var cuml = sumFreqs.slice();
    cumsumRight(cuml);
    return cuml.map(function (x) { return x / cuml[0]; }).map(function (prob, sum) { return ({ sum: sum, prob: prob }); }).slice(1);
}
;
function enumerateDice(sides, maxDice, rerollOne) {
    if (rerollOne === void 0) { rerollOne = false; }
    var dice2Frequencies = new Map([]);
    enumerateAllDices(sides, maxDice, rerollOne)
        .forEach(function (sumFreqs, didx) { return dice2Frequencies.set(didx + 1, sumFreqsToProbOfAtleast(sumFreqs)); });
    return dice2Frequencies;
}
exports.enumerateDice = enumerateDice;
var numToPercent = function (n) { return ((Math.round(n * 1000) / 1000) * 100).toFixed(1); };
var numToOdds = function (n) { return prob2odds(n).map(function (x) { return Math.round(x * 10) / 10; }).join('：'); };
function print(dice2Freqs, withReroll) {
    var e_3, _a, e_4, _b;
    try {
        for (var dice2Freqs_1 = __values(dice2Freqs), dice2Freqs_1_1 = dice2Freqs_1.next(); !dice2Freqs_1_1.done; dice2Freqs_1_1 = dice2Freqs_1.next()) {
            var _c = __read(dice2Freqs_1_1.value, 2), numDice = _c[0], table = _c[1];
            console.log("\n## " + numDice + " dice");
            var tableReroll = [];
            if (withReroll) {
                tableReroll = withReroll.get(numDice) || [];
            } // TypeScript pacification
            try {
                for (var _d = __values(table.entries()), _e = _d.next(); !_e.done; _e = _d.next()) {
                    var _f = __read(_e.value, 2), tableIdx = _f[0], _g = _f[1], sum_1 = _g.sum, prob = _g.prob;
                    if (prob >= 1) {
                        continue;
                    }
                    var probReroll = -1;
                    if (withReroll) {
                        probReroll = tableReroll[tableIdx].prob;
                    }
                    console.log("- \u2265" + sum_1 + ", " + numToPercent(prob) + "% or " + numToOdds(prob) +
                        (probReroll >= 0 ? " (rerolling? Then " + numToPercent(probReroll) + "% or " + numToOdds(probReroll) + ")" : ''));
                }
            }
            catch (e_4_1) { e_4 = { error: e_4_1 }; }
            finally {
                try {
                    if (_e && !_e.done && (_b = _d.return)) _b.call(_d);
                }
                finally { if (e_4) throw e_4.error; }
            }
        }
    }
    catch (e_3_1) { e_3 = { error: e_3_1 }; }
    finally {
        try {
            if (dice2Freqs_1_1 && !dice2Freqs_1_1.done && (_a = dice2Freqs_1.return)) _a.call(dice2Freqs_1);
        }
        finally { if (e_3) throw e_3.error; }
    }
}
exports.print = print;
if (require.main === module) {
    var dragonwoodDiceSides_1 = [1, 2, 2, 3, 3, 4];
    var maxDice = 6;
    var reroll = false;
    var dice2prob = enumerateDice(dragonwoodDiceSides_1, maxDice, reroll);
    print(dice2prob, enumerateDice(dragonwoodDiceSides_1, maxDice, !reroll));
    {
        // monte carlo analsysis
        var numDice = 4;
        var minRollWanted = 11;
        var nTrials = 1e7;
        var nSides_1 = dragonwoodDiceSides_1.length;
        var rollADice = function () { return dragonwoodDiceSides_1[Math.floor(Math.random() * nSides_1)]; };
        var freq = 0;
        var blank = zeros(numDice);
        for (var i = 0; i < nTrials; i++) {
            var roll = blank.map(rollADice);
            var reroll_1 = rollADice();
            freq += ((sum(roll) >= minRollWanted) || (sum(omitSmallest(roll)) + reroll_1 >= minRollWanted)) ? 1 : 0;
        }
        console.log("Prob rolling >= " + minRollWanted + " with " + numDice + " die and Lucky Mushroom option, " + nTrials.toExponential(3) + " tries: " + (freq / nTrials * 100) + "%");
    }
}
