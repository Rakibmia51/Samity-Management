const mongoose = require('mongoose');

const shareIssueSchema = new mongoose.Schema({
  issueNumber: { type: String, unique: true }, // ISS-0001
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  issueDate: { type: Date, required: true, default: Date.now },
  totalQuantity: { type: Number, required: true },
  pricePerShare: { type: Number, required: true },
  totalValue: { type: Number, required: true },
  soldQuantity: { type: Number },
  notes: { type: String }
}, { timestamps: true });

const ShareIssue = mongoose.model('ShareIssue', shareIssueSchema);
module.exports = ShareIssue;