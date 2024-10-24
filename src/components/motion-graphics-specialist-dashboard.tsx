'use client'

import { useState, useEffect, useCallback } from 'react'
import { format, subWeeks, eachWeekOfInterval, startOfWeek, endOfWeek, getWeek } from 'date-fns'
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { DateRange } from "react-day-picker"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"

type Metric = {
  name: string;
  formula: string;
  benchmark: number;
  unit: string;
}

type DataPoint = {
  week: string;
  weekNumber: number;
  dateRange: string;
  startDate: string;
  [key: string]: string | number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    color: string;
    name: string;
    value: number;
    payload: DataPoint;
  }>;
}

const metrics: Metric[] = [
  { name: 'Discovery Calls Booked', formula: 'Total calls booked via LinkedIn/YouTube', benchmark: 10, unit: '' },
  { name: 'LinkedIn Video Engagement Rate', formula: '(Post Engagements / Total Impressions) × 100', benchmark: 5, unit: '%' },
  { name: 'YouTube CTA Click-Through Rate', formula: '(Clicks on CTA Links / Total Views) × 100', benchmark: 3, unit: '%' },
  { name: 'YouTube Watch Time per Viewer', formula: 'Total Minutes Watched / Total Video Views', benchmark: 2, unit: ' minutes' },
  { name: 'LinkedIn Profile CTR', formula: '(Profile Visits from Videos / Total Impressions) × 100', benchmark: 3, unit: '%' },
]

export function Dashboard() {
  const [timeFrame, setTimeFrame] = useState("week")
  const [year, setYear] = useState(new Date().getFullYear())
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subWeeks(new Date(), 4),
    to: new Date(),
  })
  const [data, setData] = useState<DataPoint[]>([])

  const generateRandomData = useCallback((startDate: Date, endDate: Date): DataPoint[] => {
    const weeks = eachWeekOfInterval({ start: startDate, end: endDate })
    return weeks.map((week) => {
      const weekStart = startOfWeek(week)
      const weekEnd = endOfWeek(week)
      const weekNumber = getWeek(week)
      const weekData: DataPoint = {
        week: `Week ${weekNumber}`,
        weekNumber: weekNumber,
        dateRange: `${format(weekStart, 'MMM dd')}-${format(weekEnd, 'MMM dd')}`,
        startDate: timeFrame === "year" ? format(weekStart, 'MMM yyyy') : format(weekStart, 'MMM dd'),
      }
      metrics.forEach(metric => {
        let value: number
        if (metric.unit === '%') {
          value = Math.random() * (metric.benchmark * 1.5 - metric.benchmark * 0.5) + metric.benchmark * 0.5
        } else if (metric.name === 'Discovery Calls Booked') {
          value = Math.floor(Math.random() * 20) + 5
        } else {
          value = Math.random() * (metric.benchmark * 1.5 - metric.benchmark * 0.5) + metric.benchmark * 0.5
        }
        weekData[metric.name] = Number(value.toFixed(2))
      })
      return weekData
    })
  }, [timeFrame])

  useEffect(() => {
    let startDate: Date, endDate: Date

    if (timeFrame === "week") {
      startDate = subWeeks(new Date(), 4)
      endDate = new Date()
    } else if (timeFrame === "year") {
      startDate = new Date(year, 0, 1)
      endDate = new Date(year, 11, 31)
    } else if (timeFrame === "custom" && dateRange?.from && dateRange?.to) {
      startDate = dateRange.from
      endDate = dateRange.to
    } else {
      return // Don't update if we don't have valid dates
    }

    setData(generateRandomData(startDate, endDate))
  }, [timeFrame, year, dateRange, generateRandomData])

  const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload
      return (
        <div className="bg-white p-4 border rounded shadow">
          <p className="font-bold">
            {timeFrame === "year" 
              ? `${format(new Date(dataPoint.startDate), 'MMMM dd, yyyy')}`
              : `Week ${dataPoint.weekNumber} (${dataPoint.dateRange})`
            }
          </p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value.toFixed(2)}${metrics.find(m => m.name === entry.name)?.unit}`}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  const renderMetricCard = (metric: Metric) => {
    const latestData = data[data.length - 1] || {} as DataPoint
    const currentValue = latestData[metric.name] as number || 0
    const isGood = currentValue >= metric.benchmark
    const isPercentage = metric.unit === '%'

    return (
      <Card key={metric.name}>
        <CardHeader>
          <CardTitle>{metric.name}</CardTitle>
          <CardDescription>{metric.formula}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <XAxis 
                  dataKey="startDate"
                  interval={timeFrame === "year" ? 3 : 0}
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                  tickFormatter={(value) => {
                    if (timeFrame === "year") {
                      const date = new Date(value);
                      return format(date, 'MMM');
                    }
                    return value;
                  }}
                />
                <YAxis domain={isPercentage ? [0, 'auto'] : ['auto', 'auto']} />
                <CartesianGrid strokeDasharray="3 3" />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey={metric.name} stroke="hsl(var(--primary))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Current</p>
              <p className={`text-2xl font-bold ${isGood ? 'text-green-600' : 'text-red-600'}`}>
                {currentValue.toFixed(2)}{metric.unit}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Benchmark</p>
              <p className="text-2xl font-bold text-muted-foreground">{metric.benchmark}{metric.unit}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Motion Graphics Specialist Dashboard</h1>
        <div className="flex items-center space-x-4">
          <Select value={timeFrame} onValueChange={setTimeFrame}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time frame" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Weekly (Last 5 Weeks)</SelectItem>
              <SelectItem value="year">Yearly</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
          {timeFrame === "year" && (
            <Select value={year.toString()} onValueChange={(value) => setYear(parseInt(value))}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                {[2022, 2023, 2024].map((y) => (
                  <SelectItem key={y} value={y.toString()}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {timeFrame === "custom" && (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-[280px] justify-start text-left font-normal",
                    !dateRange && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "LLL dd, y")} -{" "}
                        {format(dateRange.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map(renderMetricCard)}
      </div>
    </div>
  )
}
