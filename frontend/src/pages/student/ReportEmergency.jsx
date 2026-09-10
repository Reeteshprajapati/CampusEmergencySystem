import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { incidentService } from '../../services/incidentService';
import { locationService } from '../../services/locationService';
import { aiService } from '../../services/aiService';
import { useGeolocation } from '../../hooks/useGeolocation';
import { useToast } from '../../context/ToastContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { INCIDENT_TYPES, SEVERITIES } from '../../utils/constants';
import {
  ShieldAlert,
  MapPin,
  Phone,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Plus,
  Sparkles,
  Bot,
  Loader2,
} from 'lucide-react';

export const ReportEmergency = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { location, loading: geoLoading, error: geoError, getCurrentLocation } = useGeolocation();

  const [type, setType] = useState('MEDICAL_EMERGENCY');
  const [severity, setSeverity] = useState('CRITICAL');
  const [description, setDescription] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [locationId, setLocationId] = useState('');
  const [manualBuilding, setManualBuilding] = useState('');
  const [manualArea, setManualArea] = useState('');
  const [manualFloor, setManualFloor] = useState('');
  const [manualRoom, setManualRoom] = useState('');

  const [locations, setLocations] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [submittedIncident, setSubmittedIncident] = useState(null);

  // New Location Modal State
  const [addLocModalOpen, setAddLocModalOpen] = useState(false);
  const [savingLoc, setSavingLoc] = useState(false);
  const [newLocData, setNewLocData] = useState({
    building: '',
    area: '',
    floor: '',
    room: '',
  });

  // AI Real-time Triage State
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);

  const fetchLocations = async () => {
    try {
      const res = await locationService.getLocations();
      setLocations(Array.isArray(res) ? res : (res?.data || []));
    } catch (err) {
      console.error('Failed to load locations', err);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  // Save New Location directly to System DB via API
  const handleSaveNewLocation = async (e) => {
    e.preventDefault();
    if (!newLocData.building.trim() || !newLocData.area.trim()) {
      showToast('Please enter Building Name and Area / Campus Zone', 'warning');
      return;
    }

    setSavingLoc(true);
    try {
      const createdRes = await locationService.createLocation({
        building: newLocData.building.trim(),
        area: newLocData.area.trim(),
        floor: newLocData.floor.trim(),
        room: newLocData.room.trim(),
        latitude: location?.latitude || null,
        longitude: location?.longitude || null,
      });

      const newLoc = createdRes?.data || createdRes;
      showToast('New Location Saved to Database Successfully!', 'success');
      setAddLocModalOpen(false);
      setNewLocData({ building: '', area: '', floor: '', room: '' });

      // Refresh location list and auto-select new location
      await fetchLocations();
      if (newLoc?.id) {
        setLocationId(newLoc.id.toString());
      }
    } catch (err) {
      showToast(err.toString(), 'error');
    } finally {
      setSavingLoc(false);
    }
  };

  // Real-Time Groq AI Incident Triage Analysis
  const handleAiAnalysis = async () => {
    if (!description.trim()) {
      showToast('Please enter a description first to run AI Real-Time Analysis', 'warning');
      return;
    }

    setAiAnalyzing(true);
    try {
      const selectedLocObj = locations.find((l) => l.id.toString() === locationId?.toString());
      const locStr = selectedLocObj
        ? `${selectedLocObj.building}, ${selectedLocObj.room || selectedLocObj.area}`
        : manualBuilding || 'Campus Area';

      const res = await aiService.analyzeIncident({
        type,
        severity,
        description,
        location: locStr,
      });

      setAiAnalysis(res?.analysis || res?.data?.analysis || 'AI Analysis generated.');
      showToast('Groq AI Real-Time Incident Assessment Complete!', 'success');
    } catch (err) {
      showToast('AI Analysis Service error', 'error');
    } finally {
      setAiAnalyzing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) {
      showToast('Please provide a description of the emergency', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        type,
        severity,
        description,
        contactNumber,
        locationId: locationId ? Number(locationId) : null,
        building: manualBuilding,
        area: manualArea,
        floor: manualFloor,
        room: manualRoom,
        latitude: location?.latitude || null,
        longitude: location?.longitude || null,
      };

      const res = await incidentService.createIncident(payload);
      setSubmittedIncident(res?.data || res);
      showToast('Emergency Alert Broadcasted to Campus Security!', 'success');
    } catch (err) {
      showToast(err.toString(), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (submittedIncident) {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <Card className="border-emerald-200 bg-emerald-50/30 text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">
              Emergency Alert Submitted & Broadcasted
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-1">
              {submittedIncident.incidentNumber}
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Security team has been notified through the campus safety REST API.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 text-left space-y-4 shadow-sm">
            <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs font-semibold text-slate-400">Incident Type</span>
                <p className="text-sm font-bold text-slate-800 mt-0.5">
                  <Badge variant="type">{submittedIncident.type}</Badge>
                </p>
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-400">Severity</span>
                <p className="text-sm font-bold text-slate-800 mt-0.5">
                  <Badge variant="severity">{submittedIncident.severity}</Badge>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs font-semibold text-slate-400">Location</span>
                <p className="text-sm font-bold text-slate-900 mt-0.5">
                  {submittedIncident.location?.building || 'Campus Area'}{' '}
                  {submittedIncident.location?.room ? `- ${submittedIncident.location.room}` : ''}
                </p>
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-400">Current Status</span>
                <p className="text-sm font-bold text-slate-800 mt-0.5">
                  <Badge variant="status">{submittedIncident.status}</Badge>
                </p>
              </div>
            </div>

            {submittedIncident.latitude && (
              <div className="text-xs text-slate-500 font-mono flex items-center gap-1.5 pt-1">
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                <span>GPS Coordinates: {submittedIncident.latitude.toFixed(4)}, {submittedIncident.longitude.toFixed(4)}</span>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Button
              variant="primary"
              size="lg"
              icon={ArrowRight}
              onClick={() => navigate('/student/my-incidents')}
            >
              Track Emergency Alert Status
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => {
                setSubmittedIncident(null);
                setAiAnalysis(null);
              }}
            >
              Report Another Incident
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white p-6 sm:p-7 rounded-3xl shadow-xl shadow-red-600/15 flex items-center justify-between">
        <div>
          <span className="bg-white/20 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
            24/7 Real-Time Emergency Dispatch
          </span>
          <h1 className="text-2xl font-extrabold tracking-tight mt-2 flex items-center gap-2.5">
            <ShieldAlert className="w-7 h-7" /> Report Emergency Incident
          </h1>
          <p className="text-xs text-red-100 mt-1 max-w-lg leading-relaxed">
            Fill in the emergency details below to instantly alert active campus security personnel on duty.
          </p>
        </div>
      </div>

      <Card className="shadow-sm border-slate-200/80">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Incident Type Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
              1. Type of Emergency <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {INCIDENT_TYPES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setType(t.id)}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    type === t.id
                      ? 'border-red-500 bg-red-50/70 ring-2 ring-red-500/20 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50'
                  }`}
                >
                  <p className={`text-xs font-bold ${type === t.id ? 'text-red-700' : 'text-slate-800'}`}>
                    {t.label}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Severity Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
              2. Urgency & Severity <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {SEVERITIES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSeverity(s.id)}
                  className={`p-3 rounded-2xl border text-center font-bold text-xs transition-all cursor-pointer ${
                    severity === s.id
                      ? 'border-red-600 bg-red-600 text-white shadow-xs'
                      : 'border-slate-200 bg-slate-50/80 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Location Details & Browser Geolocation */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                3. Incident Location <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setAddLocModalOpen(true)}
                  className="text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 px-3 py-1 rounded-xl border border-purple-200 flex items-center gap-1 cursor-pointer transition-all"
                >
                  <Plus className="w-3.5 h-3.5" /> + Add New Location to DB
                </button>

                <button
                  type="button"
                  onClick={getCurrentLocation}
                  disabled={geoLoading}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1.5 cursor-pointer bg-blue-50 px-3 py-1 rounded-xl border border-blue-200"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  {geoLoading ? 'Capturing GPS...' : 'Use My GPS Location'}
                </button>
              </div>
            </div>

            {location && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Captured Coordinates: Latitude <strong>{location.latitude.toFixed(4)}</strong>, Longitude <strong>{location.longitude.toFixed(4)}</strong>
                </span>
              </div>
            )}

            {geoError && <p className="text-xs text-red-600 font-medium">{geoError}</p>}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <select
                  value={locationId}
                  onChange={(e) => setLocationId(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-red-500"
                >
                  <option value="">-- Select Saved Campus Location --</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.building} ({loc.room ? `${loc.floor} - ${loc.room}` : loc.area})
                    </option>
                  ))}
                </select>
              </div>

              {!locationId && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Building Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Engineering Block A"
                      value={manualBuilding}
                      onChange={(e) => setManualBuilding(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Floor & Room Number</label>
                    <input
                      type="text"
                      placeholder="e.g. 2nd Floor, Room 204"
                      value={manualRoom}
                      onChange={(e) => setManualRoom(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Campus Area / Zone</label>
                    <input
                      type="text"
                      placeholder="e.g. North Campus Quad"
                      value={manualArea}
                      onChange={(e) => setManualArea(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Description & Contact Number */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                4. Emergency Details & Description <span className="text-red-500">*</span>
              </label>

              {/* Real-time Groq AI Triage Button */}
              <button
                type="button"
                onClick={handleAiAnalysis}
                disabled={aiAnalyzing || !description.trim()}
                className="text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded-xl border border-indigo-200 flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer"
              >
                {aiAnalyzing ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-600" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                )}
                <span>Real-Time AI Safety Triage</span>
              </button>
            </div>

            <textarea
              rows="4"
              required
              placeholder="Describe what is happening, casualties/injuries, people involved, or any immediate hazards..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 text-sm rounded-2xl border border-slate-200 focus:ring-2 focus:ring-red-500 focus:outline-none"
            />

            {/* Groq AI Response Output Box */}
            {aiAnalysis && (
              <div className="mt-3 p-4 bg-gradient-to-r from-slate-900 to-indigo-950 text-slate-200 rounded-2xl border border-indigo-500/30 text-xs leading-relaxed space-y-2 animate-in fade-in">
                <div className="flex items-center gap-2 text-indigo-300 font-bold text-sm pb-2 border-b border-white/10">
                  <Bot className="w-4 h-4 text-purple-400" />
                  <span>Groq AI Real-Time Safety Assessment</span>
                </div>
                <div className="whitespace-pre-wrap">{aiAnalysis}</div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Phone Number</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-200"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-slate-100">
            <Button
              type="submit"
              variant="danger"
              size="lg"
              className="w-full py-4 text-base tracking-wide"
              loading={submitting}
              icon={ShieldAlert}
            >
              🚨 SUBMIT EMERGENCY ALERT TO SECURITY NOW
            </Button>
          </div>
        </form>
      </Card>

      {/* Add New Location Modal (Saves directly into System Database via API) */}
      <Modal
        isOpen={addLocModalOpen}
        onClose={() => setAddLocModalOpen(false)}
        title="Add New Campus Location to System Database"
      >
        <form onSubmit={handleSaveNewLocation} className="space-y-4 text-xs">
          <p className="text-slate-500 text-[11px]">
            Save a new campus building, zone, floor, or room directly to the system database so all users and officers can select it.
          </p>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Building Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Innovation Center Block B"
              value={newLocData.building}
              onChange={(e) => setNewLocData({ ...newLocData, building: e.target.value })}
              className="w-full px-3 py-2 border rounded-xl border-slate-300 focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Area / Campus Zone <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. East Academic Quad"
              value={newLocData.area}
              onChange={(e) => setNewLocData({ ...newLocData, area: e.target.value })}
              className="w-full px-3 py-2 border rounded-xl border-slate-300 focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Floor</label>
              <input
                type="text"
                placeholder="e.g. 3rd Floor"
                value={newLocData.floor}
                onChange={(e) => setNewLocData({ ...newLocData, floor: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl border-slate-300"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Room Number</label>
              <input
                type="text"
                placeholder="e.g. Lab 305"
                value={newLocData.room}
                onChange={(e) => setNewLocData({ ...newLocData, room: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl border-slate-300"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setAddLocModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={savingLoc} icon={Plus}>
              Save to Database
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
