"use client";
import AdminLayout from "@/components/admin/AdminLayout";
export default function Page() {
  return (
    <AdminLayout title="Reviews Moderation" subtitle="Coming soon — this section is under construction.">
      <div className="bg-white border border-border rounded-2xl p-12 text-center shadow-sm">
        <i className="fa-solid fa-tools text-4xl text-text-muted mb-4 block"></i>
        <h3 className="text-lg font-bold text-primary mb-2">Under Construction</h3>
        <p className="text-sm text-text-muted">This admin section is being built. Check back soon.</p>
      </div>
    </AdminLayout>
  );
}
