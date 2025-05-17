import librosa
import numpy as np
import math
from django.shortcuts import render
from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework import status
from .serializers import UploadedFileSerializer
from django.http import HttpResponse

# Global dict to store chunks
audio_chunks_db = {}

@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser])
def upload_process_audio(request):
    global audio_chunks_db

    serializer = UploadedFileSerializer(data=request.data)
    if serializer.is_valid():
        file_instance = serializer.save()
        print("Saved successfully")

        audio_file = file_instance.file.path
        y, sr = librosa.load(audio_file, sr=22050, mono=True)
        duration = librosa.get_duration(y=y, sr=sr)
        total_chunks = math.ceil(duration / 20)

        chunks = []

        for i in range(total_chunks):
            start_sample = int(i * 20 * sr)
            end_sample = int(min((i + 1) * 20 * sr, len(y)))
            y_chunk = y[start_sample:end_sample]

            # Waveform
            waveform = y_chunk.tolist()

            #Spectro
            D = librosa.stft(y_chunk)
            S_db = librosa.amplitude_to_db(np.abs(D), ref=np.max)

            # Beat Detection
            tempo, beat_frames = librosa.beat.beat_track(y=y_chunk, sr=sr)
            beat_times = librosa.frames_to_time(beat_frames, sr=sr).tolist()

            # Energy
            hop_length = 512
            frame_rms = librosa.feature.rms(y=y_chunk, hop_length=hop_length)[0]
            energy_curve = frame_rms.tolist()

            # Chroma Vector
            chroma = librosa.feature.chroma_cqt(y=y_chunk, sr=sr)
            chroma_vector = chroma.mean(axis=1).tolist()  # 12 values

            # Key Estimation
            pitch_classes = ['C', 'C#', 'D', 'D#', 'E', 'F',
                             'F#', 'G', 'G#', 'A', 'A#', 'B']
            key_index = int(np.argmax(chroma.mean(axis=1)))
            key_label = pitch_classes[key_index]

          
            chunk_data = {
                'waveform': waveform,
                'spectrogram': S_db.tolist(),
                'beat_times': beat_times,
                'tempo_bpm': tempo,
                'energy_curve': energy_curve,
                'chroma_vector': chroma_vector,
                'key': key_label,
            }

            chunks.append(chunk_data)

        # Save 
        audio_chunks_db[file_instance.id] = {
            'chunks': chunks,
            'file_url': file_instance.file.url
        }

        first_chunk = chunks[0]
        response = {
            'chunk_idx': 0,
            'total_chunks': total_chunks,
            'data': first_chunk,
            'file_url': file_instance.file.url,
            'file_id': file_instance.id
        }

        return Response(response, status=status.HTTP_200_OK)

    else:
        print("Serializer error:", serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
def get_chunk_data(request, file_id, chunk_idx):
    global audio_chunks_db

    try:
        chunk = audio_chunks_db[file_id]['chunks'][chunk_idx]
    except KeyError:
        return Response({"error": "Chunk or file not found."}, status=status.HTTP_404_NOT_FOUND)

    return Response({
        'chunk_idx': chunk_idx,
        'data': chunk
    })
