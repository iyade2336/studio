
"use client"
import { TrendingUp } from "lucide-react"
import {
  Line,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

export interface ChartDataPoint {
    time: string;
    temperature?: number;
}

interface TemperatureChartProps {
    data: ChartDataPoint[];
}

const chartConfig = {
  temperature: {
    label: "Temp",
    color: "hsl(var(--chart-2))",
  },
} satisfies import("@/components/ui/chart").ChartConfig


export function TemperatureChart({ data }: TemperatureChartProps) {
  if (!data || data.length === 0) {
    return <p className="text-sm text-center text-muted-foreground py-4">No temperature data to display.</p>
  }
  
  return (
    <ChartContainer config={chartConfig} className="h-[100px] w-full">
      <LineChart
        accessibilityLayer
        data={data}
        margin={{
          left: -20,
          right: 10,
          top: 5,
          bottom: 5,
        }}
      >
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis
          dataKey="time"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(value) => value}
          fontSize={10}
        />
        <YAxis
            domain={['dataMin - 2', 'dataMax + 2']}
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            fontSize={10}
            tickFormatter={(value) => `${value}°`}
        />
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              hideLabel
              indicator="line"
              nameKey="temperature"
              labelKey="time"
              formatter={(value, name, item) => (
                <>
                  <div className="font-medium">{item.payload.time}</div>
                  <div className="text-muted-foreground">
                    Temp: {value}°C
                  </div>
                </>
              )}
            />
          }
        />
        <Line
          dataKey="temperature"
          type="monotone"
          stroke="var(--color-temperature)"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ChartContainer>
  )
}
