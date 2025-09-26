"use client"

import React, { useState, useEffect } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { 
  Brain, 
  Code, 
  Target, 
  Play, 
  ArrowRight, 
  BarChart3, 
  Users, 
  FileText, 
  MessageSquare,
  Mic,
  TrendingUp,
  Star,
  Sun,
  Moon,
  Menu,
  X,
  CheckCircle,
  Zap,
  Shield,
  Award
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { User } from "@supabase/supabase-js"

export default function LandingPage() {
  const [isDark, setIsDark] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const router = useRouter()
  const supabase = createClient()
  const { scrollYProgress } = useScroll()
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.8])

  useEffect(() => {
    const theme = localStorage.getItem('theme')
    setIsDark(theme === 'dark')
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    }
  }, [])

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)
      } catch (error) {
        console.error('Error checking auth:', error)
      } finally {
        setIsCheckingAuth(false)
      }
    }
    checkAuth()
  }, [supabase])

  const handleStartInterview = () => {
    if (user) {
      // User is logged in, redirect to dashboard
      router.push('/dashboard')
    } else {
      // User is not logged in, redirect to login page
      router.push('/auth/login')
    }
  }

  const toggleTheme = () => {
    setIsDark(!isDark)
    if (!isDark) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }

  return (
    <div className={`min-h-screen transition-all duration-500 relative overflow-hidden ${
      isDark 
        ? 'bg-slate-950' 
        : 'bg-gray-50'
    }`}>
      
      {/* Subtle gradient blurs for visual appeal */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Top left gradient blur */}
        <div className={`absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full transition-all duration-500 ${
          isDark 
            ? 'bg-gradient-to-br from-blue-500/20 to-purple-500/20' 
            : 'bg-gradient-to-br from-blue-400/25 to-purple-400/25'
        }`} style={{filter: 'blur(100px)'}}></div>
        
        {/* Top right gradient blur */}
        <div className={`absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full transition-all duration-500 ${
          isDark 
            ? 'bg-gradient-to-bl from-purple-500/20 to-indigo-500/20' 
            : 'bg-gradient-to-bl from-purple-400/25 to-indigo-400/25'
        }`} style={{filter: 'blur(100px)'}}></div>
        
        {/* Additional center gradient for more depth */}
        <div className={`absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full transition-all duration-500 ${
          isDark 
            ? 'bg-gradient-to-r from-indigo-500/15 to-blue-500/15' 
            : 'bg-gradient-to-r from-indigo-400/20 to-blue-400/20'
        }`} style={{filter: 'blur(80px)'}}></div>
      </div>
      
      {/* Glassmorphic Navbar - Fixed */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-xl bg-white/15 dark:bg-black/15 border-b border-white/30 dark:border-white/20">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-white/10 to-purple-500/5 dark:from-blue-400/5 dark:via-white/10 dark:to-purple-400/5"></div>
        <div className="absolute inset-0 border border-transparent bg-gradient-to-r from-blue-200/20 via-transparent to-purple-200/20 dark:from-blue-400/10 dark:via-transparent dark:to-purple-400/10 rounded-none" style={{backgroundClip: 'padding-box'}}></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex justify-between items-center h-16">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center"
            >
              <span className="text-xl font-bold">
                <span className="text-blue-600 dark:text-blue-400">Career</span>
                <span className="text-gray-900 dark:text-white">Prep</span>
                <span className="text-blue-600 dark:text-blue-400"> AI</span>
              </span>
            </motion.div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-6">
              <Link href="#features" className="px-5 py-2.5 rounded-lg bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10 text-gray-700 dark:text-gray-200 hover:bg-white/25 dark:hover:bg-white/15 hover:text-blue-600 dark:hover:text-blue-400 hover:border-white/30 dark:hover:border-white/20 transition-all duration-300 backdrop-blur-sm font-medium">
                Features
              </Link>
              <Link href="#demo" className="px-5 py-2.5 rounded-lg bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10 text-gray-700 dark:text-gray-200 hover:bg-white/25 dark:hover:bg-white/15 hover:text-blue-600 dark:hover:text-blue-400 hover:border-white/30 dark:hover:border-white/20 transition-all duration-300 backdrop-blur-sm font-medium">
                Demo
              </Link>
              <Link href="#pricing" className="px-5 py-2.5 rounded-lg bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10 text-gray-700 dark:text-gray-200 hover:bg-white/25 dark:hover:bg-white/15 hover:text-blue-600 dark:hover:text-blue-400 hover:border-white/30 dark:hover:border-white/20 transition-all duration-300 backdrop-blur-sm font-medium">
                Pricing
              </Link>
              
              {/* Glassmorphic Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2.5 rounded-lg bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10 hover:bg-white/25 dark:hover:bg-white/15 hover:border-white/30 dark:hover:border-white/20 transition-all duration-300 backdrop-blur-sm"
              >
                {isDark ? <Sun className="w-5 h-5 text-gray-700 dark:text-gray-200" /> : <Moon className="w-5 h-5 text-gray-700 dark:text-gray-200" />}
              </button>
              
              {/* Glassmorphic Login Button */}
              <Link href="/auth/login">
                <button className="px-6 py-2.5 rounded-lg bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10 text-gray-700 dark:text-gray-200 hover:bg-white/25 dark:hover:bg-white/15 hover:text-gray-900 dark:hover:text-white hover:border-white/30 dark:hover:border-white/20 transition-all duration-300 backdrop-blur-sm font-medium">
                  Login
                </button>
              </Link>
              
              {/* Solid Get Started Button */}
              <Link href="/auth/sign-up">
                <button className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 border border-blue-500 hover:border-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 font-medium">
                  Get Started
                </button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2.5 rounded-lg bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10 hover:bg-white/25 dark:hover:bg-white/15 hover:border-white/30 dark:hover:border-white/20 transition-all duration-300 backdrop-blur-sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-5 h-5 text-gray-700 dark:text-gray-200" /> : <Menu className="w-5 h-5 text-gray-700 dark:text-gray-200" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden backdrop-blur-xl bg-white/10 dark:bg-black/10 border-t border-white/20 dark:border-white/10"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-white/5 dark:from-white/5 dark:to-white/5"></div>
            <div className="px-4 py-6 space-y-4 relative">
              <Link href="#features" className="block px-4 py-3 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-white/20 dark:hover:bg-white/10 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300">
                Features
              </Link>
              <Link href="#demo" className="block px-4 py-3 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-white/20 dark:hover:bg-white/10 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300">
                Demo
              </Link>
              <Link href="#pricing" className="block px-4 py-3 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-white/20 dark:hover:bg-white/10 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300">
                Pricing
              </Link>
              <div className="flex space-x-3 pt-4">
                <Link href="/auth/login" className="flex-1">
                  <button className="w-full px-4 py-3 rounded-xl bg-white/20 dark:bg-white/10 hover:bg-white/30 dark:hover:bg-white/20 text-gray-700 dark:text-gray-200 transition-all duration-300 backdrop-blur-sm border border-white/20 dark:border-white/10">
                    Login
                  </button>
                </Link>
                <Link href="/auth/sign-up" className="flex-1">
                  <button className="w-full px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-lg transition-all duration-300">
                    Get Started
                  </button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            style={{ opacity, scale }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Badge className="mb-6 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700">
                <Zap className="w-4 h-4 mr-2" />
                AI-Powered Career Preparation
              </Badge>
              
               <h1 className="text-5xl md:text-7xl font-bold mb-6 text-gray-900 dark:text-white leading-tight">
                 Master Your <span className="text-blue-600 dark:text-blue-400">Interviews</span>
               </h1>
               
               <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-200 mb-4 font-light">
                 Your AI Interview Practice Companion
               </p>
               
               <p className="text-lg text-gray-600 dark:text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed">
                 Perfect your interview skills with AI-driven practice sessions. Build confidence, 
                 improve your responses, and prepare thoroughly for any interview opportunity.
               </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleStartInterview}
                  disabled={isCheckingAuth}
                  className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg transition-all duration-300 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Play className="w-5 h-5" />
                  <span>{isCheckingAuth ? 'Loading...' : 'Start Your Free Interview'}</span>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 font-semibold rounded-xl border border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700 transition-all duration-300 flex items-center space-x-2"
                >
                  <MessageSquare className="w-5 h-5" />
                  <span>Watch Demo</span>
                </motion.button>
              </div>
            </motion.div>
          </motion.div>

          {/* Hero Illustration */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="relative"
          >
            <Card className="relative bg-white dark:bg-slate-800 border-2 border-gray-300 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-300 p-8 rounded-2xl shadow-lg">
              <div className="grid md:grid-cols-3 gap-8 items-center">
                 <div className="text-center">
                   <div className="w-20 h-20 bg-blue-600 dark:bg-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                     <Users className="w-10 h-10 text-white" />
                   </div>
                   <h3 className="font-semibold text-gray-800 dark:text-gray-200">Student</h3>
                   <p className="text-sm text-gray-600 dark:text-gray-400">Practice & Improve</p>
                 </div>
                 
                 <div className="text-center">
                   <div className="w-24 h-24 bg-purple-600 dark:bg-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                     <Brain className="w-12 h-12 text-white" />
                   </div>
                   <h3 className="font-semibold text-gray-800 dark:text-gray-200">AI Assistant</h3>
                   <p className="text-sm text-gray-600 dark:text-gray-400">Personalized Guidance</p>
                 </div>
                 
                 <div className="text-center">
                   <div className="w-20 h-20 bg-green-600 dark:bg-green-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                     <Award className="w-10 h-10 text-white" />
                   </div>
                   <h3 className="font-semibold text-gray-800 dark:text-gray-200">Recruiter</h3>
                   <p className="text-sm text-gray-600 dark:text-gray-400">Find Top Talent</p>
                 </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Features Overview */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white">
              Three Powerful Interview Modes
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Choose your interview type and get personalized, AI-driven practice sessions
            </p>
          </motion.div>

           <div className="grid md:grid-cols-3 gap-8 items-stretch">
            {/* Mock Interview */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -10, boxShadow: "0 25px 50px rgba(249, 115, 22, 0.15)" }}
            >
               <Card className="h-full bg-white dark:bg-slate-800 border-2 border-gray-300 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-300 p-8 rounded-2xl hover:shadow-lg transition-all duration-300">
                 <div className="w-16 h-16 bg-blue-600 dark:bg-blue-500 rounded-xl mb-6 flex items-center justify-center">
                   <MessageSquare className="w-8 h-8 text-white" />
                 </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">Mock Interview</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Realistic interview practice with personalized questions based on your resume and job description.
                </p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Technical Questions
                  </li>
                  <li className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    HR & Behavioral
                  </li>
                  <li className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Resume-based Questions
                  </li>
                </ul>
                 <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                   Start Mock Interview
                 </Button>
              </Card>
            </motion.div>

            {/* System Design */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              whileHover={{ y: -10, boxShadow: "0 25px 50px rgba(168, 85, 247, 0.15)" }}
            >
               <Card className="h-full bg-white dark:bg-slate-800 border-2 border-gray-300 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-300 p-8 rounded-2xl hover:shadow-lg transition-all duration-300">
                 <div className="w-16 h-16 bg-purple-600 dark:bg-purple-500 rounded-xl mb-6 flex items-center justify-center">
                   <Code className="w-8 h-8 text-white" />
                 </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">System Design</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Master system design interviews with adaptive follow-up questions and lifelike personas.
                </p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Difficulty Selection
                  </li>
                  <li className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Duration Control
                  </li>
                  <li className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Adaptive Follow-ups
                  </li>
                </ul>
                 <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                   Start System Design
                 </Button>
              </Card>
            </motion.div>

            {/* Core Concept */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: true }}
              whileHover={{ y: -10, boxShadow: "0 25px 50px rgba(34, 197, 94, 0.15)" }}
            >
               <Card className="h-full bg-white dark:bg-slate-800 border-2 border-gray-300 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-300 p-8 rounded-2xl hover:shadow-lg transition-all duration-300">
                 <div className="w-16 h-16 bg-green-600 dark:bg-green-500 rounded-xl mb-6 flex items-center justify-center">
                   <Target className="w-8 h-8 text-white" />
                 </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">Core Concept</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Deep dive into fundamental concepts with realistic Q&A flow and detailed feedback.
                </p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Concept Deep Dives
                  </li>
                  <li className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Realistic Q&A Flow
                  </li>
                  <li className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Detailed Feedback
                  </li>
                </ul>
                 <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                   Start Core Concept
                 </Button>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

       {/* Interactive Demo Strip */}
       <section id="demo" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-slate-900 relative z-10">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white">
              See It In Action
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Experience the power of AI-driven interview practice with real-time feedback
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Card className="bg-white dark:bg-slate-800 border-2 border-gray-300 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-300 p-8 rounded-2xl shadow-lg">
              <div className="grid lg:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">
                    Real-time Interview Experience
                  </h3>
                  <div className="space-y-4">
                     <div className="flex items-center space-x-3">
                       <div className="w-8 h-8 bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center">
                         <Mic className="w-4 h-4 text-white" />
                       </div>
                       <span className="text-gray-700 dark:text-gray-300">Live transcript during interview</span>
                     </div>
                     <div className="flex items-center space-x-3">
                       <div className="w-8 h-8 bg-purple-600 dark:bg-purple-500 rounded-full flex items-center justify-center">
                         <MessageSquare className="w-4 h-4 text-white" />
                       </div>
                       <span className="text-gray-700 dark:text-gray-300">Say "Summarize the question" anytime</span>
                     </div>
                     <div className="flex items-center space-x-3">
                       <div className="w-8 h-8 bg-green-600 dark:bg-green-500 rounded-full flex items-center justify-center">
                         <ArrowRight className="w-4 h-4 text-white" />
                       </div>
                       <span className="text-gray-700 dark:text-gray-300">Next/Repeat question controls</span>
                     </div>
                     <div className="flex items-center space-x-3">
                       <div className="w-8 h-8 bg-indigo-600 dark:bg-indigo-500 rounded-full flex items-center justify-center">
                         <FileText className="w-4 h-4 text-white" />
                       </div>
                       <span className="text-gray-700 dark:text-gray-300">Resume/job description integration</span>
                     </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 text-green-400 font-mono text-sm">
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-gray-400 ml-2">CareerPrep AI Interview</span>
                  </div>
                  <div className="space-y-2">
                    <div><span className="text-blue-400">AI:</span> Tell me about a challenging project you worked on.</div>
                    <div><span className="text-orange-400">You:</span> <span className="animate-pulse">|</span></div>
                    <div className="text-gray-500 text-xs">● Live transcript active</div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

       {/* Feedback & Analytics */}
       <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-slate-900 relative z-10">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white">
              AI-Powered Feedback & Analytics
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Get detailed insights and track your progress with comprehensive analytics
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <Card className="bg-white dark:bg-slate-800 border-2 border-gray-300 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-300 p-8 rounded-2xl shadow-lg">
                <h3 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-200">Per-Question Feedback</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-lg border-l-4 border-green-500">
                    <h4 className="font-semibold text-green-800 dark:text-green-300">Strengths</h4>
                    <p className="text-sm text-green-700 dark:text-green-400">Clear communication and structured approach</p>
                  </div>
                  <div className="p-4 bg-orange-100 dark:bg-orange-900/30 rounded-lg border-l-4 border-orange-500">
                    <h4 className="font-semibold text-orange-800 dark:text-orange-300">Areas to Improve</h4>
                    <p className="text-sm text-orange-700 dark:text-orange-400">Consider mentioning specific metrics</p>
                  </div>
                  <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-lg border-l-4 border-blue-500">
                    <h4 className="font-semibold text-blue-800 dark:text-blue-300">Sample Answer</h4>
                    <p className="text-sm text-blue-700 dark:text-blue-400">AI-generated example included for reference</p>
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <Card className="bg-white dark:bg-slate-800 border-2 border-gray-300 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-300 p-8 rounded-2xl shadow-lg">
                <h3 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-200">Progress Analytics</h3>
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Interview Score</span>
                      <span className="text-sm font-bold text-orange-600 dark:text-orange-400">85%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div className="bg-gradient-to-r from-orange-500 to-purple-600 h-2 rounded-full" style={{width: '85%'}}></div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-white/20 dark:bg-black/20 rounded-lg">
                      <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">12</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Sessions</div>
                    </div>
                    <div className="text-center p-3 bg-white/20 dark:bg-black/20 rounded-lg">
                      <BarChart3 className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">78%</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Avg Score</div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

       {/* For Students & Recruiters */}
       <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-slate-900 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16">
            {/* Students */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <Card className="bg-white dark:bg-slate-800 border-2 border-gray-300 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-300 p-8 rounded-2xl shadow-lg h-full">
                <div className="text-center lg:text-left">
                   <div className="w-16 h-16 bg-blue-600 dark:bg-blue-500 rounded-xl mb-6 flex items-center justify-center mx-auto lg:mx-0">
                     <Users className="w-8 h-8 text-white" />
                   </div>
                  <h3 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-200">For Students</h3>
                  <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                    Accelerate your career with AI-powered preparation tools
                  </p>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-6 h-6 text-green-500 mt-1" />
                      <div>
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200">Resume Parsing</h4>
                        <p className="text-gray-600 dark:text-gray-400">AI analyzes your resume for personalized questions</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-6 h-6 text-green-500 mt-1" />
                      <div>
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200">Job Matching</h4>
                        <p className="text-gray-600 dark:text-gray-400">Get alerts for positions that match your skills</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-6 h-6 text-green-500 mt-1" />
                      <div>
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200">Lifelike Practice</h4>
                        <p className="text-gray-600 dark:text-gray-400">Practice with realistic AI personas</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Recruiters */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <Card className="bg-white dark:bg-slate-800 border-2 border-gray-300 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-300 p-8 rounded-2xl shadow-lg h-full">
                <div className="text-center lg:text-left">
                   <div className="w-16 h-16 bg-green-600 dark:bg-green-500 rounded-xl mb-6 flex items-center justify-center mx-auto lg:mx-0">
                     <Award className="w-8 h-8 text-white" />
                   </div>
                  <h3 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-200">For Recruiters</h3>
                  <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                    Find top talent with comprehensive candidate insights
                  </p>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-6 h-6 text-green-500 mt-1" />
                      <div>
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200">Ranked Applicants</h4>
                        <p className="text-gray-600 dark:text-gray-400">AI-powered candidate ranking system</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-6 h-6 text-green-500 mt-1" />
                      <div>
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200">Holistic Profiles</h4>
                        <p className="text-gray-600 dark:text-gray-400">Resume + interview performance data</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-6 h-6 text-green-500 mt-1" />
                      <div>
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200">Time Savings</h4>
                        <p className="text-gray-600 dark:text-gray-400">Cut resume screening time in half</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

       {/* Testimonials */}
       <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-slate-900 relative z-10">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
             <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white">
               Success Stories
             </h2>
             <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
               See how CareerPrep AI has helped users improve their interview skills
             </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              viewport={{ once: true }}
            >
               <Card className="bg-white dark:bg-slate-800 border-2 border-gray-300 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-300 p-8 rounded-2xl shadow-lg">
                 <div className="flex items-center space-x-4 mb-6">
                   <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                     <img 
                       src="https://images.unsplash.com/photo-1494790108755-2616b9c7e6c4?w=48&h=48&fit=crop&crop=face&auto=format&q=80" 
                       alt="Sarah Chen" 
                       className="w-full h-full object-cover"
                       onError={(e) => {
                         const target = e.target as HTMLImageElement;
                         target.style.display = 'none';
                         const parent = target.parentElement;
                         if (parent) {
                           parent.innerHTML = '<span class="text-white font-bold text-lg">S</span>';
                         }
                       }}
                     />
                   </div>
                   <div>
                     <h4 className="font-bold text-gray-800 dark:text-gray-200">Sarah Chen</h4>
                     <p className="text-sm text-gray-600 dark:text-gray-400">Computer Science Student</p>
                   </div>
                 </div>
                 <div className="flex mb-4">
                   {[...Array(5)].map((_, i) => (
                     <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                   ))}
                 </div>
                 <p className="text-gray-700 dark:text-gray-300 italic">
                   "CareerPrep AI significantly improved my interview practice sessions. The personalized feedback helped me identify areas for improvement and build confidence through realistic practice."
                 </p>
               </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
               <Card className="bg-white dark:bg-slate-800 border-2 border-gray-300 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-300 p-8 rounded-2xl shadow-lg">
                 <div className="flex items-center space-x-4 mb-6">
                   <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                     <img 
                       src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=48&h=48&fit=crop&crop=face&auto=format&q=80" 
                       alt="Alex Rodriguez" 
                       className="w-full h-full object-cover"
                       onError={(e) => {
                         const target = e.target as HTMLImageElement;
                         target.style.display = 'none';
                         const parent = target.parentElement;
                         if (parent) {
                           parent.innerHTML = '<span class="text-white font-bold text-lg">A</span>';
                         }
                       }}
                     />
                   </div>
                   <div>
                     <h4 className="font-bold text-gray-800 dark:text-gray-200">Alex Rodriguez</h4>
                     <p className="text-sm text-gray-600 dark:text-gray-400">Marketing Professional</p>
                   </div>
                 </div>
                 <div className="flex mb-4">
                   {[...Array(5)].map((_, i) => (
                     <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                   ))}
                 </div>
                 <p className="text-gray-700 dark:text-gray-300 italic">
                   "The practice sessions helped me structure my thoughts better and improved my storytelling during behavioral interviews. I felt much more prepared and confident."
                 </p>
               </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-blue-50 dark:bg-slate-800 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
             <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white">
               Ready to master your interview skills?
             </h2>
             <p className="text-xl text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
               Join thousands of users who've improved their confidence and interview performance through practice
             </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/interview/new">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-12 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg transition-all duration-300 text-lg"
                >
                  Start Free Interview
                </motion.button>
              </Link>
              
              <Link href="/auth/sign-up">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-12 py-4 bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-200 font-bold rounded-xl border border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-600 transition-all duration-300 text-lg"
                >
                  Sign Up Now
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-slate-950 border-t border-gray-200 dark:border-slate-800 relative z-10">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm text-gray-500 dark:text-gray-500">
            © 2024 CareerPrep AI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
