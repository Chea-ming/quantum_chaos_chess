import React from "react"
import { Chess } from "chess.js"
import { BoardSquare, DragState, EntangledPair, PhaseSplitConfig } from "../chess/types"
import { FILES, RANKS, squareToNotation, getValidMoves } from "../chess/boardUtils"
import Piece from "./Piece"
import QuantumThreads from "./QuantumThreads"

interface ChessBoardProps {
    squares: BoardSquare[]
    game: Chess
    selectedSquare: { file: number; rank: number } | null
    dragState: DragState
    isCheck: boolean
    splitMode: boolean
    splitFirstTarget: string | null
    entanglements: EntangledPair[]
    onSquareClick: (file: number, rank: number, event?: React.MouseEvent) => void
    
    // NEW: Add phase split config
    phaseSplitConfig: PhaseSplitConfig | null
}

export default function ChessBoard({
    squares,
    game,
    selectedSquare,
    dragState,
    isCheck,
    splitMode,
    splitFirstTarget,
    entanglements,
    onSquareClick,
    phaseSplitConfig // NEW: Destructure
}: ChessBoardProps) {

    const isValidMoveTarget = (file: number, rank: number) => {
        const notation = squareToNotation(file, rank)
        return dragState.validMoves.includes(notation)
    }

    const isSelectedSquare = (file: number, rank: number) =>
        (selectedSquare?.file === file && selectedSquare?.rank === rank) ||
        (dragState.square?.file === file && dragState.square?.rank === rank)

    return (
        
        <div className="flex items-center gap-3">

            {/* Rank labels */}
            <div className="flex flex-col-reverse justify-between" style={{ height: '560px' }}>
                {RANKS.map((rank) => (
                    <span 
                        key={rank} 
                        style={{ height: '70px', fontFamily: "var(--font-body)" }} 
                        className="w-8 flex items-center justify-center text-sm font-medium text-cyan-300/50"
                    >
                        {rank}
                    </span>
                ))}
            </div>

            <div>
                <div 
                    className="w-[560px] h-[560px] rounded-xl shadow-2xl overflow-hidden border-2 border-cyan-500/30 relative" 
                    style={{ boxShadow: "0 0 40px rgba(6, 182, 212, 0.3)" }}
                >
                    {/* Quantum Entanglement Threads Overlay */}
                    <QuantumThreads entanglements={entanglements} boardSize={560} />

                    <div className="grid grid-cols-8 w-full h-full">
                        {Array.from({ length: 64 }).map((_, index) => {
                            const file = index % 8
                            const rank = 7 - Math.floor(index / 8)
                            const square = squares.find((s) => s.file === file && s.rank === rank)
                            const isLight = (file + rank) % 2 === 0
                            const isSelected = isSelectedSquare(file, rank)
                            const isValidMove = isValidMoveTarget(file, rank)
                            const notation = squareToNotation(file, rank)

                            const isFirstSplitTarget = splitMode && splitFirstTarget === notation
                            const isSplitModeValid = splitMode && isValidMove && notation !== splitFirstTarget

                            const isKingInCheck = isCheck && square?.pieces.some(p =>
                                (game.turn() === 'w' && p.piece === 'K') ||
                                (game.turn() === 'b' && p.piece === 'k')
                            )

                            const hasMultiplePieces = square && square.pieces.length > 1

                            // NEW: Check if this square is part of phase selection
                            const isPhaseSelectionSquare = phaseSplitConfig && 
                                (notation === phaseSplitConfig.source || 
                                 notation === phaseSplitConfig.target1 || 
                                 notation === phaseSplitConfig.target2)
                            
                            const phaseAtSquare = phaseSplitConfig?.phases[notation]

                            const pieceTooltip = square?.pieces.length === 1 && square.pieces[0].probability < 0.99
                                ? `${(square.pieces[0].probability * 100).toFixed(0)}%`
                                : hasMultiplePieces
                                    ? square.pieces.map(p => `${p.piece} ${(p.probability * 100).toFixed(0)}%`).join(', ')
                                    : ''

                            return (
                                <button
                                    key={`${file}-${rank}`}
                                    onClick={(e) => onSquareClick(file, rank, e)}
                                    title={pieceTooltip}
                                    className={`w-[70px] h-[70px] relative flex items-center justify-center transition-all duration-150 
                                        ${isSelected ? "ring-4 ring-cyan-400 ring-inset" : ""} 
                                        ${isValidMove && !splitMode ? "ring-3 ring-fuchsia-400 ring-inset" : ""}
                                        ${isFirstSplitTarget ? "ring-4 ring-green-400 ring-inset" : ""}
                                        ${isSplitModeValid ? "ring-4 ring-yellow-400 ring-inset animate-pulse" : ""}
                                        ${isPhaseSelectionSquare ? "ring-4 ring-inset cursor-pointer" : ""}`}
                                    style={{
                                        background: isLight
                                            ? "linear-gradient(135deg, #1e293b 0%, #334155 100%)"
                                            : "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)",
                                        boxShadow: isKingInCheck
                                            ? "0 0 30px 8px rgba(255, 0, 51, 0.8) inset, 0 0 40px rgba(255, 0, 51, 0.4)"
                                            : isPhaseSelectionSquare
                                                ? phaseAtSquare === 'positive'
                                                    ? "0 0 20px 4px rgba(251, 191, 36, 0.6) inset, 0 0 30px rgba(251, 191, 36, 0.4)"
                                                    : "0 0 20px 4px rgba(6, 182, 212, 0.6) inset, 0 0 30px rgba(6, 182, 212, 0.4)"
                                                : "",
                                    }}
                                >
                                    {/* Valid move indicator */}
                                    {isValidMove && (!square || square.pieces.length === 0) && (
                                        <div className="absolute w-3 h-3 rounded-full bg-fuchsia-400/70 shadow-lg shadow-fuchsia-400/50" />
                                    )}

                                    {/* NEW: Phase indicator badge */}
                                    {isPhaseSelectionSquare && (
                                        <div 
                                            className={`absolute top-1 right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold z-20 ${
                                                phaseAtSquare === 'positive'
                                                    ? 'bg-amber-500 text-amber-900'
                                                    : 'bg-cyan-500 text-cyan-900'
                                            }`}
                                            style={{
                                                boxShadow: phaseAtSquare === 'positive'
                                                    ? '0 0 10px rgba(251, 191, 36, 0.8)'
                                                    : '0 0 10px rgba(6, 182, 212, 0.8)'
                                            }}
                                        >
                                            {phaseAtSquare === 'positive' ? '+' : '−'}
                                        </div>
                                    )}

                                    {/* Piece rendering */}
                                    {square?.pieces.map((p, i) => (
                                        <div
                                            key={`${p.piece}-${i}`}
                                            className="absolute inset-0 flex items-center justify-center transition-all duration-300"
                                            style={{
                                                opacity: p.probability,
                                                filter: p.interference === 'destructive'
                                                    ? 'grayscale(0.8) drop-shadow(0 0 5px red)'
                                                    : p.interference === 'constructive'
                                                        ? 'drop-shadow(0 0 10px white) drop-shadow(0 0 20px cyan)'
                                                        : 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))',
                                                zIndex: 10
                                            }}
                                        >
                                            {/* Constructive interference effects */}
                                            {p.interference === 'constructive' && (
                                                <div className="absolute inset-0 animate-pulse pointer-events-none">
                                                    <div className="absolute top-0 left-0 w-full h-full bg-cyan-400/20 rounded-full blur-xl"></div>
                                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 border-2 border-white/50 rounded-full animate-ping"></div>
                                                </div>
                                            )}

                                            {/* Destructive interference effects */}
                                            {p.interference === 'destructive' && (
                                                <div className="absolute inset-0 bg-red-900/30 rounded-full animate-pulse pointer-events-none mix-blend-multiply"></div>
                                            )}

                                            <div className={`w-4/5 h-4/5 flex items-center justify-center select-none transform transition-transform ${p.interference === 'constructive' ? 'scale-110' : ''}`}>
                                                <Piece piece={p.piece} probability={p.probability} />
                                            </div>
                                        </div>
                                    ))}
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* File labels */}
                <div className="flex justify-between mt-2 px-1">
                    {FILES.map((file) => (
                        <span 
                            key={file} 
                            style={{ fontFamily: "var(--font-body)" }} 
                            className="w-[70px] text-center text-sm font-medium text-cyan-300/50"
                        >
                            {file}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    )
}