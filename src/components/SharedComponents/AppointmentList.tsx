"use client";

import React from "react";
import {
  ColumnDef,
  getCoreRowModel,
  useReactTable,
  flexRender,
} from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Appointment {
  transactionId: string;
  selectedDate: string; // ISO string
  customerName: string;
  serviceName: string;
  selectedTimeSlot: string;
  status: "PENDING" | "COMPLETED";
}

interface AppointmentListProps {
  appointments: Appointment[];
}

const columns: ColumnDef<Appointment>[] = [
  {
    accessorKey: "transactionId",
    header: "Transaction ID",
  },
  {
    accessorKey: "selectedDate",
    header: "Date",
    cell: ({ row }) => {
      const date = new Date(row.getValue("selectedDate"));
      return <span>{date.toLocaleDateString()}</span>;
    },
  },
  {
    accessorKey: "customerName",
    header: "Customer Name",
  },
  {
    accessorKey: "serviceName",
    header: "Service",
  },
  {
    accessorKey: "selectedTimeSlot",
    header: "Time Slot",
  },
  {
    accessorKey: "status",
    header: "Payment Status",
    cell: ({ row }) => (
      <span className="capitalize">{row.getValue("status")}</span>
    ),
  },
];

const AppointmentList: React.FC<AppointmentListProps> = ({ appointments }) => {
  const table = useReactTable<Appointment>({
    data: appointments,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="rounded-md border p-4">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map(headerGroup => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <TableHead key={header.id}>
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length > 0 ? (
            table.getRowModel().rows.map(row => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map(cell => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">No appointments found.</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default AppointmentList;
