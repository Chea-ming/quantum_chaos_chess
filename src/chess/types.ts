export interface BoardSquare {
    file: number
    rank: number
    pieces: Array<{ piece: string; probability: number; interference: 'constructive' | 'destructive' | null }>
}

export interface DragState {
    square: { file: number; rank: number } | null
    validMoves: string[]
}

export interface EntangledPair {
    piece1: { square: string; piece: string }
    piece2: { square: string; piece: string }
    correlationType: 'positive' | 'negative' // positive = exist together, negative = mutually exclusive
}

export interface BoardSquare {
    file: number
    rank: number
    pieces: Array<{ piece: string; probability: number; interference: 'constructive' | 'destructive' | null }>
}

export interface DragState {
    square: { file: number; rank: number } | null
    validMoves: string[]
}

export interface EntangledPair {
    piece1: { square: string; piece: string }
    piece2: { square: string; piece: string }
    correlationType: 'positive' | 'negative'
}

// NEW: Add phase split configuration type
export interface PhaseSplitConfig {
    source: string
    target1: string
    target2: string
    phases: { [square: string]: 'positive' | 'negative' }
}

// NEW: Add quantum check type
export interface QuantumCheckInfo {
    attackerSquare: string
    attackerProbability: number
}
