const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
const authRoutes = require('./routes/authRoutes');
const financeRoutes = require('./routes/financeRoutes');
const healthRoutes = require('./routes/healthRoutes');
const skillRoutes = require('./routes/skillRoutes');
const taskRoutes = require('./routes/taskRoutes');
const budgetRoutes = require('./routes/budgetRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/budgets', budgetRoutes);

// Database Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
