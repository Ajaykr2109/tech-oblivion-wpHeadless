import React from 'react'

export default function Tile({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`p-4 bg-white dark:bg-gray-900 rounded-xl shadow transition-all duration-300 ease-in-out hover:shadow-lg hover:scale-[1.01] ${className}`}>
      {children}
    </div>
  )
}
