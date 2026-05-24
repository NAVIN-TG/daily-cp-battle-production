const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema(
  {
    roomId: {
      type: String,
      required: true,
      unique: true,
    },
    player1: {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      username: String,
      codeforcesHandle: String,
      socketId: String,
      solved: { type: Boolean, default: false },
      solvedAt: Date,
      ratingChange: { type: Number, default: 0 },
      ready: { type: Boolean, default: false },
    },
    player2: {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      username: String,
      codeforcesHandle: String,
      socketId: String,
      solved: { type: Boolean, default: false },
      solvedAt: Date,
      ratingChange: { type: Number, default: 0 },
      ready: { type: Boolean, default: false },
    },
    problem: {
      contestId: Number,
      index: String,
      title: String,
      url: String,
      rating: Number,
      tags: [String],
    },
    status: {
      type: String,
      enum: ['waiting', 'active', 'completed', 'abandoned'],
      default: 'waiting',
    },
    winner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    winnerUsername: String,
    startTime: Date,
    endTime: Date,
    duration: { type: Number, default: 30 }, // minutes
    inviteCode: { type: String, unique: true, sparse: true },
    isPrivate: { type: Boolean, default: false },
    matchType: {
      type: String,
      enum: ['public', 'private', 'invite'],
      default: 'public',
    },
    difficulty: {
      type: Number,
      default: 1200,
    },
    ratingRange: {
      min: { type: Number, default: 800 },
      max: { type: Number, default: 3500 },
    },
  },
  { timestamps: true }
);

matchSchema.index({ status: 1, createdAt: -1 });
matchSchema.index({ 'player1.userId': 1 });
matchSchema.index({ 'player2.userId': 1 });

module.exports = mongoose.model('Match', matchSchema);
