import { Chess } from "chess.js"
import { QuantumState, normalizeAmplitudes, pickCollapseIndex, consolidateQuantumState, getPieceProbabilities } from "./quantumState"
import { detectEntanglements } from "./entanglementDetection"
import { EntangledPair } from "../chess/types"

const getPathSquares = (from: string, to: string): string[] => {
    const fromFile = from.charCodeAt(0) - 'a'.charCodeAt(0)
    const fromRank = parseInt(from[1]) - 1
    const toFile = to.charCodeAt(0) - 'a'.charCodeAt(0)
    const toRank = parseInt(to[1]) - 1

    const fileDiff = toFile - fromFile
    const rankDiff = toRank - fromRank
    const steps = Math.max(Math.abs(fileDiff), Math.abs(rankDiff))

    const path: string[] = []
    if (steps <= 1) return path // No intermediate squares

    const fileStep = fileDiff / steps
    const rankStep = rankDiff / steps

    for (let i = 1; i < steps; i++) {
        const f = fromFile + i * fileStep
        const r = fromRank + i * rankStep
        path.push(`${String.fromCharCode('a'.charCodeAt(0) + f)}${r + 1}`)
    }
    return path
}

export const performQuantumMove = (
    currentState: QuantumState,
    from: string,
    to: string
): QuantumState | null => {
    const path = getPathSquares(from, to)
    const probabilities = getPieceProbabilities(currentState)

    // NEW: Detect ghosting collisions for entanglement
    const ghostingCollisions: EntangledPair[] = []
    
    // Check if moving piece is superposed
    const movingPieceProb = probabilities.get(from)
    const movingPieceIsSuperposed = movingPieceProb && 
        Array.from(movingPieceProb.values()).some(d => d.prob < 0.99 && d.prob > 0.01)
    
    if (movingPieceIsSuperposed) {
        // Check path for superposed blockers
        path.forEach(sq => {
            const pieces = probabilities.get(sq)
            if (pieces && pieces.size > 0) {
                pieces.forEach((data, piece) => {
                    if (data.prob < 0.99 && data.prob > 0.01) {
                        // Found superposed blocker - create entanglement
                        const movingPiece = Array.from(movingPieceProb!.entries())[0][0]
                        ghostingCollisions.push({
                            piece1: { square: from, piece: movingPiece },
                            piece2: { square: sq, piece: piece },
                            correlationType: 'positive'
                        })
                    }
                })
            }
        })
    }

    const superposedBlockers: string[] = []
    path.forEach(sq => {
        const pieces = probabilities.get(sq)
        if (pieces && pieces.size > 0) {
            let isSuperposed = false
            pieces.forEach((data: { prob: number }) => {
                if (data.prob < 0.99) isSuperposed = true
            })
            if (isSuperposed) {
                superposedBlockers.push(sq)
            }
        }
    })

    const newBoards: Chess[] = []
    const newAmplitudes: number[] = []

    currentState.boards.forEach((board, idx) => {
        const amp = currentState.amplitudes[idx]
        const branchBoard = new Chess(board.fen())

        try {
            const moveResult = branchBoard.move({ from, to, promotion: 'q' })
            if (moveResult) {
                newBoards.push(branchBoard)
                newAmplitudes.push(amp)
                return
            }
        } catch (e) {
            // Fall through to manual handling
        }

        const piece = board.get(from as any)
        if (!piece) {
            newBoards.push(new Chess(board.fen()))
            newAmplitudes.push(amp)
            return
        }

        const manuallyMovedBoard = new Chess(board.fen())
        manuallyMovedBoard.remove(from as any)
        const targetPiece = manuallyMovedBoard.get(to as any)

        if (targetPiece) {
            if (targetPiece.color === piece.color) {
                newBoards.push(new Chess(board.fen()))
                newAmplitudes.push(amp)
            } else {
                try {
                    manuallyMovedBoard.put(piece, to as any)
                    newBoards.push(manuallyMovedBoard)
                    newAmplitudes.push(amp)
                } catch (e) {
                    newBoards.push(new Chess(board.fen()))
                    newAmplitudes.push(amp)
                }
            }
        } else {
            try {
                manuallyMovedBoard.put(piece, to as any)
                newBoards.push(manuallyMovedBoard)
                newAmplitudes.push(amp)
            } catch (e) {
                newBoards.push(new Chess(board.fen()))
                newAmplitudes.push(amp)
            }
        }
    })

    const intermediateState: QuantumState = {
        boards: newBoards,
        amplitudes: newAmplitudes
    }

    const consolidatedState = consolidateQuantumState(intermediateState)
    const entanglements = detectEntanglements(consolidatedState.boards, consolidatedState.amplitudes)
    
    // NEW: Add ghosting collision entanglements
    const allEntanglements = [...entanglements, ...ghostingCollisions]

    return {
        ...consolidatedState,
        entanglements: allEntanglements
    }
}

