import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { INCIDENT_STATUSES } from '../../utils/constants';

export const StatusUpdateModal = ({ isOpen, onClose, incident, targetStatus, onSubmit }) => {
  const [status, setStatus] = useState(targetStatus || 'IN_PROGRESS');
  const [remarks, setRemarks] = useState('');
  const [officerNotes, setOfficerNotes] = useState('');
  const [resolutionSummary, setResolutionSummary] = useState('');
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (targetStatus) setStatus(targetStatus);
  }, [targetStatus]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({
        status,
        remarks,
        officerNotes,
        resolutionSummary: status === 'RESOLVED' ? resolutionSummary : undefined,
      });
      setRemarks('');
      setOfficerNotes('');
      setResolutionSummary('');
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Update Status - ${incident?.incidentNumber}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Target Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white font-medium"
          >
            {INCIDENT_STATUSES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Officer Notes (Internal)</label>
          <textarea
            rows="3"
            placeholder="Add security notes, initial observations, actions taken..."
            value={officerNotes}
            onChange={(e) => setOfficerNotes(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        {status === 'RESOLVED' && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Resolution Summary <span className="text-red-500">*</span>
            </label>
            <textarea
              rows="3"
              required
              placeholder="Detailed resolution summary describing how the incident was handled and resolved..."
              value={resolutionSummary}
              onChange={(e) => setResolutionSummary(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-blue-300 bg-blue-50/20 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Timeline Remark / Log Reason</label>
          <input
            type="text"
            placeholder="Short remark for incident timeline (e.g. Officer arrived at scene)"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={loading}>
            Update Incident Status
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export const AssignOfficerModal = ({ isOpen, onClose, incident, officers = [], onSubmit }) => {
  const [selectedOfficerId, setSelectedOfficerId] = useState('');
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedOfficerId) return;
    setLoading(true);
    try {
      await onSubmit({
        officerId: Number(selectedOfficerId),
        remarks,
      });
      setRemarks('');
      setSelectedOfficerId('');
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Assign Security Officer - ${incident?.incidentNumber}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Select Security Officer</label>
          <select
            value={selectedOfficerId}
            onChange={(e) => setSelectedOfficerId(e.target.value)}
            required
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white font-medium"
          >
            <option value="">-- Choose Security Officer --</option>
            {officers.map((off) => (
              <option key={off.id} value={off.id}>
                {off.fullName} ({off.phone})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Assignment Remarks</label>
          <input
            type="text"
            placeholder="Optional instructions for assigned officer..."
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={loading} disabled={!selectedOfficerId}>
            Assign Officer
          </Button>
        </div>
      </form>
    </Modal>
  );
};
