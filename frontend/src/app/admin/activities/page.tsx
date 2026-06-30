'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';

interface Activity {
  id: string;
  name: string;
  city: string;
  category?: string;
  duration?: string;
  pricePerPerson?: number;
  rating?: string | number;
  partnerId?: string;
  partnerName?: string;
  status: string;
  type?: string;
}

const MOCK_ACTIVITIES: Activity[] = [
  { id: 'ACT001', name: 'Goa Water Sports', city: 'Goa', category: 'Adventure', duration: '3 hrs', pricePerPerson: 2500, rating: '4.7', partnerId: 'PTR001', partnerName: 'Blue Wave Adventures', status: 'Approved' },
  { id: 'ACT002', name: 'Bali Cooking Class', city: 'Bali', category: 'Culinary', duration: '4 hrs', pricePerPerson: 3200, rating: '4.9', partnerId: 'PTR002', partnerName: 'Bali Cultural Tours', status: 'Approved' },
  { id: 'ACT003', name: 'Manali Trek', city: 'Manali', category: 'Trekking', duration: 'Full Day', pricePerPerson: 4500, rating: '4.6', partnerId: 'PTR003', partnerName: 'Himalayan Trails Co.', status: 'Pending' },
  { id: 'ACT004', name: 'Kerala Backwaters Cruise', city: 'Kerala', category: 'Cruising', duration: '6 hrs', pricePerPerson: 6000, rating: '4.8', partnerId: 'PTR004', partnerName: 'Kerala Boat Rides', status: 'Approved' },
  { id: 'ACT005', name: 'Jaipur Heritage Walk', city: 'Jaipur', category: 'Cultural', duration: '2 hrs', pricePerPerson: 1500, rating: '4.5', partnerId: 'PTR005', partnerName: 'Rajasthan Heritage Co.', status: 'Approved' },
];

