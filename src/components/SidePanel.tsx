import React from "react"
import { PhaseSplitConfig, QuantumCheckInfo } from "../chess/types"

interface SidePanelProps {
    quantumBranchCount: number
    activeQuantumLinks: number
    interferenceCount: number
    currentTurn: string
    checkmateWinner: string | null
    selectedSquare: { file: number; rank: number } | null
    canSplit: boolean
    canMerge: boolean
    canTogglePhase: boolean
    splitMode: boolean
    piecePhase: 'positive' | 'negative' | null
    onSetPhase: (phase: 'positive' | 'negative') => void
    onCollapse: () => void
    onReset: () => void
    onResign: () => void
    onSplit: () => void
    onMerge: () => void
    onTogglePhase: () => void
    onCancelSplit: () => void
    
    // NEW: Add these props
    canMeasure: boolean
    movesUntilMeasurement: number
    phaseSplitConfig: PhaseSplitConfig | null
    onTogglePhaseAtSquare: (square: string) => void
    inQuantumCheck: QuantumCheckInfo | null
    onAcceptGambit: () => void
}

export default function SidePanel({
    quantumBranchCount,
    activeQuantumLinks,
    interferenceCount,
    currentTurn,
    checkmateWinner,
    selectedSquare,
    canSplit,
    canMerge,
    canTogglePhase,
    splitMode,
    piecePhase,
    onSetPhase,
    onCollapse,
    onReset,
    onResign,
    onSplit,
    onMerge,
    onTogglePhase,
    onCancelSplit,
    
    // NEW: Destructure new props
    canMeasure,
    movesUntilMeasurement,
    phaseSplitConfig,
    onTogglePhaseAtSquare,
    inQuantumCheck,
    onAcceptGambit
}: SidePanelProps) {
    const isUnstable = quantumBranchCount > 4

    return (
        <div 
            className="flex flex-col gap-3 w-72 bg-slate-900/70 backdrop-blur-md rounded-xl p-4 border-2 border-cyan-500/30 shadow-xl" 
            style={{ 
                boxShadow: "0 0 30px rgba(6, 182, 212, 0.2)",
                maxHeight: "560px"
            }}
        >
            {/* Quantum Status */}
            <div className="space-y-2 rounded-lg p-3 bg-slate-800/50 border border-cyan-500/20">
                <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-300" style={{ fontFamily: "var(--font-body)" }}>Branches</span>
                    <span className={`font-bold ${isUnstable ? 'text-yellow-400' : 'text-cyan-400'}`}>
                        {quantumBranchCount}
                    </span>
                </div>

                <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-300" style={{ fontFamily: "var(--font-body)" }}>Links</span>
                    <span className={`font-bold ${activeQuantumLinks > 0 ? 'text-fuchsia-400' : 'text-slate-500'}`}>
                        {activeQuantumLinks}
                    </span>
                </div>

                <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-300" style={{ fontFamily: "var(--font-body)" }}>Boosts</span>
                    <span className={`font-bold ${interferenceCount > 0 ? 'text-white' : 'text-slate-500'}`}>
                        {interferenceCount}
                    </span>
                </div>

                <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-300" style={{ fontFamily: "var(--font-body)" }}>Turn</span>
                    <span className="font-semibold" style={{ color: currentTurn === "white" ? "#00e5ff" : "#ff0080" }}>
                        {currentTurn === "white" ? "Cyan" : "Pink"}
                    </span>
                </div>
            </div>

            {/* Quantum Controls */}
            <div className={`space-y-2 rounded-lg p-3 border ${isUnstable ? 'bg-yellow-900/40 border-yellow-500/40' : 'bg-slate-800/50 border-cyan-500/20'}`}>
                <h3 className="text-cyan-400 text-xs font-bold tracking-wide uppercase mb-2" style={{ fontFamily: "var(--font-subtitle)" }}>
                    Quantum Controls
                </h3>

                <button
                    onClick={onSplit}
                    disabled={!canSplit || splitMode}
                    className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        canSplit && !splitMode
                            ? 'bg-cyan-900/60 hover:bg-cyan-800/70 text-cyan-200 border border-cyan-500/40'
                            : 'bg-slate-800/40 text-slate-500 border border-slate-700/40 cursor-not-allowed'
                    }`}
                >
                    ⚛️ Split
                </button>

                <button
                    onClick={onMerge}
                    disabled={!canMerge || splitMode}
                    className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        canMerge && !splitMode
                            ? 'bg-fuchsia-900/60 hover:bg-fuchsia-800/70 text-fuchsia-200 border border-fuchsia-500/40'
                            : 'bg-slate-800/40 text-slate-500 border border-slate-700/40 cursor-not-allowed'
                    }`}
                >
                    🌀 Merge
                </button>

                <div className="grid grid-cols-2 gap-2">
                    <button
                        onClick={() => onSetPhase('positive')}
                        disabled={!canTogglePhase || splitMode || piecePhase === 'positive'}
                        className={`px-3 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${
                            canTogglePhase && !splitMode && piecePhase !== 'positive'
                                ? 'bg-amber-900/60 hover:bg-amber-800/70 text-amber-200 border border-amber-500/40'
                                : piecePhase === 'positive'
                                ? 'bg-amber-900/60 text-amber-200 border border-amber-500/60'
                                : 'bg-slate-800/40 text-slate-500 border border-slate-700/40 cursor-not-allowed'
                        }`}
                    >
                        +
                    </button>
                    <button
                        onClick={() => onSetPhase('negative')}
                        disabled={!canTogglePhase || splitMode || piecePhase === 'negative'}
                        className={`px-3 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${
                            canTogglePhase && !splitMode && piecePhase !== 'negative'
                                ? 'bg-cyan-900/60 hover:bg-cyan-800/70 text-cyan-200 border border-cyan-500/40'
                                : piecePhase === 'negative'
                                ? 'bg-cyan-900/60 text-cyan-200 border border-cyan-500/60'
                                : 'bg-slate-800/40 text-slate-500 border border-slate-700/40 cursor-not-allowed'
                        }`}
                    >
                        −
                    </button>
                </div>
            </div>

            {/* NEW: Phase Selection UI (shown during 2nd split) */}
            {phaseSplitConfig && (
                <div className="space-y-2 p-3 bg-purple-900/30 border border-purple-500/40 rounded-lg">
                    <div className="text-xs text-purple-300 text-center font-bold">
                        Set Phase (2nd Split)
                    </div>
                    <div className="text-xs text-slate-400 text-center">
                        Click pieces to toggle +/−
                    </div>
                    {Object.entries(phaseSplitConfig.phases).map(([square, phase]) => (
                        <div key={square} className="flex justify-between items-center text-xs">
                            <span className="text-slate-300">{square}</span>
                            <button
                                onClick={() => onTogglePhaseAtSquare(square)}
                                className={`px-2 py-1 rounded font-bold ${
                                    phase === 'positive'
                                        ? 'bg-amber-900/60 text-amber-200'
                                        : 'bg-cyan-900/60 text-cyan-200'
                                }`}
                            >
                                {phase === 'positive' ? '+' : '−'}
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* NEW: Quantum Check Gambit UI */}
            {inQuantumCheck && (
                <div className="space-y-2 p-3 bg-red-900/30 border border-red-500/40 rounded-lg">
                    <div className="text-xs text-red-300 text-center font-bold">
                        ⚠️ Quantum Check!
                    </div>
                    <div className="text-xs text-slate-300 text-center">
                        Attacker: {(inQuantumCheck.attackerProbability * 100).toFixed(0)}% exists
                    </div>
                    <button
                        onClick={onAcceptGambit}
                        className="w-full px-2 py-1 bg-red-900/60 hover:bg-red-800/70 text-red-200 text-xs font-medium rounded border border-red-500/40"
                    >
                        Accept Risk & Continue
                    </button>
                </div>
            )}

            {/* Measure Reality Button with Cooldown */}
            <button
                onClick={onCollapse}
                disabled={!canMeasure}
                className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    canMeasure
                        ? 'bg-purple-900/60 hover:bg-purple-800/70 text-purple-200 border border-purple-500/40'
                        : 'bg-slate-800/40 text-slate-500 border border-slate-700/40 cursor-not-allowed'
                }`}
            >
                🎲 Measure {!canMeasure ? `(${movesUntilMeasurement})` : ''}
            </button>

            <div className="flex-1"></div>

            {/* Bottom Actions */}
            <div className="space-y-2">
                <button
                    onClick={onResign}
                    className="w-full px-3 py-2 bg-red-900/40 hover:bg-red-800/60 text-red-300 text-sm font-medium rounded-lg transition-all duration-200 border border-red-500/40"
                    disabled={!!checkmateWinner}
                >
                    Resign
                </button>

                <button
                    onClick={onReset}
                    className="w-full px-3 py-2 bg-slate-800/60 hover:bg-slate-700/70 text-cyan-400 text-sm font-medium rounded-lg transition-all duration-200 border border-cyan-400/40"
                >
                    🎲 New Game
                </button>
            </div>
        </div>
    )
}