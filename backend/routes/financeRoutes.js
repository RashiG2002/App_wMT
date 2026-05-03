const express = require('express');
const Finance = require('../models/Finance');
const auth = require('../middleware/auth');

const router = express.Router();

// POST /api/finance - Add new financial entry
router.post('/', auth, async (req, res) => {
    try {
        const newFinance = new Finance({ ...req.body, userId: req.user.id });
        const savedFinance = await newFinance.save();
        res.json(savedFinance);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/finance - Get all financial entries
// Example Response: [{_id: "123", userId: "456", type: "income", amount: 1000, category: "Salary", description: "Monthly salary", date: "2022-01-01"}]
router.get('/', auth, async (req, res) => {
    try {
        const finances = await Finance.find({ userId: req.user.id }).sort({ date: -1 });
        res.json(finances);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// UPDATE /api/finance/:id - Update a financial entry
router.put('/:id', auth, async (req, res) => {
    try {
        const updatedFinance = await Finance.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedFinance);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/finance/:id - Delete a financial entry
// Example: DELETE /api/finance/123

router.delete('/:id', auth, async (req, res) => {
    try {
        await Finance.findByIdAndDelete(req.params.id);
        res.json({ message: 'Deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
