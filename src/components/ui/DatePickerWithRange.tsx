"use client";

import * as React from "react";
import { addDays, format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Define your own props interface
interface DatePickerWithRangeProps {
  className?: string; // Optional className prop
  onChange: (range: DateRange | undefined) => void; // onChange prop
}

export function DatePickerWithRange({
  className,
  onChange,
}: DatePickerWithRangeProps) {
  const today = new Date();
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: today, // Set 'from' to today's date
    to: addDays(today, 7), // Set 'to' to 7 days from today
  });

  const handleSelect = (range: DateRange | undefined) => {
    setDate(range);
    onChange(range); // Notify parent component of the change
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[300px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} -{" "}
                  {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleSelect} // Use handleSelect to manage date selection
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
