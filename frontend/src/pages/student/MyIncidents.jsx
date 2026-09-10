import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { incidentService } from '../../services/incidentService';
import { locationService } from '../../services/locationService';
import { useToast } from '../../context/ToastContext';
import { IncidentTable } from '../../components/incidents/IncidentTable';
import { IncidentFilter } from '../../components/incidents/IncidentFilter';
import { Pagination } from '../../components/ui/Pagination';
import { Card } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/FormControls';

export const MyIncidents = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [incidents, setIncidents] = useState([]);
  const [locations, setLocations] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);

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

  const handleCancelIncident = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this emergency alert?')) return;
    try {
      await incidentService.cancelIncident(id);
      showToast('Incident cancelled successfully', 'info');
      fetchIncidents();
    } catch (err) {
      showToast(err.toString(), 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">My Emergency Incidents</h1>
        <p className="text-xs text-slate-500 mt-1">Track status and timeline history of emergency alerts reported by you.</p>
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
              onCancel={handleCancelIncident}
            />
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={(p) => setPage(p)}
            />
          </>
        )}
      </Card>
    </div>
  );
};
