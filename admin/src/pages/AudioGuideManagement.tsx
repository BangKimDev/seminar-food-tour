
import React, { useState } from 'react';
import { Restaurant, AudioGuide } from '@/src/types';
import { translateContent, generateTTS } from '@/src/lib/gemini';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mic2, Languages, Play, Loader2, Save, Trash2, Globe } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AudioGuideManagementProps {
  restaurants: Restaurant[];
  audioGuides: AudioGuide[];
  onAdd: (guide: Omit<AudioGuide, 'id' | 'createdAt'>) => void;
  onDelete: (id: string) => void;
}

export const AudioGuideManagement: React.FC<AudioGuideManagementProps> = ({ 
  restaurants, 
  audioGuides, 
  onAdd, 
  onDelete 
}) => {
  const [selectedResId, setSelectedResId] = useState<string>('');
  const [targetLang, setTargetLang] = useState<string>('English');
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewContent, setPreviewContent] = useState('');
  const [previewAudio, setPreviewAudio] = useState<string | null>(null);

  const languages = ['English', 'Korean', 'Japanese', 'Chinese', 'French'];

  const selectedRes = restaurants.find(r => r.id === selectedResId);
  const existingGuides = audioGuides.filter(g => g.restaurantId === selectedResId);

  const handleTranslate = async () => {
    if (!selectedRes) return;
    setIsProcessing(true);
    try {
      const translated = await translateContent(selectedRes.description, targetLang);
      setPreviewContent(translated);
      toast.success(`Đã dịch sang ${targetLang}`);
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

  const handleSave = () => {
    if (!selectedResId || !previewContent) return;
    onAdd({
      restaurantId: selectedResId,
      language: targetLang,
      content: previewContent,
      audioUrl: previewAudio || undefined
    });
    setPreviewContent('');
    setPreviewAudio(null);
    toast.success('Đã lưu thuyết minh');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left: Selection & Generation */}
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
                    <SelectItem key={l} value={l}>{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="pt-4 space-y-3">
              <Button 
                className="w-full" 
                variant="outline" 
                disabled={!selectedResId || isProcessing}
                onClick={handleTranslate}
              >
                {isProcessing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Languages className="w-4 h-4 mr-2" />}
                Dịch nội dung
              </Button>
              <Button 
                className="w-full" 
                variant="outline" 
                disabled={!previewContent || isProcessing}
                onClick={handleGenerateTTS}
              >
                {isProcessing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Mic2 className="w-4 h-4 mr-2" />}
                Sinh Audio (TTS)
              </Button>
              <Button 
                className="w-full" 
                disabled={!previewContent || isProcessing}
                onClick={handleSave}
              >
                <Save className="w-4 h-4 mr-2" />
                Lưu thuyết minh
              </Button>
            </div>
          </CardContent>
        </Card>

        {previewContent && (
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <Badge variant="outline" className="bg-white">{targetLang}</Badge>
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

      {/* Right: Existing Guides */}
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
                        <Badge>{guide.language}</Badge>
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
                          <source src={guide.audioUrl} type="audio/wav" />
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
  );
};
