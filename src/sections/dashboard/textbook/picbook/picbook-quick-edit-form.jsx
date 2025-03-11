'use client';

import { useCallback } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import { USER_STATUS_OPTIONS } from 'src/_mock';

// ----------------------------------------------------------------------

export function PicbookQuickEditForm({ currentUser, open, onClose }) {
  const handleSubmit = useCallback(async () => {
    try {
      onClose();
      console.log('DATA SUBMITTED');
    } catch (error) {
      console.error(error);
    }
  }, [onClose]);

  return (
    <Dialog
      fullWidth
      maxWidth={false}
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { maxWidth: 720 },
      }}
    >
      <DialogTitle>快速编辑</DialogTitle>

      <DialogContent>
        <Stack spacing={3} sx={{ mt: 3 }}>
          <TextField
            fullWidth
            label="名称"
            value={currentUser?.name}
            InputProps={{
              readOnly: true,
              sx: { typography: 'subtitle2' },
            }}
          />

          <TextField
            select
            fullWidth
            label="状态"
            value={currentUser?.status}
          >
            {USER_STATUS_OPTIONS.map((status) => (
              <MenuItem key={status.value} value={status.value}>
                {status.label}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button variant="outlined" onClick={onClose}>
          取消
        </Button>

        <Button variant="contained" onClick={handleSubmit}>
          保存
        </Button>
      </DialogActions>
    </Dialog>
  );
} 