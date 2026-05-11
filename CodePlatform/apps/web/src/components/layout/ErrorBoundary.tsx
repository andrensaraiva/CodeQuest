import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('UI crashed:', error, info)
  }

  reset = () => {
    this.setState({ error: null })
  }

  render() {
    if (!this.state.error) {
      return this.props.children
    }

    return (
      <main className="cq-app grid min-h-screen place-items-center px-4 py-10">
        <div className="cq-card w-full max-w-md space-y-4 p-6 text-center">
          <h1 className="cq-heading text-2xl font-black">Something broke</h1>
          <p className="cq-muted text-sm">{this.state.error.message}</p>
          <button
            type="button"
            onClick={() => {
              this.reset()
              window.location.assign('/')
            }}
            className="rounded-lg bg-[#35ff7a] px-4 py-2 text-sm font-bold text-[#080b0f]"
          >
            Back to home
          </button>
        </div>
      </main>
    )
  }
}
