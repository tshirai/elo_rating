import { Player, GameResult } from "./definitions";

function getPlayers(): { [key: string]: Player; } {
    const raw_players = require('../players.json');
    const players: { [key: string]: Player; } = {};
    for (const id of Object.keys(raw_players)) {
        const raw_player = raw_players[id];
        players[id] = new Player(id, raw_player.name, raw_player.grade);
    }
    // console.log(players);
    return players;
}

function getResults(): GameResult[] {
    const raw_results = require('../results.json');
    const results: GameResult[] = [];
    for (const raw_result of raw_results) {
        const winner: Player = new Player(raw_result.winner.id, raw_result.winner.name, raw_result.winner.grade);
        const loser: Player = new Player(raw_result.loser.id, raw_result.loser.name, raw_result.loser.grade);
        results.push(new GameResult(raw_result.month, raw_result.date, raw_result.label, winner, loser));
    }
    // console.log(results);
    return results;
}

function findResults(results: GameResult[], playerId: string): GameResult[] {
    const found: GameResult[] = [];
    for (const result of results) {
        if (result.winner.id == playerId || result.loser.id == playerId) {
            found.push(result);
        }
    }
    return found;
}

function winRate(ratingA: number, ratingB: number): number {
    return 1 / (Math.pow(10, (ratingA - ratingB) / 400) + 1);
}

// Test winRate.
// for (let diff = -400; diff <= 400; diff += 50) {
//     const a = 1500;
//     const b = 1500 + diff;
//     console.log(a, ",", b, ",", winRate(a, b));
// }

const players: { [key: string]: Player; } = getPlayers();
const results: GameResult[] = getResults();

const outputs: string[] = [];
for (const result of results) {
    const winner = players[result.winner.id];
    const loser = players[result.loser.id];
    const rate = winRate(winner.rating, loser.rating);
    // console.log(result);
    winner.rating = winner.rating + 16 * rate;
    loser.rating = loser.rating - 16 * rate;
    result.winner.rating = winner.rating;
    result.loser.rating = loser.rating;
    // console.log(winner, loser);
}

/**
 * Show the sorted pro players.
 */
const pro: Player[] = [];
const lady: Player[] = [];

for (const id in players) {
    const player = players[id];
    if (player.grade == "pro") {
        pro.push(player);
    } else if (player.grade == "lady") {
        lady.push(player);
    }
}

pro.sort((player1, player2) => {
    return player2.rating - player1.rating;
});
for (let i = 0; i < pro.length; i++) {
    const player = pro[i];
    console.log((i + 1).toString().padStart(3), " ", player.name.padEnd(6, "　"), ":", Math.round(player.rating));
}

/**
 * Search the matches of the player.
 */
// for (const result of findResults(results, "pro_303")) {
//     console.log(
//         result.month, " ",
//         result.date, " ",
//         result.winner.name, ":", Math.round(result.winner.rating), " ",
//         result.loser.name, ":", Math.round(result.loser.rating),
//         result.label, " ",
//     );
// }

