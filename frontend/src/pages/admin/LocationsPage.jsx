import React, { useState, useEffect } from 'react';
import { locationService } from '../../services/locationService';
import { useToast } from '../../context/ToastContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Spinner } from '../../components/ui/FormControls';
import { MapPin, Plus, Trash2, Edit } from 'lucide-react';

export const LocationsPage = () => {
  const { showToast } = useToast();
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingLoc, setEditingLoc] = useState(null);
  const [formData, setFormData] = useState({
    building: '',
    area: '',
    floor: '',
    room: '',
  });

  const fetchLocations = async () => {
    setLoading(true);
    try {
      const res = await locationService.getLocations();
      setLocations(Array.isArray(res) ? res : (res?.data || []));
    } catch (err) {
      showToast(err.toString(), 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const handleOpenCreate = () => {
    setEditingLoc(null);
    setFormData({ building: '', area: '', floor: '', room: '' });
    setModalOpen(true);
  };

  const handleOpenEdit = (loc) => {
    setEditingLoc(loc);
    setFormData({ building: loc.building, area: loc.area, floor: loc.floor || '', room: loc.room || '' });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingLoc) {
        await locationService.updateLocation(editingLoc.id, formData);
        showToast('Location updated', 'success');
      } else {
        await locationService.createLocation(formData);
        showToast('New location created', 'success');
      }
      setModalOpen(false);
      fetchLocations();
    } catch (err) {
      showToast(err.toString(), 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete location?')) return;
    try {
      await locationService.deleteLocation(id);
      showToast('Location deleted', 'info');
      fetchLocations();
    } catch (err) {
      showToast(err.toString(), 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Campus Locations</h1>
          <p className="text-xs text-slate-500 mt-1">Manage campus buildings, zones, floors, and rooms.</p>
        </div>
        <Button variant="primary" icon={Plus} onClick={handleOpenCreate}>
          Add Location
        </Button>
      </div>

      <Card className="p-0 border-slate-200">
        {loading ? (
          <Spinner size="md" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-500 uppercase">
                  <th className="px-4 py-3.5">Building</th>
                  <th className="px-4 py-3.5">Area / Zone</th>
                  <th className="px-4 py-3.5">Floor</th>
                  <th className="px-4 py-3.5">Room</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {locations.map((loc) => (
                  <tr key={loc.id} className="hover:bg-slate-50/80">
                    <td className="px-4 py-3.5 font-bold text-slate-900 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      {loc.building}
                    </td>
                    <td className="px-4 py-3.5 text-slate-600">{loc.area}</td>
                    <td className="px-4 py-3.5 text-slate-600">{loc.floor || 'N/A'}</td>
                    <td className="px-4 py-3.5 font-semibold text-slate-800">{loc.room || 'N/A'}</td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button size="sm" variant="outline" icon={Edit} onClick={() => handleOpenEdit(loc)}>
                          Edit
                        </Button>
                        <Button size="sm" variant="outline" icon={Trash2} onClick={() => handleDelete(loc.id)}>
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingLoc ? 'Edit Location' : 'Add Location'}>
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Building Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Engineering Block A"
              value={formData.building}
              onChange={(e) => setFormData({ ...formData, building: e.target.value })}
              className="w-full px-3 py-2 border rounded-xl"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Area / Campus Zone</label>
            <input
              type="text"
              required
              placeholder="e.g. North Campus Quad"
              value={formData.area}
              onChange={(e) => setFormData({ ...formData, area: e.target.value })}
              className="w-full px-3 py-2 border rounded-xl"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Floor</label>
            <input
              type="text"
              placeholder="e.g. 2nd Floor"
              value={formData.floor}
              onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
              className="w-full px-3 py-2 border rounded-xl"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Room Number</label>
            <input
              type="text"
              placeholder="e.g. Room 204"
              value={formData.room}
              onChange={(e) => setFormData({ ...formData, room: e.target.value })}
              className="w-full px-3 py-2 border rounded-xl"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editingLoc ? 'Save Changes' : 'Create Location'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