export const performSplitMove = (
    currentState: QuantumState,
    from: string,
    target1: string,
    target2: string
): QuantumState | null => {
    const newBoards: Chess[] = []
    const newAmplitudes: number[] = []

    currentState.boards.forEach((board, idx) => {
        const amp = currentState.amplitudes[idx]
        const pieceAtFrom = board.get(from as any)

        if (!pieceAtFrom) {
            newBoards.push(new Chess(board.fen()))
            newAmplitudes.push(amp)
            return
        }

        // Branch 1: Move from -> target1
        const board1 = new Chess(board.fen())
        let success1 = false
        try {
            if (target1 !== from) {
                const result = board1.move({ from, to: target1, promotion: 'q' })
                success1 = result !== null
            } else {
                success1 = true // "stay" is always valid
            }
        } catch (e) {
            success1 = false
        }

        // FIXED: Only add branch if move succeeded
        if (success1) {
            newBoards.push(board1)
            newAmplitudes.push(amp / Math.sqrt(2))
        }

        // Branch 2: Move from -> target2 (FLIP SIGN for interference)
        const board2 = new Chess(board.fen())
        let success2 = false
        try {
            if (target2 !== from) {
                const result = board2.move({ from, to: target2, promotion: 'q' })
                success2 = result !== null
            } else {
                success2 = true
            }
        } catch (e) {
            success2 = false
        }

        // FIXED: Only add branch if move succeeded, maintain negative sign
        if (success2) {
            newBoards.push(board2)
            newAmplitudes.push(-amp / Math.sqrt(2))
        }

        // FIXED: If both moves fail, keep original board
        if (!success1 && !success2) {
            newBoards.push(new Chess(board.fen()))
            newAmplitudes.push(amp)
        }
    })

    if (newBoards.length === 0) return null

    const intermediateState: QuantumState = {
        boards: newBoards,
        amplitudes: newAmplitudes
    }

    const consolidatedState = consolidateQuantumState(intermediateState)
    const entanglements = detectEntanglements(consolidatedState.boards, consolidatedState.amplitudes)

    return {
        ...consolidatedState,
        entanglements
    }
}

export const flipPiecePhase = (
    currentState: QuantumState,
    square: string,
    pieceType: string
): QuantumState => {
    const newAmplitudes = currentState.amplitudes.map((amp, idx) => {
        const board = currentState.boards[idx]
        const p = board.get(square as any)
        const currentPieceType = p ? (p.color === 'w' ? p.type.toUpperCase() : p.type.toLowerCase()) : null
        if (currentPieceType === pieceType) {
            return -amp
        }
        return amp
    })

    return {
        ...currentState,
        amplitudes: normalizeAmplitudes(newAmplitudes)
    }
}

/**
 * Calculates valid moves for a quantum piece, allowing "ghosting" through superposed blockers.
 * Classical blockers still block the path.
 */
