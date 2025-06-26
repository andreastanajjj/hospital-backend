const PatientRecord = require("../models/PatientRecord")

const getDoctorRequests = async (req, res) => {
  try {
    console.log("Doctor ID:", req.user.id) // Debug log
    const requests = await PatientRecord.find({ doctorId: req.user.id })
      .populate("doctorId", "name email specialization")
      .populate("patientId", "name email") // Fixed field name
      .sort({ createdAt: -1 }) // Sort by newest first

    console.log("Found requests:", requests.length) // Debug log
    res.json(requests)
  } catch (err) {
    console.error("Get doctor requests error:", err)
    res.status(500).json({ message: "Error fetching requests" })
  }
}

const updateRequest = async (req, res) => {
  try {
    const { destination, status } = req.body

    // Validate input
    if (!destination && !status) {
      return res.status(400).json({ message: "Destination or status is required" })
    }

    const record = await PatientRecord.findById(req.params.id)
    if (!record) {
      return res.status(404).json({ message: "Request not found" })
    }

    // Check if the doctor owns this request
    if (record.doctorId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Access denied" })
    }

    if (destination) record.destination = destination
    if (status) record.status = status

    await record.save()

    // Return updated record with populated fields
    const updatedRecord = await PatientRecord.findById(record._id)
      .populate("doctorId", "name email specialization")
      .populate("patientId", "name email")

    res.json({ message: "Request updated", record: updatedRecord })
  } catch (err) {
    console.error("Update request error:", err)
    res.status(500).json({ message: "Update failed" })
  }
}

const dischargePatient = async (req, res) => {
  try {
    const record = await PatientRecord.findById(req.params.id)
    if (!record) {
      return res.status(404).json({ message: "Request not found" })
    }

    // Check if the doctor owns this request
    if (record.doctorId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Access denied" })
    }

    record.status = "Discharged"
    await record.save()

    res.json({ message: "Patient discharged" })
  } catch (err) {
    console.error("Discharge error:", err)
    res.status(500).json({ message: "Discharge failed" })
  }
}

module.exports = { getDoctorRequests, updateRequest, dischargePatient }
