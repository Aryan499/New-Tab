import { auth, clerkClient } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { google, calendar_v3 } from 'googleapis';
import { GaxiosError } from 'gaxios';
import { EventRequestBody,CalendarEvent } from "@/types/Routes.type";

// Helper function to get an authenticated Google Calendar client
const getCalendarClient = async (userId: string) => {
  const client = await clerkClient();
  const provider = 'google';
  const clerkOauthResponse = await client.users.getUserOauthAccessToken(userId, provider);
  const oauthAccessTokens = clerkOauthResponse.data;

  if (!oauthAccessTokens || oauthAccessTokens.length === 0 || !oauthAccessTokens[0]?.token) {
    throw new Error('Failed to retrieve Google access token or token is invalid.');
  }

  const accessToken = oauthAccessTokens[0].token;
  
  const authClient = new google.auth.OAuth2();
  authClient.setCredentials({ access_token: accessToken });

  return google.calendar({ version: 'v3', auth: authClient });
}

// GET handler to list today's events
export async function GET(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const calendar = await getCalendarClient(userId);

    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    const url = new URL(request.url);
    const calendarId = url.searchParams.get('calendarId') || 'primary';

    try {
      const eventsResponse = await calendar.events.list({
        calendarId: calendarId,
        timeMin: startOfDay.toISOString(),
        timeMax: endOfDay.toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
      });

      const googleEvents = eventsResponse.data.items || [];
      
      const transformedEvents: CalendarEvent[] = googleEvents.map((googleEvent: calendar_v3.Schema$Event) => {
        const startDateTime = new Date(googleEvent.start?.dateTime || googleEvent.start?.date || '');
        const endDateTime = new Date(googleEvent.end?.dateTime || googleEvent.end?.date || '');

        const durationMs = endDateTime.getTime() - startDateTime.getTime();
        const durationMinutes = Math.round(durationMs / (1000 * 60));
        let durationString = '';
        if (durationMinutes < 60) {
          durationString = `${durationMinutes} mins`;
        } else {
          const hours = Math.floor(durationMinutes / 60);
          const minutes = durationMinutes % 60;
          durationString = `${hours} hr${hours > 1 ? 's' : ''}${minutes > 0 ? ` ${minutes} mins` : ''}`;
        }

        const eventHour = startDateTime.getHours();
        const eventMinute = startDateTime.getMinutes();
        const ampm = eventHour >= 12 ? 'PM' : 'AM';
        const displayHour = eventHour % 12 || 12;

        let meetLink: string | undefined;
        if (googleEvent.hangoutLink) {
          meetLink = googleEvent.hangoutLink;
        } else if (googleEvent.conferenceData?.entryPoints) {
          const videoEntryPoint = googleEvent.conferenceData.entryPoints.find(
            (entry) => entry.entryPointType === 'video'
          );
          if (videoEntryPoint?.uri) {
            meetLink = videoEntryPoint.uri;
          }
        }

        return {
          id: googleEvent.id || '',
          title: googleEvent.summary || 'No Title',
          date: startDateTime,
          time: `${displayHour}:${eventMinute.toString().padStart(2, '0')} ${ampm}`,
          duration: durationString,
          location: googleEvent.location ?? undefined,
          attendees: googleEvent.attendees ? googleEvent.attendees.length : 0,
          priority: 'medium', // Default priority, can be customized
          description: googleEvent.description || '',
          indicator: 'bg-gray-300', // Default indicator
          hour: displayHour.toString().padStart(2, '0'),
          minute: eventMinute.toString().padStart(2, '0'),
          ampm: ampm,
          meetLink: meetLink,
        };
      });

      return NextResponse.json({ 
        message: `Today's calendar events retrieved successfully`, 
        date: today.toDateString(),
        events: transformedEvents,
        count: transformedEvents.length
      });

    } catch (calendarError) {
      if (calendarError instanceof GaxiosError && (calendarError.response?.status === 401 || calendarError.response?.status === 403)) {
        return NextResponse.json({
          error: `Google Calendar API access denied. This might be due to an expired token or incorrect scopes.`,
          needsReauth: true
        }, { status: calendarError.response.status });
      }
      const errorMessage = calendarError instanceof Error ? calendarError.message : 'Unknown error';
      console.error('Error listing today\'s calendar events:', errorMessage);
      return NextResponse.json({ error: `Failed to list today's calendar events: ${errorMessage}` }, { status: 500 });
    }

  } catch (error) {
   
    console.error('General Error in GET API route:', error);
    return NextResponse.json({ error: `Internal Server Error: ${error}` }, { status: 500 });
  }
}

