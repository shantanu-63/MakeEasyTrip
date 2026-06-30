'use client';

import { useState, useEffect, Suspense } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';

interface Booking {
  id: string;
  customerName: string;
  propertyName: string;
  propertyId?: string;
  checkin: string;
  checkout?: string;
  createdDate?: string;
  pricePaid: number;
  type?: string;
  status: string;
}

const MOCK_BOOKINGS: Booking[] = [
  { id: 'MET-2601-1001', customerName: 'Rahul Kumar', propertyName: 'Ocean Palms Beach Resort', checkin: '2026-07-10', checkout: '2026-07-14', createdDate: '2026-06-01T10:00:00Z', pricePaid: 24000, type: 'Hotel', status: 'Confirmed' },
  { id: 'MET-2601-1002', customerName: 'Priya Sharma', propertyName: 'Goa Water Sports', checkin: '2026-07-15', checkout: '2026-07-15', createdDate: '2026-06-03T11:30:00Z', pricePaid: 5000, type: 'Activity', status: 'Confirmed' },
  { id: 'MET-2601-1003', customerName: 'Amit Verma', propertyName: 'Ubud Rainforest Resort', checkin: '2026-06-20', checkout: '2026-06-25', createdDate: '2026-05-28T09:00:00Z', pricePaid: 45000, type: 'Hotel', status: 'Completed' },
  { id: 'MET-2601-1004', customerName: 'Sneha Patel', propertyName: 'Manali Trek', checkin: '2026-08-01', checkout: '2026-08-01', createdDate: '2026-06-10T14:00:00Z', pricePaid: 9000, type: 'Activity', status: 'Pending' },
  { id: 'MET-2601-1005', customerName: 'Vikram Singh', propertyName: 'Jaipur Palace Hotel', checkin: '2026-07-05', checkout: '2026-07-08', createdDate: '2026-06-05T16:00:00Z', pricePaid: 18000, type: 'Hotel', status: 'Cancelled' },
  { id: 'MET-2601-1006', customerName: 'Ananya Das', propertyName: 'Kerala Backwaters Cruise', checkin: '2026-07-20', checkout: '2026-07-20', createdDate: '2026-06-12T08:00:00Z', pricePaid: 12000, type: 'Activity', status: 'Confirmed' },
];

