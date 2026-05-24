const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { validateHandle } = require('../utils/codeforces');

// GET /api/users/:username/profile
router.get('/:username/profile', async (req, res, next) => {
  try {
    const user = await User.findOne({ username: req.params.username }).select(
      '-password -email -socketId'
    );
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
});

// GET /api/users/:username/history
router.get('/:username/history', async (req, res, next) => {
  try {
    const user = await User.findOne({ username: req.params.username }).select('matchHistory username');
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    res.json({ success: true, history: user.matchHistory.slice(0, 20) });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/users/me - update profile
router.patch('/me', protect, async (req, res, next) => {
  try {
    const { codeforcesHandle } = req.body;
    const updates = {};

    if (codeforcesHandle !== undefined) {
      if (codeforcesHandle) {
        const valid = await validateHandle(codeforcesHandle);
        if (!valid) return res.status(400).json({ success: false, error: 'Invalid Codeforces handle' });
      }
      updates.codeforcesHandle = codeforcesHandle;
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
    res.json({ success: true, user: user.toPublicJSON() });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
