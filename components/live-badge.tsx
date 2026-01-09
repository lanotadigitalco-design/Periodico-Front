"use client"

import { Badge } from "@/components/ui/badge"

interface LiveBadgeProps {
  isActive: boolean
}

export function LiveBadge({ isActive }: LiveBadgeProps) {
  if (!isActive) return null

  return (
    <div className="inline-flex items-center">
      <Badge className="bg-red-600 hover:bg-red-700 shadow-lg">
        <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
        EN VIVO
      </Badge>
    </div>
  )
}
