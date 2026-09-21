export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Auth pages render full-viewport split layouts.
    // The root SiteNav is position:fixed, so it floats on top — auth pages
    // account for this with top padding on their form panels.
    <div className="auth-shell">
      {children}
    </div>
  );
}
