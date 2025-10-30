
import { NextResponse } from 'next/server'
import { google } from 'googleapis';
// import { getCalendarClient } from '../today/route';
import { auth, clerkClient } from '@clerk/nextjs/server'
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
// GET handler to list recent attendees
export async function GET() {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const calendar = await getCalendarClient(userId);

        // Get events from the last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        try {
            const eventsResponse = await calendar.events.list({
                calendarId: 'primary',
                timeMin: thirtyDaysAgo.toISOString(),
                maxResults: 100,
                singleEvents: true,
                orderBy: 'startTime',
            });

            const events = eventsResponse.data.items || [];

            // Extract and deduplicate attendees
            const attendeesMap = new Map<string, number>();

            events.forEach(event => {
                if (event.attendees) {
                    event.attendees.forEach(attendee => {
                        if (attendee.email) {
                            attendeesMap.set(
                                attendee.email,
                                (attendeesMap.get(attendee.email) || 0) + 1
                            );
                        }
                    });
                }
            });

            // Convert to array and sort by frequency
            const attendees = Array.from(attendeesMap.entries())
                .map(([email, frequency]) => {
                    const attendeeData = events.find(event =>
                        event.attendees?.find(a => a.email === email)
                    )?.attendees?.find(a => a.email === email);

                    return {
                        email,
                        frequency,
                        name: attendeeData?.displayName || email.split('@')[0],
                        responseStatus: attendeeData?.responseStatus,
                        photoUrl: attendeeData?.self ? '/organizer-avatar.png' : undefined
                    };
                })
                .sort((a, b) => b.frequency - a.frequency);

            return NextResponse.json({ attendees });

        } catch (calendarError) {
            console.error('Error fetching recent attendees:', calendarError);
            return NextResponse.json({
                error: `Failed to fetch recent attendees: ${calendarError}`
            }, { status: 500 });
        }

    } catch (error) {
        console.error('General Error in GET API route:', error);
        return NextResponse.json({
            error: `Internal Server Error: ${error}`
        }, { status: 500 });
    }
}