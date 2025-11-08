import React from 'react';
import { FireIcon } from './icons/FireIcon';
import { NewIcon } from './icons/NewIcon';
import { TopIcon } from './icons/TopIcon';

interface SortBarProps {
  currentSort: string;
  onSortChange: (sort: string) => void;
}

const SortBar: React.FC<SortBarProps> = ({ currentSort, onSortChange }) => {
  const sortOptions = [
    { key: 'hot', label: 'Hot', Icon: FireIcon },
    { key: 'new', label: 'New', Icon: NewIcon },
    { key: 'top', label: 'Top', Icon: TopIcon },
  ];
  
  return (
    <div className="bg-reddit-dark-soft border border-reddit-border rounded-md p-2 flex items-center space-x-2">
      {sortOptions.map(({ key, label, Icon }) => (
        <button
          key={key}
          onClick={() => onSortChange(key)}
          aria-pressed={currentSort === key}
          className={`flex items-center space-x-2 px-4 py-2 rounded-full font-bold text-sm transition-colors duration-200 ${
            currentSort === key
              ? 'bg-reddit-border text-white'
              : 'text-reddit-text-secondary hover:bg-reddit-border hover:text-white'
          }`}
        >
          <Icon className={`h-5 w-5 ${currentSort === key ? (key === 'hot' ? 'text-reddit-orange' : 'text-reddit-blue') : ''}`} />
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
};

export default SortBar;
