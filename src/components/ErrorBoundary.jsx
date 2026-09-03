import { Component } from 'react'

// Catches errors thrown inside the 3D scene (e.g. a bad geometry or a
// WebGL context failure) so the user sees a message instead of a blank
// screen with a stuck loader.
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error('[Scene ErrorBoundary]', error, info)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-[#1f1a16] p-8 text-center text-cream">
          <div className="text-4xl">🛠️</div>
          <div className="font-display text-lg font-bold">
            The 3D scene failed to load
          </div>
          <pre className="max-w-md overflow-auto rounded-lg bg-black/30 p-3 text-xs text-left text-cream/70">
            {String(this.state.error?.message || this.state.error)}
          </pre>
          <button
            onClick={() => this.setState({ error: null })}
            className="mt-2 rounded-full bg-accent px-5 py-2 text-sm font-bold text-ink"
          >
            Try again
          </button>
          <div className="text-xs text-cream/50">
            If this persists, your browser may not support WebGL.
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
