import { create } from "zustand"

export interface ChessState {
  pieces: string[]
  turn: "white" | "black"
  resetBoard: () => void
  setTurn: (turn: "white" | "black") => void
}

export const useChessStore = create<ChessState>((set) => ({
  pieces: [],
  turn: "white",
  resetBoard: () => set({ pieces: [], turn: "white" }),
  setTurn: (turn) => set({ turn }),
}))
