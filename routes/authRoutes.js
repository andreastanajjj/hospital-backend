const express = require("express")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")
const User = require("../models/User")

const router = express.Router()

// Helper to generate JWT
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" })

// =======================================
// POST /api/auth/register
// =======================================
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body

  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required" })
  }

  try {
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" })
    }

    const hashedPassword = bcrypt.hashSync(password, 10)

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "patient", // default role
    })

    return res.status(201).json({
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  } catch (err) {
    console.error("Register Error:", err)
    return res.status(500).json({ message: "Server error during registration" })
  }
})

// =======================================
// POST /api/auth/login
// =======================================
router.post("/login", async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" })
  }

  try {
    const user = await User.findOne({ email }).lean()
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ message: "Invalid credentials" })
    }

    return res.json({
      token: generateToken(user._id),
      user,
    })
  } catch (err) {
    console.error("Login Error:", err)
    return res.status(500).json({ message: "Server error during login" })
  }
})

module.exports = router
