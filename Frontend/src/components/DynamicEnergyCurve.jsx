import { useContext, useEffect, useState } from 'react';
import { MusicDataContext } from '../context/MusicDataContext';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Label, CartesianGrid } from 'recharts';


const smoothData = (data, windowSize = 5) => {
  const smoothedData = [];
  
  for (let i = 0; i < data.length; i++) {
    let sum = 0;
    let count = 0;

    
    for (let j = i - Math.floor(windowSize / 2); j <= i + Math.floor(windowSize / 2); j++) {
      if (j >= 0 && j < data.length) {
        sum += data[j].energy;
        count++;
      }
    }
    
    smoothedData.push({ ...data[i], energy: sum / count });
  }

  return smoothedData;
};

const DynamicEnergyCurve = () => {
  const { chunkData, analyzeChunk, currentTime } = useContext(MusicDataContext);
  const [energyCurveReady, setEnergyCurveReady] = useState(false);

  // Check if data is there...
  useEffect(() => {
    const interval = setInterval(() => {
      if (chunkData && chunkData[analyzeChunk - 1]?.energy_curve) {
        setEnergyCurveReady(true);
        clearInterval(interval);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [analyzeChunk, chunkData]);

  const getEnergyData = (energyCurveArray) => {
  const data = [];
  const chunkDuration = 20;
  const dataPoints = energyCurveArray.length;
  const timePerDataPoint = chunkDuration / dataPoints;

  for (let i = 0; i < dataPoints; i++) {
    let time = parseFloat((i * timePerDataPoint).toFixed(2));
    if (i === dataPoints - 1) time = parseFloat(chunkDuration.toFixed(2));

    data.push({ time, energy: energyCurveArray[i] });
  }

  return data;
};


  if (!energyCurveReady) return null;
  const energyCurveArray = chunkData[analyzeChunk - 1]?.energy_curve;
  if (!energyCurveArray || energyCurveArray.length === 0) return null;
  let energyCurveData = getEnergyData(energyCurveArray);

  energyCurveData = smoothData(energyCurveData, 3);

    // Syncing current time and chunk time
    const chunkStartTime = (analyzeChunk - 1)*20;
    const currProgress = Math.min(Math.max(currentTime - chunkStartTime, 0), 20);
    const progressLineData = energyCurveData.filter(point => point.time <= currProgress);

  return (
    <div
      style={{
          maxWidth: '900px',
          margin: '3rem auto',
          padding: '1.5rem',
          borderRadius: '8px',
          backgroundColor: '#1c1c1c',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          color: 'white',
          marginBottom: '4rem',
      }}
    >
      <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>Energy Curve (Dynamic)</h2>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={energyCurveData} margin={{ top: 20, right: 20, left: 20, bottom: 40 }}>
          {/* <CartesianGrid strokeDasharray="3 3" /> */}
          <XAxis dataKey="time" tick={{ fill: 'white' }}>
            <Label value="Time (s)" position="insideBottom"
            style={{fill: 'white' }} offset={-15} />
          </XAxis>

          <YAxis domain={[0, 'auto']} tick={{ fill: 'white' }}>
            <Label value="Energy" angle={-90} position="insideLeft" style={{ textAnchor: 'middle', fill:'white' }}  />
          </YAxis>

          <Tooltip
            formatter={(value) => value.toFixed(3)}
            labelFormatter={(label) => `Time: ${label.toFixed(2)}s`}
          />

          <Line
            type="monotone"
            dataKey="energy"
            stroke="#FF0000"
            dot={false}
            strokeWidth={1.5}
            isAnimationActive={false}
            data={progressLineData}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DynamicEnergyCurve;
