import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Quote, Heart, Copy, Check, ChevronLeft, ChevronRight, FileText, Sparkles, Star, Eye, BookOpen } from 'lucide-react';
import { Thought, Article, UserSession } from '../types';

interface ThoughtsCarouselProps {
  thoughts: Thought[];
  articles: Article[];
  session: UserSession;
  onSelectArticle: (art: Article) => void;
  onLikeThought: (id: string) => void;
  onCopyThought: (thought: Thought) => void;
  copiedId: string | null;
  triggerToast: (msg: string) => void;
  onViewAllThoughts: () => void;
}

export default function ThoughtsCarousel({
  thoughts,
  articles,
  session,
  onSelectArticle,
  onLikeThought,
  onCopyThought,
  copiedId,
  triggerToast,
  onViewAllThoughts
}: ThoughtsCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Individual states to refresh interaction counters instantly
  const [thoughtLikes, setThoughtLikes] = useState<{ [id: string]: number }>({});
  const [favorites, setFavorites] = useState<{ [key: string]: boolean }>({});
  const [ratings, setRatings] = useState<{ [key: string]: number }>({});

  // Synchronise existing states on mount or change
  useEffect(() => {
    const initialFavs: { [key: string]: boolean } = {};
    const initialRatings: { [key: string]: number } = {};

    thoughts.forEach((t) => {
      initialFavs[`thought_${t.id}`] = localStorage.getItem(`bookmark_thought_${t.id}`) === 'true';
      initialRatings[`thought_${t.id}`] = parseInt(localStorage.getItem(`rating_thought_${t.id}`) || '5');
    });

    articles.forEach((a) => {
      initialFavs[`article_${a.id}`] = localStorage.getItem(`liked_article_${a.id}`) === 'true';
      initialRatings[`article_${a.id}`] = parseInt(localStorage.getItem(`rating_article_${a.id}`) || '5');
    });

    setFavorites(initialFavs);
    setRatings(initialRatings);
  }, [thoughts, articles]);

  const carouselThoughts = thoughts.slice(0, 6);
  const totalSlides = carouselThoughts.length > 0 ? carouselThoughts.length + 1 : 0;
  const is6thSlide = carouselThoughts.length > 0 && (currentIndex % totalSlides === carouselThoughts.length);
  const activeThought = !is6thSlide && carouselThoughts.length > 0 ? carouselThoughts[currentIndex % totalSlides] : null;

  const handleNext = () => {
    if (carouselThoughts.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
  };

  const handlePrev = () => {
    if (carouselThoughts.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  // Toggle favorite for thought or article
  const toggleFavorite = (id: string, type: 'thought' | 'article', title: string) => {
    if (session.role === 'guest') {
      triggerToast('⚠️ المفضلة مخصصة للأعضاء فقط! يرجى تسجيل الدخول أو التبديل لحساب ملهم لتسجيل مفضلاتك 🌸');
      return;
    }

    const key = `${type}_${id}`;
    const storageKey = type === 'thought' ? `bookmark_thought_${id}` : `liked_article_${id}`;
    const currentVal = favorites[key] || false;
    const newVal = !currentVal;

    // Persist
    localStorage.setItem(storageKey, newVal.toString());
    setFavorites(prev => ({ ...prev, [key]: newVal }));

    // Sync in separate file/log logic as requested
    const favLog = JSON.parse(localStorage.getItem('library_favorites') || '[]');
    if (newVal) {
      favLog.push({
        id: `fav-${Date.now()}`,
        itemId: id,
        itemType: type,
        itemTitle: title,
        username: session.username,
        name: session.name,
        date: 'الآن'
      });
      triggerToast(`❤️ تمت إضافة [${title}] لمفضلتك وحفظت في ملفك الخاص!`);
    } else {
      const updatedLog = favLog.filter((f: any) => !(f.itemId === id && f.username === session.username));
      localStorage.setItem('library_favorites', JSON.stringify(updatedLog));
      triggerToast(`🤍 تمت إزالة [${title}] من مفضلتك.`);
    }
  };

  // Assign rating (interactive for members, alert for guest)
  const assignRating = (id: string, type: 'thought' | 'article', score: number, title: string) => {
    if (session.role === 'guest') {
      triggerToast('⚠️ التقييم بالنجوم متاح للأعضاء فقط! يرجى تسجيل الدخول للمشاركة بالرأي ⭐');
      return;
    }

    const key = `${type}_${id}`;
    const storageKey = `rating_${type}_${id}`;
    localStorage.setItem(storageKey, score.toString());
    setRatings(prev => ({ ...prev, [key]: score }));

    // Persist in separate file/log of ratings
    const ratingsLog = JSON.parse(localStorage.getItem('library_ratings') || '[]');
    // remove previous identical rating
    const cleanedLogs = ratingsLog.filter((r: any) => !(r.itemId === id && r.username === session.username));
    
    cleanedLogs.push({
      id: `rating-log-${Date.now()}`,
      itemId: id,
      itemType: type,
      itemName: title,
      rating: score,
      username: session.username,
      name: session.name,
      date: 'الآن'
    });
    localStorage.setItem('library_ratings', JSON.stringify(cleanedLogs));
    triggerToast(`⭐ قيمت [${title}] بـ ${score} نجوم! تم توثيقها بملف التقييمات.`);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch select-none">
      
      {/* SECTION A: Single Thought/Thesis Card view - Left 4 Columns */}
      <div className="lg:col-span-4 flex flex-col justify-between">
        {is6thSlide ? (
          <div
            className="rounded-tr-[40px] rounded-bl-[40px] rounded-tl-[16px] rounded-br-[16px] p-4 shadow-md border w-full h-full flex flex-col justify-between text-right space-y-3.5 hover:scale-[1.015] hover:shadow-lg transition-all duration-300 relative bg-gradient-to-b from-[#fffbeb] to-[#fef3c7]/95 border-amber-300/40 dark:from-[#2e2609]/95 dark:to-[#171203]/95 dark:border-amber-900/45 text-slate-800 dark:text-amber-50"
          >
            <div className="space-y-4">
              <div className="relative w-full h-[150px] rounded-tr-[32px] rounded-bl-[32px] rounded-tl-[12px] rounded-br-[12px] overflow-hidden shadow-inner border border-amber-250/20 dark:border-amber-955/20 bg-slate-950/10 flex flex-col items-center justify-center bg-gradient-to-br from-[#fef3c7]/50 to-[#fde68a]/50 dark:from-[#3a2f0f] dark:to-[#221a08] p-4 text-center">
                <Sparkles size={38} className="text-amber-500 animate-bounce mb-1.5" />
                <h5 className="font-serif font-black text-xs md:text-sm text-yellow-850 dark:text-amber-300 leading-normal">نبض الكلمة وسحر الأطروحات الفكرية</h5>
                <p className="text-[11px] text-yellow-950 dark:text-amber-200 mt-2 leading-relaxed font-bold">
                  لقراءة المزيد من الخواطر المميزة يمكنك عرض المزيد بالنقر على زر الاستعراض في الأسفل 🌸
                </p>
              </div>

              <div className="text-center py-2 space-y-1">
                <p className="text-xs font-serif font-bold text-slate-700 dark:text-amber-100">رواق الحكمة الوجدانية والتدبر</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">انضم إلينا في جولة أدبية كاملة لمداد النور والفهم العذب.</p>
              </div>
            </div>

            <div className="space-y-4 pt-1">
              <div className="border-t border-slate-200/60 dark:border-sky-900/20 pt-4" />
              <div className="flex justify-between items-center bg-transparent">
                <button
                  onClick={onViewAllThoughts}
                  className="px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-lg text-[10px] cursor-pointer transition-all flex items-center justify-center gap-1 shadow-md hover:scale-105"
                >
                  <span>قراءة المزيد</span>
                  <span>←</span>
                </button>

                {/* Left controls: Next and Previous */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handlePrev}
                    className="w-8 h-8 rounded-full border border-slate-200/60 dark:border-rose-955/40 bg-slate-100 dark:bg-slate-800/40 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-rose-100 transition-all cursor-pointer flex items-center justify-center"
                    title="السابق"
                  >
                    <ChevronRight size={14} />
                  </button>
                  <span className="text-[10px] text-slate-555 dark:text-rose-200/60 font-mono font-bold select-none">
                    {totalSlides}
                  </span>
                  <button
                    onClick={handleNext}
                    className="w-8 h-8 rounded-full border border-slate-200/60 dark:border-rose-955/40 bg-slate-100 dark:bg-slate-800/40 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-rose-100 transition-all cursor-pointer flex items-center justify-center"
                    title="التالي"
                  >
                    <ChevronLeft size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : activeThought ? (
          <div
            className="rounded-tr-[40px] rounded-bl-[40px] rounded-tl-[16px] rounded-br-[16px] p-4 shadow-md border w-full h-full flex flex-col justify-between text-right space-y-3.5 hover:scale-[1.015] hover:shadow-lg transition-all duration-300 relative bg-gradient-to-b from-[#fff7ed] to-[#ffedd5]/95 border-amber-200/40 dark:from-[#2a1705]/95 dark:to-[#170c01]/95 dark:border-amber-950/45 text-slate-800 dark:text-amber-50"
          >
            <div className="space-y-3">
              {/* Cover Graphic Showcase portraying the quote */}
              <div className="relative w-full h-[120px] rounded-tr-[32px] rounded-bl-[32px] rounded-tl-[12px] rounded-br-[12px] overflow-hidden shadow-inner border border-yellow-250/15 dark:border-rose-955/20 select-none bg-slate-950/10 flex items-center justify-center bg-gradient-to-br from-[#ffd8be]/40 to-[#ffb5a7]/40 dark:from-[#351E11] dark:to-[#21120A] p-3 text-center">
                <Quote size={55} className="text-amber-600/10 dark:text-amber-500/10 absolute -top-1 -right-2" />
                <AnimatePresence mode="wait">
                  <motion.p
                    key={activeThought.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="font-serif font-black text-center text-slate-800 dark:text-rose-100 text-xs md:text-sm leading-relaxed line-clamp-5 z-10 px-2"
                  >
                    "{activeThought.content}"
                  </motion.p>
                </AnimatePresence>

                {/* Badge Overlay */}
                <div className="absolute top-3.5 left-3.5 flex flex-col gap-1.5 select-none font-black text-[10px]">
                  <span className="px-3.5 py-1.5 rounded-full bg-amber-500 text-slate-950 border border-amber-400 flex items-center gap-1.5 font-bold shadow-md">
                    <span>💭</span> <span>أطروحة فكرية</span>
                  </span>
                </div>
              </div>

              {/* Rating and category */}
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span className="text-slate-800 dark:text-sky-200">القسم: {activeThought.category}</span>
                <div className="flex items-center gap-1 select-none" title="اضغط لتقييم الأطروحة">
                  <span className="text-[11px] text-slate-555 dark:text-sky-305 font-mono font-bold">
                    ({ratings[`thought_${activeThought.id}`] || activeThought.rating || 5}.0)
                  </span>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const curRating = ratings[`thought_${activeThought.id}`] || activeThought.rating || 5;
                      return (
                        <button
                          key={star}
                          onClick={() => assignRating(activeThought.id, 'thought', star, activeThought.title || 'خاطرة')}
                          className="text-amber-500 hover:scale-120 transition-transform cursor-pointer border-none bg-transparent p-0"
                        >
                          <Star size={11} fill={curRating >= star ? '#f59e0b' : 'none'} className="text-[#f59e0b] stroke-[#f59e0b]" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Content text */}
              <div className="space-y-1">
                <h4
                  className="text-sm md:text-base font-black font-serif text-slate-900 dark:text-white leading-snug line-clamp-1"
                >
                  🌸 {activeThought.title || 'أطروحة وجدانية حرة'}
                </h4>
                <p className="text-[11px] text-slate-555 dark:text-slate-400">
                  بقلم المبدع: <span className="font-bold text-slate-705 dark:text-sky-200">{activeThought.author}</span> • خواطر السكينة
                </p>

                {/* شريط إحصائيات الأطروحة الفكرية العميقة */}
                <div className="mt-2.5 pt-2 border-t border-yellow-250/20 dark:border-rose-900/30 flex flex-wrap gap-2 items-center text-[9px] select-none">
                  <span className="flex items-center gap-1 font-sans font-bold bg-sky-500/10 text-[#00b4d8] dark:text-sky-300 px-1.5 py-0.5 rounded-full border border-sky-400/10">
                    <Eye size={9} />
                    <span>{Math.abs(activeThought.id.split('').reduce((acc, cChar) => acc + cChar.charCodeAt(0), 0) % 220) + 40} قراءة</span>
                  </span>
                  <span className="flex items-center gap-1 font-sans font-bold bg-rose-500/10 text-rose-600 dark:text-rose-300 px-1.5 py-0.5 rounded-full border border-rose-400/10">
                    <Heart size={9} />
                    <span>{activeThought.likes} تفاعل</span>
                  </span>
                  <span className="flex items-center gap-1 font-sans font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded-full border border-emerald-400/10">
                    <Star size={9} className="fill-current text-amber-500" />
                    <span>{ratings[`thought_${activeThought.id}`] || activeThought.rating || 5}.0 التقييم</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom tools row */}
            <div className="space-y-4 pt-1">
              <div className="border-t border-slate-200/60 dark:border-sky-900/20 pt-4" />
              <div className="flex justify-between items-center">
                
                {/* Actions group */}
                <div className="flex items-center gap-1.5">
                  {/* Favorite / Liked Bookmark circle button */}
                  <button
                    onClick={() => toggleFavorite(activeThought.id, 'thought', activeThought.title || 'أطروحة')}
                    className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all cursor-pointer ${
                      favorites[`thought_${activeThought.id}`]
                        ? 'bg-rose-500/10 text-rose-500 border-rose-500/30'
                        : 'bg-slate-100 hover:bg-slate-205 dark:bg-slate-800/40 dark:hover:bg-slate-850 border-slate-200/50 dark:border-rose-900/20 text-slate-400 hover:text-rose-500 hover:scale-105'
                    }`}
                    title="حفظ بمفضلتي"
                  >
                    <Heart size={14} fill={favorites[`thought_${activeThought.id}`] ? 'currentColor' : 'none'} />
                  </button>

                  {/* Copy button */}
                  <button
                    onClick={() => onCopyThought(activeThought)}
                    className="w-10 h-10 rounded-full flex items-center justify-center border border-slate-200/50 dark:border-rose-900/100 bg-slate-100 dark:bg-slate-800/40 text-slate-400 hover:text-amber-500 transition-all cursor-pointer hover:scale-105"
                    title="نسخ نص الأطروحة للذاكرة"
                  >
                    {copiedId === activeThought.id ? (
                      <Check size={14} className="text-emerald-500 font-bold" />
                    ) : (
                      <Copy size={14} />
                    )}
                  </button>

                  {/* Likes count up counter */}
                  <button
                    onClick={() => onLikeThought(activeThought.id)}
                    className="px-3 py-2 bg-amber-400/10 dark:bg-amber-400/5 hover:bg-amber-400/20 text-amber-700 dark:text-amber-300 rounded-full text-[10px] font-black border border-amber-300/25 flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <span>👍</span>
                    <span>{activeThought.likes}</span>
                  </button>
                </div>

                {/* Left controls: Next and Previous */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handlePrev}
                    className="w-8 h-8 rounded-full border border-slate-200/60 dark:border-rose-955/40 bg-slate-100 dark:bg-slate-800/40 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-rose-100 transition-all cursor-pointer flex items-center justify-center"
                    title="السابق"
                  >
                    <ChevronRight size={14} />
                  </button>
                  <span className="text-[10px] text-slate-555 dark:text-rose-200/60 font-mono font-bold select-none">
                    {(currentIndex % totalSlides) + 1}
                  </span>
                  <button
                    onClick={handleNext}
                    className="w-8 h-8 rounded-full border border-slate-200/60 dark:border-rose-955/40 bg-slate-100 dark:bg-slate-800/40 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-rose-100 transition-all cursor-pointer flex items-center justify-center"
                    title="التالي"
                  >
                    <ChevronLeft size={14} />
                  </button>
                </div>

              </div>
            </div>
          </div>
        ) : (
          <div className="text-center p-6 text-slate-400 font-bold text-xs">لا توجد أطروحات فكرية متوفرة بمحط الرواق الفكري</div>
        )}
      </div>

      {/* SECTION B: Studies & Articles Premium grid flow - Right 8 Columns */}
      <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        {articles.slice(0, 2).map((art) => {
          const isFav = favorites[`article_${art.id}`] || false;
          const curRating = ratings[`article_${art.id}`] || art.rating || 5;

          return (
            <div
              key={art.id}
              className="rounded-tr-[40px] rounded-bl-[40px] rounded-tl-[16px] rounded-br-[16px] p-4 shadow-md border w-full flex flex-col justify-between text-right space-y-3 hover:scale-[1.015] hover:shadow-lg transition-all duration-300 relative bg-gradient-to-b from-[#f0fdf4] to-[#dcfce7]/95 border-emerald-200/40 dark:from-[#092415]/95 dark:to-[#021008]/95 dark:border-emerald-950/40 text-slate-800 dark:text-sky-50"
            >
              <div className="space-y-3">
                {/* Cover Image Block overlay */}
                <div className="relative w-full h-[120px] rounded-tr-[32px] rounded-bl-[32px] rounded-tl-[12px] rounded-br-[12px] overflow-hidden shadow-inner border border-black/5 dark:border-rose-955/20 select-none bg-slate-950/10">
                  {art.coverImage ? (
                    <img
                      src={art.coverImage}
                      alt={art.title}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#1E020B] to-[#3D0A1B] p-4 flex flex-col justify-between text-white">
                      <span className="text-[10px] bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/10 text-emerald-300 self-start">{art.category}</span>
                      <h5 className="font-serif font-black text-xs leading-snug line-clamp-3">{art.title}</h5>
                      <span className="text-[10px] font-mono text-rose-300/85">دراسة بقلم: {art.author}</span>
                    </div>
                  )}

                  {/* Category overlay tags */}
                  <div className="absolute top-3.5 left-3.5 flex flex-col gap-1.5 select-none font-black text-[10px]">
                    <span className="px-3.5 py-1.5 rounded-full bg-[#10b981] text-white border border-[#34d399]/40 flex items-center gap-1.5 font-bold shadow-md">
                      <span>✍️</span> <span>مقالة وعي</span>
                    </span>
                  </div>
                </div>

                {/* Section rating details */}
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <span className="text-slate-800 dark:text-sky-200">القسم: {art.category}</span>
                  <div className="flex items-center gap-1 select-none" title="اضغط لتقييم المقال">
                    <span className="text-[11px] text-slate-550 dark:text-sky-305 font-mono font-bold">({curRating}.0)</span>
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => assignRating(art.id, 'article', star, art.title)}
                          className="text-amber-500 hover:scale-120 transition-transform cursor-pointer"
                        >
                          <Star size={11} fill={curRating >= star ? '#f59e0b' : 'none'} className="text-[#f59e0b] stroke-[#f59e0b]" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Article Name, Author & Description */}
                <div className="space-y-1">
                  <h4
                    onClick={() => onSelectArticle(art)}
                    className="text-sm md:text-base font-black font-serif text-slate-900 dark:text-white hover:text-[#00b4d8] transition-colors cursor-pointer leading-snug line-clamp-1"
                  >
                    🌸 {art.title}
                  </h4>
                  <p className="text-[11px] text-slate-555 dark:text-slate-400">
                    بقلم المبدع: <span className="font-bold text-slate-705 dark:text-sky-200">{art.author}</span> • {art.readTime}
                  </p>
                  <p className="text-xs text-slate-700 dark:text-sky-100/90 leading-relaxed font-sans line-clamp-2 mt-2">
                    {art.description}
                  </p>

                  {/* شريط إحصائيات المقال الشامل والقرّاء بمحط الرواق */}
                  <div className="mt-2.5 pt-2 border-t border-emerald-250/20 dark:border-emerald-900/30 flex flex-wrap gap-2 items-center text-[9px] select-none">
                    <span className="flex items-center gap-1 font-sans font-bold bg-sky-500/10 text-[#00b4d8] dark:text-sky-300 px-1.5 py-0.5 rounded-full border border-sky-400/10">
                      <Eye size={9} />
                      <span>{art.views || Math.abs(art.id.split('').reduce((acc, c)=>acc+c.charCodeAt(0), 0) % 400) + 120} قراءة</span>
                    </span>
                    <span className="flex items-center gap-1 font-sans font-bold bg-rose-500/10 text-rose-600 dark:text-rose-300 px-1.5 py-0.5 rounded-full border border-rose-400/10">
                      <Heart size={9} />
                      <span>{art.likes || 18} تفاعل</span>
                    </span>
                    <span className="flex items-center gap-1 font-sans font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded-full border border-emerald-400/10">
                      <Star size={9} className="fill-current text-amber-500" />
                      <span>{curRating}.0 التقييم</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Action buttons footer */}
              <div className="space-y-4 pt-1">
                <div className="border-t border-slate-200/60 dark:border-sky-900/20 pt-4" />
                <div className="flex justify-between items-center bg-transparent">
                  {/* Favorite Heart Circle */}
                  <button
                    onClick={() => toggleFavorite(art.id, 'article', art.title)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all cursor-pointer ${
                      isFav
                        ? 'bg-rose-500/10 text-rose-500 border-rose-500/30'
                        : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/40 dark:hover:bg-slate-850 border-slate-200/50 dark:border-rose-900/20 text-slate-400 hover:text-rose-500 hover:scale-105'
                    }`}
                    title="تضمين بقائمتي المفضلة"
                  >
                    <Heart size={14} fill={isFav ? 'currentColor' : 'none'} />
                  </button>

                  {/* Read button */}
                  <button
                    onClick={() => onSelectArticle(art)}
                    className="px-5 py-2.5 bg-[#00b4d8] hover:bg-[#0096c7] text-[#001D24] font-black rounded-full text-xs cursor-pointer transition-all flex items-center gap-1.5 shadow-md hover:scale-105"
                  >
                    <span>مطالعة الصفحة</span>
                    <span>←</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
