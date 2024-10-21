"use client";

import { useEffect, useState } from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { getFirestore, collection, getDocs, query, where } from "firebase/firestore";
import { app } from "@/lib/firebase/config";
import { useAuth } from "@/context/AuthContext";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";

interface ChartData {
    month: string;
    sales: number;
    bookings: number;
}

export const SalesOverviewChart = () => {
    const [chartData, setChartData] = useState<ChartData[]>([]);
    const db = getFirestore(app);
    const { user } = useAuth();

    useEffect(() => {
        const fetchSalesData = async () => {
            if (!user) {
                return;
            }

            try {
                const paymentsCollection = collection(db, "payments");
                const paymentsQuery = query(
                    paymentsCollection,
                    where("merchantId", "==", user.uid)
                );
                const paymentsSnapshot = await getDocs(paymentsQuery);

                const monthlyData: { [key: string]: { sales: number; bookings: number } } = {};

                paymentsSnapshot.forEach(doc => {
                    const data = doc.data();
                    const paymentDate = new Date(data.paymentTime);
                    const month = paymentDate.toLocaleString("default", { month: "long" });
                    const year = paymentDate.getFullYear();
                    const monthYear = `${month} ${year}`;

                    if (!monthlyData[monthYear]) {
                        monthlyData[monthYear] = { sales: 0, bookings: 0 };
                    }
                    monthlyData[monthYear].sales += data.servicePrice;
                    monthlyData[monthYear].bookings += 1; // Count each payment as a booking
                });

                const formattedData: ChartData[] = Object.entries(monthlyData).map(([monthYear, { sales, bookings }]) => ({
                    month: monthYear,
                    sales,
                    bookings,
                })).sort((a, b) => {
                    const dateA = new Date(a.month);
                    const dateB = new Date(b.month);
                    return dateA.getTime() - dateB.getTime();
                });

                console.log("Formatted Sales Data:", formattedData);
                setChartData(formattedData);
            } catch (error) {
                console.error("Error fetching payment data:", error);
            }
        };

        fetchSalesData();
    }, [db, user]);

    const chartConfig = {
        sales: {
            label: "Sales",
            color: "hsl(var(--chart-1))",
        },
        bookings: {
            label: "Bookings",
            color: "hsl(var(--chart-2))",
        },
    } satisfies ChartConfig;

    return (
        <Card className="bg-primary-100 rounded-xl">
            <CardHeader>
                <CardTitle>Sales Overview</CardTitle>
                <CardDescription>Monthly Sales Data</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="max-h-[250px]a rounded w-full">
                    <AreaChart
                        data={chartData}
                        margin={{
                            left: 15,
                            right: 12,
                        }}
                    >
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="month"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tickFormatter={(value) => value.slice(0, 3)} // Format the month label
                        />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent />}
                        />
                        <Area
                            dataKey="bookings"
                            type="natural"
                            fill="#34d3c1" // Use CSS variable for bookings
                            fillOpacity={0.4}
                            stroke="#34d399" // Use CSS variable for bookings stroke
                            stackId="a" // Use the same stackId for both
                        />
                        <Area
                            dataKey="sales"
                            type="natural"
                            fill="#7fd0e6" // Use CSS variable for sales
                            fillOpacity={0.4}
                            stroke="#2ab0d5" // Use CSS variable for sales stroke
                            stackId="a" // Same stackId to stack on top
                        />
                    </AreaChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
};
