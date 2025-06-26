// backend/server.js
require("dotenv").config()

const express  = require("express")
const mongoose = require("mongoose")
const cors     = require("cors")

const app = express()

// 1) Enable CORS and JSON-body parsing up front
app.use(cors())
app.use(express.json())

// 2) A minimal “test-login” endpoint to prove roles come through
app.post("/api/test-login", async (req, res) => {
  console.log("💬 [test-login] req.body:", req.body)
  try {
    const User = require("./models/User")
    const user = await User.findOne({ email: req.body.email })
    console.log("💥 [test-login] DB user:", user)
    if (!user) return res.status(404).json({ message: "User not found" })
    // send back only the role so you can see it
    return res.json({ role: user.role })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: "Server error" })
  }
})

// 3) Connect to your “hospital” database
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✔️ MongoDB connected to:", mongoose.connection.db.databaseName)
  })
  .catch(err => console.error("❌ MongoDB connection error:", err))

// 4) Mount your real routes
app.use("/api/auth",    require("./routes/authRoutes"))
app.use("/api/public",  require("./routes/publicRoutes"))
app.use("/api/admin",   require("./routes/adminRoutes"))
app.use("/api/doctor",  require("./routes/doctorRoutes"))
app.use("/api/patient", require("./routes/patientRoutes"))

// 5) Start listening
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
})
