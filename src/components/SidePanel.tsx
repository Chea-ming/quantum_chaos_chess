import React from "react"

interface SidePanelProps {
    quantumBranchCount: number
    currentTurn: string
    checkmateWinner: string | null
    selectedSquare: { file: number; rank: number } | null
    canSplit: boolean
    canMerge: boolean
    splitMode: boolean
    onCollapse: () => void
    onReset: () => void
    onResign: () => void
    onSplit: () => void
    onMerge: () => void
    onCancelSplit: () => void
}

export default function SidePanel({
    quantumBranchCount,
    currentTurn,
    checkmateWinner,
    selectedSquare,
    canSplit,
    canMerge,
    splitMode,
    onCollapse,
    onReset,
    onResign,
    onSplit,
    onMerge,
    onCancelSplit
}: SidePanelProps) {
    const isUnstable = quantumBranchCount > 4

    return (
        <div className="flex flex-col gap-5 w-full lg:w-80 bg-slate-900/70 backdrop-blur-md rounded-xl p-6 border-2 border-cyan-500/30 shadow-xl" style={{ boxShadow: "0 0 30px rgba(6, 182, 212, 0.2)" }}>

            {/* Quantum Controls */}
            <div className={`space-y-2 rounded-lg p-4 border ${isUnstable ? 'bg-yellow-900/40 border-yellow-500/40' : 'bg-slate-800/50 border-cyan-500/20'}`}>
                <h3
                    style={{ fontFamily: "var(--font-subtitle)" }}
                    className="text-cyan-400 text-sm font-bold tracking-wide mb-2 uppercase"
                >
                    🌀 Quantum Controls
                </h3>

                {/* Split Mode Active */}
                {splitMode && (
                    <div className="bg-cyan-900/60 border border-cyan-400/50 rounded-lg p-3 mb-2 animate-pulse">
                        <p className="text-cyan-200 text-xs font-bold mb-2" style={{ fontFamily: "var(--font-body)" }}>
                            ⚛️ SPLIT MODE ACTIVE
                        </p>
                        <p className="text-cyan-300 text-xs mb-2" style={{ fontFamily: "var(--font-body)" }}>
                            Select two different target squares
                        </p>
                        <button
                            onClick={onCancelSplit}
                            className="w-full px-3 py-1.5 bg-red-900/60 hover:bg-red-800/80 text-red-200 text-xs font-medium rounded border border-red-500/50 hover:border-red-400"
                            style={{ fontFamily: "var(--font-body)" }}
                        >
                            Cancel Split
                        </button>
                    </div>
                )}

                {/* Split Button */}
                <button
                    onClick={onSplit}
                    disabled={!canSplit || splitMode}
                    className={`w-full px-4 py-2 rounded-lg font-medium transition-all duration-200 ${canSplit && !splitMode
                            ? 'bg-cyan-900/60 hover:bg-cyan-800/70 text-cyan-200 border border-cyan-500/40 hover:border-cyan-400/60 hover:shadow-lg hover:shadow-cyan-400/20'
                            : 'bg-slate-800/40 text-slate-500 border border-slate-700/40 cursor-not-allowed'
                        }`}
                    style={{ fontFamily: "var(--font-body)" }}
                >
                    ⚛️ Split Piece
                </button>

                {/* Merge Button */}
                <button
                    onClick={onMerge}
                    disabled={!canMerge || splitMode}
                    className={`w-full px-4 py-2 rounded-lg font-medium transition-all duration-200 ${canMerge && !splitMode
                            ? 'bg-fuchsia-900/60 hover:bg-fuchsia-800/70 text-fuchsia-200 border border-fuchsia-500/40 hover:border-fuchsia-400/60 hover:shadow-lg hover:shadow-fuchsia-400/20'
                            : 'bg-slate-800/40 text-slate-500 border border-slate-700/40 cursor-not-allowed'
                        }`}
                    style={{ fontFamily: "var(--font-body)" }}
                >
                    🌀 Merge Piece
                </button>

                <div className="text-xs text-slate-400 mt-2" style={{ fontFamily: "var(--font-body)" }}>
                    {!selectedSquare
                        ? "Select a non-pawn piece to split or merge"
                        : canSplit
                            ? "Click Split to create quantum superposition"
                            : "Pawns cannot be split"}
                </div>
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent"></div>

            {/* Quantum Status */}
            <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-300" style={{ fontFamily: "var(--font-body)" }}>Reality Branches:</span>
                    <span className={`font-bold ${isUnstable ? 'text-yellow-400' : 'text-cyan-400'}`} style={{ fontFamily: "var(--font-body)" }}>
                        {quantumBranchCount}/8
                    </span>
                </div>

                {/* Unstable reality warning */}
                {isUnstable && (
                    <div className="text-xs text-yellow-300 bg-yellow-900/40 rounded px-2 py-1 animate-pulse" style={{ fontFamily: "var(--font-body)" }}>
                        ⚠️ Unstable reality — consider measuring!
                    </div>
                )}

                <button
                    onClick={onCollapse}
                    disabled={quantumBranchCount <= 1}
                    className={`w-full px-4 py-2 rounded-lg font-medium transition-all duration-200 ${quantumBranchCount > 1
                        ? 'bg-purple-900/60 hover:bg-purple-800/70 text-purple-200 border border-purple-500/40 hover:border-purple-400/60 hover:shadow-lg hover:shadow-purple-400/20'
                        : 'bg-slate-800/40 text-slate-500 border border-slate-700/40 cursor-not-allowed'
                        }`}
                    style={{ fontFamily: "var(--font-body)" }}
                >
                    🎲 Measure Reality
                </button>
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent"></div>

            <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-300" style={{ fontFamily: "var(--font-body)" }}>Current Turn:</span>
                    <span className="font-semibold" style={{ color: currentTurn === "white" ? "#00e5ff" : "#ff0080", fontFamily: "var(--font-body)" }}>
                        {currentTurn === "white" ? "⚡ Cyan" : "⚡ Pink"}
                    </span>
                </div>
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent"></div>

            <button
                onClick={onResign}
                className="w-full px-6 py-3 bg-red-900/40 hover:bg-red-800/60 text-red-300 font-medium rounded-lg transition-all duration-200 border border-red-500/40 hover:border-red-400/70 hover:shadow-lg hover:shadow-red-400/30"
                style={{ fontFamily: "var(--font-body)" }}
                disabled={!!checkmateWinner}
            >
                Resign
            </button>

            <button
                onClick={onReset}
                className="w-full px-6 py-3 bg-slate-800/60 hover:bg-slate-700/70 text-cyan-400 font-medium rounded-lg transition-all duration-200 border border-cyan-400/40 hover:border-cyan-400/60 hover:shadow-lg hover:shadow-cyan-400/20"
                style={{ fontFamily: "var(--font-body)" }}
            >
                🎲 New Random Position
            </button>
        </div>
    )
}
