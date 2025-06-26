const Request = require("../models/Request")
const Doctor = require("../models/Doctor")

exports.createRequest = async (req, res) => {
  const { name, doctorId, reason } = req.body

  // create request
  const newReq = await Request.create({ name, doctor: doctorId, reason, status: "pending" })

  // mark doctor unavailable
  await Doctor.findByIdAndUpdate(doctorId, { available: false })

  return res.status(201).json(newReq)
}

exports.deleteRequest = async (req, res) => {
  const { id } = req.params
  const reqDoc = await Request.findByIdAndDelete(id)
  if (reqDoc) {
    // free up doctor
    await Doctor.findByIdAndUpdate(reqDoc.doctor, { available: true })
  }
  return res.status(204).end()
}
