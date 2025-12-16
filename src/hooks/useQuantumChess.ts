import { useState, useEffect, useCallback } from "react"
import { Chess } from "chess.js"
import { BALANCED_POSITIONS } from "../chess/positions"
import { BoardSquare, DragState } from "../chess/types"
import { squareToNotation, getValidMoves } from "../chess/boardUtils"
import { QuantumState, pickCollapseIndex, getPieceProbabilities, normalizeAmplitudes } from "../quantum/quantumState"
import { performQuantumMove, performSplitMove } from "../quantum/quantumMoves"

export function useQuantumChess() {
    // ===== CORE STATE =====
    const [quantumState, setQuantumState] = useState<QuantumState>({ boards: [], amplitudes: [] })
    const [game, setGame] = useState<Chess>(new Chess())
    const [squares, setSquares] = useState<BoardSquare[]>([])
    const [selectedSquare, setSelectedSquare] = useState<{ file: number; rank: number } | null>(null)
    const [dragState, setDragState] = useState<DragState>({ square: null, validMoves: [] })
    const [isDragging, setIsDragging] = useState(false)
    const [isCheck, setIsCheck] = useState(false)
    const [checkmateWinner, setCheckmateWinner] = useState<"Cyan" | "Pink" | null>(null)

    // ===== QUANTUM UI STATE =====
    const [splitMode, setSplitMode] = useState(false)
    const [splitSource, setSplitSource] = useState<string | null>(null)
    const [splitFirstTarget, setSplitFirstTarget] = useState<string | null>(null)

    // ===== VISUAL FEEDBACK =====
    const [collapseFlash, setCollapseFlash] = useState(false)
    const [mergeFlash, setMergeFlash] = useState(false)
    const [partialCollapseFlash, setPartialCollapseFlash] = useState(false)
    const [quantumElimination, setQuantumElimination] = useState<"Cyan" | "Pink" | null>(null)

    // ===== HELPER: Update squares from quantum state =====
    const updateSquaresFromQuantumState = useCallback((state: QuantumState) => {
        const probabilities = getPieceProbabilities(state)
        const newSquares: BoardSquare[] = []

        for (let rank = 0; rank < 8; rank++) {
            for (let file = 0; file < 8; file++) {
                const notation = squareToNotation(file, rank)
                const piecesAtSquare = probabilities.get(notation)
                const piecesArray: Array<{ piece: string; probability: number }> = []

                if (piecesAtSquare) {
                    piecesAtSquare.forEach((prob, piece) => {
                        piecesArray.push({ piece, probability: prob })
                    })
                }

                newSquares.push({ file, rank, pieces: piecesArray })
            }
        }

        setSquares(newSquares)
    }, [])

    // ===== HELPER: Update squares from single game =====
    const updateSquaresFromGame = useCallback((gameInstance: Chess) => {
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
                        pieces: [{ piece, probability: 1.0 }]
                    })
                } else {
                    newSquares.push({
                        file: fileIndex,
                        rank: 7 - rankIndex,
                        pieces: []
                    })
                }
            })
        })

        setSquares(newSquares)
    }, [])

    // ===== HELPER: Check king survival probability =====
    const checkKingSurvival = useCallback((state: QuantumState) => {
        const probabilities = getPieceProbabilities(state)

        // Calculate total survival probability for each king
        let whiteKingProb = 0
        let blackKingProb = 0

        probabilities.forEach((pieceMap) => {
            pieceMap.forEach((prob, piece) => {
                if (piece === 'K') whiteKingProb += prob
                if (piece === 'k') blackKingProb += prob
            })
        })

        // If either king has near-zero probability, that color loses
        if (whiteKingProb <= 0.01) {
            setQuantumElimination("Cyan")
            return "Cyan" // Pink wins
        }
        if (blackKingProb <= 0.01) {
            setQuantumElimination("Pink")
            return "Pink" // Cyan wins
        }

        return null
    }, [])

    // ===== HELPER: Detect check/checkmate =====
    const detectCheckAndCheckmate = useCallback((gameInstance: Chess) => {
        const inCheck = gameInstance.inCheck()
        setIsCheck(inCheck)

        if (inCheck && gameInstance.isGameOver()) {
            const winner = gameInstance.turn() === 'w' ? "Pink" : "Cyan"
            setCheckmateWinner(winner)
        } else {
            setCheckmateWinner(null)
        }
    }, [])

    // ===== HELPER: Check if piece is in superposition =====
    const isPieceInSuperposition = useCallback((piece: string): boolean => {
        if (quantumState.boards.length <= 1) return false

        const probabilities = getPieceProbabilities(quantumState)
        let totalProb = 0

        probabilities.forEach((pieceMap) => {
            pieceMap.forEach((prob, p) => {
                if (p === piece) totalProb += prob
            })
        })

        // If piece exists at < 100% probability somewhere, it's in superposition
        return totalProb < 0.99 && totalProb > 0.01
    }, [quantumState])

    // ===== INITIALIZATION =====
    useEffect(() => {
        resetToRandomPosition()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // ===== ACTIONS =====
    const resetToRandomPosition = () => {
        const newGame = new Chess()
        const randomFen = BALANCED_POSITIONS[Math.floor(Math.random() * BALANCED_POSITIONS.length)]
        newGame.load(randomFen)
        setGame(newGame)

        const initialState = {
            boards: [new Chess(randomFen)],
            amplitudes: [1.0]
        }
        setQuantumState(initialState)

        updateSquaresFromGame(newGame)
        setSelectedSquare(null)
        setDragState({ square: null, validMoves: [] })
        setSplitMode(false)
        setSplitSource(null)
        setSplitFirstTarget(null)

        setCheckmateWinner(null)
        setQuantumElimination(null)
        setIsCheck(false)
    }

    // ===== MEASURE REALITY (full collapse) =====
    const collapseQuantumState = () => {
        if (quantumState.boards.length === 0) return

        const selectedIndex = pickCollapseIndex(quantumState.amplitudes)
        const collapsedBoard = new Chess(quantumState.boards[selectedIndex].fen())

        const newState = {
            boards: [collapsedBoard],
            amplitudes: [1.0]
        }
        setQuantumState(newState)
        setGame(collapsedBoard)
        updateSquaresFromGame(collapsedBoard)
        detectCheckAndCheckmate(collapsedBoard)
        checkKingSurvival(newState)

        // Flash effect
        setCollapseFlash(true)
        setTimeout(() => setCollapseFlash(false), 1000)
    }

    // ===== START SPLIT MODE =====
    const startSplit = () => {
        if (!selectedSquare) return

        const square = squares.find(s => s.file === selectedSquare.file && s.rank === selectedSquare.rank)
        if (!square || square.pieces.length === 0) return

        const piece = square.pieces[0].piece
        if (piece.toUpperCase() === 'P') return // Can't split pawns

        const from = squareToNotation(selectedSquare.file, selectedSquare.rank)
        setSplitSource(from)
        setSplitMode(true)
        setSplitFirstTarget(null)

        // Calculate valid moves for highlighting
        const validMoves = getValidMoves(game, selectedSquare.file, selectedSquare.rank)
        setDragState({ square: selectedSquare, validMoves })
    }

    // ===== CANCEL SPLIT =====
    const cancelSplit = () => {
        setSplitMode(false)
        setSplitSource(null)
        setSplitFirstTarget(null)
        setSelectedSquare(null)
        setDragState({ square: null, validMoves: [] })
    }

    // ===== MERGE (collapse piece superposition) =====
    const mergePiece = () => {
        // Simple implementation: collapse entire quantum state to highest probability
        if (quantumState.boards.length <= 1) return

        // Find board with highest amplitude
        let maxIdx = 0
        let maxAmp = 0
        quantumState.amplitudes.forEach((amp, idx) => {
            if (amp * amp > maxAmp * maxAmp) {
                maxAmp = amp
                maxIdx = idx
            }
        })

        const collapsedBoard = new Chess(quantumState.boards[maxIdx].fen())
        const newState = {
            boards: [collapsedBoard],
            amplitudes: [1.0]
        }

        setQuantumState(newState)
        setGame(collapsedBoard)
        updateSquaresFromGame(collapsedBoard)
        detectCheckAndCheckmate(collapsedBoard)
        checkKingSurvival(newState)

        // Merge flash effect
        setMergeFlash(true)
        setTimeout(() => setMergeFlash(false), 1000)

        setSelectedSquare(null)
    }

    // ===== HANDLE RESIGN =====
    const handleResign = () => {
        const winner = game.turn() === 'w' ? "Pink" : "Cyan"
        setCheckmateWinner(winner)
    }

    // ===== HANDLE SQUARE CLICK =====
    const handleSquareClick = (file: number, rank: number, event?: React.MouseEvent) => {
        const clickedSquare = squares.find((s) => s.file === file && s.rank === rank)

        // === SPLIT MODE: Select targets ===
        if (splitMode && splitSource) {
            const to = squareToNotation(file, rank)

            if (!splitFirstTarget) {
                // First target selection
                if (dragState.validMoves.includes(to)) {
                    setSplitFirstTarget(to)
                }
                return
            } else {
                // Second target selection - complete split
                if (dragState.validMoves.includes(to) && to !== splitFirstTarget) {
                    const newState = performSplitMove(quantumState, splitSource, splitFirstTarget, to)

                    if (newState) {
                        setQuantumState(newState)
                        setGame(new Chess(newState.boards[0].fen()))
                        updateSquaresFromQuantumState(newState)
                        detectCheckAndCheckmate(newState.boards[0])
                        checkKingSurvival(newState)
                    }
                }

                // Reset split mode
                setSplitMode(false)
                setSplitSource(null)
                setSplitFirstTarget(null)
                setSelectedSquare(null)
                setDragState({ square: null, validMoves: [] })
                return
            }
        }

        // === NORMAL MODE: Move or select ===
        if (selectedSquare) {
            const from = squareToNotation(selectedSquare.file, selectedSquare.rank)
            const to = squareToNotation(file, rank)

            const newState = performQuantumMove(quantumState, from, to)
            if (newState) {
                // Check for auto-collapse (single board remaining)
                if (newState.boards.length === 1) {
                    setQuantumState(newState)
                    setGame(new Chess(newState.boards[0].fen()))
                    updateSquaresFromGame(newState.boards[0])
                } else if (newState.boards.length < quantumState.boards.length) {
                    // Partial collapse happened
                    setPartialCollapseFlash(true)
                    setTimeout(() => setPartialCollapseFlash(false), 500)
                    setQuantumState(newState)
                    setGame(new Chess(newState.boards[0].fen()))
                    updateSquaresFromQuantumState(newState)
                } else {
                    setQuantumState(newState)
                    setGame(new Chess(newState.boards[0].fen()))
                    updateSquaresFromQuantumState(newState)
                }

                detectCheckAndCheckmate(newState.boards[0])
                checkKingSurvival(newState)
            }

            setSelectedSquare(null)
            setDragState({ square: null, validMoves: [] })
        } else if (clickedSquare && clickedSquare.pieces.length > 0) {
            const firstPiece = clickedSquare.pieces[0].piece
            const pieceIsWhite = firstPiece === firstPiece.toUpperCase()
            const currentTurn = game.turn() === 'w' ? 'white' : 'black'
            const canSelect = (currentTurn === "white" && pieceIsWhite) || (currentTurn === "black" && !pieceIsWhite)

            if (canSelect) {
                setSelectedSquare({ file, rank })

                // Calculate valid moves
                const validMoves = getValidMoves(game, file, rank)
                setDragState({ square: { file, rank }, validMoves })
            }
        } else {
            // Click on empty square or opponent piece - deselect
            setSelectedSquare(null)
            setDragState({ square: null, validMoves: [] })
        }
    }

    // ===== HANDLE MOUSE DOWN (for drag) =====
    const handleMouseDown = (file: number, rank: number) => {
        if (splitMode) return // Don't drag during split mode

        const clickedSquare = squares.find((s) => s.file === file && s.rank === rank)
        if (!clickedSquare || clickedSquare.pieces.length === 0) return

        const firstPiece = clickedSquare.pieces[0].piece
        const pieceIsWhite = firstPiece === firstPiece.toUpperCase()
        const currentTurn = game.turn() === 'w' ? 'white' : 'black'
        const canSelect = (currentTurn === "white" && pieceIsWhite) || (currentTurn === "black" && !pieceIsWhite)

        if (canSelect) {
            const validMoves = getValidMoves(game, file, rank)
            setDragState({ square: { file, rank }, validMoves })
            setIsDragging(true)
        }
    }

    // ===== HANDLE MOUSE UP (complete drag move) =====
    const handleMouseUp = (file: number, rank: number) => {
        if (!isDragging || !dragState.square) {
            setIsDragging(false)
            setDragState({ square: null, validMoves: [] })
            return
        }

        const from = squareToNotation(dragState.square.file, dragState.square.rank)
        const to = squareToNotation(file, rank)

        // Normal drag move
        const newState = performQuantumMove(quantumState, from, to)
        if (newState) {
            if (newState.boards.length === 1) {
                setQuantumState(newState)
                setGame(new Chess(newState.boards[0].fen()))
                updateSquaresFromGame(newState.boards[0])
            } else if (newState.boards.length < quantumState.boards.length) {
                setPartialCollapseFlash(true)
                setTimeout(() => setPartialCollapseFlash(false), 500)
                setQuantumState(newState)
                setGame(new Chess(newState.boards[0].fen()))
                updateSquaresFromQuantumState(newState)
            } else {
                setQuantumState(newState)
                setGame(new Chess(newState.boards[0].fen()))
                updateSquaresFromQuantumState(newState)
            }

            detectCheckAndCheckmate(newState.boards[0])
            checkKingSurvival(newState)
        }

        setIsDragging(false)
        setDragState({ square: null, validMoves: [] })
        setSelectedSquare(null)
    }



    return {
        // Core state
        game,
        squares,
        quantumState,
        selectedSquare,
        dragState,
        isDragging,
        isCheck,
        checkmateWinner,
        quantumElimination,

        // Quantum UI state

        splitMode,
        splitFirstTarget,

        // Visual feedback
        collapseFlash,
        mergeFlash,
        partialCollapseFlash,

        // Handlers
        handleMouseDown,
        handleMouseUp,
        handleSquareClick,
        resetToRandomPosition,
        collapseQuantumState,
        handleResign,

        // Split/Merge actions
        startSplit,
        cancelSplit,
        mergePiece,
        isPieceInSuperposition
    }
}
