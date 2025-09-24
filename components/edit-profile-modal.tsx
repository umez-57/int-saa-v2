"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

interface EditProfileModalProps {
  isOpen: boolean
  onClose: () => void
  profile: any
  user: any
  onProfileUpdate?: () => void
}

const ROLES = [
  "Software Engineer",
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Data Scientist",
  "ML Engineer",
  "DevOps Engineer",
  "Cloud Engineer",
  "Mobile Developer",
  "iOS Developer",
  "Android Developer",
  "React Developer",
  "Node.js Developer",
  "Python Developer",
  "Java Developer",
  "C++ Developer",
  "Go Developer",
  "Rust Developer",
  "System Engineer",
  "Database Administrator",
  "Security Engineer",
  "QA Engineer",
  "Test Engineer",
  "Product Manager",
  "Technical Lead",
  "Engineering Manager",
  "Solutions Architect",
  "Site Reliability Engineer",
  "Blockchain Developer",
  "Game Developer",
  "Embedded Systems Engineer",
  "Computer Vision Engineer",
  "NLP Engineer",
  "AI Engineer",
  "Research Engineer",
  "Platform Engineer",
  "Infrastructure Engineer",
  "Network Engineer",
  "Cybersecurity Engineer",
  "Performance Engineer"
]

const EXPERIENCE_LEVELS = [
  { value: "Student", label: "Student" },
  { value: "Fresher", label: "Fresher (0-1 years)" },
  { value: "1-3y", label: "1-3 years" },
  { value: "3-5y", label: "3-5 years" },
  { value: "5+y", label: "5+ years" },
]

const TARGET_TRACKS = [
  { value: "SDE-1", label: "Software Development Engineer - 1" },
  { value: "SDE-2", label: "Software Development Engineer - 2" },
  { value: "SDE-3", label: "Software Development Engineer - 3" },
  { value: "Applied-ML", label: "Applied Machine Learning" },
  { value: "Data", label: "Data Science" },
  { value: "Product", label: "Product Management" },
  { value: "DevOps", label: "DevOps" },
  { value: "Security", label: "Cybersecurity" },
  { value: "Mobile", label: "Mobile Development" },
  { value: "Frontend", label: "Frontend Development" },
  { value: "Backend", label: "Backend Development" },
  { value: "Full-Stack", label: "Full Stack Development" },
]

const PERSONA_PREFERENCES = [
  { value: "HR", label: "HR Interview" },
  { value: "Tech", label: "Technical Interview" },
  { value: "Behavioral", label: "Behavioral Interview" },
]

