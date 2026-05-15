/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, Globe } from 'lucide-react';
import { motion } from 'motion/react';
import { POI } from '../types/index.ts';
import { restaurantService } from '../services/restaurantService.ts';

interface AudioPlayerProps {
    poi: POI;
    onEnded?: () => void;
    defaultLanguage?: string;
}

const GLOBAL_LANGUAGES = [
  { code: 'vi', label: '🇻🇳 Tiếng Việt' },
  { code: 'en', label: '🇬🇧 English' },
  { code: 'ja', label: '🇯🇵 日本語' },
  { code: 'zh', label: '🇨🇳 中文' },
  { code: 'ko', label: '🇰🇷 한국어' },
  { code: 'es', label: '🇪🇸 Español' },
  { code: 'fr', label: '🇫🇷 Français' }
];

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ poi, onEnded, defaultLanguage }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const hasTrackedPlay = useRef(false);
    // Lấy danh sách audio khả dụng hoặc dùng fallback
    const audioSources = (poi.audioGuides && poi.audioGuides.length > 0) 
        ? poi.audioGuides 
        : [{ language: 'vi', audioUrl: poi.audioUrl }];

    // Khởi tạo language ban đầu
    const [lang, setLang] = useState(() => {
        const hasDefault = audioSources.find(a => a.language === defaultLanguage);
        return hasDefault ? defaultLanguage! : (audioSources[0]?.language || 'vi');
    });
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Khi đổi POI, reset lại ngôn ngữ về bản ghi đầu tiên hoặc mặc định
    useEffect(() => {
        const hasDefault = audioSources.find(a => a.language === defaultLanguage);
        setLang(hasDefault ? defaultLanguage! : (audioSources[0]?.language || 'vi'));
        hasTrackedPlay.current = false;
    }, [poi.id, defaultLanguage]);

    const currentAudioUrl = audioSources.find(a => a.language === lang)?.audioUrl || audioSources[0]?.audioUrl || '';
    const availableCodes = audioSources.map(a => a.language);
    const availableDropdown = GLOBAL_LANGUAGES.filter(l => availableCodes.includes(l.code));

    useEffect(() => {
        if (isPlaying) audioRef.current?.play();
        else audioRef.current?.pause();
    }, [isPlaying, currentAudioUrl]);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;
        const updateProgress = () => {
            if (audio.duration) {
                setProgress((audio.currentTime / audio.duration) * 100);
            }
        };
        audio.addEventListener('timeupdate', updateProgress);
        audio.addEventListener('ended', () => {
            setIsPlaying(false);
            onEnded?.();
        });
        return () => {
            audio.removeEventListener('timeupdate', updateProgress);
            // remove ended listener handled automatically or ignored here
        };
    }, [onEnded]);

    const handlePlay = () => {
        if (!hasTrackedPlay.current) {
            hasTrackedPlay.current = true;
            restaurantService.recordAudioPlay(poi.id);
        }
        setIsPlaying(!isPlaying);
    };

    const handleLangChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setLang(e.target.value);
        setIsPlaying(false);
        setProgress(0);
        if (audioRef.current) {
            audioRef.current.load(); // Force reload audio when source changes
            setTimeout(() => setIsPlaying(true), 100); // Auto-play translated version
            if (!hasTrackedPlay.current) {
                hasTrackedPlay.current = true;
                restaurantService.recordAudioPlay(poi.id);
            }
        }
    };

    return (
        <div className="bg-zinc-900 text-white p-4 rounded-2xl shadow-lg border border-white/10 space-y-4">
            <audio ref={audioRef} src={currentAudioUrl} />
            
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">Audio Guide</p>
                <div className="relative flex items-center bg-zinc-800 rounded-lg px-2 py-1 cursor-pointer">
                    <Globe size={14} className="text-emerald-500 mr-1.5" />
                    <select 
                        value={lang} 
                        onChange={handleLangChange} 
                        className="bg-transparent text-sm font-semibold text-zinc-200 outline-none cursor-pointer appearance-none pr-4"
                    >
                        {availableDropdown.map(l => (
                            <option key={l.code} value={l.code} className="bg-zinc-800 text-white">
                                {l.label}
                            </option>
                        ))}
                        {availableDropdown.length === 0 && (
                            <option value="vi" className="bg-zinc-800 text-white">Chưa có bản dịch</option>
                        )}
                    </select>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <button
                    onClick={handlePlay}
                    className="w-12 h-12 shrink-0 bg-emerald-500 rounded-full flex items-center justify-center hover:bg-emerald-400 transition-colors"
                >
                    {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
                </button>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{poi.name}</p>
                    <div className="mt-2 h-1 bg-white/20 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-emerald-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ ease: "linear", duration: 0.2 }}
                        />
                    </div>
                </div>
                <Volume2 size={20} className="text-zinc-400 shrink-0" />
            </div>
        </div>
    );
};