"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const router = useRouter()
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    // Check theme
    const theme = localStorage.getItem('theme')
    setIsDark(theme === 'dark')
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    }
    
    // Redirect to the new landing page
    router.push('/landing')
  }, [router])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Top left gradient */}
        <div className={`absolute -top-40 -left-40 w-[300px] h-[300px] rounded-full transition-all duration-500 ${
          isDark 
            ? 'bg-gradient-to-r from-blue-600/20 to-indigo-600/20' 
            : 'bg-gradient-to-r from-blue-400/25 to-indigo-400/25'
        }`} style={{filter: 'blur(60px)'}}></div>
        
        {/* Top right gradient */}
        <div className={`absolute -top-40 -right-40 w-[300px] h-[300px] rounded-full transition-all duration-500 ${
          isDark 
            ? 'bg-gradient-to-r from-purple-600/20 to-pink-600/20' 
            : 'bg-gradient-to-r from-purple-400/25 to-pink-400/25'
        }`} style={{filter: 'blur(60px)'}}></div>
        
        {/* Center gradient */}
        <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full transition-all duration-500 ${
          isDark 
            ? 'bg-gradient-to-r from-indigo-500/15 to-blue-500/15' 
            : 'bg-gradient-to-r from-indigo-400/20 to-blue-400/20'
        }`} style={{filter: 'blur(80px)'}}></div>
      </div>
      
      {/* Content */}
      <div className="min-h-screen flex items-center justify-center relative z-10">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Redirecting to CareerPrep AI...</p>
        </div>
      </div>
    </div>
  )
}
