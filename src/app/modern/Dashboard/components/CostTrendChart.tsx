import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, subDays } from 'date-fns';

interface CostTrendChartProps {
  experiments: any[];
}

const CostTrendChart: React.FC<CostTrendChartProps> = ({ experiments }) => {
  // Generate sample data based on experiments
  const generateChartData = () => {
    const data = [];
    for (let i = 30; i >= 0; i--) {
      const date = subDays(new Date(), i);
      data.push({
        date: format(date, 'MMM dd'),
        actual: Math.random() * 1000 + 500,
        optimized: Math.random() * 800 + 400,
        forecast: i < 7 ? Math.random() * 900 + 450 : null,
      });
    }
    return data;
  };

  const data = generateChartData();

  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="date" 
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
            tickFormatter={(value) => `$${value}`}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            }}
            formatter={(value: any) => `$${value.toFixed(2)}`}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="actual" 
            stroke="#ef4444" 
            strokeWidth={2}
            name="Actual Cost"
            dot={false}
          />
          <Line 
            type="monotone" 
            dataKey="optimized" 
            stroke="#10b981" 
            strokeWidth={2}
            name="Optimized Cost"
            dot={false}
          />
          <Line 
            type="monotone" 
            dataKey="forecast" 
            stroke="#3b82f6" 
            strokeWidth={2}
            strokeDasharray="5 5"
            name="Forecast"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export { CostTrendChart };

// Made with Bob
