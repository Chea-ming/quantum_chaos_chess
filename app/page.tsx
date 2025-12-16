"use client"

import { useState } from "react"
import QuantumChess from "@/src/app/QuantumChess"
import LandingPage from "@/src/components/LandingPage"

export default function Home() {
  const [gameMode, setGameMode] = useState<'pass-and-play' | 'online' | 'vs-ai' | 'ai-vs-ai' | null>(null)

  if (!gameMode) {
    return <LandingPage onSelectMode={setGameMode} />
  }

  return <QuantumChess />
}