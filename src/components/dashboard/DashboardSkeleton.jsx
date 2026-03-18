import { memo } from 'react';
import DesignSkeleton from '../ui/DesignSkeleton';

/** Full-page loading skeleton — shown while dashboard data is fetching */
const DashboardSkeleton = memo(function DashboardSkeleton() {
  return (
    <div className="home-scroll-content" aria-label="Loading dashboard">
      {/* Nutrition summary skeleton */}
      <div className="skel-card">
        <DesignSkeleton width={110} height={18} className="skel-title" />
        <DesignSkeleton width={160} height={160} borderRadius={999} className="skel-ring" />
        <DesignSkeleton width="100%" height={8} />
        <DesignSkeleton width="85%" height={8} />
        <DesignSkeleton width="70%" height={8} />
      </div>

      {/* Meal rows skeleton */}
      <div className="skel-card">
        <DesignSkeleton width={110} height={18} className="skel-title" />
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="skel-row" style={{ marginBottom: 12 }}>
            <DesignSkeleton width={40} height={40} borderRadius={12} />
            <div style={{ flex: 1 }}>
              <div style={{ marginBottom: 6 }}>
                <DesignSkeleton width="60%" height={8} />
              </div>
              <DesignSkeleton width="40%" height={8} />
            </div>
          </div>
        ))}
      </div>

      {/* Activity skeleton */}
      <div className="skel-card">
        <DesignSkeleton width={110} height={18} className="skel-title" />
        <div className="skel-row">
          <DesignSkeleton width="33%" height={60} borderRadius={8} />
          <DesignSkeleton width="33%" height={60} borderRadius={8} />
          <DesignSkeleton width="33%" height={60} borderRadius={8} />
        </div>
        <DesignSkeleton width="100%" height={40} borderRadius={12} />
      </div>

      {/* Habits skeleton */}
      <div className="skel-card">
        <DesignSkeleton width={110} height={18} className="skel-title" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="skel-row" style={{ alignItems: 'center', marginBottom: 10 }}>
            <DesignSkeleton width={24} height={24} borderRadius={8} />
            <div style={{ flex: 1 }}><DesignSkeleton width="100%" height={8} /></div>
          </div>
        ))}
      </div>

      {/* Water skeleton */}
      <div className="skel-card">
        <DesignSkeleton width={110} height={18} className="skel-title" />
        <DesignSkeleton width="50%" height={36} style={{ marginBottom: 10 }} />
        <DesignSkeleton width="100%" height={8} />
        <div className="skel-row" style={{ marginTop: 12 }}>
          <DesignSkeleton width="33%" height={38} borderRadius={14} />
          <DesignSkeleton width="33%" height={38} borderRadius={14} />
          <DesignSkeleton width="33%" height={38} borderRadius={14} />
        </div>
      </div>

      {/* Progress skeleton */}
      <div className="skel-card">
        <div className="skel-row" style={{ alignItems: 'center' }}>
          <div style={{ flex: 1 }}>
            <DesignSkeleton width={110} height={18} className="skel-title" />
            <DesignSkeleton width="40%" height={8} />
          </div>
          <DesignSkeleton width={80} height={40} borderRadius={8} />
        </div>
      </div>
    </div>
  );
});

export default DashboardSkeleton;
