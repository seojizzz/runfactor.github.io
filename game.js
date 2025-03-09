// 1. Import Firebase Modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-analytics.js";
import { getFirestore, collection, addDoc, getDocs, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import badWordsList from "./badwords.js"; // External file with bad words
import {query, where, orderBy, limit, deleteDoc, doc} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// 2a. Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyDBgRh-t6pJOEZfQanb-T6KYNj_XbL_YP8",
    authDomain: "runfactor-cf724.firebaseapp.com",
    projectId: "runfactor-cf724",
    storageBucket: "runfactor-cf724.firebasestorage.app",
    messagingSenderId: "882591954418",
    appId: "1:882591954418:web:39964ebfa664061fb4a76b",
    measurementId: "G-KWWWHF4NQE"
};

// 2b. Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Sign in anonymously
signInAnonymously(auth)
  .then(() => {
    console.log("Signed in anonymously");
    // You can now start your game logic safely
    startGame();
  })
  .catch((error) => {
    console.error("Authentication error:", error);
  });

// authentication
const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

exports.submitScore = functions.https.onCall((data, context) => {
  // Make sure the user is authenticated.
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "User must be authenticated.");
  }
  
  // Validate the data
  const username = data.username;
  const score = data.score;
  if (typeof username !== "string" || username.trim() === "") {
    throw new functions.https.HttpsError("invalid-argument", "Invalid username");
  }
  if (typeof score !== "number" || score < 0) {
    throw new functions.https.HttpsError("invalid-argument", "Invalid score");
  }

  // Write to Firestore
  return admin.firestore().collection("scores").add({
    username: username,
    score: score,
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
    uid: context.auth.uid,
  });
});

// "Play Anonymously" button handler.
document.getElementById('play-anon-btn').addEventListener('click', () => {
    window.playAnonymously = true; // Set flag for anonymous play.
    alert("Playing anonymously. Your scores won't be saved.");
    showGameScreen(""); // Pass an empty username for anonymous play.
});

document.getElementById('create-account-btn').addEventListener('click', () => {
    const email = document.getElementById('new-email').value.trim();
    const password = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    if (!email || !password || !confirmPassword) {
        alert("Please fill in all fields.");
        return;
    }
    if (password !== confirmPassword) {
        alert("Passwords do not match.");
        return;
    }
    checkEmailExists(email).then(emailExists => {
        if (emailExists) {
            alert("Email already in use. Please choose a different email.");
            return;
        } else {
            // Simulate account creation.
            fakeAccountsDB[currentUsername] = { email, password };
            alert("Account created successfully! Your scores will be saved.");
            showGameScreen(currentUsername);
        }
    });
});

document.getElementById('sign-in-btn').addEventListener('click', () => {
    const password = document.getElementById('existing-password').value;
    const account = fakeAccountsDB[currentUsername];
    if (account && account.password === password) {
        alert("Sign in successful! Welcome back.");
        showGameScreen(currentUsername);
    } else {
        alert("Incorrect password. Please try again.");
    }
});

// 4. Define PrimeFactorGame Class
class PrimeFactorGame {
    constructor() {
        // Initialize game variables...
        this.timer = 120.00;
        this.score = 0;
        this.mistakeCount = 0;
        this.comboStreak = 0;
        this.currentCompositeNumber = 1;
        this.questionNumber = 1;
        this.correctFactorizations = [];
        this.wrongFactorizations = [];
        this.primeNumbers = [2, 3, 5, 7, 11, 13, 17, 19, 23];
        this.bannedWords = ["badword1", "badword2", "anotherbadword"];
        this.bindEvents();
    }
  
  // Set up event listeners in one place
    bindEvents() {
        document.getElementById("buttons").addEventListener("click", (e) => {
        if (e.target && e.target.classList.contains("prime-btn")) {
            const guessedFactor = parseInt(e.target.textContent, 10);
            this.handleGuess(guessedFactor);
        }
        });
    }

