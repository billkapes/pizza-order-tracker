import React, { useState, useEffect } from 'react';
import './App.css';
import ChartView from './ChartView';


const loadFromLocalStorage = (key) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const saveToLocalStorage = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

function formatDuration(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  let result = '';
  if (hours > 0) result += `${hours}h `;
  if (minutes > 0 || hours > 0) result += `${minutes}m `;
  result += `${seconds}s`;

  return result.trim();
}

function getMedianDuration(durations) {
  if (durations.length === 0) return 0;

  const sorted = [...durations].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }

  return sorted[mid];
}


function App() {
  const [orderId, setOrderId] = useState('');
  const [activeOrders, setActiveOrders] = useState(() => loadFromLocalStorage('activeOrders'));
  const [completedOrders, setCompletedOrders] = useState(() => loadFromLocalStorage('completedOrders'));
  const [now, setNow] = useState(Date.now());
  const [chartView, setChartView] = useState('bar'); // or 'line'


  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000); // updates every second

    return () => clearInterval(interval); // clean up on unmount
  }, []);


  // Save activeOrders to localStorage
  useEffect(() => {
    saveToLocalStorage('activeOrders', activeOrders);
  }, [activeOrders]);

  // Save completedOrders to localStorage
  useEffect(() => {
    saveToLocalStorage('completedOrders', completedOrders);
  }, [completedOrders]);



  const addOrder = () => {
    if (!orderId.trim()) return;

    const newOrder = {
      id: orderId.trim(),
      timeIn: Date.now(),
    };
    setActiveOrders([...activeOrders, newOrder]);
    setOrderId('');
  };

  const completeOrder = (id) => {
    const order = activeOrders.find(o => o.id === id);
    const timeOut = Date.now();
    setActiveOrders(activeOrders.filter(o => o.id !== id));
    setCompletedOrders([
      ...completedOrders,
      { ...order, timeOut }
    ]);
  };

  const averageTime = () => {
    if (completedOrders.length === 0) return 0;
    const total = completedOrders.reduce((sum, o) => sum + (o.timeOut - o.timeIn), 0);
    return total / completedOrders.length;
  };

  const medianTime = () => {
    const durations = completedOrders.map(o => o.timeOut - o.timeIn);
    return getMedianDuration(durations);
  };

  const fastestOrder = () => {
    if (completedOrders.length === 0) return null;
    return completedOrders.reduce((fastest, current) =>
      (current.timeOut - current.timeIn) < (fastest.timeOut - fastest.timeIn) ? current : fastest
    );
  };

  const slowestOrder = () => {
    if (completedOrders.length === 0) return null;
    return completedOrders.reduce((slowest, current) =>
      (current.timeOut - current.timeIn) > (slowest.timeOut - slowest.timeIn) ? current : slowest
    );
  };






  return (
    <div className="App">
      <h1>Pizza Order Tracker</h1>

      <div className="input-section">
        <input
          type="text"
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          placeholder="Order Number"
        />
        <button onClick={addOrder}>Add Order</button>
      </div>

      <h2>Active Orders</h2>
      <ul>
        {activeOrders.map(order => (
          <li key={order.id}>
            #{order.id} — {formatDuration(now - order.timeIn)} ago
            <button onClick={() => completeOrder(order.id)}>Complete</button>
          </li>
        ))}
      </ul>

      <h2>Stats</h2>
      <p>Completed Orders: {completedOrders.length}</p>
      <p>Average Time: {formatDuration(averageTime())}</p>
      <p>Median Time: {formatDuration(medianTime())}</p>

      {fastestOrder() && (
        <p>Fastest Order: #{fastestOrder().id} — {formatDuration(fastestOrder().timeOut - fastestOrder().timeIn)}</p>
      )}

      {slowestOrder() && (
        <p>Slowest Order: #{slowestOrder().id} — {formatDuration(slowestOrder().timeOut - slowestOrder().timeIn)}</p>
      )}

      <h3>Completed Orders</h3>
      <ul>
        {completedOrders.map(order => {
          const duration = formatDuration(order.timeOut - order.timeIn);
          const completedAt = new Date(order.timeOut).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          });

          return (
            <li key={order.id} className="completed">
              #{order.id} — Completed in {duration} at {completedAt}
            </li>
          );
        })}
      </ul>



      <h3>Order Completion Times (Minutes)</h3>
      <button onClick={() => setChartView(chartView === 'bar' ? 'line' : 'bar')}>
        Show {chartView === 'bar' ? 'Line' : 'Bar'} Chart
      </button>

      <ChartView completedOrders={completedOrders} chartView={chartView} />


      <button onClick={() => {
        setActiveOrders([]);
        setCompletedOrders([]);
        localStorage.clear();
      }}>Clear All</button>

    </div>
  );
}

export default App;
