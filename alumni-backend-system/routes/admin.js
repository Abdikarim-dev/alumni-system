const express = require("express")
const { query, validationResult } = require("express-validator")
const User = require("../models/User")
const Event = require("../models/Event")
const Announcement = require("../models/Announcement")
const Payment = require("../models/Payment")
const Job = require("../models/Job")
const { authenticateToken, requireRole } = require("../middleware/auth")

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Administrative operations and analytics
 */

const router = express.Router()

// Dashboard analytics
router.get("/dashboard", authenticateToken, requireRole(["admin"]), async (req, res) => {
  try {
    const { startDate, endDate } = req.query

    const dateFilter = {}
    if (startDate && endDate) {
      dateFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      }
    }

    // User statistics
    const totalUsers = await User.countDocuments({ isActive: true })
    const newUsers = await User.countDocuments({
      ...dateFilter,
      isActive: true,
    })
    const usersByRole = await User.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: "$role", count: { $sum: 1 } } },
    ])

    // Event statistics
    const totalEvents = await Event.countDocuments()
    const upcomingEvents = await Event.countDocuments({
      "date.start": { $gte: new Date() },
      status: "published",
    })
    const eventsByType = await Event.aggregate([{ $group: { _id: "$type", count: { $sum: 1 } } }])

    // Payment statistics
    const totalRevenue = await Payment.aggregate([
      { $match: { status: "completed" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ])

    const recentRevenue = await Payment.aggregate([
      {
        $match: {
          status: "completed",
          ...dateFilter,
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ])

    // Announcement statistics
    const totalAnnouncements = await Announcement.countDocuments({ status: "published" })
    const announcementsByCategory = await Announcement.aggregate([
      { $match: { status: "published" } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ])

    // Job statistics
    const totalJobs = await Job.countDocuments({ status: "active" })
    const jobsByCategory = await Job.aggregate([
      { $match: { status: "active" } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ])

    // Recent activity
    const recentUsers = await User.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("firstName lastName email createdAt")

    const recentEvents = await Event.find()
      .populate("organizer", "firstName lastName")
      .sort({ createdAt: -1 })
      .limit(5)
      .select("title type date.start organizer createdAt")

    res.json({
      users: {
        total: totalUsers,
        new: newUsers,
        byRole: usersByRole.reduce((acc, item) => {
          acc[item._id] = item.count
          return acc
        }, {}),
        recent: recentUsers,
      },
      events: {
        total: totalEvents,
        upcoming: upcomingEvents,
        byType: eventsByType.reduce((acc, item) => {
          acc[item._id] = item.count
          return acc
        }, {}),
        recent: recentEvents,
      },
      payments: {
        totalRevenue: totalRevenue[0]?.total || 0,
        recentRevenue: recentRevenue[0]?.total || 0,
      },
      announcements: {
        total: totalAnnouncements,
        byCategory: announcementsByCategory.reduce((acc, item) => {
          acc[item._id] = item.count
          return acc
        }, {}),
      },
      jobs: {
        total: totalJobs,
        byCategory: jobsByCategory.reduce((acc, item) => {
          acc[item._id] = item.count
          return acc
        }, {}),
      },
    })
  } catch (error) {
    console.error("Dashboard analytics error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// User management
router.get(
  "/users",
  authenticateToken,
  requireRole(["admin"]),
  [
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
    query("role").optional().isIn(["alumni", "admin", "moderator"]),
    query("status").optional().isIn(["active", "inactive"]),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const page = Number.parseInt(req.query.page) || 1
      const limit = Number.parseInt(req.query.limit) || 50
      const skip = (page - 1) * limit

      const filter = {}

      if (req.query.role) {
        filter.role = req.query.role
      }

      if (req.query.status === "active") {
        filter.isActive = true
      } else if (req.query.status === "inactive") {
        filter.isActive = false
      }

      if (req.query.search) {
        filter.$text = { $search: req.query.search }
      }

      const users = await User.find(filter)
        .select("firstName lastName email phone role isActive profile.graduationYear lastLogin createdAt")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)

      const total = await User.countDocuments(filter)

      res.json({
        users,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      })
    } catch (error) {
      console.error("Get users error:", error)
      res.status(500).json({ message: "Server error" })
    }
  },
)

// Update user role
router.put("/users/:id/role", authenticateToken, requireRole(["admin"]), async (req, res) => {
  try {
    const { role } = req.body

    if (!["alumni", "admin", "moderator"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" })
    }

    const user = await User.findById(req.params.id)

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    user.role = role
    await user.save()

    res.json({
      message: "User role updated successfully",
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    console.error("Update user role error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Deactivate/activate user
router.put("/users/:id/status", authenticateToken, requireRole(["admin"]), async (req, res) => {
  try {
    const { isActive } = req.body

    if (typeof isActive !== "boolean") {
      return res.status(400).json({ message: "isActive must be a boolean" })
    }

    const user = await User.findById(req.params.id)

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    user.isActive = isActive
    await user.save()

    res.json({
      message: `User ${isActive ? "activated" : "deactivated"} successfully`,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        isActive: user.isActive,
      },
    })
  } catch (error) {
    console.error("Update user status error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// System settings
router.get("/settings", authenticateToken, requireRole(["admin"]), async (req, res) => {
  try {
    // This would typically come from a settings collection
    // For now, return default settings
    const settings = {
      general: {
        siteName: "Alumni Network",
        siteDescription: "Connect with your fellow alumni",
        contactEmail: "admin@alumninetwork.com",
        supportPhone: "+1234567890",
      },
      notifications: {
        emailEnabled: true,
        smsEnabled: true,
        pushEnabled: true,
      },
      payments: {
        stripeEnabled: true,
        mobileMoneyEnabled: true,
        defaultCurrency: "USD",
      },
      features: {
        jobBoardEnabled: true,
        eventsEnabled: true,
        announcementsEnabled: true,
        messagingEnabled: true,
      },
    }

    res.json(settings)
  } catch (error) {
    console.error("Get settings error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Export data
router.get("/export/:type", authenticateToken, requireRole(["admin"]), async (req, res) => {
  try {
    const { type } = req.params
    const { format = "json" } = req.query

    let data
    let filename

    switch (type) {
      case "users":
        data = await User.find({ isActive: true })
          .select("firstName lastName email phone profile.graduationYear profile.profession profile.company createdAt")
          .lean()
        filename = `users_export_${Date.now()}`
        break

      case "events":
        data = await Event.find().populate("organizer", "firstName lastName").lean()
        filename = `events_export_${Date.now()}`
        break

      case "payments":
        data = await Payment.find({ status: "completed" })
          .populate("user", "firstName lastName email")
          .select("-paymentDetails")
          .lean()
        filename = `payments_export_${Date.now()}`
        break

      default:
        return res.status(400).json({ message: "Invalid export type" })
    }

    if (format === "csv") {
      // Convert to CSV (simplified implementation)
      const csv = convertToCSV(data)
      res.setHeader("Content-Type", "text/csv")
      res.setHeader("Content-Disposition", `attachment; filename="${filename}.csv"`)
      res.send(csv)
    } else {
      res.setHeader("Content-Type", "application/json")
      res.setHeader("Content-Disposition", `attachment; filename="${filename}.json"`)
      res.json(data)
    }
  } catch (error) {
    console.error("Export data error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Helper function to convert JSON to CSV
function convertToCSV(data) {
  if (!data.length) return ""

  const headers = Object.keys(data[0])
  const csvHeaders = headers.join(",")

  const csvRows = data.map((row) => {
    return headers
      .map((header) => {
        const value = row[header]
        return typeof value === "string" ? `"${value}"` : value
      })
      .join(",")
  })

  return [csvHeaders, ...csvRows].join("\n")
}

module.exports = router
