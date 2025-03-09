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
// const functions = require("firebase-functions");
// const admin = require("firebase-admin");
// admin.initializeApp();

// exports.submitScore = functions.https.onCall((data, context) => {
//   // Make sure the user is authenticated.
//   if (!context.auth) {
//     throw new functions.https.HttpsError("unauthenticated", "User must be authenticated.");
//   }
  
//   // Validate the data
//   const username = data.username;
//   const score = data.score;
//   if (typeof username !== "string" || username.trim() === "") {
//     throw new functions.https.HttpsError("invalid-argument", "Invalid username");
//   }
//   if (typeof score !== "number" || score < 0) {
//     throw new functions.https.HttpsError("invalid-argument", "Invalid score");
//   }

//   // Write to Firestore
//   return admin.firestore().collection("scores").add({
//     username: username,
//     score: score,
//     timestamp: admin.firestore.FieldValue.serverTimestamp(),
//     uid: context.auth.uid,
//   });
// });

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
      this.easyPrimes = [2, 3, 5, 7, 11];
      this.hardPrimes = [13, 17, 19, 23];
      this.usedNumbers = new Set();
      this.score = 0;
      this.combo = 0; // Combo bonus persists across questions unless a mistake occurs.
      this.perfectStreak = 0;
      this.correctList = [];
      this.wrongList = [];
      this.mistakeMade = false;
      this.mistakeCount = 0;
      this.questionNumber = 0;
      this.timeLeft = 120.00;
      this.gameRunning = false;
      this.username = "";
      this.startTime = null;
      // To store the initial composite number for the current question.
      this.originalNumber = 0;
      
      this.bindEvents();
    }
    
    // Set up event listener for prime buttons.
    bindEvents() {
      document.getElementById("buttons").addEventListener("click", (e) => {
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
      // Create a button for each prime (both easy and hard).
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
    
    // Starts the game with a 3-second countdown.
    startGame(username) {
      this.username = username || "Player";
      document.getElementById("username-display").innerText = `Player: ${this.username}`;
      // Reset game state.
      this.score = 0;
      this.combo = 0;
      this.perfectStreak = 0;
      this.mistakeMade = false;
      this.mistakeCount = 0;
      this.questionNumber = 0;
      this.usedNumbers.clear();
      this.timeLeft = 120.00;
      this.gameRunning = false;
      
      this.createButtons();
      
      // Start a 3-second countdown BEFORE starting the timer.
      let countdown = 3;
      document.getElementById("number-display").innerText = `Starting in ${countdown}...`;
      
      let countdownInterval = setInterval(() => {
        countdown--;
        if (countdown > 0) {
          document.getElementById("number-display").innerText = `Starting in ${countdown}...`;
        } else {
          clearInterval(countdownInterval);
          console.log("Countdown finished. Starting game timer...");
          // Set start time here so timer measures actual game duration.
          this.startTime = Date.now();
          this.gameRunning = true;
          this.timerInterval = setInterval(() => this.updateTimer(), 10);
          // Generate the first question.
          this.newRound();
        }
      }, 1000);
    }
    
    // Updates the timer display based on elapsed time.
    updateTimer() {
      if (!this.gameRunning) return;
      const elapsedTime = (Date.now() - this.startTime) / 1000;
      this.timeLeft = Math.max(0, 120 - elapsedTime);
      document.getElementById("timer-display").innerText = `Time Left: ${this.timeLeft.toFixed(2)}s`;
      if (this.timeLeft <= 0) {
        clearInterval(this.timerInterval);
        this.endGame();
      }
    }
    
    // Generates a new composite number and returns it.
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
    
    // Starts a new round by generating a new question.
    newRound() {
      this.questionNumber++;
      // Get new composite number and save the original.
      this.currentNumber = this.setQuestion();
      this.originalNumber = this.currentNumber;
      this.mistakeMade = false; // Reset mistake flag for the new question.
      document.getElementById("number-display").innerText = `Factorize: ${this.currentNumber}`;
      // Note: combo (and thus bonus) is not reset here.
    }
    
    // Handles a guessed prime and highlights the button.
    handleGuess(prime, button) {
      if (!this.gameRunning) return;
      
      if (this.currentNumber % prime !== 0) {
        // Wrong guess: highlight button red.
        button.classList.add("wrong");
        setTimeout(() => button.classList.remove("wrong"), 300);
        this.mistakeMade = true;
        this.combo = 0; // Reset combo on mistake.
        this.perfectStreak = 0;
        this.applyPenalty();
        return;
      }
      
      // Correct guess: highlight button green.
      button.classList.add("correct");
      setTimeout(() => button.classList.remove("correct"), 300);
      
      // Update score for this guess.
      this.updateScore(prime);
      // Update current composite number.
      this.currentNumber /= prime;
      document.getElementById("number-display").innerText = `Factorize: ${this.currentNumber}`;
      
      if (this.currentNumber === 1) {
        // If completely factorized, complete the question.
        this.completeFactorization();
      }
    }
    
    // Gradually increases score and shows the action text.
    updateScore(prime) {
      let baseScore = this.getBaseScore(prime);
      // Increment combo counter on each correct guess.
      this.combo++;
      // Combo bonus is 50×combo (and is not reset when a new question is generated).
      let comboBonus = 50 * this.combo;
      let pointsEarned = baseScore + comboBonus;
      
      // Increase score gradually.
      let currentScore = this.score;
      let targetScore = this.score + pointsEarned;
      let steps = 20;
      let stepValue = (targetScore - currentScore) / steps;
      const scoreDisplay = document.getElementById("score-display");
      const actionText = document.getElementById("action-text");
      actionText.innerText = `+${pointsEarned.toFixed(2)}`;
      actionText.style.display = "block";
      actionText.classList.remove("action-popup");
      void actionText.offsetWidth; // Force reflow to restart animation.
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
    
    // Applies a time penalty for an incorrect guess.
    applyPenalty() {
      this.mistakeCount++;
      let penalty = this.fibonacci(this.mistakeCount) * 0.1;
      this.timeLeft = Math.max(0, this.timeLeft - penalty);
    }
    
    fibonacci(n) {
      if (n <= 1) return n;
      let a = 0, b = 1;
      for (let i = 2; i <= n; i++) {
        [a, b] = [b, a + b];
      }
      return b;
    }
    
    // Called when the question is fully factorized.
    completeFactorization() {
      let m = this.questionNumber;
      let clearBonus = 0;
      if (this.mistakeMade) {
        clearBonus = 1000 * m; // Normal clear bonus if a mistake was made.
        this.perfectStreak = 0;
      } else {
        clearBonus = 3500 * Math.pow(1.05, m); // Perfect clear bonus.
        this.perfectStreak++;
      }
      // Add clear bonus to score.
      this.score += clearBonus;
      document.getElementById("score-display").innerText = this.score.toFixed(2);
      
      // Record the initial number for reporting.
      if (this.mistakeMade) {
        this.wrongList.push({ number: this.originalNumber, factors: this.getFactorization(this.originalNumber) });
      } else {
        this.correctList.push({ number: this.originalNumber, factors: this.getFactorization(this.originalNumber) });
      }
      
      // Start next round.
      this.newRound();
    }
    
    // Ends the game and displays the end screen.
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
      
      gameOver();
    }
    
    // Checks whether the given username contains profanity.
    checkProfanity(username) {
      const lowerUsername = username.toLowerCase();
      return this.bannedWords.some(badWord => lowerUsername.includes(badWord));
    }
  }
  
  // 6. Initialize the game object and export startGame.
  const game = new PrimeFactorGame();
  window.game = game;
  export function startGame() {
    game.startGame();
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

// let leaderboardLoaded = false;

// async function loadLeaderboard() {
//     if (leaderboardLoaded) return; // Prevent multiple calls

//     const q = query(collection(db, "scores"), orderBy("score", "desc"), limit(10));
//     const querySnapshot = await getDocs(q);

//     let leaderboardTable = document.getElementById("leaderboard").getElementsByTagName("tbody")[0];
//     leaderboardTable.innerHTML = ""; // Clear old data

//     querySnapshot.forEach((doc, index) => {
//         let row = leaderboardTable.insertRow();
//         row.insertCell(0).innerText = index + 1;
//         row.insertCell(1).innerText = doc.data().username;
//         row.insertCell(2).innerText = doc.data().score;
//     });

//     leaderboardLoaded = true; // Ensure leaderboard only loads once
// }

// export async function fetchLeaderboard(entriesToShow = 10) {
//     console.log("Fetching leaderboard...");

//     try {
//         const db = getFirestore();
//         const leaderboardRef = collection(db, "scores");
//         const querySnapshot = await getDocs(leaderboardRef);

//         let userScores = new Map(); // Map to store highest score per user

//         querySnapshot.forEach((doc) => {
//             let data = doc.data();
//             let scoreValue = data.finalScore ?? data.score;
//             let username = data.username;

//             if (username && scoreValue !== undefined) {
//                 // Store only the highest score for each user
//                 if (!userScores.has(username) || userScores.get(username) < scoreValue) {
//                     userScores.set(username, scoreValue);
//                 }
//             } else {
//                 console.warn("Document is missing username or score:", data);
//             }
//         });

//         // Convert map to array, sort by score descending
//         let leaderboardData = Array.from(userScores.entries())
//             .map(([username, finalScore]) => ({ username, finalScore }))
//             .sort((a, b) => b.finalScore - a.finalScore);

//         updateLeaderboardTable(leaderboardData.slice(0, entriesToShow));

//         // Store full leaderboard for "Show More" functionality
//         window.fullLeaderboard = leaderboardData;

//         console.log("Leaderboard updated!");

//     } catch (error) {
//         console.error("🔥 Error fetching leaderboard:", error);
//     }
// }

// export function updateLeaderboardTable(data) {
//     const leaderboardBody = document.getElementById("leaderboard-body");
//     leaderboardBody.innerHTML = ""; 

//     data.forEach((entry, index) => {
//         const row = document.createElement("tr");
//         row.innerHTML = `
//             <td>${index + 1}</td>
//             <td>${entry.username || "Unknown"}</td>
//             <td>${entry.finalScore || 0}</td>
//         `;
//         leaderboardBody.appendChild(row);
//     });
// }

// // Call fetchLeaderboard when the end screen is displayed
// document.addEventListener("DOMContentLoaded", () => {
//     fetchLeaderboard();
// });

// async function submitScore(username, score) {
//     try {
//         const scoresRef = collection(db, "scores");

//         // Step 1: Fetch all scores by this user
//         const q = query(scoresRef, where("username", "==", username), orderBy("score", "desc"));
//         const querySnapshot = await getDocs(q);
//         let scores = [];

//         querySnapshot.forEach(doc => {
//             scores.push({ id: doc.id, score: doc.data().score });
//         });

//         console.log(`Current scores for ${username}:`, scores);

//         // Step 2: If 3 or more scores exist, remove the lowest one before adding the new one
//         if (scores.length >= 3) {
//             let lowestScore = scores[scores.length - 1]; // The lowest score (last one in descending order)
//             await deleteDoc(doc(db, "scores", lowestScore.id)); // Remove the lowest score
//             console.log(`Deleted lowest score: ${lowestScore.score}`);
//         }

//         // Step 3: Add the new score
//         await addDoc(scoresRef, {
//             username: username,
//             score: score,
//             timestamp: serverTimestamp()
//         });

//         console.log("Score submitted successfully!");
//     } catch (error) {
//         console.error("Error submitting score:", error);
//     }
// }
// async function deleteUserScores(username) {
//     try {
//         const scoresRef = collection(db, "scores");
//         const q = query(scoresRef, where("username", "==", username));
//         const querySnapshot = await getDocs(q);

//         if (querySnapshot.empty) {
//             console.log(`No scores found for ${username}.`);
//             return;
//         }

//         let deletedCount = 0;
//         for (const document of querySnapshot.docs) {
//             await deleteDoc(doc(db, "scores", document.id));
//             deletedCount++;
//         }

//         console.log(`Deleted ${deletedCount} scores for ${username}.`);
//     } catch (error) {
//         console.error("Error deleting scores:", error);
//     }
// }

const game = new PrimeFactorGame();
window.game = game;
export function startGame(username) {
    game.startGame(username);
}
