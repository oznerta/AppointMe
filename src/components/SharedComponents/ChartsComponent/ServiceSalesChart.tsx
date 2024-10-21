"use client";

import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from "recharts";
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
  ChartContainer,
  ChartTooltipContent,
  ChartConfig,
  ChartTooltip,
} from "@/components/ui/chart";

interface ChartData {
  serviceName: string;
  sales: number;
  bookings: number; // Add bookings field
}

export const ServiceSalesChart = () => {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const db = getFirestore(app);
  const { user } = useAuth();

  useEffect(() => {
    const fetchServiceSalesData = async () => {
      if (!user) {
        console.log("No user is logged in.");
        return;
      }

      try {
        // Fetch services
        const servicesCollection = collection(db, "services");
        const servicesQuery = query(servicesCollection, where("userId", "==", user.uid));
        const servicesSnapshot = await getDocs(servicesQuery);

        const serviceSales: { [key: string]: { sales: number; bookings: number } } = {};
        
        servicesSnapshot.forEach(doc => {
          const data = doc.data();
          const serviceName = data.serviceName;
          serviceSales[serviceName] = { sales: 0, bookings: 0 };
        });

        const paymentsCollection = collection(db, "payments");
        const paymentsSnapshot = await getDocs(paymentsCollection);

        paymentsSnapshot.forEach(doc => {
          const paymentData = doc.data();
          const serviceName = paymentData.serviceName;
          const amount = paymentData.servicePrice;
          const bookingCount = paymentData.bookingCount || 1;

          if (serviceSales[serviceName]) {
            serviceSales[serviceName].sales += amount;
            serviceSales[serviceName].bookings += bookingCount;
          }
        });

        const truncateString = (str: string, num: number) => {
          return str.length <= num ? str : str.slice(0, num) + "...";
        };

        const formattedData: ChartData[] = Object.entries(serviceSales).map(([serviceName, { sales, bookings }]) => ({
          serviceName: truncateString(serviceName, 15), // Adjust the limit as needed
          sales,
          bookings,
        }));

        console.log("Formatted Data:", formattedData);
        setChartData(formattedData);
      } catch (error) {
        console.error("Error fetching service sales data:", error);
      } 
    };

    fetchServiceSalesData();
  }, [db, user]);

  // Chart configuration
  const chartConfig = {
    label: {
      color: "black",
    },
  } satisfies ChartConfig;

  return (
    <Card className="bg-primary-100 rounded-xl">
      <CardHeader>
        <CardTitle>Service Sales Overview</CardTitle>
        <CardDescription>Overall Sales and Bookings Comparison for Services</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer className="max-h-[250px] w-full" config={chartConfig}>
          <BarChart data={chartData} layout="vertical" margin={{ right: 50 }}>
            <CartesianGrid horizontal={false} />
            <YAxis dataKey="serviceName" type="category" tickLine={false} tickMargin={10} axisLine={false} hide />
            <XAxis dataKey="sales" type="number" hide />
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <Bar dataKey="sales" type="natural" fill="#7fd0e6" fillOpacity={0.4} stroke="#2ab0d5" radius={4} barSize={30}>
              <LabelList
                dataKey="serviceName"
                position="insideLeft"
                offset={8}
                className="fill-[--color-label]"
                fontSize={12}
              />
              <LabelList
                dataKey="sales"
                position="right"
                offset={8}
                className="fill-foreground"
                fontSize={12}
              />
            </Bar>
            <Bar dataKey="bookings" fill="#34d399" radius={2} barSize={2} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

