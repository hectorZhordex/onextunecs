import { Component, type ReactNode } from "react";

interface Props { children: ReactNode }
interface State { error: Error | null }

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{
          minHeight: "100vh", background: "#1a1a1a", color: "#fff",
          display: "flex", flexDirection: "column", alignItems: "center",
          justifyContent: "center", padding: "2rem", fontFamily: "monospace",
        }}>
          <div style={{ maxWidth: 640, width: "100%" }}>
            <h1 style={{ color: "#ff006b", fontSize: "1.25rem", marginBottom: "1rem" }}>
              App Error
            </h1>
            <pre style={{
              background: "#111", padding: "1rem", borderRadius: "0.5rem",
              fontSize: "0.8rem", overflowX: "auto", whiteSpace: "pre-wrap",
              wordBreak: "break-all", color: "#f87171",
            }}>
              {this.state.error.message}
              {"\n\n"}
              {this.state.error.stack}
            </pre>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
