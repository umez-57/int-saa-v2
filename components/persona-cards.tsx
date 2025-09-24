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
    color: "bg-blue-500/10 border-blue-500/20 hover:border-blue-500/40",
    iconColor: "text-blue-500",
  },
  {
    id: "tech" as const,
    title: "Technical Interview",
    description: "Coding challenges, system design, and technical problem solving",
    icon: Code,
    color: "bg-green-500/10 border-green-500/20 hover:border-green-500/40",
    iconColor: "text-green-500",
  },
  {
    id: "behavioral" as const,
    title: "Behavioral Interview",
    description: "STAR method, leadership scenarios, and situational questions",
    icon: MessageCircle,
    color: "bg-purple-500/10 border-purple-500/20 hover:border-purple-500/40",
    iconColor: "text-purple-500",
  },
]

export function PersonaCards() {
  const { selectedPersona, setPersona } = useInterviewStore()

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {personas.map((persona, index) => {
        const Icon = persona.icon
        const isSelected = selectedPersona === persona.id

        return (
          <motion.div
            key={persona.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card
              className={`cursor-pointer transition-all duration-200 ${persona.color} ${
                isSelected ? "ring-2 ring-primary" : ""
              }`}
              onClick={() => setPersona(persona.id)}
            >
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className={`p-3 rounded-lg bg-background/50 ${persona.iconColor}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-lg">{persona.title}</h3>
                      {isSelected && (
                        <Badge variant="default" className="text-xs">
                          Selected
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{persona.description}</p>
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
