import {useContext, useEffect, useState} from 'react'
import { MusicDataContext } from '../context/MusicDataContext'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Label } from 'recharts'

const StaticWaveform = () => {
    const { chunkData, analyzeChunk } = useContext(MusicDataContext);
    const [waveformReady, setWaveformReady] = useState(false);

    // Check if data is there or not...
    useEffect(() => {
        const interval = setInterval(() => {
            if(chunkData && chunkData[analyzeChunk-1]?.waveform) {
                setWaveformReady(true);
                clearInterval(interval);
            }
        }, 500);

        return () => clearInterval(interval); 
    }, [analyzeChunk, chunkData]);

    // Downsample waveform...
    const downsample = (waveform, targetPoints = 1000, durationInSec = 20) => {
        const downsampled = [];
        const blockSize = Math.floor(waveform.length/targetPoints);
        const timePerBlock = durationInSec/targetPoints;

        for(let i=0; i<targetPoints; i++) {
            const start = i * blockSize;
            const end = start + blockSize;
            const block = waveform.slice(start, end);
            const avg = block.reduce((sum, val) => sum + Math.abs(val), 0)/block.length;

            let time = i*timePerBlock;
            if(i == targetPoints-1) {
                time = durationInSec;
            }

            downsampled.push({time, amplitude:avg});
        }
        return downsampled;
    };

    if(!waveformReady) return;
    const waveformArray = chunkData[analyzeChunk-1]?.waveform;
    if(!waveformArray || waveformArray.length === 0) return;
    const waveformData = downsample(waveformArray);

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
            <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>Audio Waveform</h2>

            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={waveformData} margin={{ top: 20, right: 20, left: 20, bottom: 40 }}>
                    <XAxis dataKey="time" tick={{ fill: 'white' }}>
                        <Label value="Time(s)" position="insideBottom" offset={-15} style={{fill: 'white' }} ></Label>
                    </XAxis>
                    
                    <YAxis domain={[0, 1]} tick={{ fill: 'white' }}>
                        <Label value="Amplitude" angle={-90} position="insideLeft" style={{textAnchor: 'middle', fill: 'white' }}></Label>
                    </YAxis>

                    <Tooltip/>

                    <Line
                        type="monotone"
                        dataKey="amplitude"
                        stroke="#FFA500"
                        dot={false}
                        strokeWidth={1.5}
                        isAnimationActive={true}
                        animationDuration={600}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
        
        <div className="">
            <p className='text-xs text-gray-300'><strong>*Chroma Vector:</strong> The Chroma vector is a powerful audio feature that captures the intensity of each of the 12 musical pitch classes (C, C♯, D, etc.) over time. It is commonly used to analyze harmony, chords, and key, providing a clear view of the melodic and harmonic content of a song.</p> <br />
            <p className='text-xs text-gray-300'><strong>*Static Waveform:</strong> The static waveform is a visual representation of the entire audio signal's amplitude from beginning to end. It offers a snapshot of the song’s loudness and structure, helping users understand where the audio gets louder or softer at a glance.</p>
        </div>
        </>
    )
}

export default StaticWaveform
