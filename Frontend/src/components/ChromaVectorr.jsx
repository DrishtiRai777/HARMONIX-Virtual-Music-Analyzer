import { useContext, useEffect, useState } from 'react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, Tooltip, ResponsiveContainer
} from 'recharts';
import { MusicDataContext } from '../context/MusicDataContext';

const ChromaVectorr = () => {
  const { chunkData, analyzeChunk } = useContext(MusicDataContext);
  const [chromaVectorReady, setChromaVectorReady] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      if (chunkData && chunkData[analyzeChunk - 1]?.chroma_vector) {
        setChromaVectorReady(true);
        clearInterval(interval);
      }
    }, 500);
    return () => clearInterval(interval);
  }, [analyzeChunk, chunkData]);

  const chromaData = (chromaVectorArray) => {
    const data = [];
    const noteLabels = ['C', 'C#', 'D', 'D#', 'E', 'F',
      'F#', 'G', 'G#', 'A', 'A#', 'B'];

    for (let i = 0; i < 12; i++) {
      const notes = noteLabels[i];
      const intensity = chromaVectorArray[i];
      data.push({ notes, intensity });
    }

    return data;
  };

  if (!chromaVectorReady) return null;
  const chromaVectorArray = chunkData[analyzeChunk - 1]?.chroma_vector;
  if (!chromaVectorArray || chromaVectorArray.length === 0) return null;

  const chromaVectorData = chromaData(chromaVectorArray);

  // Get top 3 notes
  const sorted = [...chromaVectorData].sort((a, b) => b.intensity - a.intensity);
  const top3 = sorted.slice(0, 3);
  const top3Notes = top3.map(n => n.notes);
  const colors = ['#ff0000', '#00cc00', '#ffa500']; // red, green, orange

  return (
    <div>
    <h2 className="text-center text-white mb-4 font-bold text-xl">Chroma Vector Visualization</h2>

    <ResponsiveContainer width="100%" height={300}>
        <RadarChart data={chromaVectorData}>
            <PolarGrid />
            
            {/* Axis for notes */}
            <PolarAngleAxis
                dataKey="notes"
                tick={({ payload, x, y, textAnchor }) => {
                    const topIndex = top3Notes.indexOf(payload.value);
                    const fillColor = topIndex !== -1 ? colors[topIndex] : '#fff'; // Change to white for normal
                    return (
                        <text
                            x={x}
                            y={y}
                            textAnchor={textAnchor}
                            fill={fillColor}
                            fontWeight={topIndex !== -1 ? 'bold' : 'normal'}
                            fontSize={14}
                        >
                            {payload.value}
                        </text>
                    );
                }}
            />

            <PolarRadiusAxis domain={[0, 1]} />

            {/* Radar */}
            <Radar
                name="Chroma Vector"
                dataKey="intensity"
                stroke="#ff7f50"
                fill="#ff7f50"
                fillOpacity={0.6}
                isAnimationActive={true}
                animationDuration={600}
                animationEasing="ease-in-out"
            />

           
            <Tooltip
                formatter={(value) => value.toFixed(3)}
                labelFormatter={(label) => `Note: ${label}`}
            />
        </RadarChart>
    </ResponsiveContainer>


    <p className="text-center text-sm text-white mt-4">
        <strong>Strongest Notes: </strong> 
        <span style={{ color: 'red', font: 'bold' }}>Red</span> indicates the strongest note, 
        followed by <span style={{ color: 'green', font: 'bold' }}>Green</span>, and then 
        <span style={{ color: 'yellow', font: 'bold' }}> Orange</span>.
    </p>
</div>

  );
};

export default ChromaVectorr;