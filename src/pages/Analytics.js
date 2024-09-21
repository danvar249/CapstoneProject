import React, { useState } from 'react';
import { Typography, Box, TextField, MenuItem, Grid, Tabs, Tab } from '@mui/material';
import AnalyticsChart from '../components/AnalyticsChart';

const mockTags = ['All','smartphone', 'electronics', 'laptop', 'computers', 'accessories', 'audio'];

const engagementData = {
  messagesSent: [
    { date: '2024-01-01', value: 120, tag: 'smartphone' },
    { date: '2024-01-02', value: 100, tag: 'smartphone' },
    { date: '2024-01-03', value: 110, tag: 'electronics' },
    { date: '2024-01-04', value: 140, tag: 'electronics' },
    { date: '2024-01-02', value: 150, tag: 'computers' },
    { date: '2024-01-02', value: 140, tag: 'computers' },
    { date: '2024-01-02', value: 15, tag: 'computers' },
    { date: '2024-01-02', value: 123, tag: 'computers' },
    { date: '2024-01-03', value: 130, tag: 'audio' },
    { date: '2024-01-04', value: 200, tag: 'accessories' },
  ],
  responseRate: [
    { date: '2024-01-01', value: 75, tag: 'electronics' },
    { date: '2024-01-01', value: 120, tag: 'electronics' },
    { date: '2024-01-02', value: 100, tag: 'computers' },
    { date: '2024-01-03', value: 85, tag: 'electronics' },
    { date: '2024-01-04', value: 140, tag: 'computers' },
    { date: '2024-01-02', value: 80, tag: 'computers' },
    { date: '2024-01-03', value: 70, tag: 'audio' },
    { date: '2024-01-04', value: 85, tag: 'accessories' },
  ],
  averageResponseTime: [
    { date: '2024-01-01', value: 2.5, tag: 'electronics' },
    { date: '2024-01-02', value: 3.0, tag: 'computers' },
    { date: '2024-01-02', value: 4.0, tag: 'computers' },
    { date: '2024-01-02', value: 1.1, tag: 'computers' },
    { date: '2024-01-02', value: 2.4, tag: 'computers' },
    { date: '2024-01-03', value: 2.2, tag: 'audio' },
    { date: '2024-01-04', value: 2.8, tag: 'accessories' },
  ],
  popularTimes: [
    { time: 'Morning', value: 410 },
    { time: 'Afternoon', value: 230 },
    { time: 'Evening', value: 270 },
    { time: 'Night', value: 140 },
  ],
};

const sortOptions = [
  { value: 'date', label: 'Date' },
  { value: 'value', label: 'Engagement Level' },
];

const chartTypes = [
  { value: 'line', label: 'Line' },
  { value: 'bar', label: 'Bar' },
  { value: 'pie', label: 'Pie' },
];

function Analytics() {
  const [selectedTag, setSelectedTag] = useState('All');
  const [chartType, setChartType] = useState('line');
  const [tabIndex, setTabIndex] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  const calculateTagEngagement = () => {
    const tagEngagement = {};

    Object.values(engagementData).forEach((metric) => {
      metric.forEach(({ tag, value }) => {
        if(tag){

        if (!tagEngagement[tag]) {
          tagEngagement[tag] = 0;
        }
        tagEngagement[tag] += value;
      }
      });
    });

    return Object.entries(tagEngagement)
      .sort(([, a], [, b]) => a - b) // Sort by total engagement in ascending audio
      .map(([tag, totalEngagement]) => ({ tag, totalEngagement }));
  };

  const sortedTagEngagementData = calculateTagEngagement();

  const filterByTag = (data) =>
    selectedTag === 'All'
      ? data
      : data.filter((item) => item.tag === selectedTag);

  const chartDataMessagesSent = filterByTag(engagementData.messagesSent).map(
    (item) => ({
      label: item.date,
      value: item.value,
    })
  );

  const chartDataResponseRate = filterByTag(engagementData.responseRate).map(
    (item) => ({
      label: item.date,
      value: item.value,
    })
  );

  const chartDataAverageResponseTime = filterByTag(
    engagementData.averageResponseTime
  ).map((item) => ({
    label: item.date,
    value: item.value,
  }));

  const chartDataPopularTimes = engagementData.popularTimes.map((item) => ({
    label: item.time,
    value: item.value,
  }));

  const chartDataTagsSortedByEngagement = sortedTagEngagementData.map((item) => ({
    label: item.tag,
    value: item.totalEngagement,
  }));

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
      <Box sx={{ width: '100%', maxWidth: '1200px' }}>
        <Typography variant="h4" gutterBottom>
          Customer Engagement Analytics
        </Typography>

        <Tabs value={tabIndex} onChange={handleTabChange} sx={{ marginBottom: 3 }}>
          <Tab label="Engagement Overview" />
          <Tab label="Tags Sorted by Engagement" />
        </Tabs>

        {tabIndex === 0 && (
          <Box>
            <Box
              sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}
            >
              <TextField
                select
                label="Filter by Tag"
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                sx={{ width: '30%' }}
              >
                {['All', ...sortedTagEngagementData.map((item) => item.tag)].map((tag) => (
                  <MenuItem key={tag} value={tag}>
                    {tag}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                select
                label="Chart Type"
                value={chartType}
                onChange={(e) => setChartType(e.target.value)}
                sx={{ width: '30%' }}
              >
                {chartTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </TextField>
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <AnalyticsChart
                  data={chartDataMessagesSent}
                  type={chartType}
                  title="Messages Sent Over Time"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <AnalyticsChart
                  data={chartDataResponseRate}
                  type={chartType}
                  title="Response Rate Over Time"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <AnalyticsChart
                  data={chartDataAverageResponseTime}
                  type={chartType}
                  title="Average Response Time"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <AnalyticsChart
                  data={chartDataPopularTimes}
                  type={chartType}
                  title="Popular Engagement Times"
                />
              </Grid>
            </Grid>
          </Box>
        )}

        {tabIndex === 1 && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '500px', // Increased minHeight for larger chart area
            }}
          >
            <Grid container justifyContent="center">
              <Grid item xs={12} sm={10} md={8}>
                <AnalyticsChart
                  data={chartDataTagsSortedByEngagement}
                  type="bar"
                  title="Tags Sorted by Total Engagement"
                />
              </Grid>
            </Grid>
          </Box>
        )}
      </Box>
    </Box>
  );
}


export default Analytics;
