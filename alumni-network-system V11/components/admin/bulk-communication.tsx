"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { 
  Send, Users, Mail, MessageSquare, Bell, AlertCircle, CheckCircle, 
  Clock, Calendar as CalendarIcon, FileText, BarChart3, Eye, 
  Settings, Save, Copy, Trash2, Filter, Search, Download,
  Zap, Target, TrendingUp, Activity, Globe, Smartphone
} from "lucide-react"
import { useSendBulkNotificationMutation } from "@/lib/api/adminApi"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface NotificationResult {
  id: string
  sent: number
  failed: number
  type: string
  subject: string
  timestamp: string
  recipients: number
  openRate?: number
  clickRate?: number
  status: "sent" | "scheduled" | "draft" | "failed"
}

interface Template {
  id: string
  name: string
  type: "email" | "sms" | "push"
  subject: string
  content: string
  category: string
  lastUsed?: string
}

interface ScheduledMessage {
  id: string
  type: "email" | "sms" | "push"
  subject: string
  message: string
  scheduledFor: Date
  recipients: string[]
  status: "scheduled" | "sent" | "cancelled"
}

const defaultTemplates: Template[] = [
  {
    id: "1",
    name: "Welcome New Alumni",
    type: "email",
    subject: "Welcome to the Alumni Network!",
    content: "Dear {firstName},\n\nWelcome to our alumni network! We're excited to have you join our community of graduates.\n\nBest regards,\nAlumni Team",
    category: "Welcome"
  },
  {
    id: "2",
    name: "Event Reminder",
    type: "email",
    subject: "Don't Miss: {eventName} - {eventDate}",
    content: "Hi {firstName},\n\nThis is a friendly reminder about the upcoming event: {eventName}\n\nDate: {eventDate}\nLocation: {eventLocation}\n\nWe look forward to seeing you there!",
    category: "Events"
  },
  {
    id: "3",
    name: "Newsletter Update",
    type: "email",
    subject: "Alumni Newsletter - {month} {year}",
    content: "Dear Alumni,\n\nHere's what's happening in our community this month:\n\n• Recent achievements\n• Upcoming events\n• New job opportunities\n\nStay connected!",
    category: "Newsletter"
  },
  {
    id: "4",
    name: "Job Alert",
    type: "sms",
    subject: "New Job Opportunity",
    content: "New job posted: {jobTitle} at {company}. Check your alumni portal for details!",
    category: "Jobs"
  },
  {
    id: "5",
    name: "Emergency Alert",
    type: "push",
    subject: "Important Notice",
    content: "Important update from the Alumni Office. Please check your email for details.",
    category: "Emergency"
  }
]

