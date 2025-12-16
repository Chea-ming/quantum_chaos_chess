import { Chess } from "chess.js"
import { QuantumState, normalizeAmplitudes, pickCollapseIndex } from "./quantumState"

export const performQuantumMove = (
    currentState: QuantumState,
    from: string,
    to: string
): QuantumState | null => {
    // Apply move to ALL quantum boards simultaneously
    const newBoards: Chess[] = []
    const newAmplitudes: number[] = []

    currentState.boards.forEach((board, idx) => {
        const testBoard = new Chess(board.fen())
        try {
            testBoard.move({ from, to, promotion: 'q' })
            newBoards.push(testBoard)
            newAmplitudes.push(currentState.amplitudes[idx])
        } catch (e) {
            // Move illegal in this branch - set amplitude to 0
            newBoards.push(board)
            newAmplitudes.push(0)
        }
    })

    // Filter out zero-amplitude boards and normalize
    const filteredIndices = newAmplitudes
        .map((amp, idx) => ({ amp, idx }))
        .filter(x => x.amp !== 0)
        .map(x => x.idx)

    if (filteredIndices.length === 0) return null // Move illegal everywhere

    const filteredBoards = filteredIndices.map(i => newBoards[i])
    const filteredAmps = filteredIndices.map(i => newAmplitudes[i])

    const normalizedAmps = normalizeAmplitudes(filteredAmps)

    return {
        boards: filteredBoards,
        amplitudes: normalizedAmps
    }
}

export const performSplitMove = (
    currentState: QuantumState,
    from: string,
    target1: string,
    target2: string
): QuantumState | null => {
    let workingState = currentState

    // Check if split would exceed limit
    if (workingState.boards.length * 2 > 8) {
        const collapseIdx = pickCollapseIndex(workingState.amplitudes)
        const collapsedBoard = new Chess(workingState.boards[collapseIdx].fen())
        workingState = {
            boards: [collapsedBoard],
            amplitudes: [1.0]
        }
    }

    // Duplicate all boards and apply different moves to each half
    const newBoards: Chess[] = []
    const newAmplitudes: number[] = []

    workingState.boards.forEach((board, idx) => {
        const amp = workingState.amplitudes[idx]

        // Branch 1: move to target1
        const board1 = new Chess(board.fen())
        try {
            board1.move({ from, to: target1, promotion: 'q' })
            newBoards.push(board1)
            newAmplitudes.push(amp / Math.sqrt(2))
        } catch (e) {
            // Illegal move
        }

        // Branch 2: move to target2
        const board2 = new Chess(board.fen())
        try {
            board2.move({ from, to: target2, promotion: 'q' })
            newBoards.push(board2)
            newAmplitudes.push(amp / Math.sqrt(2))
        } catch (e) {
            // Illegal move
        }
    })

    if (newBoards.length === 0) return null

    const normalizedAmps = normalizeAmplitudes(newAmplitudes)

    return {
        boards: newBoards,
        amplitudes: normalizedAmps
    }
}
