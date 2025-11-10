import React, { useEffect, useRef } from 'react';
import { ChartConfiguration } from 'chart.js';

// Chart.js is loaded from a CDN, so we declare it globally for TypeScript
declare var Chart: any;

interface ChartComponentProps {
  config: ChartConfiguration;
  className?: string;
}

const ChartComponent: React.FC<ChartComponentProps> = ({ config, className }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<any>(null); // Use 'any' for the chart instance type for simplicity with CDN

  useEffect(() => {
    if (!canvasRef.current) return;

    // Destroy the previous chart instance before creating a new one to prevent memory leaks
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    
    // The UMD build from the CDN should auto-register components, so we can instantiate directly.
    chartRef.current = new Chart(ctx, config);

    // Cleanup function to destroy the chart when the component unmounts
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [config]); // Re-create the chart whenever the configuration prop changes

  return <canvas ref={canvasRef} className={className}></canvas>;
};

export default ChartComponent;
