"use client"

export default function Card({ text }) {
  return (
    <div className="h-76 flex items-center justify-center font-bold rounded bg-gradient-to-br from-green-400 to-green-200 text-white p-4 shadow-md">
      {text}
    </div>
  )
}
