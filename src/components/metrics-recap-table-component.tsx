'use client'

import { useState, useCallback } from 'react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sparklines, SparklinesLine, SparklinesSpots } from 'react-sparklines'
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { AlertCircle } from 'lucide-react'

// Helper function to format date
const formatDate = (date: Date) => {
  return date.toLocaleString('default', { month: 'short', year: 'numeric' })
}

// Helper function to format value based on metric type
const formatValue = (value: number, metric: string) => {
  if (metric.includes('Ratio') || metric.includes('Rate') || metric.includes('Margin') || metric.includes('Percentage')) {
    return value.toFixed(2) + '%'
  } else if (metric.includes('Cash') || metric.includes('Cost') || metric.includes('Value')) {
    return '$' + value.toFixed(2)
  } else if (metric.includes('Time to Close')) {
    return Math.round(value) + ' days'
  } else {
    return value.toFixed(2)
  }
}

// Mock data generation function
const generateMockData = () => {
  const clients = [
    "FirmOS",
    "Acme Corp",
    "The CPA Dude",
    "Amano-FAS",
    "The Non-Profit CFO",
    "Biotech CPA",
    "CFO Medical",
    "PORTICUS MARKETPLACE INC."
  ]

  const metrics = [
    "CAC Ratio",
    "Profit Allocation Ratio",
    "Revenue Growth Rate",
    "Operating Cash Flow",
    "Net Profit Margin",
    "Customer Acquisition Cost (CAC)",
    "Customer Lifetime Value (LTV)",
    "Operating Margin",
    "Contractor Efficiency Ratio",
    "Incentive-Based Compensation Percentage",
    "Demo-to-Contract Conversion Rate",
    "Average Contract Value (ACV)",
    "Monthly Recurring Revenue (MRR) Growth",
    "Demo Call Booking Rate",
    "Time to Close (Sales Cycle Length)"
  ]

  const mockData: {[key: string]: any} = {}

  metrics.forEach(metric => {
    mockData[metric] = {}
    clients.forEach(client => {
      let currentValue, previousValue, change, status, sparklineData, sparklineDates
      
      // Generate sparkline data (12 months of data)
      sparklineData = Array.from({ length: 12 }, () => Math.random() * 100)
      
      // Generate dates for the last 12 months
      const today = new Date()
      sparklineDates = Array.from({ length: 12 }, (_, i) => {
        const date = new Date(today.getFullYear(), today.getMonth() - 11 + i, 1)
        return formatDate(date)
      })
      
      switch (metric) {
        case "CAC Ratio":
        case "Profit Allocation Ratio":
        case "Revenue Growth Rate":
        case "Net Profit Margin":
        case "Operating Margin":
        case "Contractor Efficiency Ratio":
        case "Incentive-Based Compensation Percentage":
        case "Demo-to-Contract Conversion Rate":
        case "Monthly Recurring Revenue (MRR) Growth":
        case "Demo Call Booking Rate":
          currentValue = sparklineData[sparklineData.length - 1].toFixed(2) + "%"
          previousValue = sparklineData[sparklineData.length - 2].toFixed(2) + "%"
          change = (parseFloat(currentValue) - parseFloat(previousValue)).toFixed(2) + "%"
          break
        case "Operating Cash Flow":
        case "Customer Acquisition Cost (CAC)":
        case "Customer Lifetime Value (LTV)":
        case "Average Contract Value (ACV)":
          currentValue = "$" + (sparklineData[sparklineData.length - 1] * 100).toFixed(2)
          previousValue = "$" + (sparklineData[sparklineData.length - 2] * 100).toFixed(2)
          change = "$" + ((sparklineData[sparklineData.length - 1] - sparklineData[sparklineData.length - 2]) * 100).toFixed(2)
          break
        case "Time to Close (Sales Cycle Length)":
          sparklineData = sparklineData.map(value => Math.floor(value))
          currentValue = sparklineData[sparklineData.length - 1] + " days"
          previousValue = sparklineData[sparklineData.length - 2] + " days"
          change = (sparklineData[sparklineData.length - 1] - sparklineData[sparklineData.length - 2]) + " days"
          break
        default:
          currentValue = sparklineData[sparklineData.length - 1].toFixed(2)
          previousValue = sparklineData[sparklineData.length - 2].toFixed(2)
          change = (sparklineData[sparklineData.length - 1] - sparklineData[sparklineData.length - 2]).toFixed(2)
      }
      
      // Determine status based on change
      if (change.includes("$")) {
        status = parseFloat(change.slice(1)) > 0 ? "Positive" : "Negative"
      } else if (change.includes("%")) {
        status = parseFloat(change) > 0 ? "Positive" : "Negative"
      } else {
        status = parseInt(change) < 0 ? "Positive" : "Negative"
      }
      
      mockData[metric][client] = { currentValue, previousValue, change, status, sparklineData, sparklineDates }
    })
  })

  return mockData
}


