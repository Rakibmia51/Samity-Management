const mongoose = require('mongoose');

const profitPayoutSchema = new mongoose.Schema({
    profitRecordId: { type: mongoose.Schema.Types.ObjectId, ref: 'ProfitRecord', required: true },
    memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    sharesOwned: { type: Number, required: true },
    profitPerShare: { type: Number, required: true },
    totalProfitAmount: { type: Number, required: true },
    month: { type: Number, required: true },
    year: { type: Number, required: true },
    status: { type: String, enum: ['Pending', 'Paid'], default: 'Paid' }
}, { timestamps: true });

// OverwriteModelError এড়াতে এই চেকটি যোগ করুন
module.exports = mongoose.models.ProfitPayout || mongoose.model('ProfitPayout', profitPayoutSchema);
