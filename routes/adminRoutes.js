// backend/routes/adminRoutes.js

const express = require("express")
const { protect, authorize } = require("../middleware/authMiddleware")
const {
  getAllDoctors,
  createDoctor,
  deleteDoctor
} = require("../controllers/adminController")

const router = express.Router()

// Protect all /api/admin/* routes and require admin role
router.use(protect)
router.use(authorize("admin"))

// GET  /api/admin/doctors      → list all doctors
router.get("/doctors", getAllDoctors)

// POST /api/admin/doctor       → create a new doctor
router.post("/doctor", createDoctor)

// DELETE /api/admin/doctor/:id → remove a doctor
router.delete("/doctor/:id", deleteDoctor)

module.exports = router
