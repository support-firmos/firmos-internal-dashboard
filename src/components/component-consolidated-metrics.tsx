"use client"

import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChevronDownIcon } from "@radix-ui/react-icons"
import { Checkbox } from "@/components/ui/checkbox"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts'
import { format, addDays, startOfWeek, endOfWeek } from 'date-fns';

// Core interfaces
interface Client {
  key: string;
  name: string;
  color: string;
}

interface Metric {
  key: string;
  name: string;
  description: string;
  unit: string;
  calculator: (data: any) => number;
  range: {
    min: number;
    max: number;
  };
  benchmark: number;
}

interface DateRange {
  start: Date;
  end: Date;
}

interface ConsolidatedMetricsProps {
  clients?: Client[];
  selectedMetric: string;
  dateRange: DateRange;
  onMetricChange: (metric: string) => void;
}

// Sample clients data
const CLIENTS: Client[] = [
  { key: 'FirmOS', name: 'FirmOS', color: '#FF6B6B' },
  { key: 'AcmeCorp', name: 'Acme Corp', color: '#4ECDC4' },
  { key: 'CPADude', name: 'The CPA Dude', color: '#45B7D1' },
  { key: 'AmanoFAS', name: 'Amano-FAS', color: '#FFA07A' },
  { key: 'NonProfitCFO', name: 'The Non-Profit CFO', color: '#98FB98' },
  { key: 'BiotechCPA', name: 'Biotech CPA', color: '#DDA0DD' },
  { key: 'CFOMedical', name: 'CFO Medical', color: '#F0E68C' },
  { key: 'Porticus', name: 'PORTICUS MARKETPLACE INC.', color: '#87CEFA' },
]

// Mock data fetching function
const fetchClientData = async (clientKey: string, startDate: Date, endDate: Date) => {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        // Basic metrics
        marketingCosts: Math.random() * 10000,
        newCustomers: Math.floor(Math.random() * 100),
        avgRevenue: Math.random() * 1000,
        avgLifespan: Math.random() * 24,
        revenue: Math.random() * 100000,
        costs: Math.random() * 50000,
        
        // Sales metrics
        currentRevenue: Math.random() * 100000,
        previousRevenue: Math.random() * 80000,
        operatingIncome: Math.random() * 30000,
        depreciation: Math.random() * 5000,
        workingCapitalChange: Math.random() * 2000,
        netIncome: Math.random() * 20000,
        
        // Operational metrics
        output: Math.random() * 1000,
        input: Math.random() * 800,
        convertedLeads: Math.random() * 50,
        totalLeads: Math.random() * 100,
        
        // New metrics data
        ltv: Math.random() * 150000,
        cac: Math.random() * 5000,
        totalContractValue: Math.random() * 1000000,
        contractsSigned: Math.floor(Math.random() * 20),
        currentMRR: Math.random() * 50000,
        previousMRR: Math.random() * 40000,
        demoCallsBooked: Math.floor(Math.random() * 50),
        discoveryCallsCompleted: Math.floor(Math.random() * 60),
        avgDaysToClose: Math.floor(Math.random() * 90),
        incentiveBasedCompensation: Math.random() * 200000,
        totalWages: Math.random() * 500000,
        numberOfContractors: Math.floor(Math.random() * 20),
        operatingExpenses: Math.random() * 70000,
        profitAllocated: Math.random() * 30000
      });
    }, 100);
  });
};

