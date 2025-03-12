// Assume you have a variable that tracks the score during the game:
let currentScore = 0;

class PrimeFactorGame {
    constructor() {
        // Define prime arrays.
        this.easyPrimes = [2, 3, 5, 7, 11];
        this.hardPrimes = [13, 17, 19, 23];
        // Game state.
        this.usedNumbers = new Set();
        this.score = 0;
        this.combo = 0; // Combo persists across questions until a mistake is made.
        this.perfectStreak = 0;
        this.correctList = [];
        this.wrongList = [];
        this.mistakeMade = false;
        this.mistakeCount = 0;
        this.questionNumber = 0;
        this.timeLeft = 120.00;
        this.totalPenalty = 0; // Total penalty applied.
        this.gameRunning = false;
        this.username = this.username;
        this.startTime = null;
        // Current question values.
        this.currentNumber = 0;
        this.originalNumber = 0;
      
        this.bannedWords = ["fuck", "shit", "nigga", "hitler"];
        window.addEventListener("DOMContentLoaded", () => {
          this.bindEvents();
      });
    }
    bindEvents() {
        const buttonsEl = document.getElementById("buttons");
        if (!buttonsEl) {
            console.error("Element with ID 'buttons' not found!");
            return;
        }
        buttonsEl.addEventListener("click", (e) => {
            if (e.target && e.target.classList.contains("prime-btn")) {
                const guessedFactor = parseInt(e.target.textContent, 10);
                this.handleGuess(guessedFactor, e.target);
            }
        });
    }
  
    // Create and render prime buttons.
    createButtons() {
        const buttonsContainer = document.getElementById("buttons");
        buttonsContainer.innerHTML = "";
        [...this.easyPrimes, ...this.hardPrimes].forEach(prime => {
            const button = document.createElement("button");
            button.classList.add("prime-btn");
            button.textContent = prime;
            buttonsContainer.appendChild(button);
        });
    }
    
    // Returns the full factorization as a string.
    getFactorization(number) {
        let n = number;
        let factors = {};
        for (let prime of [...this.easyPrimes, ...this.hardPrimes]) {
            while (n % prime === 0) {
                factors[prime] = (factors[prime] || 0) + 1;
                n /= prime;
            }
        }
        return Object.entries(factors)
            .map(([base, exp]) => exp > 1 ? `${base}^${exp}` : base)
            .join(" × ");
        }
    
    // Starts the game. First, runs a 3-second countdown, then starts the timer and rounds.
    // startGame(username) {
    startGame() {
        // this.username = username;
        // document.getElementById("username-display").innerText = `Player: ${this.username}`;
        // Reset state.
        this.score = 0;
        this.combo = 0;
        // Combo persists until a mistake occurs.
        this.perfectStreak = 0;
        this.mistakeMade = false;
        this.mistakeCount = 0;
        this.questionNumber = 0;
        this.usedNumbers.clear();
        this.timeLeft = 120.00;
        this.totalPenalty = 0;
        this.gameRunning = false;
        
        this.createButtons();
      
      // Run a 3-second countdown.
      let countdown = 3;
      document.getElementById("number-display").innerText = `Starting in ${countdown}...`;
      
      let countdownInterval = setInterval(() => {
        countdown--;
        if (countdown > 0) {
          document.getElementById("number-display").innerText = `Starting in ${countdown}...`;
        } else {
          clearInterval(countdownInterval);
          // Ensure timer display resets to 120.00s.
          document.getElementById("timer-display").innerText = "Time Left: 120.00s";
          // Start the main timer now.
          this.startTime = Date.now();
          this.gameRunning = true;
          this.timerInterval = setInterval(() => this.updateTimer(), 10);
          // Start first round.
          this.newRound();
        }
      }, 1000);
    }
    
    // Updates the timer based on actual elapsed time minus total penalties.
    updateTimer() {
      if (!this.gameRunning) return;
      const elapsed = (Date.now() - this.startTime) / 1000;
      this.timeLeft = Math.max(0, 120 - elapsed - this.totalPenalty);
      document.getElementById("timer-display").innerText = `Time Left: ${this.timeLeft.toFixed(2)}s`;
      if (this.timeLeft <= 0) {
        clearInterval(this.timerInterval);
        this.endGame();
      }
    }
    
    // Generate a new composite number (ensuring uniqueness) and return it.
    setQuestion() {
      let number;
      do {
        number = this.generateCompositeNumber();
      } while (this.usedNumbers.has(number));
      this.usedNumbers.add(number);
      return number;
    }
    
