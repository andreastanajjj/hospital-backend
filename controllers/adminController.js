const User = require("../models/User")

const createDoctor = async (req, res) => {
  const { name, email, password, specialization } = req.body

  try {
    // Validate required fields
    if (!name || !email || !password || !specialization) {
      return res.status(400).json({
        message: "Name, email, password, and specialization are required",
      })
    }

    const doctorExists = await User.findOne({ email })
    if (doctorExists) {
      return res.status(400).json({ message: "Doctor already exists" })
    }

    const doctor = await User.create({
      name,
      email,
      password,
      role: "doctor",
      specialization,
    })

    // Return doctor without password
    const doctorResponse = {
      id: doctor._id,
      name: doctor.name,
      email: doctor.email,
      role: doctor.role,
      specialization: doctor.specialization,
    }

    res.status(201).json(doctorResponse)
  } catch (error) {
    console.error("Create doctor error:", error)
    res.status(500).json({ message: error.message })
  }
}

const deleteDoctor = async (req, res) => {
  try {
    const doctor = await User.findById(req.params.id)
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" })
    }

    if (doctor.role !== "doctor") {
      return res.status(400).json({ message: "User is not a doctor" })
    }

    await doctor.deleteOne()
    res.status(200).json({ message: "Doctor deleted" })
  } catch (err) {
    console.error("Delete error:", err)
    res.status(500).json({ message: "Server error" })
  }
}

const getAllDoctors = async (req, res) => {
  try {
    const doctors = await User.find({ role: "doctor" })
      .select("-password") // Exclude password from response
      .sort({ name: 1 }) // Sort alphabetically
    res.status(200).json(doctors)
  } catch (error) {
    console.error("List doctors error:", error)
    res.status(500).json({ message: error.message })
  }
}

module.exports = { createDoctor,deleteDoctor, getAllDoctors }

