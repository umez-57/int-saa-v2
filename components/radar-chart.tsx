"use client"

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts"

interface RadarChartProps {
  data: Array<{
    dimension: string
    score: number
  }>
  color?: string
}

export function InterviewRadarChart({ data, color = "#7C3AED" }: RadarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <RadarChart data={data}>
        <PolarGrid />
        <PolarAngleAxis dataKey="dimension" className="text-xs" />
        <PolarRadiusAxis domain={[0, 100]} tick={false} />
        <Radar name="Score" dataKey="score" stroke={color} fill={color} fillOpacity={0.1} strokeWidth={2} />
      </RadarChart>
    </ResponsiveContainer>
  )
}
