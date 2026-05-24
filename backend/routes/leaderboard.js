const express = require('express');
const router = express.Router();
const User = require('../models/User');

// GET /api/leaderboard
router.get('/', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 50, 100);
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find({ totalMatches: { $gt: 0 } })
        .sort({ rating: -1, wins: -1 })
        .skip(skip)
        .limit(limit)
        .select('username rating wins losses draws totalMatches codeforcesHandle isOnline lastSeen createdAt'),
      User.countDocuments({ totalMatches: { $gt: 0 } }),
    ]);

    res.json({
      success: true,
      users,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
