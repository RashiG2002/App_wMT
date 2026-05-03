const express = require('express');
const Finance = require('../models/Finance');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/', auth, async (req, res) => {
    try {
        const newFinance = new Finance({ ...req.body, userId: req.user.id });
        const savedFinance = await newFinance.save();
        res.json(savedFinance);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/', auth, async (req, res) => {
    try {
        const finances = await Finance.find({ userId: req.user.id }).sort({ date: -1 });
        res.json(finances);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/:id', auth, async (req, res) => {
    try {
        await Finance.findByIdAndDelete(req.params.id);
        res.json({ message: 'Deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
