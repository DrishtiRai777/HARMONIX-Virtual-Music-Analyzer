import { useState, useRef, useEffect, useContext } from 'react';
import { MusicDataContext } from '../context/MusicDataContext';
import { NavLink } from 'react-router-dom';

const AudioPlayerr = () => {
    const {
        fileUrl,
        analyzeChunk,
        setAnalyzeChunk,
        totalChunks,
        addChunkData,
        chunkData,
        fileId,
        currentTime,
        setCurrentTime,
        totalDuration,
        setTotalDuration
    } = useContext(MusicDataContext);

    const [count, setcount] = useState(1);
    const audioRef = useRef(null);

    const handlePlay = () => {
        const audio = audioRef.current;
        if (!audio) return;

        const chunkStart = (analyzeChunk - 1) * 20;
        const chunkEnd = chunkStart + 20;

        if (currentTime >= chunkStart && currentTime < chunkEnd) {
            audio.play().catch(err => {
                console.error("Playback error:", err);
                alert("Couldn't play audio.");
            });
        } else {
            alert("Chunk exhausted or invalid. Click 'Analyze Chunk' again.");
        }
    };

    const handlePause = () => {
        const audio = audioRef.current;
        if (audio) audio.pause();
    };

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;
        const updateDuration = () => setTotalDuration(audio.duration);
        audio.addEventListener('loadedmetadata', updateDuration);
        return () => audio.removeEventListener('loadedmetadata', updateDuration);
    }, [fileUrl]);

    // Fetch chunk
    useEffect(() => {
        const getChunk = async () => {
            if (!chunkData[analyzeChunk - 1]) {
                const data = await fetchChunkData(fileId, analyzeChunk - 1);
                if (data) addChunkData(data.chunk_idx, data.data);
            }
        };
        getChunk();
    }, [analyzeChunk]);

    // Play on Analyze
    useEffect(() => {
        if (analyzeChunk === 0 || totalDuration === null) return;
        if (!chunkData[analyzeChunk - 1]) {
            if (audioRef.current) audioRef.current.pause();
            return;
        }

        const startTime = (analyzeChunk - 1) * 20;
        const endTime = Math.min(startTime + 20, totalDuration);
        const audio = audioRef.current;

        if (!audio) return;

        audio.pause();
        audio.load();
        audio.currentTime = startTime;

        audio.play();
        const updater = setInterval(() => {
            setCurrentTime(audio.currentTime);
            if (audio.currentTime >= endTime) {
                audio.pause();
                clearInterval(updater);
            }
        }, 500);

        return () => clearInterval(updater);
    }, [analyzeChunk, totalDuration, chunkData]);

    const fetchChunkData = async (fileId, chunkIdx) => {
        try {
            const response = await fetch(`http://localhost:8000/get-chunk-data/${fileId}/${chunkIdx}/`);
            if (response.ok) return await response.json();
        } catch (err) {
            console.error("Fetch error:", err);
        }
        return null;
    };

    const handleForward = () => {
        if (count < totalChunks) setcount(count + 1);
    };

    const handleBackward = () => {
        if (count > 1) setcount(count - 1);
    };

    const handleAnalyze = () => {
        setAnalyzeChunk(count);
    };

    const formatTime = (time) => {
        const mins = Math.floor(time / 60).toString().padStart(2, '0');
        const secs = Math.floor(time % 60).toString().padStart(2, '0');
        return `${mins}:${secs}`;
    };

    return (
        <div className=" bg-black text-white px-8 py-12 flex flex-col items-center space-y-10 font-zain">
            <h2 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-sky-400 drop-shadow-[0_0_5px_rgba(38,194,229,0.5)]">Audio Player</h2>

            {/* Chunk Nav */}
            <div className="flex items-center gap-4">
                <button onClick={handleBackward} disabled={count <= 1} className="bg-gray-800 px-4 py-2 rounded-md hover:bg-gray-700 transition disabled:opacity-50">
                    ◀ Prev
                </button>
                <div className="text-2xl font-bold text-sky-400">{count}</div>
                <button onClick={handleForward} disabled={count >= totalChunks} className="bg-gray-800 px-4 py-2 rounded-md hover:bg-gray-700 transition disabled:opacity-50">
                    Next ▶
                </button>
                <button onClick={handleAnalyze} className="ml-4 bg-blue-500 px-5 py-2 rounded-md font-semibold hover:bg-blue-600 transition">
                    Analyze Chunk
                </button>
            </div>

            {/* Audio Controls */}
            <div className="flex flex-col items-center space-y-4">
                <div className="bg-gray-800 px-6 py-4 rounded-md text-white flex flex-col items-center w-72">
                    <span className="mb-2 font-bold text-lg">🎵 HarmoniX Player</span>
                    <div className="flex gap-4">
                        <button onClick={handlePlay} className="bg-black px-5 py-2 rounded-md hover:bg-gray-600 transition font-bold">Play</button>
                        <button onClick={handlePause} className="bg-black px-5 py-2 rounded-md hover:bg-gray-600 transition font-bold">Pause</button>
                    </div>
                </div>
                <audio ref={audioRef} src={fileUrl} className="hidden" />

                { !chunkData[analyzeChunk - 1] && analyzeChunk > 0 && (
                    <p className="text-blue-300 animate-pulse">Loading chunk...</p>
                )}
                <p className="text-lg text-gray-300">
                    Current Time: <span className="text-white">{formatTime(currentTime)}</span> / {totalDuration ? formatTime(totalDuration) : '--:--'}
                </p>
            </div>

            {/* Nav Btns */}
            <div className="flex gap-6 pt-8">
                <NavLink to="/waveform_spectro" className="bg-blue-500 px-4 py-2 rounded-md hover:bg-blue-600 transition font-bold text-lg">Rhythm & Timing</NavLink>
                <NavLink to="/chroma" className="bg-blue-500 px-4 py-2 rounded-md hover:bg-blue-600 transition font-bold text-lg">Harmony & Tonality</NavLink>
                <NavLink to="/energy" className="bg-blue-500 px-4 py-2 rounded-md hover:bg-blue-600 transition font-bold text-lg">Energy & Dynamics</NavLink>
            </div>
        </div>
    );
};

export default AudioPlayerr;
