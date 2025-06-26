// backend/routes/publicRoutes.js
const express = require('express')
const router  = express.Router()
const User    = require('../models/User')

// GET /api/public/doctors → list all doctors (public)
router.get('/doctors', async (req, res) => {
  try {
    const doctors = await User.find({ role: 'doctor' })
      .select('-password')      // hide sensitive fields
      .sort({ name: 1 })
    res.json(doctors)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
})

module.exports = router
