// Define the Event interface, now with an optional meetLink property
export type Event= {
  id: string; // Google event IDs are strings
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
  scheduleMeeting?:boolean |undefined;
  meetLink?: string; // New optional property for the Google Meet link
}
