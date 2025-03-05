import { varAlpha } from 'minimal-shared/utils';
import { useId, forwardRef, useCallback } from 'react';

import Box from '@mui/material/Box';

import { Iconify } from 'src/components/iconify';

import {
  HelperText,
  CaptionText,
  CenteredInput,
  CounterButton,
  InputContainer,
  NumberInputRoot,
} from './styles';

// ----------------------------------------------------------------------

export const NumberInput = forwardRef((props, ref) => {
  const {
    sx,
    error,
    value,
    onChange,
    disabled,
    slotProps,
    helperText,
    captionText,
    hideDivider,
    hideButtons,
    disableInput,
    min = 0,
    max = 9999,
    ...other
  } = props;

  const id = useId();

  const currentValue = value ?? 0;

  const isDecrementDisabled = currentValue <= min || disabled;
  const isIncrementDisabled = currentValue >= max || disabled;

  const handleDecrement = useCallback(
    (event) => {
      if (!isDecrementDisabled) {
        onChange?.(event, currentValue - 1);
      }
    },
    [isDecrementDisabled, onChange, currentValue]
  );

  const handleIncrement = useCallback(
    (event) => {
      if (!isIncrementDisabled) {
        onChange?.(event, currentValue + 1);
      }
    },
    [isIncrementDisabled, onChange, currentValue]
  );

  const handleChange = useCallback(
    (event) => {
      const transformedValue = transformNumberOnChange(event.target.value, {
        min,
        max,
      });
      onChange?.(event, transformedValue);
    },
    [max, min, onChange]
  );

  return (
    <Box {...slotProps?.wrapper}>
      <NumberInputRoot
        ref={ref}
        sx={[
          (theme) => ({
            '--border-color': varAlpha(theme.vars.palette.grey['500Channel'], 0.2),
            '--vertical-divider-color': hideDivider
              ? 'transparent'
              : varAlpha(theme.vars.palette.grey['500Channel'], 0.2),
            '--input-background':
              !disabled && error
                ? varAlpha(theme.vars.palette.error.mainChannel, 0.08)
                : varAlpha(theme.vars.palette.grey['500Channel'], 0.08),
          }),
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
        {...other}
      >
        {!hideButtons && (
          <CounterButton
            disabled={isDecrementDisabled}
            onClick={handleDecrement}
            {...slotProps?.button}
          >
            <Iconify width={16} icon="mingcute:minimize-line" />
          </CounterButton>
        )}

        <InputContainer {...slotProps?.inputWrapper}>
          <CenteredInput
            name={id}
            disabled={disabled || disableInput}
            value={currentValue}
            onChange={handleChange}
            {...slotProps?.input}
          />

          {captionText && <CaptionText {...slotProps?.captionText}>{captionText}</CaptionText>}
        </InputContainer>

        {!hideButtons && (
          <CounterButton
            disabled={isIncrementDisabled}
            onClick={handleIncrement}
            {...slotProps?.button}
          >
            <Iconify width={16} icon="mingcute:add-line" />
          </CounterButton>
        )}
      </NumberInputRoot>

      {helperText && (
        <HelperText error={error} {...slotProps?.helperText}>
          {helperText}
        </HelperText>
      )}
    </Box>
  );
});

// ----------------------------------------------------------------------

export function transformNumberOnChange(value, options) {
  const { min = 0, max = 9999 } = options ?? {};

  if (!value || value.trim() === '') {
    return 0;
  }

  const numericValue = Number(value.trim());

  if (!Number.isNaN(numericValue)) {
    // Clamp the value between min and max
    return Math.min(Math.max(numericValue, min), max);
  }

  return 0;
}
