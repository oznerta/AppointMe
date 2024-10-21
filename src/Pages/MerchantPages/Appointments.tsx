"use client";

import React, { useEffect, useState } from "react";
import AppointmentsList from "@/components/SharedComponents/AppointmentList";
import { getFirestore, collection, getDocs, query, where } from "firebase/firestore";
import { app } from "@/lib/firebase/config";
import { useAuth } from "@/context/AuthContext";
import { DateRange } from "react-day-picker";
import { DatePickerWithRange } from '@/components/ui/DatePickerWithRange';
import { addDays } from "date-fns"; // Import addDays

// Define Payment interface
interface Payment {
  transactionId: string;
  selectedDate: string; // ISO string
  customerName: string;
  serviceName: string;
  selectedTimeSlot: string;
  status: "PENDING" | "COMPLETED";
}

const db = getFirestore(app);

const AppointmentsPage: React.FC = () => {
  const today = new Date();
  const [appointments, setAppointments] = useState<Payment[]>([]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: today,
    to: addDays(today, 7),
  });
  const { userData } = useAuth();

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!userData) return;

      try {
        const paymentsCollection = collection(db, "payments");
        const paymentsQuery = query(paymentsCollection, where("merchantId", "==", userData.id));
        const paymentsSnapshot = await getDocs(paymentsQuery);

        const appointmentData = paymentsSnapshot.docs.map((doc) => {
          const data = doc.data() as Omit<Payment, "transactionId">;
          return {
            transactionId: doc.id,
            ...data,
          };
        });

        setAppointments(appointmentData);
      } catch (error) {
        console.error("Error fetching appointments:", error);
      }
    };

    fetchAppointments();
  }, [userData]);

  // Filter appointments based on selected date range and status
  const filteredAppointments = appointments.filter(appointment => {
    const appointmentDate = new Date(appointment.selectedDate).setHours(0, 0, 0, 0);
    const fromDate = dateRange?.from?.setHours(0, 0, 0, 0);
    const toDate = dateRange?.to?.setHours(0, 0, 0, 0);

    return (
      appointment.status === "PENDING" && // Filter for pending status
      appointmentDate >= (fromDate || today.setHours(0, 0, 0, 0)) && // Fallback to today
      appointmentDate <= (toDate || addDays(today, 7).setHours(0, 0, 0, 0)) // Fallback to 7 days from today
    );
  });

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold">Appointments</h2>
      <DatePickerWithRange
        className="my-4"
        onChange={setDateRange} // Pass the date range to update state
      />
      <AppointmentsList appointments={filteredAppointments} />
    </div>
  );
};

export default AppointmentsPage;