    // Generates a composite number based on current score (difficulty scaling).
    generateCompositeNumber() {
      let score = this.score;
      let numEasy, numHard;
      if (score >= 200000) {
        numEasy = Math.floor(Math.random() * 6) + 2;
        numHard = Math.floor(Math.random() * 4) + 3;
      } else if (score >= 90000) {
        numEasy = Math.floor(Math.random() * 5) + 2;
        numHard = Math.floor(Math.random() * 3) + 2;
      } else if (score >= 35000) {
        numEasy = Math.floor(Math.random() * 4) + 2;
        numHard = 1;
      } else {
        numEasy = Math.floor(Math.random() * 3) + 2;
        numHard = 0;
      }
      let factors = [];
      for (let i = 0; i < numEasy; i++) {
        factors.push(this.easyPrimes[Math.floor(Math.random() * this.easyPrimes.length)]);
      }
      for (let i = 0; i < numHard; i++) {
        factors.push(this.hardPrimes[Math.floor(Math.random() * this.hardPrimes.length)]);
      }
      return factors.reduce((a, b) => a * b, 1);
    }
    
    // Starts a new round by generating a new question.
    newRound() {
      this.questionNumber++;
      this.currentNumber = this.setQuestion();
      this.originalNumber = this.currentNumber; // Save the initial composite number.
      this.mistakeMade = false; // Reset for this question.
      document.getElementById("number-display").innerText = `Factorize: ${this.currentNumber}`;
      // Note: combo remains unchanged unless a mistake occurs.
    }
    
    // Handles a guessed prime.
    handleGuess(prime, button) {
      if (!this.gameRunning) return;
      
      if (this.currentNumber % prime !== 0) {
        // Wrong guess: highlight red.
        button.classList.add("wrong");
        setTimeout(() => button.classList.remove("wrong"), 300);
        this.mistakeMade = true;
        this.combo = 0; // Reset combo.
        this.perfectStreak = 0;
        this.applyPenalty();
        return;
      }
      
      // Correct guess: highlight green.
      button.classList.add("correct");
      setTimeout(() => button.classList.remove("correct"), 300);
      
      // Increase score for this guess.
      this.updateScore(prime);
      this.currentNumber /= prime;
      document.getElementById("number-display").innerText = `Factorize: ${this.currentNumber}`;
      
      if (this.currentNumber === 1) {
        this.completeFactorization();
      }
    }
    
    // Gradually animate score increment (for each correct guess).
    updateScore(prime) {
      let baseScore = this.getBaseScore(prime);
      // Increase combo counter.
      this.combo++;
      let comboBonus = 50 * this.combo;
      let pointsEarned = baseScore + comboBonus;
      
      let currentScore = this.score;
      let targetScore = this.score + pointsEarned;
      let steps = 20;
      let stepValue = (targetScore - currentScore) / steps;
      const scoreDisplay = document.getElementById("score-display");
      const actionText = document.getElementById("action-text");
      
      actionText.innerText = `+${pointsEarned.toFixed(2)}`;
      actionText.style.display = "block";
      actionText.classList.remove("action-popup");
      void actionText.offsetWidth;
      actionText.classList.add("action-popup");
      
      let step = 0;
      let interval = setInterval(() => {
        if (step < steps) {
          currentScore += stepValue;
          this.score = currentScore;
          scoreDisplay.innerText = this.score.toFixed(2);
          step++;
        } else {
          clearInterval(interval);
          this.score = targetScore;
          scoreDisplay.innerText = this.score.toFixed(2);
        }
      }, 50);
    }
    
    getBaseScore(prime) {
      if ([2, 3, 5, 7].includes(prime)) return 100;
      if ([11, 13, 17].includes(prime)) return 300;
      return 500;
    }
    
    // Applies a time penalty for a wrong guess.
    applyPenalty() {
      this.mistakeCount++;
      let penalty = this.fibonacci(this.mistakeCount) * 0.1;
      this.totalPenalty += penalty;
      // Force timer update so penalty is immediately visible.
      this.updateTimer();
    }
    
    fibonacci(n) {
      if (n <= 1) return n;
      let a = 0, b = 1;
      for (let i = 2; i <= n; i++) {
        [a, b] = [b, a + b];
      }
      return b;
    }
    
