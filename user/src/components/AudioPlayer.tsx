/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, Globe } from 'lucide-react';
import { motion } from 'motion/react';
import { POI } from '../types/index.ts';

interface AudioPlayerProps {
    poi: POI;
    onEnded?: () => void;
}

const LANGUAGES = [
  { code: 'vi', label: '🇻🇳 Tiếng Việt' },
  { code: 'en', label: '🇬🇧 English' },
  { code: 'ja', label: '🇯🇵 日本語' },
  { code: 'zh', label: '🇨🇳 中文' },
  { code: 'ko', label: '🇰🇷 한국어' },
  { code: 'es', label: '🇪🇸 Español' },
  { code: 'fr', label: '🇫🇷 Français' }
];

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ poi, onEnded }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [lang, setLang] = useState('vi');
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Mock changing audio file when language changes
    const currentAudioUrl = `${poi.audioUrl}?lang=${lang}`;

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

    const handleLangChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setLang(e.target.value);
        setIsPlaying(false);
        setProgress(0);
        if (audioRef.current) {
            audioRef.current.load(); // Force reload audio when source changes
            setTimeout(() => setIsPlaying(true), 100); // Auto-play translated version
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
                        {LANGUAGES.map(l => (
                            <option key={l.code} value={l.code} className="bg-zinc-800 text-white">
                                {l.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <button
                    onClick={() => setIsPlaying(!isPlaying)}
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