// Metric calculation functions
const metricCalculators = {
  calculateCAC: (data: any) => {
    return (data.marketingCosts + data.costs) / data.newCustomers;
  },

  calculateLTV: (data: any) => {
    return data.avgRevenue * data.avgLifespan * data.avgLifespan;
  },

  calculateCACRatio: (data: any) => {
    const ltv = data.avgRevenue * data.avgLifespan;
    const cac = (data.marketingCosts + data.costs) / data.newCustomers;
    return ltv / cac;
  },

  calculateProfitRatio: (data: any) => {
    return (data.profitAllocated / data.revenue) * 100;
  },

  calculateRevenueGrowth: (data: any) => {
    return ((data.currentRevenue - data.previousRevenue) / data.previousRevenue) * 100;
  },

  calculateOperatingCashFlow: (data: any) => {
    return data.operatingIncome + data.depreciation - data.workingCapitalChange;
  },

  calculateNetProfitMargin: (data: any) => {
    return (data.netIncome / data.revenue) * 100;
  },

  calculateOperatingMargin: (data: any) => {
    return ((data.revenue - data.operatingExpenses) / data.revenue) * 100;
  },

  calculateContractorEfficiency: (data: any) => {
    return data.revenue / data.numberOfContractors;
  },

  calculateIncentiveCompensation: (data: any) => {
    return (data.incentiveBasedCompensation / data.totalWages) * 100;
  },

  calculateDemoConversion: (data: any) => {
    return (data.contractsSigned / data.demoCallsBooked) * 100;
  },

  calculateACV: (data: any) => {
    return data.totalContractValue / data.contractsSigned;
  },

  calculateMRRGrowth: (data: any) => {
    return ((data.currentMRR - data.previousMRR) / data.previousMRR) * 100;
  },

  calculateDemoBookingRate: (data: any) => {
    return (data.demoCallsBooked / data.discoveryCallsCompleted) * 100;
  },

  calculateTimeToClose: (data: any) => {
    return data.avgDaysToClose;
  }
}

// Configurable metrics
const METRICS: Metric[] = [
  {
    key: 'cac',
    name: 'Customer Acquisition Cost (CAC)',
    description: 'Cost of acquiring a new customer',
    unit: '$',
    calculator: metricCalculators.calculateCAC,
    range: { min: 0, max: 1000 },
    benchmark: 200
  },
  {
    key: 'ltv',
    name: 'Customer Lifetime Value (LTV)',
    description: 'Total value of a customer over time',
    unit: '$',
    calculator: metricCalculators.calculateLTV,
    range: { min: 0, max: 200000 },
    benchmark: 100000
  },
  {
    key: 'cacRatio',
    name: 'CAC Ratio (LTV:CAC)',
    description: 'Ratio of Customer Lifetime Value to Customer Acquisition Cost',
    unit: ':1',
    calculator: metricCalculators.calculateCACRatio,
    range: { min: 0, max: 10 },
    benchmark: 3
  },
  {
    key: 'profitRatio',
    name: 'Profit Allocation Ratio',
    description: 'Percentage of revenue allocated as profit',
    unit: '%',
    calculator: metricCalculators.calculateProfitRatio,
    range: { min: 0, max: 100 },
    benchmark: 10
  },
  {
    key: 'revenueGrowth',
    name: 'Revenue Growth Rate',
    description: 'Year over year revenue growth',
    unit: '%',
    calculator: metricCalculators.calculateRevenueGrowth,
    range: { min: -20, max: 100 },
    benchmark: 20
  },
  {
    key: 'operatingCashFlow',
    name: 'Operating Cash Flow',
    description: 'Net cash generated from operating activities',
    unit: '$',
    calculator: metricCalculators.calculateOperatingCashFlow,
    range: { min: -50000, max: 200000 },
    benchmark: 0
  },
  {
    key: 'netProfitMargin',
    name: 'Net Profit Margin',
    description: 'Net profit as a percentage of revenue',
    unit: '%',
    calculator: metricCalculators.calculateNetProfitMargin,
    range: { min: -20, max: 40 },
    benchmark: 10
  },
  {
    key: 'operatingMargin',
    name: 'Operating Margin',
    description: 'Operating profit as a percentage of revenue',
    unit: '%',
    calculator: metricCalculators.calculateOperatingMargin,
    range: { min: -10, max: 50 },
    benchmark: 20
  },
  {
    key: 'contractorEfficiency',
    name: 'Contractor Efficiency Ratio',
    description: 'Revenue generated per contractor',
    unit: '$',
    calculator: metricCalculators.calculateContractorEfficiency,
    range: { min: 0, max: 200000 },
    benchmark: 100000
  },
  {
    key: 'incentiveComp',
    name: 'Incentive-Based Compensation',
    description: 'Percentage of total wages paid as incentive compensation',
    unit: '%',
    calculator: metricCalculators.calculateIncentiveCompensation,
    range: { min: 0, max: 100 },
    benchmark: 30
  },
  {
    key: 'demoConversion',
    name: 'Demo-to-Contract Conversion Rate',
    description: 'Percentage of demos that convert to signed contracts',
    unit: '%',
    calculator: metricCalculators.calculateDemoConversion,
    range: { min: 0, max: 100 },
    benchmark: 20
  },
  {
    key: 'acv',
    name: 'Average Contract Value (ACV)',
    description: 'Average value of signed contracts',
    unit: '$',
    calculator: metricCalculators.calculateACV,
    range: { min: 0, max: 50000 },
    benchmark: 20000
  },
  {
    key: 'mrrGrowth',
    name: 'Monthly Recurring Revenue Growth',
    description: 'Month over month growth in recurring revenue',
    unit: '%',
    calculator: metricCalculators.calculateMRRGrowth,
    range: { min: -20, max: 50 },
    benchmark: 10
  },
  {
    key: 'demoBookingRate',
    name: 'Demo Call Booking Rate',
    description: 'Percentage of discovery calls that convert to demo calls',
    unit: '%',
    calculator: metricCalculators.calculateDemoBookingRate,
    range: { min: 0, max: 100 },
    benchmark: 80
  },
  {
    key: 'timeToClose',
    name: 'Time to Close',
    description: 'Average days from discovery call to contract signing',
    unit: ' days',
    calculator: metricCalculators.calculateTimeToClose,
    range: { min: 0, max: 120 },
    benchmark: 60
  }
]
// Sub-components
interface ClientSelectorProps {
  clients: Client[];
  selectedClients: Client[];
  onChange: (clients: Client[]) => void;
}

