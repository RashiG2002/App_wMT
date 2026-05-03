const mongoose = require('mongoose');

const SkillSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    skillName: { type: String, required: [true, 'Skill name is required'], trim: true },
    level: { type: String, default: 'Beginner', trim: true },
    targetHours: { type: Number, default: 0, min: 0 },
    practiceLog: [{
        hours: { type: Number, required: true, min: 0.1 },
        date: { type: Date, default: Date.now },
        description: { type: String, trim: true }
    }],
    dateStarted: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Skill', SkillSchema);
