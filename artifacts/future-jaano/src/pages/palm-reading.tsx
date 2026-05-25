import React, { useRef, useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { useLanguage } from '@/lib/language';
import { useAnalyzePalm, PalmReport } from '@workspace/api-client-react';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Camera, Hand } from 'lucide-react';
import { AuthGate } from '@/components/AuthGate';
import { LangToggle } from '@/components/LangToggle';
import { Button } from '@/components/ui/button';

export default function PalmReading() {
  const { t, language, setLanguage } = useLanguage();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [report, setReport] = useState<PalmReport | null>(null);

  const analyzePalm = useAnalyzePalm();

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

    analyzePalm.mutate({
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
          description: t('Analysis failed. Please try a clearer photo of your palm.', 'विश्लेषण विफल। कृपया अपनी हथेली की अधिक स्पष्ट फोटो आज़माएं।'),
          variant: 'destructive'
        });
      }
    });
  };

  return (
    <Layout>
      <AuthGate feature={{
        icon: Hand,
        titleEn: 'Discover What Your Palm Reveals',
        titleHi: 'जानें आपकी हथेली क्या कहती है',
        descEn: 'Upload a palm photo for AI-powered analysis of life, heart, and head lines based on Vedic palmistry.',
        descHi: 'हथेली की फोटो अपलोड करें — जीवन, हृदय और मस्तिष्क रेखाओं का वैदिक हस्तरेखा विश्लेषण।',
      }}>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-center text-primary mb-4 drop-shadow-md">
          {t('AI Palmistry', 'AI हस्तरेखा')}
        </h1>
        <p className="text-center text-muted-foreground mb-5">
          {t('Discover what the lines on your palm reveal about your life, heart, and destiny.', 'जानें कि आपकी हथेली की रेखाएं आपके जीवन, हृदय और भाग्य के बारे में क्या बताती हैं।')}
        </p>
        <LangToggle className="mb-8" lang={language} onChange={setLanguage} />

        {report ? (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <button 
              onClick={() => { setReport(null); setSelectedFile(null); setPreviewUrl(null); }}
              className="text-primary hover:underline font-medium flex items-center gap-2"
            >
              ← {t('Read Another Palm', 'दूसरी हथेली पढ़ें')}
            </button>

            <div className="bg-card/60 backdrop-blur-md border border-border/50 rounded-2xl p-6 md:p-8 space-y-8">
              <div>
                <h3 className="text-xl font-semibold text-primary mb-3">{t('Overall Reading', 'समग्र अध्ययन')}</h3>
                <p className="text-foreground/90 leading-relaxed text-lg">{report.analysis}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-background/50 p-5 rounded-xl border border-border/30">
                  <h4 className="font-semibold text-primary mb-2">{t('Life Line', 'जीवन रेखा')}</h4>
                  <p className="text-sm text-foreground/80">{report.lifeLine}</p>
                </div>
                <div className="bg-background/50 p-5 rounded-xl border border-border/30">
                  <h4 className="font-semibold text-destructive mb-2">{t('Heart Line', 'हृदय रेखा')}</h4>
                  <p className="text-sm text-foreground/80">{report.heartLine}</p>
                </div>
                <div className="bg-background/50 p-5 rounded-xl border border-border/30">
                  <h4 className="font-semibold text-blue-400 mb-2">{t('Head Line', 'मस्तिष्क रेखा')}</h4>
                  <p className="text-sm text-foreground/80">{report.headLine}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-border/50">
                {report.fateLine && (
                  <div>
                    <h4 className="font-semibold text-foreground/90 mb-1">{t('Fate Line', 'भाग्य रेखा')}</h4>
                    <p className="text-sm text-muted-foreground">{report.fateLine}</p>
                  </div>
                )}
                {report.sunLine && (
                  <div>
                    <h4 className="font-semibold text-foreground/90 mb-1">{t('Sun Line', 'सूर्य रेखा')}</h4>
                    <p className="text-sm text-muted-foreground">{report.sunLine}</p>
                  </div>
                )}
                {report.careerPrediction && (
                  <div>
                    <h4 className="font-semibold text-foreground/90 mb-1">{t('Career Outlook', 'करियर दृष्टिकोण')}</h4>
                    <p className="text-sm text-muted-foreground">{report.careerPrediction}</p>
                  </div>
                )}
                {report.fortunePrediction && (
                  <div>
                    <h4 className="font-semibold text-foreground/90 mb-1">{t('Wealth & Fortune', 'धन और भाग्य')}</h4>
                    <p className="text-sm text-muted-foreground">{report.fortunePrediction}</p>
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
                className="hidden" 
                ref={fileInputRef}
                onChange={handleFileChange}
              />
              
              {previewUrl ? (
                <div className="space-y-6">
                  <div className="relative max-w-xs mx-auto rounded-xl overflow-hidden shadow-lg border-2 border-primary/20">
                    <img src={previewUrl} alt="Palm Preview" className="w-full h-auto" />
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
                    disabled={analyzePalm.isPending}
                  >
                    {analyzePalm.isPending ? (
                      <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> {t('Reading Palm...', 'हथेली पढ़ी जा रही है...')}</>
                    ) : (
                      t('Read My Palm', 'मेरी हथेली पढ़ें')
                    )}
                  </Button>
                </div>
              ) : (
                <div className="cursor-pointer py-16 flex flex-col items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
                    <Hand className="w-10 h-10" />
                  </div>
                  <div>
                    <p className="text-xl font-medium text-foreground">{t('Take a clear photo of your dominant palm', 'अपनी प्रमुख हथेली की स्पष्ट फोटो लें')}</p>
                    <p className="text-muted-foreground mt-2">{t('Ensure good lighting and spread your fingers slightly', 'सुनिश्चित करें कि रोशनी अच्छी हो और अपनी उंगलियों को थोड़ा फैलाएं')}</p>
                  </div>
                  <Button variant="outline" className="mt-4 border-primary text-primary">
                    <Camera className="w-4 h-4 mr-2" />
                    {t('Open Camera / Gallery', 'कैमरा / गैलरी खोलें')}
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