interface SparklineProps {
  data: number[];
  dates: string[];
  metric: string;
  status: string;
}

interface TooltipData {
  date: string;
  value: string;
  x: number;
  y: number;
}

const SparklineWithTooltip = ({ data, dates, metric, status }: SparklineProps) => {
  const [tooltipData, setTooltipData] = useState<TooltipData | null>(null)

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const container = e.currentTarget
    const containerRect = container.getBoundingClientRect()
    const x = e.clientX - containerRect.left 
    const index = Math.min(Math.floor((x / containerRect.width) * data.length), data.length - 1)

    setTooltipData({
      date: dates[index],
      value: formatValue(data[index], metric),
      x: x,
      y: containerRect.height - (data[index] / Math.max(...data)) * containerRect.height
    })
  }, [data, dates, metric])

  const handleMouseLeave = useCallback(() => {
    setTooltipData(null)
  }, [])

  return (
    <div 
      className="relative w-[100px] h-[20px]" 
      onMouseMove={handleMouseMove} 
      onMouseLeave={handleMouseLeave}
    >
      <Sparklines data={data} width={100} height={20} margin={5}>
        <SparklinesLine color={status === "Positive" ? "green" : "red"} />
        <SparklinesSpots />
      </Sparklines>
      {tooltipData && (
        <div 
          className="absolute bg-black text-white text-xs rounded py-1 px-2 pointer-events-none"
          style={{ 
            left: `${tooltipData.x}px`, 
            top: `${tooltipData.y}px`, 
            transform: 'translate(-50%, -100%)' 
          }}
        >
          {tooltipData.date}: {tooltipData.value}
        </div>
      )}
    </div>
  )
}

interface ClientValues {
  status: string;
  currentValue: number;
  previousValue: number;
  change: number;
  sparklineData: number[];
  sparklineDates: string[];
}

interface MetricData {
  [client: string]: ClientValues;
}

export function MetricsDashboardComponent() {
  const [data] = useState(generateMockData())

  return (
    <Card className="w-full mx-auto">
      <CardHeader>
        <CardTitle>Metrics Dashboard</CardTitle>
        <CardDescription>View key metrics for each client</CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" className="w-full space-y-4">
            {Object.entries(data).map(([metric, clientData]: [string, MetricData]) => {
              const negativeClients = Object.entries(clientData)
                .filter(([_, values]) => values.status === "Negative")
                .map(([client, _]) => client);
            
            return (
              <AccordionItem value={metric} key={metric} className="relative">
                <AccordionTrigger className="text-lg font-semibold pr-10">
                  {metric}
                </AccordionTrigger>
                {negativeClients.length > 0 && (
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <button className="absolute top-4 right-4 text-red-500 hover:text-red-700 focus:outline-none">
                        <AlertCircle size={20} />
                      </button>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-80">
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm">Clients with Negative Status</h4>
                        <ul className="list-disc list-inside text-sm">
                          {negativeClients.map(client => (
                            <li key={client}>{client}</li>
                          ))}
                        </ul>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                )}
                <AccordionContent>
                  <ScrollArea className="h-[400px] w-full rounded-md border">
                  <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[200px] whitespace-nowrap">Client</TableHead>
                            <TableHead className="whitespace-nowrap">Current Week Value</TableHead>
                            <TableHead className="whitespace-nowrap">Previous Week Value</TableHead>
                            <TableHead className="whitespace-nowrap">Change</TableHead>
                            <TableHead className="whitespace-nowrap">Status</TableHead>
                            <TableHead className="whitespace-nowrap">Trend (12 months)</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {Object.entries(clientData).map(([client, values]) => (
                            <TableRow key={client}>
                              <TableCell className="font-medium whitespace-nowrap">{client}</TableCell>
                              <TableCell className="whitespace-nowrap">{values.currentValue}</TableCell>
                              <TableCell className="whitespace-nowrap">{values.previousValue}</TableCell>
                              <TableCell className="whitespace-nowrap">{values.change}</TableCell>
                              <TableCell className="whitespace-nowrap">
                                <Badge variant={values.status === "Positive" ? "default" : "destructive"}>
                                  {values.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="whitespace-nowrap">
                                <SparklineWithTooltip 
                                  data={values.sparklineData} 
                                  dates={values.sparklineDates}
                                  metric={metric}
                                  status={values.status}
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </ScrollArea>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </CardContent>
    </Card>
  )
}