"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle, User, Mail, Calendar, Briefcase, Target, Globe, Lightbulb } from "lucide-react"
import type { User } from "@supabase/supabase-js"

export default function ProfileCompletePage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  // Form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    age: "",
    experienceLevel: "",
    role: "",
    targetTrack: "",
    personaPref: "",
    goals: ""
  })

  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser()
      if (error || !data?.user) {
        router.push("/auth/login")
        return
      }
      setUser(data.user)
      setLoading(false)
    }

    getUser()
  }, [supabase, router])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSaveProfile = async () => {
    if (!user) return

    // Validate required fields
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      alert("First name and last name are required!")
      return
    }

    setSaving(true)
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          name: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
          preferred_name: formData.firstName.trim(),
          experience_level: formData.experienceLevel || null,
          role: formData.role || null,
          target_track: formData.targetTrack || null,
          persona_pref: formData.personaPref || null,
          goals: formData.goals || null,
          profile_completed: true,
          updated_at: new Date().toISOString()
        })
        .eq("id", user.id)

      if (error) {
        console.error("Error updating profile:", error)
        alert("Failed to save profile. Please try again.")
        return
      }

      // Redirect to dashboard
      router.push("/dashboard")
    } catch (error) {
      console.error("Error saving profile:", error)
      alert("Failed to save profile. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const handleSkip = async () => {
    if (!user) return

    // Save minimal profile with just required fields
    setSaving(true)
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          name: "User",
          preferred_name: "User",
          profile_completed: true,
          updated_at: new Date().toISOString()
        })
        .eq("id", user.id)

      if (error) {
        console.error("Error updating profile:", error)
        alert("Failed to save profile. Please try again.")
        return
      }

      router.push("/dashboard")
    } catch (error) {
      console.error("Error saving profile:", error)
      alert("Failed to save profile. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-2xl px-6 py-12">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <User className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
            <CardDescription>
              Help us personalize your interview experience. Only first name and last name are required.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Required Fields */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-primary" />
                Required Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    First Name *
                  </Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    placeholder="Enter your first name"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Last Name *
                  </Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    placeholder="Enter your last name"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Optional Fields */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-muted-foreground" />
                Optional Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age" className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Age
                  </Label>
                  <Input
                    id="age"
                    type="number"
                    value={formData.age}
                    onChange={(e) => handleInputChange("age", e.target.value)}
                    placeholder="Enter your age"
                    min="16"
                    max="100"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="experienceLevel" className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    Experience Level
                  </Label>
                  <Select value={formData.experienceLevel} onValueChange={(value) => handleInputChange("experienceLevel", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select experience level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Student">Student</SelectItem>
                      <SelectItem value="Fresher">Fresher</SelectItem>
                      <SelectItem value="1-3y">1-3 years</SelectItem>
                      <SelectItem value="3-5y">3-5 years</SelectItem>
                      <SelectItem value="5+y">5+ years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role" className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  Current Role
                </Label>
                <Select value={formData.role} onValueChange={(value) => handleInputChange("role", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Software Engineer">Software Engineer</SelectItem>
                    <SelectItem value="Frontend Developer">Frontend Developer</SelectItem>
                    <SelectItem value="Backend Developer">Backend Developer</SelectItem>
                    <SelectItem value="Full Stack Developer">Full Stack Developer</SelectItem>
                    <SelectItem value="Data Scientist">Data Scientist</SelectItem>
                    <SelectItem value="ML Engineer">ML Engineer</SelectItem>
                    <SelectItem value="DevOps Engineer">DevOps Engineer</SelectItem>
                    <SelectItem value="Cloud Engineer">Cloud Engineer</SelectItem>
                    <SelectItem value="Mobile Developer">Mobile Developer</SelectItem>
                    <SelectItem value="iOS Developer">iOS Developer</SelectItem>
                    <SelectItem value="Android Developer">Android Developer</SelectItem>
                    <SelectItem value="React Developer">React Developer</SelectItem>
                    <SelectItem value="Node.js Developer">Node.js Developer</SelectItem>
                    <SelectItem value="Python Developer">Python Developer</SelectItem>
                    <SelectItem value="Java Developer">Java Developer</SelectItem>
                    <SelectItem value="C++ Developer">C++ Developer</SelectItem>
                    <SelectItem value="Go Developer">Go Developer</SelectItem>
                    <SelectItem value="Rust Developer">Rust Developer</SelectItem>
                    <SelectItem value="System Engineer">System Engineer</SelectItem>
                    <SelectItem value="Database Administrator">Database Administrator</SelectItem>
                    <SelectItem value="Security Engineer">Security Engineer</SelectItem>
                    <SelectItem value="QA Engineer">QA Engineer</SelectItem>
                    <SelectItem value="Test Engineer">Test Engineer</SelectItem>
                    <SelectItem value="Product Manager">Product Manager</SelectItem>
                    <SelectItem value="Technical Lead">Technical Lead</SelectItem>
                    <SelectItem value="Engineering Manager">Engineering Manager</SelectItem>
                    <SelectItem value="Solutions Architect">Solutions Architect</SelectItem>
                    <SelectItem value="Site Reliability Engineer">Site Reliability Engineer</SelectItem>
                    <SelectItem value="Blockchain Developer">Blockchain Developer</SelectItem>
                    <SelectItem value="Game Developer">Game Developer</SelectItem>
                    <SelectItem value="Embedded Systems Engineer">Embedded Systems Engineer</SelectItem>
                    <SelectItem value="Computer Vision Engineer">Computer Vision Engineer</SelectItem>
                    <SelectItem value="NLP Engineer">NLP Engineer</SelectItem>
                    <SelectItem value="AI Engineer">AI Engineer</SelectItem>
                    <SelectItem value="Research Engineer">Research Engineer</SelectItem>
                    <SelectItem value="Platform Engineer">Platform Engineer</SelectItem>
                    <SelectItem value="Infrastructure Engineer">Infrastructure Engineer</SelectItem>
                    <SelectItem value="Network Engineer">Network Engineer</SelectItem>
                    <SelectItem value="Cybersecurity Engineer">Cybersecurity Engineer</SelectItem>
                    <SelectItem value="Performance Engineer">Performance Engineer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetTrack" className="flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Target Track
                </Label>
                <Select value={formData.targetTrack} onValueChange={(value) => handleInputChange("targetTrack", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select target track" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SDE-1">Software Development Engineer - 1</SelectItem>
                    <SelectItem value="SDE-2">Software Development Engineer - 2</SelectItem>
                    <SelectItem value="SDE-3">Software Development Engineer - 3</SelectItem>
                    <SelectItem value="Applied-ML">Applied Machine Learning</SelectItem>
                    <SelectItem value="Data">Data Science</SelectItem>
                    <SelectItem value="Product">Product Management</SelectItem>
                    <SelectItem value="DevOps">DevOps</SelectItem>
                    <SelectItem value="Security">Cybersecurity</SelectItem>
                    <SelectItem value="Mobile">Mobile Development</SelectItem>
                    <SelectItem value="Frontend">Frontend Development</SelectItem>
                    <SelectItem value="Backend">Backend Development</SelectItem>
                    <SelectItem value="Full-Stack">Full Stack Development</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="personaPref" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Preferred Interview Type
                </Label>
                <Select value={formData.personaPref} onValueChange={(value) => handleInputChange("personaPref", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select preferred interview type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HR">HR Interview</SelectItem>
                    <SelectItem value="Tech">Technical Interview</SelectItem>
                    <SelectItem value="Behavioral">Behavioral Interview</SelectItem>
                  </SelectContent>
                </Select>
              </div>


              <div className="space-y-2">
                <Label htmlFor="goals" className="flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Career Goals
                </Label>
                <Textarea
                  id="goals"
                  value={formData.goals}
                  onChange={(e) => handleInputChange("goals", e.target.value)}
                  placeholder="Tell us about your career goals and what you want to achieve..."
                  rows={3}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6">
              <Button
                onClick={handleSaveProfile}
                disabled={saving || !formData.firstName.trim() || !formData.lastName.trim()}
                className="flex-1"
              >
                {saving ? "Saving..." : "Save Profile"}
              </Button>
              <Button
                onClick={handleSkip}
                variant="outline"
                disabled={saving}
                className="flex-1"
              >
                Skip for Now
              </Button>
            </div>

            <p className="text-sm text-muted-foreground text-center">
              You can always update your profile later from the dashboard.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
