var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var GoalSchema = new Schema({
  title: String,
  description: String,
  email: String,
  priority: {
    type: Number,
    default: 1
  }
}, {
    timestamps: true
});

module.exports = mongoose.model('Goal', GoalSchema)