'use client';

import { useState, useEffect, useMemo } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';

interface NotificationLog {
  id: string;
  recipientName: string;
  recipientEmail: string;
  channel: 'Email' | 'SMS' | 'Push' | 'In-App';
  template: string;
  status: 'Delivered' | 'Opened' | 'Clicked' | 'Failed' | 'Pending';
  sentAt: string;
}

interface QuickSendForm {
  type: 'Email' | 'SMS' | 'Push';
  subject: string;
  message: string;
  recipient: string;
}

const MOCK_NOTIFICATIONS: NotificationLog[] = [
  { id: 'NL-001', recipientName: 'Priya Sharma', recipientEmail: 'priya@example.com', channel: 'Email', template: 'Booking Confirmation', status: 'Delivered', sentAt: '2026-06-05T10:00:00Z' },
  { id: 'NL-002', recipientName: 'Arjun Mehta', recipientEmail: 'arjun@example.com', channel: 'SMS', template: 'OTP Verification', status: 'Delivered', sentAt: '2026-06-05T10:05:00Z' },
  { id: 'NL-003', recipientName: 'Riya Desai', recipientEmail: 'riya@example.com', channel: 'Push', template: 'Special Offer', status: 'Clicked', sentAt: '2026-06-05T09:45:00Z' },
  { id: 'NL-004', recipientName: 'Karan Patel', recipientEmail: 'karan@example.com', channel: 'Email', template: 'Cancellation Confirmation', status: 'Delivered', sentAt: '2026-06-05T09:30:00Z' },
  { id: 'NL-005', recipientName: 'Sneha Roy', recipientEmail: 'sneha@example.com', channel: 'SMS', template: 'Refund Notification', status: 'Failed', sentAt: '2026-06-05T09:15:00Z' },
  { id: 'NL-006', recipientName: 'Vikram Singh', recipientEmail: 'vikram@example.com', channel: 'Push', template: 'Booking Reminder', status: 'Delivered', sentAt: '2026-06-05T09:00:00Z' },
  { id: 'NL-007', recipientName: 'Anjali Nair', recipientEmail: 'anjali@example.com', channel: 'Email', template: 'Welcome Email', status: 'Opened', sentAt: '2026-06-05T08:45:00Z' },
  { id: 'NL-008', recipientName: 'Rohan Das', recipientEmail: 'rohan@example.com', channel: 'Email', template: 'Review Request', status: 'Delivered', sentAt: '2026-06-05T08:30:00Z' },
];

function getChannelBadgeClass(channel: string): string {
  switch (channel) {
    case 'Email': return 'bg-purple-50 text-purple-600';
    case 'SMS': return 'bg-green-50 text-green-600';
    case 'Push': return 'bg-orange-50 text-orange-500';
    case 'In-App': return 'bg-blue-50 text-blue-600';
    default: return 'bg-slate-50 text-slate-500';
  }
}

