"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { saveProfile } from "./actions"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

const STEPS = [
  { title: "Personal Info", description: "Tell us about yourself" },
  { title: "Experience", description: "Your professional background" },
  { title: "Career Goals", description: "What you're aiming for" },
  { title: "Preferences", description: "Customize your experience" },
]

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  // Form data
  const [formData, setFormData] = useState({
    full_name: "",
    preferred_name: "",
    experience_level: "",
    role: "",
    target_track: "",
    persona_pref: "",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    goals: "",
  })

  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    try {
      const formDataObj = new FormData()
      Object.entries(formData).forEach(([key, value]) => {
        formDataObj.append(key, value)
      })

      await saveProfile(formDataObj)
      toast.success("Profile saved successfully!")
      router.push("/interview/new")
    } catch (error) {
      toast.error("Failed to save profile. Please try again.")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const isStepValid = () => {
    switch (currentStep) {
      case 0:
        return formData.full_name.trim() !== ""
      case 1:
        return formData.experience_level !== "" && formData.role.trim() !== ""
      case 2:
        return formData.target_track !== "" && formData.persona_pref !== ""
      case 3:
        return formData.timezone !== "" && formData.goals.trim() !== ""
      default:
        return false
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        <Card className="backdrop-blur-sm bg-background/80 border border-border/50">
          <CardHeader className="text-center space-y-4">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Complete Your Profile
            </CardTitle>
            <div className="space-y-2">
              <Progress value={((currentStep + 1) / STEPS.length) * 100} className="w-full" />
              <p className="text-sm text-muted-foreground">
                Step {currentStep + 1} of {STEPS.length}: {STEPS[currentStep].title}
              </p>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                {currentStep === 0 && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="full_name">Full Name *</Label>
                      <Input
                        id="full_name"
                        value={formData.full_name}
                        onChange={(e) => updateFormData("full_name", e.target.value)}
                        placeholder="Enter your full name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="preferred_name">Preferred Name</Label>
                      <Input
                        id="preferred_name"
                        value={formData.preferred_name}
                        onChange={(e) => updateFormData("preferred_name", e.target.value)}
                        placeholder="What should we call you?"
                      />
                    </div>
                  </div>
                )}

                {currentStep === 1 && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="experience_level">Experience Level *</Label>
                      <Select
                        value={formData.experience_level}
                        onValueChange={(value) => updateFormData("experience_level", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select your experience level" />
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
                    <div className="space-y-2">
                      <Label htmlFor="role">Current/Target Role *</Label>
                      <Input
                        id="role"
                        value={formData.role}
                        onChange={(e) => updateFormData("role", e.target.value)}
                        placeholder="e.g., Software Engineer, Product Manager"
                        required
                      />
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="target_track">Target Track *</Label>
                      <Select
                        value={formData.target_track}
                        onValueChange={(value) => updateFormData("target_track", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select your target track" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="SDE-1">SDE-1</SelectItem>
                          <SelectItem value="Applied-ML">Applied ML</SelectItem>
                          <SelectItem value="Data">Data</SelectItem>
                          <SelectItem value="Product">Product</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="persona_pref">Interview Focus *</Label>
                      <Select
                        value={formData.persona_pref}
                        onValueChange={(value) => updateFormData("persona_pref", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="What type of interviews to focus on?" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="HR">HR/Behavioral</SelectItem>
                          <SelectItem value="Tech">Technical</SelectItem>
                          <SelectItem value="Behavioral">Behavioral</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="timezone">Timezone</Label>
                      <Input
                        id="timezone"
                        value={formData.timezone}
                        onChange={(e) => updateFormData("timezone", e.target.value)}
                        placeholder="Your timezone"
                        disabled
                      />
                      <p className="text-xs text-muted-foreground">Auto-detected from your browser</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="goals">Career Goals *</Label>
                      <Textarea
                        id="goals"
                        value={formData.goals}
                        onChange={(e) => updateFormData("goals", e.target.value)}
                        placeholder="Tell us about your career goals and what you want to achieve..."
                        rows={4}
                        required
                      />
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 0}
                className="flex items-center gap-2 bg-transparent"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </Button>

              {currentStep < STEPS.length - 1 ? (
                <Button onClick={nextStep} disabled={!isStepValid()} className="flex items-center gap-2">
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={!isStepValid() || isLoading}
                  className="flex items-center gap-2"
                >
                  {isLoading ? "Saving..." : "Complete Setup"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
