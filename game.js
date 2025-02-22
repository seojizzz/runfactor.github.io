class PrimeFactorGame {
    constructor() {
        this.easyPrimes = [2, 3, 5, 7, 11];
        this.hardPrimes = [13, 17, 19, 23];
        this.usedNumbers = new Set();
        this.score = 0;
        this.combo = 0;
        this.perfectStreak = 0;
        this.correctList = [];
        this.wrongList = [];
        this.mistakeMade = false;
        this.mistakeCount = 0;
        this.questionNumber = 0;
        this.timeLeft = 120.00;
        this.gameRunning = false;
        this.username = "";
        this.difficultyThresholds = [35000, 90000, 200000];
    }

    handleGuess(prime, button) {
        if (!this.gameRunning) return;
    
        if (this.currentNumber % prime !== 0) {
            button.classList.add("wrong"); // Shake animation
            setTimeout(() => button.classList.remove("wrong"), 500);
            this.mistakeMade = true;
            this.combo = 0;
            this.perfectStreak = 0;
            this.applyPenalty();
            return;
        }
    
        button.classList.add("correct"); // Highlight correct answer
        setTimeout(() => button.classList.remove("correct"), 500);
        this.currentNumber /= prime;
        this.updateScore(prime);
        document.getElementById("number-display").innerText = `Factorize: ${this.currentNumber}`;
    
        if (this.currentNumber === 1) {
            this.completeFactorization();
        }
    }
    

    updateScore(prime) {
        let baseScore = this.getBaseScore(prime);
        let comboBonus = 50 * this.combo;
        this.score += baseScore + comboBonus;
        this.combo++;
    
        let scoreElement = document.getElementById("score-display");
        scoreElement.innerText = `Score: ${this.score.toFixed(1)}`;
        scoreElement.classList.add("score-update"); // Pop animation
    
        setTimeout(() => scoreElement.classList.remove("score-update"), 300);
    }
    

    getBaseScore(prime) {
        if ([2, 3, 5, 7].includes(prime)) return 100;
        if ([11, 13, 17].includes(prime)) return 300;
        return 500;
    }

    completeFactorization() {
        let clearBonus = 1000 * this.questionNumber;
        let perfectBonus = 3500 * Math.pow(1.05, this.questionNumber);
        let streakBonus = 3500 * Math.pow(1.618, Math.sqrt(this.perfectStreak));
        
        let factorization = this.getFactorization(this.originalNumber);

        if (this.mistakeMade) {
            this.wrongList.push({ number: this.originalNumber, factors: factorization });
            this.score += clearBonus;
            this.perfectStreak = 0;
        } else {
            this.correctList.push({ number: this.originalNumber, factors: factorization });
            this.score += this.perfectStreak > 0 ? streakBonus : perfectBonus;
            this.perfectStreak++;
        }

        document.getElementById("score-display").innerText = `Score: ${this.score.toFixed(1)}`;
        this.newRound();
    }

    applyPenalty() {
        this.mistakeCount++;
        let penalty = this.fibonacci(this.mistakeCount) * 0.1;
        this.timeLeft -= penalty;
        if (this.timeLeft < 0) this.timeLeft = 0;
    }

    fibonacci(n) {
        if (n <= 1) return n;
        let a = 0, b = 1, temp;
        for (let i = 2; i <= n; i++) {
            temp = a + b;
            a = b;
            b = temp;
        }
        return b;
    }

    updateTimer() {
        if (!this.gameRunning) return;
        if (this.timeLeft <= 0) {
            clearInterval(this.timerInterval);
            this.endGame();
            return;
        }
        this.timeLeft = Math.max(0, this.timeLeft - 0.01);
        document.getElementById("timer-display").innerText = `Time Left: ${this.timeLeft.toFixed(2)}s`;
    }

    endGame() {
        // Ensure elements exist before modifying them
        const endScreen = document.getElementById("end-screen");
        const finalScoreElement = document.getElementById("final-score");
        const correctListElement = document.getElementById("correct-list");
        const wrongListElement = document.getElementById("wrong-list");
    
        if (!endScreen || !finalScoreElement || !correctListElement || !wrongListElement) {
            console.error("End screen elements not found!");
            return;
        }
    
        document.getElementById("game-screen").style.display = "none";
        endScreen.style.display = "block";
    
        finalScoreElement.innerText = `Final Score: ${this.score.toFixed(1)}`;
    
        correctListElement.innerHTML = this.correctList.length > 0 
            ? this.correctList.map(q => `<li title="${q.factors}">${q.number}</li>`).join('') 
            : '<li>None</li>';
    
        wrongListElement.innerHTML = this.wrongList.length > 0 
            ? this.wrongList.map(q => `<li title="${q.factors}">${q.number}</li>`).join('') 
            : '<li>None</li>';
    }
    


    startGame() {
        this.username = document.getElementById("username").value || "Player";
        document.getElementById("username-display").innerText = `Player: ${this.username}`;
        document.getElementById("start-screen").style.display = "none";
        document.getElementById("game-screen").style.display = "block";
        
        let countdown = 3;
        document.getElementById("number-display").innerText = `Starting in ${countdown}...`;
        let countdownInterval = setInterval(() => {
            countdown--;
            if (countdown > 0) {
                document.getElementById("number-display").innerText = `Starting in ${countdown}...`;
            } else {
                clearInterval(countdownInterval);
                this.beginGame();
            }
        }, 1000);
    }

    createButtons() {
        const buttonContainer = document.getElementById("buttons");
        buttonContainer.innerHTML = "";
        
        [...this.easyPrimes, ...this.hardPrimes].forEach(prime => {
            let btn = document.createElement("button");
            btn.innerText = prime;
            btn.classList.add("prime-btn");
            btn.onclick = () => this.handleGuess(prime, btn);
            buttonContainer.appendChild(btn);
        });
    }
    

    beginGame() {
        this.gameRunning = true;
        this.createButtons();
        this.newRound(); // Ensure first round starts immediately
        this.timerInterval = setInterval(() => this.updateTimer(), 10);
    }

    newRound() {
        this.mistakeMade = false;
        this.currentNumber = this.setQuestion();
        this.originalNumber = this.currentNumber;
        document.getElementById("number-display").innerText = `Factorize: ${this.currentNumber}`;
    }

    setQuestion() {
        let number;
        do {
            number = this.generateCompositeNumber();
        } while (this.usedNumbers.has(number));
        
        this.usedNumbers.add(number);
        return number;
    }

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

    getFactorization(number) {
        let n = number;
        let factors = {};
        for (let prime of [...this.easyPrimes, ...this.hardPrimes]) {
            while (n % prime === 0) {
                factors[prime] = (factors[prime] || 0) + 1;
                n /= prime;
            }
        }
        return Object.entries(factors).map(([base, exp]) => exp > 1 ? `${base}^${exp}` : base).join(" × ");
    }


}

const game = new PrimeFactorGame();
function startGame() {
    game.startGame();
}
