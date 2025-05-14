import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import LanguageBreakdown from './LanguageBreakdown';
import '../styles/styles.css';

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
  const [failInfo, setFailInfo] = useState([]);
  const [failLoading, setFailLoading] = useState(false);

  const handleModalToggle = async () => {
    try {
      if (!runId) throw new Error('runId is not set.');

      const response = await fetch(`/test-runs/${runId}.json`);
      if (!response.ok) throw new Error(`Failed to fetch file: ${response.statusText}`);

      setFailLoading(true);
      const data = await response.json();
      const tests = data?.results?.tests ?? [];
      const failedTests = tests.filter((t) => t.status === 'failed');

      setFailInfo(
        failedTests.map((test) => ({
          name: test.name,
          message: test.message,
          log: test.log,
        }))
      );

      setFailLoading(false);
      setIsModalOpen(true);
    } catch (err) {
      console.error('Error loading test data:', err);
      setFailInfo([]);
      setFailLoading(false);
      setIsModalOpen(true);
    }
  };

  const handleModalClose = () => setIsModalOpen(false);

  useEffect(() => {
    if (failInfo.length === 0 && failLoading) {
      setIsModalOpen(false);
    }
  }, [failInfo, failLoading]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-12 h-12 border-4 border-blue-500 border-dashed rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800 flex items-center">
          📊 Test Summary Per Selected SDK
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

      <LanguageBreakdown allBreakdowns={allBreakdowns} />

      <Modal
        isOpen={isModalOpen}
        onRequestClose={handleModalClose}
        contentLabel="Fail Information"
        shouldCloseOnOverlayClick={false}
        shouldCloseOnEsc={false}
        className="custom-modal"
        overlayClassName="custom-overlay"
      >
        <div className="modal-body">
          <h3 className="modal-title">Fail Information</h3>

          {failLoading ? (
            <div className="modal-message">Loading fail data...</div>
          ) : failInfo.length === 0 ? (
            <div className="modal-message">No fail information available.</div>
          ) : (
            <div className="fail-info-list">
              {failInfo.map((item, index) => (
                <div key={index} className="fail-info-row">
                  <h4 className="fail-info-title">🔧 {item.name}</h4>
                  <p className="fail-info-message">
                    <strong>AWS Service:</strong> {item.message}
                  </p>
                  {item.log && (
                    <pre className="fail-info-log">{item.log}</pre>
                  )}
                </div>
              ))}
            </div>
          )}

          <button onClick={handleModalClose} className="modal-close-button">
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
      const prefixMap = {
        Java: 'java-',
        JavaScript: 'javascript-',
        Kotlin: 'kotlin-',
        DotNetv4: 'dotnetv4-',
        PHP: 'php-',
      };

      const prefix = prefixMap[lang];
      if (!prefix) throw new Error(`Unknown language: ${lang}`);

      const indexRes = await fetch('/test-runs/index.json');
      if (!indexRes.ok) throw new Error('Failed to load index.json');

      const files = await indexRes.json();
      if (!Array.isArray(files)) throw new Error('Invalid format in index.json — expected an array');

      const langFiles = files
        .filter((file) => file.startsWith(prefix) && file.endsWith('.json'))
        .sort()
        .reverse();

      if (langFiles.length === 0) throw new Error(`No matching files found for language: ${lang}`);

      const latestFile = langFiles[0];
      const res = await fetch(`/test-runs/${latestFile}`);
      if (!res.ok) throw new Error(`Failed to load summary file: ${latestFile}`);

      const jsonData = await res.json();
      const summary = jsonData?.results?.summary;
      if (!summary) throw new Error('Summary data not found in JSON');

      const tests = Number(summary.tests ?? 0);
      const passed = Number(summary.passed ?? 0);
      const failed = Number(summary.failed ?? 0);

      if (tests !== passed + failed) {
        console.warn(`⚠️ Sanity check: tests (${tests}) ≠ passed (${passed}) + failed (${failed})`);
      }

      const total = tests;
      const passRate = total > 0 ? ((passed / total) * 100).toFixed(2) : '0.00';
      const startTime = summary.start_time ?? 0;
      const stopTime = summary.stop_time ?? 0;
      const durationMs = stopTime - startTime;
      const hours = Math.floor(durationMs / (1000 * 60 * 60));
      const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
      const duration = `${hours} hours ${minutes} minutes`;
      const runId = latestFile.replace(/\.json$/, '');

      setSummaryData({
        runId,
        total,
        passed,
        failed,
        duration,
        servicesTested: jsonData?.ServicesTested || '—',
        passRate: `${passRate}%`,
      });

      setAllBreakdowns([{ name: lang, total, passRate: `${passRate}%` }]);
    } catch (err) {
      console.error('❌ Error loading summary data:', err);
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
          <option value="JavaScript">JavaScript</option>
          <option value="Kotlin">Kotlin</option>
          <option value="DotNetv4">DotNetv4</option>
          <option value="PHP">PHP</option>
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
