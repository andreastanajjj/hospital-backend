// backend/middleware/authMiddleware.js

const jwt  = require("jsonwebtoken")
const User = require("../models/User")

// Protect routes (require a valid JWT)
const protect = async (req, res, next) => {
  // 1) Grab the Authorization header
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Not authorized, no token provided" })
  }

  // 2) Extract token
  const token = authHeader.split(" ")[1]

  try {
    // 3) Verify & decode
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    console.log("[protect] decoded payload →", decoded)

    // 4) Fetch user from DB (so we have the latest role, etc.)
    const user = await User.findById(decoded.id).select("-password")
    if (!user) {
      return res.status(401).json({ message: "Not authorized, user not found" })
    }

    console.log("Authenticated user:", user.name, "Role:", user.role)

    // 5) Attach to req and continue
    req.user = user
    next()
  } catch (error) {
    console.error("Auth error:", error)
    return res.status(401).json({ message: "Not authorized, token failed" })
  }
}

// Authorize based on user role(s)
const authorize = (...roles) => {
  return (req, res, next) => {
    // Must run *after* protect, so req.user exists
    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" })
    }

    // Check if the user’s role is one of the allowed
    if (!roles.includes(req.user.role)) {
      console.log(
        `Access denied. User role: '${req.user.role}', Required roles: [${roles.join(", ")}]`
      )
      return res
        .status(403)
        .json({ message: `Access denied: Role '${req.user.role}' is not authorized` })
    }

    // Role ok → proceed
    next()
  }
}

module.exports = { protect, authorize }
