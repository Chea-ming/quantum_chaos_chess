import { Chess } from "chess.js"
import { squareToNotation } from "../chess/boardUtils"

export interface QuantumState {
    boards: Chess[]
    amplitudes: number[]
}

export const normalizeAmplitudes = (amps: number[]): number[] => {
    const sumSquares = amps.reduce((sum, a) => sum + a * a, 0)
    if (sumSquares === 0) return amps
    const norm = Math.sqrt(sumSquares)
    return amps.map(a => a / norm)
}

export const pickCollapseIndex = (amplitudes: number[]): number => {
    // Weighted random selection
    const probs = amplitudes.map(a => a * a)
    const rand = Math.random()
    let cumProb = 0

    for (let i = 0; i < probs.length; i++) {
        cumProb += probs[i]
        if (rand <= cumProb) {
            return i
        }
    }
    return 0
}

export const getPieceProbabilities = (quantumState: QuantumState): Map<string, Map<string, number>> => {
    // Map: square -> Map(piece -> probability)
    const squareProbs = new Map<string, Map<string, number>>()

    quantumState.boards.forEach((board, idx) => {
        const prob = quantumState.amplitudes[idx] ** 2
        const boardArray = board.board()

        boardArray.forEach((row, rankIdx) => {
            row.forEach((square, fileIdx) => {
                if (square) {
                    const squareNotation = squareToNotation(fileIdx, 7 - rankIdx)
                    const pieceKey = square.color === 'w' ? square.type.toUpperCase() : square.type.toLowerCase()

                    if (!squareProbs.has(squareNotation)) {
                        squareProbs.set(squareNotation, new Map())
                    }
                    const pieceMap = squareProbs.get(squareNotation)!
                    pieceMap.set(pieceKey, (pieceMap.get(pieceKey) || 0) + prob)
                }
            })
        })
    })

    return squareProbs
}