const ClientSelector: React.FC<ClientSelectorProps> = ({ 
  clients, 
  selectedClients, 
  onChange 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <Button 
        variant="outline" 
        className="w-full justify-between" 
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        {selectedClients.length 
          ? `${selectedClients.length} Client${selectedClients.length === 1 ? '' : 's'} Selected`
          : 'Select Clients'}
        <ChevronDownIcon className="ml-2 h-4 w-4" />
      </Button>
      
      {isOpen && (
        <div className="absolute mt-2 w-full z-10 bg-white border rounded-md shadow-lg">
          <div className="p-2 border-b flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                onChange(clients);
                setIsOpen(false);
              }}
            >
              Select All
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                onChange([]);
                setIsOpen(false);
              }}
            >
              Clear All
            </Button>
          </div>
          
          <ScrollArea className="h-[200px]">
            <div className="p-2">
              {clients.map((client) => (
                <div
                  key={client.key}
                  className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-md cursor-pointer"
                  onClick={() => {
                    const isSelected = selectedClients.some(c => c.key === client.key);
                    if (isSelected) {
                      onChange(selectedClients.filter(c => c.key !== client.key));
                    } else {
                      onChange([...selectedClients, client]);
                    }
                  }}
                >
                  <Checkbox
                    checked={selectedClients.some(c => c.key === client.key)}
                    onCheckedChange={() => {
                      const isSelected = selectedClients.some(c => c.key === client.key);
                      if (isSelected) {
                        onChange(selectedClients.filter(c => c.key !== client.key));
                      } else {
                        onChange([...selectedClients, client]);
                      }
                    }}
                  />
                  <span className="text-sm">{client.name}</span>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
};

interface MetricSelectorProps {
  metrics: Metric[];
  selectedMetric: string;
  onChange: (metricKey: string) => void;
}

const MetricSelector: React.FC<MetricSelectorProps> = ({
  metrics,
  selectedMetric,
  onChange
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedMetricData = metrics.find(m => m.key === selectedMetric);

  return (
    <div className="relative" ref={dropdownRef}>
      <Button 
        variant="outline" 
        className="w-full justify-between" 
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        {selectedMetricData?.name || 'Select Metric'}
        <ChevronDownIcon className="ml-2 h-4 w-4" />
      </Button>

      {isOpen && (
        <div className="absolute mt-2 w-full z-10 bg-white border rounded-md shadow-lg">
          <ScrollArea className="h-[300px]">
            <div className="p-2">
              {metrics.map((metric) => (
                <div
                  key={metric.key}
                  className={`
                    p-2 cursor-pointer rounded-md
                    ${selectedMetric === metric.key ? 'bg-primary text-primary-foreground' : 'hover:bg-gray-100'}
                  `}
                  onClick={() => {
                    onChange(metric.key);
                    setIsOpen(false);
                  }}
                >
                  <div className="font-medium text-sm">{metric.name}</div>
                  <div className="text-xs opacity-80">{metric.description}</div>
                  <div className="text-xs mt-1">
                    Benchmark: {metric.unit === '$' ? `${metric.unit}${metric.benchmark.toLocaleString()}` : `${metric.benchmark}${metric.unit}`}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
};
interface MetricsChartProps {
  data: any[];
  clients: Client[];
  metric: Metric | undefined;
}

const MetricsChart: React.FC<MetricsChartProps> = ({
  data,
  clients,
  metric
}) => {
  const [chartHeight, setChartHeight] = useState(300);
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    const updateDimensions = () => {
      setChartHeight(Math.min(300, window.innerHeight * 0.4));
      setIsSmallScreen(window.innerWidth < 640);
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  return (
    <div style={{ width: '100%', height: chartHeight }}>
      <ResponsiveContainer>
        <LineChart
          data={data}
          margin={{ top: 5, right: 10, bottom: 5, left: isSmallScreen ? -20 : 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: isSmallScreen ? 10 : 12, fill: '#4B5563' }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            domain={[metric?.range.min || 0, metric?.range.max || 100]}
            tick={{ fontSize: isSmallScreen ? 10 : 12, fill: '#4B5563' }}
            tickLine={false}
            axisLine={false}
            width={30}
          />
           <Tooltip content={<CustomTooltip unit={metric?.unit} data={data} />} />
          {clients.map((client) => (
            <Line
              key={client.key}
              type="monotone"
              dataKey={client.key}
              name={client.name}
              stroke={client.color}
              strokeWidth={2}
              dot={{ stroke: client.color, strokeWidth: 2, r: isSmallScreen ? 3 : 4 }}
              activeDot={{ r: isSmallScreen ? 5 : 6 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    dataKey: string;
    name: string;
    color: string;
  }>;
  label?: string;
  unit?: string;
  data: any[]; // Full dataset
}

const CustomTooltip: React.FC<TooltipProps> = ({ active, payload, label, unit, data }) => {
  if (!active || !payload || !data) return null;

  const currentIndex = data.findIndex(item => item.date === label);
  const previousWeekIndex = currentIndex - 1;

  // Calculate the start and end of the week
  const currentDate = new Date(label || ''); // Add fallback empty string
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Assuming week starts on Monday
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });

  // Format the date range
  const dateRange = `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`;

  return (
    <div className="bg-white border border-gray-200 p-3 rounded-md shadow-md">
      <p className="text-sm font-semibold text-gray-700 mb-2">{dateRange}</p>
      {payload.map((entry, index) => {
        const currentValue = entry.value;
        const previousValue = previousWeekIndex >= 0 ? data[previousWeekIndex][entry.dataKey] : null;
        const percentageChange = previousValue !== null
          ? ((currentValue - previousValue) / previousValue) * 100
          : null;

        return (
          <div 
            key={`${entry.dataKey}-${index}`}
            className="flex items-center justify-between gap-4 text-sm mb-1"
          >
            <span style={{ color: entry.color }}>{entry.name}:</span>
            <div className="text-right">
              <span className="font-medium">
                {unit === '$' ? `${unit}${currentValue.toLocaleString()}` : `${currentValue.toFixed(2)}${unit}`}
              </span>
              {percentageChange !== null && (
                <span className={`ml-2 text-xs ${percentageChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {percentageChange >= 0 ? '▲' : '▼'} {Math.abs(percentageChange).toFixed(2)}%
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

interface MetricsSummaryProps {
  data: any[];
  metric: Metric | undefined;
  clients: Client[];
}

const MetricsSummary: React.FC<MetricsSummaryProps> = ({ data, metric, clients }) => {
  const calculateAverage = () => {
    if (!data.length || !clients.length) return 0;
    
    const sum = data.reduce((acc, curr) => {
      const clientValues = clients.map(client => curr[client.key] || 0);
      return acc + (clientValues.reduce((a, b) => a + b, 0) / clients.length);
    }, 0);
    
    return sum / data.length;
  };

  const average = calculateAverage();
  const benchmark = metric?.benchmark || 0;
  const unit = metric?.unit || '';

  return (
    <div className="mt-4 grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
      <div className="text-center">
        <p className="text-sm font-medium text-gray-600 mb-1">Current Average</p>
        <p className="text-2xl font-bold text-gray-800">
          {unit === '$' ? `${unit}${average.toLocaleString(undefined, {maximumFractionDigits: 2})}` : `${average.toFixed(2)}${unit}`}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Across {clients.length} client{clients.length === 1 ? '' : 's'}
        </p>
      </div>
      
      <div className="text-center">
        <p className="text-sm font-medium text-gray-600 mb-1">Benchmark</p>
        <p className="text-2xl font-bold text-gray-800">
          {unit === '$' ? `${unit}${benchmark.toLocaleString(undefined, {maximumFractionDigits: 2})}` : `${benchmark}${unit}`}
        </p>
        <p className={`text-xs mt-1 ${average >= benchmark ? 'text-green-500' : 'text-red-500'}`}>
          {average >= benchmark 
            ? `${((average - benchmark) / benchmark * 100).toFixed(1)}% above target`
            : `${((benchmark - average) / benchmark * 100).toFixed(1)}% below target`
          }
        </p>
      </div>
    </div>
  );
};

export function ConsolidatedMetrics({ 
  clients = CLIENTS,
  selectedMetric,
  dateRange,
  onMetricChange 
}: ConsolidatedMetricsProps) {
  const [chartData, setChartData] = useState<any[]>([]);
  const [selectedClients, setSelectedClients] = useState<Client[]>(clients);
  const [isLoading, setIsLoading] = useState(true);
  const currentMetric = METRICS.find(m => m.key === selectedMetric);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Generate dates for last 5 periods
        const dates = Array.from({ length: 5 }, (_, i) => {
          const date = new Date(dateRange.end);
          date.setDate(date.getDate() - (i * 7));
          return date.toISOString().split('T')[0];
        }).reverse();

        const newData = await Promise.all(dates.map(async (date) => {
          const dataPoint: any = { date };
          
          for (const client of selectedClients) {
            const rawData = await fetchClientData(
              client.key,
              new Date(date),
              new Date(date)
            );
            
            if (currentMetric) {
              dataPoint[client.key] = currentMetric.calculator(rawData);
            }
          }
          
          return dataPoint;
        }));

        setChartData(newData);
      } catch (error) {
        console.error('Error loading metric data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [selectedClients, selectedMetric, dateRange, currentMetric]);

  return (
    <Card className="w-full bg-white">
      <CardHeader className="flex flex-col space-y-1.5 pb-2">
        <CardTitle className="text-xl font-bold text-gray-800">
          Performance Metrics
        </CardTitle>
        <p className="text-sm text-gray-600">
          {currentMetric?.description || 'Analyzing key performance indicators across clients'}
        </p>
      </CardHeader>
      
      <CardContent>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ClientSelector
              clients={clients}
              selectedClients={selectedClients}
              onChange={setSelectedClients}
            />
            
            <MetricSelector
              metrics={METRICS}
              selectedMetric={selectedMetric}
              onChange={onMetricChange}
            />
          </div>

          {isLoading ? (
            <div className="h-[300px] flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : (
            <>
              <MetricsChart
                data={chartData}
                clients={selectedClients}
                metric={currentMetric}
              />
              
              <MetricsSummary
                data={chartData}
                metric={currentMetric}
                clients={selectedClients}
              />
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}