      // Creates and renders the prime buttons dynamically
        createButtons() {
            const buttonsContainer = document.getElementById("buttons");
            buttonsContainer.innerHTML = "";
            this.primeNumbers.forEach(prime => {
            const button = document.createElement("button");
            button.classList.add("prime-btn");
            button.textContent = prime;
            buttonsContainer.appendChild(button);
            });
        }

    handleStartClick() {
        const usernameInput = document.getElementById("username");
        const username = usernameInput.value.trim();
        if (username === "" || username.length > 20 || this.checkProfanity(username)) {
          alert("Invalid username.");
          return;
        }
        document.getElementById("start-screen").style.display = "none";
        document.getElementById("game-screen").style.display = "block";
        this.startGame(username);
    }
    
    updateScore(guessedFactor) {
        let baseScore = 0;
        if ([2, 3, 5, 7].includes(guessedFactor)) {
        baseScore = 100;
        } else if ([11, 13, 17].includes(guessedFactor)) {
        baseScore = 300;
        } else if ([19, 23].includes(guessedFactor)) {
        baseScore = 500;
        }
        // Increase the combo streak.
        this.comboStreak++;
        // Combo bonus: each additional correct guess (after the first) gives +50 × (comboStreak-1)
        const comboBonus = 50 * (this.comboStreak - 1);
        const pointsEarned = baseScore + comboBonus;
        this.score += pointsEarned;
    
        // Update the score display.
        document.getElementById("score-display").textContent = this.score;
    
        // Display temporary animation for score increment.
        const actionText = document.getElementById("action-text");
        actionText.textContent = `+${pointsEarned}`;
        actionText.style.display = "block";
        setTimeout(() => {
            actionText.style.display = "none";
        }, 1200);
    }
  
    startGame(username) {
        // Reset game state.
        this.timer = 120.00;
        this.score = 0;
        this.mistakeCount = 0;
        this.comboStreak = 0;
        this.questionNumber = 1;
        
        // Create the prime buttons.
        this.createButtons();
        
        // Start a 3-second countdown before beginning the game.
        let countdown = 3;
        document.getElementById("number-display").innerText = `Starting in ${countdown}...`;
        
        let countdownInterval = setInterval(() => {
            countdown--;
            if (countdown > 0) {
                document.getElementById("number-display").innerText = `Starting in ${countdown}...`;
            } else {
                clearInterval(countdownInterval);
                // When the countdown finishes, generate the first question and start the timer.
                this.setQuestion();
                this.beginGame();
            }
        }, 1000);
    }
    
  
    beginGame() {
        this.timerInterval = setInterval(() => {
            this.timer -= 0.01;
            if (this.timer <= 0) {
                this.endGame();
            }
            this.updateTimerDisplay();
        }, 10);
    }
  
