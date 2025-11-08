import React from 'react';

interface CommentSortBarProps {
  currentSort: string;
  onSortChange: (sort: string) => void;
}

const CommentSortBar: React.FC<CommentSortBarProps> = ({ currentSort, onSortChange }) => {
  const sortOptions = [
    { key: 'best', label: 'Best' },
    { key: 'new', label: 'New' },
    { key: 'old', label: 'Old' },
  ];

  return (
    <div className="flex items-center space-x-4 border-b border-reddit-border pb-2 mb-4">
        <span className="text-xs font-bold text-reddit-text-secondary uppercase">Sort by:</span>
      {sortOptions.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => onSortChange(key)}
          aria-pressed={currentSort === key}
          className={`px-3 py-1 rounded-full font-bold text-xs transition-colors duration-200 ${
            currentSort === key
              ? 'bg-reddit-border text-white'
              : 'text-reddit-text-secondary hover:bg-reddit-border hover:text-white'
          }`}
        >
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
};

export default CommentSortBar;
