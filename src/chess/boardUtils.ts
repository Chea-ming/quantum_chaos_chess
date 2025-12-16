import { Chess, Square } from "chess.js"

export const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"]
export const RANKS = ["8", "7", "6", "5", "4", "3", "2", "1"]

export const fileToLetter = (file: number) => FILES[file]
export const rankToNumber = (rank: number) => (rank + 1).toString()
export const squareToNotation = (file: number, rank: number) =>
    `${fileToLetter(file)}${rankToNumber(rank)}`

export const getValidMoves = (game: Chess, file: number, rank: number): string[] => {
    const square = squareToNotation(file, rank)
    const moves = game.moves({ square: square as Square, verbose: true })
    return moves.map(move => move.to)
}
