'use client';

import { createClient } from '@supabase/supabase-js';
import { useState, useEffect, useCallback } from 'react';

import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Snackbar from '@mui/material/Snackbar';
import TextField from '@mui/material/TextField';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import { useRouter } from 'src/routes/hooks';

import { USER_STATUS_OPTIONS } from 'src/_mock';

// Initialize the Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// ----------------------------------------------------------------------

export function PicbookQuickEditForm({ currentUser, open, onClose }) {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    name: '',
    note: '',
    status: '',
  });
  
  // State for handling notifications
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser?.name || '',
        note: currentUser?.note || '',
        status: currentUser?.status || '',
      });
    }
  }, [currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  const handleSubmit = useCallback(async () => {
    try {
      // Update the picbook record in Supabase
      const { error } = await supabase
        .from('picbook')
        .update({
          name: formData.name,
          note: formData.note,
          status: formData.status,
        })
        .eq('id', currentUser?.id);

      if (error) {
        throw error;
      }

      setNotification({
        open: true,
        message: '更新成功',
        severity: 'success'
      });
      onClose();
      router.refresh();
    } catch (error) {
      console.error('Update failed:', error);
      setNotification({
        open: true,
        message: `更新失败: ${error.message}`,
        severity: 'error'
      });
    }
  }, [formData, currentUser, onClose, router]);

  return (
    <>
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
              name="name"
              label="名称"
              value={formData.name}
              onChange={handleChange}
            />

            <TextField
              fullWidth
              name="note"
              label="简介"
              value={formData.note}
              placeholder="输入简介内容..."
              onChange={handleChange}
              multiline
              rows={4}
            />

            <TextField
              select
              fullWidth
              name="status"
              label="状态"
              value={formData.status}
              onChange={handleChange}
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

      <Snackbar 
        open={notification.open} 
        autoHideDuration={6000} 
        onClose={handleCloseNotification}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity} 
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </>
  );
}