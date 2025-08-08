"use client";
import React, { useState, useEffect } from "react";
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { CalendarDays, Clock, Plus, Edit, Trash2, Video, RefreshCw } from "lucide-react";
import { EventForm } from "../EventForm/EventForm";
import { toast } from "sonner";


// Define the Event interface, now with an optional meetLink property
export interface Event {
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
  meetLink?: string; 
  scheduleMeeting?:boolean;
}

const DayPlanner = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState<boolean | undefined>(false);
  const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' });

  // Refactored event fetching into a reusable function, without useCallback
  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/calendar/today');
      setEvents(res.data.events); // The backend now sends the transformed data
      toast.success("Events refreshed successfully!");
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error("Failed to fetch events.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch events on initial component mount
  useEffect(() => {
    fetchEvents();
  }, []); // Empty dependency array ensures this runs only once

  const handleAddEvent = () => {
    setEditingEvent(null);
    setIsFormOpen(true);
  };

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setIsFormOpen(true);
  };

  // Modified to call the backend API and then refetch events
  const handleDeleteEvent = async (eventId: string) => {
    const toastId = toast.loading("Deleting event...");
    try {
      await axios.delete(`/api/calendar/today?eventId=${eventId}`);
      await fetchEvents(); // Refetch events after successful deletion
      toast.success("Event deleted successfully!", { id: toastId });
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error("Failed to delete event. Please try again.", { id: toastId });
    }
  };

  return (
    <>
      <Card className="w-full bg-gray-900 border-gray-800 shadow-2xl">
        <CardHeader className="pb-3 sm:pb-4 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-gray-800 rounded-xl border border-gray-700">
                <CalendarDays className="h-4 w-4 sm:h-5 sm:w-5 text-gray-300" />
              </div>
              <div>
                <CardTitle className="text-base sm:text-lg font-semibold text-white">
                  {currentDate}
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm text-gray-400 mt-0.5 sm:mt-1">
                  {events.length} events scheduled
                </CardDescription>
              </div>
            </div>
            <div className="flex gap-3 sm:gap-4">
              <Button 
                onClick={() => fetchEvents()}
                size="lg" 
                variant="outline"
                className="h-10 w-10 p-0 border-gray-700 text-gray-300 hover:bg-gray-800"
                disabled={loading}
              >
                <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
              </Button>
              <Button 
                onClick={handleAddEvent} 
                size="lg" 
                className="h-10 w-10 p-0 bg-white text-gray-900 hover:bg-gray-100"
              >
                <Plus className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 pt-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-8 sm:py-12 bg-blue-950 rounded-xl">
              <div className="p-4 bg-blue-900 rounded-full mb-4 border border-blue-700 shadow-lg">
              <RefreshCw className="h-8 w-8 animate-spin text-blue-300" />
              </div>
              <p className="text-blue-200 text-sm">Loading events...</p>
            </div>
             
          ) : (
            <>
              {events.map((event) => (
          <div key={event.id} className="group flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg sm:rounded-xl bg-gray-800/40 border border-gray-700/50 hover:bg-gray-800/60 hover:border-gray-600/50 transition-all duration-300" >
            <div className={`w-2.5 sm:w-3 h-2.5 sm:h-3 rounded-full ${event.indicator} flex-shrink-0 opacity-80`} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                <h4 className="text-sm sm:text-base font-medium text-white truncate">
            {event.title}
                </h4>
                <div className="flex items-center gap-0.5 sm:gap-1">
            {event.meetLink && (
              <Button
                variant="ghost"
                size="sm"
                className="h-5 w-5 sm:h-6 sm:w-6 p-0 hover:bg-blue-900/50 text-gray-400 hover:text-blue-400"
                onClick={() => window.open(event.meetLink, '_blank')}
                title="Join Google Meet"
              >
                <Video className="h-3 w-3" />
              </Button>
            )}
            <Button onClick={() => handleEditEvent(event)} variant="ghost" size="sm" className="h-5 w-5 sm:h-6 sm:w-6 p-0 hover:bg-gray-700 text-gray-400 hover:text-white" >
              <Edit className="h-3 w-3" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-red-900/50 text-gray-400 hover:text-red-400" >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-gray-900 border-gray-800">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-white">Delete Event</AlertDialogTitle>
                  <AlertDialogDescription className="text-gray-400">
              Are you sure you want to delete "{event.title}"? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white">
              Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleDeleteEvent(event.id)} className="bg-red-600 hover:bg-red-700 text-white" >
              Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
                </div>
              </div>
              <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-4 text-[10px] sm:text-xs text-gray-400">
                <div className="flex items-center gap-0.5 sm:gap-1">
            <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
            <span>{event.time}</span>
            <span className="text-gray-500">({event.duration})</span>
                </div>
              </div>
            </div>
          </div>
              ))}
              {events.length === 0 && (
          <div className="text-center py-8 sm:py-12">
            <div className="p-3 sm:p-4 bg-gray-800 rounded-xl sm:rounded-2xl w-fit mx-auto mb-3 sm:mb-4">
              <CalendarDays className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400 mx-auto" />
            </div>
            <p className="text-gray-400 text-xs sm:text-sm mb-3 sm:mb-4">No events scheduled</p>
            <Button onClick={handleAddEvent} variant="outline" size="sm" className="text-xs sm:text-sm border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white" >
              <Plus className="h-4 w-4 mr-2" /> Add Event
            </Button>
          </div>
              )}
            </>
          )}
        </CardContent>
        {events.length > 0 && (
          <div className="px-6 pb-6 pt-2">
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 text-sm h-10 border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white hover:border-gray-600" >
                View All
              </Button>
              <Button onClick={handleAddEvent} className="flex-1 text-sm h-10 bg-white text-gray-900 hover:bg-gray-100" >
                <Plus className="h-4 w-4 mr-2" /> Add Event
              </Button>
            </div>
          </div>
        )}
      </Card>
      <EventForm 
        event={editingEvent ?? undefined} 
        onSave={fetchEvents} // Pass fetchEvents as the callback
        onOpenChange={setIsFormOpen} 
        isOpen={isFormOpen} 
      />
    </>
  );
};
export default DayPlanner;
