import React from "react"
import { EntangledPair } from "../chess/types"

interface QuantumThreadsProps {
    entanglements: EntangledPair[]
    boardSize: number // Size of the chess board in pixels (e.g., 560)
}

/**
 * QuantumThreads - Renders glowing quantum entanglement threads between correlated pieces
 * 
 * Creates stunning visual connections showing "spooky action at a distance"
 * - Cyan-pink pulsing gradient
 * - Curved Bézier paths for aesthetic appeal
 * - Animated glow effects
 */
export default function QuantumThreads({ entanglements, boardSize }: QuantumThreadsProps) {
    if (!entanglements || entanglements.length === 0) return null

    const squareSize = boardSize / 8

    // Convert chess notation (e.g., "e4") to pixel coordinates
    const notationToPixels = (notation: string): { x: number; y: number } => {
        const file = notation.charCodeAt(0) - 'a'.charCodeAt(0) // 0-7
        const rank = parseInt(notation[1]) - 1 // 0-7

        // Center of the square
        const x = (file + 0.5) * squareSize
        const y = (7 - rank + 0.5) * squareSize // Flip rank for visual coordinates

        return { x, y }
    }

    return (
        <svg
            className="absolute inset-0 pointer-events-none"
            width={boardSize}
            height={boardSize}
            style={{ zIndex: 10 }}
        >
            <defs>
                {/* Gradient for the thread */}
                <linearGradient id="quantumGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#00e5ff" stopOpacity="0.9">
                        <animate
                            attributeName="stop-color"
                            values="#00e5ff;#ff0080;#00e5ff"
                            dur="3s"
                            repeatCount="indefinite"
                        />
                    </stop>
                    <stop offset="50%" stopColor="#a855f7" stopOpacity="1.0" />
                    <stop offset="100%" stopColor="#ff0080" stopOpacity="0.9">
                        <animate
                            attributeName="stop-color"
                            values="#ff0080;#00e5ff;#ff0080"
                            dur="3s"
                            repeatCount="indefinite"
                        />
                    </stop>
                </linearGradient>

                {/* Glow filter */}
                <filter id="quantumGlow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
                    <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>

            {entanglements.map((entanglement, idx) => {
                const pos1 = notationToPixels(entanglement.piece1.square)
                const pos2 = notationToPixels(entanglement.piece2.square)

                // Calculate control point for Bézier curve (perpendicular offset)
                const midX = (pos1.x + pos2.x) / 2
                const midY = (pos1.y + pos2.y) / 2

                // Perpendicular vector for curve offset
                const dx = pos2.x - pos1.x
                const dy = pos2.y - pos1.y
                const offsetX = -dy * 0.25 // Perpendicular
                const offsetY = dx * 0.25

                const controlX = midX + offsetX
                const controlY = midY + offsetY

                // Path for the thread
                const pathD = `M ${pos1.x} ${pos1.y} Q ${controlX} ${controlY} ${pos2.x} ${pos2.y}`

                return (
                    <g key={`entanglement-${idx}`}>
                        {/* Outer glow layer */}
                        <path
                            d={pathD}
                            fill="none"
                            stroke="url(#quantumGradient)"
                            strokeWidth="6"
                            opacity="0.3"
                            filter="url(#quantumGlow)"
                        >
                            <animate
                                attributeName="opacity"
                                values="0.2;0.5;0.2"
                                dur="2s"
                                repeatCount="indefinite"
                            />
                        </path>

                        {/* Main thread */}
                        <path
                            d={pathD}
                            fill="none"
                            stroke="url(#quantumGradient)"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            filter="url(#quantumGlow)"
                        >
                            <animate
                                attributeName="opacity"
                                values="0.7;1.0;0.7"
                                dur="2s"
                                repeatCount="indefinite"
                            />
                        </path>

                        {/* Particle effects along the path */}
                        {[0, 0.33, 0.66].map((offset) => (
                            <circle
                                key={`particle-${idx}-${offset}`}
                                r="2"
                                fill="#ffffff"
                                opacity="0.8"
                            >
                                <animateMotion
                                    path={pathD}
                                    dur="3s"
                                    repeatCount="indefinite"
                                    begin={`${offset * 3}s`}
                                />
                                <animate
                                    attributeName="opacity"
                                    values="0;0.8;0"
                                    dur="3s"
                                    repeatCount="indefinite"
                                    begin={`${offset * 3}s`}
                                />
                            </circle>
                        ))}

                        {/* Tooltip (title element for SVG hover) */}
                        <title>
                            ⚡ Quantum Entanglement!{'\n'}
                            {entanglement.piece1.piece} at {entanglement.piece1.square} ↔ {entanglement.piece2.piece} at {entanglement.piece2.square}{'\n'}
                            {entanglement.correlationType === 'positive' ? 'Exist together' : 'Mutually exclusive'}
                        </title>
                    </g>
                )
            })}
        </svg>
    )
}
