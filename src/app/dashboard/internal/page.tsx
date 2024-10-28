"use client";
import { Sidebar_07 } from "@/components/components-sidebar"
import { MetricsDashboardComponent } from "@/components/metrics-recap-table-component"
import { ConsolidatedMetrics } from "@/components/component-consolidated-metrics"
import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function DashboardPage() {
  const [selectedMetric, setSelectedMetric] = useState('cac');
  const [dateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    end: new Date()
  });

  // Import CLIENTS from consolidated-metrics-component
  const { CLIENTS } = require('@/components/component-consolidated-metrics');

  const handleMetricChange = (metric: string) => {
    console.log('Metric changed:', metric);
    setSelectedMetric(metric);
  };

  return (
    <Sidebar_07>
      <div className="p-6">
        <div className="max-w-[1400px] mx-auto">
          <h1 className="text-3xl font-bold mb-6">FirmOS Internal Dashboard</h1>
          
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="overview">Metrics Overview</TabsTrigger>
              <TabsTrigger value="comparison">Client Comparison</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="bg-white rounded-lg shadow">
                <MetricsDashboardComponent />
              </div>
            </TabsContent>

            <TabsContent value="comparison" className="space-y-6">
              <div className="bg-white rounded-lg shadow">
                <ConsolidatedMetrics
                  clients={CLIENTS}
                  selectedMetric={selectedMetric}
                  dateRange={dateRange}
                  onMetricChange={handleMetricChange}
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Sidebar_07>
  );
}
