
import React, { useState } from 'react';
import { Restaurant, AudioGuide } from '../types';
import { translateContent, generateTTS, batchTranslate } from '../lib/gemini';
import { uploadService } from '../services/uploadService';
import { useAudioGuides } from '../hooks/useAudioGuides';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Mic2, Languages, Play, Loader2, Save, Trash2, Globe, Upload, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AudioGuideManagementProps {
  restaurants: Restaurant[];
  audioGuides: AudioGuide[];
  onAdd: (guide: Omit<AudioGuide, 'id' | 'createdAt'>) => void;
  onDelete: (id: string) => void;
}

const LANGUAGE_MAP: Record<string, { code: string; displayName: string }> = {
  vi: { code: 'vi', displayName: 'Tiếng Việt' },
  en: { code: 'en', displayName: 'English' },
  zh: { code: 'zh', displayName: '中文' },
  ja: { code: 'ja', displayName: '日本語' },
  ko: { code: 'ko', displayName: '한국어' },
  fr: { code: 'fr', displayName: 'Français' },
  es: { code: 'es', displayName: 'Español' },
};

export const AudioGuideManagement: React.FC<AudioGuideManagementProps> = ({ 
  restaurants, 
  audioGuides: _ignoredData, 
  onAdd: _ignoredAdd, 
  onDelete: _ignoredDelete 
}) => {
  const [selectedResId, setSelectedResId] = useState<string>('');
  const { audioGuides: existingGuides, addAudioGuide: onAdd, deleteAudioGuide: onDelete } = useAudioGuides(selectedResId);
  const [targetLang, setTargetLang] = useState<string>('en');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);
  const [batchProgress, setBatchProgress] = useState('');
  const [batchDone, setBatchDone] = useState(0);
  const [batchTotal, setBatchTotal] = useState(0);
  const [previewContent, setPreviewContent] = useState('');
  const [previewAudio, setPreviewAudio] = useState<string | null>(null);
  const [previewAudioPublicId, setPreviewAudioPublicId] = useState<string | null>(null);

  const languages = Object.values(LANGUAGE_MAP);

  const selectedRes = restaurants.find(r => r.id === selectedResId);

  const getDisplayName = (code: string) => LANGUAGE_MAP[code]?.displayName || code;

  const handleTranslate = async () => {
    if (!selectedRes) return;
    setIsProcessing(true);
    try {
      const langName = LANGUAGE_MAP[targetLang]?.displayName || targetLang;
      const translated = await translateContent(selectedRes.description, langName);
      setPreviewContent(translated);
      setPreviewAudio(null);
      setPreviewAudioPublicId(null);
      toast.success(`Đã dịch sang ${langName}`);
    } catch (error) {
      toast.error('Lỗi dịch thuật');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGenerateTTS = async () => {
    if (!previewContent) return;
    setIsProcessing(true);
    try {
      const audio = await generateTTS(previewContent);
      if (audio) {
        setPreviewAudio(audio);
        setPreviewAudioPublicId(null);
        toast.success('Đã sinh file âm thanh');
      } else {
        toast.error('Lỗi sinh âm thanh');
      }
    } catch (error) {
      toast.error('Lỗi hệ thống');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSave = async () => {
    if (!selectedResId || !previewContent) return;
    
    setIsUploading(true);
    try {
      let audioUrl: string | undefined;
      
      if (previewAudio) {
        try {
          const base64Data = previewAudio.split(',')[1] || previewAudio;
          const uploadResult = await uploadService.uploadAudio(
            base64Data,
            `guide_${selectedResId}_${targetLang}`
          );
          audioUrl = uploadResult.url;
          setPreviewAudioPublicId(uploadResult.publicId);
          toast.success('Đã upload audio lên cloud');
        } catch (uploadError) {
          console.error('Upload failed, saving without audio:', uploadError);
          toast.warning('Upload audio thất bại, lưu không có audio');
        }
      }

      onAdd({
        restaurantId: selectedResId,
        language: targetLang,
        content: previewContent,
        audioUrl,
      });
      
      setPreviewContent('');
      setPreviewAudio(null);
      setPreviewAudioPublicId(null);
      toast.success('Đã lưu thuyết minh');
    } catch (error) {
      toast.error('Lỗi lưu thuyết minh');
    } finally {
      setIsUploading(false);
    }
  };

  const handleBatchGenerate = async () => {
    if (!selectedRes) return;

    const targetLanguages = languages.filter(l => l.code !== 'vi');
    const existingCodes = new Set(existingGuides.map(g => g.language));
    const toProcess = targetLanguages.filter(l => !existingCodes.has(l.code));

    if (toProcess.length === 0) {
      toast.info('Tất cả ngôn ngữ đã được tạo thuyết minh');
      return;
    }

    setIsBatchProcessing(true);
    setBatchDone(0);
    setBatchTotal(toProcess.length);

    try {
      // Step 1: Batch translate all languages in 1 call
      setBatchProgress('Đang dịch sang tất cả ngôn ngữ...');
      const translations = await batchTranslate(selectedRes.description, toProcess.map(l => ({ code: l.code, name: l.displayName })));

      const failedLangs: string[] = [];

      // Step 2: Generate TTS + upload + save for each language
      for (let i = 0; i < toProcess.length; i++) {
        const lang = toProcess[i];
        const translatedText = translations[lang.code];

        if (!translatedText) {
          failedLangs.push(lang.displayName);
          setBatchDone(i + 1);
          continue;
        }

        setBatchProgress(`Đang tạo audio (${lang.displayName})...`);

        try {
          const audio = await generateTTS(translatedText);

          let audioUrl: string | undefined;
          if (audio) {
            setBatchProgress(`Đang upload (${lang.displayName})...`);
            const base64Data = audio.split(',')[1] || audio;
            const uploadResult = await uploadService.uploadAudio(
              base64Data,
              `guide_${selectedResId}_${lang.code}`
            );
            audioUrl = uploadResult.url;
          }

          onAdd({
            restaurantId: selectedResId,
            language: lang.code,
            content: translatedText,
            audioUrl,
          });
        } catch {
          failedLangs.push(lang.displayName);
        }

        setBatchDone(i + 1);
      }

      const successCount = toProcess.length - failedLangs.length;
      const msg = `✅ Đã tạo ${successCount}/${toProcess.length} thuyết minh`;
      if (failedLangs.length > 0) {
        toast.success(msg + ` (thất bại: ${failedLangs.join(', ')})`);
      } else {
        toast.success(msg);
      }

      setBatchProgress('');
    } catch (error) {
      toast.error('Lỗi xử lý batch');
    } finally {
      setIsBatchProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-amber-200 bg-amber-50/50">
        <CardContent className="py-3 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-amber-600" />
          <p className="text-sm text-amber-800">
            Audio sẽ được upload lên Cloudinary. Đảm bảo đã cấu hình Cloudinary trong server/.env
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg">Sinh thuyết minh mới</CardTitle>
              <CardDescription>Chọn quán ăn và ngôn ngữ để bắt đầu</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Chọn quán ăn</label>
                <Select value={selectedResId} onValueChange={setSelectedResId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn quán ăn..." />
                  </SelectTrigger>
                  <SelectContent>
                    {restaurants.map(r => (
                      <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Ngôn ngữ đích</label>
                <Select value={targetLang} onValueChange={setTargetLang}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn ngôn ngữ..." />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map(l => (
                      <SelectItem key={l.code} value={l.code}>{l.displayName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-4 space-y-3">
                <Button 
                  className="w-full" 
                  variant="outline" 
                  disabled={!selectedResId || isProcessing || isUploading}
                  onClick={handleTranslate}
                >
                  {isProcessing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Languages className="w-4 h-4 mr-2" />}
                  Dịch nội dung
                </Button>
                <Button 
                  className="w-full" 
                  variant="outline" 
                  disabled={!previewContent || isProcessing || isUploading}
                  onClick={handleGenerateTTS}
                >
                  {isProcessing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Mic2 className="w-4 h-4 mr-2" />}
                  Sinh Audio (TTS)
                </Button>

                <Separator className="my-2" />

                <Button 
                  className="w-full" 
                  variant="default"
                  disabled={!selectedResId || isBatchProcessing || isProcessing || isUploading}
                  onClick={handleBatchGenerate}
                >
                  {isBatchProcessing ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Globe className="w-4 h-4 mr-2" />
                  )}
                  Dịch & Sinh tất cả ngôn ngữ
                </Button>

                {isBatchProcessing && (
                  <div className="space-y-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                      <span>{batchProgress}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full transition-all duration-300"
                          style={{ width: `${batchTotal > 0 ? (batchDone / batchTotal) * 100 : 0}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-500 font-medium min-w-[40px] text-right">
                        {batchDone}/{batchTotal}
                      </span>
                    </div>
                  </div>
                )}

                <Button 
                  className="w-full" 
                  disabled={!previewContent || isProcessing || isUploading}
                  onClick={handleSave}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Upload audio...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Lưu thuyết minh
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {previewContent && (
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <Badge variant="outline" className="bg-white">{getDisplayName(targetLang)}</Badge>
                  {previewAudio && <Play className="w-4 h-4 text-primary animate-pulse" />}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-700 leading-relaxed italic">
                  "{previewContent}"
                </p>
                {previewAudio && (
                  <audio controls className="w-full mt-4 h-8">
                    <source src={previewAudio} type="audio/wav" />
                  </audio>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card className="border-slate-200 h-full">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Globe className="w-5 h-5 text-slate-400" />
                Thuyết minh đã lưu
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!selectedResId ? (
                <div className="h-[400px] flex flex-col items-center justify-center text-slate-400">
                  <Mic2 className="w-12 h-12 mb-2 opacity-20" />
                  <p>Chọn một quán ăn để xem danh sách thuyết minh</p>
                </div>
              ) : existingGuides.length === 0 ? (
                <div className="h-[400px] flex flex-col items-center justify-center text-slate-400">
                  <p>Chưa có thuyết minh nào cho quán ăn này</p>
                </div>
              ) : (
                <ScrollArea className="h-[500px] pr-4">
                  <div className="space-y-4">
                    {existingGuides.map((guide) => (
                      <div key={guide.id} className="p-4 rounded-lg border border-slate-100 bg-white shadow-sm space-y-3">
                        <div className="flex justify-between items-center">
                          <Badge>{getDisplayName(guide.language)}</Badge>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-red-500"
                            onClick={() => onDelete(guide.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <p className="text-sm text-slate-600 line-clamp-3">{guide.content}</p>
                        {guide.audioUrl && (
                          <audio controls className="w-full h-8">
                            <source src={guide.audioUrl} type="audio/mpeg" />
                          </audio>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
