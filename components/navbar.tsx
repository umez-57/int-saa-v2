"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ThemeToggle } from "@/components/theme-toggle"
import { AuthButton } from "@/components/auth-button"

export function Navbar() {
  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
      <div className="container mx-auto max-w-7xl px-6 md:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
              >
                CareerPrep Interview
              </motion.div>
            </Link>
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/" className="text-sm font-medium transition-colors hover:text-primary">
                Landing
              </Link>
              <Link href="/history" className="text-sm font-medium transition-colors hover:text-primary">
                History
              </Link>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <AuthButton />
          </div>
        </div>
      </div>
    </motion.nav>
  )
}
