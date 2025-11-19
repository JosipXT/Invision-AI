
import React, { useState } from 'react';
import { TATTOO_DESIGNS } from './constants';
import { AppState, AppStep } from './types';
import { generateTattooPreview } from './services/geminiService';
import { TattooGrid } from './components/TattooGrid';
import { PhotoUpload } from './components/PhotoUpload';
import { ResultView } from './components/ResultView';
import { TattooEditor } from './components/TattooEditor';
import { Gallery } from './components/Gallery';
import { Button } from './components/ui/Button';
import { Sparkles, AlertCircle, ChevronLeft, Image as GalleryIcon, Settings } from 'lucide-react';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    step: AppStep.SELECTION,
    selectedTattooId: null,
    userImage: null,
    previewImage: null,
    resultImage: null,
    error: null,
    selectedColor: '#000000'
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleTattooSelect = (id: string) => {
    setState(prev => ({ ...prev, selectedTattooId: id }));
  };

  const handleImageSelect = (base64: string) => {
    // Move directly to editor when image is selected
    setState(prev => ({ ...prev, userImage: base64, step: AppStep.EDITOR, error: null }));
  };

  const handleClearImage = () => {
    setState(prev => ({ ...prev, userImage: null }));
  };

  const goToUpload = () => {
    if (state.selectedTattooId) {
      setState(prev => ({ ...prev, step: AppStep.UPLOAD }));
    }
  };

  const goToSelection = () => {
    setState(prev => ({ ...prev, step: AppStep.SELECTION, error: null }));
  };

  const openGallery = () => {
    setState(prev => ({ ...prev, step: AppStep.GALLERY, error: null }));
  };
  
  const closeGallery = () => {
    setState(prev => ({ ...prev, step: AppStep.SELECTION, error: null }));
  };

  const resetApp = () => {
    setState({
      step: AppStep.SELECTION,
      selectedTattooId: null,
      userImage: null,
      previewImage: null,
      resultImage: null,
      error: null,
      selectedColor: '#000000'
    });
  };

  // Step 3: Editor -> Processing
  const handleEditorConfirm = async (compositedImage: string, selectedColor: string) => {
    if (!state.selectedTattooId) return;

    const design = TATTOO_DESIGNS.find(d => d.id === state.selectedTattooId);
    if (!design) return;

    setState(prev => ({ 
        ...prev, 
        previewImage: compositedImage, 
        selectedColor: selectedColor,
        step: AppStep.PROCESSING, 
        error: null 
    }));
    setIsLoading(true);

    try {
      const result = await generateTattooPreview(compositedImage, design.promptDetail, selectedColor);
      setState(prev => ({
        ...prev,
        resultImage: result,
        step: AppStep.RESULT
      }));
    } catch (error: any) {
      let errorMessage = "Hubo un error al generar el tatuaje. Inténtalo de nuevo.";
      
      // Friendly error for missing API Key
      if (error.message?.includes("API Key") || error.message?.includes("403") || error.message?.includes("key")) {
        errorMessage = "Error de Configuración: No se detectó una API Key válida. Si eres el dueño de la app, asegúrate de configurar la variable de entorno 'API_KEY' en tu servicio de hosting.";
      }

      setState(prev => ({
        ...prev,
        step: AppStep.EDITOR, // Go back to editor on error
        error: errorMessage
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditorCancel = () => {
    setState(prev => ({ ...prev, step: AppStep.UPLOAD, userImage: null }));
  };

  return (
    <div className="min-h-screen bg-ink-900 text-gray-100 flex flex-col font-sans">
      {/* Header */}
      <header className="border-b border-ink-700 bg-ink-900/95 sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={resetApp}>
            <div className="w-8 h-8 bg-gold-500 rounded-lg flex items-center justify-center text-ink-900 font-bold shadow-lg shadow-gold-500/20">
              <Sparkles size={20} />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">InkVision <span className="text-gold-500">AI</span></span>
          </div>
          
          <div className="flex items-center gap-4">
             {state.step !== AppStep.GALLERY && (
                <button 
                    onClick={openGallery}
                    className="text-sm font-medium text-gray-400 hover:text-gold-500 flex items-center gap-2 transition-colors"
                >
                    <GalleryIcon size={18} /> Galería
                </button>
             )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-center p-4 md:p-8 w-full max-w-7xl mx-auto">
        
        {/* Error Message */}
        {state.error && (
          <div className="w-full max-w-2xl mb-6 bg-red-900/30 border border-red-500/50 text-red-200 p-4 rounded-lg flex items-start gap-3 animate-in fade-in slide-in-from-top-4 z-50 shadow-xl backdrop-blur-sm">
            <AlertCircle className="flex-shrink-0 mt-1" />
            <div>
              <p className="font-semibold">Error</p>
              <p className="text-sm opacity-90">{state.error}</p>
            </div>
          </div>
        )}

        {/* STEP: GALLERY */}
        {state.step === AppStep.GALLERY && (
            <Gallery onClose={closeGallery} />
        )}

        {/* STEP 1: SELECTION */}
        {state.step === AppStep.SELECTION && (
          <div className="flex flex-col items-center w-full space-y-8 animate-in fade-in duration-500">
            <div className="text-center space-y-3 max-w-2xl">
              <h1 className="text-4xl md:text-5xl font-bold text-white">Elige tu Estilo</h1>
              <p className="text-lg text-gray-400">Selecciona uno de nuestros diseños exclusivos para visualizarlo en tu piel.</p>
            </div>
            
            <TattooGrid 
              selectedId={state.selectedTattooId} 
              onSelect={handleTattooSelect} 
            />

            <div className="sticky bottom-8 z-40 animate-in slide-in-from-bottom-4 duration-700 pointer-events-none">
              <Button 
                onClick={goToUpload} 
                disabled={!state.selectedTattooId}
                className="shadow-2xl shadow-gold-500/20 text-lg px-8 py-4 pointer-events-auto"
              >
                Siguiente Paso
              </Button>
            </div>
          </div>
        )}

        {/* STEP 2: UPLOAD */}
        {state.step === AppStep.UPLOAD && (
          <div className="flex flex-col items-center w-full space-y-8 animate-in slide-in-from-right-8 duration-500 max-w-3xl">
             <div className="w-full flex justify-start">
                <button onClick={goToSelection} className="flex items-center text-gray-400 hover:text-gold-500 transition-colors">
                    <ChevronLeft size={20} /> Volver a diseños
                </button>
            </div>

            <div className="text-center space-y-3">
              <h1 className="text-3xl md:text-4xl font-bold text-white">Sube tu Foto</h1>
              <p className="text-gray-400">Para obtener los mejores resultados, asegúrate de que la zona del cuerpo esté bien iluminada.</p>
            </div>

            <PhotoUpload 
              currentImage={state.userImage} 
              onImageSelected={handleImageSelect} 
              onClear={handleClearImage}
            />
          </div>
        )}

        {/* STEP 3: EDITOR (New Step) */}
        {state.step === AppStep.EDITOR && state.userImage && state.selectedTattooId && (
            <TattooEditor 
                userImage={state.userImage}
                selectedTattooId={state.selectedTattooId}
                onGenerate={handleEditorConfirm}
                onCancel={handleEditorCancel}
            />
        )}

        {/* STEP 4: PROCESSING */}
        {state.step === AppStep.PROCESSING && (
          <div className="flex flex-col items-center justify-center space-y-8 animate-in fade-in duration-700 min-h-[50vh]">
             <div className="relative">
                <div className="w-24 h-24 border-4 border-ink-700 border-t-gold-500 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles className="text-gold-500 animate-pulse" size={32} />
                </div>
             </div>
             <div className="text-center space-y-2">
               <h2 className="text-2xl font-bold text-white">Tatuando digitalmente...</h2>
               <p className="text-gray-400">La IA está integrando la tinta en tus poros para un realismo total.</p>
             </div>
          </div>
        )}

        {/* STEP 5: RESULT */}
        {state.step === AppStep.RESULT && state.resultImage && (
          <ResultView 
            resultImage={state.resultImage} 
            selectedTattooId={state.selectedTattooId}
            onReset={resetApp} 
          />
        )}

      </main>

      <footer className="py-6 text-center text-gray-600 text-sm border-t border-ink-800 bg-ink-900">
        <p>© {new Date().getFullYear()} InkVision AI. Powered by Gemini 2.5.</p>
      </footer>
    </div>
  );
};

export default App;
