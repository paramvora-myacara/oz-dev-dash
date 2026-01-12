'use client'

import { LucideIcon } from 'lucide-react'

interface CollapsedStripProps {
  icon: LucideIcon
  label: string
  onExpand: () => void
}

export default function CollapsedStrip({ icon: Icon, label, onExpand }: CollapsedStripProps) {
  return (
    <div 
      className="h-full w-full bg-gray-50 border-r border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors group cursor-pointer px-1" 
      onClick={onExpand}
      title={label}
    >
      <div className="p-1.5 rounded bg-white border border-gray-200 group-hover:border-blue-300 group-hover:bg-blue-50 transition-colors flex items-center justify-center">
        <Icon className="w-4 h-4 text-gray-600 group-hover:text-blue-600" />
      </div>
    </div>
  )
}
