import React, { useEffect, useState } from 'react';
import '../styles/LanguageBreakdown.css';

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
        console.error('❌ Error loading breakdowns:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBreakdowns();
  }, []);

  if (loading) return <p>Loading breakdowns...</p>;

  return (
    <div className="breakdown-wrapper">
      <h2 className="section-title">🧪 Test Coverage by Language</h2>
      <div className="breakdown-container">
        {data.map((item) => (
          <div className="card" key={item.name}>
            <h3>{item.name}</h3>
            <p>{item.total} tests</p>
            <p className="label">Pass Rate</p>
            <p className="rate">{item.passRate}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LanguageBreakdown;









