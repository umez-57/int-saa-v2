"use client"

import type React from "react"

import { cn } from "@/lib/utils"

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return <div className={cn("animate-pulse rounded-md bg-muted skeleton", className)} {...props} />
}

export function QuestionSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-20 w-full" />
    </div>
  )
}

export function ChartSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-6 w-1/3" />
      <Skeleton className="h-64 w-full" />
    </div>
  )
}
