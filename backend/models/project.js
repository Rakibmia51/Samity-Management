const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  projectCode: { type: String, unique: true, uppercase: true },
  projectName: { type: String, required: true },
  initialInvestment: { type: Number, min: 0},
  reservedOwnership: { type: Number, min: 0, max: 100 },
  expectedStartDate: { type: Date, required: true },
  status: { 
    type: String, 
    enum: ['Pending', 'Active', 'On Hold', 'Closed'], // Updated here
    default: 'Pending' 
  },
  description: { type: String },
  notes: { type: String, default: '' }
}, { timestamps: true });

const Projects = mongoose.model('Project', projectSchema);
module.exports = Projects;
