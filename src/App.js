import React, { useState, useEffect } from 'react';
import './App.css';
import ChartView from './ChartView';
import ConfirmDialog from './ConfirmDialog';



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
  const [undoInfo, setUndoInfo] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    message: '',
    onConfirm: null
  });




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

  const cancelOrder = (id) => {
    const orderToCancel = activeOrders.find(o => o.id === id);
    if (!orderToCancel) return;

    setActiveOrders(prev => prev.filter(o => o.id !== id));

    const timeoutId = setTimeout(() => setUndoInfo(null), 8000); // 8 sec timeout
    setUndoInfo({ type: 'active', order: orderToCancel, timeoutId });
  };


  const promptRemoveCompletedOrder = (order) => {
    setConfirmDialog({
      isOpen: true,
      message: `Remove completed order #${order.id}?`,
      onConfirm: () => {
        setCompletedOrders(prev =>
          prev.filter(o => o.id !== order.id)
        );
        setConfirmDialog({ isOpen: false, message: '', onConfirm: null });
      }
    });
  };


  const confirmRemove = () => {
    if (confirmDialog.onConfirm) confirmDialog.onConfirm();
  };


  const cancelRemove = () => {
    setConfirmDialog({ isOpen: false, message: '', onConfirm: null });
  };




  const handleUndo = () => {
    if (!undoInfo) return;

    clearTimeout(undoInfo.timeoutId);

    if (undoInfo.type === 'active') {
      setActiveOrders(prev => [...prev, undoInfo.order]);
    } else if (undoInfo.type === 'completed') {
      setCompletedOrders(prev => [...prev, undoInfo.order]);
    }

    setUndoInfo(null);
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

      <section>
        <h2>Active Orders</h2>
        <ul>
          {activeOrders.map(order => (
            <li key={order.id}>
              <div>
                #{order.id} — {formatDuration(now - order.timeIn)} ago
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => completeOrder(order.id)}>Complete</button>
                <button className='cancel' onClick={() => cancelOrder(order.id)} style={{ backgroundColor: '#dc3545' }}>Cancel</button>
              </div>
            </li>
          ))}
        </ul>

      </section>

      <section>
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
      </section>

      <section>
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
                <div>
                  #{order.id} — Completed in {duration} at {completedAt}
                </div>
                <button
                  onClick={() => promptRemoveCompletedOrder(order)}
                  style={{ backgroundColor: '#dc3545', marginTop: '0.3rem' }}
                >
                  Remove
                </button>

              </li>
            );
          })}
        </ul>
      </section>

      <section>
        <button onClick={() => setChartView(chartView === 'bar' ? 'line' : 'bar')}>
          Show {chartView === 'bar' ? 'Line' : 'Bar'} Chart
        </button>

        <ChartView completedOrders={completedOrders} chartView={chartView} />
      </section>

      {/* <button onClick={() => {
        setActiveOrders([]);
        setCompletedOrders([]);
        localStorage.clear();
      }}>Clear All</button> */}

      {completedOrders.length > 0 && (
        <button
          onClick={() =>
            setConfirmDialog({
              isOpen: true,
              message: 'Clear all completed orders?',
              onConfirm: () => {
                setCompletedOrders([]);
                setConfirmDialog({ isOpen: false });
              }
            })
          }
          style={{
            backgroundColor: '#dc3545',
            marginTop: '1rem',
            padding: '0.6rem 1rem',
            fontSize: '1rem',
            borderRadius: '6px',
            border: 'none',
            color: 'white',
            cursor: 'pointer'
          }}
        >
          Clear All Completed Orders
        </button>
      )}


      {undoInfo && (
        <div style={{
          position: 'fixed',
          bottom: '1rem',
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#333',
          color: 'white',
          padding: '1rem',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          zIndex: 1000
        }}>
          <span>Order #{undoInfo.order.id} {undoInfo.type === 'active' ? 'canceled' : 'removed'}.</span>
          <button onClick={handleUndo} style={{
            background: '#28a745',
            border: 'none',
            color: 'white',
            padding: '0.5rem 1rem',
            borderRadius: '5px',
            cursor: 'pointer'
          }}>Undo</button>
        </div>
      )}

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        message={confirmDialog.message}
        onConfirm={confirmRemove}
        onCancel={cancelRemove}
      />



    </div>
  );
}

export default App;
