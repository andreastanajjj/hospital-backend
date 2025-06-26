// backend/models/Request.js
const mongoose = require("mongoose")
const Schema   = mongoose.Schema

const requestSchema = new Schema(
  {
    patient: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    doctor: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    reason: {
      type: String,
      required: true
    },
    // new: where the patient has been sent (if transferred)
    destination: {
      type: String,
      default: null
    },
    status: {
      type: String,
      enum: ["pending", "transferred", "completed"],
      default: "pending"
    }
  },
  {
    timestamps: true
  }
)

module.exports = mongoose.model("Request", requestSchema)
