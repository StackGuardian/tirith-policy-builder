import React, { Component, useMemo } from 'react';
import Editor from '@monaco-editor/react';
import { Box, SpaceBetween, StatusIndicator } from '@cloudscape-design/components';
import CustomErrorBoundary from './CustomErrorBoundary';

const OPTIONS = {
  selectOnLineNumbers: true,
  lineNumbersMinChars: 3,
  lineDecorationsWidth: 10,
  scrollBeyondLastLine: false,
  links: true,
  readOnly: false,
  scrollbar: {
    alwaysConsumeMouseWheel: false,
    useShadows: false,
    verticalHasArrows: true,
    horizontalHasArrows: true,
    vertical: 'hidden',
    horizontal: 'hidden',
    verticalScrollbarSize: 0,
    horizontalScrollbarSize: 17
  },
  fontSize: '14px',
  minimap: {
    enabled: false
  }
};

function MonacoEditorWidget(props) {
  const { errorText, onChange, value, language, size } = props;

  const handleEditorChange = (value, evt) => {
    try {
      onChange(value, evt);
    } catch (e) {}
  };

  const options = useMemo(() => {
    const { readOnly } = props;
    let obj = { ...OPTIONS };
    if (readOnly) {
      obj['readOnly'] = readOnly;
    }
    return obj;
  }, [OPTIONS, props]);

  return (
    <Box>
      <SpaceBetween size="xs" direction="vertical">
        {errorText ? <StatusIndicator type="error">{errorText}</StatusIndicator> : null}
        <Editor
          theme="vs-dark"
          width={`${size ? size?.width : '80vw'}`}
          height={`${size ? size?.height : '80vh'}`}
          defaultLanguage={language || 'json'}
          language={language || 'json'}
          value={value}
          onChange={handleEditorChange}
          options={options}
          onMount={(editor, monaco) => {
            if (editor?.getAction) {
              setTimeout(function() {
                editor?.getAction('editor.action.formatDocument')?.run();
              }, 300);
            }
          }}
        />
      </SpaceBetween>
    </Box>
  );
}

const MonacoEditorWidgetWrapper = props => {
  return (
    <CustomErrorBoundary title="Unable to render Monaco editor widget">
      <MonacoEditorWidget {...props} />
    </CustomErrorBoundary>
  );
};

export default MonacoEditorWidgetWrapper;
