const express = require("express")
const { body, query, validationResult } = require("express-validator")
const Event = require("../models/Event")
const { authenticateToken, requireRole, optionalAuth } = require("../middleware/auth")
const { sendBulkEmail, sendBulkSMS } = require("../services/notificationService")

/**
 * @swagger
 * tags:
 *   name: Events
 *   description: Event management and RSVP operations
 */

/**
 * @swagger
 * /api/events:
 *   get:
 *     summary: Get all events
 *     tags: [Events]
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
 *         description: Number of events per page
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [reunion, webinar, fundraiser, networking, workshop, social, other]
 *         description: Filter by event type
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, published, cancelled, completed]
 *         description: Filter by event status
 *       - in: query
 *         name: upcoming
 *         schema:
 *           type: boolean
 *         description: Filter upcoming events
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search events by title or description
 *     responses:
 *       200:
 *         description: List of events with pagination
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 events:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Event'
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
 *   post:
 *     summary: Create new event
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - type
 *               - date
 *               - location
 *             properties:
 *               title:
 *                 type: string
 *                 description: Event title
 *               description:
 *                 type: string
 *                 description: Event description
 *               type:
 *                 type: string
 *                 enum: [reunion, webinar, fundraiser, networking, workshop, social, other]
 *                 description: Event type
 *               date:
 *                 type: object
 *                 required:
 *                   - start
 *                   - end
 *                 properties:
 *                   start:
 *                     type: string
 *                     format: date-time
 *                     description: Event start date and time
 *                   end:
 *                     type: string
 *                     format: date-time
 *                     description: Event end date and time
 *               location:
 *                 type: object
 *                 required:
 *                   - type
 *                 properties:
 *                   type:
 *                     type: string
 *                     enum: [physical, virtual, hybrid]
 *                     description: Location type
 *                   address:
 *                     type: string
 *                     description: Physical address
 *                   city:
 *                     type: string
 *                     description: City
 *                   country:
 *                     type: string
 *                     description: Country
 *                   virtualUrl:
 *                     type: string
 *                     description: Virtual meeting URL
 *               capacity:
 *                 type: number
 *                 description: Maximum number of attendees
 *               registration:
 *                 type: object
 *                 properties:
 *                   required:
 *                     type: boolean
 *                     description: Whether registration is required
 *                   deadline:
 *                     type: string
 *                     format: date-time
 *                     description: Registration deadline
 *                   fee:
 *                     type: number
 *                     description: Registration fee
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Event tags
 *               isPublic:
 *                 type: boolean
 *                 description: Whether event is public
 *               featured:
 *                 type: boolean
 *                 description: Whether event is featured
 *     responses:
 *       201:
 *         description: Event created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 event:
 *                   $ref: '#/components/schemas/Event'
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
 *       403:
 *         description: Insufficient permissions
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
 * /api/events/{id}:
 *   get:
 *     summary: Get event by ID
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     responses:
 *       200:
 *         description: Event details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Event'
 *       403:
 *         description: Access denied for private event
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Event not found
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
 *   put:
 *     summary: Update event
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [reunion, webinar, fundraiser, networking, workshop, social, other]
 *               date:
 *                 type: object
 *                 properties:
 *                   start:
 *                     type: string
 *                     format: date-time
 *                   end:
 *                     type: string
 *                     format: date-time
 *               location:
 *                 type: object
 *               capacity:
 *                 type: number
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Event updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 event:
 *                   $ref: '#/components/schemas/Event'
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
 *       403:
 *         description: Access denied
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Event not found
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
 *   delete:
 *     summary: Delete event
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     responses:
 *       200:
 *         description: Event deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Access denied
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Event not found
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
 * /api/events/{id}/rsvp:
 *   post:
 *     summary: RSVP to event
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     responses:
 *       200:
 *         description: Successfully registered for event
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: Registration error (deadline passed, event full, already registered)
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
 *         description: Event not found
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
 *   delete:
 *     summary: Cancel RSVP
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     responses:
 *       200:
 *         description: RSVP cancelled successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: Not registered for this event
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
 *         description: Event not found
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
 * /api/events/{id}/attendees:
 *   get:
 *     summary: Get event attendees (Admin/Moderator only)
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     responses:
 *       200:
 *         description: List of event attendees
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 attendees:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       user:
 *                         $ref: '#/components/schemas/User'
 *                       status:
 *                         type: string
 *                         enum: [registered, attended, cancelled]
 *                       registeredAt:
 *                         type: string
 *                         format: date-time
 *                 totalCount:
 *                   type: number
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Event not found
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
 * /api/events/{id}/send-reminders:
 *   post:
 *     summary: Send event reminders (Admin/Moderator only)
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - message
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [email, sms, both]
 *                 description: Reminder type
 *               message:
 *                 type: string
 *                 description: Reminder message
 *     responses:
 *       200:
 *         description: Reminders sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 results:
 *                   type: object
 *                   properties:
 *                     email:
 *                       type: object
 *                       properties:
 *                         successful:
 *                           type: number
 *                         failed:
 *                           type: number
 *                     sms:
 *                       type: object
 *                       properties:
 *                         successful:
 *                           type: number
 *                         failed:
 *                           type: number
 *       400:
 *         description: Validation error or no attendees to notify
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
 *       403:
 *         description: Insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Event not found
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

const router = express.Router()

// Get all events
router.get(
  "/",
  optionalAuth,
  [
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
    query("type").optional().isIn(["reunion", "webinar", "fundraiser", "networking", "workshop", "social", "other"]),
    query("status").optional().isIn(["draft", "published", "cancelled", "completed"]),
    query("upcoming").optional().isBoolean(),
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

      const filter = { isPublic: true }

      // Add filters
      if (req.query.type) {
        filter.type = req.query.type
      }

      if (req.query.status) {
        filter.status = req.query.status
      } else {
        filter.status = "published" // Default to published events
      }

      if (req.query.upcoming === "true") {
        filter["date.start"] = { $gte: new Date() }
      }

      if (req.query.search) {
        filter.$text = { $search: req.query.search }
      }

      const events = await Event.find(filter)
        .populate("organizer", "firstName lastName")
        .sort({ "date.start": 1 })
        .skip(skip)
        .limit(limit)

      const total = await Event.countDocuments(filter)

      res.json({
        events,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      })
    } catch (error) {
      console.error("Get events error:", error)
      res.status(500).json({ message: "Server error" })
    }
  },
)

// Get event by ID
router.get("/:id", optionalAuth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate("organizer", "firstName lastName email")
      .populate("attendees.user", "firstName lastName")

    if (!event) {
      return res.status(404).json({ message: "Event not found" })
    }

    // Check if event is public or user has access
    if (!event.isPublic && (!req.user || req.user.role !== "admin")) {
      return res.status(403).json({ message: "Access denied" })
    }

    res.json(event)
  } catch (error) {
    console.error("Get event error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Create event
router.post(
  "/",
  authenticateToken,
  requireRole(["admin", "moderator", "alumni"]),
  [
    body("title").trim().notEmpty().withMessage("Title is required"),
    body("description").notEmpty().withMessage("Description is required"),
    body("type")
      .isIn(["reunion", "webinar", "fundraiser", "networking", "workshop", "social", "other"])
      .withMessage("Invalid event type"),
    body("date.start").isISO8601().withMessage("Valid start date is required"),
    body("date.end").isISO8601().withMessage("Valid end date is required"),
    body("location.type").isIn(["physical", "virtual", "hybrid"]).withMessage("Invalid location type"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      // Validate date logic
      const startDate = new Date(req.body.date.start)
      const endDate = new Date(req.body.date.end)

      if (endDate <= startDate) {
        return res.status(400).json({ message: "End date must be after start date" })
      }

      const event = new Event({
        ...req.body,
        organizer: req.user._id,
      })

      await event.save()

      const populatedEvent = await Event.findById(event._id).populate("organizer", "firstName lastName")

      res.status(201).json({
        message: "Event created successfully",
        event: populatedEvent,
      })
    } catch (error) {
      console.error("Create event error:", error)
      res.status(500).json({ message: "Server error" })
    }
  },
)

// Update event
router.put(
  "/:id",
  authenticateToken,
  requireRole(["admin", "moderator", "alumni"]),
  [
    body("title").optional().trim().notEmpty().withMessage("Title cannot be empty"),
    body("description").optional().notEmpty().withMessage("Description cannot be empty"),
    body("type").optional().isIn(["reunion", "webinar", "fundraiser", "networking", "workshop", "social", "other"]),
    body("date.start").optional().isISO8601().withMessage("Valid start date is required"),
    body("date.end").optional().isISO8601().withMessage("Valid end date is required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const event = await Event.findById(req.params.id)

      if (!event) {
        return res.status(404).json({ message: "Event not found" })
      }

      // Check if user can edit this event
      if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== "admin") {
        return res.status(403).json({ message: "Access denied" })
      }

      // Validate date logic if dates are being updated
      if (req.body.date) {
        const startDate = new Date(req.body.date.start || event.date.start)
        const endDate = new Date(req.body.date.end || event.date.end)

        if (endDate <= startDate) {
          return res.status(400).json({ message: "End date must be after start date" })
        }
      }

      Object.keys(req.body).forEach((key) => {
        if (req.body[key] !== undefined) {
          event[key] = req.body[key]
        }
      })

      await event.save()

      const updatedEvent = await Event.findById(event._id).populate("organizer", "firstName lastName")

      res.json({
        message: "Event updated successfully",
        event: updatedEvent,
      })
    } catch (error) {
      console.error("Update event error:", error)
      res.status(500).json({ message: "Server error" })
    }
  },
)

// Delete event
router.delete("/:id", authenticateToken, requireRole(["admin", "moderator", "alumni"]), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)

    if (!event) {
      return res.status(404).json({ message: "Event not found" })
    }

    // Check if user can delete this event
    if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" })
    }

    await Event.findByIdAndDelete(req.params.id)

    res.json({ message: "Event deleted successfully" })
  } catch (error) {
    console.error("Delete event error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// RSVP to event
router.post("/:id/rsvp", authenticateToken, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)

    if (!event) {
      return res.status(404).json({ message: "Event not found" })
    }

    if (event.status !== "published") {
      return res.status(400).json({ message: "Cannot RSVP to unpublished event" })
    }

    // Check if registration deadline has passed
    if (event.registration.deadline && new Date() > event.registration.deadline) {
      return res.status(400).json({ message: "Registration deadline has passed" })
    }

    // Check if event is full
    if (event.capacity && event.attendeeCount >= event.capacity) {
      return res.status(400).json({ message: "Event is full" })
    }

    // Check if user already registered
    const existingAttendee = event.attendees.find((attendee) => attendee.user.toString() === req.user._id.toString())

    if (existingAttendee) {
      return res.status(400).json({ message: "Already registered for this event" })
    }

    // Add attendee
    event.attendees.push({
      user: req.user._id,
      status: "registered",
    })

    await event.save()

    res.json({ message: "Successfully registered for event" })
  } catch (error) {
    console.error("RSVP error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Cancel RSVP
router.delete("/:id/rsvp", authenticateToken, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)

    if (!event) {
      return res.status(404).json({ message: "Event not found" })
    }

    // Find and remove attendee
    const attendeeIndex = event.attendees.findIndex((attendee) => attendee.user.toString() === req.user._id.toString())

    if (attendeeIndex === -1) {
      return res.status(400).json({ message: "Not registered for this event" })
    }

    event.attendees.splice(attendeeIndex, 1)
    await event.save()

    res.json({ message: "RSVP cancelled successfully" })
  } catch (error) {
    console.error("Cancel RSVP error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get event attendees
router.get("/:id/attendees", authenticateToken, requireRole(["admin", "moderator"]), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate(
      "attendees.user",
      "firstName lastName email phone profile.graduationYear",
    )

    if (!event) {
      return res.status(404).json({ message: "Event not found" })
    }

    res.json({
      attendees: event.attendees,
      totalCount: event.attendees.length,
    })
  } catch (error) {
    console.error("Get attendees error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Send event reminders
router.post(
  "/:id/send-reminders",
  authenticateToken,
  requireRole(["admin", "moderator"]),
  [
    body("type").isIn(["email", "sms", "both"]).withMessage("Invalid reminder type"),
    body("message").notEmpty().withMessage("Message is required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { type, message } = req.body
      const event = await Event.findById(req.params.id).populate(
        "attendees.user",
        "firstName lastName email phone preferences",
      )

      if (!event) {
        return res.status(404).json({ message: "Event not found" })
      }

      const attendees = event.attendees.filter((a) => a.status === "registered")

      if (attendees.length === 0) {
        return res.status(400).json({ message: "No registered attendees to notify" })
      }

      let emailResults = { successful: 0, failed: 0 }
      let smsResults = { successful: 0, failed: 0 }

      if (type === "email" || type === "both") {
        const emailRecipients = attendees
          .filter((a) => a.user.preferences?.emailNotifications !== false)
          .map((a) => a.user.email)

        if (emailRecipients.length > 0) {
          emailResults = await sendBulkEmail(emailRecipients, {
            subject: `Reminder: ${event.title}`,
            html: `
            <h2>${event.title}</h2>
            <p><strong>Date:</strong> ${event.date.start.toLocaleDateString()}</p>
            <p><strong>Time:</strong> ${event.date.start.toLocaleTimeString()}</p>
            <p>${message}</p>
          `,
          })
        }
      }

      if (type === "sms" || type === "both") {
        const smsRecipients = attendees
          .filter((a) => a.user.preferences?.smsNotifications !== false)
          .map((a) => a.user.phone)

        if (smsRecipients.length > 0) {
          const smsMessage = `Reminder: ${event.title} on ${event.date.start.toLocaleDateString()}. ${message}`
          smsResults = await sendBulkSMS(smsRecipients, smsMessage)
        }
      }

      res.json({
        message: "Reminders sent successfully",
        results: {
          email: emailResults,
          sms: smsResults,
        },
      })
    } catch (error) {
      console.error("Send reminders error:", error)
      res.status(500).json({ message: "Server error" })
    }
  },
)

module.exports = router
