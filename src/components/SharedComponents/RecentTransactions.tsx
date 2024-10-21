"use client";

import React, { useEffect, useState } from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
  flexRender,
  VisibilityState,
} from "@tanstack/react-table";
import { getFirestore, collection, getDocs, query, where } from "firebase/firestore";
import { app } from "@/lib/firebase/config";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/AuthContext";
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react";

const db = getFirestore(app);

interface Payment {
  transactionId: string;
  paymentTime: string; // ISO string
  customerName: string;
  customerEmail: string;
  serviceName: string;
  selectedTimeSlot: string;
  selectedDate: string;
  servicePrice: number;
  status: "PENDING" | "COMPLETED";
  merchantId: string;
}

const columns: ColumnDef<Payment>[] = [
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const payment = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(payment.transactionId)}>
              Copy Transaction ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View Customer</DropdownMenuItem>
            <DropdownMenuItem>View Payment Details</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
  {
    accessorKey: "paymentTime",
    header: "Date & Time",
    cell: ({ row }) => {
      const paymentTime = new Date(row.getValue("paymentTime"));
      return <span>{paymentTime.toLocaleString()}</span>;
    },
  },
  {
    accessorKey: "customerEmail",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Customer Email
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <span>{row.getValue("customerEmail") || "N/A"}</span>,
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
    accessorKey: "servicePrice",
    header: "Amount",
    cell: ({ row }) => {
      const amount = row.getValue("servicePrice") as number;
      return <span>${amount.toFixed(2)}</span>;
    },
  },
  {
    accessorKey: "selectedTimeSlot",
    header: "Selected Time Slot",
    enableHiding: true,
  },
  {
    accessorKey: "selectedDate",
    header: "Selected Date",
    cell: ({ row }) => {
      const selectedDate = new Date(row.getValue("selectedDate"));
      return <span>{selectedDate.toLocaleDateString()}</span>;
    },
    enableHiding: true,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <span className="capitalize">{row.getValue("status")}</span>,
    enableHiding: true,
  },
];

const RecentTransactions: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const pageSize = 4;
  const { userData } = useAuth();

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    paymentTime: true,
    customerEmail: true,
    customerName: true,
    serviceName: true,
    servicePrice: true,
    actions: true,
    selectedTimeSlot: false,
    selectedDate: false,
    status: false,
  });

  useEffect(() => {
    const fetchPayments = async () => {
      if (!userData) return;

      try {
        const paymentsCollection = collection(db, "payments");
        const paymentsQuery = query(paymentsCollection, where("merchantId", "==", userData.id));
        const paymentsSnapshot = await getDocs(paymentsQuery);

        const paymentData = paymentsSnapshot.docs.map((doc) => {
          const data = doc.data() as Omit<Payment, "transactionId">;
          return {
            transactionId: doc.id,
            ...data,
          };
        });

        // Sort payment data by paymentTime in descending order
        const sortedPayments = paymentData.sort((a, b) => {
          return new Date(b.paymentTime).getTime() - new Date(a.paymentTime).getTime();
        });

        setPayments(sortedPayments);
      } catch (error) {
        console.error("Error fetching payments:", error);
      }
    };

    fetchPayments();
  }, [userData]);

  const table = useReactTable<Payment>({
    data: payments,
    columns,
    state: {
      columnFilters,
      columnVisibility,
    },
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const paginatedRows = table.getRowModel().rows.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize);

  return (
    <div className="rounded-md">
      <div className="flex items-center mb-4">
        <Input
          placeholder="Filter by email..."
          value={(table.getColumn("customerEmail")?.getFilterValue() as string) || ""}
          onChange={(event) => table.getColumn("customerEmail")?.setFilterValue(event.target.value)}
          className="max-w-xs mr-2"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              Columns <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table.getAllColumns().filter(column => column.getCanHide()).map(column => (
              <DropdownMenuCheckboxItem
                key={column.id}
                className="capitalize"
                checked={column.getIsVisible()}
                onCheckedChange={(value) => {
                  column.toggleVisibility(!!value);
                  setColumnVisibility(prev => ({ ...prev, [column.id]: !!value }));
                }}
              >
                {column.id}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
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
          {paginatedRows.length > 0 ? (
            paginatedRows.map(row => (
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
              <TableCell colSpan={columns.length} className="h-24 text-center">No results.</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <div className="flex justify-between items-center py-4">
        <div>
          Page {pageIndex + 1} of {Math.ceil(table.getRowModel().rows.length / pageSize)}
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setPageIndex((prev) => Math.max(prev - 1, 0))}
            disabled={pageIndex === 0}
            className="bg-none"
          >
            Previous
          </Button>
          <Button
            onClick={() => setPageIndex((prev) => Math.min(prev + 1, Math.ceil(table.getRowModel().rows.length / pageSize) - 1))}
            disabled={pageIndex >= Math.ceil(table.getRowModel().rows.length / pageSize) - 1}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RecentTransactions;
