import React, { useState, useEffect } from 'react';

function LanguageBreakdown() {
  const [breakdowns, setBreakdowns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBreakdowns = async () => {
      try {
        const response = await fetch('https://lbayjr5ma7.execute-api.us-east-1.amazonaws.com/prod/stats');

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const outerJson = await response.json(); // First parse
        console.log('🌐 Outer JSON:', outerJson);

        const innerJson = JSON.parse(outerJson.body); // Second parse
        console.log('✅ Parsed Breakdown Data:', innerJson);

        setBreakdowns(innerJson);
      } catch (error) {
        console.error('Error fetching language breakdown:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBreakdowns();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800 flex items-center">
          🧪 Test Breakdown by Language
        </h2>
        <p className="text-gray-500 italic">Loading...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800 flex items-center">
        🧪 Test Breakdown by Language
      </h2>
      {breakdowns.length > 0 ? (
        <ul className="space-y-3 text-lg text-gray-700">
          {breakdowns.map((lang, idx) => (
            <li key={idx} className="flex justify-between border-b pb-1">
              <span>{lang.Language} </span>
              <span>
                {lang.TotalTests} tests – {lang.PassRate}% pass
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500 italic">No language data available.</p>
      )}
    </div>
  );
}

export default LanguageBreakdown;
