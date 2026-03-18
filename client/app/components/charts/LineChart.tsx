'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface LineChartProps {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor?: string;
    backgroundColor?: string;
    fill?: boolean;
    tension?: number;
  }[];
  title?: string;
}

export default function LineChart({ labels, datasets, title }: LineChartProps) {
  const data = {
    labels,
    datasets: datasets.map(ds => ({
      ...ds,
      borderColor: ds.borderColor || 'rgb(59, 130, 246)',
      backgroundColor: ds.backgroundColor || 'rgba(59, 130, 246, 0.1)',
      tension: ds.tension || 0.4,
      fill: ds.fill || false
    }))
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: !!title,
        text: title || ''
      },
      filler: {
        propagate: true
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  return (
    <div className="h-80 w-full">
      <Line data={data} options={options} />
    </div>
  );
}