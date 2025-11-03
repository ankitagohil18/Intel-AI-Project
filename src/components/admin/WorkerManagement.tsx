import React, { useEffect, useState, useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Edit, Trash2, Search } from "lucide-react";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";
ModuleRegistry.registerModules([AllCommunityModule]);

const API_BASE_URL = "http://localhost:8000";

const DEPARTMENTS = [
  "Production",
  "Maintenance",
  "Quality Control",
  "Logistics",
  "Farm Operations",
];

export function WorkerManagement() {
  const [workers, setWorkers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingWorker, setEditingWorker] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    department: "",
    skills: "",
    experience: "",
  });

  // Load workers from backend
  useEffect(() => {
    loadWorkers();
  }, []);

  const loadWorkers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/workers`);
      const data = await response.json();

      if (Array.isArray(data)) {
        const mapped = data.map((w) => ({
          id: w.EmployeeNumber,
          name: w.Name || "N/A",
          email: w.Email || "N/A",
          phone: w["Phone Number"] || "N/A",
          department: w.Department || "N/A",
          jobRole: w.JobRole || "N/A",
          age: w.Age || "N/A",
          gender: w.Gender || "N/A",
          monthlyIncome: w.MonthlyIncome || 0,
          yearsAtCompany: w.YearsAtCompany || 0,
          overTime: w.OverTime || "No",
          operatorSkillScore: w.OperatorSkillScore || 0,
          requiredSkillByRole: w.RequiredSkillByRole || 0,
        }));
        setWorkers(mapped);
      }
    } catch (error) {
      console.error("Failed to load workers:", error);
    } finally {
      setLoading(false);
    }
  };

  // Column Definitions
  const columnDefs = useMemo(
    () => [
      {
        headerName: "ID",
        field: "id",
        width: 100,
        sortable: true,
        filter: true,
      },
      {
        headerName: "Name",
        field: "name",
        sortable: true,
        filter: true,
        width: 150,
      },
      {
        headerName: "Email",
        field: "email",
        sortable: true,
        filter: true,
        width: 200,
      },
      {
        headerName: "Phone",
        field: "phone",
        sortable: true,
        filter: true,
        width: 150,
      },
      {
        headerName: "Department",
        field: "department",
        sortable: true,
        filter: true,
        width: 150,
      },
      {
        headerName: "Job Role",
        field: "jobRole",
        sortable: true,
        filter: true,
        width: 180,
      },
      {
        headerName: "Years at Company",
        field: "yearsAtCompany",
        sortable: true,
        width: 150,
      },
      {
        headerName: "Monthly Income",
        field: "monthlyIncome",
        sortable: true,
        width: 150,
        valueFormatter: (params) => `₹${params.value?.toLocaleString() || 0}`,
      },
      {
        headerName: "Actions",
        width: 120,
        cellRenderer: (params) => (
          <div className="flex gap-2 items-center h-full">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleEdit(params.data)}
            >
              <Edit className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleDelete(params.data.id)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        ),
      },
    ],
    []
  );

  // Filter workers
  const filteredWorkers = workers.filter(
    (worker) =>
      worker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      worker.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      worker.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle Form Submit (Add/Edit)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingWorker) {
        // Update existing worker
        const response = await fetch(
          `${API_BASE_URL}/workers/${editingWorker.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              Department: formData.department,
              YearsAtCompany: parseInt(formData.experience) || 0,
              Name: formData.name,
              Email: formData.email,
              "Phone Number": formData.phone,
              Skills: formData.skills,
            }),
          }
        );

        if (response.ok) {
          await loadWorkers();
        }
      } else {
        // Create new worker
        const response = await fetch(`${API_BASE_URL}/workers`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            department: formData.department,
            experience: formData.experience,
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            skills: formData.skills,
          }),
        });

        if (response.ok) {
          await loadWorkers();
        }
      }

      setIsDialogOpen(false);
      setEditingWorker(null);
      setFormData({ department: "", experience: "" });
    } catch (error) {
      console.error("Failed to save worker:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (worker) => {
    setEditingWorker(worker);
    setFormData({
      name: worker.name,
      email: worker.email,
      phone: worker.phone,
      skills: worker.skills,
      department: worker.department,
      experience: worker.yearsAtCompany.toString(),
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this worker?")) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/workers/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await loadWorkers();
      }
    } catch (error) {
      console.error("Failed to delete worker:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800">Worker Management</h1>

      {/* Search + Add */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2 flex-1">
          <Search className="h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search workers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              className="w-full sm:w-auto"
              onClick={() => {
                setEditingWorker(null);
                setFormData({ department: "", experience: "" });
              }}
            >
              <Plus className="h-4 w-4 mr-2" /> Add Worker
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingWorker ? "Edit Worker" : "Add New Worker"}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Enter full name"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="Enter email address"
                  required
                />
              </div>

              {/* Phone */}
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="text"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="Enter phone number"
                  required
                />
              </div>

              {/* Department */}
              <div>
                <Label htmlFor="department">Department</Label>
                <Select
                  value={formData.department}
                  onValueChange={(value) =>
                    setFormData({ ...formData, department: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPARTMENTS.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Skills */}
              {/* <div>
                <Label htmlFor="skills">Skills</Label>
                <Input
                  id="skills"
                  type="text"
                  value={formData.skills}
                  onChange={(e) =>
                    setFormData({ ...formData, skills: e.target.value })
                  }
                  placeholder="Enter worker skills (comma-separated)"
                />
              </div> */}

              {/* Experience */}
              <div>
                <Label htmlFor="experience">Years of Experience</Label>
                <Input
                  id="experience"
                  type="number"
                  min="0"
                  max="40"
                  value={formData.experience}
                  onChange={(e) =>
                    setFormData({ ...formData, experience: e.target.value })
                  }
                  placeholder="Enter years"
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading
                  ? "Saving..."
                  : editingWorker
                  ? "Update Worker"
                  : "Add Worker"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-blue-600 font-medium">Total Workers</p>
          <p className="text-2xl font-bold text-blue-900">{workers.length}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-sm text-green-600 font-medium">Departments</p>
          <p className="text-2xl font-bold text-green-900">
            {new Set(workers.map((w) => w.department)).size}
          </p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <p className="text-sm text-purple-600 font-medium">Avg Experience</p>
          <p className="text-2xl font-bold text-purple-900">
            {(
              workers.reduce((sum, w) => sum + (w.yearsAtCompany || 0), 0) /
                workers.length || 0
            ).toFixed(1)}{" "}
            years
          </p>
        </div>
      </div>

      {/* AG Grid Table */}
      <div
        className="ag-theme-alpine rounded-lg border"
        style={{ height: 600 }}
      >
        <AgGridReact
          rowData={filteredWorkers}
          columnDefs={columnDefs}
          pagination={true}
          paginationPageSize={20}
          defaultColDef={{
            resizable: true,
            sortable: true,
            filter: true,
          }}
          loading={loading}
        />
      </div>
    </div>
  );
}
