import { Chess } from "chess.js"
import { squareToNotation } from "../chess/boardUtils"
import { EntangledPair } from "../chess/types"

export interface QuantumState {
    boards: Chess[]
    amplitudes: number[]
    entanglements?: EntangledPair[]
    interferenceTypes?: ('constructive' | 'destructive' | null)[]
}

export const normalizeAmplitudes = (amps: number[]): number[] => {
    const sumSquares = amps.reduce((sum, a) => sum + a * a, 0)
    if (sumSquares < 1e-10) return amps.map(() => 1 / Math.sqrt(amps.length))
    const norm = Math.sqrt(sumSquares)
    
    // FIXED: Ensure all amplitudes are positive by default
    // Take absolute value to keep them positive
    return amps.map(a => Math.abs(a) / norm)
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

export const consolidateQuantumState = (state: QuantumState): QuantumState => {
    // Group by FEN
    // Store sum of signed amplitudes AND sum of squared amplitudes (naive prop) to detect interference
    const fenMap = new Map<string, { board: Chess, amplitude: number, naiveSumSquares: number }>()

    state.boards.forEach((board, idx) => {
        const fen = board.fen()
        const amp = state.amplitudes[idx]

        if (!fenMap.has(fen)) {
            fenMap.set(fen, {
                board,
                amplitude: amp,
                naiveSumSquares: amp * amp
            })
        } else {
            const entry = fenMap.get(fen)!
            entry.amplitude += amp
            entry.naiveSumSquares += amp * amp
        }
    })

    const newBoards: Chess[] = []
    const newAmplitudes: number[] = []
    const newInterferenceTypes: ('constructive' | 'destructive' | null)[] = []

    fenMap.forEach((entry) => {
        // Filter out effectively zero amplitude
        if (Math.abs(entry.amplitude) > 0.0001) {
            newBoards.push(entry.board)
            newAmplitudes.push(entry.amplitude)

            // Detect Interference
            const realProb = entry.amplitude * entry.amplitude
            const naiveProb = entry.naiveSumSquares

            let type: 'constructive' | 'destructive' | null = null

            // Threshold: significant deviation (e.g. 5%)
            if (realProb > naiveProb * 1.05) {
                type = 'constructive'
            } else if (realProb < naiveProb * 0.95) {
                type = 'destructive'
            }

            newInterferenceTypes.push(type)
        }
    })

    return {
        boards: newBoards,
        amplitudes: normalizeAmplitudes(newAmplitudes),
        entanglements: state.entanglements,
        interferenceTypes: newInterferenceTypes
    }
}

export const getPieceProbabilities = (quantumState: QuantumState): Map<string, Map<string, { prob: number, interference: 'constructive' | 'destructive' | null }>> => {
    // Map: square -> Map(piece -> { prob, interference })
    const squareProbs = new Map<string, Map<string, { prob: number, interference: 'constructive' | 'destructive' | null }>>()

    quantumState.boards.forEach((board, idx) => {
        // Probability is amplitude squared (works for negative amplitudes too)
        const prob = quantumState.amplitudes[idx] ** 2
        const interference = quantumState.interferenceTypes ? quantumState.interferenceTypes[idx] : null
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

                    const existing = pieceMap.get(pieceKey) || { prob: 0, interference: null }

                    // Accumulate probability
                    const newProb = existing.prob + prob

                    // Determine dominant interference for this piece at this square
                    // If any contributing branch is constructive, mark as constructive (prioritize boost visibility)
                    let newInterference = existing.interference
                    if (interference === 'constructive') newInterference = 'constructive'
                    else if (interference === 'destructive' && newInterference !== 'constructive') newInterference = 'destructive'

                    pieceMap.set(pieceKey, { prob: newProb, interference: newInterference })
                }
            })
        })
    })

    return squareProbs
}
