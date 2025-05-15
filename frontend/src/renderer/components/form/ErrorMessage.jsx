import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';

function ErrorMessage({ open, onClose, title, message }) {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            aria-labelledby="error-dialog-title"
            aria-describedby="error-dialog-description"
        >
            <DialogTitle id="error-dialog-title" sx={{ color: 'error.main' }}>
                {title || 'Error'}
            </DialogTitle>
            <DialogContent>
                <Typography id="error-dialog-description">
                    {message}
                </Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="primary" autoFocus>
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default ErrorMessage; 