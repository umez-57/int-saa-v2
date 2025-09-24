"use client"

import { useState, useRef, useEffect } from "react"
import { User, Settings, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { EditProfileModal } from "./edit-profile-modal"

interface ProfileDropdownProps {
  user: any
  profile: any
  onLogout: () => void
  onProfileUpdate?: () => void
}

export function ProfileDropdown({ user, profile, onLogout, onProfileUpdate }: ProfileDropdownProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const getInitials = (name: string) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isDropdownOpen])

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <Button 
          variant="ghost" 
          size="icon"
          className="relative h-8 w-8 rounded-full bg-primary text-primary-foreground"
          onClick={() => {
            console.log("Profile button clicked, toggling dropdown")
            setIsDropdownOpen(!isDropdownOpen)
          }}
        >
          {getInitials(profile?.name || user?.email || "User")}
        </Button>
        
        {isDropdownOpen && (
          <div className="absolute right-0 top-10 w-56 bg-background border border-border rounded-md shadow-lg z-50">
            <div className="p-3">
              <div className="flex flex-col space-y-1">
                <p className="font-medium text-sm">{profile?.name || "User"}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.email}
                </p>
              </div>
            </div>
            
            <div className="border-t border-border">
              <button
                className="w-full flex items-center px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                onClick={() => {
                  console.log("Edit profile clicked")
                  setIsDropdownOpen(false)
                  setIsEditModalOpen(true)
                }}
              >
                <Settings className="mr-2 h-4 w-4" />
                <span>Edit Profile</span>
              </button>
            </div>
            
            <div className="border-t border-border">
              <button
                className="w-full flex items-center px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground text-red-600 hover:text-red-700 disabled:opacity-50"
                disabled={isLoggingOut}
                onClick={async () => {
                  console.log("Logout clicked")
                  setIsLoggingOut(true)
                  setIsDropdownOpen(false)
                  try {
                    await onLogout()
                  } catch (error) {
                    console.error("Logout error:", error)
                    setIsLoggingOut(false)
                  }
                }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>{isLoggingOut ? "Logging out..." : "Log out"}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        profile={profile}
        user={user}
        onProfileUpdate={onProfileUpdate}
      />
    </>
  )
}
