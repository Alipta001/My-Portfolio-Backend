const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, trim: true, lowercase: true },
  message: { type: String, required: true, trim: true, maxlength: 5000 },
  read: { type: Boolean, default: false },
  isRead: { type: Boolean, default: false },
}, { timestamps: true });

contactSchema.pre('save', function syncReadState(next) {
  if (this.read === undefined) this.read = this.isRead;
  if (this.isRead === undefined) this.isRead = this.read;
  this.read = this.read ?? this.isRead ?? false;
  this.isRead = this.isRead ?? this.read ?? false;
  next();
});

contactSchema.set('toJSON', {
  virtuals: true,
  transform(_doc, ret) {
    ret.read = ret.read ?? ret.isRead ?? false;
    ret.isRead = ret.isRead ?? ret.read ?? false;
    return ret;
  },
});

module.exports = mongoose.model('Contact', contactSchema);
