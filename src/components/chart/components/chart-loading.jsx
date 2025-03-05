import { mergeClasses } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';

import { chartClasses } from '../classes';

// ----------------------------------------------------------------------

export function ChartLoading({ sx, className, type, ...other }) {
  const circularTypes = ['donut', 'radialBar', 'pie', 'polarArea'];

  return (
    <Box
      className={mergeClasses([chartClasses.loading, className])}
      sx={[
        () => ({
          top: 0,
          left: 0,
          width: 1,
          zIndex: 9,
          height: 1,
          p: 'inherit',
          overflow: 'hidden',
          alignItems: 'center',
          position: 'absolute',
          borderRadius: 'inherit',
          justifyContent: 'center',
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      <Skeleton
        variant="circular"
        sx={{
          width: 1,
          height: 1,
          borderRadius: 'inherit',
          ...(circularTypes.includes(type) && { borderRadius: '50%' }),
        }}
      />
    </Box>
  );
}
