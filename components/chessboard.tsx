"use client"

import { useState, useEffect } from "react"
import { Chess, Square } from "chess.js"

const PIECE_SHAPES = {
  K: (color: string, strokeColor: string) => (
    <svg viewBox="0 0 45 45" className="w-12 h-12">
      <g fill={color} stroke={strokeColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M 22.5,11.63 L 22.5,6" strokeLinejoin="miter"/>
        <path d="M 20,8 L 25,8" strokeLinejoin="miter"/>
        <path d="M 22.5,25 C 22.5,25 27,17.5 25.5,14.5 C 25.5,14.5 24.5,12 22.5,12 C 20.5,12 19.5,14.5 19.5,14.5 C 18,17.5 22.5,25 22.5,25" strokeLinecap="butt" strokeLinejoin="miter"/>
        <path d="M 12.5,37 C 18,40.5 27,40.5 32.5,37 L 32.5,30 C 32.5,30 41.5,25.5 38.5,19.5 C 34.5,13 25,16 22.5,23.5 L 22.5,27 L 22.5,23.5 C 20,16 10.5,13 6.5,19.5 C 3.5,25.5 12.5,30 12.5,30 L 12.5,37 z"/>
        <path d="M 12.5,30 C 18,27 27,27 32.5,30" fill="none"/>
        <path d="M 12.5,33.5 C 18,30.5 27,30.5 32.5,33.5" fill="none"/>
        <path d="M 12.5,37 C 18,34 27,34 32.5,37" fill="none"/>
      </g>
    </svg>
  ),
  Q: (color: string, strokeColor: string) => (
    <svg viewBox="0 0 45 45" className="w-12 h-12">
      <g fill={color} stroke={strokeColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M 9,26 C 17.5,24.5 30,24.5 36,26 L 38.5,13.5 L 31,25 L 30.7,10.9 L 25.5,24.5 L 22.5,10 L 19.5,24.5 L 14.3,10.9 L 14,25 L 6.5,13.5 L 9,26 z"/>
        <path d="M 9,26 C 9,28 10.5,28 11.5,30 C 12.5,31.5 12.5,31 12,33.5 C 10.5,34.5 11,36 11,36 C 9.5,37.5 11,38.5 11,38.5 C 17.5,39.5 27.5,39.5 34,38.5 C 34,38.5 35.5,37.5 34,36 C 34,36 34.5,34.5 33,33.5 C 32.5,31 32.5,31.5 33.5,30 C 34.5,28 36,28 36,26 C 27.5,24.5 17.5,24.5 9,26 z"/>
        <path d="M 11.5,30 C 15,29 30,29 33.5,30" fill="none"/>
        <path d="M 12,33.5 C 18,32.5 27,32.5 33,33.5" fill="none"/>
        <circle cx="6" cy="12" r="2"/>
        <circle cx="14" cy="9" r="2"/>
        <circle cx="22.5" cy="8" r="2"/>
        <circle cx="31" cy="9" r="2"/>
        <circle cx="39" cy="12" r="2"/>
      </g>
    </svg>
  ),
  R: (color: string, strokeColor: string) => (
    <svg viewBox="0 0 45 45" className="w-12 h-12">
      <g fill={color} stroke={strokeColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M 9,39 L 36,39 L 36,36 L 9,36 L 9,39 z" strokeLinecap="butt"/>
        <path d="M 12,36 L 12,32 L 33,32 L 33,36 L 12,36 z" strokeLinecap="butt"/>
        <path d="M 11,14 L 11,9 L 15,9 L 15,11 L 20,11 L 20,9 L 25,9 L 25,11 L 30,11 L 30,9 L 34,9 L 34,14" strokeLinecap="butt"/>
        <path d="M 34,14 L 31,17 L 14,17 L 11,14"/>
        <path d="M 31,17 L 31,29.5 L 14,29.5 L 14,17" strokeLinecap="butt" strokeLinejoin="miter"/>
        <path d="M 31,29.5 L 32.5,32 L 12.5,32 L 14,29.5"/>
        <path d="M 11,14 L 34,14" fill="none" strokeLinejoin="miter"/>
      </g>
    </svg>
  ),
  B: (color: string, strokeColor: string) => (
    <svg viewBox="0 0 45 45" className="w-12 h-12">
      <g fill={color} stroke={strokeColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M 9,36 C 12.39,35.03 19.11,36.43 22.5,34 C 25.89,36.43 32.61,35.03 36,36 C 36,36 37.65,36.54 39,38 C 38.32,38.97 37.35,38.99 36,38.5 C 32.61,37.53 25.89,38.96 22.5,37.5 C 19.11,38.96 12.39,37.53 9,38.5 C 7.65,38.99 6.68,38.97 6,38 C 7.35,36.54 9,36 9,36 z"/>
        <path d="M 15,32 C 17.5,34.5 27.5,34.5 30,32 C 30.5,30.5 30,30 30,30 C 30,27.5 27.5,26 27.5,26 C 33,24.5 33.5,14.5 22.5,10.5 C 11.5,14.5 12,24.5 17.5,26 C 17.5,26 15,27.5 15,30 C 15,30 14.5,30.5 15,32 z"/>
        <path d="M 25 8 A 2.5 2.5 0 1 1 20,8 A 2.5 2.5 0 1 1 25 8 z"/>
        <path d="M 17.5,26 L 27.5,26 M 15,30 L 30,30 M 22.5,15.5 L 22.5,20.5 M 20,18 L 25,18" fill="none" strokeLinejoin="miter"/>
      </g>
    </svg>
  ),
  N: (color: string, strokeColor: string) => (
    <svg viewBox="0 0 45 45" className="w-12 h-12">
      <g fill={color} stroke={strokeColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M 22,10 C 32.5,11 38.5,18 38,39 L 15,39 C 15,30 25,32.5 23,18" fill="none"/>
        <path d="M 24,18 C 24.38,20.91 18.45,25.37 16,27 C 13,29 13.18,31.34 11,31 C 9.958,30.06 12.41,27.96 11,28 C 10,28 11.19,29.23 10,30 C 9,30 5.997,31 6,26 C 6,24 12,14 12,14 C 12,14 13.89,12.1 14,10.5 C 13.27,9.506 13.5,8.5 13.5,7.5 C 14.5,6.5 16.5,10 16.5,10 L 18.5,10 C 18.5,10 19.28,8.008 21,7 C 22,7 22,10 22,10"/>
        <path d="M 9.5 25.5 A 0.5 0.5 0 1 1 8.5,25.5 A 0.5 0.5 0 1 1 9.5 25.5 z" fill={strokeColor}/>
        <path d="M 15 15.5 A 0.5 1.5 0 1 1 14,15.5 A 0.5 1.5 0 1 1 15 15.5 z" transform="matrix(0.866,0.5,-0.5,0.866,9.693,-5.173)" fill={strokeColor}/>
      </g>
    </svg>
  ),
  P: (color: string, strokeColor: string) => (
    <svg viewBox="0 0 45 45" className="w-10 h-10">
      <g fill={color} stroke={strokeColor} strokeWidth="1.5" strokeLinecap="round">
        <circle cx="22.5" cy="9" r="4.5"/>
        <path d="M 22.5,13.5 C 18,13.5 14.5,17 14.5,20.5 L 14.5,23 C 14.5,25 15.5,26 15.5,26 L 29.5,26 C 29.5,26 30.5,25 30.5,23 L 30.5,20.5 C 30.5,17 27,13.5 22.5,13.5 z"/>
        <path d="M 11.5,30 C 15,29 30,29 33.5,30 M 11.5,33.5 C 15,32.5 30,32.5 33.5,33.5 M 11.5,37 C 15,36 30,36 33.5,37"/>
      </g>
    </svg>
  )
}

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"]
const RANKS = ["8", "7", "6", "5", "4", "3", "2", "1"]

interface BoardSquare {
  file: number
  rank: number
  piece: string | null
}

interface DragState {
  square: { file: number; rank: number } | null
  validMoves: string[]
}

const BALANCED_POSITIONS = [
  "8/5k2/3ppp2/8/8/3PPP2/5K2/8 w - - 0 1",
  "2b1kb2/4p3/8/8/8/8/4P3/2B1KB2 w - - 0 1",
  "n1n3k1/p7/8/8/8/8/P7/N1N3K1 w - - 0 1",
  "r6k/ppp5/8/8/8/8/5PPP/K6R w - - 0 1",
  "5k2/2pppp2/8/8/8/8/2PPPP2/2B1KB2 w - - 0 1",
  "1nb1kbn1/4p3/8/8/8/8/4P3/1NB1KBN1 w - - 0 1",
  "rn4k1/p7/8/8/8/8/P7/RN4K1 w - - 0 1",
  "b1b3k1/p1p5/8/8/8/8/5P1P/1K3B1B w - - 0 1",
  "nn4k1/p7/8/8/8/8/P7/NN4K1 w - - 0 1",
  "r1r3k1/p1p5/8/8/8/8/5P1P/1K3R1R w - - 0 1",
  "rb4k1/p7/8/8/8/8/P7/RB4K1 w - - 0 1",
  "6k1/ppppp3/8/8/8/8/3PPPPP/1K6 w - - 0 1"
]

export default function QuantumChess() {
  const [game, setGame] = useState<Chess>(new Chess())
  const [squares, setSquares] = useState<BoardSquare[]>([])
  const [selectedSquare, setSelectedSquare] = useState<{ file: number; rank: number } | null>(null)
  const [dragState, setDragState] = useState<DragState>({ square: null, validMoves: [] })
  const [isDragging, setIsDragging] = useState(false)
  const [isCheck, setIsCheck] = useState(false)
  const [checkmateWinner, setCheckmateWinner] = useState<"Cyan" | "Pink" | null>(null)

  useEffect(() => {
    const newGame = new Chess()
    const randomFen = BALANCED_POSITIONS[Math.floor(Math.random() * BALANCED_POSITIONS.length)]
    newGame.load(randomFen)
    setGame(newGame)
    updateSquaresFromGame(newGame)
    detectCheckAndCheckmate(newGame)
  }, [])

  const updateSquaresFromGame = (gameInstance: Chess) => {
    const board = gameInstance.board()
    const newSquares: BoardSquare[] = []

    board.forEach((row, rankIndex) => {
      row.forEach((square, fileIndex) => {
        if (square) {
          const pieceType = square.type.toUpperCase()
          const piece = square.color === 'w' ? pieceType : pieceType.toLowerCase()
          newSquares.push({
            file: fileIndex,
            rank: 7 - rankIndex,
            piece: piece
          })
        } else {
          newSquares.push({
            file: fileIndex,
            rank: 7 - rankIndex,
            piece: null
          })
        }
      })
    })

    setSquares(newSquares)
  }

  const fileToLetter = (file: number) => FILES[file]
  const rankToNumber = (rank: number) => (rank + 1).toString()
  const squareToNotation = (file: number, rank: number) =>
    `${fileToLetter(file)}${rankToNumber(rank)}`

  const getValidMoves = (file: number, rank: number): string[] => {
    const square = squareToNotation(file, rank)
    const moves = game.moves({ square: square as Square, verbose: true })
    return moves.map(move => move.to)
  }

  const resetToRandomPosition = () => {
    const newGame = new Chess()
    const randomFen = BALANCED_POSITIONS[Math.floor(Math.random() * BALANCED_POSITIONS.length)]
    newGame.load(randomFen)
    setGame(newGame)
    updateSquaresFromGame(newGame)
    setSelectedSquare(null)
    setDragState({ square: null, validMoves: [] })
  }

  const handleMouseDown = (file: number, rank: number) => {
    const clickedSquare = squares.find((s) => s.file === file && s.rank === rank)
    if (!clickedSquare?.piece) return

    const pieceIsWhite = clickedSquare.piece === clickedSquare.piece.toUpperCase()
    const currentTurn = game.turn() === 'w' ? 'white' : 'black'
    const canSelect = (currentTurn === "white" && pieceIsWhite) || (currentTurn === "black" && !pieceIsWhite)

    if (canSelect) {
      const validMoves = getValidMoves(file, rank)
      setDragState({ square: { file, rank }, validMoves })
      setIsDragging(true)
    }
  }

  const handleMouseUp = (file: number, rank: number) => {
    if (!isDragging || !dragState.square) {
      setIsDragging(false)
      setDragState({ square: null, validMoves: [] })
      return
    }

    const from = squareToNotation(dragState.square.file, dragState.square.rank)
    const to = squareToNotation(file, rank)

    try {
      const move = game.move({ from, to, promotion: 'q' })
      if (move) {
        setGame(new Chess(game.fen()))
        updateSquaresFromGame(game)
        detectCheckAndCheckmate(game)
      }
    } catch (e) {
      // Invalid move
    }

    setIsDragging(false)
    setDragState({ square: null, validMoves: [] })
    setSelectedSquare(null)
  }

  const handleSquareClick = (file: number, rank: number) => {
    const clickedSquare = squares.find((s) => s.file === file && s.rank === rank)

    if (selectedSquare) {
      const from = squareToNotation(selectedSquare.file, selectedSquare.rank)
      const to = squareToNotation(file, rank)

      try {
        const move = game.move({ from, to, promotion: 'q' })
        if (move) {
          setGame(new Chess(game.fen()))
          updateSquaresFromGame(game)
          detectCheckAndCheckmate(game)
        }
      } catch (e) {
        // Invalid move
      }

      setSelectedSquare(null)
    } else if (clickedSquare?.piece) {
      const pieceIsWhite = clickedSquare.piece === clickedSquare.piece.toUpperCase()
      const currentTurn = game.turn() === 'w' ? 'white' : 'black'
      const canSelect = (currentTurn === "white" && pieceIsWhite) || (currentTurn === "black" && !pieceIsWhite)

      if (canSelect) {
        setSelectedSquare({ file, rank })
      }
    }
  }

  const isValidMoveTarget = (file: number, rank: number) => {
    const notation = squareToNotation(file, rank)
    return dragState.validMoves.includes(notation) ||
      (selectedSquare && getValidMoves(selectedSquare.file, selectedSquare.rank).includes(notation))
  }

  const isSelectedSquare = (file: number, rank: number) =>
    selectedSquare?.file === file && selectedSquare?.rank === rank ||
    dragState.square?.file === file && dragState.square?.rank === rank

  const currentTurn = game.turn() === 'w' ? 'white' : 'black'

  const renderPiece = (pieceSymbol: string) => {
    const upperSymbol = pieceSymbol.toUpperCase()
    const isWhite = pieceSymbol === upperSymbol
    
    // Cyberpunk/esports colors - neon cyan for white, bright magenta for black
    const fillColor = isWhite ? "#00e5ff" : "#FF40A0" // Changed from #ff0080
    const strokeColor = isWhite ? "#00ffff" : "#FF80C0" // Changed from #ff1493
    
    const PieceComponent = PIECE_SHAPES[upperSymbol as keyof typeof PIECE_SHAPES]
    return PieceComponent ? PieceComponent(fillColor, strokeColor) : null
  }

  const detectCheckAndCheckmate = (gameInstance: Chess) => {
    const inCheck = gameInstance.inCheck()
    setIsCheck(inCheck)

    if (inCheck && gameInstance.isGameOver()) {
      const winner = gameInstance.turn() === 'w' ? "Pink" : "Cyan"
      setCheckmateWinner(winner)
    } else {
      setCheckmateWinner(null)
    }
  }

  return (
    <div 
        className="min-h-screen flex flex-col items-center justify-center p-6" 
        style={{ 
            // 1. Background Image Controls
            backgroundImage: "url('https://images.unsplash.com/photo-1695390472716-815085e401a2?q=80&w=1374&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            
            // NEW: Add an overlay using linear-gradient for brightness/transparency control
            backgroundBlendMode: 'overlay', // or multiply, hard-light, etc., experiment!
            backgroundColor: 'rgba(0, 0, 0, 0.5)', // Adjust the alpha (0.4) for general brightness/darkness. Lower is brighter.
        }}
    >
        
      <style jsx global>{`
        // Existing Global Font
        @import url('https://fonts.googleapis.com/css2?family=Climate+Crisis:wght@400;500;600;700&display=swap');
        
        // NEW: Imported Futuristic Fonts (Examples from your link)
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&family=Bebas+Neue&family=Space+Grotesk:wght@300;400;500;600;700&display=swap');
        
        body {
          font-family: 'Climate Crisis', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        
        // Define new CSS variables for the fonts for easy use
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
              QUANTUM CHAOS CHESS
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

                  return (
                    <button
                      key={`${file}-${rank}`}
                      onClick={() => handleSquareClick(file, rank)}
                      onMouseDown={() => handleMouseDown(file, rank)}
                      onMouseUp={() => handleMouseUp(file, rank)}
                      className={`w-[70px] h-[70px] relative flex items-center justify-center transition-all duration-150 ${
                        isSelected ? "ring-4 ring-cyan-400 ring-inset" : ""
                      } ${isValidMove ? "ring-3 ring-fuchsia-400 ring-inset" : ""}`}
                      style={{
                        background: isLight 
                          ? "linear-gradient(135deg, #1e293b 0%, #334155 100%)" 
                          : "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)",
                        boxShadow: isCheck && 
                        square?.piece && 
                        ((game.turn() === 'w' && square.piece === 'K') || 
                        (game.turn() === 'b' && square.piece === 'k')) 
                        ? "0 0 30px 8px rgba(255, 0, 51, 0.8) inset, 0 0 40px rgba(255, 0, 51, 0.4)" 
                        : "",
                      }}
                    >
                      {isValidMove && !square?.piece && (
                        <div className="absolute w-3 h-3 rounded-full bg-fuchsia-400/70 shadow-lg shadow-fuchsia-400/50" />
                      )}
                      {square?.piece && (
                        <div
                          className={`flex items-center justify-center transition-opacity duration-150 ${
                            isDragging && dragState.square?.file === file && dragState.square?.rank === rank ? 'opacity-40' : ''
                          }`}
                          style={{
                            filter: square.piece === square.piece.toUpperCase() 
                              ? 'drop-shadow(0 0 8px rgba(0, 229, 255, 0.8))' 
                              : 'drop-shadow(0 0 10px rgba(255, 102, 178, 0.8))', 
                            cursor: 'grab',
                          }}
                        >
                          {renderPiece(square.piece)}
                        </div>
                      )}
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

        <div className="flex flex-col gap-5 w-full lg:w-80 bg-slate-900/70 backdrop-blur-md rounded-xl p-6 border-2 border-cyan-500/30 shadow-xl" style={{ boxShadow: "0 0 30px rgba(6, 182, 212, 0.2)" }}>
          <div className="space-y-3">
            <h2 
              // 2. Font Change (Applied to Sidebar Header)
              style={{ fontFamily: "var(--font-title)" }} 
              className="text-cyan-400 text-lg font-bold tracking-wide mb-4 text-center"
            >
              GAME MODE
            </h2>

            <button
              onClick={resetToRandomPosition}
              className="w-full px-6 py-3.5 bg-slate-800/70 hover:bg-slate-700/70 text-cyan-300 hover:text-cyan-400 font-medium rounded-lg transition-all duration-200 border border-cyan-500/30 hover:border-cyan-400/50 hover:shadow-lg hover:shadow-cyan-400/20"
              style={{ fontFamily: "var(--font-body)" }} // Font Change
            >
              Player vs Player
            </button>

            <button
              onClick={resetToRandomPosition}
              className="w-full px-6 py-3.5 bg-slate-800/70 hover:bg-slate-700/70 text-fuchsia-300 hover:text-fuchsia-400 font-medium rounded-lg transition-all duration-200 border border-fuchsia-500/30 hover:border-fuchsia-400/50 hover:shadow-lg hover:shadow-fuchsia-400/20"
              style={{ fontFamily: "var(--font-body)" }} // Font Change
            >
              Player vs AI
            </button>

            <button
              onClick={resetToRandomPosition}
              className="w-full px-6 py-3.5 bg-slate-800/70 hover:bg-slate-700/70 text-purple-300 hover:text-purple-400 font-medium rounded-lg transition-all duration-200 border border-purple-500/30 hover:border-purple-400/50 hover:shadow-lg hover:shadow-purple-400/20"
              style={{ fontFamily: "var(--font-body)" }} // Font Change
            >
              AI vs AI
            </button>
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent"></div>

          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-300" style={{ fontFamily: "var(--font-body)" }}>Current Turn:</span> {/* Font Change */}
              <span className="font-semibold" style={{ color: currentTurn === "white" ? "#00e5ff" : "#ff0080", fontFamily: "var(--font-body)" }}>
                {currentTurn === "white" ? "⚡ Cyan" : "⚡ Pink"}
              </span>
            </div>
            <div className="text-xs text-slate-400 text-center leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
              Random balanced starting positions from classical chess theory
            </div>
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent"></div>

          <button
            onClick={() => {
              const winner = currentTurn === "white" ? "Pink" : "Cyan"
              setCheckmateWinner(winner)
            }}
            className="w-full px-6 py-3 bg-red-900/40 hover:bg-red-800/60 text-red-300 font-medium rounded-lg transition-all duration-200 border border-red-500/40 hover:border-red-400/70 hover:shadow-lg hover:shadow-red-400/30"
            style={{ fontFamily: "var(--font-body)" }}
            disabled={!!checkmateWinner}
          >
            Resign
          </button> 

          <button
            onClick={resetToRandomPosition}
            className="w-full px-6 py-3 bg-slate-800/60 hover:bg-slate-700/70 text-cyan-400 font-medium rounded-lg transition-all duration-200 border border-cyan-400/40 hover:border-cyan-400/60 hover:shadow-lg hover:shadow-cyan-400/20"
            style={{ fontFamily: "var(--font-body)" }} // Font Change
          >
            🎲 New Random Position
          </button>
        </div>
      </div>
    </div>
  )
}