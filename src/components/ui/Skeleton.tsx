import React from 'react';

export const SkeletonText: React.FC<{ width?: string; height?: string; className?: string }> = ({
  width = '100%',
  height = '1rem',
  className = ''
}) => (
  <div
    className={`cv-skeleton cv-skeleton-text ${className}`}
    style={{ width, height }}
    aria-hidden="true"
  />
);

export const SkeletonAvatar: React.FC<{ size?: string }> = ({ size = '40px' }) => (
  <div
    className="cv-skeleton cv-skeleton-avatar"
    style={{ width: size, height: size, borderRadius: '50%' }}
    aria-hidden="true"
  />
);

export const SkeletonCard: React.FC = () => (
  <div className="cv-card cv-skeleton-card" aria-hidden="true">
    <div className="cv-skeleton-card-header">
      <SkeletonAvatar size="36px" />
      <SkeletonText width="60%" height="1.2rem" />
    </div>
    <div className="cv-skeleton-card-body">
      <SkeletonText width="100%" height="0.9rem" />
      <SkeletonText width="80%" height="0.9rem" />
      <SkeletonText width="40%" height="0.9rem" />
    </div>
  </div>
);
