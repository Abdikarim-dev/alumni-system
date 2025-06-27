// Core type definitions for the Alumni Network System

export interface User {
  _id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  role: "alumni" | "admin" | "moderator"
  profile?: UserProfile
  preferences?: UserPreferences
  isActive: boolean
  membershipStatus: "active" | "inactive" | "suspended"
  avatar?: string
  isEmailVerified?: boolean
  isPhoneVerified?: boolean
  createdAt: string
  updatedAt: string
  lastLogin?: string
}

export interface UserProfile {
  graduationYear: number
  degree: string
  major: string
  profession?: string
  company?: string
  location?: {
    city: string
    country: string
  }
  bio?: string
  profilePicture?: string
  socialLinks?: {
    linkedin?: string
    twitter?: string
    facebook?: string
    website?: string
  }
  skills?: string[]
  interests?: string[]
}

export interface UserPreferences {
  emailNotifications: boolean
  smsNotifications: boolean
  pushNotifications: boolean
  privacy: {
    showEmail: boolean
    showPhone: boolean
    showLocation: boolean
  }
}

export interface Event {
  _id: string
  title: string
  description: string
  type: "reunion" | "webinar" | "fundraiser" | "networking" | "workshop" | "social" | "other"
  date: {
    start: string
    end: string
  }
  location: {
    type: "physical" | "virtual" | "hybrid"
    venue?: string
    address?: string
    city?: string
    country?: string
    virtualLink?: string
  }
  organizer: User
  capacity?: number
  attendeeCount: number
  registration: {
    isRequired: boolean
    deadline?: string
    fee?: {
      amount: number
      currency: string
    }
  }
  attendees: EventAttendee[]
  tags: string[]
  isPublic: boolean
  status: "draft" | "published" | "cancelled" | "completed"
  createdAt: string
  updatedAt: string
}

export interface EventAttendee {
  user: string
  status: "registered" | "attended" | "cancelled"
  registeredAt: string
}

export interface Announcement {
  _id: string
  title: string
  content: string
  author: User
  category: "general" | "jobs" | "news" | "scholarships" | "events" | "achievements" | "obituary"
  priority: "low" | "medium" | "high" | "urgent"
  status: "draft" | "published" | "archived"
  publishDate: string
  expiryDate?: string
  isPinned: boolean
  engagement: {
    views: number
    likes: AnnouncementLike[]
    comments: AnnouncementComment[]
  }
  targetAudience?: {
    isPublic: boolean
    graduationYears?: number[]
    roles?: string[]
  }
  createdAt: string
  updatedAt: string
}

export interface AnnouncementLike {
  user: string
  likedAt: string
}

export interface AnnouncementComment {
  _id: string
  user: User
  content: string
  createdAt: string
}

export interface Job {
  _id: string
  title: string
  description: string
  company: {
    name: string
    logo?: string
    website?: string
    location: {
      city: string
      country: string
      isRemote: boolean
    }
  }
  type: "full-time" | "part-time" | "contract" | "internship" | "volunteer"
  category: "technology" | "healthcare" | "finance" | "education" | "marketing" | "sales" | "operations" | "other"
  experienceLevel: "entry" | "mid" | "senior" | "executive"
  requirements?: string[]
  salary?: {
    min: number
    max: number
    currency: string
  }
  applicationMethod: {
    type: "email" | "url" | "internal"
    contact: string
  }
  postedBy: User
  views: number
  applicationCount: number
  status: "active" | "closed" | "draft"
  createdAt: string
  expiresAt?: string
}

export interface Payment {
  _id: string
  amount: number
  currency: string
  type: "membership" | "donation" | "event_ticket" | "merchandise" | "other"
  purpose: string
  status: "pending" | "completed" | "failed" | "refunded"
  paymentMethod: "card" | "hormuud" | "zaad" | "paypal"
  transactionId?: string
  user: string
  stripePaymentIntentId?: string
  createdAt: string
  updatedAt: string
}

export interface PaginationParams {
  page?: number
  limit?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  totalPages: number
  currentPage: number
    limit: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export interface ApiResponse<T = any> {
  message: string
  data?: T
  errors?: Array<{
    field: string
    message: string
  }>
}

// Redux State Types
export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

export interface UsersState {
  users: User[]
  selectedUser: User | null
  searchResults: User[]
  isLoading: boolean
  error: string | null
}

export interface EventsState {
  events: Event[]
  selectedEvent: Event | null
  myEvents: Event[]
  isLoading: boolean
  error: string | null
}

export interface AnnouncementsState {
  announcements: Announcement[]
  selectedAnnouncement: Announcement | null
  isLoading: boolean
  error: string | null
}

export interface JobsState {
  jobs: Job[]
  selectedJob: Job | null
  myJobs: Job[]
  applications: JobApplication[]
  isLoading: boolean
  error: string | null
}

export interface JobApplication {
  _id: string
  job: Job
  applicant: User
  status: "pending" | "reviewed" | "accepted" | "rejected"
  appliedAt: string
}

export interface PaymentsState {
  payments: Payment[]
  selectedPayment: Payment | null
  paymentIntent: any
  isLoading: boolean
  error: string | null
}

export interface NotificationsState {
  notifications: Notification[]
  unreadCount: number
  isLoading: boolean
  error: string | null
}

export interface Notification {
  _id: string
  user: string
  type: "event" | "announcement" | "job" | "payment" | "system"
  title: string
  message: string
  isRead: boolean
  createdAt: string
}

export interface UIState {
  theme: "light" | "dark"
  sidebarOpen: boolean
  modals: {
    [key: string]: boolean
  }
  loading: {
    [key: string]: boolean
  }
}

export interface RootState {
  auth: AuthState
  users: UsersState
  events: EventsState
  announcements: AnnouncementsState
  jobs: JobsState
  payments: PaymentsState
  notifications: NotificationsState
  ui: UIState
}
