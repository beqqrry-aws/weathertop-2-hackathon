import React, { useState, useEffect } from 'react';
import TestConfig from './components/TestConfig';
import ExecutionControl from './components/ExecutionControl';
import TestDashboard from './components/TestDashboard';
import './styles/styles.css';

function App() {
  const [status, setStatus] = useState('Idle');
  const [logs, setLogs] = useState([]);
  const [theme, setTheme] = useState('dark'); // Default theme

  const handleRun = () => {
    setStatus('Running');
    setLogs(['Java Passed', 'Python Running']);
  };

  const handleStop = () => {
    setStatus('Stopped');
    setLogs([]);
  };

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Update body class when theme changes
  useEffect(() => {
    document.body.classList.toggle('dark', theme === 'dark');
    document.body.classList.toggle('light', theme === 'light');
  }, [theme]);

  return (
    <div className={`app-container ${theme}`}>
      <h1 className="app-title">Weathertop</h1>
      <h4>
  Weathertop is an integration test platform designed to test AWS Code examples. It ensures that the examples work as intended, helping to raise the quality and reliability of the code examples.
</h4>
      <div className="dashboard">
        <div className="column">
          <TestDashboard status={status} logs={logs} />
        </div>
      </div>
    </div>
  );
}

export default App;

