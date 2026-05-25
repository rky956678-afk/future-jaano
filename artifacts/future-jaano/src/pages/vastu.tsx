import React, { useRef, useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { useLanguage } from '@/lib/language';
import { useAnalyzeVastu, VastuReport, VastuDosh } from '@workspace/api-client-react';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Camera, CheckCircle2, AlertTriangle, ShieldAlert, ShieldCheck, Shield, Sparkles, Home as HomeIcon } from 'lucide-react';
import { AuthGate } from '@/components/AuthGate';
import { LangToggle } from '@/components/LangToggle';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function VastuAnalysis() {
  const { t, language, setLanguage } = useLanguage();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [roomType, setRoomType] = useState<string>('bedroom');
  const [report, setReport] = useState<VastuReport | null>(null);

  const analyzeVastu = useAnalyzeVastu();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({ title: t('Error', 'त्रुटि'), description: 'File size must be less than 5MB', variant: 'destructive' });
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile || !previewUrl) return;
    const base64Data = previewUrl.split(',')[1];
    analyzeVastu.mutate({
      data: { imageBase64: base64Data, roomType: roomType as any, language }
    }, {
      onSuccess: (data) => {
        setReport(data);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
      onError: () => {
        toast({
          title: t('Error', 'त्रुटि'),
          description: t('Analysis failed. Please try a different photo.', 'विश्लेषण विफल। कृपया कोई अन्य फोटो आज़माएं।'),
          variant: 'destructive'
        });
      }
    });
  };

  const severityConfig = {
    high: {
      color: 'border-red-500/60 bg-red-500/10',
      badge: 'bg-red-500/20 text-red-400 border-red-500/40',
      icon: <ShieldAlert className="w-5 h-5 text-red-400" />,
      label: t('High', 'उच्च'),
    },
    medium: {
      color: 'border-amber-500/60 bg-amber-500/10',
      badge: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
      icon: <Shield className="w-5 h-5 text-amber-400" />,
      label: t('Medium', 'मध्यम'),
    },
    low: {
      color: 'border-green-500/60 bg-green-500/10',
      badge: 'bg-green-500/20 text-green-400 border-green-500/40',
      icon: <ShieldCheck className="w-5 h-5 text-green-400" />,
      label: t('Low', 'न्यून'),
    },
  };

  const getDoshConfig = (severity: string) =>
    severityConfig[severity as keyof typeof severityConfig] ?? severityConfig.medium;

  return (
    <Layout>
      <AuthGate feature={{
        icon: HomeIcon,
        titleEn: 'Balance the Energy of Your Home',
        titleHi: 'अपने घर की ऊर्जा को संतुलित करें',
        descEn: 'Upload a room photo for AI Vastu scoring with directional analysis and personalized remedies.',
        descHi: 'अपने कमरे की फोटो अपलोड करें — AI वास्तु स्कोर, दिशा विश्लेषण और व्यक्तिगत उपाय।',
      }}>
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-center text-primary mb-4 drop-shadow-md">
            {t('AI Vastu Analysis', 'AI वास्तु विश्लेषण')}
          </h1>
          <p className="text-center text-muted-foreground mb-5">
            {t(
              'Upload a photo of your room to detect Vastu doshas and get specific remedies.',
              'अपने कमरे की फोटो अपलोड करें — वास्तु दोष पहचानें और उपाय पाएं।'
            )}
          </p>
          <LangToggle className="mb-8" lang={language} onChange={setLanguage} />

          {report ? (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <button
                onClick={() => { setReport(null); setSelectedFile(null); setPreviewUrl(null); }}
                className="text-primary hover:underline font-medium flex items-center gap-2"
              >
                ← {t('Analyze Another Room', 'दूसरे कमरे का विश्लेषण करें')}
              </button>

              {/* Score + Photo */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1 space-y-4">
                  <div className="bg-card/40 backdrop-blur-md border border-border/50 rounded-2xl p-6 text-center space-y-4">
                    <h3 className="font-semibold text-foreground/80">{t('Vastu Score', 'वास्तु स्कोर')}</h3>
                    <div className="relative w-32 h-32 mx-auto flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray="100, 100"
                          className="text-border/50"
                        />
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none" stroke="currentColor" strokeWidth="3"
                          strokeDasharray={`${report.overallScore}, 100`}
                          className={`${report.overallScore > 70 ? 'text-green-500' : report.overallScore > 40 ? 'text-primary' : 'text-destructive'} transition-all duration-1000 ease-out`}
                        />
                      </svg>
                      <div className="absolute text-3xl font-bold text-foreground">{report.overallScore}</div>
                    </div>
                    <p className="text-sm text-muted-foreground capitalize">{report.roomType}</p>
                    {report.doshas && report.doshas.length > 0 && (
                      <div className="flex justify-center gap-3 text-xs flex-wrap">
                        {(['high', 'medium', 'low'] as const).map(sev => {
                          const count = report.doshas!.filter(d => d.severity === sev).length;
                          if (!count) return null;
                          const cfg = severityConfig[sev];
                          return (
                            <span key={sev} className={`px-2 py-0.5 rounded-full border font-medium ${cfg.badge}`}>
                              {count} {cfg.label}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  {previewUrl && (
                    <div className="rounded-2xl overflow-hidden border border-border/50">
                      <img src={previewUrl} alt="Room preview" className="w-full h-auto object-cover" />
                    </div>
                  )}
                </div>

                <div className="md:col-span-2 space-y-5">
                  {/* Overall Findings */}
                  <div className="bg-card/60 backdrop-blur-md border border-border/50 rounded-2xl p-5">
                    <h3 className="text-lg font-semibold text-primary mb-2">
                      {t('Overall Assessment', 'सामान्य मूल्यांकन')}
                    </h3>
                    <p className="text-foreground/90 leading-relaxed">{report.findings}</p>
                    {report.positiveAspects && (
                      <div className="mt-3 pt-3 border-t border-border/40 flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                        <p className="text-sm text-green-400/90">{report.positiveAspects}</p>
                      </div>
                    )}
                  </div>

                  {/* Vastu Doshas */}
                  {report.doshas && report.doshas.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-xl font-semibold text-destructive flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5" />
                        {t('Vastu Doshas Found', 'वास्तु दोष पाए गए')}
                        <span className="text-sm font-normal text-muted-foreground ml-1">
                          ({report.doshas.length})
                        </span>
                      </h3>
                      {report.doshas.map((dosh: VastuDosh, idx: number) => {
                        const cfg = getDoshConfig(dosh.severity);
                        return (
                          <div
                            key={idx}
                            className={`rounded-2xl border p-5 space-y-3 ${cfg.color}`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-center gap-2">
                                {cfg.icon}
                                <h4 className="font-semibold text-foreground">{dosh.name}</h4>
                              </div>
                              <span className={`text-xs px-2.5 py-1 rounded-full border font-semibold shrink-0 ${cfg.badge}`}>
                                {cfg.label} {t('Severity', 'दोष')}
                              </span>
                            </div>
                            <p className="text-sm text-foreground/80 leading-relaxed">{dosh.description}</p>
                            <div className="bg-background/40 rounded-xl p-4 border border-primary/20 space-y-1">
                              <p className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1">
                                <Sparkles className="w-3.5 h-3.5" />
                                {t('Upaay (Remedy)', 'उपाय')}
                              </p>
                              <p className="text-sm text-foreground/90 leading-relaxed">{dosh.upaay}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Color & Direction */}
                  {(report.colorRecommendations || report.directionAnalysis) && (
                    <div className="bg-card/60 backdrop-blur-md border border-border/50 rounded-2xl p-5">
                      <h3 className="text-lg font-semibold text-primary mb-4">
                        {t('Additional Recommendations', 'अतिरिक्त सुझाव')}
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {report.colorRecommendations && (
                          <div>
                            <h4 className="font-semibold text-foreground/80 mb-1 text-sm">
                              🎨 {t('Colors', 'रंग')}
                            </h4>
                            <p className="text-sm text-muted-foreground">{report.colorRecommendations}</p>
                          </div>
                        )}
                        {report.directionAnalysis && (
                          <div>
                            <h4 className="font-semibold text-foreground/80 mb-1 text-sm">
                              🧭 {t('Directions', 'दिशाएं')}
                            </h4>
                            <p className="text-sm text-muted-foreground">{report.directionAnalysis}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-xl mx-auto space-y-6">
              <div className="bg-card/40 backdrop-blur-md border border-border/50 p-6 rounded-2xl space-y-4">
                <label className="text-sm font-medium text-foreground/90">{t('Room Type', 'कमरे का प्रकार')}</label>
                <Select value={roomType} onValueChange={setRoomType}>
                  <SelectTrigger className="bg-background/50 h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bedroom">{t('Bedroom', 'शयन कक्ष')}</SelectItem>
                    <SelectItem value="kitchen">{t('Kitchen', 'रसोई घर')}</SelectItem>
                    <SelectItem value="living_room">{t('Living Room', 'बैठक कक्ष')}</SelectItem>
                    <SelectItem value="bathroom">{t('Bathroom', 'स्नानघर')}</SelectItem>
                    <SelectItem value="office">{t('Office/Study', 'कार्यालय/अध्ययन कक्ष')}</SelectItem>
                    <SelectItem value="entrance">{t('Main Entrance', 'मुख्य द्वार')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

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
                  <div className="space-y-4">
                    <div className="relative max-w-sm mx-auto rounded-xl overflow-hidden shadow-md">
                      <img src={previewUrl} alt="Preview" className="w-full h-auto" />
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2 rounded-full h-8 w-8 p-0"
                        onClick={(e) => { e.stopPropagation(); setSelectedFile(null); setPreviewUrl(null); }}
                      >
                        ✕
                      </Button>
                    </div>
                    <Button
                      onClick={handleSubmit}
                      className="w-full h-12 text-lg rounded-xl"
                      disabled={analyzeVastu.isPending}
                    >
                      {analyzeVastu.isPending ? (
                        <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> {t('Analyzing Vastu...', 'वास्तु दोष खोजे जा रहे हैं...')}</>
                      ) : (
                        t('Find Vastu Doshas & Remedies', 'वास्तु दोष और उपाय खोजें')
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="cursor-pointer py-12 flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <Camera className="w-8 h-8" />
                    </div>
                    <div>
                      <p className="text-lg font-medium text-foreground">
                        {t('Tap to upload room photo', 'कमरे की फोटो अपलोड करें')}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {t('Well-lit photos give better dosh detection', 'अच्छी रोशनी वाली फोटो से बेहतर दोष पहचान होती है')}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Info cards */}
              <div className="grid grid-cols-3 gap-3 text-center">
                {[
                  { icon: '🔍', title: t('Dosh Detection', 'दोष पहचान'), sub: t('AI spots specific defects', 'AI दोष पहचानता है') },
                  { icon: '⚠️', title: t('Severity Rating', 'गंभीरता'), sub: t('High / Medium / Low', 'उच्च / मध्यम / न्यून') },
                  { icon: '✨', title: t('Upaay', 'उपाय'), sub: t('Actionable remedies', 'व्यावहारिक उपाय') },
                ].map((item) => (
                  <div key={item.title} className="bg-card/30 border border-border/40 rounded-xl p-3">
                    <div className="text-2xl mb-1">{item.icon}</div>
                    <p className="text-xs font-semibold text-foreground/90">{item.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.sub}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </AuthGate>
    </Layout>
  );
}
