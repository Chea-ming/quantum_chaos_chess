import { Chess, Square } from "chess.js"

export const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"]
export const RANKS = ["8", "7", "6", "5", "4", "3", "2", "1"]

export const fileToLetter = (file: number) => FILES[file]
export const rankToNumber = (rank: number) => (rank + 1).toString()
export const squareToNotation = (file: number, rank: number) =>
    `${fileToLetter(file)}${rankToNumber(rank)}`

// Helper to check if a move is geometrically valid for a piece type
// regardless of blockers (used for quantum tunneling/entanglement)
export const getGeometricallyValidMoves = (game: Chess, file: number, rank: number): string[] => {
    const square = squareToNotation(file, rank)
    const piece = game.get(square as any)
    if (!piece) return []

    const moves: string[] = []
    const type = piece.type.toUpperCase()

    // Helper to add move if on board
    const addIfValid = (f: number, r: number) => {
        if (f >= 0 && f < 8 && r >= 0 && r < 8) {
            moves.push(squareToNotation(f, r))
        }
    }

    if (type === 'N') {
        const offsets = [
            [1, 2], [1, -2], [-1, 2], [-1, -2],
            [2, 1], [2, -1], [-2, 1], [-2, -1]
        ]
        offsets.forEach(([df, dr]) => addIfValid(file + df, rank + dr))
    }
    else if (type === 'B' || type === 'R' || type === 'Q') {
        const directions: [number, number][] = []
        if (type === 'B' || type === 'Q') {
            directions.push([1, 1], [1, -1], [-1, 1], [-1, -1])
        }
        if (type === 'R' || type === 'Q') {
            directions.push([1, 0], [-1, 0], [0, 1], [0, -1])
        }

        directions.forEach(([df, dr]) => {
            for (let i = 1; i < 8; i++) {
                const f = file + i * df
                const r = rank + i * dr
                if (f >= 0 && f < 8 && r >= 0 && r < 8) {
                    moves.push(squareToNotation(f, r))
                } else {
                    break
                }
            }
        })
    }
    else if (type === 'K') {
        const offsets = [
            [1, 0], [-1, 0], [0, 1], [0, -1],
            [1, 1], [1, -1], [-1, 1], [-1, -1]
        ]
        offsets.forEach(([df, dr]) => addIfValid(file + df, rank + dr))
    }
    else if (type === 'P') {
        const isWhite = piece.color === 'w'
        const direction = isWhite ? 1 : -1
        const startRank = isWhite ? 1 : 6

        // 1. Forward move
        addIfValid(file, rank + direction)

        // 2. Double move
        if (rank === startRank) {
            addIfValid(file, rank + (direction * 2))
        }

        // 3. Diagonal captures (geometric validity only)
        // Quantum pawns can "see" these squares for entanglement purposes
        addIfValid(file - 1, rank + direction)
        addIfValid(file + 1, rank + direction)
    }

    return moves
}

export const getValidMoves = (game: Chess, file: number, rank: number): string[] => {
    const square = squareToNotation(file, rank)
    const moves = game.moves({ square: square as Square, verbose: true })
    return moves.map(move => move.to)
}
