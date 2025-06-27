"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSelector } from "react-redux"
import { type RootState } from "@/lib/store"
import { Loader2 } from "lucide-react"

interface RouteGuardProps {
  children: React.ReactNode
  requiredRole?: "admin" | "moderator" | "alumni"
  redirectTo?: string
}

export function RouteGuard({ 
  children, 
  requiredRole, 
  redirectTo = "/auth/login" 
}: RouteGuardProps) {
  const router = useRouter()
  const { isAuthenticated, user, token } = useSelector((state: RootState) => state.auth)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Wait a moment for Redux to rehydrate from localStorage
    const timer = setTimeout(() => {
      // Check if user is not authenticated
      if (!isAuthenticated || !user || !token) {
        router.push(redirectTo)
        return
      }

      // Check role-based access
      if (requiredRole) {
        if (requiredRole === "admin" && user.role !== "admin") {
          // Non-admin trying to access admin pages
          router.push("/dashboard")
          return
        }
        
        if (requiredRole === "moderator" && !["admin", "moderator"].includes(user.role)) {
          // Non-moderator/admin trying to access moderator pages
          router.push("/dashboard")
          return
        }
      }

      setIsLoading(false)
    }, 100) // Small delay to allow Redux rehydration

    return () => clearTimeout(timer)
  }, [isAuthenticated, user, token, requiredRole, router, redirectTo])

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="text-lg">Loading...</span>
        </div>
      </div>
    )
  }

  // If we reach here, user is authenticated and has proper role
  return <>{children}</>
} 