function getStatusBadgeClass(status: string): string {
  switch (status) {
    case 'Delivered': return 'bg-green-50 text-green-600';
    case 'Opened': return 'bg-blue-50 text-blue-600';
    case 'Clicked': return 'bg-purple-50 text-purple-600';
    case 'Failed': return 'bg-red-50 text-red-500';
    case 'Pending': return 'bg-yellow-50 text-yellow-600';
    default: return 'bg-slate-50 text-slate-500';
  }
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
  });
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationLog[]>([]);
  const [form, setForm] = useState<QuickSendForm>({ type: 'Email', subject: '', message: '', recipient: '' });
  const [sendSuccess, setSendSuccess] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('met_admin_notifications') || localStorage.getItem('met_notification_logs');
    if (stored) {
      try {
        setNotifications(JSON.parse(stored));
      } catch {
        setNotifications(MOCK_NOTIFICATIONS);
      }
    } else {
      setNotifications(MOCK_NOTIFICATIONS);
    }
  }, []);

  const stats = useMemo(() => {
    const total = notifications.length;
    const emailList = notifications.filter(n => n.channel === 'Email');
    const smsList = notifications.filter(n => n.channel === 'SMS');
    const pushList = notifications.filter(n => n.channel === 'Push');
    const failed = notifications.filter(n => n.status === 'Failed').length;
    const emailDelivery = emailList.length
      ? Math.round((emailList.filter(n => n.status !== 'Failed').length / emailList.length) * 100)
      : 98;
    const smsDelivery = smsList.length
      ? Math.round((smsList.filter(n => n.status !== 'Failed').length / smsList.length) * 100)
      : 96;
    const pushClick = pushList.length
      ? Math.round((pushList.filter(n => n.status === 'Clicked').length / pushList.length) * 100)
      : 24;
    return {
      total: total || 12,
      emailSent: emailList.length || 5,
      smsSent: smsList.length || 4,
      pushSent: pushList.length || 3,
      failed: failed || 2,
      emailDelivery,
      smsDelivery,
      pushClick,
    };
  }, [notifications]);

  const channelPcts = useMemo(() => {
    const total = stats.emailSent + stats.smsSent + stats.pushSent;
    if (total === 0) return { email: 42, sms: 28, push: 22, inApp: 8 };
    return {
      email: Math.round((stats.emailSent / total) * 100),
      sms: Math.round((stats.smsSent / total) * 100),
      push: Math.round((stats.pushSent / total) * 100),
      inApp: 8,
    };
  }, [stats]);

  function handleSend() {
    if (!form.recipient || !form.message) return;
    const newNotif: NotificationLog = {
      id: `NL-${String(Date.now()).slice(-5)}`,
      recipientName: form.recipient,
      recipientEmail: form.recipient,
      channel: form.type,
      template: form.subject || 'Quick Message',
      status: 'Delivered',
      sentAt: new Date().toISOString(),
    };
    const updated = [newNotif, ...notifications];
    setNotifications(updated);
    localStorage.setItem('met_admin_notifications', JSON.stringify(updated));
    setForm({ type: 'Email', subject: '', message: '', recipient: '' });
    setSendSuccess(true);
    setTimeout(() => setSendSuccess(false), 3000);
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Page Title */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-[#0A225C]" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Notification Control Center
            </h1>
            <p className="text-sm text-slate-500 mt-1">Monitor all communication channels — Email, SMS, Push &amp; In-App</p>
          </div>
          <button className="flex items-center gap-2 bg-[#FF5E14] text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-[#E04D0A] transition-all shadow-sm">
            <i className="fa-solid fa-bullhorn" /> New Broadcast
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-sm border-l-4 border-l-blue-500">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Sent</span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                <i className="fa-solid fa-paper-plane text-blue-600 text-sm" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-[#0A225C]">{stats.total.toLocaleString()}</div>
            <div className="text-xs text-green-600 font-bold mt-1">
              <i className="fa-solid fa-arrow-trend-up mr-1" />+18% this week
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-sm border-l-4 border-l-purple-500">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Emails Sent</span>
              <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center">
                <i className="fa-solid fa-envelope text-purple-600 text-sm" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-[#0A225C]">{stats.emailSent}</div>
            <div className="text-xs text-slate-500 font-bold mt-1">{stats.emailDelivery}% delivery rate</div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-sm border-l-4 border-l-green-500">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">SMS Sent</span>
              <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center">
                <i className="fa-solid fa-comment-sms text-green-600 text-sm" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-[#0A225C]">{stats.smsSent}</div>
            <div className="text-xs text-slate-500 font-bold mt-1">{stats.smsDelivery}% delivery rate</div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-sm border-l-4 border-l-orange-500">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Push Sent</span>
              <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center">
                <i className="fa-solid fa-mobile-screen text-orange-500 text-sm" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-[#0A225C]">{stats.pushSent}</div>
            <div className="text-xs text-slate-500 font-bold mt-1">{stats.pushClick}% click rate</div>
          </div>
        </div>

        {/* Analytics + Quick Send Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Channel Breakdown */}
          <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-sm">
            <h3 className="text-sm font-extrabold text-[#0A225C] mb-4">Channel Breakdown</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-bold mb-1.5">
                  <span className="text-slate-500">Email</span>
                  <span className="text-[#0A225C]">{channelPcts.email}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full" style={{ width: `${channelPcts.email}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs font-bold mb-1.5">
                  <span className="text-slate-500">SMS</span>
                  <span className="text-[#0A225C]">{channelPcts.sms}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full" style={{ width: `${channelPcts.sms}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs font-bold mb-1.5">
                  <span className="text-slate-500">Push</span>
                  <span className="text-[#0A225C]">{channelPcts.push}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-orange-500 rounded-full" style={{ width: `${channelPcts.push}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs font-bold mb-1.5">
                  <span className="text-slate-500">In-App</span>
                  <span className="text-[#0A225C]">{channelPcts.inApp}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${channelPcts.inApp}%` }} />
                </div>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-[#E2E8F0] grid grid-cols-2 gap-3">
              <div className="text-center">
                <div className="text-lg font-extrabold text-[#0A225C]">74%</div>
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wide mt-0.5">Open Rate</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-extrabold text-[#0A225C]">24%</div>
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wide mt-0.5">Click Rate</div>
              </div>
            </div>
          </div>

          {/* Quick Send Panel */}
          <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-sm lg:col-span-2">
            <h3 className="text-sm font-extrabold text-[#0A225C] mb-4">
              <i className="fa-solid fa-paper-plane mr-2 text-[#FF5E14]" />Quick Send Notification
            </h3>
            {sendSuccess && (
              <div className="mb-4 bg-green-50 border border-green-200 text-green-700 text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2">
                <i className="fa-solid fa-circle-check" /> Notification sent successfully!
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-[#0A225C] uppercase tracking-wider">Notification Type</label>
                <select
                  value={form.type}
                  onChange={e => setForm(f => ({ ...f, type: e.target.value as 'Email' | 'SMS' | 'Push' }))}
                  className="border border-[#E2E8F0] rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#0A225C]"
                >
                  <option value="Email">📧 Email</option>
                  <option value="SMS">💬 SMS</option>
                  <option value="Push">📱 Push</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-[#0A225C] uppercase tracking-wider">Recipient</label>
                <input
                  type="text"
                  placeholder="Email / Phone / User ID"
                  value={form.recipient}
                  onChange={e => setForm(f => ({ ...f, recipient: e.target.value }))}
                  className="border border-[#E2E8F0] rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#0A225C]"
                />
              </div>
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-[10px] font-bold text-[#0A225C] uppercase tracking-wider">Subject</label>
                <input
                  type="text"
                  placeholder="Notification subject line"
                  value={form.subject}
                  onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                  className="border border-[#E2E8F0] rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#0A225C]"
                />
              </div>
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-[10px] font-bold text-[#0A225C] uppercase tracking-wider">Message</label>
                <textarea
                  placeholder="Write your notification message here..."
                  rows={3}
                  value={form.message}
                  onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  className="border border-[#E2E8F0] rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#0A225C] resize-none"
                />
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={handleSend}
                className="flex items-center gap-2 bg-[#FF5E14] text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-[#E04D0A] transition-all shadow-sm"
              >
                <i className="fa-solid fa-paper-plane" /> Send Now
              </button>
            </div>
          </div>
        </div>

        {/* Recent Notifications Table */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0]">
            <h3 className="text-sm font-extrabold text-[#0A225C]">Recent Notifications</h3>
            <span className="text-xs font-bold text-[#FF5E14] cursor-pointer hover:underline">View All Logs →</span>
          </div>
          <div className="overflow-x-auto">
            <table className="partner-table w-full">
              <thead>
                <tr>
                  <th>Notification ID</th>
                  <th>Recipient</th>
                  <th>Channel</th>
                  <th>Template / Subject</th>
                  <th>Status</th>
                  <th>Sent At</th>
                </tr>
              </thead>
              <tbody>
                {notifications.slice(0, 8).map(n => (
                  <tr key={n.id} className="admin-table-row">
                    <td className="font-mono text-xs text-slate-500">{n.id}</td>
                    <td>
                      <div className="font-bold text-[#1E293B] text-sm">{n.recipientName}</div>
                      <div className="text-[11px] text-slate-400">{n.recipientEmail}</div>
                    </td>
                    <td>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${getChannelBadgeClass(n.channel)}`}>
                        {n.channel}
                      </span>
                    </td>
                    <td className="text-slate-500 text-sm">{n.template}</td>
                    <td>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${getStatusBadgeClass(n.status)}`}>
                        {n.status}
                      </span>
                    </td>
                    <td className="text-slate-500 text-xs">{formatDate(n.sentAt)}</td>
                  </tr>
                ))}
                {notifications.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center text-slate-400 py-8">No notifications found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Access Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl p-5 text-white hover:shadow-lg transition-all hover:-translate-y-0.5 cursor-pointer group">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-3">
              <i className="fa-solid fa-envelope text-lg" />
            </div>
            <div className="font-extrabold text-base">Email Templates</div>
            <div className="text-xs text-white/70 mt-1">9 templates</div>
            <div className="mt-3 text-xs font-bold flex items-center gap-1 text-white/80">
              Manage <i className="fa-solid fa-arrow-right text-[10px] group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-2xl p-5 text-white hover:shadow-lg transition-all hover:-translate-y-0.5 cursor-pointer group">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-3">
              <i className="fa-solid fa-comment-sms text-lg" />
            </div>
            <div className="font-extrabold text-base">SMS Templates</div>
            <div className="text-xs text-white/70 mt-1">4 templates</div>
            <div className="mt-3 text-xs font-bold flex items-center gap-1 text-white/80">
              Manage <i className="fa-solid fa-arrow-right text-[10px] group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-orange-500 to-orange-700 rounded-2xl p-5 text-white hover:shadow-lg transition-all hover:-translate-y-0.5 cursor-pointer group">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-3">
              <i className="fa-solid fa-mobile-screen text-lg" />
            </div>
            <div className="font-extrabold text-base">Push Templates</div>
            <div className="text-xs text-white/70 mt-1">4 templates</div>
            <div className="mt-3 text-xs font-bold flex items-center gap-1 text-white/80">
              Manage <i className="fa-solid fa-arrow-right text-[10px] group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-[#0A225C] to-[#16368C] rounded-2xl p-5 text-white hover:shadow-lg transition-all hover:-translate-y-0.5 cursor-pointer group">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-3">
              <i className="fa-solid fa-bullhorn text-lg" />
            </div>
            <div className="font-extrabold text-base">Broadcast</div>
            <div className="text-xs text-white/70 mt-1">Mass messaging tool</div>
            <div className="mt-3 text-xs font-bold flex items-center gap-1 text-white/80">
              Compose <i className="fa-solid fa-arrow-right text-[10px] group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
