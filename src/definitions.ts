export class Player {
    id: string;
    name: string;
    grade: string;
    rating: number;
    constructor(id: string, name: string, grade: string) {
        this.id = id;
        this.name = name;
        this.grade = grade;
        this.rating = 1500;
    }
    toJson = () => {
        return {
            id: this.id,
            name: this.name,
            grade: this.grade
        };
    };
}

export class GameResult {
    month: number;
    date: String;
    label: String;
    winner: Player;
    loser: Player;
    constructor(
        month: number,
        date: String,
        label: String,
        winner: Player,
        loser: Player
    ) {
        this.month = month;
        this.date = date;
        this.label = label;
        this.winner = winner;
        this.loser = loser;
    }
}
