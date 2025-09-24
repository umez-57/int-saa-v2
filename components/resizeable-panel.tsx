// components/resizable-panel.tsx
"use client"

import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"

interface ResizablePanelProps {
  children: React.ReactNode
  className?: string
  minWidth?: number
  maxWidth?: number
  defaultWidth?: number
  onResize?: (width: number) => void
}

export function ResizablePanel({ 
  children, 
  className, 
  minWidth = 200, 
  maxWidth = 600, 
  defaultWidth = 320,
  onResize 
}: ResizablePanelProps) {
  const [width, setWidth] = useState(defaultWidth)
  const [isResizing, setIsResizing] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const startXRef = useRef<number>(0)
  const startWidthRef = useRef<number>(0)

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsResizing(true)
    startXRef.current = e.clientX
    startWidthRef.current = width
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing) return
    
    const deltaX = e.clientX - startXRef.current
    const newWidth = Math.max(minWidth, Math.min(maxWidth, startWidthRef.current + deltaX))
    
    setWidth(newWidth)
    onResize?.(newWidth)
  }

  const handleMouseUp = () => {
    setIsResizing(false)
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
  }

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizing])

  return (
    <div 
      ref={panelRef}
      className={cn("relative flex-shrink-0", className)}
      style={{ width: `${width}px` }}
    >
      {children}
      <div
        className="absolute top-0 right-0 w-1 h-full bg-border hover:bg-primary/50 cursor-col-resize transition-colors"
        onMouseDown={handleMouseDown}
      />
    </div>
  )
}