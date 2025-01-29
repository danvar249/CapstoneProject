import React from 'react';
import { Line, Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Paper, Box, Typography } from '@mui/material';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const AnalyticsChart = ({ data, type = 'line', title }) => {
  const labels = data.map((item) => item.label);
  const values = data.map((item) => item.value);

  const chartData = {
    labels: labels,
    datasets: [
      {
        label: 'Value',
        data: values,
        backgroundColor:
          type === 'pie'
            ? ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40']
            : 'rgba(63, 81, 181, 0.5)',
        borderColor: '#3f51b5',
        fill: type !== 'pie',
        tension: type === 'line' ? 0.4 : 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: type !== 'pie' ? {
      x: { beginAtZero: true },
      y: { beginAtZero: true },
    } : {},
    plugins: {
      legend: { display: true, position: 'top' },
      title: { display: true, text: title || 'Chart' },
    },
  };

  let ChartComponent;
  switch (type) {
    case 'bar':
      ChartComponent = Bar;
      break;
    case 'pie':
      ChartComponent = Pie;
      break;
    default:
      ChartComponent = Line;
  }

  return (
    <Paper sx={{ padding: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>{title}</Typography>
      <Box>
        <ChartComponent data={chartData} options={options} />
      </Box>
    </Paper>
  );
};

export default AnalyticsChart;
