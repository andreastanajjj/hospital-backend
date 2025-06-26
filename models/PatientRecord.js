const mongoose = require("mongoose");

const recordSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  reason: { type: String, required: true },
  destination: { type: String, enum: ["ER", "Infirmary", "Morgue", "Discharged"], default: "ER" },
  status: { type: String, default: "Pending" }
}, { timestamps: true });

module.exports = mongoose.model("PatientRecord", recordSchema);
