(async () => {
  const db = getFirestore();
  const scoresRef = collection(db, "scores");
  // Order by finalScore (or "score" if you're using that field) descending.
  const q = query(scoresRef, orderBy("finalScore", "desc"));
  const querySnapshot = await getDocs(q);
  
  // Gather all scores into an array.
  const allScores = [];
  querySnapshot.forEach((docSnap) => {
    allScores.push({ id: docSnap.id, ...docSnap.data() });
  });
  
  // Sort the scores array descending (in case the orderBy wasn't sufficient).
  allScores.sort((a, b) => b.finalScore - a.finalScore);
  
  // Keep only the top 20.
  const top20 = allScores.slice(0, 20);
  const toDelete = allScores.slice(20);
  
  // Delete the documents beyond the top 20.
  for (const score of toDelete) {
    await deleteDoc(doc(db, "scores", score.id));
  }
  
  console.log("Top 20 scores:", top20);
  // Optionally, you can also view it as a table:
  console.table(top20);
})();
