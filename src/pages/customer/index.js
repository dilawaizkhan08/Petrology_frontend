import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  TextField,
  Button,
  Grid,
  Typography,
  Box,
  Paper,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Snackbar,
  Alert,
} from '@mui/material';

const CustomerForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [alertSeverity, setAlertSeverity] = useState('success');
  const [alertMessage, setAlertMessage] = useState('');

  // Backend API URL
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL; // Update with your actual API URL

  const onSubmit = async (data) => {
    try {
      const response = await fetch(`${apiBaseUrl}/customers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data), // Send the form data as JSON
      });

      if (!response.ok) {
        throw new Error('Failed to add customer');
      }

      const result = await response.json();
      console.log('Customer added:', result);
      // Show success message
      setAlertSeverity('success');
      setAlertMessage('Customer added successfully!');
      setOpenSnackbar(true);
      // Optionally reset form or do other actions
    } catch (error) {
      console.error('Error adding customer:', error);
      // Show error message
      setAlertSeverity('error');
      setAlertMessage('Error adding customer. Please try again.');
      setOpenSnackbar(true);
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <Paper
      elevation={3}
      sx={{
        flex: 1,
        margin: 3,
        padding: 4,
        borderRadius: 3,
        position: 'relative',
      }}
    >
      <Typography variant="h5" gutterBottom>
        Add Customer Details
      </Typography>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Name"
              {...register('name', { required: 'Name is required' })}
              error={!!errors.name}
              helperText={errors.name?.message}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Address" {...register('address')} />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Telephone" {...register('tel')} />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Mobile" {...register('mobile')} />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              {...register('email')}
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              label="Cash Balance"
              type="number"
              {...register('cash_balance', {
                valueAsNumber: true,
              })}
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <FormControl fullWidth error={!!errors.cashBalanceType}>
              <InputLabel id="balance-type-label">Type</InputLabel>
              <Select
                labelId="balance-type-label"
                label="Type"
                defaultValue=""
                {...register('cash_balance_type', { required: 'Select type' })}
              >
                <MenuItem value="Receivable">Receivable</MenuItem>
                <MenuItem value="Payable">Payable</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ textAlign: 'right', mt: 3 }}>
              <Button
                variant="contained"
                color="primary"
                type="submit"
                sx={{
                  padding: '12px 24px',
                  fontSize: '16px',
                }}
              >
                Submit
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>

      {/* Snackbar for success/error messages */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={alertSeverity}
          sx={{ width: '100%' }}
        >
          {alertMessage}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default CustomerForm;
