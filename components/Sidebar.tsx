
import React from 'react';

const Sidebar: React.FC = () => {
  return (
    <aside className="space-y-4">
      <div className="bg-reddit-dark-soft border border-reddit-border rounded-md p-4">
        <h3 className="text-white font-bold border-b border-reddit-border pb-2 mb-3">Top Communities</h3>
        <ul className="space-y-2 text-sm">
          <li><a href="#" className="flex items-center space-x-2 hover:underline"><span className="font-bold">1.</span> <span>r/reactjs</span></a></li>
          <li><a href="#" className="flex items-center space-x-2 hover:underline"><span className="font-bold">2.</span> <span>r/typescript</span></a></li>
          <li><a href="#" className="flex items-center space-x-2 hover:underline"><span className="font-bold">3.</span> <span>r/tailwindcss</span></a></li>
          <li><a href="#" className="flex items-center space-x-2 hover:underline"><span className="font-bold">4.</span> <span>r/webdev</span></a></li>
        </ul>
        <button className="mt-4 w-full bg-reddit-blue text-white font-bold py-2 px-4 rounded-full text-sm">View All</button>
      </div>
      <div className="bg-reddit-dark-soft border border-reddit-border rounded-md p-4 sticky top-20">
        <h3 className="text-white font-bold border-b border-reddit-border pb-2 mb-3">Reddit Clone Info</h3>
        <p className="text-sm text-reddit-text-secondary">
          This is a Reddit clone created using React, TypeScript, and Tailwind CSS.
          It showcases a modern web application structure with components, services, and routing.
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;
