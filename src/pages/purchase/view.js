import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Box,
} from "@mui/material";
import { ViewList, FileDownload, Delete } from "@mui/icons-material";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Link from "next/link";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

const ViewRecords = () => {
  const [data, setData] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const fetchData = async () => {
    try {
      const res = await fetch(`${apiBaseUrl}/purchases`);
      if (!res.ok) throw new Error("Failed to fetch data");

      const contentType = res.headers.get("Content-Type");
      if (contentType?.includes("application/json")) {
        const result = await res.json();
        setData(result);
      } else {
        const errorText = await res.text();
        console.error("Expected JSON, but got:", errorText);
      }
    } catch (error) {
      console.error("Failed to fetch purchases", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${apiBaseUrl}/purchases/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setData((prevData) => prevData.filter((item) => item.id !== id));
        console.log("Purchase deleted successfully");
      } else {
        const errorData = await res.json();
        console.error("Failed to delete item", errorData.message || res.statusText);
      }
    } catch (error) {
      console.error("Delete failed", error);
    }
  };

  const handleView = async (id) => {
    try {
      const res = await fetch(`${apiBaseUrl}/purchases/${id}`);
  
      if (!res.ok) throw new Error("Failed to fetch data");
  
      const contentType = res.headers.get("Content-Type");
      if (contentType && contentType.includes("application/json")) {
        const result = await res.json();
        setSelectedRecord(result);
        setOpen(true);
      } else {
        const errorText = await res.text();
        console.error("Expected JSON, but got:", errorText);
      }
    } catch (error) {
      console.error("Failed to fetch purchase details", error);
    }
  };

  const generateReport = async (summaryRecord) => {
    try {
      const res = await fetch(`${apiBaseUrl}/purchases/${summaryRecord.id}`);
      if (!res.ok) throw new Error("Failed to fetch purchase details for PDF");
  
      const record = await res.json();
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
  
      // Header
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text("Purchase Slip Report", pageWidth / 2, 20, { align: "center" });
  
      // Sub-header
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text(`Purchase No: ${record.purchase_no}`, 14, 35);
      doc.text(`Bill No: ${record.bill_no}`, pageWidth - 14, 35, { align: "right" });
      doc.text(`Date: ${new Date(record.date).toLocaleDateString()}`, 14, 42);
      doc.text(`Supplier: ${record.supplier}`, 14, 49);
  
      // Additional Fields
      doc.text(`Net Amount: ${record.net_amount}`, 14, 56);
      doc.text(`Description: ${record.description}`, 14, 63);
      doc.text(`Discount Percent: ${record.discount_percent}`, 14, 70);
      doc.text(`Discount: ${record.discount}`, 14, 77);
      doc.text(`Payment: ${record.payment}`, 14, 84);
      doc.text(`Balance: ${record.balance}`, 14, 91);
  
      // Items Table Header
      let y = 105;
      doc.setFont("helvetica", "bold");
  
      const tableHeaders = ["#", "Item ID", "Qty", "P. Rate", "S. Rate", "Net Amount"];
      const columnSpacing = [14, 30, 55, 75, 100, 125];
  
      tableHeaders.forEach((header, i) => {
        doc.text(header, columnSpacing[i], y);
      });
  
      y += 6;
      doc.setFont("helvetica", "normal");
  
      // Items Table Rows
      record.items?.forEach((item, index) => {
        const row = [
          index + 1,
          item.item_id,
          item.qty,
          item.purchase_rate,
          item.sale_rate,
          item.net_amount
        ];
  
        row.forEach((cell, i) => {
          doc.text(String(cell), columnSpacing[i], y);
        });
  
        y += 6;
      });
  
      // Payment Section
      y += 10;
      doc.setFont("helvetica", "bold");
      doc.text("Payment Details", 14, y);
      y += 5;
      doc.setFont("helvetica", "normal");
  
      const tableColumnAmount = ["Payment", "Discount", "Balance"];
      const tableRowAmount = [
        [record.payment || "N/A", record.discount || "N/A", record.balance || "N/A"]
      ];
  
      tableColumnAmount.forEach((col, i) => {
        doc.text(col, 14 + i * 50, y);
      });
  
      y += 6;
  
      tableRowAmount.forEach((row) => {
        row.forEach((cell, i) => {
          doc.text(String(cell), 14 + i * 50, y);
        });
        y += 6;
      });
  
      if (record.total_amount) {
        doc.setFont("helvetica", "bold");
        doc.text(`Total Amount: ${record.total_amount}`, 14, y + 5);
      }
  
      doc.save(`purchase_report_${record.purchase_no}.pdf`);
    } catch (error) {
      console.error("Error generating report:", error);
    }
  };
  
  
  
  
  

  return (
    <TableContainer component={Paper} sx={{ padding: 2 }}>
      <Table>
        <TableHead>
          <TableRow sx={{ backgroundColor: "primary.main" }}>
            {["Purchase No.", "Date", "Supplier", "Balance", "Item", "Actions"].map((head) => (
              <TableCell key={head} sx={{ color: "white", fontWeight: "bold" }}>
                {head}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.purchase_no}</TableCell>
              <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
              <TableCell>{item.supplier}</TableCell>
              <TableCell>
                {item.balance >= 0
                  ? `Receivable: ${item.balance}`
                  : `Payable: ${Math.abs(item.balance)}`}
              </TableCell>
              <TableCell>
                <Link href={`/view-item/${item.id}`} passHref>
                  <span style={{ textDecoration: "underline", cursor: "pointer", color: "blue" }}>
                    {item.item}
                  </span>
                </Link>
              </TableCell>
              <TableCell>
                <Box display="flex" gap={1}>
                  <IconButton color="primary" onClick={() => handleView(item.id)}>
                    <ViewList />
                  </IconButton>
                  <IconButton color="secondary" onClick={() => generateReport(item)}>
                    <FileDownload />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleDelete(item.id)}>
                    <Delete />
                  </IconButton>
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* View Purchase Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Purchase Details</DialogTitle>
        <DialogContent>
          {selectedRecord ? (
            <>
              <div>
                <strong>Purchase No.:</strong> {selectedRecord.purchase_no}
              </div>
              <div>
                <strong>Bill No.:</strong> {selectedRecord.bill_no}
              </div>
              <div>
                <strong>Supplier:</strong> {selectedRecord.supplier}
              </div>
              <div>
                <strong>Date:</strong> {new Date(selectedRecord.date).toLocaleDateString()}
              </div>

              {/* Displaying the Items List */}
              <div style={{ marginTop: 20 }}>
                <strong>Items:</strong>
                {selectedRecord.items && selectedRecord.items.length > 0 ? (
                  selectedRecord.items.map((item, index) => (
                    <div key={index}>
                      <div><strong>Item ID:</strong> {item.item_id}</div>
                      <div><strong>Quantity:</strong> {item.qty}</div>
                      <div><strong>Unit Rate:</strong> {item.unit_rate}</div>
                      <div><strong>Previous Reading:</strong> {item.previous_reading}</div>
                      <div><strong>Current Reading:</strong> {item.current_reading}</div> <hr/> </div> )) ) : 
                      ( <div>No items found</div> )} </div> </> ) : ( <div>Loading...</div> )} 
                      </DialogContent> 
                      <DialogActions> 
                        <Button onClick={() => setOpen(false)}>Close</Button> 
                      </DialogActions> 
                    </Dialog> </TableContainer> ); };

export default ViewRecords;
