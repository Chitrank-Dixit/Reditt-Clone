import React from 'react';
import { Link } from 'react-router-dom';
import type { Subreddit } from '../types';
import { RedditIcon } from './icons/RedditIcon';

interface SubredditListItemProps {
  subreddit: Subreddit;
}

const SubredditListItem: React.FC<SubredditListItemProps> = ({ subreddit }) => {
  return (
    <div className="p-3 bg-reddit-dark rounded-md border border-reddit-border hover:border-gray-500">
      <div className="flex items-center space-x-3">
        <RedditIcon className="h-8 w-8 text-reddit-orange flex-shrink-0" />
        <div className="flex-1">
          <Link to={`/r/${subreddit.name}`} className="font-bold text-white hover:underline">
            r/{subreddit.name}
          </Link>
          <p className="text-xs text-reddit-text-secondary">
            {subreddit.memberCount.toLocaleString()} members
          </p>
        </div>
        <Link to={`/r/${subreddit.name}`} className="bg-reddit-blue text-white font-bold py-1 px-4 text-sm rounded-full hover:bg-opacity-80">
            View
        </Link>
      </div>
    </div>
  );
};

export default SubredditListItem;