export function EditProfileModal({ isOpen, onClose, profile, user, onProfileUpdate }: EditProfileModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    preferred_name: "",
    experience_level: "",
    role: "",
    target_track: "",
    persona_pref: "",
    goals: "",
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        preferred_name: profile.preferred_name || "",
        experience_level: profile.experience_level || "",
        role: profile.role || "",
        target_track: profile.target_track || "",
        persona_pref: profile.persona_pref || "",
        goals: profile.goals || "",
      })
    }
  }, [profile])

  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Form submitted!")
    console.log("User:", user)
    console.log("Form data:", formData)
    
    if (!user) {
      console.error("No user found!")
      toast.error("No user found!")
      return
    }

    console.log("Saving profile with data:", formData)
    setIsLoading(true)
    try {
      const supabase = createClient()
      console.log("Supabase client created successfully")
      
      // Check if user is authenticated
      const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser()
      console.log("Current authenticated user:", currentUser)
      if (authError) {
        console.error("Auth error:", authError)
        throw authError
      }
      
      // First, let's check the current profile data
      const { data: currentProfile, error: fetchError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()
      
      console.log("Current profile data:", currentProfile)
      if (fetchError) {
        console.error("Error fetching current profile:", fetchError)
        throw fetchError
      }
      
      // Handle fields with database constraints
      const validExperienceLevels = ['Student', 'Fresher', '1-3y', '3-5y', '5+y']
      const validTargetTracks = ['SDE-1', 'SDE-2', 'SDE-3', 'Applied-ML', 'Data', 'Product', 'DevOps', 'Security', 'Mobile', 'Frontend', 'Backend', 'Full-Stack']
      const validPersonaPrefs = ['HR', 'Tech', 'Behavioral']
      
      const experienceLevel = formData.experience_level && validExperienceLevels.includes(formData.experience_level) 
        ? formData.experience_level 
        : null
        
      const targetTrack = formData.target_track && validTargetTracks.includes(formData.target_track)
        ? formData.target_track
        : null
        
      const personaPref = formData.persona_pref && validPersonaPrefs.includes(formData.persona_pref)
        ? formData.persona_pref
        : null

      const updateData = {
        name: formData.name || null,
        preferred_name: formData.preferred_name || null,
        experience_level: experienceLevel,
        role: formData.role || null,
        target_track: targetTrack,
        persona_pref: personaPref,
        goals: formData.goals || null,
        updated_at: new Date().toISOString(),
      }
      
      console.log("Updating profile with:", updateData)
      console.log("Constraint validations:", {
        experience_level: {
          original: formData.experience_level,
          valid: validExperienceLevels.includes(formData.experience_level),
          final: experienceLevel
        },
        target_track: {
          original: formData.target_track,
          valid: validTargetTracks.includes(formData.target_track),
          final: targetTrack
        },
        persona_pref: {
          original: formData.persona_pref,
          valid: validPersonaPrefs.includes(formData.persona_pref),
          final: personaPref
        }
      })
      
      const { data, error } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("id", user.id)
        .select()

      if (error) {
        console.error("Database update error:", error)
        throw error
      }

      console.log("Database update result:", data)

      if (data && data.length > 0) {
        console.log("Profile updated successfully in database")
        toast.success("Profile updated successfully!")
        
        // Call the callback to refresh profile data
        if (onProfileUpdate) {
          console.log("Calling onProfileUpdate callback")
          onProfileUpdate()
        }
        
        onClose()
      } else {
        console.error("No data returned from update")
        toast.error("Failed to update profile - no data returned")
      }
    } catch (error: any) {
      console.error("Error updating profile:", error)
      toast.error(error.message || "Failed to update profile")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl animate-in fade-in-0 zoom-in-95 duration-300">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                ✨ Edit Profile
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">First Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => updateFormData("name", e.target.value)}
                    required
                    className="bg-white/20 backdrop-blur-sm border border-white/30 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="preferred_name" className="text-sm font-medium text-gray-700 dark:text-gray-300">Last Name</Label>
                  <Input
                    id="preferred_name"
                    value={formData.preferred_name}
                    onChange={(e) => updateFormData("preferred_name", e.target.value)}
                    className="bg-white/20 backdrop-blur-sm border border-white/30 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience_level" className="text-sm font-medium text-gray-700 dark:text-gray-300">Experience Level</Label>
                <Select
                  value={formData.experience_level}
                  onValueChange={(value) => updateFormData("experience_level", value)}
                >
                  <SelectTrigger className="bg-white/20 backdrop-blur-sm border border-white/30 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300">
                    <SelectValue placeholder="Select experience level" />
                  </SelectTrigger>
                  <SelectContent className="bg-white/20 backdrop-blur-xl border border-white/30 shadow-2xl">
                    {EXPERIENCE_LEVELS.map((level) => (
                      <SelectItem key={level.value} value={level.value} className="hover:bg-white/20">
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role" className="text-sm font-medium text-gray-700 dark:text-gray-300">Role</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => updateFormData("role", value)}
                >
                  <SelectTrigger className="bg-white/20 backdrop-blur-sm border border-white/30 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent className="bg-white/20 backdrop-blur-xl border border-white/30 shadow-2xl">
                    {ROLES.map((role) => (
                      <SelectItem key={role} value={role} className="hover:bg-white/20">
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="target_track" className="text-sm font-medium text-gray-700 dark:text-gray-300">Target Track</Label>
                <Select
                  value={formData.target_track}
                  onValueChange={(value) => updateFormData("target_track", value)}
                >
                  <SelectTrigger className="bg-white/20 backdrop-blur-sm border border-white/30 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300">
                    <SelectValue placeholder="Select target track" />
                  </SelectTrigger>
                  <SelectContent className="bg-white/20 backdrop-blur-xl border border-white/30 shadow-2xl">
                    {TARGET_TRACKS.map((track) => (
                      <SelectItem key={track.value} value={track.value} className="hover:bg-white/20">
                        {track.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="persona_pref" className="text-sm font-medium text-gray-700 dark:text-gray-300">Preferred Interview Type</Label>
                <Select
                  value={formData.persona_pref}
                  onValueChange={(value) => updateFormData("persona_pref", value)}
                >
                  <SelectTrigger className="bg-white/20 backdrop-blur-sm border border-white/30 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300">
                    <SelectValue placeholder="Select interview type" />
                  </SelectTrigger>
                  <SelectContent className="bg-white/20 backdrop-blur-xl border border-white/30 shadow-2xl">
                    {PERSONA_PREFERENCES.map((persona) => (
                      <SelectItem key={persona.value} value={persona.value} className="hover:bg-white/20">
                        {persona.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="goals" className="text-sm font-medium text-gray-700 dark:text-gray-300">Career Goals</Label>
                <Textarea
                  id="goals"
                  placeholder="Tell us about your career goals..."
                  value={formData.goals}
                  onChange={(e) => updateFormData("goals", e.target.value)}
                  rows={3}
                  className="bg-white/20 backdrop-blur-sm border border-white/30 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 resize-none"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-6">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={onClose}
                  className="bg-white/10 backdrop-blur-sm border border-white/30 hover:bg-white/20 hover:border-white/40 transition-all duration-300"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  onClick={() => console.log("Save button clicked!")}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  )
}
