import { useMemo } from 'react';
import { startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';

// Import your existing post type here
interface ScheduledPost {
  id: string;
  scheduledFor: string; // ISO string
  title: string;
  // ... other fields
}

export function usePlanner(brandId: string | undefined, allPosts: ScheduledPost[]) {
  const calendarDays = useMemo(() => {
    const start = startOfMonth(new Date());
    const end = endOfMonth(new Date());
    return eachDayOfInterval({ start, end });
  }, []);

  const getPostsForDay = (date: Date) => {
    return allPosts.filter(post => 
      isSameDay(new Date(post.scheduledFor), date)
    );
  };

  return {
    calendarDays,
    getPostsForDay
  };
}
