
"use client"

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ChartTooltipContent, ChartContainer } from "@/components/ui/chart" // Assuming ChartContainer is needed for styles

export interface ChartDataItem {
  name: string;
  value: number;
  fill?: string;
}

interface DashboardChartsProps {
  deviceData: ChartDataItem[];
  issueData: ChartDataItem[];
}

export function DashboardCharts({ deviceData, issueData }: DashboardChartsProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Device Overview</CardTitle>
          <CardDescription>Current status of connected devices.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{}} className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deviceData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  cursor={{ fill: "hsla(var(--foreground), 0.1)" }}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Legend wrapperStyle={{ color: 'hsl(var(--foreground))' }}/>
                <Bar dataKey="value" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Issue Statistics</CardTitle>
          <CardDescription>Overview of reported and resolved issues.</CardDescription>
        </CardHeader>
        <CardContent>
           <ChartContainer config={{}} className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={issueData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--foreground))" fontSize={12} tickLine={false} axisLine={false}/>
                <YAxis stroke="hsl(var(--foreground))" fontSize={12} tickLine={false} axisLine={false}/>
                 <Tooltip
                  cursor={{ fill: "hsla(var(--foreground), 0.1)" }}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Legend wrapperStyle={{ color: 'hsl(var(--foreground))' }}/>
                <Bar dataKey="value" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
