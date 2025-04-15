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

// Updated Initial Data

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL; // Change this to your actual backend URL

const ViewRecords = () => {
  const [open, setOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [data, setData] = useState([]); // Initialize the data state variable

  // Fetch all items
  const fetchData = async () => {
    try {
      const url = `${apiBaseUrl}/customers`;
      console.log("Fetching data from:", url); // Log the URL to check
      const res = await fetch(url);
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
      const res = await fetch(`${apiBaseUrl}/customers/${id}`, {
        method: "DELETE",
      });
  
      const result = await res.json();
  
      if (res.ok) {
        // Remove supplier from the table
        setData(data.filter((item) => item.id !== id));
      } else {
        // Show backend error (e.g., associated with purchase)
        alert(result.error || "Failed to delete customer.");
      }
    } catch (error) {
      console.error("Delete failed", error);
      alert("An error occurred while trying to delete the customer.");
    }
  };

  const handleSave = async () => {
    try {
      const res = await fetch(`${apiBaseUrl}/customers/${selectedRecord.id}`, {
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
              "Name",
              "Address",
              "Telephone",
              "Mobile",
              "Email",
              "Cash Balance",
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
              <TableCell>{item.name}</TableCell>
              <TableCell>{item.address}</TableCell>
              <TableCell>{item.tel}</TableCell>
              <TableCell>{item.mobile}</TableCell>
              <TableCell>{item.email}</TableCell>
              <TableCell>
                {item.cash_balance_type}: {Math.abs(item.cash_balance)}
              </TableCell>
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
            { label: "Name", key: "name" },
            { label: "Address", key: "address" },
            { label: "Telephone", key: "tel" },
            { label: "Mobile", key: "mobile" },
            { label: "Email", key: "email" },
            { label: "Cash Balance", key: "cash_balance", type: "number" },
          ].map((field) => (
            <TextField
              key={field.key}
              label={field.label}
              fullWidth
              margin="dense"
              type={field.type || "text"}
              value={selectedRecord?.[field.key] ?? ""}
              onChange={(e) =>
                setSelectedRecord({ ...selectedRecord, [field.key]: e.target.value })
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
