import { Controller, useFormContext } from 'react-hook-form';

import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';

import { HelperText } from './help-text';

// ----------------------------------------------------------------------

export function RHFSlider({ name, helperText, slotProps, ...other }) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <Box {...slotProps?.wrapper}>
          <Slider {...field} valueLabelDisplay="auto" {...other} />

          <HelperText
            {...slotProps?.helperText}
            disableGutters
            errorMessage={error?.message}
            helperText={helperText}
          />
        </Box>
      )}
    />
  );
}
