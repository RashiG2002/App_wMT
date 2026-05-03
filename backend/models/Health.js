const mongoose = require('mongoose');

const HealthSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['daily_stat', 'activity'], default: 'activity' },
    activityType: { type: String },
    duration: { type: Number }, // in minutes
    calories: { type: Number },
    notes: { type: String },
    waterIntake: { type: Number },
    sleepDuration: { type: Number },
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Health', HealthSchema);
