const express = require("express")
const { body, query, validationResult } = require("express-validator")
const Job = require("../models/Job")
const { authenticateToken, requireRole, optionalAuth } = require("../middleware/auth")

/**
 * @swagger
 * tags:
 *   name: Jobs
 *   description: Job board and application management
 */

const router = express.Router()

// Get all jobs
router.get(
  "/",
  optionalAuth,
  [
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
    query("type").optional().isIn(["full-time", "part-time", "contract", "internship", "volunteer"]),
    query("category")
      .optional()
      .isIn(["technology", "healthcare", "finance", "education", "marketing", "sales", "operations", "other"]),
    query("experienceLevel").optional().isIn(["entry", "mid", "senior", "executive"]),
    query("location").optional().isString(),
    query("remote").optional().isBoolean(),
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

      const filter = { status: "active" }

      // Add filters
      if (req.query.type) {
        filter.type = req.query.type
      }

      if (req.query.category) {
        filter.category = req.query.category
      }

      if (req.query.experienceLevel) {
        filter.experienceLevel = req.query.experienceLevel
      }

      if (req.query.location) {
        filter.$or = [
          { "company.location.city": new RegExp(req.query.location, "i") },
          { "company.location.country": new RegExp(req.query.location, "i") },
        ]
      }

      if (req.query.remote === "true") {
        filter["company.location.isRemote"] = true
      }

      if (req.query.search) {
        filter.$text = { $search: req.query.search }
      }

      // Filter out expired jobs
      filter.$or = [{ expiresAt: { $exists: false } }, { expiresAt: { $gte: new Date() } }]

      const jobs = await Job.find(filter)
        .populate("postedBy", "firstName lastName")
        .sort({ featured: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)

      const total = await Job.countDocuments(filter)

      res.json({
        jobs,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      })
    } catch (error) {
      console.error("Get jobs error:", error)
      res.status(500).json({ message: "Server error" })
    }
  },
)

