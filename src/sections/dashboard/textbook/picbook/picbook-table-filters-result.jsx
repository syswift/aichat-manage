'use client';

import { useCallback } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';

import { Iconify } from 'src/components/iconify';
import { chipProps, FiltersBlock, FiltersResult } from 'src/components/filters-result';

// ----------------------------------------------------------------------

export function PicbookTableFiltersResult({ filters, onResetPage, totalResults, sx }) {
  const { state: currentFilters, setState: updateFilters, resetState: resetFilters } = filters;

  const handleRemoveKeyword = useCallback(() => {
    onResetPage();
    updateFilters({ name: '' });
  }, [onResetPage, updateFilters]);

  const handleRemoveStatus = useCallback(() => {
    onResetPage();
    updateFilters({ status: 'all' });
  }, [onResetPage, updateFilters]);

  const handleReset = useCallback(() => {
    onResetPage();
    resetFilters();
  }, [onResetPage, resetFilters]);

  return (
    (currentFilters.status !== 'all' || !!currentFilters.name) && (
      <FiltersResult totalResults={totalResults} onReset={handleReset} sx={sx}>
        <FiltersBlock label="状态:" isShow={currentFilters.status !== 'all'}>
          <Chip
            {...chipProps}
            label={currentFilters.status}
            onDelete={handleRemoveStatus}
            sx={{ textTransform: 'capitalize' }}
          />
        </FiltersBlock>

        <FiltersBlock label="关键词:" isShow={!!currentFilters.name}>
          <Chip {...chipProps} label={currentFilters.name} onDelete={handleRemoveKeyword} />
        </FiltersBlock>
      </FiltersResult>
    )
  );
}

// ----------------------------------------------------------------------

function Block({ label, children, sx, ...other }) {
  return (
    <Stack
      component={Paper}
      variant="outlined"
      spacing={1}
      direction="row"
      sx={{
        p: 1,
        borderRadius: 1,
        overflow: 'hidden',
        borderStyle: 'dashed',
        ...sx,
      }}
      {...other}
    >
      <Box component="span" sx={{ typography: 'subtitle2' }}>
        {label}
      </Box>

      <Stack spacing={1} direction="row" flexWrap="wrap">
        {children}
      </Stack>
    </Stack>
  );
} 