export function BulkCommunication() {
  const [activeTab, setActiveTab] = useState("compose")
  const [communicationType, setCommunicationType] = useState<"email" | "sms" | "push">("email")
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [priority, setPriority] = useState<"low" | "medium" | "high" | "urgent">("medium")
  const [isScheduled, setIsScheduled] = useState(false)
  const [scheduledDate, setScheduledDate] = useState<Date>()
  const [scheduledTime, setScheduledTime] = useState("09:00")
  const [templates, setTemplates] = useState<Template[]>(defaultTemplates)
  const [results, setResults] = useState<NotificationResult[]>([])
  const [scheduledMessages, setScheduledMessages] = useState<ScheduledMessage[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<string>("")
  const [searchQuery, setSearchQuery] = useState("")
  const [filterCategory, setFilterCategory] = useState("all")
  const [previewMode, setPreviewMode] = useState(false)
  
  // Advanced targeting
  const [targetAudience, setTargetAudience] = useState<{
    all: boolean
    roles: string[]
    graduationYears: number[]
    locations: string[]
    industries: string[]
    specificUsers: string[]
    customFilters: Record<string, any>
  }>({
    all: true,
    roles: [],
    graduationYears: [],
    locations: [],
    industries: [],
    specificUsers: [],
    customFilters: {},
  })

  const [sendBulkNotification, { isLoading }] = useSendBulkNotificationMutation()

  // Load saved drafts and scheduled messages
  useEffect(() => {
    // In a real app, this would load from API
    const savedDrafts = localStorage.getItem("communication-drafts")
    const savedScheduled = localStorage.getItem("scheduled-messages")
    
    if (savedScheduled) {
      setScheduledMessages(JSON.parse(savedScheduled))
    }
  }, [])

  const handleSendNotification = async () => {
    if (!subject.trim() || !message.trim()) {
      return
    }

    try {
      const recipientCount = getEstimatedRecipientsCount()
      
      if (isScheduled && scheduledDate) {
        // Schedule the message
        const newScheduled: ScheduledMessage = {
          id: Date.now().toString(),
          type: communicationType,
          subject,
          message,
          scheduledFor: new Date(`${format(scheduledDate, "yyyy-MM-dd")}T${scheduledTime}`),
          recipients: targetAudience.all ? ["all"] : [...targetAudience.roles, ...targetAudience.locations],
          status: "scheduled"
        }
        
        setScheduledMessages(prev => [...prev, newScheduled])
        localStorage.setItem("scheduled-messages", JSON.stringify([...scheduledMessages, newScheduled]))
        
        setResults((prev) => [
          {
            id: Date.now().toString(),
            sent: 0,
            failed: 0,
            type: communicationType,
            subject,
            timestamp: new Date().toISOString(),
            recipients: recipientCount,
            status: "scheduled"
          },
          ...prev.slice(0, 9),
        ])
      } else {
        // Send immediately
        const result = await sendBulkNotification({
          recipients: targetAudience.all ? ["all"] : targetAudience.roles,
          type: communicationType,
          subject,
          message,
        }).unwrap()

        setResults((prev) => [
          {
            id: Date.now().toString(),
            sent: result.sent || recipientCount,
            failed: result.success ? 0 : 1,
            type: communicationType,
            subject,
            timestamp: new Date().toISOString(),
            recipients: recipientCount,
            openRate: Math.random() * 100,
            clickRate: Math.random() * 50,
            status: "sent"
          },
          ...prev.slice(0, 9),
        ])
      }

      // Clear form
      setSubject("")
      setMessage("")
      setIsScheduled(false)
      setScheduledDate(undefined)
    } catch (error) {
      console.error("Failed to send notification:", error)
      setResults((prev) => [
        {
          id: Date.now().toString(),
          sent: 0,
          failed: 1,
          type: communicationType,
          subject,
          timestamp: new Date().toISOString(),
          recipients: getEstimatedRecipientsCount(),
          status: "failed"
        },
        ...prev.slice(0, 9),
      ])
    }
  }

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t.id === templateId)
    if (template) {
      setSubject(template.subject)
      setMessage(template.content)
      setCommunicationType(template.type)
      setSelectedTemplate(templateId)
    }
  }

  const saveAsTemplate = () => {
    if (!subject.trim() || !message.trim()) return
    
    const newTemplate: Template = {
      id: Date.now().toString(),
      name: subject.substring(0, 30) + (subject.length > 30 ? "..." : ""),
      type: communicationType,
      subject,
      content: message,
      category: "Custom"
    }
    
    setTemplates(prev => [...prev, newTemplate])
  }

  const duplicateTemplate = (template: Template) => {
    const newTemplate: Template = {
      ...template,
      id: Date.now().toString(),
      name: `${template.name} (Copy)`
    }
    setTemplates(prev => [...prev, newTemplate])
  }

  const deleteTemplate = (templateId: string) => {
    setTemplates(prev => prev.filter(t => t.id !== templateId))
  }

  const handleRoleToggle = (role: string) => {
    setTargetAudience((prev) => ({
      ...prev,
      roles: prev.roles.includes(role) ? prev.roles.filter((r) => r !== role) : [...prev.roles, role],
    }))
  }

  const handleLocationToggle = (location: string) => {
    setTargetAudience((prev) => ({
      ...prev,
      locations: prev.locations.includes(location) ? prev.locations.filter((l) => l !== location) : [...prev.locations, location],
    }))
  }

  const handleIndustryToggle = (industry: string) => {
    setTargetAudience((prev) => ({
      ...prev,
      industries: prev.industries.includes(industry) ? prev.industries.filter((i) => i !== industry) : [...prev.industries, industry],
    }))
  }

  const handleGraduationYearToggle = (year: number) => {
    setTargetAudience((prev) => ({
      ...prev,
      graduationYears: prev.graduationYears.includes(year)
        ? prev.graduationYears.filter((y) => y !== year)
        : [...prev.graduationYears, year],
    }))
  }

  const getEstimatedRecipientsCount = () => {
    if (targetAudience.all) return 1250

    let estimate = 0
    if (targetAudience.roles.includes("alumni")) estimate += 1200
    if (targetAudience.roles.includes("moderator")) estimate += 5
    if (targetAudience.roles.includes("admin")) estimate += 3
    
    // Apply location filters
    if (targetAudience.locations.length > 0) {
      estimate = Math.floor(estimate * 0.7) // Assume 70% match location criteria
    }
    
    // Apply industry filters
    if (targetAudience.industries.length > 0) {
      estimate = Math.floor(estimate * 0.6) // Assume 60% match industry criteria
    }

    return Math.max(estimate, 1)
  }

  const getEstimatedRecipients = () => {
    const count = getEstimatedRecipientsCount()
    return `~${count.toLocaleString()} users`
  }

  const graduationYears = Array.from({ length: 20 }, (_, i) => new Date().getFullYear() - i)
  const locations = ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia", "San Antonio", "San Diego", "Dallas", "San Jose"]
  const industries = ["Technology", "Healthcare", "Finance", "Education", "Engineering", "Marketing", "Sales", "Consulting", "Non-profit", "Government"]

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.content.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = filterCategory === "all" || template.category === filterCategory
    return matchesSearch && matchesCategory
  })

  const categories = ["all", ...Array.from(new Set(templates.map(t => t.category)))]

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="compose" className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            Compose
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="scheduled" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Scheduled
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            History
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Compose Tab */}
        <TabsContent value="compose" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Compose Message
              </CardTitle>
              <CardDescription>Create and send bulk communications to your alumni network</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Communication Type */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { type: "email", icon: Mail, label: "Email", desc: "Rich content, attachments" },
                  { type: "sms", icon: MessageSquare, label: "SMS", desc: "Quick, direct messages" },
                  { type: "push", icon: Bell, label: "Push", desc: "Instant notifications" }
                ].map(({ type, icon: Icon, label, desc }) => (
                  <Card 
                    key={type}
                    className={cn(
                      "cursor-pointer transition-all hover:shadow-md",
                      communicationType === type && "ring-2 ring-primary"
                    )}
                    onClick={() => setCommunicationType(type as any)}
                  >
                    <CardContent className="p-4 text-center">
                      <Icon className="h-8 w-8 mx-auto mb-2 text-primary" />
                      <h3 className="font-semibold">{label}</h3>
                      <p className="text-sm text-muted-foreground">{desc}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Template Selection */}
              <div className="space-y-2">
                <Label>Quick Start with Template</Label>
                <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a template (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.slice(0, 5).map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        <div className="flex items-center gap-2">
                          {template.type === "email" && <Mail className="h-4 w-4" />}
                          {template.type === "sms" && <MessageSquare className="h-4 w-4" />}
                          {template.type === "push" && <Bell className="h-4 w-4" />}
                          {template.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Message Content */}
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="subject">Subject Line</Label>
                  <Input
                    id="subject"
                    placeholder={
                      communicationType === "email"
                        ? "Enter email subject..."
                        : communicationType === "sms"
                          ? "SMS title (optional)"
                          : "Push notification title"
                    }
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="message">Message Content</Label>
                  <Textarea
                    id="message"
                    placeholder={
                      communicationType === "email"
                        ? "Compose your email message..."
                        : communicationType === "sms"
                          ? "SMS message (160 characters recommended)"
                          : "Push notification content"
                    }
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={communicationType === "email" ? 8 : 4}
                    className="resize-none"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground mt-1">
                    <span>{message.length} characters</span>
                    {communicationType === "sms" && (
                      <span className={message.length > 160 ? "text-red-500" : ""}>
                        {Math.ceil(message.length / 160)} SMS{message.length > 160 ? "s" : ""}
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Priority Level</Label>
                    <Select value={priority} onValueChange={(value: any) => setPriority(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">🟢 Low Priority</SelectItem>
                        <SelectItem value="medium">🟡 Medium Priority</SelectItem>
                        <SelectItem value="high">🟠 High Priority</SelectItem>
                        <SelectItem value="urgent">🔴 Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2 pt-6">
                    <Switch
                      id="schedule"
                      checked={isScheduled}
                      onCheckedChange={setIsScheduled}
                    />
                    <Label htmlFor="schedule">Schedule for later</Label>
                  </div>
                </div>

                {/* Scheduling Options */}
                {isScheduled && (
                  <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg bg-muted/50">
                    <div>
                      <Label>Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !scheduledDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {scheduledDate ? format(scheduledDate, "PPP") : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={scheduledDate}
                            onSelect={setScheduledDate}
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div>
                      <Label>Time</Label>
                      <Input
                        type="time"
                        value={scheduledTime}
                        onChange={(e) => setScheduledTime(e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              {/* Advanced Targeting */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  <Label className="text-base font-semibold">Target Audience</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="all-users"
                    checked={targetAudience.all}
                    onCheckedChange={(checked) => setTargetAudience((prev) => ({ ...prev, all: !!checked }))}
                  />
                  <Label htmlFor="all-users" className="font-medium">Send to all users</Label>
                </div>

                {!targetAudience.all && (
                  <div className="space-y-6 pl-6 border-l-2 border-muted">
                    {/* User Roles */}
                    <div>
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        User Roles
                      </Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {["alumni", "moderator", "admin"].map((role) => (
                          <div key={role} className="flex items-center space-x-2">
                            <Checkbox
                              id={`role-${role}`}
                              checked={targetAudience.roles.includes(role)}
                              onCheckedChange={() => handleRoleToggle(role)}
                            />
                            <Label htmlFor={`role-${role}`} className="capitalize">
                              {role}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Locations */}
                    <div>
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        Locations
                      </Label>
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        {locations.slice(0, 6).map((location) => (
                          <div key={location} className="flex items-center space-x-2">
                            <Checkbox
                              id={`location-${location}`}
                              checked={targetAudience.locations.includes(location)}
                              onCheckedChange={() => handleLocationToggle(location)}
                            />
                            <Label htmlFor={`location-${location}`} className="text-sm">
                              {location}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Industries */}
                    <div>
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <Zap className="h-4 w-4" />
                        Industries
                      </Label>
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        {industries.slice(0, 6).map((industry) => (
                          <div key={industry} className="flex items-center space-x-2">
                            <Checkbox
                              id={`industry-${industry}`}
                              checked={targetAudience.industries.includes(industry)}
                              onCheckedChange={() => handleIndustryToggle(industry)}
                            />
                            <Label htmlFor={`industry-${industry}`} className="text-sm">
                              {industry}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Graduation Years */}
                    <div>
                      <Label className="text-sm font-medium">Graduation Years</Label>
                      <div className="grid grid-cols-4 gap-2 mt-2">
                        {graduationYears.slice(0, 8).map((year) => (
                          <div key={year} className="flex items-center space-x-2">
                            <Checkbox
                              id={`year-${year}`}
                              checked={targetAudience.graduationYears.includes(year)}
                              onCheckedChange={() => handleGraduationYearToggle(year)}
                            />
                            <Label htmlFor={`year-${year}`} className="text-sm">
                              {year}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <Alert>
                  <Users className="h-4 w-4" />
                  <AlertDescription>
                    <div className="flex justify-between items-center">
                      <span>Estimated recipients: <strong>{getEstimatedRecipients()}</strong></span>
                      <Badge variant="outline">
                        {communicationType === "sms" && "SMS charges apply"}
                        {communicationType === "email" && "Free"}
                        {communicationType === "push" && "Free"}
                      </Badge>
                    </div>
                  </AlertDescription>
                </Alert>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex gap-2">
                  <Button variant="outline" onClick={saveAsTemplate}>
                    <Save className="h-4 w-4 mr-2" />
                    Save as Template
                  </Button>
                  <Button variant="outline" onClick={() => setPreviewMode(true)}>
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                </div>
                
                <Button 
                  onClick={handleSendNotification} 
                  disabled={isLoading || !subject.trim() || !message.trim()}
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Send className="h-4 w-4 mr-2 animate-pulse" />
                      {isScheduled ? "Scheduling..." : "Sending..."}
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      {isScheduled ? "Schedule Message" : "Send Now"}
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Message Templates
                  </CardTitle>
                  <CardDescription>Manage and organize your communication templates</CardDescription>
                </div>
                <Button onClick={() => setActiveTab("compose")}>
                  <Send className="h-4 w-4 mr-2" />
                  Create New
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Search and Filter */}
                <div className="flex gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search templates..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category === "all" ? "All Categories" : category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Templates Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredTemplates.map((template) => (
                    <Card key={template.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            {template.type === "email" && <Mail className="h-4 w-4 text-blue-500" />}
                            {template.type === "sms" && <MessageSquare className="h-4 w-4 text-green-500" />}
                            {template.type === "push" && <Bell className="h-4 w-4 text-purple-500" />}
                            <div>
                              <CardTitle className="text-sm">{template.name}</CardTitle>
                              <Badge variant="outline" className="text-xs mt-1">
                                {template.category}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleTemplateSelect(template.id)}
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => duplicateTemplate(template)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteTemplate(template.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {template.content}
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full mt-3"
                          onClick={() => {
                            handleTemplateSelect(template.id)
                            setActiveTab("compose")
                          }}
                        >
                          Use Template
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Scheduled Tab */}
        <TabsContent value="scheduled" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Scheduled Messages
              </CardTitle>
              <CardDescription>Manage your scheduled communications</CardDescription>
            </CardHeader>
            <CardContent>
              {scheduledMessages.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No scheduled messages</p>
                  <Button className="mt-4" onClick={() => setActiveTab("compose")}>
                    Schedule a Message
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {scheduledMessages.map((scheduled) => (
                    <Card key={scheduled.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {scheduled.type === "email" && <Mail className="h-4 w-4 text-blue-500" />}
                            {scheduled.type === "sms" && <MessageSquare className="h-4 w-4 text-green-500" />}
                            {scheduled.type === "push" && <Bell className="h-4 w-4 text-purple-500" />}
                            <div>
                              <h4 className="font-medium">{scheduled.subject}</h4>
                              <p className="text-sm text-muted-foreground">
                                Scheduled for {format(scheduled.scheduledFor, "PPP 'at' p")}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={scheduled.status === "scheduled" ? "default" : "secondary"}>
                              {scheduled.status}
                            </Badge>
                            <Button variant="outline" size="sm">
                              Edit
                            </Button>
                            <Button variant="outline" size="sm">
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Communication History
                  </CardTitle>
                  <CardDescription>Track your sent communications and their performance</CardDescription>
                </div>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {results.length === 0 ? (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No communication history yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {results.map((result) => (
                    <Card key={result.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {result.type === "email" && <Mail className="h-4 w-4 text-blue-500" />}
                            {result.type === "sms" && <MessageSquare className="h-4 w-4 text-green-500" />}
                            {result.type === "push" && <Bell className="h-4 w-4 text-purple-500" />}
                            <div>
                              <h4 className="font-medium">{result.subject}</h4>
                              <p className="text-sm text-muted-foreground">
                                {format(new Date(result.timestamp), "PPP 'at' p")}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-green-600">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  {result.sent} sent
                                </Badge>
                                {result.failed > 0 && (
                                  <Badge variant="outline" className="text-red-600">
                                    <AlertCircle className="h-3 w-3 mr-1" />
                                    {result.failed} failed
                                  </Badge>
                                )}
                              </div>
                              {result.openRate && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  {result.openRate.toFixed(1)}% open rate
                                </p>
                              )}
                            </div>
                            <Badge variant={
                              result.status === "sent" ? "default" :
                              result.status === "scheduled" ? "secondary" :
                              result.status === "failed" ? "destructive" : "outline"
                            }>
                              {result.status}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
                <Send className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {results.reduce((acc, r) => acc + r.sent, 0).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  <TrendingUp className="inline h-3 w-3 mr-1 text-green-500" />
                  +12% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg. Open Rate</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {results.length > 0 
                    ? (results.reduce((acc, r) => acc + (r.openRate || 0), 0) / results.length).toFixed(1)
                    : "0"}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Email communications
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {results.length > 0 
                    ? ((results.reduce((acc, r) => acc + r.sent, 0) / 
                       results.reduce((acc, r) => acc + r.sent + r.failed, 0)) * 100).toFixed(1)
                    : "0"}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Delivery success rate
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{scheduledMessages.length}</div>
                <p className="text-xs text-muted-foreground">
                  Pending messages
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Communication Performance</CardTitle>
              <CardDescription>Detailed analytics and insights</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Email Performance</span>
                    <span className="text-sm text-muted-foreground">85%</span>
                  </div>
                  <Progress value={85} className="h-2" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">SMS Delivery</span>
                    <span className="text-sm text-muted-foreground">92%</span>
                  </div>
                  <Progress value={92} className="h-2" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Push Notifications</span>
                    <span className="text-sm text-muted-foreground">78%</span>
                  </div>
                  <Progress value={78} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
