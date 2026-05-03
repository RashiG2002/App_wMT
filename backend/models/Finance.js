// Import mongoose package to interact with MongoDB
const mongoose = require('mongoose');

// Create Finance schema for storing financial data
const FinanceSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['income', 'expense'], required: true },
    amount: { type: Number, required: true, min: [0.01, 'Amount must be greater than 0'] },
    category: { type: String, required: [true, 'Category is required'], trim: true },
    description: { type: String },
    date: { type: Date, default: Date.now }
});

// Export Finance model
module.exports = mongoose.model('Finance', FinanceSchema);
