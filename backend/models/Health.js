const mongoose = require('mongoose');

const HealthSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['daily_stat', 'activity'], default: 'activity' },
    activityType: { type: String, trim: true },
    duration: { type: Number, min: 0 }, // in minutes
    calories: { type: Number, min: 0 },
    notes: { type: String, trim: true },
    waterIntake: { type: Number, min: 0 },
    sleepDuration: { type: Number, min: 0 },
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Health', HealthSchema);
