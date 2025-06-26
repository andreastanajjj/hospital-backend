// backend/routes/authRoutes.js
const express = require("express")
const jwt     = require("jsonwebtoken")
const bcrypt  = require("bcryptjs")
const User    = require("../models/User")

const router = express.Router()

// Helper to sign JWTs
const generateToken = id =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" })

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" })
  }

  try {
    // Use .lean() to get a plain object
    const user = await User.findOne({ email }).lean()
    console.log("🔍 [login] DB user object:", user)

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" })
    }
    // Compare hashed password
    if (!bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ message: "Invalid credentials" })
    }

    // Send back token + full user object (including role)
    return res.json({
      token: generateToken(user._id),
      user,  // user now includes id, name, email, role, etc.
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: "Server error" })
  }
})

module.exports = router
