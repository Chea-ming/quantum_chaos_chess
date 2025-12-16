import React from "react"
import { Chess } from "chess.js"
import { BoardSquare, DragState } from "../chess/types"
import { FILES, RANKS, squareToNotation, getValidMoves } from "../chess/boardUtils"
import Piece from "./Piece"

interface ChessBoardProps {
    squares: BoardSquare[]
    game: Chess
    selectedSquare: { file: number; rank: number } | null
    dragState: DragState
    isDragging: boolean
    isCheck: boolean
    splitMode: boolean
    splitFirstTarget: string | null
    onSquareClick: (file: number, rank: number, event?: React.MouseEvent) => void
    onMouseDown: (file: number, rank: number) => void
    onMouseUp: (file: number, rank: number) => void
}

export default function ChessBoard({
    squares,
    game,
    selectedSquare,
    dragState,
    isDragging,
    isCheck,
    splitMode,
    splitFirstTarget,
    onSquareClick,
    onMouseDown,
    onMouseUp
}: ChessBoardProps) {

    const isValidMoveTarget = (file: number, rank: number) => {
        const notation = squareToNotation(file, rank)
        if (dragState.validMoves.includes(notation)) return true

        if (selectedSquare) {
            const moves = getValidMoves(game, selectedSquare.file, selectedSquare.rank)
            return moves.includes(notation)
        }
        return false
    }

    const isSelectedSquare = (file: number, rank: number) =>
        (selectedSquare?.file === file && selectedSquare?.rank === rank) ||
        (dragState.square?.file === file && dragState.square?.rank === rank)

    return (
        <div className="flex flex-col lg:flex-row items-start gap-8 w-full max-w-6xl">
            <div className="flex items-center gap-3">
                <div className="flex flex-col-reverse justify-between" style={{ height: '560px' }}>
                    {RANKS.map((rank) => (
                        <span key={rank} style={{ height: '70px', fontFamily: "var(--font-body)" }} className="w-8 flex items-center justify-center text-sm font-medium text-cyan-300/50">
                            {rank}
                        </span>
                    ))}
                </div>

                <div>
                    <div className="w-[560px] h-[560px] rounded-xl shadow-2xl overflow-hidden border-2 border-cyan-500/30" style={{ boxShadow: "0 0 40px rgba(6, 182, 212, 0.3)" }}>
                        <div className="grid grid-cols-8 w-full h-full">
                            {Array.from({ length: 64 }).map((_, index) => {
                                const file = index % 8
                                const rank = 7 - Math.floor(index / 8)
                                const square = squares.find((s) => s.file === file && s.rank === rank)
                                const isLight = (file + rank) % 2 === 0
                                const isSelected = isSelectedSquare(file, rank)
                                const isValidMove = isValidMoveTarget(file, rank)
                                const notation = squareToNotation(file, rank)

                                // Split mode: highlight first target differently
                                const isFirstSplitTarget = splitMode && splitFirstTarget === notation
                                const isSplitModeValid = splitMode && isValidMove && notation !== splitFirstTarget

                                // Check for King in check
                                const isKingInCheck = isCheck && square?.pieces.some(p =>
                                    (game.turn() === 'w' && p.piece === 'K') ||
                                    (game.turn() === 'b' && p.piece === 'k')
                                )

                                const hasMultiplePieces = square && square.pieces.length > 1

                                // Tooltip with probability info
                                const pieceTooltip = square?.pieces.length === 1 && square.pieces[0].probability < 0.99
                                    ? `${(square.pieces[0].probability * 100).toFixed(0)}% here — Superposed!`
                                    : hasMultiplePieces
                                        ? `Superposition: ${square.pieces.map(p => `${p.piece} (${(p.probability * 100).toFixed(0)}%)`).join(', ')}`
                                        : ''

                                return (
                                    <button
                                        key={`${file}-${rank}`}
                                        onClick={(e) => onSquareClick(file, rank, e)}
                                        onMouseDown={() => onMouseDown(file, rank)}
                                        onMouseUp={() => onMouseUp(file, rank)}
                                        title={pieceTooltip}
                                        className={`w-[70px] h-[70px] relative flex items-center justify-center transition-all duration-150 
                                            ${isSelected ? "ring-4 ring-cyan-400 ring-inset" : ""} 
                                            ${isValidMove && !splitMode ? "ring-3 ring-fuchsia-400 ring-inset" : ""}
                                            ${isFirstSplitTarget ? "ring-4 ring-green-400 ring-inset" : ""}
                                            ${isSplitModeValid ? "ring-4 ring-yellow-400 ring-inset animate-pulse" : ""}`}
                                        style={{
                                            background: isLight
                                                ? "linear-gradient(135deg, #1e293b 0%, #334155 100%)"
                                                : "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)",
                                            boxShadow: isKingInCheck
                                                ? "0 0 30px 8px rgba(255, 0, 51, 0.8) inset, 0 0 40px rgba(255, 0, 51, 0.4)"
                                                : "",
                                        }}
                                    >
                                        {isValidMove && (!square || square.pieces.length === 0) && (
                                            <div className="absolute w-3 h-3 rounded-full bg-fuchsia-400/70 shadow-lg shadow-fuchsia-400/50" />
                                        )}
                                        {square && square.pieces.map((pieceData, idx) => {
                                            const isWhite = pieceData.piece === pieceData.piece.toUpperCase()
                                            const isQuantum = pieceData.probability < 0.99
                                            const opacity = 0.3 + 0.7 * pieceData.probability

                                            return (
                                                <div
                                                    key={`${pieceData.piece}-${idx}`}
                                                    className={`absolute flex items-center justify-center transition-opacity duration-150 ${isDragging && dragState.square?.file === file && dragState.square?.rank === rank ? 'opacity-40' : ''
                                                        }`}
                                                    style={{
                                                        opacity: opacity,
                                                        filter: isWhite
                                                            ? `drop-shadow(0 0 ${isQuantum ? '12px' : '8px'} rgba(0, 229, 255, ${isQuantum ? '1.0' : '0.8'}))`
                                                            : `drop-shadow(0 0 ${isQuantum ? '14px' : '10px'} rgba(255, 102, 178, ${isQuantum ? '1.0' : '0.8'}))`,
                                                        cursor: 'grab',
                                                        animation: isQuantum ? 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' : 'none',
                                                        // Slight offset for multiple pieces
                                                        transform: hasMultiplePieces ? `translate(${idx * 3}px, ${idx * 3}px)` : 'none'
                                                    }}
                                                >
                                                    <Piece piece={pieceData.piece} probability={pieceData.probability} />
                                                </div>
                                            )
                                        })}
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    <div className="flex justify-between mt-2 px-1">
                        {FILES.map((file) => (
                            <span key={file} style={{ fontFamily: "var(--font-body)" }} className="w-[70px] text-center text-sm font-medium text-cyan-300/50">
                                {file}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
