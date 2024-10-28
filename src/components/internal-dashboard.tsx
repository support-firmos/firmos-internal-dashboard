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
//import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { TooltipProps as RechartsTooltipProps } from 'recharts';
import { TooltipProps } from 'recharts';


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

type CustomTooltipProps = TooltipProps<number, string> & {
  data: DataPoint[];
};


type Client = {
  name: string;
  brandColor: string;
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

const clients: Client[] = [
  { name: 'FirmOS', brandColor: '#000000' },
  { name: 'Acme Corp', brandColor: '#FF6B6B' },
  { name: 'The CPA Dude', brandColor: '#4ECDC4' },
  { name: 'Amano-FAS', brandColor: '#45B7D1' },
  { name: 'The Non-Profit CFO', brandColor: '#96CEB4' },
  { name: 'Biotech CPA', brandColor: '#FFEEAD' },
  { name: 'CFO Medical', brandColor: '#D4A5A5' },
  { name: 'PORTICUS MARKETPLACE INC.', brandColor: '#9B5DE5' }
]

// Fix the generateRandomData function signature and implementation
const generateRandomData = (startDate: Date, endDate: Date, clientName: string): DataPoint[] => {
  const weeks = eachWeekOfInterval({ start: startDate, end: endDate })
  const previousValues: { [key: string]: number } = {}

  // Get client multiplier
  const getClientMultiplier = (clientName: string) => {
    const multipliers: { [key: string]: number } = {
      'FirmOS': 1,
      'Acme Corp': 1.2,
      'The CPA Dude': 1.15,
      'Amano-FAS': 1.1,
      'The Non-Profit CFO': 1.25,
      'Biotech CPA': 1.3,
      'CFO Medical': 1.1,
      'PORTICUS MARKETPLACE INC.': 1.35
    }
    return multipliers[clientName] || 1
  }

  const clientMultiplier = getClientMultiplier(clientName)

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
      
      // Initialize first week with benchmark * client multiplier
      if (index === 0) {
        value = metric.benchmark * clientMultiplier
      } else {
        const prevValue = previousValues[metric.name] || metric.benchmark
        
        // Apply smaller random variations
        if (metric.name === 'CAC Ratio') {
          value = prevValue * (0.95 + Math.random() * 0.1)
        } else if (metric.name === 'Operating Cash Flow') {
          value = prevValue + (Math.random() * 20000 - 10000) // Smaller cash flow variations
        } else if (metric.unit === '$') {
          value = prevValue * (0.97 + Math.random() * 0.06)
        } else if (metric.unit === '%') {
          value = prevValue * (0.97 + Math.random() * 0.06)
        } else if (metric.name === 'Time to Close (Sales Cycle Length)') {
          value = prevValue * (0.98 + Math.random() * 0.04)
        } else {
          value = prevValue * (0.97 + Math.random() * 0.06)
        }
      }

      weekData[metric.name] = Number(value.toFixed(2))
      previousValues[metric.name] = value
    })
    return weekData
  })
}


// Update your CustomTooltip component
const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label, data }) => {
  if (active && payload && payload.length) {
    const dataPoint = payload[0].payload;
    const metricName = payload[0].name;
    const value = payload[0].value;
    const metric = metrics.find(m => m.name === metricName);

    // Add null check for value and metricName
    if (value === undefined || metricName === undefined) return null;

    // Find index of current week data
    const currentIndex = data.findIndex(d => d.week === dataPoint.week);
    
    // Calculate percentage change from previous week if available
    let percentageChange: number | null = null;
    if (currentIndex > 0 && data[currentIndex - 1]) {
      const previousWeekData = data[currentIndex - 1];
      const previousValue = previousWeekData[metricName as keyof DataPoint] as number;
      if (typeof previousValue === 'number' && typeof value === 'number') {
        percentageChange = ((value - previousValue) / previousValue) * 100;
      }
    }

    const isPositiveChange = metric?.name === 'CAC Ratio' || 
                            metric?.name === 'Customer Acquisition Cost (CAC)' || 
                            metric?.name === 'Time to Close (Sales Cycle Length)'
      ? percentageChange !== null && percentageChange < 0
      : percentageChange !== null && percentageChange > 0;

    return (
      <div className="bg-white/80 backdrop-blur-sm p-4 border rounded shadow">
        <p className="font-bold">{`${dataPoint.week} (${dataPoint.dateRange})`}</p>
        <p style={{ color: 'hsl(var(--primary))' }}>
          {`${metricName}: ${value.toFixed(2)}${metric?.unit}`}
        </p>
        {percentageChange !== null && (
          <p className={`text-sm ${isPositiveChange ? 'text-green-600' : 'text-red-600'}`}>
            {`Change from last week: ${percentageChange > 0 ? '+' : ''}${percentageChange.toFixed(2)}%`}
          </p>
        )}
      </div>
    );
  }
  return null;
};

