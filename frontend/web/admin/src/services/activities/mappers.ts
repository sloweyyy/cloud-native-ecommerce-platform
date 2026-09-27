import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { ActivityResponse, Activity } from './types';

// Extend dayjs with relativeTime plugin
dayjs.extend(relativeTime);

export const activityMapper = {
  /**
   * Map API response to DTO with timeAgo calculation
   */
  toDto: (response: ActivityResponse): Activity => {
    const occurredAt = dayjs(response.occurredAt);
    const timeAgo = occurredAt.fromNow();
    
    return {
      ...response,
      timeAgo,
    };
  },

  /**
   * Map list of API responses to DTOs
   */
  toListDto: (responses: ActivityResponse[]): Activity[] => {
    return responses.map(activityMapper.toDto);
  },
};

