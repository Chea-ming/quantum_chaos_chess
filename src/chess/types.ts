export interface BoardSquare {
    file: number
    rank: number
    pieces: Array<{ piece: string; probability: number }>
}

export interface DragState {
    square: { file: number; rank: number } | null
    validMoves: string[]
}
