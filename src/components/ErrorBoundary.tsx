import { Component, type ErrorInfo, type ReactNode } from "react";
import { logError } from "@/lib/logError";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    const isChunkError =
      error.name === "ChunkLoadError" ||
      /dynamically imported module|Failed to fetch/i.test(error.message);

    if (isChunkError) {
      window.location.reload();
      return;
    }

    console.error("[ErrorBoundary]", error, info);
    logError("ErrorBoundary", error.message, {
      name: error.name,
      stack: error.stack?.slice(0, 500),
      componentStack: info.componentStack?.slice(0, 500),
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4 px-4 text-center">
          <p className="text-lg font-semibold text-foreground">
            Ocorreu um erro inesperado.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
          >
            Recarregar página
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
