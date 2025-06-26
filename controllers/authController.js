// controllers/authController.js
const jwt  = require('jsonwebtoken')
const User = require('../models/User')

// 1) Sign whatever you need into the token
function generateToken(user) {
  const { _id, role, email, name, available, specialization } = user
  return jwt.sign(
    {
      id:   _id,
      role,            // ← include role
      email,           // ← optional: include email/name if you want
      name,
      available,
      ...(specialization && { specialization })
    },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  )
}

// 2) LOGIN handler
exports.login = async (req, res) => {
  const { email, password } = req.body
  const user = await User.findOne({ email })
  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ message: 'Invalid credentials' })
  }

  const token = generateToken(user)
  console.log('🔓 Signed JWT payload:', jwt.verify(token, process.env.JWT_SECRET))

  res.json({
    token,
    user: {
      id:             user._id,
      name:           user.name,
      email:          user.email,
      role:           user.role,
      available:      user.available,
      specialization: user.specialization
    }
  })
}

// 3) (Optional) REGISTER handler
exports.register = async (req, res) => {
  const { name, email, password, role = 'user', specialization } = req.body
  if (await User.findOne({ email })) {
    return res.status(400).json({ message: 'Email already in use' })
  }
  const user = await User.create({ name, email, password, role, specialization })
  const token = generateToken(user)
  console.log('🔓 Signed JWT payload:', jwt.verify(token, process.env.JWT_SECRET))

  res.status(201).json({
    token,
    user: {
      id:             user._id,
      name:           user.name,
      email:          user.email,
      role:           user.role,
      available:      user.available,
      specialization: user.specialization
    }
  })
}
