"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Code, MessageCircle } from "lucide-react"
import { useInterviewStore } from "@/lib/store"
import { motion } from "framer-motion"

const personas = [
  {
    id: "hr" as const,
    title: "HR Interview",
    description: "Behavioral questions, culture fit, and soft skills assessment",
    icon: Users,
    color: "bg-blue-500/20 dark:bg-blue-500/10 border-blue-500/30 dark:border-blue-500/20 hover:border-blue-500/50 dark:hover:border-blue-500/40",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  {
    id: "tech" as const,
    title: "Technical Interview",
    description: "Coding challenges, system design, and technical problem solving",
    icon: Code,
    color: "bg-emerald-500/20 dark:bg-emerald-500/10 border-emerald-500/30 dark:border-emerald-500/20 hover:border-emerald-500/50 dark:hover:border-emerald-500/40",
    iconColor: "text-emerald-600 dark:text-emerald-400",
  },
  {
    id: "behavioral" as const,
    title: "Behavioral Interview",
    description: "STAR method, leadership scenarios, and situational questions",
    icon: MessageCircle,
    color: "bg-indigo-500/20 dark:bg-indigo-500/10 border-indigo-500/30 dark:border-indigo-500/20 hover:border-indigo-500/50 dark:hover:border-indigo-500/40",
    iconColor: "text-indigo-600 dark:text-indigo-400",
  },
]

export function PersonaCards() {
  const { selectedPersona, setPersona } = useInterviewStore()

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
      {personas.map((persona, index) => {
        const Icon = persona.icon
        const isSelected = selectedPersona === persona.id

        return (
          <motion.div
            key={persona.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex"
          >
            <Card
              className={`cursor-pointer transition-all duration-300 backdrop-blur-lg border-2 shadow-lg hover:shadow-xl flex-1 ${persona.color} ${
                isSelected ? "ring-2 ring-blue-500 dark:ring-blue-400 border-blue-500 dark:border-blue-400" : ""
              }`}
              onClick={() => setPersona(persona.id)}
            >
              <CardContent className="p-6 h-full flex flex-col">
                <div className="flex items-start space-x-4 flex-1">
                  <div className={`p-3 rounded-lg bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm border border-white/20 dark:border-slate-600/20 ${persona.iconColor}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{persona.title}</h3>
                      {isSelected && (
                        <Badge className="text-xs bg-blue-600 hover:bg-blue-700 text-white">
                          Selected
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{persona.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )
      })}
    </div>
  )
}
