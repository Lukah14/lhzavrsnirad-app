/**
 * PageShell — consistent page scaffold
 * Safe-area padding, bottom clearance for floating bottom nav.
 * Wrap main scroll content with this for uniform layout.
 */
export default function PageShell({ children, className = '', noPadding }) {
  return (
    <div
      className={`page-shell${noPadding ? ' page-shell--no-pad' : ''} ${className}`.trim()}
      role="main"
    >
      {children}
    </div>
  );
}
