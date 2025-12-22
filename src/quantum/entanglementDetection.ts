import { Chess } from "chess.js"
import { EntangledPair } from "../chess/types"
import { squareToNotation } from "../chess/boardUtils"

/**
 * Detects quantum entanglement between pieces across multiple quantum boards.
 * 
 * Entanglement occurs when two pieces' positions are correlated across realities:
 * - Positive correlation: pieces exist together in the same boards
 * - Negative correlation: pieces exist in mutually exclusive boards
 * 
 * This naturally emerges from the multi-board simulation without extra tracking!
 */
export const detectEntanglements = (
    boards: Chess[],
    amplitudes: number[]
): EntangledPair[] => {
    if (boards.length <= 1) return []

    interface PieceLocation {
        square: string
        piece: string
        boardIndices: number[]
    }

    const pieceLocations: PieceLocation[] = []

    boards.forEach((board, boardIdx) => {
        const boardArray = board.board()
        boardArray.forEach((row, rankIdx) => {
            row.forEach((square, fileIdx) => {
                if (square) {
                    const squareNotation = squareToNotation(fileIdx, 7 - rankIdx)
                    const pieceKey = square.color === 'w'
                        ? square.type.toUpperCase()
                        : square.type.toLowerCase()

                    let existing = pieceLocations.find(
                        pl => pl.square === squareNotation && pl.piece === pieceKey
                    )

                    if (existing) {
                        existing.boardIndices.push(boardIdx)
                    } else {
                        pieceLocations.push({
                            square: squareNotation,
                            piece: pieceKey,
                            boardIndices: [boardIdx]
                        })
                    }
                }
            })
        })
    })

    const entanglements: EntangledPair[] = []
    const totalBoards = boards.length

    // FIXED: Proper correlation calculation
    for (let i = 0; i < pieceLocations.length; i++) {
        for (let j = i + 1; j < pieceLocations.length; j++) {
            const loc1 = pieceLocations[i]
            const loc2 = pieceLocations[j]

            // Skip same piece at same location
            if (loc1.square === loc2.square && loc1.piece === loc2.piece) continue

            // FIXED: Calculate intersection properly
            const boards1 = new Set(loc1.boardIndices)
            const boards2 = new Set(loc2.boardIndices)
            
            const intersection = loc1.boardIndices.filter(idx => boards2.has(idx))
            
            // FIXED: Union calculation using Set to avoid duplicates
            const unionSize = new Set([...loc1.boardIndices, ...loc2.boardIndices]).size
            
            // Positive correlation: pieces appear together
            if (intersection.length > 0) {
                const jaccardSimilarity = intersection.length / unionSize
                
                // FIXED: More reasonable threshold and remove same-piece-type filter
                // Same piece type at different squares IS a valid entanglement
                if (jaccardSimilarity > 0.85 && intersection.length < totalBoards) {
                    entanglements.push({
                        piece1: { square: loc1.square, piece: loc1.piece },
                        piece2: { square: loc2.square, piece: loc2.piece },
                        correlationType: 'positive'
                    })
                }
            }

            // Negative correlation: mutually exclusive
            if (intersection.length === 0 && 
                loc1.boardIndices.length > 0 && 
                loc2.boardIndices.length > 0) {
                
                // FIXED: Better balance check - both should represent significant portions
                const ratio1 = loc1.boardIndices.length / totalBoards
                const ratio2 = loc2.boardIndices.length / totalBoards
                
                // Both must appear in at least 25% of boards and together cover significant portion
                if (ratio1 > 0.25 && ratio2 > 0.25 && (ratio1 + ratio2) > 0.6) {
                    entanglements.push({
                        piece1: { square: loc1.square, piece: loc1.piece },
                        piece2: { square: loc2.square, piece: loc2.piece },
                        correlationType: 'negative'
                    })
                }
            }
        }
    }

    return entanglements.slice(0, 5)
}

/**
 * Checks if a move is a sliding move (rook, bishop, or queen movement).
 * These moves can create entanglement when they pass through superposed pieces.
 */
export const isSlideMove = (piece: string, from: string, to: string): boolean => {
    const pieceType = piece.toUpperCase()
    if (!['R', 'B', 'Q'].includes(pieceType)) return false

    // Convert notation to coordinates
    const fromFile = from.charCodeAt(0) - 'a'.charCodeAt(0)
    const fromRank = parseInt(from[1]) - 1
    const toFile = to.charCodeAt(0) - 'a'.charCodeAt(0)
    const toRank = parseInt(to[1]) - 1

    const fileDiff = Math.abs(toFile - fromFile)
    const rankDiff = Math.abs(toRank - fromRank)

    // Rook: straight line (same file or rank)
    if (pieceType === 'R') {
        return (fromFile === toFile && rankDiff > 0) || (fromRank === toRank && fileDiff > 0)
    }

    // Bishop: diagonal
    if (pieceType === 'B') {
        return fileDiff === rankDiff && fileDiff > 0
    }

    // Queen: straight or diagonal
    if (pieceType === 'Q') {
        return (fromFile === toFile && rankDiff > 0) ||
            (fromRank === toRank && fileDiff > 0) ||
            (fileDiff === rankDiff && fileDiff > 0)
    }

    return false
}

/**
 * Identifies all locations of "copies" of the piece at the given square.
 * Copies are defined as pieces of the same type/color that exist in mutually exclusive realities (intersection is empty).
 * Returns the TOTAL count of copies (including the one at the source square).
 */
export const identifyPieceCopies = (
    boards: Chess[],
    square: string
): number => {
    interface PieceLoc {
        square: string
        piece: string
        boardIndices: number[]
    }
    const locations: PieceLoc[] = []

    boards.forEach((board, boardIdx) => {
        const boardArray = board.board()
        boardArray.forEach((row, rankIdx) => {
            row.forEach((sq, fileIdx) => {
                if (sq) {
                    const sqNote = squareToNotation(fileIdx, 7 - rankIdx)
                    const pType = sq.color === 'w' ? sq.type.toUpperCase() : sq.type.toLowerCase()

                    let existing = locations.find(l => l.square === sqNote && l.piece === pType)
                    if (existing) {
                        existing.boardIndices.push(boardIdx)
                    } else {
                        locations.push({ square: sqNote, piece: pType, boardIndices: [boardIdx] })
                    }
                }
            })
        })
    })

    const sourceLoc = locations.find(l => l.square === square)
    // FIXED: Return 1 if piece not found (it exists in at least the current reality)
    if (!sourceLoc) return 1

    const siblings = locations.filter(loc => {
        if (loc.piece !== sourceLoc.piece) return false
        if (loc.square === sourceLoc.square) return true

        // Check for disjoint board sets
        const intersection = loc.boardIndices.filter(idx => sourceLoc.boardIndices.includes(idx))
        return intersection.length === 0
    })

    // FIXED: Return at least 1 (the piece itself exists)
    return Math.max(1, siblings.length)
}

export const countPieceCopiesAtLocation = (
    boards: Chess[],
    square: string
): number => {
    // Count how many boards have a piece at this exact square
    let count = 0
    
    boards.forEach((board) => {
        const piece = board.get(square as any)
        if (piece) {
            count++
        }
    })
    
    return count
}

/**
 * Gets the piece type at a location (checks first board where it exists)
 */
export const getPieceTypeAtLocation = (
    boards: Chess[],
    square: string
): string | null => {
    for (const board of boards) {
        const piece = board.get(square as any)
        if (piece) {
            return piece.color === 'w' ? piece.type.toUpperCase() : piece.type.toLowerCase()
        }
    }
    return null
}

