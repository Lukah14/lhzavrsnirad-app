import { memo } from 'react';

/** Full-page loading skeleton — shown while dashboard data is fetching */
const DashboardSkeleton = memo(function DashboardSkeleton() {
  return (
    <div className="home-scroll-content" aria-label="Loading dashboard">
      {/* Nutrition summary skeleton */}
      <div className="skel-card">
        <div className="skel-block skel-title" />
        <div className="skel-block skel-ring" />
        <div className="skel-block skel-bar" style={{ width: '100%' }} />
        <div className="skel-block skel-bar" style={{ width: '85%' }} />
        <div className="skel-block skel-bar" style={{ width: '70%' }} />
      </div>

      {/* Meal rows skeleton */}
      <div className="skel-card">
        <div className="skel-block skel-title" />
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="skel-row" style={{ marginBottom: 12 }}>
            <div className="skel-block" style={{ width: 40, height: 40, borderRadius: 12, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div className="skel-block skel-bar" style={{ width: '60%', marginBottom: 6 }} />
              <div className="skel-block skel-bar" style={{ width: '40%' }} />
            </div>
          </div>
        ))}
      </div>

      {/* Activity skeleton */}
      <div className="skel-card">
        <div className="skel-block skel-title" />
        <div className="skel-row">
          <div className="skel-block skel-pill" />
          <div className="skel-block skel-pill" />
          <div className="skel-block skel-pill" />
        </div>
        <div className="skel-block skel-bar" style={{ width: '100%', height: 40, borderRadius: 12 }} />
      </div>

      {/* Habits skeleton */}
      <div className="skel-card">
        <div className="skel-block skel-title" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="skel-row" style={{ alignItems: 'center', marginBottom: 10 }}>
            <div className="skel-block" style={{ width: 24, height: 24, borderRadius: 8, flexShrink: 0 }} />
            <div className="skel-block skel-bar" style={{ flex: 1, width: 'auto' }} />
          </div>
        ))}
      </div>

      {/* Water skeleton */}
      <div className="skel-card">
        <div className="skel-block skel-title" />
        <div className="skel-block skel-bar" style={{ width: '50%', height: 36, marginBottom: 10 }} />
        <div className="skel-block skel-bar" style={{ width: '100%' }} />
        <div className="skel-row" style={{ marginTop: 12 }}>
          <div className="skel-block skel-pill" style={{ height: 38 }} />
          <div className="skel-block skel-pill" style={{ height: 38 }} />
          <div className="skel-block skel-pill" style={{ height: 38 }} />
        </div>
      </div>

      {/* Progress skeleton */}
      <div className="skel-card">
        <div className="skel-row" style={{ alignItems: 'center' }}>
          <div style={{ flex: 1 }}>
            <div className="skel-block skel-title" />
            <div className="skel-block skel-bar" style={{ width: '40%' }} />
          </div>
          <div className="skel-block" style={{ width: 80, height: 40, borderRadius: 8 }} />
        </div>
      </div>
    </div>
  );
});

export default DashboardSkeleton;
