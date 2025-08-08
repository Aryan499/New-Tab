"use client";
import React, { useState, useEffect } from "react";
import axios from 'axios';

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Calendar } from "@/components/ui/calendar";
import { Switch } from "@/components/ui/switch";
import { CalendarIcon } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
// Use the main Event interface from the DayPlanner component
import { Event } from "../DayPlanner/DayPlanner";

// Event Form Component
interface EventFormProps {
  event?: Event; 
  onSave: () => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EventForm: React.FC<EventFormProps> = ({ 
  event, 
  onSave, 
  isOpen, 
  onOpenChange 
}) => {
  const [formData, setFormData] = useState({
    title: event?.title || '',
    date: event?.date || new Date(),
    hour: event?.hour || '09',
    minute: event?.minute || '00',
    ampm: event?.ampm || 'AM' as 'AM' | 'PM',
    duration: event?.duration || '1 hour',
    priority: event?.priority || 'medium' as 'high' | 'medium' | 'low',
    description: event?.description || '',
    scheduleMeeting: event?.scheduleMeeting || false
  });

  // Re-sync form data when the event prop changes (e.g., when editing a different event)
  useEffect(() => {
    setFormData({
      title: event?.title || '',
      date: event?.date || new Date(),
      hour: event?.hour || '09',
      minute: event?.minute || '00',
      ampm: event?.ampm || 'AM',
      duration: event?.duration || '1 hour',
      priority: event?.priority || 'medium',
      description: event?.description || '',
      scheduleMeeting: event?.scheduleMeeting || false
    });
  }, [event]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const toastId = toast.loading(event ? "Updating event..." : "Creating event...");
    
    try {
      const startDateTime = new Date(formData.date);
      const hour24 = formData.ampm === 'PM' ? (parseInt(formData.hour) % 12) + 12 : parseInt(formData.hour) % 12;
      startDateTime.setHours(hour24, parseInt(formData.minute), 0, 0);

      const endDateTime = new Date(startDateTime);
      const durationMap = {
        '15 min': 15, '30 min': 30, '45 min': 45, '1 hour': 60,
        '1.5 hours': 90, '2 hours': 120, '3 hours': 180
      };
      const durationMinutes = durationMap[formData.duration as keyof typeof durationMap];
      if (durationMinutes) {
        endDateTime.setMinutes(startDateTime.getMinutes() + durationMinutes);
      } else {
        endDateTime.setMinutes(startDateTime.getMinutes() + 60);
      }

      const requestBody = {
        summary: formData.title,
        description: formData.description,
        start: { dateTime: startDateTime.toISOString() },
        end: { dateTime: endDateTime.toISOString() },
        createMeetLink: formData.scheduleMeeting,
      };

      if (event?.id) {
        await axios.put(`/api/calendar/today?eventId=${event.id}`, requestBody);
        toast.success("Event updated successfully!", { id: toastId });
      } else {
        await axios.post('/api/calendar/today', requestBody);
        toast.success("Event created successfully!", { id: toastId });
      }

      // Call the onSave callback to trigger a refresh of the parent component
      onSave();
      onOpenChange(false);
      
    } catch (error) {
      console.error('API call failed:', error);
      toast.error("An error occurred. Please try again.", { id: toastId });
    }
  };

  const handleInputChange = <K extends keyof typeof formData>(
    field: K, 
    value: typeof formData[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const hours = Array.from({ length: 12 }, (_, i) => 
    (i + 1).toString().padStart(2, '0')
  );

  const formatDate = (date: Date | undefined): string => {
    return date ? date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }) : 'Pick a date';
  };

  const durationOptions = [
    { value: "15 min", label: "15 minutes" },
    { value: "30 min", label: "30 minutes" },
    { value: "45 min", label: "45 minutes" },
    { value: "1 hour", label: "1 hour" },
    { value: "1.5 hours", label: "1.5 hours" },
    { value: "2 hours", label: "2 hours" },
    { value: "3 hours", label: "3 hours" },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white">
            {event ? 'Edit Event' : 'Add New Event'}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            {event ? 'Update your event details' : 'Create a new calendar event'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-gray-300">Event Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Enter event title"
              className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-blue-500"
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="text-gray-300">Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full text-left font-normal bg-gray-800 border-gray-700 text-white hover:bg-gray-700 hover:text-white"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  <div className="flex justify-center m-auto text-center">{formatDate(formData.date)}</div>
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-full p-0 bg-gray-800 border-gray-700 flex justify-center items-center"
                align="center"
                sideOffset={8}
              >
                <div className="flex justify-center items-center w-full">
                  <Calendar
                    mode="single"
                    selected={formData.date}
                    onSelect={(date) => date && handleInputChange('date', date)}
                    className="bg-gray-800 text-white"
                  />
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 space-y-2">
              <Label className="text-gray-300">Time</Label>
              <div className="flex items-end gap-3">
                <div className="flex flex-col space-y-1">
                  <Label htmlFor="hour" className="text-xs text-gray-400">Hour</Label>
                  <Select value={formData.hour} onValueChange={(value) => handleInputChange('hour', value)}>
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white focus:border-blue-500 h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      {hours.map((hour) => (
                        <SelectItem key={hour} value={hour} className="text-white hover:bg-gray-700">
                          {hour}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center justify-center h-9 text-gray-400">
                  :
                </div>
                
                <div className="flex space-y-1 flex-col">
                  <Label className="text-xs text-gray-400">Minutes</Label>
                  <InputOTP
                    maxLength={2}
                    value={formData.minute}
                    onChange={(value) => {
                      const paddedValue = value.length === 1 ? value.padEnd(2, '0') : value;
                      handleInputChange('minute', paddedValue);
                    }}
                    pattern="^[0-5][0-9]$"
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                
                <div className="flex flex-col mt-1">
                  <Label htmlFor="ampm" className="text-xs text-gray-400">AM/PM</Label>
                  <Select value={formData.ampm} onValueChange={(value: 'AM' | 'PM') => handleInputChange('ampm', value)}>
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white focus:border-blue-500 h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="AM" className="text-white hover:bg-gray-700">AM</SelectItem>
                      <SelectItem value="PM" className="text-white hover:bg-gray-700">PM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="col-span-1 mt-8">
              <Label htmlFor="priority" className="text-gray-300">Priority</Label>
              <Select value={formData.priority} onValueChange={(value: 'high' | 'medium' | 'low') => handleInputChange('priority', value)}>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white focus:border-blue-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="high" className="text-white hover:bg-gray-700">High</SelectItem>
                  <SelectItem value="medium" className="text-white hover:bg-gray-700">Medium</SelectItem>
                  <SelectItem value="low" className="text-white hover:bg-gray-700">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg border border-gray-700">
            <div className="flex items-center space-x-3">
              <Image 
              src="/meet.png"
              alt="Meet Icon" 
              width={24}
              height={24}
              className="h-6 w-8"
              />
              <div>
              <Label htmlFor="schedule-meeting" className="text-gray-300 font-medium">
                Schedule Meeting
              </Label>
              <p className="text-xs text-gray-400">Create a virtual meeting link</p>
              </div>
            </div>
            <Switch
              id="schedule-meeting"
              checked={formData.scheduleMeeting}
              onCheckedChange={(checked) => handleInputChange('scheduleMeeting', checked)}
              className="data-[state=checked]:bg-blue-600"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration" className="text-gray-300">Meeting Duration</Label>
            <Select value={formData.duration} onValueChange={(value) => handleInputChange('duration', value)}>
              <SelectTrigger className="w-full bg-gray-800 border-gray-700 text-white focus:border-blue-500">
                <SelectValue placeholder="Select meeting duration" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                {durationOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value} className="text-white hover:bg-gray-700">
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-gray-300">Description (Optional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Add event description..."
              className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-blue-500 resize-none"
              rows={3}
            />
          </div>

          <DialogFooter className="gap-5">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white cursor-pointer"
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              className="bg-white text-gray-900 hover:bg-gray-100 cursor-pointer"
            >
              {event ? 'Update Event' : 'Add Event'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
