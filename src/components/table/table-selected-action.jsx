import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import Typography from '@mui/material/Typography';

// ----------------------------------------------------------------------

export function TableSelectedAction({
  sx,
  dense,
  action,
  rowCount,
  numSelected,
  onSelectAllRows,
  ...other
}) {
  if (!numSelected) {
    return null;
  }

  return (
    <Box
      sx={[
        () => ({
          pl: 1,
          pr: 2,
          top: 0,
          left: 0,
          width: 1,
          zIndex: 9,
          height: 58,
          display: 'flex',
          position: 'absolute',
          alignItems: 'center',
          bgcolor: 'primary.lighter',
          ...(dense && { height: 38 }),
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      <Checkbox
        indeterminate={!!numSelected && numSelected < rowCount}
        checked={!!rowCount && numSelected === rowCount}
        onChange={(event) => onSelectAllRows(event.target.checked)}
        inputProps={{
          id: 'deselect-all-checkbox',
          'aria-label': 'Deselect all checkbox',
        }}
      />

      <Typography
        variant="subtitle2"
        sx={{
          ml: 2,
          flexGrow: 1,
          color: 'primary.main',
          ...(dense && { ml: 3 }),
        }}
      >
        {numSelected} selected
      </Typography>

      {action && action}
    </Box>
  );
}
