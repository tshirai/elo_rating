import superagent from 'superagent';
import * as fs from 'fs';

class Crawler {
    private url: string;
    private fpath: string;
    constructor( url: string, fpath: string ) {
        this.url = url;
        this.fpath = fpath;
        this.getRawHtml();
    }
    async getRawHtml() {
        const result = await superagent.get(this.url);
        fs.writeFileSync(this.fpath, result.text);
    }
}

const months: string[] = [];
for ( let year = 2006; year <= 2021; year++ ) {
    for ( let month = 1; month <= 12; month ++ ) {
        const ym = year * 100 + month;
        if ( ym <= 200603 || ym > 202108) {
            continue;
        }
        console.log( ym );
        months.push( ym.toString() );
    }
}
for ( let ym of months ) {
    const url: string = "https://www.shogi.or.jp/game/result/" + ym + ".html";
    const fpath = "html/" + url.split("/").slice(-1)[0]
    console.log(url + " : " + fpath);
    if ( fs.existsSync( fpath ) ) {
        console.log( "Skip.");
        continue;
    }
    console.log( "Fetch" );
    const crawler = new Crawler(url, fpath);
}
