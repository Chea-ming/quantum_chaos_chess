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
        isCheck,
        checkmateWinner,
        quantumElimination,
        collapseFlash,
        mergeFlash,
        partialCollapseFlash,
        splitMode,
        splitFirstTarget,
        canSplit,
        canMerge,
        canTogglePhase,
        entanglements,
        activeQuantumLinks,
        entanglementFormed,
        entanglementBroken,
        interferenceCount,
        interferenceDetected,
        handleSquareClick,
        resetToRandomPosition,
        collapseQuantumState,
        handleResign,
        startSplit,
        cancelSplit,
        mergePiece,
        togglePiecePhase,
        piecePhase,
        setPiecePhase,
        
        // NEW: Destructure new values from hook
        canMeasure,
        movesUntilMeasurement,
        inQuantumCheck,
        acceptQuantumGambit,
    } = useQuantumChess()

    const currentTurn = game.turn() === 'w' ? 'white' : 'black'

    // Check if selected piece can split (non-pawn and belongs to current player)
    const selectedPiece = selectedSquare
        ? squares.find(s => s.file === selectedSquare.file && s.rank === selectedSquare.rank)?.pieces[0]?.piece
        : null

    // Note: canSplit and canMerge are already provided by the hook, but if you need local overrides, keep them
    // const canSplit = selectedPiece
    //     ? selectedPiece.toUpperCase() !== 'P' &&
    //       ((currentTurn === 'white' && selectedPiece === selectedPiece.toUpperCase()) ||
    //         (currentTurn === 'black' && selectedPiece === selectedPiece.toLowerCase()))
    //     : false
    // const canMerge = selectedPiece ? isPieceInSuperposition(selectedPiece) : false

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
            {/* Global fonts */}
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

            {/* Overlays (flashes, quantum effects, etc.) */}
            <Overlays
                collapseFlash={collapseFlash}
                mergeFlash={mergeFlash}
                partialCollapseFlash={partialCollapseFlash}
                splitMode={splitMode}
                splitFirstTarget={splitFirstTarget}
                quantumElimination={quantumElimination} 
                entanglementFormed={false} 
                entanglementBroken={false} 
                interferenceDetected={false}            />

            {/* Dynamic Header: Title + Turn or Checkmate */}
            <div className="mb-12 text-center">
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
                            className="text-4xl text-white font-bold"
                        >
                        </p>
                    </div>
                ) : (
                    <>
                        <h1
                            style={{ fontFamily: "var(--font-title)" }}
                            className="text-6xl font-black bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent mb-4 tracking-tight"
                        >
                            CHAOS CHESS
                        </h1>
                        <p
                            style={{ fontFamily: "var(--font-subtitle)" }}
                            className="text-2xl text-cyan-300/90 font-medium tracking-widest uppercase"
                        >
                            {currentTurn === "white" ? "⚡ Cyan Team's Move" : "⚡ Pink Team's Move"}
                        </p>
                    </>
                )}
            </div>

            {/* Main game layout: Board + Side Panel */}
            <div className="flex flex-col items-center justify-center w-full">
                <div className="flex flex-row items-start gap-8 max-w-7xl">
                    <ChessBoard
                        squares={squares}
                        game={game}
                        selectedSquare={selectedSquare}
                        dragState={dragState}
                        isCheck={isCheck}
                        splitMode={splitMode}
                        splitFirstTarget={splitFirstTarget}
                        entanglements={entanglements}
                        onSquareClick={handleSquareClick}                 />

                    <SidePanel
                        quantumBranchCount={quantumState.boards.length}
                        activeQuantumLinks={activeQuantumLinks}
                        interferenceCount={interferenceCount}
                        currentTurn={currentTurn}
                        checkmateWinner={checkmateWinner}
                        selectedSquare={selectedSquare}
                        canSplit={canSplit}
                        canMerge={canMerge}
                        canTogglePhase={canTogglePhase}
                        splitMode={splitMode}
                        piecePhase={piecePhase}
                        onSetPhase={setPiecePhase}
                        onCollapse={collapseQuantumState}
                        onReset={resetToRandomPosition}
                        onResign={handleResign}
                        onSplit={startSplit}
                        onMerge={mergePiece}
                        onTogglePhase={togglePiecePhase}
                        onCancelSplit={cancelSplit}
                        canMeasure={canMeasure}
                        movesUntilMeasurement={movesUntilMeasurement}
                        inQuantumCheck={inQuantumCheck}
                        onAcceptGambit={acceptQuantumGambit}
                    />
                </div>
            </div>
        </div>
    )
}