export function DashboardComponent() {
  const [timeFrame, setTimeFrame] = useState("week")
  const [year, setYear] = useState(new Date().getFullYear())
  const [selectedClient, setSelectedClient] = useState<string>(clients[0].name)
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subWeeks(new Date(), 4),
    to: new Date(),
  })
  const [data, setData] = useState<DataPoint[]>([])
  const [selectedKPI, setSelectedKPI] = useState<Metric>(metrics[0]);
  const [allClientsData, setAllClientsData] = useState<{ [key: string]: DataPoint[] }>({});
  
  // Add this new state for individual metric clients
  const [metricClients, setMetricClients] = useState<{ [key: string]: string }>(
    Object.fromEntries(metrics.map(metric => [metric.name, clients[0].name]))
  )

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
  
    setData(generateRandomData(startDate, endDate, selectedClient))

    // Generate data for all clients
    const allData: { [key: string]: DataPoint[] } = {};
    clients.forEach(client => {
      allData[client.name] = generateRandomData(startDate, endDate, client.name);
    });
    setAllClientsData(allData);
  }, [timeFrame, year, dateRange, selectedClient])
  

  const renderMetricCard = (metric: Metric) => {
    const selectedClient = metricClients[metric.name];
    const clientData = generateRandomData(
      timeFrame === "week" ? subWeeks(new Date(), 4) : new Date(year, 0, 1),
      timeFrame === "week" ? new Date() : new Date(year, 11, 31),
      selectedClient
    );
    
    const latestData = clientData[clientData.length - 1] || {
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
  
    // Get the brand color for the selected client
    const selectedClientColor = clients.find(client => client.name === selectedClient)?.brandColor || 'hsl(var(--primary))';
  
    return (
      <Card key={metric.name}>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>{metric.name}</CardTitle>
            <Select 
              value={selectedClient} 
              onValueChange={(value) => setMetricClients(prev => ({ ...prev, [metric.name]: value }))}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Select client" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem 
                    key={client.name} 
                    value={client.name}
                    className="flex items-center"
                  >
                    <div 
                      className="w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: client.brandColor }}
                    />
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <CardDescription>{metric.formula}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={clientData}>
                <XAxis />
                <YAxis domain={isPercentage ? [0, 100] : ['auto', 'auto']} />
                <CartesianGrid strokeDasharray="3 3" />
                <Tooltip
                  content={(props: RechartsTooltipProps<number, string>) => (
                    <CustomTooltip {...props} data={clientData} />
                  )}
                  cursor={{ strokeDasharray: '3 3' }}
                />
                <Line 
                  type="monotone" 
                  dataKey={metric.name} 
                  stroke={selectedClientColor} 
                  strokeWidth={2} 
                />
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
//   const renderAllClientsKPICard = () => {
//     const combinedData = Object.values(allClientsData).flat();
//     return (
//       <Card className="col-span-2">
//         <CardHeader>
//           <div className="flex justify-between items-center">
//             <CardTitle>{selectedKPI.name}</CardTitle>
//             <Select 
//               value={selectedKPI.name} 
//               onValueChange={(value) => setSelectedKPI(metrics.find(m => m.name === value) || metrics[0])}
//             >
//               <SelectTrigger className="w-[250px]">
//                 <SelectValue placeholder="Select KPI" />
//               </SelectTrigger>
//               <SelectContent>
//                 {metrics.map((metric) => (
//                   <SelectItem key={metric.name} value={metric.name}>
//                     {metric.name}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//           </div>
//           <CardDescription>{selectedKPI.formula}</CardDescription>
//         </CardHeader>
//         <CardContent>
//         <div className="h-[400px]">
//           <ResponsiveContainer width="100%" height="100%">
//             <LineChart>
//               <XAxis dataKey="week" allowDuplicatedCategory={false} />
//               <YAxis />
//               <CartesianGrid strokeDasharray="3 3" />
//               <Tooltip content={(props:RechartsTooltipProps<number, string>) => <CustomTooltip {...props} data={combinedData} />} />
//               {clients.map((client) => (
//                 <Line
//                   key={client.name}
//                   type="monotone"
//                   data={allClientsData[client.name] || []}
//                   dataKey={selectedKPI.name}
//                   name={client.name}
//                   stroke={client.brandColor}
//                   strokeWidth={2}
//                 />
//               ))}
//             </LineChart>
//           </ResponsiveContainer>
//         </div>
//       </CardContent>
//     </Card>
//   );
// };

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
    {/* <div className="grid grid-cols-2 gap-4">
      {renderAllClientsKPICard()}
    </div> */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {metrics.map(metric => renderMetricCard(metric))}
    </div>
  </div>
)
}