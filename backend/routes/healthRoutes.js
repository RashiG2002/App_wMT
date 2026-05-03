const express = require('express');
const Health = require('../models/Health');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/', auth, async (req, res) => {
    try {
        const newHealth = new Health({ ...req.body, userId: req.user.id });
        const savedHealth = await newHealth.save();
        res.json(savedHealth);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/', auth, async (req, res) => {
    try {
        const healthData = await Health.find({ userId: req.user.id }).sort({ date: -1 });
        res.json(healthData);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/:id', auth, async (req, res) => {
    try {
        const updatedHealth = await Health.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedHealth);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/:id', auth, async (req, res) => {
    try {
        await Health.findByIdAndDelete(req.params.id);
        res.json({ message: 'Deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
