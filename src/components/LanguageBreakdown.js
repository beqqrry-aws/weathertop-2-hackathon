import React, { useEffect, useState } from 'react';
import '../styles/LanguageBreakdown.css';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

const getLanguagesFromFiles = (files) => {
  const langs = new Set();
  for (const file of files) {
    const match = file.match(/^([^-]+)-/); // Extract "php" from "php-2025-05-12T12-15.json"
    if (match) {
      langs.add(match[1]);
    }
  }
  return Array.from(langs);
};

const LanguageBreakdown = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLang, setSelectedLang] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchBreakdowns = async () => {
      try {
        const res = await fetch('/test-runs/index.json');
        const files = await res.json();
        const languages = getLanguagesFromFiles(files);

        const latestFiles = {};
        for (const lang of languages) {
          const langFiles = files.filter((file) => file.startsWith(`${lang}-`));
          if (!langFiles.length) continue;
          langFiles.sort((a, b) => b.localeCompare(a)); // Descending
          latestFiles[lang] = langFiles[0];
        }

        const breakdowns = [];
        for (const lang of Object.keys(latestFiles)) {
          const file = latestFiles[lang];
          const response = await fetch(`/test-runs/${file}`);
          const json = await response.json();
          const summary = json?.results?.summary;

          const tests = Number(summary?.tests ?? 0);
          const passed = Number(summary?.passed ?? 0);
          const passRate = tests > 0 ? ((passed / tests) * 100).toFixed(2) : '0.00';

          breakdowns.push({
            name: lang,
            total: tests,
            passRate: `${passRate}%`,
          });
        }

        setData(breakdowns);
      } catch (err) {
        console.error('❌ Error loading breakdown data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBreakdowns();
  }, []);

  const handleCardClick = (lang) => {
    if (lang === 'java') {
      setSelectedLang(lang);
      setShowModal(true);
    }
  };

  const barData = [
    { day: 'Test Run 1', passRate: 98 },
    { day: 'Test Run 2', passRate: 96 },
    { day: 'Test Run 3', passRate: 94 },
  ];

  if (loading) return <p>Loading breakdowns...</p>;

  return (
    <div className="breakdown-wrapper">
      <h2 className="section-title">🧪 Test Coverage by Language</h2>
      <h4>Click on a Card to see run rate.</h4>
      <div className="breakdown-container">
        {data.map((item) => (
          <div className="card" key={item.name} onClick={() => handleCardClick(item.name.toLowerCase())}>
            <h3>{item.name}</h3>
            <p>{item.total} tests</p>
            <p className="label">Pass Rate</p>
            <p className="rate">{item.passRate}</p>
          </div>
        ))}
      </div>

      {showModal && selectedLang === 'java' && (
        <div className="bottom-modal">
          <div className="modal-content">
            <button className="close-button" onClick={() => setShowModal(false)}>✖</button>
            <h3>📊 Java - 3 Test Run Pass Rate</h3>
            <ResponsiveContainer width="100%" height={200}>
  <BarChart data={barData}>
    <CartesianGrid stroke="#444" />
    <XAxis dataKey="day" stroke="#ccc" />
    <YAxis unit="%" domain={[0, 100]} stroke="#ccc" />
    <Tooltip 
      contentStyle={{ backgroundColor: '#333', border: 'none', color: '#f0f0f0' }} 
      labelStyle={{ color: '#ccc' }} 
      itemStyle={{ color: '#f0f0f0' }}
    />
    <Bar dataKey="passRate" fill="#4cd964" />
  </BarChart>
</ResponsiveContainer>

          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageBreakdown;










