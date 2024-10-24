'use client'

import { useState, useEffect } from 'react'
import { format, subWeeks, eachWeekOfInterval, startOfWeek, endOfWeek, getWeek } from 'date-fns'
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { DateRange } from "react-day-picker"
import { CalendarIcon, ArrowDownIcon, ArrowUpIcon, MinusIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

type Metric = {
  name: string;
  formula: string;
  benchmark: number;
  unit: string;
}

type DataPoint = {
  week: string;
  dateRange: string;
  startDate: string;
  [key: string]: string | number;
}

type CustomTooltipProps = {
  active?: boolean;
  payload?: Array<{
    value: number;
    name: string;
    payload: DataPoint;
    color: string;
  }>;
  label?: string;
  data: DataPoint[];
}

type Payload = {
  value: number;
  name: string;
  payload: DataPoint;
  color: string;
}

const metrics: Metric[] = [
  { name: 'CAC Ratio', formula: 'LTV / CAC', benchmark: 3, unit: ':1' },
  { name: 'Profit Allocation Ratio', formula: '(Profit Allocated / Total Revenue) × 100', benchmark: 10, unit: '%' },
  { name: 'Revenue Growth Rate', formula: '(Current Year Revenue - Previous Year Revenue) / Previous Year Revenue × 100', benchmark: 20, unit: '%' },
  { name: 'Operating Cash Flow', formula: 'Cash Inflows from Operating Activities - Cash Outflows from Operating Activities', benchmark: 0, unit: '$' },
  { name: 'Net Profit Margin', formula: '(Net Profit / Total Revenue) × 100', benchmark: 10, unit: '%' },
  { name: 'Customer Acquisition Cost (CAC)', formula: '(Sales + Marketing Spend) / New Customers', benchmark: 33333, unit: '$' },
  { name: 'Customer Lifetime Value (LTV)', formula: 'Average Purchase × Number of Purchases × Retention Period', benchmark: 100000, unit: '$' },
  { name: 'Operating Margin', formula: '(Revenue - Operating Expenses) / Revenue × 100', benchmark: 20, unit: '%' },
  { name: 'Contractor Efficiency Ratio', formula: 'Revenue / Number of Contractors', benchmark: 100000, unit: '$' },
  { name: 'Incentive-Based Compensation Percentage', formula: '(Total Incentive-Based Compensation / Total Wages Paid) × 100', benchmark: 30, unit: '%' },
  { name: 'Demo-to-Contract Conversion Rate', formula: '(Contracts Signed / Demo Calls Completed) × 100', benchmark: 20, unit: '%' },
  { name: 'Average Contract Value (ACV)', formula: 'Total Contract Value / Contracts Signed', benchmark: 20000, unit: '$' },
  { name: 'Monthly Recurring Revenue (MRR) Growth', formula: '(Current MRR - Previous MRR) / Previous MRR × 100', benchmark: 10, unit: '%' },
  { name: 'Demo Call Booking Rate', formula: '(Demo Calls Booked / Discovery Calls Completed) × 100', benchmark: 80, unit: '%' },
  { name: 'Time to Close (Sales Cycle Length)', formula: 'Average time from discovery call to contract signing', benchmark: 60, unit: 'days' },
]

const generateRandomData = (startDate: Date, endDate: Date): DataPoint[] => {
  const weeks = eachWeekOfInterval({ start: startDate, end: endDate })
  let previousValues: { [key: string]: number } = {}
  
  return weeks.map((week, index) => {
    const weekStart = startOfWeek(week)
    const weekEnd = endOfWeek(week)
    const weekData: DataPoint = {
      week: `Week ${getWeek(week)}`,
      dateRange: `${format(weekStart, 'MMM dd')}-${format(weekEnd, 'MMM dd')}`,
      startDate: format(weekStart, 'MMM dd'),
    }
    
    metrics.forEach(metric => {
      let value: number
      const prevValue = previousValues[metric.name] || metric.benchmark
      
      if (metric.name === 'CAC Ratio') {
        value = prevValue * (0.9 + Math.random() * 0.2)
      } else if (metric.name === 'Operating Cash Flow') {
        value = prevValue + (Math.random() * 200000 - 100000)
      } else if (metric.unit === '$') {
        value = prevValue * (0.95 + Math.random() * 0.1)
      } else if (metric.unit === '%') {
        value = prevValue * (0.95 + Math.random() * 0.1)
      } else if (metric.name === 'Time to Close (Sales Cycle Length)') {
        value = prevValue * (0.98 + Math.random() * 0.04)
      } else {
        value = prevValue * (0.95 + Math.random() * 0.1)
      }
      
      weekData[metric.name] = Number(value.toFixed(2))
      previousValues[metric.name] = value
    })
    return weekData
  })
}

function MetricsStandingTable({ metrics, data }: { metrics: Metric[], data: DataPoint[] }) {
  const currentWeekData = data[data.length - 1] || {};
  const previousWeekData = data[data.length - 2] || {};

  const getPercentageChange = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  const formatValue = (value: number | undefined, unit: string) => {
    if (value === undefined) return 'N/A';
    if (unit === '%') return `${value.toFixed(2)}%`;
    if (unit === '$') return `$${value.toFixed(2)}`;
    if (unit === ':1') return value.toFixed(2);
    if (unit === 'days') return `${Math.round(value)} days`;
    return value.toFixed(2);
  };

  return (
    <Card className="w-full mb-8">
      <CardHeader>
        <CardTitle>Metrics Standing</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Metric</TableHead>
              <TableHead>Current Value</TableHead>
              <TableHead>Previous Value</TableHead>
              <TableHead>Change</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {metrics.map((metric) => {
              const currentValue = currentWeekData[metric.name] as number | undefined;
              const previousValue = previousWeekData[metric.name] as number | undefined;
              const percentageChange = currentValue !== undefined && previousValue !== undefined
                ? getPercentageChange(currentValue, previousValue)
                : undefined;
              const isPositive = metric.name === 'CAC Ratio' || metric.name === 'Customer Acquisition Cost (CAC)' || metric.name === 'Time to Close (Sales Cycle Length)'
                ? percentageChange !== undefined && percentageChange < 0
                : percentageChange !== undefined && percentageChange > 0;

              return (
                <TableRow key={metric.name}>
                  <TableCell>{metric.name}</TableCell>
                  <TableCell>{formatValue(currentValue, metric.unit)}</TableCell>
                  <TableCell>{formatValue(previousValue, metric.unit)}</TableCell>
                  <TableCell className={isPositive ? 'text-green-600' : 'text-red-600'}>
                    {percentageChange !== undefined ? `${percentageChange.toFixed(2)}%` : 'N/A'}
                  </TableCell>
                  <TableCell>
                    {percentageChange === undefined ? (
                      '-'
                    ) : Math.abs(percentageChange) < 0.01 ? (
                      <MinusIcon className="h-4 w-4 text-yellow-500" />
                    ) : isPositive ? (
                      <ArrowUpIcon className="h-4 w-4 text-green-600" />
                    ) : (
                      <ArrowDownIcon className="h-4 w-4 text-red-600" />
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

const CustomTooltip = ({ active, payload, data }: CustomTooltipProps) => {
  if (active && payload && payload.length && data) {
    const currentData = payload[0].payload
    const currentWeekNumber = parseInt(currentData.week.split(' ')[1])
    
    const previousData = data.find((d: DataPoint) => 
      parseInt(d.week.split(' ')[1]) === currentWeekNumber - 1
    )

    return (
      <div className="bg-white p-4 border rounded shadow">
        <p className="font-bold">{`${currentData.week} (${currentData.dateRange})`}</p>
        {payload.map((entry, index) => {
          const currentValue = entry.value
          const metric = metrics.find(m => m.name === entry.name)
          
          const previousValue = previousData ? 
            (previousData[entry.name] as number) : 
            null
          
          const percentageChange = previousValue !== null ? 
            ((currentValue - previousValue) / previousValue * 100) : 
            null

          return (
            <div key={index} className="mb-1">
              <p style={{ color: entry.color }}>
                {`${entry.name}: ${entry.value.toFixed(2)}${metric?.unit}`}
              </p>
              {percentageChange !== null && (
                <p className="text-sm font-medium" 
                   style={{ 
                     color: 'hsl(41, 100%, 50%)'  // Bright yellow color
                   }}>
                  <span style={{ color: percentageChange > 0 ? '#22c55e' : percentageChange < 0 ? '#ef4444' : '#a3a3a3' }}>
                    {percentageChange > 0 ? '↑' : percentageChange < 0 ? '↓' : '→'}
                  </span>
                  {` ${Math.abs(percentageChange).toFixed(1)}% vs previous`}
                </p>
              )}
            </div>
          )
        })}
      </div>
    )
  }
  return null
}

export function DashboardComponent() {
  const [timeFrame, setTimeFrame] = useState("week")
  const [year, setYear] = useState(new Date().getFullYear())
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subWeeks(new Date(), 4),
    to: new Date(),
  })
  const [data, setData] = useState<DataPoint[]>([])

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
      return
    }

    setData(generateRandomData(startDate, endDate))
  }, [timeFrame, year, dateRange])

  const renderMetricCard = (metric: Metric) => {
    const latestData = data[data.length - 1] || {
      week: '',
      dateRange: '',
      startDate: '',
      [metric.name]: 0
    } as DataPoint;
    
    const currentValue = (latestData[metric.name] as number) || 0;
    const isGood = metric.name === 'CAC Ratio' 
      ? currentValue < 3
      : metric.name === 'Operating Cash Flow' 
        ? currentValue > 0 
        : currentValue >= metric.benchmark
    const isPercentage = metric.unit === '%'

    const shouldShowDecimals = [
      'CAC Ratio',
      'Profit Allocation Ratio', 
      'Revenue Growth Rate',
      'Net Profit Margin',
      'Operating Margin',
      'Incentive-Based Compensation Percentage',
      'Demo-to-Contract Conversion Rate',
      'Monthly Recurring Revenue (MRR) Growth',
      'Demo Call Booking Rate'
    ].includes(metric.name)
  
    const valueFormatter = (value: number) => 
      `${shouldShowDecimals ? value.toFixed(2) : Math.round(value)}${metric.unit}`

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
                  // ... existing code ...
                />
                <YAxis domain={isPercentage ? [0, 100] : ['auto', 'auto']} />
                <CartesianGrid strokeDasharray="3 3" />
                <Tooltip 
                  content={
                    (props: any) => <CustomTooltip {...props as CustomTooltipProps} data={data} />
                  } 
                  cursor={{ strokeDasharray: '3 3' }}
                />
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
              <p className="text-2xl font-bold text-muted-foreground">{valueFormatter(metric.benchmark)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">FirmOS Internal Dashboard</h1>
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
      <MetricsStandingTable metrics={metrics} data={data} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map(renderMetricCard)}
      </div>
    </div>
  )
}