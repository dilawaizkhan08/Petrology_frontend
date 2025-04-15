import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField, 
} from "@mui/material";
import { FileDownload, Delete, Visibility } from "@mui/icons-material";
import jsPDF from "jspdf";

const SalesReport = () => {
  const [data, setData] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [open, setOpen] = useState(false);
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL; // Adjust as needed

  useEffect(() => {
    fetch(`${apiBaseUrl}/sales`)
      .then((res) => res.json())
      .then((data) => setData(data))
      .catch((err) => console.error("Error fetching sales slips:", err));
  }, []);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString(); // You can adjust the format if needed
  };

  const handleView = async (id) => {
    try {
      const res = await fetch(`${apiBaseUrl}/sales/${id}`);
      const slip = await res.json();
      setSelectedRecord(slip);
      setOpen(true);
    } catch (error) {
      console.error("Error fetching slip details:", error);
    }
  };

  const generateReport = async () => {
    if (!selectedRecord) return;
    const slip = selectedRecord;
  
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
  
    // Add logo (replace with your base64 string or image URL via `doc.addImage`)
    // doc.addImage('data:image/png;base64,...', 'PNG', 14, 10, 30, 30);
    
    // Header
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Sales Slip Report", pageWidth / 2, 20, { align: "center" });
  
    // Sub Header
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Slip No: ${slip.slip_no}`, 14, 35);
    doc.text(`Date: ${formatDate(slip.date)}`, pageWidth - 14, 35, { align: "right" });
    doc.text(`Salesperson: ${slip.salesperson}`, 14, 42);
    doc.text(`Cashier: ${slip.cashier}`, 14, 49);
    doc.text(`Customer ID: ${slip.customer_id}`, 14, 56);
    doc.text(`Cash: ${slip.cash}`, 14, 63);
  
    // Items Table
    let y = 75;
    doc.setFont("helvetica", "bold");
    doc.text("Items", 14, y);
    y += 5;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
  
    const tableColumnItem = ["#", "Item ID", "Prev", "Curr", "Qty", "Rate", "Amount"];
    const tableRowsItem = slip.items.map((item, index) => [
      index + 1,
      item.item_id,
      item.previous_reading,
      item.current_reading,
      item.qty,
      item.unit_rate,
      item.net_amount,
    ]);
  
    tableColumnItem.forEach((col, i) => {
      doc.text(col, 14 + i * 25, y);
    });
  
    y += 6;
  
    tableRowsItem.forEach((row) => {
      row.forEach((cell, i) => {
        doc.text(String(cell), 14 + i * 25, y);
      });
      y += 6;
    });
  
    y += 10;
    doc.setFont("helvetica", "bold");
    doc.text("Amounts", 14, y);
    y += 5;
    doc.setFont("helvetica", "normal");
  
    const tableColumnAmount = ["Account", "Bank", "Cash", "Online", "Timestamp"];
    const tableRowsAmount = slip.amounts.map((amt) => [
      amt.account_number || "N/A",
      amt.bank_name || "N/A",
      amt.cash_in_hand,
      amt.is_online ? "Yes" : "No",
      new Date(amt.timestamp).toLocaleString(),
    ]);
  
    tableColumnAmount.forEach((col, i) => {
      doc.text(col, 14 + i * 35, y);
    });
  
    y += 6;
  
    tableRowsAmount.forEach((row) => {
      row.forEach((cell, i) => {
        doc.text(String(cell), 14 + i * 35, y);
      });
      y += 6;
    });
  
    y += 10;
    doc.setFont("helvetica", "bold");
    doc.text(`Total Quantity: ${slip.total_qty}`, 14, y);
    y += 6;
    doc.text(`Total Net Amount: ${slip.total_net_amount}`, 14, y);
    y += 6;
    doc.text(`Total Balance: ${slip.total_balance}`, 14, y);
  
    doc.save(`sales_slip_${slip.slip_no}.pdf`);
  };
  

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${apiBaseUrl}/sales/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setData(data.filter((item) => item.id !== id));
      } else {
        console.error("Failed to delete item");
      }
    } catch (error) {
      console.error("Delete failed", error);
    }
  };

  return (
    <TableContainer component={Paper} sx={{ padding: 2 }}>
      <Table>
        <TableHead>
          <TableRow sx={{ backgroundColor: 'primary.main' }}>
            {['Slip No', 'Salesperson', 'Cashier', 'Customer ID', 'Cash', 'Actions'].map(head => (
              <TableCell key={head} sx={{ color: 'white', fontWeight: 'bold' }}>
                {head}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map(item => (
            <TableRow key={item.id}>
              <TableCell>{item.slip_no}</TableCell>
              <TableCell>{item.salesperson}</TableCell>
              <TableCell>{item.cashier}</TableCell>
              <TableCell>{item.customer_id}</TableCell>
              <TableCell>{item.cash}</TableCell>
              <TableCell>
                <Box display='flex' gap={1}>
                  <IconButton color='primary' onClick={() => handleView(item.id)}>
                    <Visibility />
                  </IconButton>
                  <IconButton color='secondary' onClick={generateReport}>
                    <FileDownload />
                  </IconButton>
                  <IconButton color='error' onClick={() => handleDelete(item.id)}>
                    <Delete />
                  </IconButton>
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* View Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth='md' fullWidth>
        <DialogTitle>Slip Details</DialogTitle>
        <DialogContent>
          {selectedRecord && (
            <>
              <TextField label='Slip No' fullWidth margin='dense' value={selectedRecord.slip_no} disabled />
              <TextField label='Salesperson' fullWidth margin='dense' value={selectedRecord.salesperson} disabled />
              <TextField label='Cashier' fullWidth margin='dense' value={selectedRecord.cashier} disabled />
              <TextField label='Customer ID' fullWidth margin='dense' value={selectedRecord.customer_id} disabled />
              <TextField label='Cash' fullWidth margin='dense' value={selectedRecord.cash} disabled />
              <TextField label='Date' fullWidth margin='dense' value={formatDate(selectedRecord.date)} disabled /> {/* Display formatted date */}

              <Box mt={2}>
                <strong>Items:</strong>
                <Table size='small' sx={{ mt: 1, border: '1px solid #ddd' }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>#</TableCell>
                      <TableCell>Item ID</TableCell>
                      <TableCell>Previous Reading</TableCell>
                      <TableCell>Current Reading</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedRecord.items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{item.item_id}</TableCell>
                        <TableCell>{item.previous_reading}</TableCell>
                        <TableCell>{item.current_reading}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>

              <Box mt={2}>
                <strong>Amounts:</strong>
                <Table size='small' sx={{ mt: 1, border: '1px solid #ddd' }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Account Number</TableCell>
                      <TableCell>Bank Name</TableCell>
                      <TableCell>Cash in Hand</TableCell>
                      <TableCell>Online</TableCell>
                      <TableCell>Timestamp</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedRecord.amounts.map((amount, index) => (
                      <TableRow key={index}>
                        <TableCell>{amount.account_number || 'N/A'}</TableCell>
                        <TableCell>{amount.bank_name || 'N/A'}</TableCell>
                        <TableCell>{amount.cash_in_hand}</TableCell>
                        <TableCell>{amount.is_online ? 'Yes' : 'No'}</TableCell>
                        <TableCell>{new Date(amount.timestamp).toLocaleString()}</TableCell> {/* Amount timestamp */}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>

              <TextField label='Total Quantity' fullWidth margin='dense' value={selectedRecord.total_qty} disabled />
              <TextField
                label='Total Net Amount'
                fullWidth
                margin='dense'
                value={selectedRecord.total_net_amount}
                disabled
              />
              <TextField label='Total Balance' fullWidth margin='dense' value={selectedRecord.total_balance} disabled />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </TableContainer>
  );
};

export default SalesReport;
