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
import { CheckCircle, User, Mail, Calendar, Briefcase, Target, Globe, Lightbulb, Sun, Moon, ArrowLeft } from "lucide-react"
import Link from "next/link"
import type { User } from "@supabase/supabase-js"

export default function ProfileCompletePage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isDark, setIsDark] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const theme = localStorage.getItem('theme')
    setIsDark(theme === 'dark')
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    }
  }, [])

  const toggleTheme = () => {
    const newTheme = !isDark
    setIsDark(newTheme)
    if (newTheme) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }

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
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center relative">
        {/* Background Gradients */}
        <div className="fixed inset-0 pointer-events-none">
          <div 
            className="absolute top-0 left-0 w-96 h-96 bg-blue-500/20 dark:bg-blue-600/15 rounded-full"
            style={{ filter: 'blur(60px)' }}
          />
          <div 
            className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 dark:bg-indigo-600/15 rounded-full"
            style={{ filter: 'blur(60px)' }}
          />
          <div 
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-400/15 dark:bg-blue-500/10 rounded-full"
            style={{ filter: 'blur(80px)' }}
          />
        </div>
        <div className="text-center relative z-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 relative">
      {/* Background Gradients */}
      <div className="fixed inset-0 pointer-events-none">
        <div 
          className="absolute top-0 left-0 w-96 h-96 bg-blue-500/20 dark:bg-blue-600/15 rounded-full"
          style={{ filter: 'blur(60px)' }}
        />
        <div 
          className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 dark:bg-indigo-600/15 rounded-full"
          style={{ filter: 'blur(60px)' }}
        />
        <div 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-400/15 dark:bg-blue-500/10 rounded-full"
          style={{ filter: 'blur(80px)' }}
        />
      </div>

      {/* Header */}
      <div className="relative z-10 border-b-2 border-gray-300 dark:border-slate-600 bg-white/50 dark:bg-slate-800/50 backdrop-blur-lg shadow-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/dashboard" className="flex items-center">
              <span className="text-xl font-bold">
                <span className="text-blue-600 dark:text-blue-400">Career</span>
                <span className="text-gray-900 dark:text-white">Prep</span>
                <span className="text-blue-600 dark:text-blue-400"> AI</span>
              </span>
            </Link>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-lg bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10 hover:bg-white/25 dark:hover:bg-white/15 hover:border-white/30 dark:hover:border-white/20 transition-all duration-300 backdrop-blur-sm"
            >
              {isDark ? <Sun className="w-5 h-5 text-gray-700 dark:text-gray-200" /> : <Moon className="w-5 h-5 text-gray-700 dark:text-gray-200" />}
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-2xl px-6 py-12 relative z-10">
        <Card className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-lg border-2 border-gray-300 dark:border-slate-600 shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-blue-500/20 dark:bg-blue-600/20 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm border border-blue-300 dark:border-blue-600">
              <User className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <CardTitle className="text-2xl text-gray-900 dark:text-white">Complete Your Profile</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Help us personalize your interview experience. Only first name and last name are required.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Required Fields */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
                <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Required Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="flex items-center gap-2 text-gray-900 dark:text-white">
                    <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    First Name *
                  </Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    placeholder="Enter your first name"
                    required
                    className="bg-white/50 dark:bg-slate-700/50 border-2 border-gray-300 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 backdrop-blur-sm"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="flex items-center gap-2 text-gray-900 dark:text-white">
                    <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    Last Name *
                  </Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    placeholder="Enter your last name"
                    required
                    className="bg-white/50 dark:bg-slate-700/50 border-2 border-gray-300 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 backdrop-blur-sm"
                  />
                </div>
              </div>
            </div>

            {/* Optional Fields */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
                <Lightbulb className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Optional Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age" className="flex items-center gap-2 text-gray-900 dark:text-white">
                    <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
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
                    className="bg-white/50 dark:bg-slate-700/50 border-2 border-gray-300 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 backdrop-blur-sm"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="experienceLevel" className="flex items-center gap-2 text-gray-900 dark:text-white">
                    <Briefcase className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    Experience Level
                  </Label>
                  <Select value={formData.experienceLevel} onValueChange={(value) => handleInputChange("experienceLevel", value)}>
                    <SelectTrigger className="bg-white/50 dark:bg-slate-700/50 border-2 border-gray-300 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400 text-gray-900 dark:text-white backdrop-blur-sm">
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
                <Label htmlFor="role" className="flex items-center gap-2 text-gray-900 dark:text-white">
                  <Briefcase className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  Current Role
                </Label>
                <Select value={formData.role} onValueChange={(value) => handleInputChange("role", value)}>
                  <SelectTrigger className="bg-white/50 dark:bg-slate-700/50 border-2 border-gray-300 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400 text-gray-900 dark:text-white backdrop-blur-sm">
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
                <Label htmlFor="targetTrack" className="flex items-center gap-2 text-gray-900 dark:text-white">
                  <Target className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  Target Track
                </Label>
                <Select value={formData.targetTrack} onValueChange={(value) => handleInputChange("targetTrack", value)}>
                  <SelectTrigger className="bg-white/50 dark:bg-slate-700/50 border-2 border-gray-300 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400 text-gray-900 dark:text-white backdrop-blur-sm">
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
                <Label htmlFor="personaPref" className="flex items-center gap-2 text-gray-900 dark:text-white">
                  <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  Preferred Interview Type
                </Label>
                <Select value={formData.personaPref} onValueChange={(value) => handleInputChange("personaPref", value)}>
                  <SelectTrigger className="bg-white/50 dark:bg-slate-700/50 border-2 border-gray-300 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400 text-gray-900 dark:text-white backdrop-blur-sm">
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
                <Label htmlFor="goals" className="flex items-center gap-2 text-gray-900 dark:text-white">
                  <Target className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  Career Goals
                </Label>
                <Textarea
                  id="goals"
                  value={formData.goals}
                  onChange={(e) => handleInputChange("goals", e.target.value)}
                  placeholder="Tell us about your career goals and what you want to achieve..."
                  rows={3}
                  className="bg-white/50 dark:bg-slate-700/50 border-2 border-gray-300 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 backdrop-blur-sm resize-none"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6">
              <Button
                onClick={handleSaveProfile}
                disabled={saving || !formData.firstName.trim() || !formData.lastName.trim()}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "Saving..." : "Save Profile"}
              </Button>
              <Button
                onClick={handleSkip}
                variant="outline"
                disabled={saving}
                className="flex-1 px-6 py-3 text-lg font-semibold bg-white/50 dark:bg-slate-700/50 border-2 border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-600/70 hover:border-blue-400 dark:hover:border-blue-500 text-gray-900 dark:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Skip for Now
              </Button>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
              You can always update your profile later from the dashboard.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