    setQuestion() {
        this.currentCompositeNumber = this.generateCompositeNumber();
        this.updateNumberDisplay();
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
  
    handleGuess(guessedFactor) {
        if (this.currentCompositeNumber % guessedFactor === 0) {
            // Correct guess: update score and the composite number.
            this.updateScore(guessedFactor);
            this.currentCompositeNumber /= guessedFactor;
            this.updateNumberDisplay();
            if (this.currentCompositeNumber === 1) {
                this.newRound();
        }
        } else {
            // Incorrect guess: apply time penalty and reset combo.
            this.applyPenalty();
            this.wrongFactorizations.push(`Guessed ${guessedFactor} in question ${this.questionNumber}`);
            this.comboStreak = 0;
        }
    }

    applyPenalty() {
        this.mistakeCount++;
        const penalty = this.fibonacci(this.mistakeCount) * 0.1;
        this.timer = Math.max(0, this.timer - penalty);
        this.updateTimerDisplay();
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
  
    updateTimerDisplay() {
        document.getElementById("timer-display").textContent = `Time Left: ${this.timer.toFixed(2)}s`;
    }
  
    updateNumberDisplay() {
        document.getElementById("number-display").textContent = `Factorize: ${this.currentCompositeNumber}`;
    }
  
    newRound() {
        // When the current composite number is fully factorized.
        let clearBonus = 0;
        if (!this.roundHadMistake) {
          // Perfect clear: no mistakes made in the round.
          // Use alternative bonus if this is part of a consecutive perfect clear streak.
          if (this.consecutivePerfectClears > 0) {
            // k is the number of consecutive perfect clears including this one.
            let k = this.consecutivePerfectClears + 1;
            clearBonus = 3500 * Math.pow(1.618, k / 6);
          } else {
            // First perfect clear in a row.
            clearBonus = 3500 * Math.pow(1.05, this.questionNumber);
          }
          // Increase the perfect clear streak counter.
          this.consecutivePerfectClears++;
        } else {
          // Not a perfect clear: apply a normal clear bonus.
          clearBonus = 1000 * this.questionNumber;
          // Reset consecutive perfect clear streak.
          this.consecutivePerfectClears = 0;
        }
        // Add the clear bonus to the overall score.
        this.score += clearBonus;
        document.getElementById("score-display").textContent = this.score;
        // Optionally record the round's result.
        this.correctFactorizations.push(`Q${this.questionNumber}: Clear Bonus ${clearBonus.toFixed(2)}`);
        // Reset round-specific variables.
        this.mistakeCount = 0;
        this.comboStreak = 0;
        this.roundHadMistake = false;
        this.questionNumber++;
        // Set up the next question.
        this.setQuestion();
        }
  
    resetGame() {
        // Reset game variables for a new game session
        this.timer = 120.00;
        this.score = 0;
        this.mistakeCount = 0;
    }
  
    endGame() {
        clearInterval(this.timerInterval);
        // Hide game screen and show end screen.
        document.getElementById("game-screen").style.display = "none";
        document.getElementById("end-screen").style.display = "block";
        // Update final score display.
        document.getElementById("final-score").textContent = `Final Score: ${this.score}`;
        // Populate correct factorization list.
        const correctList = document.getElementById("correct-list");
        correctList.innerHTML = "";
        this.correctFactorizations.forEach(item => {
            const li = document.createElement("li");
            li.textContent = item;
            correctList.appendChild(li);
        });
        // Populate wrong factorization list.
        const wrongList = document.getElementById("wrong-list");
        wrongList.innerHTML = "";
        this.wrongFactorizations.forEach(item => {
            const li = document.createElement("li");
            li.textContent = item;
            wrongList.appendChild(li);
        });
    }
    
    checkProfanity(username) {
        // Checks whether the provided username contains any banned/profane words.
        // The logic converts the username to lowercase for a case-insensitive check
        // and then searches for any occurrence of the banned words.
        const lowerUsername = username.toLowerCase();
        return this.bannedWords.some(badWord => lowerUsername.includes(badWord));
    }
    // --------------------------
    // Additional helper methods
    // ---
}

// 5. Define Helper Functions (Leaderboard, Score Submission)
// --- Helper Functions ---
function hideAuthSections() {
    document.getElementById("sign-in-page").style.display = "none";
    document.getElementById("account-options").style.display = "none";
    document.getElementById("existing-account").style.display = "none";
  }
  
  function showGameScreen(username) {
    hideAuthSections();
    document.getElementById("game-screen").style.display = "block";
    if (username) {
      document.getElementById("username-display").textContent = username;
    }
    // Call the exported startGame function from your module.
    startGame(username);
  }


function gameOver() {
    let username = document.getElementById("username").value;
    let scoreText = document.getElementById("score-display").innerText.trim();

    // Remove any non-numeric characters and convert to a number
    let finalScore = parseFloat(scoreText.replace(/[^\d.]/g, ""));

    console.log("Game over! Submitting score:", { username, finalScore });

    if (username && !isNaN(finalScore)) {
        submitScore(username, finalScore);
    } else {
        console.error("Invalid username or score, not submitting.");
    }
}

let leaderboardLoaded = false;

async function loadLeaderboard() {
    if (leaderboardLoaded) return; // Prevent multiple calls

    const q = query(collection(db, "scores"), orderBy("score", "desc"), limit(10));
    const querySnapshot = await getDocs(q);

    let leaderboardTable = document.getElementById("leaderboard").getElementsByTagName("tbody")[0];
    leaderboardTable.innerHTML = ""; // Clear old data

    querySnapshot.forEach((doc, index) => {
        let row = leaderboardTable.insertRow();
        row.insertCell(0).innerText = index + 1;
        row.insertCell(1).innerText = doc.data().username;
        row.insertCell(2).innerText = doc.data().score;
    });

    leaderboardLoaded = true; // Ensure leaderboard only loads once
}

export async function fetchLeaderboard(entriesToShow = 10) {
    console.log("Fetching leaderboard...");

    try {
        const db = getFirestore();
        const leaderboardRef = collection(db, "scores");
        const querySnapshot = await getDocs(leaderboardRef);

        let userScores = new Map(); // Map to store highest score per user

        querySnapshot.forEach((doc) => {
            let data = doc.data();
            let scoreValue = data.finalScore ?? data.score;
            let username = data.username;

            if (username && scoreValue !== undefined) {
                // Store only the highest score for each user
                if (!userScores.has(username) || userScores.get(username) < scoreValue) {
                    userScores.set(username, scoreValue);
                }
            } else {
                console.warn("Document is missing username or score:", data);
            }
        });

        // Convert map to array, sort by score descending
        let leaderboardData = Array.from(userScores.entries())
            .map(([username, finalScore]) => ({ username, finalScore }))
            .sort((a, b) => b.finalScore - a.finalScore);

        updateLeaderboardTable(leaderboardData.slice(0, entriesToShow));

        // Store full leaderboard for "Show More" functionality
        window.fullLeaderboard = leaderboardData;

        console.log("Leaderboard updated!");

    } catch (error) {
        console.error("🔥 Error fetching leaderboard:", error);
    }
}

export function updateLeaderboardTable(data) {
    const leaderboardBody = document.getElementById("leaderboard-body");
    leaderboardBody.innerHTML = ""; 

    data.forEach((entry, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${entry.username || "Unknown"}</td>
            <td>${entry.finalScore || 0}</td>
        `;
        leaderboardBody.appendChild(row);
    });
}

// Call fetchLeaderboard when the end screen is displayed
document.addEventListener("DOMContentLoaded", () => {
    fetchLeaderboard();
});

async function submitScore(username, score) {
    try {
        const scoresRef = collection(db, "scores");

        // Step 1: Fetch all scores by this user
        const q = query(scoresRef, where("username", "==", username), orderBy("score", "desc"));
        const querySnapshot = await getDocs(q);
        let scores = [];

        querySnapshot.forEach(doc => {
            scores.push({ id: doc.id, score: doc.data().score });
        });

        console.log(`Current scores for ${username}:`, scores);

        // Step 2: If 3 or more scores exist, remove the lowest one before adding the new one
        if (scores.length >= 3) {
            let lowestScore = scores[scores.length - 1]; // The lowest score (last one in descending order)
            await deleteDoc(doc(db, "scores", lowestScore.id)); // Remove the lowest score
            console.log(`Deleted lowest score: ${lowestScore.score}`);
        }

        // Step 3: Add the new score
        await addDoc(scoresRef, {
            username: username,
            score: score,
            timestamp: serverTimestamp()
        });

        console.log("Score submitted successfully!");
    } catch (error) {
        console.error("Error submitting score:", error);
    }
}
async function deleteUserScores(username) {
    try {
        const scoresRef = collection(db, "scores");
        const q = query(scoresRef, where("username", "==", username));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            console.log(`No scores found for ${username}.`);
            return;
        }

        let deletedCount = 0;
        for (const document of querySnapshot.docs) {
            await deleteDoc(doc(db, "scores", document.id));
            deletedCount++;
        }

        console.log(`Deleted ${deletedCount} scores for ${username}.`);
    } catch (error) {
        console.error("Error deleting scores:", error);
    }
}
deleteUserScores("Adan Sneg");

// Instantiate the game once.
const game = new PrimeFactorGame();
window.game = game;  // Make it globally accessible.

// Export a function that calls the game instance's startGame method.
export function startGame(username) {
    window.game.startGame(username);
}
