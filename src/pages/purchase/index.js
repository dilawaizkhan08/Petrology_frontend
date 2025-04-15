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
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Divider
} from '@mui/material';

const PurchaseForm = () => {
  const { register, handleSubmit, formState: { errors }, watch } = useForm();
  const [items, setItems] = useState([]);
  const [availableItems, setAvailableItems] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  const [netAmount, setNetAmount] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [balance, setBalance] = useState(0);

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  // Watch discount and payment from the form
  const watchDiscountPercentage = watch('discount_percentage') || 0;
  const watchPayment = watch('payment') || 0;

  useEffect(() => {
    const fetchItemsAndSuppliers = async () => {
      try {
        const [itemsRes, suppliersRes] = await Promise.all([
          fetch(`${apiBaseUrl}/items`),
          fetch(`${apiBaseUrl}/suppliers`)
        ]);

        const itemsData = await itemsRes.json();
        const suppliersData = await suppliersRes.json();

        setAvailableItems(itemsData);
        setSuppliers(suppliersData);
      } catch (error) {
        console.error("Failed to fetch items or suppliers:", error);
      }
    };
    fetchItemsAndSuppliers();
  }, []);

  useEffect(() => {
    const totalNet = items.reduce((sum, item) => {
      const qty = parseFloat(item.qty) || 0;
      const rate = parseFloat(item.purchaseRate) || 0;
      return sum + qty * rate;
    }, 0);

    const discountAmt = (totalNet * parseFloat(watchDiscountPercentage)) / 100;
    const finalBalance = totalNet - discountAmt - parseFloat(watchPayment);

    setNetAmount(totalNet);
    setDiscount(discountAmt);
    setBalance(finalBalance);
  }, [items, watchDiscountPercentage, watchPayment]);

  const onSubmit = async (data) => {
    const payload = {
      purchase_no: data.purchase_no,
      supplier_name: data.supplier_name,
      discount_percentage: Number(data.discount_percentage) || 0,
      discount: discount,
      net_amount: netAmount,
      payment: Number(data.payment) || 0,
      billRemarks: data.billRemarks || '',
      items: items.map((item) => ({
        item_name: item.item_name,
        qty: Number(item.qty),
        purchaseRate: Number(item.purchaseRate),
        saleRate: Number(item.saleRate),
        netAmount: Number(item.qty) * Number(item.purchaseRate),
        description: item.description || ''
      }))
    };

    try {
      const response = await fetch(`${apiBaseUrl}/purchases`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const result = await response.json();
        alert('Purchase Invoice submitted successfully!');
        console.log('Success:', result);
      } else {
        const errorData = await response.json();
        console.error('Submission failed:', errorData);
        alert('Failed to submit invoice. Please check the form data.');
      }
    } catch (error) {
      console.error('Fetch error:', error);
      alert('Something went wrong while submitting the form.');
    }
  };

  const addItem = () => {
    setItems([...items, {
      item_name: '',
      qty: '',
      purchaseRate: '',
      saleRate: '',
      netAmount: '',
      description: ''
    }]);
  };

  const removeItem = (index) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 4 }}>
      <Paper sx={{ p: 4, borderRadius: '8px', boxShadow: 3 }}>
        <Typography variant="h4" gutterBottom align="center" color="primary">
          Purchase Invoice
        </Typography>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Purchase No."
                {...register('purchase_no', { required: 'Purchase number is required' })}
                error={!!errors.purchase_no}
                helperText={errors.purchase_no?.message}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth error={!!errors.supplier_name}>
                <InputLabel id="supplier-label">Supplier</InputLabel>
                <Select
                  labelId="supplier-label"
                  label="Supplier"
                  defaultValue=""
                  {...register('supplier_name', { required: 'Supplier is required' })}
                >
                  {suppliers.map((supplier) => (
                    <MenuItem key={supplier.id} value={supplier.name}>
                      {supplier.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Discount (%)"
                type="number"
                {...register('discount_percentage')}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Payment"
                type="number"
                {...register('payment')}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Bill Remarks"
                multiline
                rows={2}
                {...register('billRemarks')}
              />
            </Grid>
          </Grid>

          <Typography variant="h5" align="center" sx={{ mt: 4 }} color="primary">
            Item Details
          </Typography>

          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  {["Item Name", "Qty", "Purchase Rate", "Sale Rate", "Description", "Actions"].map((h, i) => (
                    <TableCell key={i} align="center">{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <FormControl fullWidth>
                        <InputLabel id={`item-select-${index}`}>Item Name</InputLabel>
                        <Select
                          value={item.item_name}
                          label="Item Name"
                          onChange={(e) => {
                            const newItems = [...items];
                            newItems[index].item_name = e.target.value;
                            setItems(newItems);
                          }}
                        >
                          {availableItems.map((itemOption) => (
                            <MenuItem key={itemOption.item_name} value={itemOption.item_name}>
                              {itemOption.item_name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </TableCell>
                    <TableCell>
                      <TextField
                        fullWidth
                        type="number"
                        label="Qty"
                        value={item.qty}
                        onChange={(e) => {
                          const newItems = [...items];
                          newItems[index].qty = e.target.value;
                          setItems(newItems);
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        fullWidth
                        type="number"
                        label="Purchase Rate"
                        value={item.purchaseRate}
                        onChange={(e) => {
                          const newItems = [...items];
                          newItems[index].purchaseRate = e.target.value;
                          setItems(newItems);
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        fullWidth
                        type="number"
                        label="Sale Rate"
                        value={item.saleRate}
                        onChange={(e) => {
                          const newItems = [...items];
                          newItems[index].saleRate = e.target.value;
                          setItems(newItems);
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        fullWidth
                        label="Description"
                        value={item.description}
                        onChange={(e) => {
                          const newItems = [...items];
                          newItems[index].description = e.target.value;
                          setItems(newItems);
                        }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Button variant="contained" color="secondary" onClick={() => removeItem(index)}>
                        Remove
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ mt: 2 }}>
            <Button variant="outlined" onClick={addItem}>Add Item</Button>
          </Box>

          <Divider sx={{ my: 4 }} />

          {/* Summary */}
          <Box sx={{ my: 2 }}>
            <Typography variant="body1"><strong>Net Amount:</strong> Rs. {netAmount.toFixed(2)}</Typography>
            <Typography variant="body1"><strong>Discount:</strong> Rs. {discount.toFixed(2)}</Typography>
            <Typography variant="body1"><strong>Balance:</strong> Rs. {balance.toFixed(2)}</Typography>
          </Box>

          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Button type="submit" variant="contained" color="primary">
              Submit Purchase
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default PurchaseForm;
