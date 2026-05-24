const K = 32;

/**
 * Calculate Elo rating change
 * @returns { player1Change, player2Change }
 */
exports.calculateRatingChange = (rating1, rating2, result) => {
  // result: 'player1' | 'player2' | 'draw'
  const expected1 = 1 / (1 + Math.pow(10, (rating2 - rating1) / 400));
  const expected2 = 1 - expected1;

  let score1, score2;
  if (result === 'player1') { score1 = 1; score2 = 0; }
  else if (result === 'player2') { score1 = 0; score2 = 1; }
  else { score1 = 0.5; score2 = 0.5; }

  return {
    player1Change: Math.round(K * (score1 - expected1)),
    player2Change: Math.round(K * (score2 - expected2)),
  };
};
