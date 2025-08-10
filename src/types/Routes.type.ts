// Interfaces for better type safety
export type CalendarEvent= {
  id: string;
  title: string;
  date: Date;
  time: string;
  duration: string;
  location?: string;
  attendees?: number;
  priority: 'high' | 'medium' | 'low';
  description?: string;
  indicator: string;
  hour: string;
  minute: string;
  ampm: 'AM' | 'PM';
  meetLink?: string;
}

export type EventRequestBody= {
  summary: string;
  description?: string;
  start: {
    dateTime: string;
  };
  end: {
    dateTime: string;
  };
  createMeetLink?: boolean;
}