// Get job by ID
router.get("/:id", optionalAuth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate("postedBy", "firstName lastName email")
      .populate("applications.applicant", "firstName lastName email")

    if (!job) {
      return res.status(404).json({ message: "Job not found" })
    }

    if (job.status !== "active") {
      return res.status(404).json({ message: "Job not available" })
    }

    // Increment view count
    job.views += 1
    await job.save()

    // Hide applications from non-owners
    if (!req.user || (job.postedBy._id.toString() !== req.user._id.toString() && req.user.role !== "admin")) {
      job.applications = undefined
    }

    res.json(job)
  } catch (error) {
    console.error("Get job error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Create job
router.post(
  "/",
  authenticateToken,
  [
    body("title").trim().notEmpty().withMessage("Job title is required"),
    body("company.name").trim().notEmpty().withMessage("Company name is required"),
    body("description").notEmpty().withMessage("Job description is required"),
    body("type")
      .isIn(["full-time", "part-time", "contract", "internship", "volunteer"])
      .withMessage("Invalid job type"),
    body("category")
      .isIn(["technology", "healthcare", "finance", "education", "marketing", "sales", "operations", "other"])
      .withMessage("Invalid category"),
    body("experienceLevel").isIn(["entry", "mid", "senior", "executive"]).withMessage("Invalid experience level"),
    body("applicationMethod")
      .isIn(["email", "website", "phone", "in_person"])
      .withMessage("Invalid application method"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const job = new Job({
        ...req.body,
        postedBy: req.user._id,
      })

      // Set expiry date if not provided (default 30 days)
      if (!job.expiresAt) {
        job.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }

      await job.save()

      const populatedJob = await Job.findById(job._id).populate("postedBy", "firstName lastName")

      res.status(201).json({
        message: "Job posted successfully",
        job: populatedJob,
      })
    } catch (error) {
      console.error("Create job error:", error)
      res.status(500).json({ message: "Server error" })
    }
  },
)

// Update job
router.put(
  "/:id",
  authenticateToken,
  [
    body("title").optional().trim().notEmpty().withMessage("Job title cannot be empty"),
    body("company.name").optional().trim().notEmpty().withMessage("Company name cannot be empty"),
    body("description").optional().notEmpty().withMessage("Job description cannot be empty"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const job = await Job.findById(req.params.id)

      if (!job) {
        return res.status(404).json({ message: "Job not found" })
      }

      // Check if user can edit this job
      if (job.postedBy.toString() !== req.user._id.toString() && req.user.role !== "admin") {
        return res.status(403).json({ message: "Access denied" })
      }

      Object.keys(req.body).forEach((key) => {
        if (req.body[key] !== undefined) {
          job[key] = req.body[key]
        }
      })

      await job.save()

      const updatedJob = await Job.findById(job._id).populate("postedBy", "firstName lastName")

      res.json({
        message: "Job updated successfully",
        job: updatedJob,
      })
    } catch (error) {
      console.error("Update job error:", error)
      res.status(500).json({ message: "Server error" })
    }
  },
)

// Delete job
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)

    if (!job) {
      return res.status(404).json({ message: "Job not found" })
    }

    // Check if user can delete this job
    if (job.postedBy.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" })
    }

    await Job.findByIdAndDelete(req.params.id)

    res.json({ message: "Job deleted successfully" })
  } catch (error) {
    console.error("Delete job error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Apply to job
router.post(
  "/:id/apply",
  authenticateToken,
  [
    body("coverLetter").optional().isString().withMessage("Cover letter must be a string"),
    body("resume").optional().isURL().withMessage("Resume must be a valid URL"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const job = await Job.findById(req.params.id)

      if (!job) {
        return res.status(404).json({ message: "Job not found" })
      }

      if (job.status !== "active") {
        return res.status(400).json({ message: "Job is not accepting applications" })
      }

      // Check if application deadline has passed
      if (job.applicationDeadline && new Date() > job.applicationDeadline) {
        return res.status(400).json({ message: "Application deadline has passed" })
      }

      // Check if user already applied
      const existingApplication = job.applications.find((app) => app.applicant.toString() === req.user._id.toString())

      if (existingApplication) {
        return res.status(400).json({ message: "Already applied to this job" })
      }

      // Add application
      job.applications.push({
        applicant: req.user._id,
        coverLetter: req.body.coverLetter,
        resume: req.body.resume,
      })

      await job.save()

      res.json({ message: "Application submitted successfully" })
    } catch (error) {
      console.error("Apply to job error:", error)
      res.status(500).json({ message: "Server error" })
    }
  },
)

// Get job applications (for job poster)
router.get("/:id/applications", authenticateToken, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate(
      "applications.applicant",
      "firstName lastName email phone profile",
    )

    if (!job) {
      return res.status(404).json({ message: "Job not found" })
    }

    // Check if user can view applications
    if (job.postedBy.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" })
    }

    res.json({
      applications: job.applications,
      totalCount: job.applications.length,
    })
  } catch (error) {
    console.error("Get job applications error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Update application status
router.put(
  "/:id/applications/:applicationId",
  authenticateToken,
  [
    body("status")
      .isIn(["applied", "reviewed", "shortlisted", "interviewed", "offered", "rejected"])
      .withMessage("Invalid status"),
    body("notes").optional().isString().withMessage("Notes must be a string"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const job = await Job.findById(req.params.id)

      if (!job) {
        return res.status(404).json({ message: "Job not found" })
      }

      // Check if user can update applications
      if (job.postedBy.toString() !== req.user._id.toString() && req.user.role !== "admin") {
        return res.status(403).json({ message: "Access denied" })
      }

      const application = job.applications.id(req.params.applicationId)

      if (!application) {
        return res.status(404).json({ message: "Application not found" })
      }

      application.status = req.body.status
      if (req.body.notes) {
        application.notes = req.body.notes
      }

      await job.save()

      res.json({
        message: "Application status updated successfully",
        application,
      })
    } catch (error) {
      console.error("Update application status error:", error)
      res.status(500).json({ message: "Server error" })
    }
  },
)

// Get user's job applications
router.get("/my/applications", authenticateToken, async (req, res) => {
  try {
    const jobs = await Job.find({
      "applications.applicant": req.user._id,
    })
      .populate("postedBy", "firstName lastName")
      .select("title company type applications")

    const applications = jobs.map((job) => {
      const userApplication = job.applications.find((app) => app.applicant.toString() === req.user._id.toString())

      return {
        job: {
          _id: job._id,
          title: job.title,
          company: job.company,
          type: job.type,
          postedBy: job.postedBy,
        },
        application: userApplication,
      }
    })

    res.json(applications)
  } catch (error) {
    console.error("Get user applications error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router
