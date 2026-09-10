import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { incidentService } from '../../services/incidentService';
import { locationService } from '../../services/locationService';
import { userService } from '../../services/userService';
import { useToast } from '../../context/ToastContext';
import { IncidentTable } from '../../components/incidents/IncidentTable';
import { IncidentFilter } from '../../components/incidents/IncidentFilter';
import { StatusUpdateModal, AssignOfficerModal } from '../../components/incidents/IncidentModals';
import { Pagination } from '../../components/ui/Pagination';
import { Card } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/FormControls';

export const ActiveIncidents = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [incidents, setIncidents] = useState([]);
  const [locations, setLocations] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);

  // Modals
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [targetStatus, setTargetStatus] = useState(null);

  const [filters, setFilters] = useState({
    search: '',
    status: '',
    severity: '',
    type: '',
    locationId: '',
  });

  const fetchIncidents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await incidentService.getIncidents({
        page,
        size: 10,
        ...filters,
      });
      const pageData = res?.data || res;
      setIncidents(pageData?.content || (Array.isArray(pageData) ? pageData : []));
      setTotalPages(pageData?.totalPages || 0);
    } catch (err) {
      showToast(err.toString(), 'error');
    } finally {
      setLoading(false);
    }
  }, [page, filters, showToast]);

  useEffect(() => {
    locationService.getLocations().then((res) => setLocations(Array.isArray(res) ? res : (res?.data || [])));
    userService.getOfficers().then((res) => setOfficers(Array.isArray(res) ? res : (res?.data || [])));
  }, []);

  useEffect(() => {
    fetchIncidents();
  }, [fetchIncidents]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(0);
  };

  const handleResetFilters = () => {
    setFilters({ search: '', status: '', severity: '', type: '', locationId: '' });
    setPage(0);
  };

  const handleAcknowledge = async (id) => {
    try {
      await incidentService.updateStatus(id, {
        status: 'ACKNOWLEDGED',
        remarks: 'Security officer acknowledged emergency alert',
      });
      showToast('Incident acknowledged', 'success');
      fetchIncidents();
    } catch (err) {
      showToast(err.toString(), 'error');
    }
  };

  const handleOpenAssign = (incident) => {
    setSelectedIncident(incident);
    setAssignModalOpen(true);
  };

  const handleOpenStatusUpdate = (incident, status) => {
    setSelectedIncident(incident);
    setTargetStatus(status);
    setStatusModalOpen(true);
  };

  const handleAssignSubmit = async (assignmentData) => {
    if (!selectedIncident) return;
    try {
      await incidentService.assignOfficer(selectedIncident.id, assignmentData);
      showToast('Officer assigned successfully', 'success');
      fetchIncidents();
    } catch (err) {
      showToast(err.toString(), 'error');
    }
  };

  const handleStatusSubmit = async (statusData) => {
    if (!selectedIncident) return;
    try {
      await incidentService.updateStatus(selectedIncident.id, statusData);
      showToast(`Status updated to ${statusData.status}`, 'success');
      fetchIncidents();
    } catch (err) {
      showToast(err.toString(), 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Active Emergency Incidents</h1>
        <p className="text-xs text-slate-500 mt-1">Filter, assign, and update status for all reported campus incidents.</p>
      </div>

      <IncidentFilter
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
        locations={locations}
      />

      <Card className="p-0 border-slate-200">
        {loading ? (
          <Spinner size="md" />
        ) : (
          <>
            <IncidentTable
              incidents={incidents}
              userRole={user?.role}
              userId={user?.id}
              onAcknowledge={handleAcknowledge}
              onOpenAssign={handleOpenAssign}
              onOpenStatusUpdate={handleOpenStatusUpdate}
            />
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={(p) => setPage(p)}
            />
          </>
        )}
      </Card>

      <StatusUpdateModal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        incident={selectedIncident}
        targetStatus={targetStatus}
        onSubmit={handleStatusSubmit}
      />

      <AssignOfficerModal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        incident={selectedIncident}
        officers={officers}
        onSubmit={handleAssignSubmit}
      />
    </div>
  );
};
