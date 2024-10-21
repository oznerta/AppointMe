// ServicesComponents/ServiceTypes.ts

export interface TimeSlot {
    start: string; // e.g., "09:00"
    end: string;   // e.g., "10:00"
}

export interface Service {
    id: string;
    userId: string;
    serviceName: string;
    description: string;
    price: number;
    timeSlots: TimeSlot[];
    availability: string[];
    order: number;
    bookingsCount: number;
    clicksCount: number;
}

export interface ServiceWithDragListeners extends Service {
    dragListeners?: any;
}
