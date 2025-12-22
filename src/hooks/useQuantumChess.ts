import { useState, useEffect, useCallback, useRef } from "react"
import { Chess } from "chess.js"
import { BALANCED_POSITIONS } from "../chess/positions"
import { BoardSquare, DragState, QuantumCheckInfo } from "../chess/types"
import { squareToNotation, getValidMoves } from "../chess/boardUtils"
import { QuantumState, pickCollapseIndex, getPieceProbabilities, normalizeAmplitudes } from "../quantum/quantumState"
import { performQuantumMove, performSplitMove, flipPiecePhase, getQuantumValidMoves } from "../quantum/quantumMoves"
import { countPieceCopiesAtLocation, detectEntanglements, identifyPieceCopies } from "../quantum/entanglementDetection"

export interface PhaseSplitConfig {
    source: string
    target1: string
    target2: string
    phases: { [square: string]: 'positive' | 'negative' }
}

export function useQuantumChess() {
    // ===== CORE STATE =====
    const [quantumState, setQuantumState] = useState<QuantumState>({ boards: [], amplitudes: [] })
    const [game, setGame] = useState<Chess>(new Chess())
    const [squares, setSquares] = useState<BoardSquare[]>([])
    const [selectedSquare, setSelectedSquare] = useState<{ file: number; rank: number } | null>(null)
    const [dragState, setDragState] = useState<DragState>({ square: null, validMoves: [] })
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
    const [entanglementFormed, setEntanglementFormed] = useState(false)
    const [entanglementBroken, setEntanglementBroken] = useState(false)


    // ADD: Check if in quantum check (by superposed piece)
    const checkQuantumCheck = useCallback((state: QuantumState): void => {
        // FIXED: Only check if there are multiple boards (actual superposition exists)
        if (state.boards.length <= 1) {
            setInQuantumCheck(null)
            return
        }

        const probabilities = getPieceProbabilities(state)
        const currentColor = game.turn()
        const kingPiece = currentColor === 'w' ? 'K' : 'k'
        
        let kingSquare: string | null = null
        probabilities.forEach((pieceMap, square) => {
            if (pieceMap.has(kingPiece)) {
                // FIXED: Only consider king if it has high probability at this square
                const kingData = pieceMap.get(kingPiece)!
                if (kingData.prob > 0.8) {
                    kingSquare = square
                }
            }
        })
        
        if (!kingSquare) {
            setInQuantumCheck(null)
            return
        }

        // FIXED: More stringent check - require attacking piece to:
        // 1. Be in superposition (0.1 < prob < 0.9)
        // 2. Actually be able to attack the king square
        let foundCheck = false
        probabilities.forEach((pieceMap, square) => {
            pieceMap.forEach((data, piece) => {
                const pieceColor = piece === piece.toUpperCase() ? 'w' : 'b'
                
                // FIXED: Stricter probability bounds for quantum check
                const isInSuperposition = data.prob > 0.1 && data.prob < 0.9
                
                if (pieceColor !== currentColor && isInSuperposition && !foundCheck) {
                    const file1 = square.charCodeAt(0) - 'a'.charCodeAt(0)
                    const rank1 = parseInt(square[1]) - 1
                    const file2 = kingSquare!.charCodeAt(0) - 'a'.charCodeAt(0)
                    const rank2 = parseInt(kingSquare![1]) - 1
                    
                    const sameFile = file1 === file2
                    const sameRank = rank1 === rank2
                    const sameDiag = Math.abs(file1 - file2) === Math.abs(rank1 - rank2)
                    
                    const pieceType = piece.toUpperCase()
                    
                    // More precise attack detection
                    let canAttack = false
                    if (pieceType === 'Q') {
                        canAttack = sameFile || sameRank || sameDiag
                    } else if (pieceType === 'R') {
                        canAttack = sameFile || sameRank
                    } else if (pieceType === 'B') {
                        canAttack = sameDiag
                    } else if (pieceType === 'N') {
                        const fileDiff = Math.abs(file1 - file2)
                        const rankDiff = Math.abs(rank1 - rank2)
                        canAttack = (fileDiff === 2 && rankDiff === 1) || (fileDiff === 1 && rankDiff === 2)
                    } else if (pieceType === 'P') {
                        const direction = pieceColor === 'w' ? 1 : -1
                        const fileDiff = Math.abs(file1 - file2)
                        canAttack = fileDiff === 1 && (rank2 - rank1) === direction
                    }
                    
                    if (canAttack) {
                        setInQuantumCheck({
                            attackerSquare: square,
                            attackerProbability: data.prob
                        })
                        foundCheck = true
                    }
                }
            })
        })

        if (!foundCheck) {
            setInQuantumCheck(null)
        }
    }, [game])

    // ADD: Accept quantum check gambit (don't move king)
    const acceptQuantumGambit = () => {
        setInQuantumCheck(null)
        setMoveCount(prev => prev + 1)
    }

    // ADD: New state for measurement cooldown
    const [moveCount, setMoveCount] = useState(0)
    const [lastMeasurement, setLastMeasurement] = useState(0)
    const MEASUREMENT_COOLDOWN = 8 // Every 8 ply

    // Quantum check detection
    const [inQuantumCheck, setInQuantumCheck] = useState<QuantumCheckInfo | null>(null)

    const MAX_QUANTUM_PIECES_PER_SIDE = 6

    // ===== HELPER: Update squares from quantum state =====
    const updateSquaresFromQuantumState = useCallback((state: QuantumState) => {
        const probabilities = getPieceProbabilities(state)
        const newSquares: BoardSquare[] = []

        for (let rank = 0; rank < 8; rank++) {
            for (let file = 0; file < 8; file++) {
                const notation = squareToNotation(file, rank)
                const piecesAtSquare = probabilities.get(notation)
                const piecesArray: Array<{ piece: string; probability: number; interference: 'constructive' | 'destructive' | null }> = []

                if (piecesAtSquare) {
                    piecesAtSquare.forEach((data, piece) => {
                        piecesArray.push({ piece, probability: data.prob, interference: data.interference })
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
                        pieces: [{ piece, probability: 1.0, interference: null }]
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
            pieceMap.forEach((data, piece) => {
                if (piece === 'K') whiteKingProb += data.prob
                if (piece === 'k') blackKingProb += data.prob
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
    const isPieceInSuperposition = useCallback((file: number, rank: number): boolean => {
        if (quantumState.boards.length <= 1) return false

        const notation = squareToNotation(file, rank)
        const probabilities = getPieceProbabilities(quantumState)
        const piecesAtSquare = probabilities.get(notation)
        
        if (!piecesAtSquare || piecesAtSquare.size === 0) return false

        // FIXED: Check if ANY piece at this square has prob < 0.99
        let isSuperposed = false
        piecesAtSquare.forEach((data) => {
            if (data.prob < 0.99 && data.prob > 0.01) {
                isSuperposed = true
            }
        })

        return isSuperposed
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

    // MODIFY: collapseQuantumState - Update measurement tracking
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

        setLastMeasurement(moveCount)
        setInQuantumCheck(null)

        setCollapseFlash(true)
        setTimeout(() => setCollapseFlash(false), 1000)
    }

    // MODIFIED: Can measure if in quantum check OR cooldown ready
    const canMeasureNow = useCallback((): boolean => {
        // Always allow measurement if in quantum check
        if (inQuantumCheck) return true
        
        // Otherwise, check cooldown
        return (moveCount - lastMeasurement) >= MEASUREMENT_COOLDOWN
    }, [inQuantumCheck, moveCount, lastMeasurement])

    // ===== START SPLIT MODE =====
    const startSplit = () => {
        if (!canSplitPiece() || !selectedSquare) return

        const from = squareToNotation(selectedSquare.file, selectedSquare.rank)
        setSplitSource(from)
        setSplitMode(true)
        setSplitFirstTarget(null)

        // Get classical valid moves
        let validMoves = getValidMoves(game, selectedSquare.file, selectedSquare.rank)
        
        // If piece is already in superposition, add quantum moves for split targets
        if (isPieceInSuperposition(selectedSquare.file, selectedSquare.rank)) {
            const atomicMoves = getQuantumValidMoves(quantumState, selectedSquare.file, selectedSquare.rank)
            validMoves = Array.from(new Set([...validMoves, ...atomicMoves]))
        }

        // Pawn capture-only adjustment (if needed for your rules)
        const square = squares.find(s => s.file === selectedSquare.file && s.rank === selectedSquare.rank)
        if (square && square.pieces.length > 0) {
            const firstPiece = square.pieces[0].piece
            if (firstPiece.toUpperCase() === 'P') {
                validMoves = validMoves.filter(target => {
                    const targetFile = target.charCodeAt(0) - 'a'.charCodeAt(0)
                    if (targetFile !== selectedSquare.file) {
                        const targetSq = squares.find(s => squareToNotation(s.file, s.rank) === target)
                        return targetSq && targetSq.pieces.length > 0
                    }
                    return true
                })
            }
        }

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
        if (!selectedSquare) return
        if (quantumState.boards.length <= 1) return

        const notation = squareToNotation(selectedSquare.file, selectedSquare.rank)
        
        // FIXED: Collapse only branches where this piece exists at this location
        // Find the branch with highest probability where piece exists at this square
        let maxProb = 0
        let maxIdx = 0
        
        quantumState.boards.forEach((board, idx) => {
            const piece = board.get(notation as any)
            if (piece) {
                const prob = quantumState.amplitudes[idx] ** 2
                if (prob > maxProb) {
                    maxProb = prob
                    maxIdx = idx
                }
            }
        })

        // Collapse to this branch
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

        setMergeFlash(true)
        setTimeout(() => setMergeFlash(false), 1000)

        setSelectedSquare(null)
    }

    // Get current phase of selected piece
    const getSelectedPiecePhase = useCallback((): 'positive' | 'negative' | null => {
        if (!selectedSquare) return null
        const notation = squareToNotation(selectedSquare.file, selectedSquare.rank)

        let netAmplitude = 0
        quantumState.boards.forEach((board, idx) => {
            if (board.get(notation as any)) {
                netAmplitude += quantumState.amplitudes[idx]
            }
        })

        if (Math.abs(netAmplitude) < 0.0001) return null
        return netAmplitude > 0 ? 'positive' : 'negative'
    }, [selectedSquare, quantumState])

    const setPiecePhase = (targetPhase: 'positive' | 'negative') => {
        if (!selectedSquare) return

        const currentPhase = getSelectedPiecePhase()
        if (!currentPhase) return
        if (currentPhase === targetPhase) return

        togglePiecePhase()
    }

    const togglePiecePhase = () => {
        if (!selectedSquare) return

        const notation = squareToNotation(selectedSquare.file, selectedSquare.rank)
        const square = squares.find(s => s.file === selectedSquare.file && s.rank === selectedSquare.rank)
        if (!square || square.pieces.length === 0) return

        const pieceType = square.pieces[0].piece
        const totalCopies = identifyPieceCopies(quantumState.boards, notation)

        if (totalCopies !== 3) return

        const newState = flipPiecePhase(quantumState, notation, pieceType)
        setQuantumState(newState)
        updateSquaresFromQuantumState(newState)
    }
    // MODIFIED: Check if piece can have phase toggled (has 3 copies)
    const canTogglePhase = useCallback((): boolean => {
        if (!selectedSquare) return false
        
        const from = squareToNotation(selectedSquare.file, selectedSquare.rank)
        const square = squares.find(s => s.file === selectedSquare.file && s.rank === selectedSquare.rank)
        if (!square || square.pieces.length === 0) return false

        // FIXED: Count copies at this specific location
        const copiesAtThisLocation = countPieceCopiesAtLocation(quantumState.boards, from)
        
        // Can toggle phase only if piece has exactly 3 copies at this location
        return copiesAtThisLocation === 3
    }, [selectedSquare, quantumState, squares])

    // ===== HANDLE RESIGN =====
    const handleResign = () => {
        const winner = game.turn() === 'w' ? "Pink" : "Cyan"
        setCheckmateWinner(winner)
    }

    // ===== HANDLE SQUARE CLICK =====
    const handleSquareClick = (file: number, rank: number, event?: React.MouseEvent) => {
        const clickedSquare = squares.find((s) => s.file === file && s.rank === rank)
        const to = squareToNotation(file, rank)

        // === SPLIT MODE ===
        if (splitMode && splitSource) {
            if (to === splitSource) {
                cancelSplit()
                return
            }

            if (!splitFirstTarget) {
                if (dragState.validMoves.includes(to)) {
                    setSplitFirstTarget(to)
                    return
                }
                return
            } else {
                if (to === splitFirstTarget) {
                    setSplitFirstTarget(null)
                    return
                }

                if (dragState.validMoves.includes(to) && to !== splitFirstTarget) {
                    const newState = performSplitMove(quantumState, splitSource, splitFirstTarget, to)

                    if (newState) {
                        const eliminatedColor = checkKingSurvival(newState)
                        
                        setQuantumState(newState)
                        setGame(new Chess(newState.boards[0].fen()))
                        updateSquaresFromQuantumState(newState)
                        detectCheckAndCheckmate(newState.boards[0])
                        checkQuantumCheck(newState)
                        
                        if (eliminatedColor && !quantumElimination) {
                            setQuantumElimination(eliminatedColor)
                        }

                        setSplitMode(false)
                        setSplitSource(null)
                        setSplitFirstTarget(null)
                        setSelectedSquare(null)
                        setDragState({ square: null, validMoves: [] })
                        
                        setMoveCount(prev => prev + 1)
                    }
                    return
                }
                return
            }
        }

        // === NORMAL MODE ===
        if (selectedSquare) {
            const from = squareToNotation(selectedSquare.file, selectedSquare.rank)

            if (from === to) {
                setSelectedSquare(null)
                setDragState({ square: null, validMoves: [] })
                return
            }

            if (dragState.validMoves.includes(to)) {
                const oldEntanglementCount = quantumState.entanglements?.length || 0
                const newState = performQuantumMove(quantumState, from, to)

                if (newState) {
                    const newEntanglementCount = newState.entanglements?.length || 0

                    if (newEntanglementCount > oldEntanglementCount) {
                        setEntanglementFormed(true)
                        setTimeout(() => setEntanglementFormed(false), 2000)
                    }

                    if (newEntanglementCount < oldEntanglementCount && oldEntanglementCount > 0) {
                        setEntanglementBroken(true)
                        setTimeout(() => setEntanglementBroken(false), 1500)
                    }

                    const eliminatedColor = checkKingSurvival(newState)

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
                    checkQuantumCheck(newState)
                    
                    if (eliminatedColor && !quantumElimination) {
                        setQuantumElimination(eliminatedColor)
                    }
                    
                    setMoveCount(prev => prev + 1)
                }

                setSelectedSquare(null)
                setDragState({ square: null, validMoves: [] })
            } else {
                // FIXED: Check if clicking on a square with pieces
                if (clickedSquare && clickedSquare.pieces.length > 0) {
                    // FIXED: Check ALL pieces at this square, not just the first one
                    // Find if ANY piece at this square matches the current turn
                    let canSelectAnyPiece = false
                    const currentTurn = game.turn() === 'w' ? 'white' : 'black'
                    
                    for (const pieceData of clickedSquare.pieces) {
                        const piece = pieceData.piece
                        const pieceIsWhite = piece === piece.toUpperCase()
                        const matches = (currentTurn === "white" && pieceIsWhite) || 
                                    (currentTurn === "black" && !pieceIsWhite)
                        if (matches) {
                            canSelectAnyPiece = true
                            break
                        }
                    }

                    if (canSelectAnyPiece) {
                        setSelectedSquare({ file, rank })
                        
                        let validMoves = getValidMoves(game, file, rank)
                        if (isPieceInSuperposition(file, rank)) {
                            const atomicMoves = getQuantumValidMoves(quantumState, file, rank)
                            const mergedMoves = Array.from(new Set([...validMoves, ...atomicMoves]))

                            // Check if ANY piece is a pawn for filtering
                            const hasPawn = clickedSquare.pieces.some(p => p.piece.toUpperCase() === 'P')
                            
                            if (hasPawn) {
                                validMoves = mergedMoves.filter(target => {
                                    const targetFile = target.charCodeAt(0) - 'a'.charCodeAt(0)
                                    if (targetFile !== file) {
                                        const targetSq = squares.find(s => squareToNotation(s.file, s.rank) === target)
                                        return targetSq && targetSq.pieces.length > 0
                                    }
                                    return true
                                })
                            } else {
                                validMoves = mergedMoves
                            }
                        }
                        
                        setDragState({ square: { file, rank }, validMoves })
                        return
                    }
                }
                
                setSelectedSquare(null)
                setDragState({ square: null, validMoves: [] })
            }
        } else if (clickedSquare && clickedSquare.pieces.length > 0) {
            // FIXED: Same fix for initial selection
            let canSelectAnyPiece = false
            const currentTurn = game.turn() === 'w' ? 'white' : 'black'
            
            for (const pieceData of clickedSquare.pieces) {
                const piece = pieceData.piece
                const pieceIsWhite = piece === piece.toUpperCase()
                const matches = (currentTurn === "white" && pieceIsWhite) || 
                            (currentTurn === "black" && !pieceIsWhite)
                if (matches) {
                    canSelectAnyPiece = true
                    break
                }
            }

            if (canSelectAnyPiece) {
                setSelectedSquare({ file, rank })

                let validMoves = getValidMoves(game, file, rank)
                if (isPieceInSuperposition(file, rank)) {
                    const atomicMoves = getQuantumValidMoves(quantumState, file, rank)
                    const mergedMoves = Array.from(new Set([...validMoves, ...atomicMoves]))

                    const hasPawn = clickedSquare.pieces.some(p => p.piece.toUpperCase() === 'P')
                    
                    if (hasPawn) {
                        validMoves = mergedMoves.filter(target => {
                            const targetFile = target.charCodeAt(0) - 'a'.charCodeAt(0)
                            if (targetFile !== file) {
                                const targetSq = squares.find(s => squareToNotation(s.file, s.rank) === target)
                                return targetSq && targetSq.pieces.length > 0
                            }
                            return true
                        })
                    } else {
                        validMoves = mergedMoves
                    }
                }

                setDragState({ square: { file, rank }, validMoves })
            }
        }
    }

    // ===== CHECK IF SPLIT IS AVAILABLE =====
    const canSplitPiece = useCallback(() => {
        if (!selectedSquare) return false

        const from = squareToNotation(selectedSquare.file, selectedSquare.rank)
        const square = squares.find(s => s.file === selectedSquare.file && s.rank === selectedSquare.rank)
        if (!square || square.pieces.length === 0) return false

        const piece = square.pieces[0].piece
        const color = piece === piece.toUpperCase() ? 'w' : 'b'

        // Check total quantum pieces limit
        const probabilities = getPieceProbabilities(quantumState)
        const quantumPieceSet = new Set<string>()
        
        probabilities.forEach((pieceMap, sq) => {
            pieceMap.forEach((data, p) => {
                const pieceColor = p === p.toUpperCase() ? 'w' : 'b'
                if (pieceColor === color && data.prob < 0.99 && data.prob > 0.01) {
                    quantumPieceSet.add(sq + p)
                }
            })
        })

        if (quantumPieceSet.size >= MAX_QUANTUM_PIECES_PER_SIDE) {
            return false
        }

        // FIXED: Count copies at THIS specific location only
        // Not all copies of this piece type across all locations
        const copiesAtThisLocation = countPieceCopiesAtLocation(quantumState.boards, from)
        
        // Can split if we have 1 or 2 copies at this location
        // 1 copy → split to 2 (first split)
        // 2 copies → split to 3 (second split, max)
        // 3 copies → cannot split anymore (max reached at this location)
        if (copiesAtThisLocation > 2) return false

        const validMoves = getValidMoves(game, selectedSquare.file, selectedSquare.rank)
        return validMoves.length >= 1
    }, [selectedSquare, quantumState, squares, game])

    const isSecondSplit = useCallback((): boolean => {
        if (!selectedSquare) return false
        const from = squareToNotation(selectedSquare.file, selectedSquare.rank)
        const totalCopies = identifyPieceCopies(quantumState.boards, from)
        return totalCopies === 2
    }, [selectedSquare, quantumState])
    

    // Interference detection
    const [interferenceDetected, setInterferenceDetected] = useState(false)
    const prevInterferenceCount = useRef(0)

    useEffect(() => {
        const interferenceCount = quantumState.interferenceTypes
            ? quantumState.interferenceTypes.filter(t => t === 'constructive').length
            : 0

        if (interferenceCount > prevInterferenceCount.current) {
            setInterferenceDetected(true)
            setTimeout(() => setInterferenceDetected(false), 3000)
        }
        prevInterferenceCount.current = interferenceCount
    }, [quantumState.interferenceTypes])

    const interferenceCount = quantumState.interferenceTypes
        ? quantumState.interferenceTypes.filter(t => t === 'constructive').length
        : 0

    return {
        game,
        squares,
        quantumState,
        selectedSquare,
        dragState,
        isCheck,
        checkmateWinner,
        quantumElimination,

        splitMode,
        splitFirstTarget,

        collapseFlash,
        mergeFlash,
        partialCollapseFlash,
        entanglementFormed,
        entanglementBroken,
        interferenceCount,
        interferenceDetected,

        canSplit: canSplitPiece(),
        canMerge: quantumState.boards.length > 1,
        canTogglePhase: canTogglePhase(), // FIXED: Returns true only for 3-copy pieces
        entanglements: quantumState.entanglements || [],
        activeQuantumLinks: quantumState.entanglements?.length || 0,

        handleSquareClick,
        resetToRandomPosition,
        collapseQuantumState,
        handleResign,

        startSplit,
        cancelSplit,
        mergePiece,
        togglePiecePhase, // FIXED: Works on selected piece after split
        setPiecePhase,
        piecePhase: getSelectedPiecePhase(),
        isPieceInSuperposition,

        // Measurement system
        moveCount,
        canMeasure: canMeasureNow(), 
        movesUntilMeasurement: Math.max(0, MEASUREMENT_COOLDOWN - (moveCount - lastMeasurement)),

        // Quantum check gambit
        inQuantumCheck,
        acceptQuantumGambit,
    }
}
