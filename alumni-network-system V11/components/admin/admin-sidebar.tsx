"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  BarChart3,
  Users,
  Calendar,
  Megaphone,
  Briefcase,
  Settings,
  FileText,
  CreditCard,
  Bell,
  Shield,
  HelpCircle,
  LogOut,
  Menu,
  Home,
  Database,
  UserCheck,
  TrendingUp,
  Mail,
  MessageSquare,
} from "lucide-react"
import { useSelector, useDispatch } from "react-redux"
import type { RootState } from "@/lib/store"
import { logout } from "@/lib/slices/authSlice"
import { UserForm } from "@/components/admin/user-form"

interface SidebarItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
  children?: SidebarItem[]
  isAction?: boolean
}

const sidebarItems: SidebarItem[] = [
  {
    title: "Dashboard",
    href: "/admin/dashboard",
    icon: BarChart3,
  },
  {
    title: "User Management",
    href: "/admin/users",
    icon: Users,
    children: [
      {
        title: "All Users",
        href: "/admin/users",
        icon: Users,
      },
      {
        title: "Create User",
        href: "/admin/users?addUser=1",
        icon: UserCheck,
      },
    ],
  },
  {
    title: "Event Management",
    href: "/admin/events",
    icon: Calendar,
    children: [
      {
        title: "All Events",
        href: "/admin/events",
        icon: Calendar,
      },
      {
        title: "Create Event",
        href: "/admin/events?addEvent=1",
        icon: Calendar,
      },
    ],
  },
  {
    title: "Announcements",
    href: "/admin/announcements",
    icon: Megaphone,
    children: [
      {
        title: "All Announcements",
        href: "/admin/announcements",
        icon: Megaphone,
      },
      {
        title: "Create Announcement",
        href: "/admin/announcements/create",
        icon: Megaphone,
      },
    ],
  },
  {
    title: "Job Management",
    href: "/admin/jobs",
    icon: Briefcase,
    children: [
      {
        title: "All Jobs",
        href: "/admin/jobs",
        icon: Briefcase,
      },
      {
        title: "Job Categories",
        href: "/admin/jobs/categories",
        icon: Database,
      },
      {
        title: "Job Analytics",
        href: "/admin/jobs/analytics",
        icon: TrendingUp,
      },
    ],
  },
  {
    title: "Payments",
    href: "/admin/payments",
    icon: CreditCard,
    children: [
      {
        title: "All Payments",
        href: "/admin/payments",
        icon: CreditCard,
      },
      {
        title: "Financial Reports",
        href: "/admin/payments/reports",
        icon: FileText,
      },
    ],
  },
  {
    title: "Communications",
    href: "/admin/communications",
    icon: Mail,
    children: [
      {
        title: "Bulk Messages",
        href: "/admin/communications/bulk",
        icon: Mail,
      },
      {
        title: "Email Templates",
        href: "/admin/communications/templates",
        icon: MessageSquare,
      },
      {
        title: "Notifications",
        href: "/admin/communications/notifications",
        icon: Bell,
      },
    ],
  },
  {
    title: "System",
    href: "/admin/system",
    icon: Settings,
    children: [
      {
        title: "System Settings",
        href: "/admin/system/settings",
        icon: Settings,
      },
      {
        title: "System Logs",
        href: "/admin/system/logs",
        icon: FileText,
      },
      {
        title: "Security",
        href: "/admin/system/security",
        icon: Shield,
      },
    ],
  },
]

interface AdminSidebarProps {
  className?: string
}

export function AdminSidebar({ className }: AdminSidebarProps) {
  const pathname = usePathname()
  const dispatch = useDispatch()
  const { user } = useSelector((state: RootState) => state.auth)
  const [expandedItems, setExpandedItems] = useState<string[]>([])

  const toggleExpanded = (href: string) => {
    setExpandedItems(prev =>
      prev.includes(href)
        ? prev.filter(item => item !== href)
        : [...prev, href]
    )
  }

  const handleLogout = () => {
    dispatch(logout())
  }

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/admin/dashboard" className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded bg-primary flex items-center justify-center">
            <Home className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-bold">Admin Panel</span>
        </Link>
      </div>

      {/* User Info */}
      <div className="border-b p-4">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Users className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.role} • {user?.email}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3">
        <div className="space-y-1 py-4">
          {sidebarItems.map((item) => (
            <div key={item.href}>
              {item.children ? (
                <Button
                  variant={pathname === item.href ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start h-10",
                    pathname === item.href && "bg-secondary"
                  )}
                  onClick={() => toggleExpanded(item.href)}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center">
                      <item.icon className="mr-3 h-4 w-4" />
                      <span>{item.title}</span>
                    </div>
                    <div className={cn(
                      "transition-transform",
                      expandedItems.includes(item.href) && "rotate-90"
                    )}>
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Button>
              ) : (
                <Button
                  variant={pathname === item.href ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start h-10",
                    pathname === item.href && "bg-secondary"
                  )}
                  asChild
                >
                  <Link href={item.href} className="flex items-center w-full">
                    <item.icon className="mr-3 h-4 w-4" />
                    <span>{item.title}</span>
                    {item.badge && (
                      <span className="ml-auto bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </Button>
              )}

              {/* Submenu */}
              {item.children && expandedItems.includes(item.href) && (
                <div className="ml-4 mt-1 space-y-1">
                  {item.children.map((child) => (
                    child.isAction ? (
                      <Button
                        key={child.title}
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start h-8"
                      >
                        <child.icon className="mr-2 h-3 w-3" />
                        <span className="text-xs">{child.title}</span>
                      </Button>
                    ) : (
                      <Button
                        key={child.href}
                        variant={pathname === child.href ? "secondary" : "ghost"}
                        size="sm"
                        className={cn(
                          "w-full justify-start h-8",
                          pathname === child.href && "bg-secondary"
                        )}
                        asChild
                      >
                        <Link href={child.href}>
                          <child.icon className="mr-2 h-3 w-3" />
                          <span className="text-xs">{child.title}</span>
                        </Link>
                      </Button>
                    )
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="border-t p-4 space-y-2">
        <Button variant="ghost" size="sm" className="w-full justify-start h-8">
          <HelpCircle className="mr-2 h-4 w-4" />
          <span className="text-xs">Help & Support</span>
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full justify-start h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span className="text-xs">Logout</span>
        </Button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <div className={cn("hidden lg:block w-64 border-r bg-card", className)}>
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      <Sheet>
        <SheetTrigger asChild className="lg:hidden">
          <Button variant="outline" size="icon" className="fixed top-4 left-4 z-40">
            <Menu className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>
    </>
  )
} 