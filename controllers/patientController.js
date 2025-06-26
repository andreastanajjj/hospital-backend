// backend/controllers/patientController.js
const Request = require("../models/Request")
const Doctor  = require("../models/Doctor")

// GET /api/patient/requests
// Returns only the current patient’s requests
exports.getPatientRequests = async (req, res) => {
  try {
    const requests = await Request.find({ patient: req.user.id })
      .populate("doctor", "name")
      .lean()

    const formatted = requests.map(r => ({
      _id:        r._id,
      doctorId:   r.doctor._id,
      doctorName: r.doctor.name,
      reason:     r.reason,
      status:     r.status
    }))

    res.json(formatted)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Server error" })
  }
}

// POST /api/patient/requests
// Create a new appointment request and mark doctor unavailable
exports.createRequest = async (req, res) => {
  const { doctorId, reason } = req.body

  if (!doctorId || !reason) {
    return res.status(400).json({ message: "doctorId and reason are required" })
  }

  try {
    // 1) create the request
    const newReq = await Request.create({
      patient: req.user.id,
      doctor:  doctorId,
      reason,
      status:  "pending"
    })

    // 2) mark that doctor unavailable
    await Doctor.findByIdAndUpdate(doctorId, { available: false })

    return res.status(201).json({
      _id:        newReq._id,
      doctorId:   newReq.doctor,
      reason:     newReq.reason,
      status:     newReq.status
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Server error" })
  }
}

// DELETE /api/patient/requests/:id
// Cancel a request and free up the doctor
exports.deleteRequest = async (req, res) => {
  const { id } = req.params

  try {
    const reqDoc = await Request.findById(id)
    if (!reqDoc) {
      return res.status(404).json({ message: "Request not found" })
    }

    // only the owning patient can cancel
    if (reqDoc.patient.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not your request" })
    }

    await Request.findByIdAndDelete(id)
    await Doctor.findByIdAndUpdate(reqDoc.doctor, { available: true })

    return res.status(204).end()
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Server error" })
  }
}
