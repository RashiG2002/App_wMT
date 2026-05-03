const mongoose = require('mongoose');

const BudgetSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    category: { type: String, required: [true, 'Category is required'], trim: true },
    limit: { type: Number, required: [true, 'Limit is required'], min: [1, 'Limit must be at least 1'] },
    month: { type: String, required: true, match: [/^\d{4}-\d{2}$/, 'Please use YYYY-MM format'] }, // Format: YYYY-MM
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Budget', BudgetSchema);
