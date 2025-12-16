"use client"

import React from "react"
import { useQuantumChess } from "../hooks/useQuantumChess"
import ChessBoard from "../components/ChessBoard"
import SidePanel from "../components/SidePanel"
import Overlays from "../components/Overlays"

export default function QuantumChess() {
    const {
        game,
        squares,
        quantumState,
        selectedSquare,
        dragState,
        isDragging,
        isCheck,
        checkmateWinner,
        quantumElimination,
        splitMode,
        splitFirstTarget,
        collapseFlash,
        mergeFlash,
        partialCollapseFlash,
        handleMouseDown,
        handleMouseUp,
        handleSquareClick,
        resetToRandomPosition,
        collapseQuantumState,
        handleResign,
        startSplit,
        cancelSplit,
        mergePiece,
        isPieceInSuperposition
    } = useQuantumChess()

    const currentTurn = game.turn() === 'w' ? 'white' : 'black'

    // Check if selected piece can split (non-pawn and belongs to current player)
    const selectedPiece = selectedSquare
        ? squares.find(s => s.file === selectedSquare.file && s.rank === selectedSquare.rank)?.pieces[0]?.piece
        : null

    const canSplit = selectedPiece
        ? selectedPiece.toUpperCase() !== 'P' &&
        ((currentTurn === 'white' && selectedPiece === selectedPiece.toUpperCase()) ||
            (currentTurn === 'black' && selectedPiece === selectedPiece.toLowerCase()))
        : false

    const canMerge = selectedPiece ? isPieceInSuperposition(selectedPiece) : false

    return (
        <div
            className="min-h-screen flex flex-col items-center justify-center p-6"
            style={{
                backgroundImage: "url('https://images.unsplash.com/photo-1695390472716-815085e401a2?q=80&w=1374&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundBlendMode: 'overlay',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
            }}
        >
            <Overlays
                collapseFlash={collapseFlash}
                mergeFlash={mergeFlash}
                partialCollapseFlash={partialCollapseFlash}
                splitMode={splitMode}
                splitFirstTarget={splitFirstTarget}
                quantumElimination={quantumElimination}
            />

            <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Climate+Crisis:wght@400;500;600;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&family=Bebas+Neue&family=Space+Grotesk:wght@300;400;500;600;700&display=swap');
        
        body {
          font-family: 'Climate Crisis', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        
        :root {
            --font-title: 'Climate Crisis', sans-serif;
            --font-subtitle: 'Bebas Neue', cursive;
            --font-body: 'Space Grotesk', sans-serif;
        }
      `}</style>

            <div className="mb-10 text-center">
                {checkmateWinner ? (
                    <div className="animate-pulse">
                        <h1
                            style={{ fontFamily: "var(--font-title)" }}
                            className="text-6xl font-black bg-gradient-to-r from-red-400 via-yellow-400 to-red-400 bg-clip-text text-transparent mb-4 tracking-tight"
                        >
                            CHECKMATE!
                        </h1>
                        <p
                            style={{ fontFamily: "var(--font-subtitle)" }}
                            className="text-3xl text-white font-bold"
                        >
                            {checkmateWinner} Wins
                        </p>
                    </div>
                ) : (
                    <>
                        <h1
                            style={{ fontFamily: "var(--font-title)" }}
                            className="text-5xl font-bold bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent mb-3 tracking-tight"
                        >
                            CHAOS CHESS
                        </h1>
                        <p
                            style={{ fontFamily: "var(--font-subtitle)" }}
                            className="text-cyan-400/80 text-sm font-medium tracking-widest uppercase"
                        >
                            {currentTurn === "white" ? "⚡ Cyan Team's Move" : "⚡ Pink Team's Move"}
                        </p>
                    </>
                )}
            </div>

            <div className="flex flex-col lg:flex-row items-start gap-8 w-full max-w-6xl">
                <div className="flex-grow">
                    <ChessBoard
                        squares={squares}
                        game={game}
                        selectedSquare={selectedSquare}
                        dragState={dragState}
                        isDragging={isDragging}
                        isCheck={isCheck}
                        splitMode={splitMode}
                        splitFirstTarget={splitFirstTarget}
                        onSquareClick={handleSquareClick}
                        onMouseDown={handleMouseDown}
                        onMouseUp={handleMouseUp}
                    />
                </div>

                <SidePanel
                    quantumBranchCount={quantumState.boards.length}
                    currentTurn={currentTurn}
                    checkmateWinner={checkmateWinner}
                    selectedSquare={selectedSquare}
                    canSplit={canSplit}
                    canMerge={canMerge}
                    splitMode={splitMode}
                    onCollapse={collapseQuantumState}
                    onReset={resetToRandomPosition}
                    onResign={handleResign}
                    onSplit={startSplit}
                    onMerge={mergePiece}
                    onCancelSplit={cancelSplit}
                />
            </div>
        </div>
    )
}
