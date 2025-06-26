const mongoose = require("mongoose")

const doctorSchema = new mongoose.Schema({
  name:         { type: String, required: true },
  email:        { type: String, required: true, unique: true },
  password:     { type: String, required: true },
  specialization: { type: String, required: true },
  available:    { type: Boolean, default: true },  // ← default true
})

module.exports = mongoose.model("Doctor", doctorSchema)
