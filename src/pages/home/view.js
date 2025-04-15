import React, { useEffect, useState } from "react";
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
import { Edit, Delete } from "@mui/icons-material";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL; // Change this to your actual backend URL

const ViewRecords = () => {
  const [data, setData] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  // Fetch all items
  const fetchData = async () => {
    try {
      const res = await fetch(`${apiBaseUrl}/items`);
      const result = await res.json();
      setData(result);
    } catch (error) {
      console.error("Failed to fetch items", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEdit = (record) => {
    setSelectedRecord(record);
    setOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${apiBaseUrl}/items/${id}`, {
        method: "DELETE",
      });
  
      const result = await res.json();
  
      if (res.ok) {
        // Remove supplier from the table
        setData(data.filter((item) => item.id !== id));
      } else {
        // Show backend error (e.g., associated with purchase)
        alert(result.error || "Failed to delete item.");
      }
    } catch (error) {
      console.error("Delete failed", error);
      alert("An error occurred while trying to delete the item.");
    }
  };

  const handleSave = async () => {
    try {
      const res = await fetch(`${apiBaseUrl}/items/${selectedRecord.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(selectedRecord),
      });

      if (res.ok) {
        setData(data.map((item) => (item.id === selectedRecord.id ? selectedRecord : item)));
        setOpen(false);
      } else {
        console.error("Failed to update item");
      }
    } catch (error) {
      console.error("Update failed", error);
    }
  };

  return (
    <TableContainer component={Paper} sx={{ padding: 2 }}>
      <Table>
        <TableHead>
          <TableRow sx={{ backgroundColor: "primary.main" }}>
            {[
              "Item Name",
              "Item Code",
              "Min Level",
              "Qty/Packet",
              "Purchase Rate",
              "Sale Rate",
              "Wholesale Rate",
              "Discount %",
              "Opening Stock",
              "Unit",
              "Actions",
            ].map((head) => (
              <TableCell key={head} sx={{ color: "white", fontWeight: "bold" }}>
                {head}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.item_name}</TableCell>
              <TableCell>{item.item_code}</TableCell>
              <TableCell>{item.minimum_level}</TableCell>
              <TableCell>{item.qty_per_packet}</TableCell>
              <TableCell>{item.purchase_rate}</TableCell>
              <TableCell>{item.sale_rate}</TableCell>
              <TableCell>{item.wholesale_rate}</TableCell>
              <TableCell>{item.sale_discount_percent}%</TableCell>
              <TableCell>{item.opening_stock}</TableCell>
              <TableCell>{item.unit}</TableCell>
              <TableCell>
                <Box display="flex" gap={1}>
                  <IconButton color="primary" onClick={() => handleEdit(item)}>
                    <Edit />
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

      {/* Edit Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Record</DialogTitle>
        <DialogContent>
          {[
            { label: "Item Name", key: "item_name" },
            { label: "Item Code", key: "item_code" },
            { label: "Min Level", key: "minimum_level" },
            { label: "Qty per Packet", key: "qty_per_packet" },
            { label: "Purchase Rate", key: "purchase_rate" },
            { label: "Sale Rate", key: "sale_rate" },
            { label: "Wholesale Rate", key: "wholesale_rate" },
            { label: "Discount (%)", key: "sale_discount_percent" },
            { label: "Opening Stock", key: "opening_stock" },
            { label: "Unit", key: "unit" },
          ].map((field) => (
            <TextField
              key={field.key}
              label={field.label}
              fullWidth
              margin="dense"
              value={selectedRecord?.[field.key] ?? ""}
              onChange={(e) =>
                setSelectedRecord({
                  ...selectedRecord,
                  [field.key]: field.key.includes("rate") ||
                    field.key.includes("stock") ||
                    field.key.includes("level") ||
                    field.key.includes("percent")
                    ? parseFloat(e.target.value) || 0
                    : e.target.value,
                })
              }
            />
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} color="error">
            Cancel
          </Button>
          <Button onClick={handleSave} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </TableContainer>
  );
};

export default ViewRecords;