function BookingsContent() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadBookings();
  }, []);

  function loadBookings() {
    try {
      const stored = localStorage.getItem('met_platform_bookings');
      const data: Booking[] = stored ? JSON.parse(stored) : [];
      setBookings(data.length > 0 ? data : MOCK_BOOKINGS);
    } catch {
      setBookings(MOCK_BOOKINGS);
    }
  }

  const filtered = bookings.filter(b => {
    const matchStatus = !filterStatus || b.status === filterStatus;
    const q = search.toLowerCase();
    const matchSearch = !search || b.customerName.toLowerCase().includes(q) || b.id.toLowerCase().includes(q) || (b.propertyName || '').toLowerCase().includes(q);
    const matchFrom = !filterDateFrom || b.checkin >= filterDateFrom;
    const matchTo = !filterDateTo || b.checkin <= filterDateTo;
    return matchStatus && matchSearch && matchFrom && matchTo;
  });

  const total = bookings.length;
  const confirmed = bookings.filter(b => b.status === 'Confirmed').length;
  const cancelled = bookings.filter(b => b.status === 'Cancelled').length;
  const totalRevenue = bookings.filter(b => b.status !== 'Cancelled').reduce((sum, b) => sum + (b.pricePaid || 0), 0);

  function formatDate(dateStr: string) {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  }

  function formatCurrency(amount: number) {
    return `₹${amount.toLocaleString('en-IN')}`;
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case 'Confirmed': return 'badge approved';
      case 'Pending': return 'badge warning';
      case 'Cancelled': return 'badge danger';
      case 'Completed': return 'badge info';
      default: return 'badge warning';
    }
  }

  function getTypeBadge(type?: string) {
    if (type === 'Activity') return 'badge info';
    return 'badge approved';
  }

  return (
    <AdminLayout>
      {/* Page Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-primary font-heading">Bookings Registry</h2>
        <p className="text-sm text-text-muted">Review payment transactions, confirm guest check-in parameters, and manage booking details.</p>
      </div>

      {/* KPI Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="admin-card">
          <div className="admin-card-accent bg-primary"></div>
          <div className="admin-card-title">Total Bookings</div>
          <div className="admin-card-value">{total}</div>
        </div>
        <div className="admin-card">
          <div className="admin-card-accent bg-success"></div>
          <div className="admin-card-title">Confirmed</div>
          <div className="admin-card-value text-success">{confirmed}</div>
        </div>
        <div className="admin-card">
          <div className="admin-card-accent bg-danger"></div>
          <div className="admin-card-title">Cancelled</div>
          <div className="admin-card-value text-danger">{cancelled}</div>
        </div>
        <div className="admin-card">
          <div className="admin-card-accent bg-secondary"></div>
          <div className="admin-card-title">Total Revenue</div>
          <div className="admin-card-value text-secondary" style={{ fontSize: '20px' }}>{formatCurrency(totalRevenue)}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-border rounded-2xl p-5 shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-semibold">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-primary uppercase">Booking Status</label>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="border border-border rounded-lg px-2.5 py-1.5 outline-none focus:border-primary"
            >
              <option value="">All Statuses</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Pending">Pending</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-primary uppercase">Check-In From</label>
            <input
              type="date"
              value={filterDateFrom}
              onChange={e => setFilterDateFrom(e.target.value)}
              className="border border-border rounded-lg px-2.5 py-1.5 outline-none focus:border-primary"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-primary uppercase">Check-In To</label>
            <input
              type="date"
              value={filterDateTo}
              onChange={e => setFilterDateTo(e.target.value)}
              className="border border-border rounded-lg px-2.5 py-1.5 outline-none focus:border-primary"
            />
          </div>
          <div className="flex flex-col gap-1 justify-end relative">
            <label className="text-[10px] font-bold text-primary uppercase">Search</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-text-muted">
                <i className="fa-solid fa-search text-[10px]"></i>
              </span>
              <input
                type="text"
                placeholder="Customer name or booking ID..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 border border-border rounded-lg outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
        <div className="table-responsive">
          <table className="partner-table">
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Customer</th>
                <th>Property Name</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Amount</th>
                <th>Type</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-text-muted font-semibold">
                    <i className="fa-solid fa-receipt text-2xl mb-2 block text-slate-300"></i>
                    No bookings found matching selection.
                  </td>
                </tr>
              ) : (
                filtered.map(b => (
                  <tr key={b.id} className="admin-table-row text-xs">
                    <td><strong>{b.id}</strong></td>
                    <td className="font-bold text-primary">{b.customerName}</td>
                    <td className="font-bold text-primary max-w-[150px] truncate" title={b.propertyName}>{b.propertyName}</td>
                    <td className="text-text-muted font-semibold">{formatDate(b.checkin)}</td>
                    <td className="text-text-muted">{b.checkout ? formatDate(b.checkout) : 'N/A'}</td>
                    <td className="font-bold text-primary">{formatCurrency(b.pricePaid)}</td>
                    <td><span className={getTypeBadge(b.type)}>{b.type || 'Hotel'}</span></td>
                    <td><span className={getStatusBadge(b.status)}>{b.status}</span></td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="btn-secondary"
                        style={{ padding: '4px 10px', fontSize: '11px' }}
                        onClick={() => alert(`Viewing booking ${b.id}`)}
                      >
                        <i className="fa-solid fa-eye mr-1"></i>View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}

export default function BookingsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-primary text-sm font-semibold animate-pulse">Loading bookings...</div>
      </div>
    }>
      <BookingsContent />
    </Suspense>
  );
}
