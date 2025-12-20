import React from "react"

interface OverlaysProps {
    collapseFlash: boolean
    mergeFlash: boolean
    partialCollapseFlash: boolean
    splitMode: boolean
    splitFirstTarget: string | null
    quantumElimination: "Cyan" | "Pink" | null
    entanglementFormed: boolean
    entanglementBroken: boolean
    interferenceDetected: boolean
}

export default function Overlays({
    collapseFlash,
    mergeFlash,
    partialCollapseFlash,
    splitMode,
    splitFirstTarget,
    quantumElimination,
    entanglementFormed,
    entanglementBroken,
    interferenceDetected
}: OverlaysProps) {
    return (
        <>
            {/* Collapse Flash Overlay */}
            {collapseFlash && (
                <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none animate-pulse">
                    <div className="text-6xl font-black text-cyan-400" style={{
                        fontFamily: "var(--font-title)",
                        textShadow: "0 0 40px rgba(0, 229, 255, 0.8), 0 0 80px rgba(0, 229, 255, 0.5)"
                    }}>
                        REALITY COLLAPSED!
                    </div>
                </div>
            )}

            {/* Merge Flash Overlay */}
            {mergeFlash && (
                <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none animate-pulse">
                    <div className="text-5xl font-black text-fuchsia-400" style={{
                        fontFamily: "var(--font-title)",
                        textShadow: "0 0 40px rgba(255, 0, 128, 0.8), 0 0 80px rgba(255, 0, 128, 0.5)"
                    }}>
                        MERGING REALITIES...
                    </div>
                </div>
            )}

            {/* Partial Collapse Toast */}
            {partialCollapseFlash && (
                <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-40 bg-purple-900/90 backdrop-blur-md px-6 py-3 rounded-lg border border-purple-400 shadow-lg animate-pulse">
                    <p className="text-purple-200 text-sm font-medium" style={{ fontFamily: "var(--font-body)" }}>
                        ⚡ Reality Partially Collapsed!
                    </p>
                </div>
            )}

            {/* Entanglement Formed Toast */}
            {entanglementFormed && (
                <div className="fixed bottom-32 left-1/2 transform -translate-x-1/2 z-40 bg-slate-900/90 backdrop-blur-md px-6 py-3 rounded-lg border border-cyan-400 shadow-[0_0_20px_rgba(0,229,255,0.4)] animate-bounce">
                    <p className="text-cyan-300 text-lg font-bold" style={{ fontFamily: "var(--font-subtitle)" }}>
                        ⚡ Quantum Entanglement Formed!
                    </p>
                </div>
            )}

            {/* Interference Detected Toast */}
            {interferenceDetected && (
                <div className="fixed bottom-40 left-1/2 transform -translate-x-1/2 z-40 bg-indigo-900/90 backdrop-blur-md px-6 py-3 rounded-lg border border-white shadow-[0_0_30px_rgba(255,255,255,0.4)] animate-pulse">
                    <p className="text-white text-lg font-bold" style={{ fontFamily: "var(--font-subtitle)" }}>
                        ✨ Quantum Interference Activated!
                    </p>
                </div>
            )}

            {/* Entanglement Broken Toast */}
            {entanglementBroken && (
                <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
                    <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-fuchsia-500 animate-pulse" style={{
                        fontFamily: "var(--font-title)",
                        filter: "drop-shadow(0 0 20px rgba(255, 0, 128, 0.6))"
                    }}>
                        QUANTUM LINK BROKEN!
                    </div>
                </div>
            )}

            {/* Quantum Elimination Victory */}
            {quantumElimination && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
                    <div className="text-center animate-pulse">
                        <div className="text-7xl mb-4">👑</div>
                        <h1 className="text-5xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent mb-4"
                            style={{ fontFamily: "var(--font-title)" }}>
                            QUANTUM ELIMINATION!
                        </h1>
                        <p className="text-2xl text-white font-bold" style={{ fontFamily: "var(--font-subtitle)" }}>
                            {quantumElimination === "Cyan" ? "Pink" : "Cyan"} Wins
                        </p>
                        <p className="text-slate-400 mt-4" style={{ fontFamily: "var(--font-body)" }}>
                            Opponent's King has 0% survival probability
                        </p>
                    </div>
                </div>
            )}
        </>
    )
}
