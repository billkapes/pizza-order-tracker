import React from 'react';
import {
  BarChart, Bar,
  LineChart, Line,
  XAxis, YAxis, Tooltip,
  CartesianGrid, ResponsiveContainer
} from 'recharts';

function ChartView({ completedOrders, chartView }) {
  const chartData = completedOrders.map(order => ({
    id: order.id,
    durationMinutes: parseFloat(((order.timeOut - order.timeIn) / 1000 / 60).toFixed(2))
  }));

  return (
    <>
      <h3>Order Completion Times (Minutes)</h3>
      <ResponsiveContainer width="100%" height={300}>
        {chartView === 'bar' ? (
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="id" label={{ value: "Order ID", position: "insideBottom", offset: -5 }} />
            <YAxis
              label={{ value: "Time (minutes)", angle: -90, position: "insideLeft" }}
              tickFormatter={(v) => parseFloat(v).toFixed(1)}
            />
            <Tooltip formatter={(value) => `${parseFloat(value).toFixed(2)} min`} />
            <Bar dataKey="durationMinutes" fill="#82ca9d" />
          </BarChart>
        ) : (
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="id" label={{ value: "Order ID", position: "insideBottom", offset: -5 }} />
            <YAxis
              label={{ value: "Time (minutes)", angle: -90, position: "insideLeft" }}
              tickFormatter={(v) => parseFloat(v).toFixed(1)}
            />
            <Tooltip formatter={(value) => `${parseFloat(value).toFixed(2)} min`} />
            <Line type="monotone" dataKey="durationMinutes" stroke="#8884d8" strokeWidth={2} />
          </LineChart>
        )}
      </ResponsiveContainer>
    </>
  );
}

export default React.memo(ChartView, (prevProps, nextProps) => {
  // Only re-render if completedOrders or chartView actually changed
  return (
    prevProps.chartView === nextProps.chartView &&
    JSON.stringify(prevProps.completedOrders) === JSON.stringify(nextProps.completedOrders)
  );
});
