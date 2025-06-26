// backend/routes/doctorRoutes.js
const express  = require('express')
const { protect, authorize } = require('../middleware/authMiddleware')
const Request  = require('../models/Request')

const router = express.Router()

router.use(protect, authorize('doctor'))

// GET all requests for this doctor
router.get('/requests', async (req, res) => {
  try {
    const docs = await Request.find({ doctor: req.user.id })
      .populate('patient', 'name')
    const out = docs.map(r => ({
      _id:         r._id,
      patientId:   r.patient._id,
      patientName: r.patient.name,
      reason:      r.reason,
      destination: r.destination,
      status:      r.status
    }))
    res.json(out)
  } catch (err) {
    console.error("Doctor list error:", err)
    res.status(500).json({ message: "Server error" })
  }
})

// PUT updates to a request: accepts { destination, status }
router.put('/requests/:id', async (req, res) => {
  const { destination, status } = req.body
  try {
    const reqDoc = await Request.findOne({
      _id:     req.params.id,
      doctor:  req.user.id
    })
    if (!reqDoc) {
      return res.status(404).json({ message: "Request not found" })
    }
    if (destination !== undefined) reqDoc.destination = destination
    if (status      !== undefined) reqDoc.status      = status
    await reqDoc.save()
    return res.json(reqDoc)
  } catch (err) {
    console.error("Doctor update error:", err)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router
