const mongoose = require('mongoose');

const SkillSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    skillName: { type: String, required: true },
    level: { type: String, default: 'Beginner' },
    targetHours: { type: Number, default: 0 },
    practiceLog: [{
        hours: { type: Number, required: true },
        date: { type: Date, default: Date.now },
        description: { type: String }
    }],
    dateStarted: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Skill', SkillSchema);
