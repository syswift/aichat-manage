import FormHelperText from '@mui/material/FormHelperText';

// ----------------------------------------------------------------------

export function HelperText({ sx, helperText, errorMessage, disableGutters, ...other }) {
  if (errorMessage || helperText) {
    return (
      <FormHelperText
        error={!!errorMessage}
        sx={[
          {
            mx: disableGutters ? 0 : 1.75,
          },
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
        {...other}
      >
        {errorMessage || helperText}
      </FormHelperText>
    );
  }

  return null;
}
