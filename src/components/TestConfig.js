import React from 'react';

function TestConfig() {
  return (
    <div className="card">
      <h2>Test Configuration</h2>

      <label>GitHub Repository</label>
      <select>
        <option>example-repo</option>
      </select>

      <label>Branch</label>
      <select>
        <option>main</option>
      </select>

      <label>Language-Specific Tests</label>
      <div className="checkbox-group">
        <label><input type="checkbox" defaultChecked /> Java</label>
        <label><input type="checkbox" /> C#</label>
        <label><input type="checkbox" defaultChecked /> Python</label>
      </div>

      <label>Timeout (seconds)</label>
      <input type="number" defaultValue={60} />

      <label>Parallel Execution</label>
      <input type="number" defaultValue={2} />
    </div>
  );
}

export default TestConfig;
