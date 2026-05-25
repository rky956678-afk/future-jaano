import React, { useRef, useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { useLanguage } from '@/lib/language';
import { useAnalyzeFace, FaceReport } from '@workspace/api-client-react';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Camera, UserCircle } from 'lucide-react';
import { AuthGate } from '@/components/AuthGate';
import { LangToggle } from '@/components/LangToggle';
import { Button } from '@/components/ui/button';

export default function FaceReading() {
  const { t, language, setLanguage } = useLanguage();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [report, setReport] = useState<FaceReport | null>(null);

  const analyzeFace = useAnalyzeFace();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({ title: t('Error', 'त्रुटि'), description: 'File size must be less than 5MB', variant: 'destructive' });
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile || !previewUrl) return;

    const base64Data = previewUrl.split(',')[1];

    analyzeFace.mutate({
      data: {
        imageBase64: base64Data,
        language
      }
    }, {
      onSuccess: (data) => {
        setReport(data);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
      onError: () => {
        toast({
          title: t('Error', 'त्रुटि'),
          description: t('Analysis failed. Please try a clearer photo of your face directly looking at the camera.', 'विश्लेषण विफल। कृपया कैमरे की ओर सीधे देखते हुए अपने चेहरे की अधिक स्पष्ट फोटो आज़माएं।'),
          variant: 'destructive'
        });
      }
    });
  };

  return (
    <Layout>
      <AuthGate feature={{
        icon: UserCircle,
        titleEn: 'Samudrika Shastra Face Reading',
        titleHi: 'सामुद्रिक शास्त्र चेहरा पठन',
        descEn: 'Upload a face photo to receive personality insights and fortune analysis from ancient Samudrika Shastra.',
        descHi: 'अपने चेहरे की फोटो अपलोड करें — प्राचीन सामुद्रिक शास्त्र से व्यक्तित्व और भाग्य विश्लेषण।',
      }}>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-center text-primary mb-4 drop-shadow-md">
          {t('AI Face Reading (Samudrik Shastra)', 'AI मुखाकृति विज्ञान (सामुद्रिक शास्त्र)')}
        </h1>
        <p className="text-center text-muted-foreground mb-5">
          {t('Uncover your personality traits and destiny based on ancient facial physiognomy.', 'प्राचीन मुखाकृति विज्ञान के आधार पर अपने व्यक्तित्व लक्षणों और भाग्य को उजागर करें।')}
        </p>
        <LangToggle className="mb-8" lang={language} onChange={setLanguage} />

        {report ? (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <button 
              onClick={() => { setReport(null); setSelectedFile(null); setPreviewUrl(null); }}
              className="text-primary hover:underline font-medium flex items-center gap-2"
            >
              ← {t('Read Another Face', 'दूसरा चेहरा पढ़ें')}
            </button>

            <div className="bg-card/60 backdrop-blur-md border border-border/50 rounded-2xl p-6 md:p-8 space-y-8">
              <div>
                <h3 className="text-xl font-semibold text-primary mb-3">{t('Overall Personality', 'समग्र व्यक्तित्व')}</h3>
                <p className="text-foreground/90 leading-relaxed text-lg">{report.analysis}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-background/50 p-4 rounded-xl border border-border/30">
                  <h4 className="font-semibold text-primary mb-1">{t('Face Shape', 'चेहरे का आकार')}</h4>
                  <p className="text-sm text-foreground/80">{report.faceShape}</p>
                </div>
                <div className="bg-background/50 p-4 rounded-xl border border-border/30">
                  <h4 className="font-semibold text-primary mb-1">{t('Eyes', 'आंखें')}</h4>
                  <p className="text-sm text-foreground/80">{report.eyeAnalysis}</p>
                </div>
                <div className="bg-background/50 p-4 rounded-xl border border-border/30">
                  <h4 className="font-semibold text-primary mb-1">{t('Nose', 'नाक')}</h4>
                  <p className="text-sm text-foreground/80">{report.noseAnalysis}</p>
                </div>
                {report.lipsAnalysis && (
                  <div className="bg-background/50 p-4 rounded-xl border border-border/30">
                    <h4 className="font-semibold text-primary mb-1">{t('Lips & Mouth', 'होंठ और मुंह')}</h4>
                    <p className="text-sm text-foreground/80">{report.lipsAnalysis}</p>
                  </div>
                )}
              </div>

              <div className="pt-6 border-t border-border/50 space-y-4">
                {report.personalityTraits && (
                  <div>
                    <h4 className="text-lg font-semibold text-foreground/90 mb-2">{t('Key Traits', 'मुख्य लक्षण')}</h4>
                    <p className="text-muted-foreground">{report.personalityTraits}</p>
                  </div>
                )}
                {report.fortunePrediction && (
                  <div className="bg-primary/5 p-4 rounded-xl border border-primary/20">
                    <h4 className="font-semibold text-primary mb-2">{t('Fortune & Destiny', 'भाग्य और नियति')}</h4>
                    <p className="text-foreground/90 text-sm">{report.fortunePrediction}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-xl mx-auto">
            <div 
              className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
                previewUrl ? 'border-primary bg-primary/5' : 'border-border/50 hover:border-primary/50 bg-card/20'
              }`}
              onClick={() => !previewUrl && fileInputRef.current?.click()}
            >
              <input 
                type="file" 
                accept="image/*" 
                capture="user"
                className="hidden" 
                ref={fileInputRef}
                onChange={handleFileChange}
              />
              
              {previewUrl ? (
                <div className="space-y-6">
                  <div className="relative w-48 h-48 mx-auto rounded-full overflow-hidden shadow-lg border-4 border-primary/30">
                    <img src={previewUrl} alt="Face Preview" className="w-full h-full object-cover" />
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      className="absolute top-2 right-2 rounded-full h-8 w-8 p-0"
                      onClick={(e) => { e.stopPropagation(); setSelectedFile(null); setPreviewUrl(null); }}
                    >
                      X
                    </Button>
                  </div>
                  <Button 
                    onClick={handleSubmit} 
                    className="w-full h-14 text-lg rounded-xl shadow-[0_0_15px_rgba(245,166,35,0.2)]"
                    disabled={analyzeFace.isPending}
                  >
                    {analyzeFace.isPending ? (
                      <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> {t('Reading Face...', 'चेहरा पढ़ा जा रहा है...')}</>
                    ) : (
                      t('Read My Face', 'मेरा चेहरा पढ़ें')
                    )}
                  </Button>
                </div>
              ) : (
                <div className="cursor-pointer py-12 flex flex-col items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
                    <UserCircle className="w-12 h-12" />
                  </div>
                  <div>
                    <p className="text-xl font-medium text-foreground">{t('Take a clear selfie', 'एक स्पष्ट सेल्फी लें')}</p>
                    <p className="text-muted-foreground mt-2 px-8">{t('Look directly at the camera with neutral expression. Ensure your face is fully visible.', 'तटस्थ भाव के साथ सीधे कैमरे की ओर देखें। सुनिश्चित करें कि आपका चेहरा पूरी तरह से दिखाई दे रहा है।')}</p>
                  </div>
                  <Button variant="outline" className="mt-4 border-primary text-primary">
                    <Camera className="w-4 h-4 mr-2" />
                    {t('Open Camera', 'कैमरा खोलें')}
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      </AuthGate>
    </Layout>
  );
}
