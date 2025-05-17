import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import MusicUpload from './components/MusicUpload';
import { MusicDataProvider } from './context/MusicDataContext';
import Layout from './Layout';
import Spectrogram from './components/Spectrogram';
import ChromaVectorr from './components/ChromaVectorr';
import DynamicEnergyCurve from './components/DynamicEnergyCurve';
import DynamicWaveform from './components/DynamicWaveform';
import StaticWaveform from './components/StaticWaveform'
import StaticEnergyCurve from './components/StaticEnergyCurve';



const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        path: '/',
        element: (
          <>
            <MusicUpload />
          </>
        ),
      },
      {
        path: '/audio',
        element: <></>, // You can replace with your actual component
      },
      {
        path: '/waveform_spectro',
        element: <><DynamicWaveform/><Spectrogram/></>
      },
      {
        path: '/chroma',
        element: <><ChromaVectorr/><StaticWaveform/></>
      },
      {
        path: '/energy',
        element: <><DynamicEnergyCurve/><StaticEnergyCurve/></>
      }
    ],
  },
]);

function App() {
  return (
    <MusicDataProvider>
      <RouterProvider router={router} />
    </MusicDataProvider>
  );
}

export default App;
