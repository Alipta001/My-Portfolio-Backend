const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
  category: { type: String, required: true, trim: true },
  tools: [{ type: String, trim: true }],
  icon: { type: String, default: '✦' },
  order: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Skill', skillSchema);
