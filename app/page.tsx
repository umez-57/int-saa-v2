"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Navbar } from "@/components/navbar"
import { ArrowRight, Code, Brain, Target, Zap } from "lucide-react"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

const buttonVariants = {
  hover: {
    scale: 1.05,
    transition: { duration: 0.2 },
  },
  tap: { scale: 0.95 },
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 radial-glow-light dark:radial-glow-dark" />
        <div className="container mx-auto max-w-7xl px-6 md:px-8 py-24 md:py-32">
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="text-center space-y-8">
            <motion.div variants={itemVariants} className="space-y-4">
              <Badge variant="secondary" className="mb-4">
                <Zap className="w-3 h-3 mr-1" />
                AI-Powered Interview Prep
              </Badge>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-balance">
                Ace Your Interviews with an
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"> AI Interviewer</span>
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto text-pretty">
                Practice with a lifelike AI interviewer that asks tailored questions from your job description,
                gives instant feedback, and helps you improve fast.
              </p>
            </motion.div>

            <motion.div variants={itemVariants} className="flex justify-center mb-2">
              <div className="text-sm text-muted-foreground">Trusted by candidates preparing for FAANG, startups, and everything in between</div>
            </motion.div>

            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                <Button 
                  size="lg" 
                  className="text-lg px-8 py-6" 
                  aria-label="Start practicing interviews"
                  onClick={() => window.location.href = '/auth/sign-up'}
                >
                  Start Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>
              <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                <Button
                  variant="outline"
                  size="lg"
                  className="text-lg px-8 py-6 bg-transparent"
                  aria-label="Start interview"
                  onClick={() => window.location.href = '/interview/new'}
                >
                  Start Interview
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 md:py-32">
        <div className="container mx-auto max-w-7xl px-6 md:px-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center space-y-12"
          >
            <motion.div variants={itemVariants} className="space-y-4">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight">How It Works</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">3 steps to confident interviews</p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              <motion.div variants={itemVariants}>
                <Card className="p-8 h-full hover:shadow-lg transition-shadow">
                  <div className="space-y-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Code className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-2xl font-semibold">Paste Job Description</h3>
                    <p className="text-muted-foreground">We tailor questions to the exact role you’re targeting.</p>
                  </div>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Card className="p-8 h-full hover:shadow-lg transition-shadow">
                  <div className="space-y-4">
                    <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                      <Brain className="w-6 h-6 text-secondary" />
                    </div>
                    <h3 className="text-2xl font-semibold">Mock Interview</h3>
                    <p className="text-muted-foreground">A lifelike AI interviewer asks you questions, you answer by voice.</p>
                  </div>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Card className="p-8 h-full hover:shadow-lg transition-shadow">
                  <div className="space-y-4">
                    <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
                      <Target className="w-6 h-6 text-success" />
                    </div>
                    <h3 className="text-2xl font-semibold">Instant Feedback</h3>
                    <p className="text-muted-foreground">Get objective scoring, strengths, improvements, and next steps.</p>
                  </div>
                </Card>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto max-w-7xl px-6 md:px-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-6"
          >
            <motion.div variants={itemVariants} className="p-6 rounded-xl border bg-card">
              <div className="text-lg font-semibold mb-2">Tailored to the JD</div>
              <p className="text-muted-foreground">Questions align with the exact responsibilities and stack in your posting.</p>
            </motion.div>
            <motion.div variants={itemVariants} className="p-6 rounded-xl border bg-card">
              <div className="text-lg font-semibold mb-2">Voice-first Experience</div>
              <p className="text-muted-foreground">Speak naturally. We transcribe and evaluate automatically.</p>
            </motion.div>
            <motion.div variants={itemVariants} className="p-6 rounded-xl border bg-card">
              <div className="text-lg font-semibold mb-2">Actionable Feedback</div>
              <p className="text-muted-foreground">See scores, strengths, and concrete improvement suggestions.</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 md:py-32 bg-muted/50">
        <div className="container mx-auto max-w-7xl px-6 md:px-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center space-y-8"
          >
            <motion.div variants={itemVariants} className="space-y-4">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Ready to Ace Your Next Interview?</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Join thousands of developers who have successfully landed their dream jobs
              </p>
            </motion.div>

            <motion.div variants={itemVariants}>
              <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                <Button 
                  size="lg" 
                  className="text-lg px-8 py-6"
                  onClick={() => window.location.href = '/auth/sign-up'}
                >
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
