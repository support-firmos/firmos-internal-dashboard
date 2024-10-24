'use client'

import { TooltipProps } from 'recharts'

import { useState, useEffect } from 'react'
import { format, subWeeks, eachWeekOfInterval, startOfWeek, endOfWeek, getWeek } from 'date-fns'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { DateRange } from "react-day-picker"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"

type Metric = {
  name: string
  formula: string
  benchmark: number
  unit: string
}

type DataPoint = {
  week: string
  dateRange: string
  startDate: string
  developer: string
  [key: string]: string | number
}

type Developer = {
  id: string
  name: string
}

type CustomTooltipProps = {
  active?: boolean;
  payload?: {
    color: string;
    name: string;
    value: number;
    payload: DataPoint;
  }[];
} & Omit<TooltipProps<number, string>, 'payload'>

const metrics: Metric[] = [
  { name: 'Task Completion Rate', formula: '(Tasks Completed / Total Assigned Tasks) × 100', benchmark: 90, unit: '%' },
  { name: 'Deployment Frequency', formula: 'Number of deployments per month', benchmark: 20, unit: '' },
  { name: 'Mean Time to Recovery (MTTR)', formula: 'Average time to resolve incidents/bugs', benchmark: 1, unit: 'hours' },
  { name: 'System/Automation Uptime', formula: '(Total Uptime / Total Time) × 100', benchmark: 99.9, unit: '%' },
  { name: 'Feature Delivery Timeliness', formula: '(Features Delivered On Time / Total Features) × 100', benchmark: 95, unit: '%' },
]

const developers: Developer[] = [
  { id: 'all', name: 'All Developers' },
  { id: 'dev1', name: 'Alice Johnson' },
  { id: 'dev2', name: 'Bob Smith' },
  { id: 'dev3', name: 'Charlie Brown' },
  { id: 'dev4', name: 'Diana Martinez' },
]

const generateRandomData = (startDate: Date, endDate: Date): DataPoint[] => {
  const weeks = eachWeekOfInterval({ start: startDate, end: endDate })
  return weeks.flatMap((week) => {
    const weekStart = startOfWeek(week)
    const weekEnd = endOfWeek(week)
    return developers.filter(dev => dev.id !== 'all').map(developer => {
      const weekData: DataPoint = {
        week: `Week ${getWeek(week)}`,
        dateRange: `${format(weekStart, 'MMM dd')}-${format(weekEnd, 'MMM dd')}`,
        startDate: format(weekStart, 'MMM dd'),
        developer: developer.name,
      }
      metrics.forEach(metric => {
        if (metric.name === 'Deployment Frequency') {
          weekData[metric.name] = Math.floor(Math.random() * 10) + 1
        } else if (metric.name === 'Mean Time to Recovery (MTTR)') {
          weekData[metric.name] = Number((Math.random() * 2).toFixed(2))
        } else {
          weekData[metric.name] = Number((Math.random() * (100 - metric.benchmark) + metric.benchmark).toFixed(2))
        }
      })
      return weekData
    })
  })
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-white p-4 border rounded shadow">
        <p className="font-bold">{`${data.week} (${data.dateRange})`}</p>
        <p className="font-medium">{`Developer: ${data.developer}`}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }}>
            {`${entry.name}: ${entry.value}${metrics.find(m => m.name === entry.name)?.unit}`}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export function DeveloperDashboardComponent() {
  const [timeFrame, setTimeFrame] = useState("week")
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subWeeks(new Date(), 4),
    to: new Date(),
  })
  const [selectedDeveloper, setSelectedDeveloper] = useState("all")
  const [data, setData] = useState<DataPoint[]>([])

  useEffect(() => {
    let startDate: Date, endDate: Date

    if (timeFrame === "week") {
      startDate = subWeeks(new Date(), 4)
      endDate = new Date()
    } else if (timeFrame === "ytd") {
      startDate = new Date(new Date().getFullYear(), 0, 1)
      endDate = new Date()
    } else if (timeFrame === "custom" && dateRange?.from && dateRange?.to) {
      startDate = dateRange.from
      endDate = dateRange.to
    } else {
      return // Don't update if we don't have valid dates
    }

    const allData = generateRandomData(startDate, endDate)
    setData(allData)
  }, [timeFrame, dateRange])

  const filteredData = data.filter(d => selectedDeveloper === 'all' || d.developer === developers.find(dev => dev.id === selectedDeveloper)?.name)

  const aggregateData = (data: DataPoint[]): DataPoint[] => {
    if (selectedDeveloper !== 'all') return data

    const aggregated = data.reduce((acc, curr) => {
      const existingWeek = acc.find(d => d.week === curr.week)
      if (existingWeek) {
        metrics.forEach(metric => {
          const currentValue = Number(curr[metric.name])
          const existingValue = Number(existingWeek[metric.name])
          existingWeek[metric.name] = (existingValue + currentValue) / 2
        })
      } else {
        acc.push({...curr, developer: 'All Developers'})
      }
      return acc
    }, [] as DataPoint[])

    return aggregated
}

  const renderMetricCard = (metric: Metric) => {
    const aggregatedData = aggregateData(filteredData)
    const latestData = aggregatedData[aggregatedData.length - 1] || {} as DataPoint
    const currentValue = latestData[metric.name] as number || 0
    const isGood = metric.name === 'Mean Time to Recovery (MTTR)'
      ? currentValue <= metric.benchmark
      : currentValue >= metric.benchmark

    const valueFormatter = (value: number) => {
      if (metric.name === 'Deployment Frequency') {
        return Math.round(value).toString()
      }
      return metric.unit === '%' ? value.toFixed(2) + '%' : value.toFixed(2)
    }

    return (
      <Card key={metric.name}>
        <CardHeader>
          <CardTitle>{metric.name}</CardTitle>
          <CardDescription>{metric.formula}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={aggregatedData}>
                <XAxis 
                  dataKey="startDate"
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis domain={metric.unit === '%' ? [0, 100] : ['auto', 'auto']} />
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
                {valueFormatter(currentValue)}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Benchmark</p>
              <p className="text-2xl font-bold text-muted-foreground">
                {valueFormatter(metric.benchmark)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h1 className="text-3xl font-bold">Developer Dashboard</h1>
        <div className="flex items-center space-x-4 flex-wrap gap-4">
          <Select value={selectedDeveloper} onValueChange={setSelectedDeveloper}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select developer" />
            </SelectTrigger>
            <SelectContent>
              {developers.map((dev) => (
                <SelectItem key={dev.id} value={dev.id}>
                  {dev.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={timeFrame} onValueChange={setTimeFrame}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time frame" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Weekly (Last 5 Weeks)</SelectItem>
              <SelectItem value="ytd">Year to Date</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
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