import { useMemo } from 'react';
import { useScheduledPosts } from './useScheduledPosts'; // Existing hook
import { startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';

export function usePlanner(brandId?: string) {
  const { posts, loading, schedulePost, deletePost } = useScheduledPosts(brandId);

  const calendarDays = useMemo(() => {
    const start = startOfMonth(new Date());
    const end = endOfMonth(new Date());
    return eachDayOfInterval({ start, end });
  }, []);

  const getPostsForDay = (date: Date) => {
    return posts.filter(p => 
      new Date(p.scheduledFor).toDateString() === date.toDateString()
    );
  };

  return { 
    calendarDays, 
    getPostsForDay, 
    schedulePost, 
    deletePost, 
    loading 
  };
}
