import { useMemo } from 'react';
import { startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';

export function usePlanner(brandId?: string) {
  // Assuming posts are managed by your existing scheduling hook
  const { posts } = { posts: [] }; 

  const calendarDays = useMemo(() => {
    return eachDayOfInterval({ start: startOfMonth(new Date()), end: endOfMonth(new Date()) });
  }, []);

  const getPostsForDay = (date: Date) => 
    posts.filter(p => new Date(p.scheduledFor).toDateString() === date.toDateString());

  return { calendarDays, getPostsForDay };
}
