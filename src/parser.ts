import * as fs from "fs";
import cheerio from "cheerio";
import { Player, GameResult } from "./definitions";

function getPlayerId(url: string): string {
    // '/player/pro/210.html' -> '210.html' -> '210'
    return getPlayerType(url) + "_" + url?.split("/").slice(-1)[0].slice(0, -5);
}
function toStrength(playerType: string): number {
    return {
        pro: 3,
        lady: 2,
        ama: 1,
    }[playerType]!;
}
function getPlayerType(url: string): string {
    if (url === undefined) {
        return "ama";
    } else if (url.includes("player/pro")) {
        return "pro";
    } else if (url.includes("player/lady")) {
        return "lady";
    }
    return "ama";
}
function createPlayer(url: string, name: string): Player {
    return new Player(getPlayerId(url), name, getPlayerType(url));
}
function createPlayerLadyInPro(): Player {
    return new Player("pro_-1", "女流", "pro");
}
function createPlayerAmaInPro(): Player {
    return new Player("pro_-2", "アマ", "pro");
}
function createPlayerAmaInLady(): Player {
    return new Player("lady_-3", "アマ", "lady");
}

function parse(month: number, html: string): GameResult[] {
    const results: GameResult[] = [];
    /**
     * <tbody>
     *   <tr> Date</tr>
     *   <tr>
     *     <td> Match name </td>
     *     <td class="tac"></td>
     *     <td class="tac">
     *       <a href="/player/pro/210.html"> <== ID
     *         <span></span>
     *         <span> Name </span>           <== Name
     *       </a>
     *     </td>
     *     <td class="tac">
     *     </td>
     *     <td class="tac"></td>
     *   </tr>
     *
     *   <tr>
     *     <td> win/lose </td>
     *     <td> player </td>
     *     <td> player </td>
     *     <td> win/lose </td>
     *   </tr>
     *
     *   ...
     * </tbody>
     *
     */

    const $ = cheerio.load(html);
    // const tacs = $(".tac");
    const tr = $("table.tableElements01 tbody tr");

    let date: string;
    let label: string;
    tr.each((i, elem) => {
        const text: string = $(elem).text();
        if (text.includes("曜日")) {
            date = text;
        } else {

            const td = $(elem).children("td");
            let idx = 0;
            if ($(td[0]).attr("class") != "tac") {
                label = $(td[0]).text();
                idx = 1;
            }
            const firstPlayerUrl: string = $(td[idx + 1]).children("a").attr("href")!;
            const firstPlayerType = getPlayerType(firstPlayerUrl);

            const secondPlayerUrl: string = $(td[idx + 2]).children("a").attr("href")!;
            const secondPlayerType = getPlayerType(secondPlayerUrl);

            let firstPlayer: Player = createPlayer(firstPlayerUrl, $(td[idx + 1]).text());
            let secondPlayer: Player = createPlayer(secondPlayerUrl, $(td[idx + 2]).text());

            if (firstPlayerType != secondPlayerType) {
                if (firstPlayerType == "pro") {
                    if (secondPlayerType == "lady") {
                        secondPlayer = createPlayerLadyInPro();
                    } else {
                        secondPlayer = createPlayerAmaInPro();
                    }
                } else if (secondPlayerType == "pro") {
                    if (firstPlayerType == "lady") {
                        firstPlayer = createPlayerLadyInPro();
                    } else {
                        firstPlayer = createPlayerAmaInPro();
                    }

                } else if (firstPlayerType == "lady") {
                    secondPlayer = createPlayerAmaInLady();
                } else {
                    firstPlayer = createPlayerAmaInLady();
                }
            }

            let winner: Player;
            let loser: Player;

            if ($(td[idx]).text() === "○") {
                winner = firstPlayer;
                loser = secondPlayer;
            } else if ($(td[idx]).text() === "●") {
                winner = secondPlayer;
                loser = firstPlayer;
            } else {
                return;
            }
            results.push(new GameResult(month, date, label, winner, loser));
        }
    });
    // console.log(results);
    return results;
}

const allFiles: string[] = fs.readdirSync("html/");

/**
 * Create results
 */
let results: GameResult[] = [];
for (const fname of allFiles) {
    if (!fname.endsWith(".html")) {
        continue;
    }

    console.log(fname);
    // "202006.html" => 202006
    const month = Number(fname.slice(0, -5));
    const html: string = fs.readFileSync("html/" + fname).toString();
    // console.log(parse(month, html))
    results = results.concat(parse(month, html));
    // console.log(results);
    // break;
}

/**
 * Create the results file.
 */
fs.writeFileSync("results.json", JSON.stringify(results, null, "  "));

/**
 * Create players
 */
const players: { [key: string]: Player; } = {};
for (const result of results) {
    const winner: Player = result.winner;
    const loser: Player = result.loser;
    players[winner.id] = winner;
    players[loser.id] = loser;
}
fs.writeFileSync("players.json", JSON.stringify(players, null, "  "));

