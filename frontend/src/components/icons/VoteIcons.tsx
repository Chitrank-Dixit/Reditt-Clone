import React from 'react';

export const UpvoteIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" {...props}>
    <path d="M12 4 4 12h5v8h6v-8h5L12 4z"></path>
  </svg>
);

export const DownvoteIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" {...props}>
    <path d="m12 20 8-8h-5V4H9v8H4l8 8z"></path>
  </svg>
);
