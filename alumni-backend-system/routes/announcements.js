const express = require("express")
const { body, query, validationResult } = require("express-validator")
const Announcement = require("../models/Announcement")
const { authenticateToken, requireRole, optionalAuth } = require("../middleware/auth")

/**
 * @swagger
 * tags:
 *   name: Announcements
 *   description: Announcement and news management
 */

const router = express.Router()

// Get all announcements
router.get(
  "/",
  optionalAuth,
  [
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
    query("category")
      .optional()
      .isIn(["general", "jobs", "news", "scholarships", "events", "achievements", "obituary"]),
    query("priority").optional().isIn(["low", "medium", "high", "urgent"]),
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

      const filter = {
        status: "published",
        $or: [{ "targetAudience.isPublic": true }, { publishDate: { $lte: new Date() } }],
      }

      // Add filters
      if (req.query.category) {
        filter.category = req.query.category
      }

      if (req.query.priority) {
        filter.priority = req.query.priority
      }

      if (req.query.search) {
        filter.$text = { $search: req.query.search }
      }

      // Filter by expiry date
      filter.$or.push({ expiryDate: { $exists: false } })
      filter.$or.push({ expiryDate: { $gte: new Date() } })

      const announcements = await Announcement.find(filter)
        .populate("author", "firstName lastName")
        .sort({ isPinned: -1, publishDate: -1 })
        .skip(skip)
        .limit(limit)

      const total = await Announcement.countDocuments(filter)

      res.json({
        announcements,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      })
    } catch (error) {
      console.error("Get announcements error:", error)
      res.status(500).json({ message: "Server error" })
    }
  },
)

// Get announcement by ID
router.get("/:id", optionalAuth, async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id)
      .populate("author", "firstName lastName")
      .populate("engagement.likes.user", "firstName lastName")
      .populate("engagement.comments.user", "firstName lastName")
      .populate("engagement.comments.replies.user", "firstName lastName")

    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" })
    }

    if (announcement.status !== "published") {
      if (!req.user || req.user.role !== "admin") {
        return res.status(403).json({ message: "Access denied" })
      }
    }

    // Increment view count
    announcement.engagement.views += 1
    await announcement.save()

    res.json(announcement)
  } catch (error) {
    console.error("Get announcement error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Create announcement
router.post(
  "/",
  authenticateToken,
  requireRole(["admin", "moderator"]),
  [
    body("title").trim().notEmpty().withMessage("Title is required"),
    body("content").notEmpty().withMessage("Content is required"),
    body("category")
      .isIn(["general", "jobs", "news", "scholarships", "events", "achievements", "obituary"])
      .withMessage("Invalid category"),
    body("priority").optional().isIn(["low", "medium", "high", "urgent"]),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const announcement = new Announcement({
        ...req.body,
        author: req.user._id,
      })

      // Set publish date if not provided
      if (!announcement.publishDate) {
        announcement.publishDate = new Date()
      }

      await announcement.save()

      const populatedAnnouncement = await Announcement.findById(announcement._id).populate(
        "author",
        "firstName lastName",
      )

      res.status(201).json({
        message: "Announcement created successfully",
        announcement: populatedAnnouncement,
      })
    } catch (error) {
      console.error("Create announcement error:", error)
      res.status(500).json({ message: "Server error" })
    }
  },
)

// Update announcement
router.put(
  "/:id",
  authenticateToken,
  requireRole(["admin", "moderator"]),
  [
    body("title").optional().trim().notEmpty().withMessage("Title cannot be empty"),
    body("content").optional().notEmpty().withMessage("Content cannot be empty"),
    body("category").optional().isIn(["general", "jobs", "news", "scholarships", "events", "achievements", "obituary"]),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const announcement = await Announcement.findById(req.params.id)

      if (!announcement) {
        return res.status(404).json({ message: "Announcement not found" })
      }

      // Check if user can edit this announcement
      if (announcement.author.toString() !== req.user._id.toString() && req.user.role !== "admin") {
        return res.status(403).json({ message: "Access denied" })
      }

      Object.keys(req.body).forEach((key) => {
        if (req.body[key] !== undefined) {
          announcement[key] = req.body[key]
        }
      })

      await announcement.save()

      const updatedAnnouncement = await Announcement.findById(announcement._id).populate("author", "firstName lastName")

      res.json({
        message: "Announcement updated successfully",
        announcement: updatedAnnouncement,
      })
    } catch (error) {
      console.error("Update announcement error:", error)
      res.status(500).json({ message: "Server error" })
    }
  },
)

// Delete announcement
router.delete("/:id", authenticateToken, requireRole(["admin", "moderator"]), async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id)

    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" })
    }

    // Check if user can delete this announcement
    if (announcement.author.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" })
    }

    await Announcement.findByIdAndDelete(req.params.id)

    res.json({ message: "Announcement deleted successfully" })
  } catch (error) {
    console.error("Delete announcement error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Like announcement
router.post("/:id/like", authenticateToken, async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id)

    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" })
    }

    // Check if user already liked
    const existingLike = announcement.engagement.likes.find((like) => like.user.toString() === req.user._id.toString())

    if (existingLike) {
      // Unlike
      announcement.engagement.likes = announcement.engagement.likes.filter(
        (like) => like.user.toString() !== req.user._id.toString(),
      )
    } else {
      // Like
      announcement.engagement.likes.push({
        user: req.user._id,
      })
    }

    await announcement.save()

    res.json({
      message: existingLike ? "Announcement unliked" : "Announcement liked",
      likeCount: announcement.engagement.likes.length,
    })
  } catch (error) {
    console.error("Like announcement error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Add comment
router.post(
  "/:id/comments",
  authenticateToken,
  [body("content").trim().notEmpty().withMessage("Comment content is required")],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const announcement = await Announcement.findById(req.params.id)

      if (!announcement) {
        return res.status(404).json({ message: "Announcement not found" })
      }

      const comment = {
        user: req.user._id,
        content: req.body.content,
      }

      announcement.engagement.comments.push(comment)
      await announcement.save()

      const updatedAnnouncement = await Announcement.findById(req.params.id).populate(
        "engagement.comments.user",
        "firstName lastName",
      )

      const newComment = updatedAnnouncement.engagement.comments[updatedAnnouncement.engagement.comments.length - 1]

      res.status(201).json({
        message: "Comment added successfully",
        comment: newComment,
      })
    } catch (error) {
      console.error("Add comment error:", error)
      res.status(500).json({ message: "Server error" })
    }
  },
)

// Reply to comment
router.post(
  "/:id/comments/:commentId/replies",
  authenticateToken,
  [body("content").trim().notEmpty().withMessage("Reply content is required")],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const announcement = await Announcement.findById(req.params.id)

      if (!announcement) {
        return res.status(404).json({ message: "Announcement not found" })
      }

      const comment = announcement.engagement.comments.id(req.params.commentId)

      if (!comment) {
        return res.status(404).json({ message: "Comment not found" })
      }

      const reply = {
        user: req.user._id,
        content: req.body.content,
      }

      comment.replies.push(reply)
      await announcement.save()

      const updatedAnnouncement = await Announcement.findById(req.params.id).populate(
        "engagement.comments.replies.user",
        "firstName lastName",
      )

      const updatedComment = updatedAnnouncement.engagement.comments.id(req.params.commentId)
      const newReply = updatedComment.replies[updatedComment.replies.length - 1]

      res.status(201).json({
        message: "Reply added successfully",
        reply: newReply,
      })
    } catch (error) {
      console.error("Add reply error:", error)
      res.status(500).json({ message: "Server error" })
    }
  },
)

module.exports = router
