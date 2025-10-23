'use client';

import { useMemo } from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import { Token } from '@/types';
import { RiskScore } from '@/lib/risk-engine';

ChartJS.register(ArcElement, Tooltip, Legend);

interface PortfolioChartProps {
  tokens: Token[];
  tokenRisks: Map<string, RiskScore>;
}

export function PortfolioChart({ tokens, tokenRisks }: PortfolioChartProps) {
  const chartData = useMemo(() => {
    // Filter tokens with value
    const tokensWithValue = tokens.filter(t => (t.value || 0) > 0);

    // Sort by value descending
    const sortedTokens = tokensWithValue.sort((a, b) => (b.value || 0) - (a.value || 0));

    // Take top 10, group rest as "Others"
    const topTokens = sortedTokens.slice(0, 10);
    const otherTokens = sortedTokens.slice(10);
    const othersValue = otherTokens.reduce((sum, t) => sum + (t.value || 0), 0);

    const labels = topTokens.map(t => t.symbol);
    const values = topTokens.map(t => t.value || 0);
    const colors = topTokens.map(t => {
      const risk = tokenRisks.get(t.address);
      if (!risk) return 'rgba(100, 116, 139, 0.8)'; // gray

      switch (risk.color) {
        case 'green':
          return 'rgba(34, 197, 94, 0.8)'; // green-500
        case 'yellow':
          return 'rgba(234, 179, 8, 0.8)'; // yellow-500
        case 'orange':
          return 'rgba(249, 115, 22, 0.8)'; // orange-500
        case 'red':
          return 'rgba(239, 68, 68, 0.8)'; // red-500
        default:
          return 'rgba(100, 116, 139, 0.8)';
      }
    });

    if (othersValue > 0) {
      labels.push('Others');
      values.push(othersValue);
      colors.push('rgba(100, 116, 139, 0.8)');
    }

    return {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: colors,
          borderColor: colors.map(c => c.replace('0.8', '1')),
          borderWidth: 2,
        },
      ],
    };
  }, [tokens, tokenRisks]);

  const options: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: 'rgba(255, 255, 255, 0.8)',
          padding: 15,
          font: {
            size: 12,
          },
          generateLabels: (chart) => {
            const data = chart.data;
            if (data.labels && data.datasets.length) {
              return data.labels.map((label, i) => {
                const value = data.datasets[0].data[i] as number;
                const total = (data.datasets[0].data as number[]).reduce((a, b) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                
                const bgColors = data.datasets[0].backgroundColor;
                const fillStyle = Array.isArray(bgColors) ? bgColors[i] : bgColors;
                
                return {
                  text: `${label} (${percentage}%)`,
                  fillStyle: fillStyle as string,
                  hidden: false,
                  index: i,
                };
              });
            }
            return [];
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'rgba(255, 255, 255, 1)',
        bodyColor: 'rgba(255, 255, 255, 0.8)',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a: number, b: any) => a + (b as number), 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: $${value.toFixed(2)} (${percentage}%)`;
          },
        },
      },
    },
    cutout: '65%',
  };

  if (tokens.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        <p>No tokens to display</p>
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <Doughnut data={chartData} options={options} />
    </div>
  );
}
