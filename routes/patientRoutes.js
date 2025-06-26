// backend/routes/patientRoutes.js

const express  = require('express')
const { protect, authorize } = require('../middleware/authMiddleware')
const Request  = require('../models/Request')
const router   = express.Router()

// All patient routes need a valid JWT and 'patient' role
router.use(protect, authorize('patient'))

// GET /api/patient/requests
//   → list this patient's requests, including doctorName
router.get('/requests', async (req, res) => {
  try {
    // populate the doctor field so we can read doctor.name
    const docs = await Request.find({ patient: req.user.id })
      .populate('doctor', 'name')

    // transform into the shape your front-end expects
    const out = docs.map(r => ({
      _id:        r._id,
      doctorId:   r.doctor._id,
      doctorName: r.doctor.name,
      reason:     r.reason,
      status:     r.status,
      createdAt:  r.createdAt
    }))

    res.status(200).json(out)
  } catch (err) {
    console.error('List requests error:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

// POST /api/patient/requests
//   → create a new request, expects { doctorId, reason }
router.post('/requests', async (req, res) => {
  const { doctorId, reason } = req.body

  if (!doctorId || !reason) {
    return res
      .status(400)
      .json({ message: 'Both doctorId and reason are required' })
  }

  try {
    const newReq = await Request.create({
      patient: req.user.id,
      doctor:  doctorId,
      reason
    })
    res.status(201).json(newReq)
  } catch (err) {
    console.error('Create request error:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

// DELETE /api/patient/requests/:id
//   → cancel (delete) one of this patient's requests
router.delete('/requests/:id', async (req, res) => {
  try {
    const reqDoc = await Request.findOneAndDelete({
      _id:     req.params.id,
      patient: req.user.id
    })
    if (!reqDoc) {
      return res.status(404).json({ message: 'Request not found' })
    }
    res.status(200).json({ message: 'Request canceled' })
  } catch (err) {
    console.error('Delete request error:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

module.exports = router
