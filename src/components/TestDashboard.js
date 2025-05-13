import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import LanguageBreakdown from './LanguageBreakdown';

// Set the app element for accessibility
Modal.setAppElement('#root');

function TestResultsDashboard({ summary, allBreakdowns, loading }) {
  const {
    runId = '—',
    total = 0,
    passed = 0,
    failed = 0,
    duration = '—',
    servicesTested = '—',
  } = summary || {};

  const passRate = total > 0 ? ((passed / total) * 100).toFixed(2) : '0.00';

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [failInfo, setFailInfo] = useState([]); // Stores the fail information from API
  const [failLoading, setFailLoading] = useState(false);

  const handleModalToggle = async () => {
    const url = `https://dtpuya01xb.execute-api.us-east-1.amazonaws.com/prod/myresource?runId=${runId}`;
    const res = await fetch(url);

    if (!res.ok) {
      throw new Error('Failed to fetch fail information');
    }

    const outerJson = await res.json();
    console.log('outerJson:', outerJson); // Log the JSON response to inspect its structure

    // Set the fail information in state
    setFailInfo(outerJson); // Store the JSON data returned from the API in the failInfo state

    setIsModalOpen(!isModalOpen); // Toggle the modal open/close state
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-12 h-12 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
      {/* Test Summary */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800 flex items-center">
          📊 Test Summary
        </h2>
        <div className="grid gap-4 text-gray-700 text-lg">
          <div className="flex justify-between">
            <span>🆔 <strong>Run Id: </strong></span>
            <span>{runId}</span>
          </div>
          <div className="flex justify-between">
            <span>🔧 <strong>Total Tests: </strong></span>
            <span>{total}</span>
          </div>
          <div className="flex justify-between">
            <span>🟢 <strong>Passed: </strong></span>
            <span>{passed}</span>
          </div>
          <div className="flex justify-between">
            <span>🔴 <strong>Failed: </strong></span>
            <span>{failed}</span>
          </div>
          <div className="flex justify-between">
            <span>📈 <strong>Pass Rate: </strong></span>
            <span>{passRate}%</span>
          </div>
          <div className="flex justify-between">
            <span>⏱️ <strong>Execution Time: </strong></span>
            <span>{duration}</span>
          </div>
          <button
            onClick={handleModalToggle}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg"
          >
            View Fail Information
          </button>
        </div>
      </div>

      {/* Language Breakdown */}
      <LanguageBreakdown allBreakdowns={allBreakdowns} />

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={handleModalToggle}
        contentLabel="Fail Information"
        className="fixed top-1/4 left-1/2 transform -translate-x-1/2 bg-white rounded-xl p-6 w-11/12 max-w-2xl shadow-lg outline-none"
        overlayClassName="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
      >
        <div>
          <h3 className="text-xl font-semibold mb-4 text-gray-800">Fail Information</h3>

          {failLoading ? (
            <div className="text-center text-gray-600">Loading fail data...</div>
          ) : failInfo.length === 0 ? (
            <div className="text-gray-600">No fail information available.</div>
          ) : (
            <div className="space-y-4">
              {failInfo.map((item, index) => (
                <div key={index} className="border p-4 rounded-lg bg-gray-50">
                  <h4 className="font-semibold text-lg text-gray-800">{item.serviceName}</h4>
                  <p className="text-sm text-red-600">{item.errorSummary}</p>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={handleModalToggle}
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg"
          >
            Close
          </button>
        </div>
      </Modal>
    </div>
  );
}

export default function App() {
  const [selectedLang, setSelectedLang] = useState('Java');
  const [summaryData, setSummaryData] = useState({});
  const [allBreakdowns, setAllBreakdowns] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchSummary = async (lang) => {
    setLoading(true);
    setSummaryData({});
    setAllBreakdowns([]);

    try {
      const url = `https://4mjmf7v6c2.execute-api.us-east-1.amazonaws.com/Weathertopstage/mydata?lang=${lang}`;
      const res = await fetch(url);

      if (!res.ok) {
        throw new Error('API request failed');
      }

      const outerJson = await res.json(); // First parse
      console.log('🌐 Outer JSON:', outerJson);

      const innerJson = JSON.parse(outerJson.body); // Second parse
      console.log('✅ Parsed Summary Data:', innerJson);

      const runId = innerJson?.RunId || '—';
      const passed = Number(innerJson?.TotalPassed ?? 0);
      const failed = Number(innerJson?.TotalFailed ?? 0);
      const total = passed + failed;
      const duration = innerJson?.TotalTime || '—';
      const servicesTested = innerJson?.ServicesTested || '—';

      const calculatedPassRate = total > 0 ? ((passed / total) * 100).toFixed(2) : '0.00';

      setSummaryData({
        runId,
        total,
        passed,
        failed,
        duration,
        servicesTested,
        passRate: `${calculatedPassRate}%`,
      });

      setAllBreakdowns([{
        name: lang,
        total,
        passRate: `${calculatedPassRate}%`,
      }]);
    } catch (err) {
      console.error('❌ Error parsing summary data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary(selectedLang);
  }, [selectedLang]);

  const handleChange = (e) => {
    setSelectedLang(e.target.value);
  };

  return (
    <div className="p-6">
      <div className="mb-4">
        <label htmlFor="language-select" className="text-lg font-medium text-gray-700 mr-2">
          Select Language:
        </label>
        <select
          id="language-select"
          value={selectedLang}
          onChange={handleChange}
          className="border border-gray-300 rounded-lg p-2"
        >
          <option value="Java">Java</option>
          <option value="Kotlin">Kotlin</option>
          <option value="DotNetv4">DotNetv4</option>
        </select>
      </div>

      <TestResultsDashboard
        summary={summaryData}
        allBreakdowns={allBreakdowns}
        loading={loading}
      />
    </div>
  );
}