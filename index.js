const crypto = require("crypto");

class Game {
  constructor(moves) {
    this.moves = moves;
    this.rules = this.generateRules();
    this.key = this.generateKey();
  }

  generateRules() {
    const rules = {};
    const len = this.moves.length;

    for (let i = 0; i < len; i++) {
      rules[this.moves[i]] = this.moves
        .slice(i + 1)
        .concat(this.moves.slice(0, i));
    }

    return rules;
  }

  generateKey() {
    return crypto.randomBytes(32).toString("hex");
  }

  calculateHMAC(move) {
    const hmac = crypto.createHmac("sha256", this.key);
    hmac.update(move);
    return hmac.digest("hex");
  }

  getRandomMove() {
    const randomIndex = crypto.randomInt(0, this.moves.length);
    return this.moves[randomIndex];
  }

  play(userMove) {
    if (!this.moves.includes(userMove)) {
      console.log("Invalid move. Available moves:", this.moves.join(", "));
      return;
    }

    const computerMove = this.getRandomMove();
    const hmac = this.calculateHMAC(userMove);

    console.log(`Computer's move: ${computerMove}`);
    console.log(`HMAC: ${hmac}`);

    const userIndex = this.moves.indexOf(userMove);
    const computerIndex = this.moves.indexOf(computerMove);

    if (this.rules[userMove][userIndex] === computerMove) {
      console.log("You win!");
    } else if (this.rules[userMove][computerIndex] === computerMove) {
      console.log("Computer wins.");
    } else {
      console.log("It's a draw.");
    }
  }
}

class TableGenerator {
  constructor(moves, rules) {
    this.moves = moves;
    this.rules = rules;
    this.table = this.generateTable();
  }

  generateTable() {
    const table = [[""].concat(this.moves)];

    for (const move of this.moves) {
      const row = [move];

      for (const opponentMove of this.moves) {
        if (move === opponentMove) {
          row.push("Draw");
        } else {
          const index = this.moves.indexOf(move);
          const opponentIndex = this.moves.indexOf(opponentMove);

          if (this.rules[move][index] === opponentMove) {
            row.push("Win");
          } else if (this.rules[move][opponentIndex] === opponentMove) {
            row.push("Lose");
          } else {
            row.push("-");
          }
        }
      }

      table.push(row);
    }

    return table;
  }

  printTable() {
    console.log("Rules:");
    for (const row of this.table) {
      console.log(row.join("\t"));
    }
  }
}

const args = process.argv.slice(2);
if (args.length < 3 || args.length % 2 === 0) {
  console.log(
    "Incorrect number of arguments. Please provide an odd number of unique moves."
  );
  console.log("Example: node script_name.js rock Spock paper lizard scissors");
} else {
  const game = new Game(args);
  const tableGenerator = new TableGenerator(args, game.rules);

  console.log("Available moves:");
  for (let i = 0; i < args.length; i++) {
    console.log(`${i + 1} - ${args[i]}`);
  }
  console.log("0 - Exit");
  console.log("? - Help");

  const readline = require("readline").createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  readline.question("Select your move: ", (choice) => {
    if (choice === "0") {
      console.log("Goodbye!");
    } else if (choice === "?") {
      tableGenerator.printTable();
    } else {
      const index = parseInt(choice);
      if (index >= 1 && index <= args.length) {
        const userMove = args[index - 1];
        game.play(userMove);
      } else {
        console.log("Invalid choice. Please select a valid option.");
      }
    }

    readline.close();
  });
}