    // Called when the current question is fully factorized.
    completeFactorization() {
      let m = this.questionNumber;
      let clearBonus = 0;
      if (this.mistakeMade) {
        clearBonus = 1000 * m;
        this.perfectStreak = 0;
      } else {
        clearBonus = 3500 * Math.pow(1.05, m);
        if (this.perfectStreak > 0) {
          clearBonus += 3500 * Math.pow(1.618, this.perfectStreak / 6);
        }
        this.perfectStreak++;
      }
      
      // Animate clear bonus addition.
      this.animateClearBonus(clearBonus);
      
      // Record the initial number for end-of-game reporting.
      if (this.mistakeMade) {
        this.wrongList.push({ number: this.originalNumber, factors: this.getFactorization(this.originalNumber) });
      } else {
        this.correctList.push({ number: this.originalNumber, factors: this.getFactorization(this.originalNumber) });
      }
      
      // Start the next round.
        this.newRound();
    }
    
    // Animates the addition of a bonus (clear bonus) to the score.
    animateClearBonus(bonus) {
        let currentScore = this.score;
        let targetScore = this.score + bonus;
        let steps = 20;
        let stepValue = bonus / steps;
        const scoreDisplay = document.getElementById("score-display");
        const actionText = document.getElementById("action-text");
        
        actionText.innerText = `+${bonus.toFixed(2)}`;
        actionText.style.display = "block";
        actionText.classList.remove("action-popup");
        void actionText.offsetWidth;
        actionText.classList.add("action-popup");
        
        let step = 0;
        let interval = setInterval(() => {
            if (step < steps) {
                currentScore += stepValue;
                this.score = currentScore;
                scoreDisplay.innerText = this.score.toFixed(2);
                step++;
            } else {
                clearInterval(interval);
                this.score = targetScore;
                scoreDisplay.innerText = this.score.toFixed(2);
            }
        }, 50);
    }
    
    // Ends the game and populates the end screen.
    endGame() {
        clearInterval(this.timerInterval);
        this.gameRunning = false;
        document.getElementById("game-screen").style.display = "none";
        document.getElementById("end-screen").style.display = "block";
        document.getElementById("final-score").innerText = `Final Score: ${this.score.toFixed(2)}`;
        
        const correctListElement = document.getElementById("correct-list");
        correctListElement.innerHTML = this.correctList.length > 0 
        ? this.correctList.map(item => `<li title="${item.factors}">${item.number}</li>`).join('')
        : '<li>None</li>';
        
        const wrongListElement = document.getElementById("wrong-list");
        wrongListElement.innerHTML = this.wrongList.length > 0 
        ? this.wrongList.map(item => `<li title="${item.factors}">${item.number}</li>`).join('')
        : '<li>None</li>';
    
        // Example: Call this when the game ends
        // When the game ends, assign currentScore to playerFinalScore:
        let playerFinalScore = currentScore;  // Define the final score variable
        showEndScreen(playerFinalScore);
        fetchLeaderboard();
    }
}

function hideAllScreens() {
    document.getElementById("sign-in-page").style.display = "none";
    document.getElementById("account-options").style.display = "none";
    document.getElementById("existing-account").style.display = "none";
    document.getElementById("game-screen").style.display = "none";
    document.getElementById("end-screen").style.display = "none";
}

// Export your startGame function (already at the bottom):
const game = new PrimeFactorGame();
window.game = game;
export function startGame(username) {
    game.startGame(username);
}

async function fetchLeaderboard() {
  const response = await fetch(sheetURL);
  const data = await response.json();
  data.shift(); // Remove headers

  const tbody = document.querySelector("#leaderboard tbody");
  tbody.innerHTML = ""; 

  data.forEach(row => {
      let tr = document.createElement("tr");
      tr.innerHTML = `<td>${row[0]}</td><td>${row[1]}</td><td>${row[2]}</td><td>${parseFloat(row[3]).toFixed(2)}</td>`;
      tbody.appendChild(tr);
  });

  sortTable(); // Sort initially
}

function showEndScreen(finalScore) {
  // Hide the game screen and show the end screen.
  document.getElementById("game-screen").style.display = "none";
  document.getElementById("end-screen").style.display = "block";
  
  // Display the final score
  document.getElementById("final-score").innerText = `Final Score: ${finalScore.toFixed(2)}`;
  
  // Optionally, store the score for submission later
  localStorage.setItem("finalScore", finalScore);
}

function sortTable() {
  let rows = Array.from(document.querySelectorAll("#leaderboard tbody tr"));
  rows.sort((a, b) => parseFloat(b.children[3].textContent) - parseFloat(a.children[3].textContent));
  rows.forEach(row => document.querySelector("#leaderboard tbody").appendChild(row));
}
