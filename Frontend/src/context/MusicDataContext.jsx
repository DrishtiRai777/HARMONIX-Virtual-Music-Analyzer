import React, { createContext, useState } from "react";

export const MusicDataContext = createContext();

export const MusicDataProvider = ({ children }) => {
  const [fileId, setFileId] = useState(null);
  const [fileUrl, setFileUrl] = useState(null);
  const [totalChunks, setTotalChunks] = useState(0);
  const [chunkData, setChunkData] = useState({});
  const [analyzeChunk, setAnalyzeChunk] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(null);

  const addChunkData = (chunk_idx, data) => {
    setChunkData(prev => ({ ...prev, [chunk_idx]: data }));
  };

  return (
    <MusicDataContext.Provider
      value={{
        fileId,
        setFileId,
        fileUrl,
        setFileUrl,
        totalChunks,
        setTotalChunks,
        chunkData,
        addChunkData,
        analyzeChunk,
        setAnalyzeChunk,
        currentTime,
        setCurrentTime,
        totalDuration,
        setTotalDuration
      }}
    >
      {children}
    </MusicDataContext.Provider>
  );
};
