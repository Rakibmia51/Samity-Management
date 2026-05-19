const mongoose = require('mongoose');

const profitSchema = new mongoose.Schema({
    profitCode: { type: String, unique: true }, // PRF-0001
    projectId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Project', 
        required: true 
    },
    month: { type: Number, required: true }, // ১ থেকে ১২
    year: { type: Number, required: true },  // ২০২৪, ২০২৫ ইত্যাদি,
    totalIncome: Number,
    totalExpenses: Number,
    netProfit: Number,
    totalShares: Number,
    profitPerShare: Number,
    calculationDate: { 
        type: Date, 
        default: Date.now 
    },
    status: { 
        type: String, 
        enum: ['Calculated', 'Approved', 'Distributed'], 
        default: 'Calculated' 
    },
    notes: { type: String },
}, { timestamps: true });

// প্রোজেক্ট, মাস এবং বছর এই তিনটির কম্বিনেশন ইউনিক হবে
profitSchema.index({ projectId: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Profit', profitSchema);
