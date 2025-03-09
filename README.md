# Prime Factorization Challenge (Competitive)
# Leaderboard is DOWN until 12th March
[You can access the game here!](https://seojizzz.github.io/runfactor.github.io/)

## Objective
The goal of the game is to factorize as many composite numbers as possible within a time limit of 2 minutes. Players earn points by correctly selecting prime factors and can increase their score through combos, clear bonuses, and perfect clears.

## Gameplay Mechanics

### 1. Generating Numbers
A composite number is generated at the beginning of each round. To ensure uniqueness, previously generated numbers are stored in a list, and new numbers are checked against this list to avoid repetition. The difficulty level influences the complexity of the generated number.

### 2. Answering Questions
Players are given **9 buttons**, each labeled with a prime number from **[2,3,5,7,11,13,17,19,23]**. These primes are categorized into:
- **Easy primes:** [2,3,5,7,11]
- **Hard primes:** [13,17,19,23]

Clicking a button guesses that prime as a factor. If correct, the button highlights **green** (#90EE90), and the composite number is divided by that factor. If incorrect, the button highlights **red** (#FFB6C1).

### 3. Scoring System
#### Default Scoring
Points are awarded based on the prime factor guessed:
- **[2,3,5,7]** → +100 points
- **[11,13,17]** → +300 points
- **[19,23]** → +500 points

#### Combos
Consecutive correct answers activate a combo system:
- **Each additional correct guess grants a bonus of 50 × n**, where **n** is the current combo streak.
- **A wrong answer resets the combo counter.**

#### Clears & Perfect Clears
- **Clear Bonus:** When a number is fully factorized, a bonus of **1000 × m** is added, where **m** is the current question number.
- **Perfect Clear Bonus:** If the number is factorized **without any mistakes**, the bonus is **3500 × (1.05^m)** instead.

#### Consecutive Perfect Clears
- If a player achieves multiple **perfect clears** in a row, they receive an additional bonus:
  - **3500 × (1.618^(k/6))**, where **k** is the number of consecutive perfect clears.

### 4. Answering - Wrong Answers
- Making a wrong guess resets the **combo counter** and **perfect clear streak**.

### 5. Guessing Mechanics
- Clicking a prime factor button counts as a guess.
- If correct, the composite number is divided by the factor, and the score is updated.
- The number display is updated to reflect the new quotient.
- Prime buttons are large squares for easy interaction.

### 6. Time Penalty for Mistakes
- Incorrect guesses apply a time penalty.
- The penalty follows the **Fibonacci sequence**:
  - The **nth mistake** results in a penalty of **(nth Fibonacci number × 0.1 seconds).**

### 7. Timer
- A countdown timer is displayed at the top of the screen.
- The timer has a **precision of 0.01 seconds.**

## Difficulty Scaling
The game's difficulty adjusts based on the player's score:
- **Easy (Score < 35,000):**
  - Composite numbers contain **2 to 4 easy primes**.
  - Primes may repeat.
- **Medium (Score ≥ 35,000):**
  - Composite numbers contain **3 to 5 easy primes**.
  - Multiplied with **1 harder prime** from [13,17,19,23].
- **Hard (Score ≥ 90,000):**
  - Composite numbers contain **4 to 6 easy primes**.
  - Multiplied with **2 harder primes**.
- **Expert (Score ≥ 200,000):**
  - Composite numbers contain **5 to 8 primes**, with **at least 3 harder primes**.

## Additional Features
### 1. Delay in Generating Numbers
Before displaying a new number, the game shows a **"Generating number..."** message for **0.1 seconds** to improve clarity.

### 2. Start Screen
- Players enter a **username**, which is displayed at the **top right** during the game.
- Clicking **Start** initiates a **3-second countdown** before the game begins.

### 3. End Screen
- When the timer reaches **0**, the game ends.
- The **final score** is displayed.
- A list of **correctly factorized numbers** and a separate list of **numbers where mistakes were made** are shown.

### 4. Action Text
- When points are awarded, an **action text** briefly pops up above the main score.
- This text fades out after **0.8 seconds**.
- **Perfect Clear action text** is larger than standard action text.

---
This game challenges players to think critically about prime factorization while providing a competitive scoring system and an engaging interactive experience.

