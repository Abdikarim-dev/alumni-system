const express = require("express")
const { body, query, validationResult } = require("express-validator")
const User = require("../models/User")
const { authenticateToken, requireRole, optionalAuth } = require("../middleware/auth")

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management and profile operations
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users (alumni directory)
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of users per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for users
 *       - in: query
 *         name: graduationYear
 *         schema:
 *           type: integer
 *         description: Filter by graduation year
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: Filter by location
 *       - in: query
 *         name: profession
 *         schema:
 *           type: string
 *         description: Filter by profession
 *     responses:
 *       200:
 *         description: List of users with pagination
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 pagination:
 *                   $ref: '#/components/schemas/PaginationResponse'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/users/profile:
 *   put:
 *     summary: Update user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               profile:
 *                 type: object
 *                 properties:
 *                   profession:
 *                     type: string
 *                   company:
 *                     type: string
 *                   bio:
 *                     type: string
 *                   location:
 *                     type: object
 *                     properties:
 *                       city:
 *                         type: string
 *                       country:
 *                         type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/users/privacy:
 *   put:
 *     summary: Update privacy settings
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               emailNotifications:
 *                 type: boolean
 *               smsNotifications:
 *                 type: boolean
 *               pushNotifications:
 *                 type: boolean
 *               privacy:
 *                 type: object
 *                 properties:
 *                   showEmail:
 *                     type: boolean
 *                   showPhone:
 *                     type: boolean
 *                   showLocation:
 *                     type: boolean
 *     responses:
 *       200:
 *         description: Privacy settings updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 preferences:
 *                   type: object
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/users/password:
 *   put:
 *     summary: Change password
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 description: Current password
 *               newPassword:
 *                 type: string
 *                 minLength: 6
 *                 description: New password
 *     responses:
 *       200:
 *         description: Password updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: Validation error or incorrect current password
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/users/account:
 *   delete:
 *     summary: Delete user account
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *                 description: User password for confirmation
 *     responses:
 *       200:
 *         description: Account deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: Validation error or incorrect password
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/users/filters/graduation-years:
 *   get:
 *     summary: Get available graduation years for filtering
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: List of graduation years
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: number
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/users/filters/locations:
 *   get:
 *     summary: Get available locations for filtering
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: List of locations
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

const router = express.Router()

