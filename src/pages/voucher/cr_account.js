import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { jsPDF } from 'jspdf';
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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';

const VoucherForm = () => {
  const { handleSubmit } = useForm();
  const [accountDetails, setAccountDetails] = useState([{ date: '', accountCode: '', accountName: '', debit: '' }]);
  const [voucherNo, setVoucherNo] = useState('');
  const [crAccount, setCrAccount] = useState('');
  const [description, setDescription] = useState('');
  const [vouchers, setVouchers] = useState([]);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [selectedAccounts, setSelectedAccounts] = useState([]);
  const [open, setOpen] = useState(false);
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  const handleAccountDetailChange = (index, e) => {
    const newDetails = [...accountDetails];
    newDetails[index][e.target.name] = e.target.value;
    setAccountDetails(newDetails);
  };

  const handleAddAccountDetail = () => {
    setAccountDetails([...accountDetails, { date: '', accountCode: '', accountName: '', debit: '' }]);
  };

  const fetchVouchers = async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/vouchers`);
      const data = await response.json();
      setVouchers(data);
    } catch (err) {
      console.error('Error fetching vouchers:', err);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

  const resetForm = () => {
    setVoucherNo('');
    setCrAccount('');
    setDescription('');
    setAccountDetails([{ date: '', accountCode: '', accountName: '', debit: '' }]);
  };

  const onSubmit = async () => {
    try {
      const payload = {
        voucher_no: voucherNo,
        cr_account: crAccount,
        description,
        accounts: accountDetails.map(detail => ({
          date: detail.date,
          account_code: detail.accountCode,
          account_name: detail.accountName,
          debit: parseFloat(detail.debit),
        })),
      };

      const response = await fetch(`${apiBaseUrl}/vouchers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Failed to create voucher');

      await fetchVouchers();
      alert('Voucher created!');
      resetForm();
    } catch (err) {
      console.error('Error submitting:', err);
      alert('Error occurred while creating voucher');
    }
  };

  const handleView = async (voucher) => {
    try {
      const response = await fetch(`${apiBaseUrl}/vouchers/${voucher.id}`);
      const data = await response.json();
      setSelectedVoucher(data);
      setSelectedAccounts(data.accounts);
      setOpen(true);
    } catch (err) {
      console.error('Error fetching voucher details:', err);
    }
  };

  const handleGenerateReport = async (voucher) => {
    try {
      const response = await fetch(`${apiBaseUrl}/vouchers/${voucher.id}`);
      const data = await response.json();
      const doc = new jsPDF();
  
      doc.setFontSize(16);
      doc.text(`Voucher No: ${data.voucher_no}`, 14, 20);
      doc.setFontSize(12);
      doc.text(`Date: ${new Date(data.date).toLocaleString()}`, 14, 30);
      doc.text(`Cr. Account: ${data.cr_account}`, 14, 40);
      doc.text(`Description: ${data.description}`, 14, 50);
  
      let y = 60;
      doc.text('Account Details:', 14, y);
      y += 10;
  
      // Draw Table Header
      doc.setFontSize(10);
      doc.text('Date', 14, y);
      doc.text('Account Code', 40, y);
      doc.text('Account Name', 100, y);
      doc.text('Debit', 160, y);
  
      // Draw the rows of the table
      y += 10;
      data.accounts.forEach((acc, index) => {
        doc.text(new Date(acc.date).toLocaleString(), 14, y);
        doc.text(acc.account_code, 40, y);
        doc.text(acc.account_name, 100, y);
        doc.text(acc.debit.toString(), 160, y);
        y += 8;
      });
      doc.setFontSize(12);
      doc.text(`Total Debit: ${data.total_debit.toFixed(2)}`, 14, y);
  
      doc.save(`voucher_${data.voucher_no}.pdf`);
    } catch (err) {
      console.error('Error generating report:', err);
    }
  };
  

  const handleDelete = async (id) => {
    try {
      await fetch(`${apiBaseUrl}/vouchers/${id}`, { method: 'DELETE' });
      await fetchVouchers();
    } catch (err) {
      console.error('Error deleting voucher:', err);
    }
  };

  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant='h4' gutterBottom>
        Credit Voucher
      </Typography>

      <Paper sx={{ padding: 5, marginBottom: 4 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label='Voucher No.'
                variant='outlined'
                fullWidth
                value={voucherNo}
                onChange={e => setVoucherNo(e.target.value)}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label='Cr. Account'
                variant='outlined'
                fullWidth
                value={crAccount}
                onChange={e => setCrAccount(e.target.value)}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label='Description'
                variant='outlined'
                fullWidth
                multiline
                rows={4}
                value={description}
                onChange={e => setDescription(e.target.value)}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant='h6'>Account Detail</Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date & Time</TableCell>
                      <TableCell>Account Code</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell>Debit</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {accountDetails.map((detail, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <TextField
                            type='datetime-local'
                            name='date'
                            value={detail.date}
                            onChange={e => handleAccountDetailChange(index, e)}
                            fullWidth
                            required
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            name='accountCode'
                            value={detail.accountCode}
                            onChange={e => handleAccountDetailChange(index, e)}
                            fullWidth
                            required
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            name='accountName'
                            value={detail.accountName}
                            onChange={e => handleAccountDetailChange(index, e)}
                            fullWidth
                            required
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            type='number'
                            name='debit'
                            value={detail.debit}
                            onChange={e => handleAccountDetailChange(index, e)}
                            fullWidth
                            required
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>

            <Grid item xs={12}>
              <Button variant='outlined' onClick={handleAddAccountDetail} sx={{ mt: 2 }}>
                Add Account Detail
              </Button>
            </Grid>

            <Grid item xs={12}>
              <Button variant='contained' type='submit' sx={{ mt: 2 }}>
                Submit
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>

      <Typography variant='h5' gutterBottom>
        Saved Vouchers
      </Typography>

      <TableContainer component={Paper} sx={{ padding: 2 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: 'primary.main' }}>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Voucher No</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Cr. Account</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Description</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {vouchers.map(voucher => (
              <TableRow key={voucher.id}>
                <TableCell>{voucher.voucher_no}</TableCell>
                <TableCell>{voucher.cr_account}</TableCell>
                <TableCell>{voucher.description}</TableCell>
                <TableCell>
                  <Box display='flex' gap={1}>
                    <IconButton color='primary' onClick={() => handleView(voucher)}>
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton color='secondary' onClick={() => handleGenerateReport(voucher)}>
                      <FileDownloadIcon />
                    </IconButton>
                    <IconButton color='error' onClick={() => handleDelete(voucher.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* View Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth='sm' fullWidth>
        <DialogTitle>Voucher Details</DialogTitle>
        <DialogContent>
          {selectedVoucher && (
            <>
              <TextField label='Voucher No' fullWidth margin='dense' value={selectedVoucher.voucher_no} disabled />
              <TextField label='Cr. Account' fullWidth margin='dense' value={selectedVoucher.cr_account} disabled />
              <TextField label='Description' fullWidth margin='dense' value={selectedVoucher.description} disabled />
              <Typography variant='subtitle1' sx={{ mt: 2 }}>
                Accounts:
              </Typography>
              <TableContainer component={Paper} sx={{ mt: 2 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Account Code</TableCell>
                      <TableCell>Account Name</TableCell>
                      <TableCell>Debit</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedAccounts.map((acc, i) => (
                      <TableRow key={i}>
                        <TableCell>{new Date(acc.date).toLocaleString()}</TableCell>
                        <TableCell>{acc.account_code}</TableCell>
                        <TableCell>{acc.account_name}</TableCell>
                        <TableCell>{acc.debit}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <Typography variant="subtitle1" gutterBottom>
                  Total Debit: {selectedVoucher?.total_debit}
                </Typography>
              </TableContainer>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
};

export default VoucherForm;
