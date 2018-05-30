const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Schedule = new Schema({
  start : String,
  end : String,
  date : Date,
  unittime : String,
  slotsnum : Number,
  doctor : {type: mongoose.Schema.Types.ObjectId, ref: 'Doctor'},
  centre : {type: mongoose.Schema.Types.ObjectId, ref: 'Centre'},
  pending: {type: Boolean, default: false},
  delete: {type: Number, default: 0},
});

module.exports = mongoose.model('Schedule', Schedule);