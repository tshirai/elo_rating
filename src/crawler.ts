import superagent from "superagent";
import * as fs from "fs";

class Crawler {
  private url: string;
  private fpath: string;
  constructor(url: string, fpath: string) {
    this.url = url;
    this.fpath = fpath;
  }
  async getRawHtml() {
    const result = await superagent.get(this.url);
    fs.writeFileSync(this.fpath, result.text);
  }
}

const months: string[] = [];

const startYear = 2006;
const startYM = 200604;
const now = new Date();
const thisYear = now.getFullYear();
// thisYM: 202108
const thisYM = now.getFullYear() * 100 + now.getMonth() + 1;
for (let year = startYear; year <= thisYear; year++) {
  for (let month = 1; month <= 12; month++) {
    const ym = year * 100 + month;
    if (ym < startYM || ym > thisYM) {
      continue;
    }
    console.log(ym);
    months.push(ym.toString());
  }
}

let myPromise = Promise.resolve();
(async () => {
  for (let ym of months) {
    const url: string = "https://www.shogi.or.jp/game/result/" + ym + ".html";
    const fpath = "html/" + url.split("/").slice(-1)[0];
    console.log(url + " : " + fpath);
    if (fs.existsSync(fpath)) {
      console.log("Skip.");
      continue;
    }
    console.log("Fetch");
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const crawler = new Crawler(url, fpath);
    crawler.getRawHtml();
  }
})();
