"use client"

import type React from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Sun, Moon, ArrowLeft } from "lucide-react"

export default function SignUpPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isDark, setIsDark] = useState(false)
  const router = useRouter()

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

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/dashboard`,
        },
      })
      if (error) throw error
      router.push("/auth/sign-up-success")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 relative overflow-hidden">
      {/* Background Gradients - Larger radius blur effects */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Top left gradient blur - Increased radius */}
        <div className={`absolute -top-20 -left-20 w-[600px] h-[600px] rounded-full transition-all duration-500 ${
          isDark 
            ? 'bg-gradient-to-br from-blue-500/30 to-purple-500/30' 
            : 'bg-gradient-to-br from-blue-400/35 to-purple-400/35'
        }`} style={{filter: 'blur(120px)'}}></div>
        
        {/* Top right gradient blur - Increased radius */}
        <div className={`absolute -top-20 -right-20 w-[600px] h-[600px] rounded-full transition-all duration-500 ${
          isDark 
            ? 'bg-gradient-to-bl from-purple-500/30 to-indigo-500/30' 
            : 'bg-gradient-to-bl from-purple-400/35 to-indigo-400/35'
        }`} style={{filter: 'blur(120px)'}}></div>
        
        {/* Center gradient for more depth - Increased radius */}
        <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full transition-all duration-500 ${
          isDark 
            ? 'bg-gradient-to-r from-indigo-500/25 to-blue-500/25' 
            : 'bg-gradient-to-r from-indigo-400/30 to-blue-400/30'
        }`} style={{filter: 'blur(100px)'}}></div>
        
        {/* Additional bottom left gradient - Increased radius */}
        <div className={`absolute bottom-0 left-0 w-[450px] h-[450px] rounded-full transition-all duration-500 ${
          isDark 
            ? 'bg-gradient-to-tr from-blue-600/20 to-cyan-500/20' 
            : 'bg-gradient-to-tr from-blue-400/25 to-cyan-400/25'
        }`} style={{filter: 'blur(80px)'}}></div>
        
        {/* Additional bottom right gradient - Increased radius */}
        <div className={`absolute bottom-0 right-0 w-[450px] h-[450px] rounded-full transition-all duration-500 ${
          isDark 
            ? 'bg-gradient-to-tl from-purple-600/20 to-pink-500/20' 
            : 'bg-gradient-to-tl from-purple-400/25 to-pink-400/25'
        }`} style={{filter: 'blur(80px)'}}></div>
      </div>
      
      {/* Glassmorphic Navbar */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-xl bg-white/15 dark:bg-black/15 border-b border-white/30 dark:border-white/20">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-white/10 to-purple-500/5 dark:from-blue-400/5 dark:via-white/10 dark:to-purple-400/5"></div>
        <div className="absolute inset-0 border border-transparent bg-gradient-to-r from-blue-200/20 via-transparent to-purple-200/20 dark:from-blue-400/10 dark:via-transparent dark:to-purple-400/10 rounded-none" style={{backgroundClip: 'padding-box'}}></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/landing" className="flex items-center">
              <span className="text-xl font-bold">
                <span className="text-blue-600 dark:text-blue-400">Career</span>
                <span className="text-gray-900 dark:text-white">Prep</span>
                <span className="text-blue-600 dark:text-blue-400"> AI</span>
              </span>
            </Link>

            {/* Right side controls */}
            <div className="flex items-center space-x-4">
              {/* Back to Home */}
              <Link href="/landing" className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10 text-gray-700 dark:text-gray-200 hover:bg-white/25 dark:hover:bg-white/15 hover:text-blue-600 dark:hover:text-blue-400 hover:border-white/30 dark:hover:border-white/20 transition-all duration-300 backdrop-blur-sm font-medium">
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
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
      </nav>

      {/* Main Content */}
      <div className="min-h-screen flex flex-col items-center justify-center p-6 pt-24 relative z-10">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-blue-600 dark:text-blue-400">Join </span>
            <span className="text-gray-900 dark:text-white">CareerPrep</span>
            <span className="text-blue-600 dark:text-blue-400"> AI</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Create your account and start your journey to mastering interview skills with AI-powered practice sessions.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-full max-w-md"
        >
          {/* Glassmorphic Sign Up Card */}
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-2 border-white/30 dark:border-slate-600/50 shadow-2xl">
            
            <CardContent className="space-y-6 pt-8">
              <form onSubmit={handleSignUp} className="space-y-5">
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="space-y-2"
                >
                  <Label htmlFor="email" className="text-gray-700 dark:text-gray-300 font-medium">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-white/50 dark:bg-slate-700/50 border-gray-300 dark:border-slate-600 backdrop-blur-sm focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-300 h-12"
                  />
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="space-y-2"
                >
                  <Label htmlFor="password" className="text-gray-700 dark:text-gray-300 font-medium">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Create a password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-white/50 dark:bg-slate-700/50 border-gray-300 dark:border-slate-600 backdrop-blur-sm focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-300 h-12"
                  />
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  className="space-y-2"
                >
                  <Label htmlFor="confirm-password" className="text-gray-700 dark:text-gray-300 font-medium">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="Confirm your password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="bg-white/50 dark:bg-slate-700/50 border-gray-300 dark:border-slate-600 backdrop-blur-sm focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-300 h-12"
                  />
                </motion.div>
                
                {error && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
                  >
                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                  </motion.div>
                )}
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                >
                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 text-base" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                        <span>Creating account...</span>
                      </div>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </motion.div>
              </form>
              
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.7 }}
                className="text-center"
              >
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300 dark:border-slate-600"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white/80 dark:bg-slate-800/80 text-gray-500 dark:text-gray-400">
                      Already have an account?
                    </span>
                  </div>
                </div>
                
                <div className="mt-4">
                  <Link href="/auth/login">
                    <Button 
                      variant="outline" 
                      className="w-full h-12 bg-white/50 dark:bg-slate-700/50 border-gray-300 dark:border-slate-600 hover:bg-white/70 dark:hover:bg-slate-600/70 text-gray-700 dark:text-gray-200 font-semibold backdrop-blur-sm transition-all duration-300 text-base"
                    >
                      Sign In
                    </Button>
                  </Link>
                </div>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
