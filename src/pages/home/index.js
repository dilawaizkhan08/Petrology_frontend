import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { TextField, Button, Grid, Typography, Box, Paper, Snackbar, Alert } from '@mui/material';
import axios from 'axios';

const ItemForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const [alertOpen, setAlertOpen] = useState(false); // State for alert
  const [alertMessage, setAlertMessage] = useState(''); // State for storing alert message
  const [alertSeverity, setAlertSeverity] = useState('success'); // State for managing alert severity

  // Define the API base URL (can also be set via environment variables)
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  console.log(apiBaseUrl)

  const onSubmit = async (data) => {
    console.log('before submission')
    try {
      // Send POST request to Flask backend
      const response = await fetch(`${apiBaseUrl}/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

    const result = await response.json();

      console.log('Item created:', result);

      // Update alert state for success message
      setAlertSeverity('success');
      setAlertMessage('Item created successfully!');
      setAlertOpen(true);
    } catch (error) {
      console.error('Error creating item:', error);

      // Default error message
      let errorMessage = 'Failed to create item.';

      // Check for response error data
      if (error.response && error.response.data) {
        errorMessage = error.response.data.message || errorMessage;
      } else if (error.request) {
        // If no response, there may have been a network issue
        errorMessage = 'Network error. Please try again later.';
      }

      // Update alert state for error message
      setAlertSeverity('error');
      setAlertMessage(errorMessage);
      setAlertOpen(true);
    }
  };

  // Close the alert message
  const handleAlertClose = () => {
    setAlertOpen(false);
  };

  return (
    <Paper
      elevation={3}
      sx={{
        flex: 1,
        margin: 3,
        padding: 4,
        borderRadius: 3,
      }}
    >
      <Typography variant="h5" gutterBottom>
        Add Item Details
      </Typography>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Item Name"
              {...register('item_name', { required: 'Item Name is required' })}
              error={!!errors.itemName}
              helperText={errors.itemName?.message}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Item Code"
              {...register('item_code', { required: 'Item Code is required' })}
              error={!!errors.itemCode}
              helperText={errors.itemCode?.message}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Min Level"
              type="number"
              {...register('minimum_level')}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Qty per Packet"
              type="number"
              {...register('qty_per_packet')}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Purchase Rate"
              type="number"
              {...register('purchase_rate')}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Sale Rate"
              type="number"
              {...register('sale_rate')}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Wholesale Rate"
              type="number"
              {...register('wholesale_rate')}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Sale Discount %"
              type="number"
              {...register('sale_discount_percent')}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Opening Stock"
              type="number"
              {...register('opening_stock')}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Unit" {...register('unit')} />
          </Grid>

          {/* Button Row */}
          <Grid item xs={12}>
            <Box sx={{ textAlign: 'right' }}>
              <Button
                variant="contained"
                color="primary"
                type="submit"
                sx={{
                  padding: '10px 24px',
                  fontSize: '16px',
                }}
              >
                Submit
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>

      {/* Alert Snackbar */}
      <Snackbar
        open={alertOpen}
        autoHideDuration={6000}
        onClose={handleAlertClose}
      >
        <Alert onClose={handleAlertClose} severity={alertSeverity}>
          {alertMessage}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default ItemForm;
