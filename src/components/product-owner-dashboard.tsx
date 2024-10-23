'use client'

type DataPoint = {
  week: string;
  startDate: string;
  endDate: string;
  backlogReadinessRate: number;
  taskAcceptanceRate: number;
  [key: string]: string | number;
}

type TooltipProps = {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
}

type TooltipPayloadEntry = {
  payload: DataPoint;
  name: string;
  value: number;
  color: string;
}

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { DateRange } from "react-day-picker"
import { format, subWeeks, eachWeekOfInterval, startOfWeek, endOfWeek, getWeek, getYear } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"

// Helper function to generate random data
const generateRandomData = (startDate: Date, endDate: Date): DataPoint[] => {
  const weeks = eachWeekOfInterval({ start: startDate, end: endDate })
  return weeks.map((week) => {
    const weekStart = startOfWeek(week)
    const weekEnd = endOfWeek(week)
    return {
      week: `Week ${getWeek(week)}`,
      startDate: format(weekStart, 'MMM dd, yyyy'),
      endDate: format(weekEnd, 'MMM dd, yyyy'),
      backlogReadinessRate: Math.random() * 20 + 80, // 80-100%
      taskAcceptanceRate: Math.random() * 10 + 90, // 90-100%
    }
  })
}

export function ProductOwnerDashboardComponent() {
  const [timeFrame, setTimeFrame] = useState("week")
  const [year, setYear] = useState(getYear(new Date()))
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subWeeks(new Date(), 4),
    to: new Date(),
  })
  const [data, setData] = useState<DataPoint[]>([]) // Update state type

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
  }, [timeFrame, year, dateRange])

  const CustomTooltip = ({ active, payload }: TooltipProps) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-4 border rounded shadow">
          <p className="font-bold">{`${data.week} (${data.startDate} - ${data.endDate})`}</p>
          {payload.map((entry: TooltipPayloadEntry, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value.toFixed(2)}%`}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  const renderMetricCard = (title: string, description: string, dataKey: string, benchmark: number, valueFormatter: (value: number) => string) => {
    const latestData = data[data.length - 1] || {
      week: '',
      startDate: '',
      endDate: '',
      backlogReadinessRate: 0,
      taskAcceptanceRate: 0,
      [dataKey]: 0
    } as DataPoint;
    
    const currentValue = (latestData[dataKey] as number) || 0;
    const isGood = currentValue >= benchmark

    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <XAxis 
                  dataKey={timeFrame === 'year' ? 'week' : 'startDate'} 
                  interval={timeFrame === 'year' ? 'preserveStartEnd' : 0}
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis domain={[0, 100]} />
                <CartesianGrid strokeDasharray="3 3" />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey={dataKey} stroke="hsl(var(--primary))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Current</p>
              <p className={`text-2xl font-bold ${isGood ? 'text-green-600' : 'text-red-600'}`}>
                {valueFormatter(currentValue)}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Benchmark</p>
              <p className="text-2xl font-bold text-muted-foreground">{valueFormatter(benchmark)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Product Owner Dashboard</h1>
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {renderMetricCard(
          "Backlog Readiness Rate",
          "Percentage of ready stories for sprint",
          "backlogReadinessRate",
          90,
          (value) => `${value.toFixed(1)}%`
        )}
        {renderMetricCard(
          "Task Acceptance Rate",
          "Percentage of tasks accepted by Product Manager",
          "taskAcceptanceRate",
          95,
          (value) => `${value.toFixed(1)}%`
        )}
      </div>
    </div>
  )
}