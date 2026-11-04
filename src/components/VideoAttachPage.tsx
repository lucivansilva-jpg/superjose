import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  Youtube,
  Camera,
  Link as LinkIcon,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  Play,
  Square,
  RefreshCw,
  Film,
  Sliders,
  Eye,
  Trash2,
  Video as VideoIcon
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { VideoConfig, VideoSourceType } from '../types';
import {
  saveVideoFileToDB,
  saveVideoConfig,
  clearVideoFileFromDB,
  extractYouTubeId,
  SAMPLE_VIDEOS
} from '../utils/videoStorage';
import { soundEffects } from '../utils/soundEffects';
import { VideoPlayerFrame } from './VideoPlayerFrame';

interface VideoAttachPageProps {
  currentConfig: VideoConfig;
  onSave: (config: VideoConfig) => void;
  onBackToInvite: () => void;
}

export const VideoAttachPage: React.FC<VideoAttachPageProps> = ({
  currentConfig,
  onSave,
  onBackToInvite
}) => {
  const [activeTab, setActiveTab] = useState<VideoSourceType>(currentConfig.type || 'upload');
  const [videoConfig, setVideoConfig] = useState<VideoConfig>(currentConfig);
  const [youtubeInput, setYoutubeInput] = useState<string>(
    currentConfig.type === 'youtube' && currentConfig.youtubeId
      ? `https://www.youtube.com/watch?v=${currentConfig.youtubeId}`
      : ''
  );
  const [directUrlInput, setDirectUrlInput] = useState<string>(
    currentConfig.type === 'url' ? currentConfig.src : ''
  );
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadSuccessName, setUploadSuccessName] = useState<string | null>(
    currentConfig.originalName || null
  );

  // Camera Recording States
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [recordedBlobUrl, setRecordedBlobUrl] = useState<string | null>(null);
  const cameraVideoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<number | null>(null);

  // File input ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
      }
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [cameraStream]);

  // Handle local file upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    soundEffects.playCoin();
    setUploadProgress(10);

    try {
      const interval = setInterval(() => {
        setUploadProgress((p) => {
          if (p === null || p >= 90) {
            clearInterval(interval);
            return 90;
          }
          return p + 20;
        });
      }, 100);

      const blobUrl = await saveVideoFileToDB(file, file.name);
      clearInterval(interval);
      setUploadProgress(100);
      setUploadSuccessName(file.name);

      const newConfig: VideoConfig = {
        ...videoConfig,
        type: 'upload',
        src: blobUrl,
        originalName: file.name,
        updatedAt: Date.now()
      };
      setVideoConfig(newConfig);
      saveVideoConfig(newConfig);
      soundEffects.play1Up();

      setTimeout(() => setUploadProgress(null), 1500);
    } catch (err) {
      console.error('Error saving video', err);
      setUploadProgress(null);
      alert('Não foi possível salvar o arquivo. Tente um formato como MP4 ou WebM.');
    }
  };

  // Handle YouTube apply
  const handleApplyYouTube = () => {
    const ytid = extractYouTubeId(youtubeInput);
    if (!ytid) {
      alert('Link do YouTube inválido. Cole um link do tipo https://youtu.be/... ou https://youtube.com/watch?v=...');
      return;
    }
    soundEffects.playCoin();
    const newConfig: VideoConfig = {
      ...videoConfig,
      type: 'youtube',
      youtubeId: ytid,
      src: `https://www.youtube.com/embed/${ytid}`,
      originalName: 'YouTube Vídeo (' + ytid + ')',
      updatedAt: Date.now()
    };
    setVideoConfig(newConfig);
    saveVideoConfig(newConfig);
    soundEffects.play1Up();
  };

  // Handle Direct URL apply
  const handleApplyDirectUrl = () => {
    if (!directUrlInput.trim()) return;
    soundEffects.playCoin();
    const newConfig: VideoConfig = {
      ...videoConfig,
      type: 'url',
      src: directUrlInput.trim(),
      originalName: 'Vídeo da Web',
      updatedAt: Date.now()
    };
    setVideoConfig(newConfig);
    saveVideoConfig(newConfig);
    soundEffects.play1Up();
  };

  // Handle sample selection
  const handleSelectSample = (sample: typeof SAMPLE_VIDEOS[0]) => {
    soundEffects.playCoin();
    const newConfig: VideoConfig = {
      ...videoConfig,
      type: 'demo',
      src: sample.url,
      originalName: sample.title,
      updatedAt: Date.now()
    };
    setVideoConfig(newConfig);
    saveVideoConfig(newConfig);
    soundEffects.play1Up();
  };

  // Camera Recording Handlers
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true
      });
      setCameraStream(stream);
      if (cameraVideoRef.current) {
        cameraVideoRef.current.srcObject = stream;
        cameraVideoRef.current.play().catch(() => {});
      }
    } catch (err) {
      console.error('Camera error', err);
      alert('Não foi possível acessar a câmera. Verifique as permissões do seu navegador.');
    }
  };

  const startRecording = () => {
    if (!cameraStream) return;
    recordedChunksRef.current = [];
    soundEffects.playCoin();

    try {
      const recorder = new MediaRecorder(cameraStream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        const recordedBlob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(recordedBlob);
        setRecordedBlobUrl(url);

        // Save to DB
        await saveVideoFileToDB(recordedBlob, 'gravacao_convite.webm');

        const newConfig: VideoConfig = {
          ...videoConfig,
          type: 'recorded',
          src: url,
          originalName: 'Gravação da Câmera',
          updatedAt: Date.now()
        };
        setVideoConfig(newConfig);
        saveVideoConfig(newConfig);
        soundEffects.play1Up();
      };

      recorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);

      timerIntervalRef.current = window.setInterval(() => {
        setRecordingSeconds((sec) => sec + 1);
      }, 1000);
    } catch (err) {
      console.error('Recording start error', err);
    }
  };

  const stopRecording = () => {
    soundEffects.playPipe();
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }
  };

  const handleSaveAndReturn = () => {
    soundEffects.playFanfare();
    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 }
      });
    } catch {}
    saveVideoConfig(videoConfig);
    onSave(videoConfig);
  };

  const handleClearVideo = async () => {
    soundEffects.playPipe();
    await clearVideoFileFromDB();
    const resetConfig: VideoConfig = {
      ...videoConfig,
      type: 'demo',
      src: SAMPLE_VIDEOS[0].url,
      originalName: SAMPLE_VIDEOS[0].title,
      updatedAt: Date.now()
    };
    setVideoConfig(resetConfig);
    saveVideoConfig(resetConfig);
    setUploadSuccessName(null);
  };

  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-100 pb-16">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToInvite}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Voltar ao convite"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-xl font-mario text-yellow-400 drop-shadow flex items-center gap-2">
                <span>🎬</span> Anexar Vídeo do Convite
              </h1>
              <p className="text-xs text-slate-400">
                O vídeo aparecerá no painel superior do convite do Mario
              </p>
            </div>
          </div>

          <button
            onClick={handleSaveAndReturn}
            className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-slate-950 font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-lg transition-transform hover:scale-105 active:scale-95"
          >
            <CheckCircle2 size={16} />
            <span>Salvar & Ver Convite</span>
          </button>
        </div>
      </header>

      {/* Main Form Content */}
      <main className="max-w-4xl mx-auto px-4 mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Attachment Controls */}
        <div className="lg:col-span-7 space-y-6">
          {/* Source Tabs */}
          <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800 shadow-xl">
            <h2 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-2">
              <Film size={16} className="text-yellow-400" />
              Escolha como deseja anexar o vídeo:
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => {
                  soundEffects.playCoin();
                  setActiveTab('upload');
                }}
                className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                  activeTab === 'upload'
                    ? 'bg-yellow-400 text-slate-950 border-yellow-300 shadow-lg'
                    : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-800'
                }`}
              >
                <Upload size={18} />
                <span>Upload de Arquivo</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  soundEffects.playCoin();
                  setActiveTab('youtube');
                }}
                className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                  activeTab === 'youtube'
                    ? 'bg-yellow-400 text-slate-950 border-yellow-300 shadow-lg'
                    : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-800'
                }`}
              >
                <Youtube size={18} />
                <span>YouTube / Shorts</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  soundEffects.playCoin();
                  setActiveTab('recorded');
                  if (!cameraStream) startCamera();
                }}
                className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                  activeTab === 'recorded'
                    ? 'bg-yellow-400 text-slate-950 border-yellow-300 shadow-lg'
                    : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-800'
                }`}
              >
                <Camera size={18} />
                <span>Gravar Câmera</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  soundEffects.playCoin();
                  setActiveTab('demo');
                }}
                className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                  activeTab === 'demo'
                    ? 'bg-yellow-400 text-slate-950 border-yellow-300 shadow-lg'
                    : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-800'
                }`}
              >
                <Sparkles size={18} />
                <span>Vídeos Prontos</span>
              </button>
            </div>

            {/* TAB 1: File Upload */}
            {activeTab === 'upload' && (
              <div className="mt-5 space-y-4">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="cursor-pointer border-2 border-dashed border-yellow-400/50 hover:border-yellow-400 bg-slate-800/40 hover:bg-slate-800/70 p-6 rounded-2xl text-center transition-all group"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/mp4,video/webm,video/quicktime,video/mov,video/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-yellow-400/20 text-yellow-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Upload size={28} />
                  </div>
                  <h3 className="font-bold text-white text-base">
                    Clique ou arraste um vídeo do seu celular ou computador
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Formatos suportados: MP4, MOV, WebM (Vídeos horizontais 16:9 ficam perfeitos no painel!)
                  </p>

                  <div className="mt-4">
                    <span className="inline-block py-2 px-4 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-bold text-xs shadow-md">
                      Selecionar Arquivo de Vídeo
                    </span>
                  </div>
                </div>

                {uploadProgress !== null && (
                  <div className="p-4 bg-slate-800 rounded-xl space-y-2">
                    <div className="flex justify-between text-xs font-semibold text-slate-300">
                      <span>Processando e salvando vídeo...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-yellow-400 h-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {uploadSuccessName && (
                  <div className="p-3.5 bg-green-500/10 border border-green-500/30 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2.5 text-xs text-green-300 truncate">
                      <CheckCircle2 size={16} className="shrink-0" />
                      <span className="truncate">Vídeo ativo: <strong>{uploadSuccessName}</strong></span>
                    </div>
                    <button
                      onClick={handleClearVideo}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      title="Remover vídeo anexado"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: YouTube / Shorts */}
            {activeTab === 'youtube' && (
              <div className="mt-5 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Cole o link do vídeo do YouTube ou YouTube Shorts:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={youtubeInput}
                      onChange={(e) => setYoutubeInput(e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=... ou https://youtu.be/..."
                      className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400"
                    />
                    <button
                      onClick={handleApplyYouTube}
                      className="py-2.5 px-4 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-bold text-xs whitespace-nowrap shadow"
                    >
                      Aplicar Link
                    </button>
                  </div>
                </div>

                <div className="p-3 bg-slate-800/60 rounded-xl text-xs text-slate-400 space-y-1">
                  <p>💡 <strong>Dica:</strong> Você pode usar qualquer link de vídeo público do YouTube ou vídeo não-listado (unlisted) da sua família.</p>
                </div>
              </div>
            )}

            {/* TAB 3: Record with camera */}
            {activeTab === 'recorded' && (
              <div className="mt-5 space-y-4">
                <div className="relative aspect-video bg-black rounded-2xl overflow-hidden border border-slate-700 flex items-center justify-center">
                  <video
                    ref={cameraVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />

                  {isRecording && (
                    <div className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-2 animate-pulse">
                      <span className="w-2 h-2 rounded-full bg-white" />
                      GRAVANDO {Math.floor(recordingSeconds / 60)}:
                      {(recordingSeconds % 60).toString().padStart(2, '0')}
                    </div>
                  )}

                  {!cameraStream && (
                    <button
                      onClick={startCamera}
                      className="py-2.5 px-5 rounded-xl bg-yellow-500 text-slate-950 font-bold text-xs shadow-lg flex items-center gap-2"
                    >
                      <Camera size={16} />
                      Ativar Câmera
                    </button>
                  )}
                </div>

                {cameraStream && (
                  <div className="flex items-center justify-center gap-3">
                    {!isRecording ? (
                      <button
                        onClick={startRecording}
                        className="py-2.5 px-6 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm flex items-center gap-2 shadow-lg"
                      >
                        <Play size={16} />
                        Iniciar Gravação
                      </button>
                    ) : (
                      <button
                        onClick={stopRecording}
                        className="py-2.5 px-6 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-sm flex items-center gap-2 shadow-lg"
                      >
                        <Square size={16} />
                        Parar e Salvar no Convite
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: Ready Sample Videos */}
            {activeTab === 'demo' && (
              <div className="mt-5 space-y-3">
                <p className="text-xs text-slate-300">
                  Se preferir, escolha um destes vídeos comemorativos prontos para testar no convite:
                </p>
                <div className="space-y-2">
                  {SAMPLE_VIDEOS.map((sample) => (
                    <div
                      key={sample.id}
                      onClick={() => handleSelectSample(sample)}
                      className={`cursor-pointer p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                        videoConfig.src === sample.url
                          ? 'bg-yellow-500/10 border-yellow-400 ring-2 ring-yellow-400/20'
                          : 'bg-slate-800/80 border-slate-700 hover:bg-slate-800'
                      }`}
                    >
                      <div>
                        <h4 className="font-bold text-sm text-white flex items-center gap-2">
                          <span>⭐</span> {sample.title}
                        </h4>
                        <p className="text-xs text-slate-400 mt-0.5">{sample.description}</p>
                      </div>
                      <span className="text-xs font-bold py-1 px-3 rounded-lg bg-yellow-400 text-slate-950">
                        {videoConfig.src === sample.url ? 'Ativo' : 'Escolher'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Video Playback Preferences */}
          <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Sliders size={16} className="text-yellow-400" />
              Ajustes de Exibição no Painel
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="p-3 rounded-xl bg-slate-800/70 border border-slate-700/80 flex items-center justify-between cursor-pointer">
                <div>
                  <span className="text-xs font-bold text-white block">Auto-reproduzir</span>
                  <span className="text-[11px] text-slate-400">Tocar ao abrir o convite</span>
                </div>
                <input
                  type="checkbox"
                  checked={videoConfig.autoplay}
                  onChange={(e) => {
                    const next = { ...videoConfig, autoplay: e.target.checked };
                    setVideoConfig(next);
                    saveVideoConfig(next);
                  }}
                  className="w-4 h-4 accent-yellow-400"
                />
              </label>

              <label className="p-3 rounded-xl bg-slate-800/70 border border-slate-700/80 flex items-center justify-between cursor-pointer">
                <div>
                  <span className="text-xs font-bold text-white block">Repetir (Loop)</span>
                  <span className="text-[11px] text-slate-400">Reiniciar automaticamente</span>
                </div>
                <input
                  type="checkbox"
                  checked={videoConfig.loop}
                  onChange={(e) => {
                    const next = { ...videoConfig, loop: e.target.checked };
                    setVideoConfig(next);
                    saveVideoConfig(next);
                  }}
                  className="w-4 h-4 accent-yellow-400"
                />
              </label>

              <label className="p-3 rounded-xl bg-slate-800/70 border border-slate-700/80 flex items-center justify-between cursor-pointer">
                <div>
                  <span className="text-xs font-bold text-white block">Iniciar Silenciado</span>
                  <span className="text-[11px] text-slate-400">Permite autoplay em celulares</span>
                </div>
                <input
                  type="checkbox"
                  checked={videoConfig.muted}
                  onChange={(e) => {
                    const next = { ...videoConfig, muted: e.target.checked };
                    setVideoConfig(next);
                    saveVideoConfig(next);
                  }}
                  className="w-4 h-4 accent-yellow-400"
                />
              </label>

              <div className="p-3 rounded-xl bg-slate-800/70 border border-slate-700/80 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white block">Ajuste de Tela</span>
                  <span className="text-[11px] text-slate-400">Preenchimento do painel</span>
                </div>
                <select
                  value={videoConfig.fit}
                  onChange={(e) => {
                    const next = { ...videoConfig, fit: e.target.value as 'cover' | 'contain' };
                    setVideoConfig(next);
                    saveVideoConfig(next);
                  }}
                  className="bg-slate-900 border border-slate-700 text-xs text-white rounded-lg px-2 py-1 focus:outline-none"
                >
                  <option value="cover">Preencher (Cover)</option>
                  <option value="contain">Conter (Contain)</option>
                </select>
              </div>
            </div>

            {/* Optional Caption */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Legenda Opcional sobre o vídeo:
              </label>
              <input
                type="text"
                value={videoConfig.caption || ''}
                onChange={(e) => {
                  const next = { ...videoConfig, caption: e.target.value };
                  setVideoConfig(next);
                  saveVideoConfig(next);
                }}
                placeholder="Ex: Aniversário do Nosso Super Campeão!"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-yellow-400"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Live Mockup Preview */}
        <div className="lg:col-span-5 space-y-4">
          <div className="sticky top-24 bg-slate-900/80 rounded-2xl p-4 border border-slate-800 shadow-2xl flex flex-col items-center">
            <div className="w-full flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
              <span className="text-xs font-bold text-yellow-400 uppercase tracking-wider flex items-center gap-1.5">
                <Eye size={14} /> Pré-visualização no Painel
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                {videoConfig.type.toUpperCase()}
              </span>
            </div>

            {/* Live Billboard Frame Preview */}
            <div className="w-full max-w-[320px] shadow-2xl rounded-2xl overflow-hidden border-4 border-yellow-400 bg-sky-900">
              <div className="relative w-full aspect-[941/1672]">
                <img
                  src="/assets/aistudio/image_a0905ca7.png"
                  alt="Pré-visualização do convite"
                  className="w-full h-full object-cover block"
                  referrerPolicy="no-referrer"
                />

                {/* Video slot */}
                <div
                  className="absolute z-10 overflow-hidden shadow-inner"
                  style={{
                    top: '3.3%',
                    left: '5.0%',
                    width: '89.9%',
                    height: '28.65%',
                    borderRadius: '16px'
                  }}
                >
                  <VideoPlayerFrame
                    config={videoConfig}
                    isInteractive={false}
                  />
                </div>
              </div>
            </div>

            {/* Big Apply Button */}
            <button
              onClick={handleSaveAndReturn}
              className="w-full mt-4 py-3.5 px-4 rounded-xl bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-400 hover:from-yellow-400 hover:to-amber-300 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 shadow-xl shadow-yellow-950/40 transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <CheckCircle2 size={18} />
              <span>Salvar e Ver Convite Pronto</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};
