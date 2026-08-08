export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 bg-stone-100 flex items-center justify-center">
      {children}
    </div>
  );
}
