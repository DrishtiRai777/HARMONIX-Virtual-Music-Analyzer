import { useContext, useEffect, useState } from 'react';
import { MusicDataContext } from '../context/MusicDataContext';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Label, CartesianGrid } from 'recharts';

// Function to smooth the energy curve -- moving average
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
    
    // Calculate the average and add 
    smoothedData.push({ ...data[i], energy: sum / count });
  }

  return smoothedData;
};

const StaticEnergyCurve = () => {
  const { chunkData, analyzeChunk } = useContext(MusicDataContext);
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

  // Smooth the energy curve 
  energyCurveData = smoothData(energyCurveData, 3); 

  return (
    <>
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
      <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>Energy Curve (Static)</h2>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={energyCurveData} margin={{ top: 20, right: 20, left: 20, bottom: 40 }}>
          {/* <CartesianGrid strokeDasharray="3 3" className='bg-slate-400' /> */}
          <XAxis dataKey="time" tick={{ fill: 'white' }}>
            <Label value="Time (s)" position="insideBottom" offset={-15} style={{fill: 'white' }} />
          </XAxis>

          <YAxis domain={[0, 'auto']} tick={{ fill: 'white' }}>
            <Label value="Energy" angle={-90} position="insideLeft" style={{ textAnchor: 'middle', fill: 'white' }} />
          </YAxis>

          <Tooltip
            formatter={(value) => value.toFixed(3)}
            labelFormatter={(label) => `Time: ${label.toFixed(2)}s`}
          />

          <Line
            type="monotone"
            dataKey="energy"
            stroke="#00FFFF"
            dot={false}
            strokeWidth={1.5}
            isAnimationActive={true}
            animationDuration={600}
          />
        </LineChart>
      </ResponsiveContainer>   
    </div>

        <div className="">
            <p className='text-xs text-gray-300'><strong>*Dynamic Energy Curve:</strong> The dynamic energy curve shows how the perceived loudness of the audio changes over time. It provides a flowing, real-time visualization of the track’s energy, highlighting peaks and dips that reflect emotional or rhythmic shifts in the music..</p> <br />
            <p className='text-xs text-gray-300'><strong>*Static Energy Curve:</strong> The static energy curve presents an overall profile of the song’s energy levels throughout its duration. It summarizes the distribution of energy, making it easy to identify sections with high or low intensity, such as drops, build-ups, or quiet moments.</p>
        </div>
    </>
  );
};

export default StaticEnergyCurve;
