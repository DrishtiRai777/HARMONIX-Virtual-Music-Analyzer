import React, { useContext, useState, useEffect } from 'react'
import { MusicDataContext } from '../context/MusicDataContext';
import {Link} from 'react-router-dom';

const MusicUpload = () => {
    const [file, setfile] = useState(null)
    const { setFileUrl, setTotalChunks, addChunkData, setFileId, fileUrl} = useContext(MusicDataContext);
    const [loading, setLoading] = useState(false);
    const [dots, setDots] = useState("");

    useEffect(() => {
      if (!loading) return;

      const interval = setInterval(() => {
        setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
      }, 500);

      return () => clearInterval(interval);
    }, [loading]);


    const handleFileChange = (e) => {
        setfile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if(!file) {
            alert("Please select a file first");
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        try {
            setLoading(true);
            console.time("Upload + Response Time");
            const response = await fetch("http://localhost:8000/upload/", {
                method: "POST",
                body: formData,
            });
            console.timeEnd("Upload + Response Time");

            if(response.ok) {
                const data = await response.json();
                console.log(data);
                setFileUrl("http://localhost:8000" + data.file_url);
                setTotalChunks(data.total_chunks);
                addChunkData(data.chunk_idx, data.data);
                setFileId(data.file_id)
            } else {
                alert("File upload failed");
            }
        } 
        catch(err) {
            console.log("Error in uploading file:", err);
            alert("An Error Occurred");
        } finally {
          setLoading(false);
        }
    };

  return (
  <div className="min-h-screen bg-black flex flex-col items-center justify-center px-8 py-20 text-white text-center space-y-8">
    <h1 className="text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-sky-500 drop-shadow-[0_0_10px_rgba(38,194,229,0.5)] animate-smoothPulse font-zain">
    <span className="text-blue-400 font-satisfy">H</span><span className='text-white'>armoni</span><span className="text-sky-400 font-satisfy">X</span>
    </h1>


    {/* Intro Para */}
    <p className="max-w-5xl text-xl text-white leading-relaxed opacity-90 font-zain">
      Discover the power of music through visuals with <span className="text-sky-500 font-extrabold">HarmoniX</span>. This innovative tool transforms your tracks into dynamic visualizations, allowing you to explore rhythm, tempo, harmony, and energy like never before. With real-time waveforms, beat markers, BPM detection, spectrograms, chroma vectors, and energy curves, <span className="text-sky-500 font-extrabold">HarmoniX</span> lets you dive deep into the structure of your music. Upload your audio, and see it come to life with detailed, interactive visualizations that unlock a new way to experience sound.
    </p>


    <label className="text-sm text-gray-300">Select a Music File</label>
    <div className="flex justify-center">
      {/* Upload Form */}
      <form
        method="POST"
        onSubmit={handleSubmit}
        className="flex items-center gap-4 "
      >
        
        <input
          type="file"
          onChange={handleFileChange}
          accept=".mp3, .wav"
          className="file:bg-gray-800 file:text-gray-100 file:px-3 file:py-2 file:rounded-md file:border-none file:cursor-pointer hover:file:bg-gray-700 transition"
        />

        <button
          type="submit"
          className="bg-blue-500 font-semibold text-white px-5 py-2 border border-transparent rounded-md hover:bg-blue-600 transition"
        >
          Upload
        </button>
      </form>
    </div>

     {/* Show "Analyzing..." if the file is being uploaded */}
      {loading && (
        <p className="text-xl text-white font-semibold animate-pulse">
          Analyzing{dots}
        </p>
      )}

    {/* Analyze Link */}
    {fileUrl && (
      <button className="pt-6">
        <Link
          to="/audio"
          className="bg-blue-500 font-semibold text-white px-5 py-2 border border-transparent rounded-md hover:bg-blue-600 transition"
        >
          Analyze Music
        </Link>
      </button>
    )}
  </div>
);



}

export default MusicUpload

// - FormData lets us create a key-value object for form data, especially useful for files.
// - append() is used to add data to it — you can use it multiple times to add more fields.
// - await pauses the code until the response comes back, so the next lines run only after the request is done.
// - data.file_url.replace("/media", "")) --- It removes /media from the backend path and builds the full file URL to display or access the uploaded file from the frontend.