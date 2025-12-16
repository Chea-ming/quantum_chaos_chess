import React from "react"

interface PieceActionMenuProps {
    position: { x: number; y: number }
    canSplit: boolean
    canMerge: boolean
    onSplit: () => void
    onMerge: () => void
    onCancel: () => void
}

export default function PieceActionMenu({
    position,
    canSplit,
    canMerge,
    onSplit,
    onMerge,
    onCancel
}: PieceActionMenuProps) {
    return (
        <div
            className="fixed z-50 flex gap-2 p-2 bg-slate-900/95 backdrop-blur-md rounded-xl border border-cyan-500/40 shadow-2xl"
            style={{
                left: position.x,
                top: position.y + 80, // Position below the piece
                transform: 'translateX(-50%)',
                boxShadow: '0 0 30px rgba(0, 229, 255, 0.3)'
            }}
        >
            {/* Split Button */}
            {canSplit && (
                <button
                    onClick={onSplit}
                    className="flex flex-col items-center gap-1 px-4 py-3 bg-cyan-900/60 hover:bg-cyan-800/80 rounded-lg border border-cyan-400/50 hover:border-cyan-300 transition-all duration-200 group"
                    title="Split piece into quantum superposition"
                >
                    <span className="text-2xl group-hover:animate-pulse">⚛️</span>
                    <span className="text-xs font-bold text-cyan-300" style={{ fontFamily: "var(--font-body)" }}>
                        SPLIT
                    </span>
                </button>
            )}

            {/* Merge Button */}
            {canMerge && (
                <button
                    onClick={onMerge}
                    className="flex flex-col items-center gap-1 px-4 py-3 bg-fuchsia-900/60 hover:bg-fuchsia-800/80 rounded-lg border border-fuchsia-400/50 hover:border-fuchsia-300 transition-all duration-200 group"
                    title="Merge superposition to highest probability"
                >
                    <span className="text-2xl group-hover:animate-pulse">🌀</span>
                    <span className="text-xs font-bold text-fuchsia-300" style={{ fontFamily: "var(--font-body)" }}>
                        MERGE
                    </span>
                </button>
            )}

            {/* Cancel Button */}
            <button
                onClick={onCancel}
                className="flex flex-col items-center gap-1 px-3 py-3 bg-slate-800/60 hover:bg-slate-700/80 rounded-lg border border-slate-500/50 hover:border-slate-400 transition-all duration-200"
                title="Cancel"
            >
                <span className="text-xl">✕</span>
                <span className="text-xs text-slate-400" style={{ fontFamily: "var(--font-body)" }}>
                    ESC
                </span>
            </button>
        </div>
    )
}