// POST handler to create a new event
export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const calendar = await getCalendarClient(userId);
    const eventData: EventRequestBody = await request.json();
    const calendarId = 'primary';

    try {
      const event: calendar_v3.Schema$Event = {
        summary: eventData.summary,
        description: eventData.description,
        start: {
          dateTime: eventData.start.dateTime,
          timeZone: 'Asia/Kolkata',
        },
        end: {
          dateTime: eventData.end.dateTime,
          timeZone: 'Asia/Kolkata',
        },
      };

      if (eventData.createMeetLink) {
        event.conferenceData = {
          createRequest: {
            requestId: `meet-${Date.now()}`,
            conferenceSolutionKey: { type: 'hangoutsMeet' }
          }
        };
      }

      const eventResponse = await calendar.events.insert({
        calendarId,
        requestBody: event,
        conferenceDataVersion: 1,
      });

      return NextResponse.json({
        message: 'Event created successfully',
        event: eventResponse.data,
      }, { status: 201 });

    } catch (calendarError) {
      const errorMessage = calendarError instanceof Error ? calendarError.message : 'Unknown error';
      console.error('Error creating event:', errorMessage);
      return NextResponse.json({ error: `Failed to create event: ${errorMessage}` }, { status: 500 });
    }

  } catch (error) {
    console.error('General Error in POST API route:', error);
    return NextResponse.json({ error: `Internal Server Error: ${error}` }, { status: 500 });
  }
}

// PUT handler to update an existing event
export async function PUT(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const calendar = await getCalendarClient(userId);
    const eventData: EventRequestBody = await request.json();
    const url = new URL(request.url);
    const eventId = url.searchParams.get('eventId');
    const calendarId = 'primary';

    if (!eventId) {
      return NextResponse.json({ error: 'Event ID is required for update' }, { status: 400 });
    }

    try {
      const updatedEvent: calendar_v3.Schema$Event = {
        summary: eventData.summary,
        description: eventData.description,
        start: {
          dateTime: eventData.start.dateTime,
          timeZone: 'Asia/Kolkata',
        },
        end: {
          dateTime: eventData.end.dateTime,
          timeZone: 'Asia/Kolkata',
        },
      };

      if (eventData.createMeetLink) {
        updatedEvent.conferenceData = {
          createRequest: {
            requestId: `meet-${Date.now()}`,
            conferenceSolutionKey: { type: 'hangoutsMeet' }
          }
        };
      }
      
      const eventResponse = await calendar.events.update({
        calendarId,
        eventId,
        requestBody: updatedEvent,
        conferenceDataVersion: 1,
      });

      return NextResponse.json({
        message: 'Event updated successfully',
        event: eventResponse.data,
      }, { status: 200 });

    } catch (calendarError) {
      const errorMessage = calendarError instanceof Error ? calendarError.message : 'Unknown error';
      console.error('Error updating event:', errorMessage);
      return NextResponse.json({ error: `Failed to update event: ${errorMessage}` }, { status: 500 });
    }

  } catch (error) {
    console.error('General Error in PUT API route:', error);
    return NextResponse.json({ error: `Internal Server Error: ${error}` }, { status: 500 });
  }
}

// DELETE handler to delete an event
export async function DELETE(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse(null, { status: 401 });
    }

    const calendar = await getCalendarClient(userId);
    const url = new URL(request.url);
    const eventId = url.searchParams.get('eventId');
    const calendarId = 'primary';

    if (!eventId) {
      return new NextResponse('Event ID is required for deletion', { status: 400 });
    }

    try {
      await calendar.events.delete({
        calendarId,
        eventId,
      });

      return new NextResponse(null, { status: 204 });

    } catch (calendarError) {
      const errorMessage = calendarError instanceof Error ? calendarError.message : 'Unknown error';
      console.error('Error deleting event:', errorMessage);
      return new NextResponse(`Failed to delete event: ${errorMessage}`, { status: 500 });
    }

  } catch (error) {
    console.error('General Error in DELETE API route:', error);
    return new NextResponse(`Internal Server Error: ${error}`, { status: 500 });
  }
}
