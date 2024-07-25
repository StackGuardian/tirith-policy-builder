import React from 'react';
import Alert from '@cloudscape-design/components/alert';

function ErrorBoundaryFallBack({ error, resetErrorBoundary, title }) {
  return (
    <Alert type="error" visible={true} header={title}>
      {error?.message || 'Something went wrong !'}
    </Alert>
  );
}

export default ErrorBoundaryFallBack;