export const getQuantumValidMoves = (
    currentState: QuantumState,
    file: number,
    rank: number
): string[] => {
    const from = String.fromCharCode('a'.charCodeAt(0) + file) + (rank + 1)
    const probabilities = getPieceProbabilities(currentState)

    const pieceMap = probabilities.get(from)
    if (!pieceMap) return []

    let pieceType = ''
    let isWhite = true
    for (const board of currentState.boards) {
        const p = board.get(from as any)
        if (p) {
            pieceType = p.type.toUpperCase()
            isWhite = p.color === 'w'
            break
        }
    }

    if (!pieceType) return []

    const validMoves: string[] = []

    const getSquareStatus = (f: number, r: number): 'empty' | 'quantum' | 'classical' | 'offboard' => {
        if (f < 0 || f > 7 || r < 0 || r > 7) return 'offboard'
        const sq = String.fromCharCode('a'.charCodeAt(0) + f) + (r + 1)
        const pieces = probabilities.get(sq)

        if (!pieces || pieces.size === 0) return 'empty'

        let isQuantum = false
        pieces.forEach(data => {
            if (data.prob < 0.99 && data.prob > 0.01) isQuantum = true
        })

        return isQuantum ? 'quantum' : 'classical'
    }

    const addMove = (f: number, r: number) => {
        validMoves.push(String.fromCharCode('a'.charCodeAt(0) + f) + (r + 1))
    }

    // FIXED: Sliding pieces - blocked by classical pieces, can ghost through quantum
    if (['B', 'R', 'Q'].includes(pieceType)) {
        const directions: [number, number][] = []
        if (pieceType === 'B' || pieceType === 'Q') directions.push([1, 1], [1, -1], [-1, 1], [-1, -1])
        if (pieceType === 'R' || pieceType === 'Q') directions.push([1, 0], [-1, 0], [0, 1], [0, -1])

        directions.forEach(([df, dr]) => {
            for (let i = 1; i < 8; i++) {
                const f = file + i * df
                const r = rank + i * dr
                const status = getSquareStatus(f, r)

                if (status === 'offboard') break
                if (status === 'classical') break // BLOCKED by classical pieces

                addMove(f, r)
                // Continue through quantum pieces (ghosting)
            }
        })
    }
    // Knight
    else if (pieceType === 'N') {
        const moves = [
            [1, 2], [1, -2], [-1, 2], [-1, -2],
            [2, 1], [2, -1], [-2, 1], [-2, -1]
        ]
        moves.forEach(([df, dr]) => {
            const status = getSquareStatus(file + df, rank + dr)
            if (status !== 'offboard' && status !== 'classical') {
                addMove(file + df, rank + dr)
            }
        })
    }
    // King
    else if (pieceType === 'K') {
        const moves = [
            [1, 0], [-1, 0], [0, 1], [0, -1],
            [1, 1], [1, -1], [-1, 1], [-1, -1]
        ]
        moves.forEach(([df, dr]) => {
            const status = getSquareStatus(file + df, rank + dr)
            if (status !== 'offboard' && status !== 'classical') {
                addMove(file + df, rank + dr)
            }
        })
    }
    // FIXED: Pawn - blocked by classical pieces
    else if (pieceType === 'P') {
        const direction = isWhite ? 1 : -1
        const startRank = isWhite ? 1 : 6

        // Forward 1
        const f1Status = getSquareStatus(file, rank + direction)
        if (f1Status !== 'offboard' && f1Status !== 'classical') {
            addMove(file, rank + direction)

            // Double move - both squares must not have classical pieces
            if (rank === startRank) {
                const f2Status = getSquareStatus(file, rank + (direction * 2))
                if (f2Status !== 'offboard' && f2Status !== 'classical') {
                    addMove(file, rank + (direction * 2))
                }
            }
        }

        // Diagonal captures
        [-1, 1].forEach(df => {
            const captureStatus = getSquareStatus(file + df, rank + direction)
            if (captureStatus !== 'offboard' && captureStatus !== 'classical') {
                addMove(file + df, rank + direction)
            }
        })
    }

    return validMoves
}