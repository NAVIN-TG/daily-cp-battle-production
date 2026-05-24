const axios = require('axios');

const CF_API = 'https://codeforces.com/api';

const DIFFICULTY_MAP = {
  easy:   { min: 800,  max: 1200 },
  medium: { min: 1300, max: 1800 },
  hard:   { min: 1900, max: 3500 },
  any:    { min: 800,  max: 3500 },
};

exports.getRandomProblem = async (difficulty = 'any', excludeIds = []) => {
  let min, max;
  if (typeof difficulty === 'number' || /^\d+$/.test(String(difficulty))) {
    const r = parseInt(difficulty, 10);
    min = r;
    max = r + 99;
  } else {
    ({ min, max } = DIFFICULTY_MAP[difficulty] ?? DIFFICULTY_MAP.any);
  }
  // ... rest of function stays the same

  const url = `${CF_API}/problemset.problems`;
  const { data } = await axios.get(url, { timeout: 8000 });

  if (data.status !== 'OK') throw new Error('Codeforces API error');

  const problems = data.result.problems.filter(
    (p) =>
      p.rating >= min &&
      p.rating <= max &&
      p.type === 'PROGRAMMING' &&
      !excludeIds.includes(`${p.contestId}${p.index}`)
  );

  if (!problems.length) throw new Error('No suitable problems found');

  const problem = problems[Math.floor(Math.random() * problems.length)];
  return {
    contestId: problem.contestId,
    index: problem.index,
    title: problem.name,
    url: `https://codeforces.com/problemset/problem/${problem.contestId}/${problem.index}`,
    rating: problem.rating,
    tags: problem.tags || [],
  };
};

/**
 * Check if a user has solved a specific problem after a given time
 */
exports.checkSolved = async (handle, contestId, problemIndex, afterTime) => {
  try {
    const url = `${CF_API}/user.status?handle=${encodeURIComponent(handle)}&from=1&count=30`;
    const { data } = await axios.get(url, { timeout: 8000 });

    if (data.status !== 'OK') return false;

    const after = new Date(afterTime).getTime() / 1000;

    return data.result.some(
      (sub) =>
        sub.verdict === 'OK' &&
        sub.problem.contestId === contestId &&
        sub.problem.index === problemIndex &&
        sub.creationTimeSeconds >= after
    );
  } catch {
    return false;
  }
};

/**
 * Validate that a Codeforces handle exists
 */
exports.validateHandle = async (handle) => {
  try {
    const { data } = await axios.get(
      `${CF_API}/user.info?handles=${encodeURIComponent(handle)}`,
      { timeout: 5000 }
    );
    return data.status === 'OK';
  } catch {
    return false;
  }
};
