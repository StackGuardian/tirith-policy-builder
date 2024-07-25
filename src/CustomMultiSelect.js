import { Multiselect } from '@cloudscape-design/components';
import React, { useEffect, useState } from 'react';

const CustomMultiSelect = props => {
  const { prefix = '' } = props;
  const [multiSelectOptions, setMultiSelectOptions] = useState(props?.options || []);
  const [errorText, setErrorText] = useState('');
  const [statusType, setStatusType] = useState('');

  useEffect(() => {
    if (props?.options) {
      setMultiSelectOptions(props?.options);
    }
  }, [props.options]);

  return (
    <Multiselect
      {...props}
      statusType={statusType}
      errorText={errorText}
      options={multiSelectOptions}
      onLoadItems={evt => {
        setErrorText('');
        setStatusType('');
        let defaultFilteredOptions = props?.options?.filter(val =>
          val.label.toLocaleLowerCase().includes(evt.detail.filteringText.toLowerCase())
        );
        if (evt.detail.filteringText && !evt.detail.filteringText.includes(' ')) {
          defaultFilteredOptions.push({
            value: evt.detail.filteringText,
            label: `${prefix}${evt.detail.filteringText}`
          });
        }
        setMultiSelectOptions(defaultFilteredOptions);
      }}
    />
  );
};

export default CustomMultiSelect;
