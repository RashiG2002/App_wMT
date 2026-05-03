const express = require('express');
const Skill = require('../models/Skill');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/', auth, async (req, res) => {
    try {
        const newSkill = new Skill({ ...req.body, userId: req.user.id });
        const savedSkill = await newSkill.save();
        res.json(savedSkill);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/', auth, async (req, res) => {
    try {
        const skills = await Skill.find({ userId: req.user.id }).sort({ dateStarted: -1 });
        res.json(skills);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/:id', auth, async (req, res) => {
    try {
        const updatedSkill = await Skill.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedSkill);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/:id/practice', auth, async (req, res) => {
    try {
        const skill = await Skill.findById(req.params.id);
        if (!skill) return res.status(404).json({ error: 'Skill not found' });
        
        skill.practiceLog.push(req.body);
        const savedSkill = await skill.save();
        res.json(savedSkill);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/:id', auth, async (req, res) => {
    try {
        await Skill.findByIdAndDelete(req.params.id);
        res.json({ message: 'Deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
