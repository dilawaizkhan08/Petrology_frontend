import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  TextField,
  Button,
  Grid,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel
} from '@mui/material';

const SaleForm = () => {
  const { register, handleSubmit, formState: { errors }, watch } = useForm();
  const [items, setItems] = useState([]);
  const [availableItems, setAvailableItems] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [isOnline, setIsOnline] = useState(false);
  const [creditDescription, setCreditDescription] = useState('');
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    const fetchItemsAndCustomers = async () => {
      try {
        const [itemsRes, customersRes] = await Promise.all([
          fetch(`${apiBaseUrl}/items`),
          fetch(`${apiBaseUrl}/customers`)
        ]);
        const itemsData = await itemsRes.json();
        const customersData = await customersRes.json();
        setAvailableItems(itemsData);
        setCustomers(customersData);
      } catch (error) {
        console.error("Failed to fetch items or customers:", error);
      }
    };
    fetchItemsAndCustomers();
  }, []);

  const calculateNetAmount = () => {
    return items.reduce((total, item) => {
      const matchedItem = availableItems.find(i => i.id === item.item_id);
      const unitPrice = matchedItem?.price || 0;
      const quantity = (Number(item.current_reading) || 0) - (Number(item.previous_reading) || 0);
      return total + quantity * unitPrice;
    }, 0);
  };

  const onSubmit = async (data) => {
    const cash = Number(data.cash);
    const netAmount = calculateNetAmount();

    const payload = {
      slip_no: data.slip_no,
      salesperson: data.salesperson,
      cashier: data.cashier,
      customer_id: data.customer_id,
      cash: cash,
      is_online: isOnline,
      bank_name: isOnline ? data.bank_name : null,
      account_number: isOnline ? data.account_number : null,
      credit_description: netAmount > cash ? creditDescription : null,
      items: items.map(item => ({
        item_id: item.item_id,
        previous_reading: Number(item.previous_reading),
        current_reading: Number(item.current_reading)
      }))
    };

    console.log("Payload:", JSON.stringify(payload, null, 2));

    try {
      const response = await fetch(`${apiBaseUrl}/create-sale`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const result = await response.json();
        alert('Sale created successfully!');
        console.log('Success:', result);
      } else {
        const errorData = await response.json();
        console.error('Submission failed:', errorData);
        alert('Failed to create sale. Please check the form data.');
      }
    } catch (error) {
      console.error('Fetch error:', error);
      alert('Something went wrong while submitting the form.');
    }
  };

  const addItem = () => {
    setItems([...items, { item_id: '', previous_reading: '', current_reading: '' }]);
  };

  const removeItem = (index) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const netAmount = calculateNetAmount();
  const cash = Number(watch('cash') || 0);
  const showCredit = netAmount > cash;

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 4 }}>
      <Paper sx={{ p: 4, borderRadius: '8px', boxShadow: 3 }}>
        <Typography variant='h4' gutterBottom align='center' color='primary'>
          Create Sale
        </Typography>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label='Slip No.'
                {...register('slip_no', { required: 'Slip number is required' })}
                error={!!errors.slip_no}
                helperText={errors.slip_no?.message}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label='Salesperson'
                {...register('salesperson', { required: 'Salesperson is required' })}
                error={!!errors.salesperson}
                helperText={errors.salesperson?.message}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label='Cashier'
                {...register('cashier', { required: 'Cashier is required' })}
                error={!!errors.cashier}
                helperText={errors.cashier?.message}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth error={!!errors.customer_id}>
                <InputLabel id='customer-label'>Customer</InputLabel>
                <Select labelId='customer-label' {...register('customer_id', { required: 'Customer is required' })}>
                  {customers.map(customer => (
                    <MenuItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Typography variant='h4' align='center' sx={{ mt: 4 }} color='primary'>
            Item Details
          </Typography>

          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell align='center'>Item Name</TableCell>
                  <TableCell align='center'>Previous Reading</TableCell>
                  <TableCell align='center'>Current Reading</TableCell>
                  <TableCell align='center'>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <FormControl fullWidth>
                        <InputLabel id={`item-select-${index}`}>Item Name</InputLabel>
                        <Select
                          value={item.item_id}
                          onChange={e => {
                            const newItems = [...items];
                            newItems[index].item_id = e.target.value;
                            setItems(newItems);
                          }}
                          label='Item Name'
                        >
                          {availableItems.map(itemOption => (
                            <MenuItem key={itemOption.id} value={itemOption.id}>
                              {itemOption.item_name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </TableCell>
                    <TableCell>
                      <TextField
                        fullWidth
                        type='number'
                        label='Previous Reading'
                        value={item.previous_reading}
                        onChange={e => {
                          const newItems = [...items];
                          newItems[index].previous_reading = e.target.value;
                          setItems(newItems);
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        fullWidth
                        type='number'
                        label='Current Reading'
                        value={item.current_reading}
                        onChange={e => {
                          const newItems = [...items];
                          newItems[index].current_reading = e.target.value;
                          setItems(newItems);
                        }}
                      />
                    </TableCell>
                    <TableCell align='center'>
                      <Button variant='contained' color='secondary' onClick={() => removeItem(index)}>
                        Remove
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ mt: 2 }}>
            <Button variant='contained' onClick={addItem}>
              Add New Item
            </Button>
          </Box>

          <Grid container spacing={3} sx={{ mt: 4 }}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label='Cash'
                type='number'
                {...register('cash', { required: 'Cash amount is required' })}
                error={!!errors.cash}
                helperText={errors.cash?.message}
              />
            </Grid>

            <Grid item xs={12} md={4} sx={{ display: 'flex', alignItems: 'center' }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={isOnline}
                    onChange={(e) => setIsOnline(e.target.checked)}
                  />
                }
                label='Paid Online?'
              />
            </Grid>
          </Grid>

          {isOnline && (
            <Grid container spacing={3} sx={{ mt: 2 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label='Bank Name'
                  {...register('bank_name')}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label='Account Number'
                  {...register('account_number')}
                />
              </Grid>
            </Grid>
          )}

          {showCredit && (
            <Grid container spacing={3} sx={{ mt: 2 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label='Credit Description'
                  value={creditDescription}
                  onChange={e => setCreditDescription(e.target.value)}
                />
              </Grid>
            </Grid>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Typography variant='h6'>Net Amount: Rs. {netAmount}</Typography>
            <Button type='submit' variant='contained' color='primary'>
              Submit Sale
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default SaleForm;
