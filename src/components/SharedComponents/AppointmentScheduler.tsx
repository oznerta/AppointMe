"use client";

import React, { useState } from 'react';
import { addDays, format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from '../ui/input';
import { IoIosArrowBack } from "react-icons/io"; // Import back arrow icon

interface TimeSlot {
    start: string; // e.g., "09:00"
    end: string;   // e.g., "10:00"
}

interface Service {
    serviceName: string;
    description: string;
    price: number;
    availability: string[];
    timeSlots: TimeSlot[];
}

interface AppointmentSchedulerProps {
    service: Service;
    onClose: () => void;
    onNext: (customerName: string, customerEmail: string, selectedDate: Date | null, selectedTimeSlot: string) => void;
}

const AppointmentScheduler: React.FC<AppointmentSchedulerProps> = ({ service, onClose, onNext }) => {
    const [customerName, setCustomerName] = useState<string>('');
    const [customerEmail, setCustomerEmail] = useState<string>('');
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');

    const timeSlots = service.timeSlots.map((slot: TimeSlot, index: number) => (
        <SelectItem key={index} value={`${slot.start} - ${slot.end}`}>
            {`${slot.start} - ${slot.end}`}
        </SelectItem>
    ));

    const handleNext = () => {
        if (selectedDate) {
            onNext(customerName, customerEmail, selectedDate, selectedTimeSlot); // Pass details to parent
        }
    };

    return (
        <div className="flex flex-col gap-4 w-[500px] ">
            {/* Back Button */}
            <div className="flex items-start justify-start mt-6">
                <button onClick={onClose} className="flex items-center justify-center text-gray-700 hover:text-gray-500">
                    <IoIosArrowBack className="text-xl" /> Back
                </button>
            </div>

            <div className='flex flex-col gap-4 bg-primary-50 px-10 py-6 rounded-xl'>
                {/* Customer Name */}
            <Input
                type="text"
                placeholder="Your Name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="border p-2 rounded mt-1"
                required
            />

            {/* Customer Email */}
            <Input
                type="email"
                placeholder="Your Email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="border p-2 rounded"
                required
            />

            {/* Date Picker with Presets */}
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant={"outline"}
                        className={`justify-start text-left font-normal ${!selectedDate && "text-muted-foreground"}`}
                    >
                        <CalendarIcon />
                        {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="flex w-auto flex-col space-y-2 p-2">
                    <Select
                        onValueChange={(value) =>
                            setSelectedDate(addDays(new Date(), parseInt(value)))
                        }
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent position="popper">
                            <SelectItem value="0">Today</SelectItem>
                            <SelectItem value="1">Tomorrow</SelectItem>
                            <SelectItem value="3">In 3 days</SelectItem>
                            <SelectItem value="7">In a week</SelectItem>
                        </SelectContent>
                    </Select>
                    <div className="rounded-md border">
                        <Calendar mode="single" selected={selectedDate ?? undefined} onSelect={(date) => setSelectedDate(date ? new Date(date) : null)} />
                    </div>
                </PopoverContent>
            </Popover>

            {/* Time Slot Selector */}
            <Select onValueChange={setSelectedTimeSlot}>
                <SelectTrigger>
                    <SelectValue placeholder="Select a time slot" />
                </SelectTrigger>
                <SelectContent>
                    {timeSlots}
                </SelectContent>
            </Select>
            </div>

            <Button onClick={handleNext}>Next</Button>
        </div>
    );
};

export default AppointmentScheduler;
