import React, { useState } from 'react';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

/**
 * 알림 시스템 컴포넌트
 */
const NotificationSystem = ({ snackbar, onClose }) => {
  return (
    <Snackbar
      open={snackbar.open}
      autoHideDuration={6000}
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <Alert
        onClose={onClose}
        severity={snackbar.severity}
        sx={{ width: '100%' }}
      >
        {snackbar.message}
      </Alert>
    </Snackbar>
  );
};

/**
 * 알림 시스템 훅
 */
export const useNotification = () => {
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info' // 'success', 'error', 'warning', 'info'
  });

  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const handleSnackbarClose = (_, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return {
    snackbar,
    showSnackbar,
    handleSnackbarClose,
    NotificationComponent: () => (
      <NotificationSystem 
        snackbar={snackbar} 
        onClose={handleSnackbarClose} 
      />
    )
  };
};

export default NotificationSystem;