import AdminSidebar from "@/components/admin/AdminSidebar";

// Fixed full-screen overlay so the admin panel completely takes over the viewport,
// hiding the public Navbar/Footer that live in the root layout.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex bg-stone-50 overflow-hidden">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