const CITIES = ['Goa', 'Bali', 'Manali', 'Kerala', 'Jaipur', 'Mumbai', 'Delhi'];

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [filterCity, setFilterCity] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [search, setSearch] = useState('');
  const [suspendModal, setSuspendModal] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });
  const [suspendMode, setSuspendMode] = useState('Temporary');
  const [suspendReason, setSuspendReason] = useState('');
  const [suspendComments, setSuspendComments] = useState('');

  useEffect(() => {
    loadActivities();
  }, []);

  function loadActivities() {
    try {
      const stored = localStorage.getItem('met_platform_properties');
      const all = stored ? JSON.parse(stored) : [];
      const acts: Activity[] = all.filter((p: Activity) => p.type === 'activity');
      setActivities(acts.length > 0 ? acts : MOCK_ACTIVITIES);
    } catch {
      setActivities(MOCK_ACTIVITIES);
    }
  }

  function saveActivities(updated: Activity[]) {
    try {
      const stored = localStorage.getItem('met_platform_properties');
      const all = stored ? JSON.parse(stored) : [];
      const nonActs = all.filter((p: Activity) => p.type !== 'activity');
      localStorage.setItem('met_platform_properties', JSON.stringify([...nonActs, ...updated]));
    } catch { /* ignore */ }
  }

  const filtered = activities.filter(a => {
    const matchCity = !filterCity || a.city === filterCity;
    const matchStatus = !filterStatus || a.status === filterStatus;
    const q = search.toLowerCase();
    const matchSearch = !search || a.name.toLowerCase().includes(q) || a.city.toLowerCase().includes(q) || (a.partnerName || '').toLowerCase().includes(q);
    return matchCity && matchStatus && matchSearch;
  });

  const total = activities.length;
  const active = activities.filter(a => a.status === 'Approved' || a.status === 'Published').length;
  const pending = activities.filter(a => a.status === 'Pending').length;
  const suspended = activities.filter(a => a.status === 'Suspended').length;

  function approveActivity(id: string) {
    if (!confirm('Approve and publish this activity listing?')) return;
    const updated = activities.map(a => a.id === id ? { ...a, status: 'Approved' } : a);
    setActivities(updated);
    saveActivities(updated);
  }

  function openSuspend(id: string) {
    setSuspendModal({ open: true, id });
    setSuspendMode('Temporary');
    setSuspendReason('');
    setSuspendComments('');
  }

  function closeSuspend() {
    setSuspendModal({ open: false, id: null });
  }

  function submitSuspend(e: React.FormEvent) {
    e.preventDefault();
    if (!suspendReason) return;
    const updated = activities.map(a => a.id === suspendModal.id ? { ...a, status: 'Suspended' } : a);
    setActivities(updated);
    saveActivities(updated);
    closeSuspend();
  }

  function getStatusBadge(status: string) {
    if (status === 'Approved' || status === 'Published') return 'badge approved';
    if (status === 'Pending') return 'badge warning';
    if (status === 'Suspended') return 'badge danger';
    return 'badge warning';
  }

  return (
    <AdminLayout>
      {/* Page Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-primary font-heading">Experiences &amp; Activities Registry</h2>
        <p className="text-sm text-text-muted">Approve, monitor, or suspend travel activity catalogs listed on the platform.</p>
      </div>

      {/* KPI Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white border border-border rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wide">Total Activities</span>
          <div className="text-2xl font-extrabold text-primary mt-1">{total}</div>
        </div>
        <div className="bg-white border border-border rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wide">Active / Live</span>
          <div className="text-2xl font-extrabold text-success mt-1">{active}</div>
        </div>
        <div className="bg-white border border-border rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wide">Pending Review</span>
          <div className="text-2xl font-extrabold text-warning mt-1">{pending}</div>
        </div>
        <div className="bg-white border border-border rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wide">Suspended Tours</span>
          <div className="text-2xl font-extrabold text-danger mt-1">{suspended}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-border rounded-2xl p-5 shadow-sm mb-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
            <select
              value={filterCity}
              onChange={e => setFilterCity(e.target.value)}
              className="border border-border rounded-lg px-3 py-1.5 text-xs font-bold outline-none focus:border-primary"
            >
              <option value="">All Cities</option>
              {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="border border-border rounded-lg px-3 py-1.5 text-xs font-bold outline-none focus:border-primary"
            >
              <option value="">All Statuses</option>
              <option value="Approved">Active / Live</option>
              <option value="Pending">Pending Review</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>
          <div className="relative w-full md:w-72">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-text-muted">
              <i className="fa-solid fa-search text-xs"></i>
            </span>
            <input
              type="text"
              placeholder="Search experience or location..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 border border-border rounded-lg outline-none text-xs text-text-main focus:border-primary"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
        <div className="table-responsive">
          <table className="partner-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Activity Name</th>
                <th>City</th>
                <th>Duration</th>
                <th>Price Per Person (Rs.)</th>
                <th>Rating</th>
                <th>Partner</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-text-muted font-semibold">
                    <i className="fa-solid fa-person-hiking text-2xl mb-2 block text-slate-300"></i>
                    No experiences found matching selection.
                  </td>
                </tr>
              ) : (
                filtered.map(a => {
                  const isLive = a.status === 'Approved' || a.status === 'Published';
                  return (
                    <tr key={a.id} className="admin-table-row text-xs">
                      <td><strong>{a.id}</strong></td>
                      <td className="font-bold text-primary">{a.name}</td>
                      <td className="font-semibold text-primary">{a.city}</td>
                      <td className="font-semibold text-text-muted text-[10px] capitalize">{a.duration || 'N/A'}</td>
                      <td className="font-bold text-primary">
                        {a.pricePerPerson ? `Rs. ${a.pricePerPerson.toLocaleString('en-IN')}` : 'N/A'}
                      </td>
                      <td className="font-bold text-warning">
                        <i className="fa-solid fa-star mr-1"></i>{a.rating || '4.8'}
                      </td>
                      <td className="font-bold text-primary">{a.partnerName || 'Indo-Global Travel'}</td>
                      <td><span className={getStatusBadge(a.status)}>{a.status}</span></td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="flex gap-1 justify-end">
                          {isLive ? (
                            <button
                              onClick={() => openSuspend(a.id)}
                              className="btn-secondary"
                              style={{ padding: '4px 8px', fontSize: '10px', color: 'var(--color-danger)' }}
                            >
                              <i className="fa-solid fa-triangle-exclamation mr-1"></i>Suspend
                            </button>
                          ) : (
                            <button
                              onClick={() => approveActivity(a.id)}
                              className="btn-secondary"
                              style={{ padding: '4px 8px', fontSize: '10px', color: 'var(--color-success)' }}
                            >
                              <i className="fa-solid fa-circle-check mr-1"></i>Approve
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Suspension Modal */}
      {suspendModal.open && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl border border-border p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-primary flex items-center gap-2">
              <i className="fa-solid fa-triangle-exclamation text-danger"></i> Suspend Experience Listing
            </h3>
            <form onSubmit={submitSuspend} className="space-y-4 text-xs font-semibold">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-primary uppercase">Suspension Mode</label>
                <select
                  value={suspendMode}
                  onChange={e => setSuspendMode(e.target.value)}
                  className="border border-border rounded-lg px-2.5 py-1.5 outline-none focus:border-primary"
                >
                  <option value="Temporary">Temporary Suspension</option>
                  <option value="Permanent">Permanent Ban / De-list</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-primary uppercase">Suspension Reason</label>
                <select
                  value={suspendReason}
                  onChange={e => setSuspendReason(e.target.value)}
                  required
                  className="border border-border rounded-lg px-2.5 py-1.5 outline-none focus:border-primary"
                >
                  <option value="">Select Reason...</option>
                  <option value="Safety Violations">Safety Violations</option>
                  <option value="Customer Complaints">Customer Complaints</option>
                  <option value="Fake Information">Fake Information</option>
                  <option value="Expired Licenses">Expired Licenses</option>
                  <option value="Legal Issues">Legal Issues</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-primary uppercase">Detailed Audit Comments</label>
                <textarea
                  rows={3}
                  required
                  value={suspendComments}
                  onChange={e => setSuspendComments(e.target.value)}
                  placeholder="Input support logs, safety breach descriptions, or ticket references..."
                  className="border border-border rounded-lg p-2.5 outline-none focus:border-primary"
                />
              </div>
              <div className="flex justify-end gap-3 pt-3 border-t border-border">
                <button type="button" onClick={closeSuspend} className="btn-secondary">Cancel</button>
                <button type="submit" className="bg-red-500 hover:bg-red-600 text-white font-bold px-4 py-2 rounded-lg shadow-sm text-xs">
                  Confirm Suspend
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
