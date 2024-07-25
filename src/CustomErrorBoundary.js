import React from "react"
import { ErrorBoundary } from "react-error-boundary"
import ErrorBoundaryFallBack from "./ErrorBoundaryFallBack"

function CustomErrorBoundary({ shouldCrash, title, children }) {
  return <ErrorBoundary FallbackComponent={props => <ErrorBoundaryFallBack {...props} title={title || "Failed to render component"} />}>{children}</ErrorBoundary>
}

export default CustomErrorBoundary
