import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Search, Sparkles, Heart, Copy, Check, Quote, Star, Compass, Eye, BookOpen } from 'lucide-react';
import { Thought } from '../types';
import { t, translateThought } from '../utils/translation';
import siteLogo from '../assets/images/site_logo_1781429602478.jpg';

// Assistive function for deterministic views
function getViews(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash % 380) + 45;
}

interface AllThoughtsModalProps {
  thoughts: Thought[];
  currentLang: string;
  onClose: () => void;
  onLikeThought: (id: string) => void;
  onCopyThought: (thought: Thought) => void;
  copiedId: string | null;
  triggerToast: (msg: string) => void;
  isDarkMode: boolean;
  onSetDarkMode: (isDark: boolean) => void;
}

export default function AllThoughtsModal({
  thoughts,
  currentLang,
  onClose,
  onLikeThought,
  onCopyThought,
  copiedId,
  triggerToast,
  isDarkMode,
  onSetDarkMode
}: AllThoughtsModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [currentPage, setCurrentPage] = useState(1);

  // Reset page when search or category changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory]);

  // Synchronise bookmarks and ratings from localStorage
  useEffect(() => {
    const initialFavs: Record<string, boolean> = {};
    const initialRatings: Record<string, number> = {};

    thoughts.forEach((tData) => {
      initialFavs[tData.id] = localStorage.getItem(`bookmark_thought_${tData.id}`) === 'true';
      initialRatings[tData.id] = parseInt(localStorage.getItem(`rating_thought_${tData.id}`) || '5');
    });

    setFavorites(initialFavs);
    setRatings(initialRatings);
  }, [thoughts]);

  // Translate thoughts list on-the-fly
  const translatedThoughts = thoughts.map(thu => translateThought(thu, currentLang));

  // Extract unique categories
  const categories = ['all', ...Array.from(new Set(translatedThoughts.map(t => t.category)))];

  // Filter and search
  const filteredThoughts = translatedThoughts.filter((thought) => {
    const matchesSearch =
      (thought.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (thought.content || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (thought.author || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || thought.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const itemsPerPage = 9;
  const totalPages = Math.ceil(filteredThoughts.length / itemsPerPage) || 1;
  const paginatedThoughts = filteredThoughts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const toggleFavorite = (id: string, title: string) => {
    const isFav = favorites[id] || false;
    const newVal = !isFav;
    
    localStorage.setItem(`bookmark_thought_${id}`, newVal.toString());
    setFavorites(prev => ({ ...prev, [id]: newVal }));

    const favLog = JSON.parse(localStorage.getItem('library_favorites') || '[]');
    if (newVal) {
      favLog.push({
        id: `fav-${Date.now()}`,
        itemId: id,
        itemType: 'thought',
        itemTitle: title,
        date: 'الآن'
      });
      triggerToast(t('تمت إضافة [', currentLang) + title + t('] لمفضلتك وحفظت في ملفك الخاص! ❤️', currentLang));
    } else {
      const updatedLog = favLog.filter((f: any) => !(f.itemId === id));
      localStorage.setItem('library_favorites', JSON.stringify(updatedLog));
      triggerToast(t('تمت إزالة [', currentLang) + title + t('] من مفضلتك.', currentLang));
    }
  };

  const assignRating = (id: string, score: number, title: string) => {
    localStorage.setItem(`rating_thought_${id}`, score.toString());
    setRatings(prev => ({ ...prev, [id]: score }));

    const ratingsLog = JSON.parse(localStorage.getItem('library_ratings') || '[]');
    const cleanedLogs = ratingsLog.filter((r: any) => !(r.itemId === id));
    cleanedLogs.push({
      id: `rating-log-${Date.now()}`,
      itemId: id,
      itemType: 'thought',
      itemName: title,
      rating: score,
      date: 'الآن'
    });
    localStorage.setItem('library_ratings', JSON.stringify(cleanedLogs));
    triggerToast(t('تم التقييم بنجاح! ⭐', currentLang));
  };

  const isRtl = currentLang === 'AR' || currentLang === 'FA' || currentLang === 'UR';

  return (
    <div 
      dir={isRtl ? 'rtl' : 'ltr'}
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 15 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className={`w-full max-w-4xl shadow-2xl my-auto p-6 rounded-[36px] flex flex-col h-[85vh] relative border-2 transition-all duration-300 ${
          isDarkMode
            ? 'bg-gradient-to-b from-[#1C0108] via-[#2A0311] to-[#120005] border-rose-900/40 text-rose-50'
            : 'bg-gradient-to-b from-[#F2F8FF] via-[#E6F3FF] to-[#DCEEFF] border-sky-300/80 text-slate-900'
        }`}
      >
        {/* Header decoration */}
        <div className={`absolute top-0 right-1/4 left-1/4 h-[1px] bg-gradient-to-r from-transparent via-amber-400/50 to-transparent`} />
        
        {/* Modal Top Header */}
        <div className={`flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 pb-4 border-b select-none shrink-0 ${
          isDarkMode ? 'border-rose-950/40' : 'border-sky-200'
        }`}>
          {/* Logo Title Group */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center bg-white border border-slate-200 dark:border-rose-900/30 shadow-md shrink-0">
              <img
                src={siteLogo}
                alt="Dar'ee Logo"
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <h3 className={`font-extrabold font-serif text-sm md:text-base leading-none ${
                isDarkMode ? 'text-white' : 'text-sky-950'
              }`}>
                {t('ديوان الخواطر والدرر الوجدانية الكامل', currentLang)}
              </h3>
              <p className={`text-[10px] mt-1 ${isDarkMode ? 'text-rose-300/80' : 'text-sky-700'}`}>
                {t('رواق الحكمة الوجدانية والتدبر', currentLang)} • {translatedThoughts.length} {t('أطروحة فكرية', currentLang)}
              </p>
            </div>
          </div>

          {/* Theme Toggles and Close button */}
          <div className="flex items-center justify-between md:justify-end gap-3 shrink-0">
            {/* The requested Normal vs Dark color buttons ("صفحة ديوان الخواطر يتم عرض زر اللون العادي وللوان الداكن ايضا") */}
            <div className={`flex items-center gap-1.5 p-1 rounded-xl border select-none ${
              isDarkMode ? 'bg-[#350415]/60 border-rose-900/30' : 'bg-white/80 border-sky-300/50'
            }`}>
              {/* Normal Color button (اللون العادي) */}
              <button
                type="button"
                onClick={() => {
                  onSetDarkMode(false);
                  triggerToast(t('☀️ تم التبديل إلى السمة السماوية العذبة (اللون العادي) !', currentLang));
                }}
                className={`px-3 py-1 text-[10px] font-black rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                  !isDarkMode
                    ? 'bg-gradient-to-r from-sky-400 to-[#00b4d8] text-white shadow-md font-bold'
                    : 'text-slate-400 hover:text-rose-100'
                }`}
                title="اللون العادي"
              >
                <span>☀️</span>
                <span className="font-extrabold">{t('اللون العادي', currentLang)}</span>
              </button>

              {/* Dark Color button (اللون الداكن) */}
              <button
                type="button"
                onClick={() => {
                  onSetDarkMode(true);
                  triggerToast(t('🌙 تم التبديل إلى سمة الياقوت الفخمة (اللون الداكن) !', currentLang));
                }}
                className={`px-3 py-1 text-[10px] font-black rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                  isDarkMode
                    ? 'bg-gradient-to-b from-rose-700 to-rose-900 text-amber-200 shadow-md font-bold border border-rose-500/20'
                    : 'text-slate-500 hover:text-sky-950 hover:bg-slate-100'
                }`}
                title="اللون الداكن"
              >
                <span>🌙</span>
                <span className="font-extrabold">{t('اللون الداكن', currentLang)}</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                isDarkMode ? 'hover:bg-rose-950/30 text-slate-400 hover:text-white' : 'hover:bg-sky-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Filters and Search - Sticky control section inside modal */}
        <div className="py-4 space-y-3 shrink-0">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search size={14} className={`absolute top-1/2 left-3 -translate-y-1/2 ${
                isDarkMode ? 'text-rose-300/60' : 'text-sky-600'
              }`} />
              <input
                type="text"
                placeholder={t('ابحث في خواطر السكينة والدرر الوجدانية...', currentLang)}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-9 pr-4 py-2 border rounded-xl text-xs focus:outline-none transition-colors ${
                  isDarkMode
                    ? 'bg-black/40 border-rose-900/30 text-white focus:border-amber-400 placeholder:text-rose-300/40'
                    : 'bg-white border-sky-300/60 text-slate-950 focus:border-sky-500 placeholder:text-slate-400'
                }`}
              />
            </div>
            
            {/* Categories scroll area / Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full sm:max-w-xs scrollbar-none no-scrollbar">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-[10px] font-black cursor-pointer tracking-wider shrink-0 transition-all ${
                    selectedCategory === cat
                      ? 'bg-[#00b4d8] text-white shadow-md font-bold'
                      : isDarkMode
                        ? 'bg-rose-955/20 hover:bg-rose-955/35 text-rose-200 border border-rose-900/10'
                        : 'bg-white hover:bg-sky-50 text-sky-850 border border-slate-200'
                  }`}
                >
                  {cat === 'all' ? t('تصفح كافة الأقسام', currentLang) : cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Thoughts dynamic grid scroll */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4 min-h-0 select-none pb-4 scrollbar-thin">
          {filteredThoughts.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-rose-300/40">
              <Compass size={40} className="stroke-[1] animate-pulse mb-2 text-rose-350" />
              <p className={`text-xs font-bold font-serif ${isDarkMode ? 'text-rose-305' : 'text-slate-600'}`}>
                {t('لا توجد أطروحات فكرية تماثل عملية البحث الجارية بمحط الرواق', currentLang)}
              </p>
              <p className="text-[10px] mt-0.5">{t('جرب البحث بمفردة أخرى أو تغيير تصنيف الفرز', currentLang)}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {paginatedThoughts.map((thought) => {
                const isFav = favorites[thought.id] || false;
                const curRating = ratings[thought.id] || thought.rating || 5;

                return (
                  <motion.div
                    key={thought.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-3xl border transition-all flex flex-col justify-between text-right space-y-3 relative overflow-hidden ${
                      isDarkMode
                        ? 'border-rose-900/20 bg-[#350415]/40 hover:bg-[#350415]/60 hover:border-amber-400/20'
                        : 'border-sky-100 bg-white/95 shadow-sm hover:shadow-md hover:border-sky-300/60'
                    }`}
                  >
                    {/* Background decoration quote image */}
                    <Quote size={80} className={`absolute -top-4 -left-4 stroke-[0.5] select-none pointer-events-none opacity-5`} />

                    <div className="space-y-2 relative z-10">
                      {/* Top bar info */}
                      <div className="flex justify-between items-center text-[10px] font-bold">
                        <span className={`px-2 py-0.5 rounded-full border ${
                          isDarkMode
                            ? 'bg-rose-900/30 text-rose-100 border-rose-900/20'
                            : 'bg-sky-100/50 text-sky-850 border-sky-200/50'
                        }`}>
                          {thought.category}
                        </span>
                        <span className={`${isDarkMode ? 'text-rose-300/60' : 'text-slate-400'} font-mono`}>{thought.date}</span>
                      </div>

                      {/* Content block */}
                      <div className="min-h-[70px] flex items-center">
                        <p className={`text-xs md:text-sm font-serif leading-relaxed mt-1 italic font-medium ${
                          isDarkMode ? 'text-rose-100' : 'text-slate-800'
                        }`}>
                          "{thought.content}"
                        </p>
                      </div>

                      {/* Title / Accent line */}
                      <div className={`pt-2 border-t flex flex-col gap-1 ${
                        isDarkMode ? 'border-rose-955/20' : 'border-slate-100'
                      }`}>
                        <h4 className={`text-xs font-black font-serif leading-tight ${
                          isDarkMode ? 'text-amber-300' : 'text-sky-700'
                        }`}>
                          ✦ {thought.title || t('تأملات وجدانية حرة', currentLang)}
                        </h4>
                        <div className="flex justify-between items-center">
                          <span className={`text-[9px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                            {t('بقلم المبدع:', currentLang)} <span className={`font-semibold ${isDarkMode ? 'text-rose-105' : 'text-sky-950'}`}>{thought.author}</span>
                          </span>
                          
                          {/* Stars */}
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                onClick={() => assignRating(thought.id, star, thought.title || 'خاطرة')}
                                className="text-amber-500 hover:scale-120 transition-transform cursor-pointer border-none bg-transparent p-0"
                              >
                                <Star 
                                  size={10} 
                                  fill={curRating >= star ? '#f59e0b' : 'none'} 
                                  className="text-[#f59e0b] stroke-[#f59e0b]" 
                                />
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* شريط الإحصائيات الشاملة والقرّاء للخاطرة */}
                        <div className="mt-2 pt-2 border-t border-black/5 dark:border-rose-955/20 flex flex-wrap gap-2 items-center text-[9px] select-none">
                          <span className="flex items-center gap-1 font-sans font-bold bg-sky-500/10 text-[#00b4d8] dark:text-sky-300 px-1.5 py-0.5 rounded-full border border-sky-400/10">
                            <Eye size={9} />
                            <span>{getViews(thought.id)} قراءة</span>
                          </span>
                          <span className="flex items-center gap-1 font-sans font-bold bg-rose-500/10 text-rose-600 dark:text-rose-300 px-1.5 py-0.5 rounded-full border border-rose-400/10">
                            <Heart size={9} />
                            <span>{thought.likes} تفاعل</span>
                          </span>
                          <span className="flex items-center gap-1 font-sans font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded-full border border-emerald-400/10">
                            <Star size={9} className="fill-current text-amber-500" />
                            <span>{curRating}.0 التقييم</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions bar */}
                    <div className={`flex justify-between items-center pt-2 border-t relative z-10 shrink-0 ${
                      isDarkMode ? 'border-rose-955/10' : 'border-slate-100'
                    }`}>
                      <div className="flex items-center gap-1.5">
                        {/* Favorite button */}
                        <button
                          onClick={() => toggleFavorite(thought.id, thought.title || 'خاطرة')}
                          className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all cursor-pointer ${
                            isFav
                              ? isDarkMode
                                ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                                : 'bg-rose-100 text-rose-600 border-rose-200'
                              : isDarkMode
                                ? 'bg-black/30 bg-rose-955/5 hover:bg-rose-955/20 border-rose-900/30 text-slate-400 hover:text-rose-400'
                                : 'bg-white hover:bg-sky-50 border-slate-200 text-slate-500 hover:text-rose-600'
                          }`}
                          title={t('حفظ بمفضلتي', currentLang)}
                        >
                          <Heart size={12} fill={isFav ? 'currentColor' : 'none'} />
                        </button>

                        {/* Copy button */}
                        <button
                          onClick={() => onCopyThought(thought)}
                          className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all cursor-pointer ${
                            isDarkMode
                              ? 'border-rose-900/30 bg-black/30 text-rose-300 hover:text-amber-400'
                              : 'border-slate-200 bg-white text-sky-700 hover:text-sky-900 hover:bg-sky-50'
                          }`}
                          title={t('نسخ نص الأطروحة للذاكرة', currentLang)}
                        >
                          {copiedId === thought.id ? (
                            <Check size={12} className="text-emerald-500 font-bold" />
                          ) : (
                            <Copy size={12} />
                          )}
                        </button>
                      </div>

                      {/* Likes count indicator */}
                      <button
                        onClick={() => onLikeThought(thought.id)}
                        className={`px-2.5 py-1 rounded-full text-[9px] font-black border flex items-center gap-1 cursor-pointer transition-colors ${
                          isDarkMode
                            ? 'bg-amber-400/10 hover:bg-amber-400/25 text-amber-400 border-amber-300/10'
                            : 'bg-sky-50 hover:bg-sky-100 text-sky-850 border-sky-200'
                        }`}
                      >
                        <span>👍</span>
                        <span>{thought.likes}</span>
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pagination controls for thoughts */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 py-3 shrink-0 select-none">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              className={`p-1.5 px-3 text-[10px] font-black rounded-xl transition-all cursor-pointer border ${
                isDarkMode 
                  ? 'bg-rose-950/40 border-rose-900/30 text-rose-200 hover:bg-rose-950/60 disabled:opacity-35' 
                  : 'bg-white border-sky-300/[0.25] text-slate-800 hover:bg-sky-50 disabled:opacity-35'
              }`}
            >
              {currentLang === 'ar' ? 'السابق' : 'Previous'}
            </button>
            
            <span className={`text-[11px] font-black px-3.5 py-1.5 rounded-lg border ${
              isDarkMode 
                ? 'bg-rose-900/10 border-rose-900/30 text-amber-300 font-bold' 
                : 'bg-sky-50 border-sky-200 text-sky-850 font-bold'
            }`}>
              {currentPage}
            </span>

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              className={`p-1.5 px-3 text-[10px] font-black rounded-xl transition-all cursor-pointer border ${
                isDarkMode 
                  ? 'bg-rose-950/40 border-rose-900/30 text-rose-200 hover:bg-rose-950/60 disabled:opacity-35' 
                  : 'bg-white border-sky-300/[0.25] text-slate-800 hover:bg-sky-50 disabled:opacity-35'
              }`}
            >
              {currentLang === 'ar' ? 'التالي' : 'Next'}
            </button>
          </div>
        )}

        {/* Bottom controls */}
        <div className={`pt-3 border-t select-none text-left shrink-0 ${
          isDarkMode ? 'border-rose-955/35' : 'border-sky-100'
        }`}>
          <button
            onClick={onClose}
            className={`px-5 py-2 border text-xs rounded-xl cursor-pointer transition-colors ${
              isDarkMode
                ? 'bg-rose-950/40 hover:bg-rose-950/70 border-rose-900/30 text-rose-200 hover:text-white'
                : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700 hover:text-slate-900'
            }`}
          >
            {t('أغلق اللوحة', currentLang)}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
