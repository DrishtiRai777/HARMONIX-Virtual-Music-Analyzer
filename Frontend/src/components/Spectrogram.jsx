import { useContext, useEffect, useRef, useState } from 'react';
import { MusicDataContext } from '../context/MusicDataContext';

const Spectrogram = () => {
  const { chunkData, analyzeChunk, currentTime } = useContext(MusicDataContext);
  const spectroCanvas = useRef(null);
  const beatMarkerCanvas = useRef(null);
  const [isSpectrogramReady, setSpectrogramReady] = useState(false);

  const chunkDurationInSeconds = 20;
  const drawWidth = 900;
  const drawHeight = 400;
  const padding = { top: 30, right: 30, bottom: 50, left: 100 };

  // Check if chunkData is available and ready
  useEffect(() => {
    if (chunkData && chunkData[analyzeChunk - 1]?.spectrogram) {
      setSpectrogramReady(true);
    } else {
      setSpectrogramReady(false);
    }
  }, [chunkData, analyzeChunk]);

  // Draw Spectrogram
  useEffect(() => {
    if (!isSpectrogramReady) return;

    const spectroArray = chunkData[analyzeChunk - 1]?.spectrogram;
    if (!spectroArray) return;

    const canvas = spectroCanvas.current;
    const ctx = canvas.getContext('2d');

    const sr = 22050;
    const nFFT = 2048;

    const numFreqs = spectroArray.length;
    const numTimes = spectroArray[0].length;

    const canvasWidth = drawWidth + padding.left + padding.right;
    const canvasHeight = drawHeight + padding.top + padding.bottom;

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Normalize
    let min = Infinity, max = -Infinity;
    for (let i = 0; i < numFreqs; i++) {
      for (let j = 0; j < numTimes; j++) {
        const val = spectroArray[i][j];
        min = Math.min(min, val);
        max = Math.max(max, val);
      }
    }

    const normData = spectroArray.map(row =>
      row.map(val => (val - min) / (max - min || 1))
    );

    // Draw
    const timeStep = drawWidth / numTimes;
    const freqStep = drawHeight / numFreqs;

    for (let f = 0; f < numFreqs; f++) {
      for (let t = 0; t < numTimes; t++) {
        const amp = normData[f][t];
        const hue = 220 - amp * 220;
        ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
        const x = padding.left + t * timeStep;
        const y = padding.top + drawHeight - f * freqStep;
        ctx.fillRect(x, y, timeStep, freqStep);
      }
    }

    // Ticks & Labels
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'white';
    ctx.font = '12px';
    ctx.lineWidth = 1;

    // Time (X-axis)
    const timeTickStep = 2;
    for (let sec = 0; sec <= chunkDurationInSeconds; sec += timeTickStep) {
      const x = padding.left + (sec / chunkDurationInSeconds) * drawWidth;
      ctx.beginPath();
      ctx.moveTo(x, padding.top + drawHeight);
      ctx.lineTo(x, padding.top + drawHeight + 6);
      ctx.stroke();
      ctx.textAlign = 'center';
      ctx.fillText(`${sec}s`, x, padding.top + drawHeight + 20);
    }

    // Frequency (Y-axis)
    const freqPerBin = sr / nFFT;
    const freqTickStep = 2000;

    ctx.textAlign = 'right';
    for (let freq = 0; freq <= sr / 2; freq += freqTickStep) {
      const fIndex = Math.floor(freq / freqPerBin);
      const y = padding.top + drawHeight - fIndex * freqStep;
      if (y >= padding.top && y <= padding.top + drawHeight) {
        ctx.beginPath();
        ctx.moveTo(padding.left - 6, y);
        ctx.lineTo(padding.left, y);
        ctx.stroke();
        ctx.fillText(`${freq}Hz`, padding.left - 10, y + 4);
      }
    }

    // Axis labels
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Time (s)', padding.left + drawWidth / 2, canvasHeight - 10);

    ctx.save();
    ctx.translate(20, padding.top + drawHeight / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Frequency (Hz)', 0, 0);
    ctx.restore();
  }, [chunkData, analyzeChunk, isSpectrogramReady]);

  // Beat Marker Drawing
  useEffect(() => {
    if (!isSpectrogramReady) return;

    const canvas = beatMarkerCanvas.current;
    const ctx = canvas.getContext('2d');

    const currentChunk = chunkData[analyzeChunk - 1];
    if (!currentChunk) return;

    const beatTimes = currentChunk.beat_times || []; // expects beat_times in seconds within the chunk

    const canvasWidth = drawWidth + padding.left + padding.right;
    const canvasHeight = drawHeight + padding.top + padding.bottom;

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    const animate = () => {
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      const chunkStart = (analyzeChunk - 1) * chunkDurationInSeconds;
      const localTime = currentTime - chunkStart;

      beatTimes.forEach((beatTime) => {
        const x = padding.left + (beatTime / chunkDurationInSeconds) * drawWidth;

        ctx.beginPath();
        ctx.moveTo(x, padding.top);
        ctx.lineTo(x, padding.top + drawHeight);
        ctx.strokeStyle = 'lime';
        ctx.setLineDash([4, 4]);
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.setLineDash([]);

        // Pulse effect
        const timeDiff = Math.abs(localTime - beatTime);
        if (timeDiff < 0.15) {
          ctx.beginPath();
          ctx.arc(x, padding.top + drawHeight / 2, 6, 0, 2 * Math.PI);
          ctx.fillStyle = 'red';
          ctx.fill();
        }
      });

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
     
    };
  }, [chunkData, analyzeChunk, currentTime, isSpectrogramReady]);

  if (!isSpectrogramReady) return null;

  return (
    <>
    <div 
      style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center', 
      flexDirection: 'column',
      position: 'relative',
      width: '100%',
      marginTop: '30px', 
        marginBottom: '100px',
    }}
      >
      <h1 style={{ color: 'white', marginBottom: '10px' }}>Spectrogram</h1>
      <div style={{ position: 'relative', width: drawWidth + padding.left + padding.right, height: drawHeight + padding.top + padding.bottom }}>
        <canvas
          ref={spectroCanvas}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: 0,
          }}
        />
        <canvas
          ref={beatMarkerCanvas}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: 1,
            pointerEvents: 'none',
          }}
        />
      </div>
    </div>
    <div className="">
            <p className='text-xs text-gray-300'><strong>*Dynamic Waveform:</strong> The Dynamic Waveform visualizes the sound of your music by showing its amplitude (or strength) over time. As the song plays, the waveform updates to reflect how loud or quiet the music is at any given moment. The red line you see represents the audio's changes in volume, allowing you to see the rhythm of the music and follow along with the beats.</p> <br />
            <p className='text-xs text-gray-300'><strong>*Spectrogram:</strong> The Spectrogram shows the frequency content of your music across time. It visually represents the different pitches in your song, with high-pitched sounds at the top and low-pitched sounds at the bottom. The Beat Markers highlight the rhythm of the music, making it easier to see where each beat falls in the track. This is perfect for anyone wanting to understand the frequency and rhythm patterns of their favorite tunes!</p>
      </div>
    </>
  );
};

export default Spectrogram;