// Get all users (alumni directory)
router.get(
  "/",
  optionalAuth,
  [
    query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),
    query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1 and 100"),
    query("search").optional().isString().withMessage("Search must be a string"),
    query("graduationYear").optional().isInt().withMessage("Graduation year must be an integer"),
    query("location").optional().isString().withMessage("Location must be a string"),
    query("profession").optional().isString().withMessage("Profession must be a string"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const page = Number.parseInt(req.query.page) || 1
      const limit = Number.parseInt(req.query.limit) || 20
      const skip = (page - 1) * limit

      // Build search query
      const searchQuery = { isActive: true }

      if (req.query.search) {
        searchQuery.$text = { $search: req.query.search }
      }

      if (req.query.graduationYear) {
        searchQuery["profile.graduationYear"] = Number.parseInt(req.query.graduationYear)
      }

      if (req.query.location) {
        searchQuery["profile.location.city"] = new RegExp(req.query.location, "i")
      }

      if (req.query.profession) {
        searchQuery["profile.profession"] = new RegExp(req.query.profession, "i")
      }

      // Get users
      const users = await User.find(searchQuery)
        .select("firstName lastName email phone profile createdAt")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)

      // Filter based on privacy settings
      const filteredUsers = users.map((user) => {
        const userObj = user.toObject()

        // Hide sensitive info based on privacy settings
        if (!user.preferences?.privacy?.showEmail) {
          delete userObj.email
        }
        if (!user.preferences?.privacy?.showPhone) {
          delete userObj.phone
        }
        if (!user.preferences?.privacy?.showLocation) {
          if (userObj.profile?.location) {
            delete userObj.profile.location
          }
        }

        return userObj
      })

      const total = await User.countDocuments(searchQuery)

      res.json({
        users: filteredUsers,
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

// Get user by ID
router.get("/:id", optionalAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("firstName lastName email phone profile createdAt")

    if (!user || !user.isActive) {
      return res.status(404).json({ message: "User not found" })
    }

    const userObj = user.toObject()

    // Filter based on privacy settings
    if (!user.preferences?.privacy?.showEmail) {
      delete userObj.email
    }
    if (!user.preferences?.privacy?.showPhone) {
      delete userObj.phone
    }
    if (!user.preferences?.privacy?.showLocation) {
      if (userObj.profile?.location) {
        delete userObj.profile.location
      }
    }

    res.json(userObj)
  } catch (error) {
    console.error("Get user error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Update user profile
router.put(
  "/profile",
  authenticateToken,
  [
    body("firstName").optional().trim().notEmpty().withMessage("First name cannot be empty"),
    body("lastName").optional().trim().notEmpty().withMessage("Last name cannot be empty"),
    body("profile.profession").optional().isString().withMessage("Profession must be a string"),
    body("profile.company").optional().isString().withMessage("Company must be a string"),
    body("profile.bio").optional().isString().withMessage("Bio must be a string"),
    body("profile.location.city").optional().isString().withMessage("City must be a string"),
    body("profile.location.country").optional().isString().withMessage("Country must be a string"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const updates = req.body
      const user = await User.findById(req.user._id)

      if (!user) {
        return res.status(404).json({ message: "User not found" })
      }

      // Update user fields
      Object.keys(updates).forEach((key) => {
        if (key === "profile") {
          Object.keys(updates.profile).forEach((profileKey) => {
            if (updates.profile[profileKey] !== undefined) {
              user.profile[profileKey] = updates.profile[profileKey]
            }
          })
        } else if (updates[key] !== undefined) {
          user[key] = updates[key]
        }
      })

      await user.save()

      res.json({
        message: "Profile updated successfully",
        user: user.toJSON(),
      })
    } catch (error) {
      console.error("Update profile error:", error)
      res.status(500).json({ message: "Server error" })
    }
  },
)

// Update privacy settings
router.put(
  "/privacy",
  authenticateToken,
  [
    body("emailNotifications").optional().isBoolean(),
    body("smsNotifications").optional().isBoolean(),
    body("pushNotifications").optional().isBoolean(),
    body("privacy.showEmail").optional().isBoolean(),
    body("privacy.showPhone").optional().isBoolean(),
    body("privacy.showLocation").optional().isBoolean(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const user = await User.findById(req.user._id)
      if (!user) {
        return res.status(404).json({ message: "User not found" })
      }

      // Update preferences
      const { emailNotifications, smsNotifications, pushNotifications, privacy } = req.body

      if (emailNotifications !== undefined) {
        user.preferences.emailNotifications = emailNotifications
      }
      if (smsNotifications !== undefined) {
        user.preferences.smsNotifications = smsNotifications
      }
      if (pushNotifications !== undefined) {
        user.preferences.pushNotifications = pushNotifications
      }
      if (privacy) {
        Object.keys(privacy).forEach((key) => {
          if (privacy[key] !== undefined) {
            user.preferences.privacy[key] = privacy[key]
          }
        })
      }

      await user.save()

      res.json({
        message: "Privacy settings updated successfully",
        preferences: user.preferences,
      })
    } catch (error) {
      console.error("Update privacy error:", error)
      res.status(500).json({ message: "Server error" })
    }
  },
)

// Change password
router.put(
  "/password",
  authenticateToken,
  [
    body("currentPassword").notEmpty().withMessage("Current password is required"),
    body("newPassword").isLength({ min: 6 }).withMessage("New password must be at least 6 characters"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { currentPassword, newPassword } = req.body
      const user = await User.findById(req.user._id)

      if (!user) {
        return res.status(404).json({ message: "User not found" })
      }

      // Verify current password
      const isCurrentPasswordValid = await user.comparePassword(currentPassword)
      if (!isCurrentPasswordValid) {
        return res.status(400).json({ message: "Current password is incorrect" })
      }

      // Update password
      user.password = newPassword
      await user.save()

      res.json({ message: "Password updated successfully" })
    } catch (error) {
      console.error("Change password error:", error)
      res.status(500).json({ message: "Server error" })
    }
  },
)

// Delete account
router.delete(
  "/account",
  authenticateToken,
  [body("password").notEmpty().withMessage("Password is required for account deletion")],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { password } = req.body
      const user = await User.findById(req.user._id)

      if (!user) {
        return res.status(404).json({ message: "User not found" })
      }

      // Verify password
      const isPasswordValid = await user.comparePassword(password)
      if (!isPasswordValid) {
        return res.status(400).json({ message: "Incorrect password" })
      }

      // Soft delete - deactivate account
      user.isActive = false
      user.email = `deleted_${Date.now()}_${user.email}`
      user.phone = `deleted_${Date.now()}_${user.phone}`
      await user.save()

      res.json({ message: "Account deleted successfully" })
    } catch (error) {
      console.error("Delete account error:", error)
      res.status(500).json({ message: "Server error" })
    }
  },
)

// Get graduation years for filtering
router.get("/filters/graduation-years", async (req, res) => {
  try {
    const years = await User.distinct("profile.graduationYear", { isActive: true })
    res.json(years.sort((a, b) => b - a))
  } catch (error) {
    console.error("Get graduation years error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get locations for filtering
router.get("/filters/locations", async (req, res) => {
  try {
    const locations = await User.distinct("profile.location.city", {
      isActive: true,
      "profile.location.city": { $exists: true, $ne: null },
    })
    res.json(locations.sort())
  } catch (error) {
    console.error("Get locations error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router
