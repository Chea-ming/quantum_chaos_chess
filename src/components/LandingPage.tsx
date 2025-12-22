import React from "react"

interface LandingPageProps {
    onSelectMode: (mode: 'pass-and-play' | 'online' | 'vs-ai' | 'ai-vs-ai') => void
}

export default function LandingPage({ onSelectMode }: LandingPageProps) {
    return (
        <div
            className="min-h-screen flex flex-col items-center justify-center p-6"
            style={{
                backgroundImage: "url('https://images.unsplash.com/photo-1695390472716-815085e401a2?q=80&w=1374&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundBlendMode: 'overlay',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
            }}
        >
            <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Climate+Crisis:wght@400;500;600;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&family=Bebas+Neue&family=Space+Grotesk:wght@300;400;500;600;700&display=swap');
        
        body {
          font-family: 'Climate Crisis', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        
        :root {
            --font-title: 'Climate Crisis', sans-serif;
            --font-subtitle: 'Bebas+Neue', cursive;
            --font-body: 'Space Grotesk', sans-serif;
        }
      `}</style>

            <div className="text-center mb-16">
                <h1
                    style={{ fontFamily: "var(--font-title)" }}
                    className="text-7xl font-black bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent mb-6 tracking-tight"
                >
                    CHAOS CHESS
                </h1>
                <p
                    style={{ fontFamily: "var(--font-subtitle)" }}
                    className="text-cyan-400/80 text-xl font-medium tracking-widest uppercase"
                >
                    Where Strategy Meets Quantum Mechanics
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
                {/* Pass & Play - Active */}
                <button
                    onClick={() => onSelectMode('pass-and-play')}
                    className="group relative px-10 py-8 bg-gradient-to-br from-cyan-900/40 to-cyan-800/20 hover:from-cyan-800/60 hover:to-cyan-700/40 border-2 border-cyan-500/50 hover:border-cyan-400/80 rounded-2xl transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-400/30 hover:scale-105"
                    style={{ fontFamily: "var(--font-body)" }}
                >
                    <div className="text-4xl mb-3">👥</div>
                    <h2 className="text-2xl font-bold text-cyan-300 mb-2">Pass & Play</h2>
                    <p className="text-cyan-400/70 text-sm">Play locally with a friend</p>
                    <div className="absolute top-3 right-3 px-2 py-1 bg-green-500/20 border border-green-400/50 rounded text-xs text-green-400 font-medium">
                        READY
                    </div>
                </button>

                {/* Play Online - Coming Soon */}
                <button
                    disabled
                    className="group relative px-10 py-8 bg-gradient-to-br from-slate-900/40 to-slate-800/20 border-2 border-slate-700/50 rounded-2xl cursor-not-allowed opacity-60"
                    style={{ fontFamily: "var(--font-body)" }}
                >
                    <div className="text-4xl mb-3 grayscale">🌐</div>
                    <h2 className="text-2xl font-bold text-slate-400 mb-2">Play Online</h2>
                    <p className="text-slate-500/70 text-sm">Challenge players worldwide</p>
                    <div className="absolute top-3 right-3 px-2 py-1 bg-yellow-500/20 border border-yellow-400/50 rounded text-xs text-yellow-400 font-medium">
                        COMING SOON
                    </div>
                </button>

                {/* Play vs AI - Coming Soon */}
                <button
                    disabled
                    className="group relative px-10 py-8 bg-gradient-to-br from-slate-900/40 to-slate-800/20 border-2 border-slate-700/50 rounded-2xl cursor-not-allowed opacity-60"
                    style={{ fontFamily: "var(--font-body)" }}
                >
                    <div className="text-4xl mb-3 grayscale">🤖</div>
                    <h2 className="text-2xl font-bold text-slate-400 mb-2">Play vs AI</h2>
                    <p className="text-slate-500/70 text-sm">Battle quantum AI opponent</p>
                    <div className="absolute top-3 right-3 px-2 py-1 bg-yellow-500/20 border border-yellow-400/50 rounded text-xs text-yellow-400 font-medium">
                        COMING SOON
                    </div>
                </button>

                {/* AI vs AI - Coming Soon */}
                <button
                    disabled
                    className="group relative px-10 py-8 bg-gradient-to-br from-slate-900/40 to-slate-800/20 border-2 border-slate-700/50 rounded-2xl cursor-not-allowed opacity-60"
                    style={{ fontFamily: "var(--font-body)" }}
                >
                    <div className="text-4xl mb-3 grayscale">🎭</div>
                    <h2 className="text-2xl font-bold text-slate-400 mb-2">AI vs AI</h2>
                    <p className="text-slate-500/70 text-sm">Watch AIs compete</p>
                    <div className="absolute top-3 right-3 px-2 py-1 bg-yellow-500/20 border border-yellow-400/50 rounded text-xs text-yellow-400 font-medium">
                        COMING SOON
                    </div>
                </button>
            </div>

            <div className="mt-12 text-center max-w-2xl">
                <p className="text-slate-400 text-sm" style={{ fontFamily: "var(--font-body)" }}>
                    Experience chess in quantum superposition. Click <span className="text-cyan-400 font-bold">SPLIT</span> to create branching realities. Collapse the wave function to determine the outcome!
                </p>
            </div>
        </div>
    )
}
