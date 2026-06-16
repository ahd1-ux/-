import React, { useState, useEffect } from 'react';
import { Book, Article, Thought, UserSession } from '../types';
import {
  BookOpen, Sparkles, FileText, Compass, Heart, Bookmark, Eye, Star, Quote, Tag, Shield, CreditCard
} from 'lucide-react';
import { t } from '../utils/translation';

interface UnifiedCardProps {
  item: Book | Article | Thought;
  type: 'book' | 'article' | 'thought';
  session: UserSession | null;
  onSelect: () => void;
  triggerToast: (msg: string) => void;
  onToggleFavorite?: (itemId: string, itemType: string, title: string) => void;
  onLike?: (itemId: string, itemType: string) => void;
  onAssignRating?: (itemId: string, itemType: string, score: number, title: string) => void;
  onPurchase?: (book: Book) => void;
  currentLang?: string;
}

export default function UnifiedCard({
  item,
  type,
  session,
  onSelect,
  triggerToast,
  onToggleFavorite,
  onLike,
  onAssignRating,
  onPurchase,
  currentLang = 'AR'
}: UnifiedCardProps) {
  const [isFav, setIsFav] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [curRating, setCurRating] = useState(5);
  const [localLikes, setLocalLikes] = useState(0);
  const [localViews, setLocalViews] = useState(128);

  // Synchronise state values via local storage or props
  useEffect(() => {
    let favKey = '';
    
    if (type === 'book') {
      favKey = `bookmark_book_${item.id}`;
      setLocalLikes((item as Book).price ? 14 : 31);
      setLocalViews((item as Book).views || Math.abs(hashCode(item.id) % 850) + 120);
    } else if (type === 'article') {
      favKey = `liked_article_${item.id}`;
      setLocalLikes((item as Article).likes || 0);
      setLocalViews((item as Article).views || Math.abs(hashCode(item.id) % 920) + 180);
    } else if (type === 'thought') {
      favKey = `bookmark_thought_${item.id}`;
      setLocalLikes((item as Thought).likes || 0);
      setLocalViews((item as Thought).views || Math.abs(hashCode(item.id) % 450) + 60);
    }

    const syncStates = () => {
      const favStatus = localStorage.getItem(favKey) === 'true' || localStorage.getItem(`bookmark_${item.id}`) === 'true';
      setIsFav(favStatus);

      const likeKey = `has_liked_click_${type}_${item.id}`;
      setIsLiked(localStorage.getItem(likeKey) === 'true');

      const ratingKey = type === 'book' ? `rating_book_${item.id}` : type === 'article' ? `rating_article_${item.id}` : `rating_thought_${item.id}`;
      const savedRating = localStorage.getItem(ratingKey) || localStorage.getItem(`rating_general_${item.id}`);
      if (savedRating) {
        setCurRating(parseInt(savedRating, 10));
      } else {
        setCurRating((item as any).rating || 5);
      }
    };

    syncStates();
    window.addEventListener('storage', syncStates);
    return () => {
      window.removeEventListener('storage', syncStates);
    };
  }, [item, type]);

  // Hash code generator for deterministic views
  function hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return hash;
  }

  // Handle Liking
  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (session?.role === 'guest') {
      triggerToast('⚠️ الإعجاب مخصص للأعضاء لتسجيل التفاعلات بشكل شخصي 🌸');
      return;
    }

    const likeKey = `has_liked_click_${type}_${item.id}`;
    if (localStorage.getItem(likeKey)) {
      triggerToast('لقد سجلت إعجابك بهذا بالفعل ✨');
      return;
    }

    localStorage.setItem(likeKey, 'true');
    setLocalLikes(prev => prev + 1);
    setIsLiked(true);
    
    if (onLike) {
      onLike(item.id, type);
    } else {
      if (type === 'article') {
        const localArts = JSON.parse(localStorage.getItem('library_articles') || '[]');
        const updated = localArts.map((a: any) => a.id === item.id ? { ...a, likes: (a.likes || 0) + 1 } : a);
        localStorage.setItem('library_articles', JSON.stringify(updated));
      } else if (type === 'thought') {
        const localThoughts = JSON.parse(localStorage.getItem('library_thoughts') || '[]');
        const updated = localThoughts.map((t: any) => t.id === item.id ? { ...t, likes: (t.likes || 0) + 1 } : t);
        localStorage.setItem('library_thoughts', JSON.stringify(updated));
      }
      triggerToast('شكراً لتسجيل تفاعلك الدائم في الرواق! ❤️');
    }
    
    window.dispatchEvent(new Event('storage'));
  };

  // Handle Bookmark Toggle
  const handleBookmarkToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (session?.role === 'guest') {
      triggerToast('⚠️ الحفظ والمفضلة يتطلب ميزة تسجيل العضوية 🌸');
      return;
    }

    const nextVal = !isFav;
    setIsFav(nextVal);

    const storageKey = type === 'book' ? `bookmark_book_${item.id}` : type === 'article' ? `liked_article_${item.id}` : `bookmark_thought_${item.id}`;
    localStorage.setItem(storageKey, nextVal.toString());
    localStorage.setItem(`bookmark_${item.id}`, nextVal.toString());
    
    const title = 'title' in item ? (item.title || 'خاطرة وجدانية') : 'خاطرة أدبية';

    if (onToggleFavorite) {
      onToggleFavorite(item.id, type, title);
    } else {
      const favLog = JSON.parse(localStorage.getItem('library_favorites') || '[]');
      if (nextVal) {
        favLog.push({
          id: `fav-unified-${Date.now()}`,
          itemId: item.id,
          itemType: type,
          itemTitle: title,
          username: session.username,
          name: session.name,
          date: 'الآن'
        });
        localStorage.setItem('library_favorites', JSON.stringify(favLog));
        triggerToast(`❤️ تمت إضافة [${title}] بنجاح لقائمتك الوجدانية المفضلة!`);
      } else {
        const updatedLog = favLog.filter((f: any) => !(f.itemId === item.id && f.username === session.username));
        localStorage.setItem('library_favorites', JSON.stringify(updatedLog));
        triggerToast(`🤍 تمت إزالة [${title}] من مفضلتك.`);
      }
    }

    window.dispatchEvent(new Event('storage'));
  };

  // Handle rating assignment
  const handleStarRating = (score: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (session?.role === 'guest') {
      triggerToast('⚠️ تقييم المحتويات بالنجوم متاح حصراً للأعضاء المسجلين 🌸');
      return;
    }

    setCurRating(score);
    const storageKey = type === 'book' ? `rating_book_${item.id}` : type === 'article' ? `rating_article_${item.id}` : `rating_thought_${item.id}`;
    localStorage.setItem(storageKey, score.toString());
    localStorage.setItem(`rating_general_${item.id}`, score.toString());

    const title = 'title' in item ? (item.title || 'خاطرة وجدانية') : 'خاطرة أدبية';

    if (onAssignRating) {
      onAssignRating(item.id, type, score, title);
    } else {
      const ratingsLog = JSON.parse(localStorage.getItem('library_ratings') || '[]');
      const cleaned = ratingsLog.filter((r: any) => !(r.itemId === item.id && r.username === session.username));
      cleaned.push({
        id: `rating-unified-${Date.now()}`,
        itemId: item.id,
        itemType: type,
        itemName: title,
        rating: score,
        username: session.username,
        name: session.name,
        date: 'الآن'
      });
      localStorage.setItem('library_ratings', JSON.stringify(cleaned));
      triggerToast(`⭐ قيمت [${title}] بـ ${score} درجات بنجاح!`);
    }

    window.dispatchEvent(new Event('storage'));
  };

  // Pricing structures
  const isABook = type === 'book';
  const bookItem = isABook ? (item as Book) : null;
  const isFreeCopy = isABook ? (bookItem?.isFree !== false) : true;
  const priceText = isABook && bookItem?.price ? `${bookItem.price} ${t('درهم', currentLang)}` : `٤٥ ${t('درهم', currentLang)}`;
  const isPurchased = isABook ? (localStorage.getItem(`purchased_book_${item.id}`) === 'true') : false;

  // Background configurations with 70% translucency
  const styles = {
    book: {
      cardBg: 'bg-gradient-to-b from-[#f0f9ff]/70 to-[#e0f2fe]/70 border-sky-300/40 dark:from-[#0b1e2e]/70 dark:to-[#030d16]/70 dark:border-sky-900/40 text-slate-800 dark:text-[#E2F1FF] backdrop-blur-lg',
      badgeBg: 'bg-[#2563eb]/70 text-white border-[#4482ff]/30 backdrop-blur-sm',
      accentColor: 'text-sky-500 dark:text-sky-305',
      starFill: '#38bdf8',
      buttonBg: 'bg-sky-500/80 hover:bg-sky-600 text-white hover:text-black/90',
      hoverRing: 'focus:ring-sky-500/30'
    },
    article: {
      cardBg: 'bg-gradient-to-b from-[#f0fdf4]/70 to-[#dcfce7]/70 border-emerald-300/40 dark:from-[#092415]/70 dark:to-[#021008]/70 dark:border-[#1F4C36]/40 text-slate-800 dark:text-emerald-50 backdrop-blur-lg',
      badgeBg: 'bg-[#10b981]/70 text-white border-[#34d399]/30 backdrop-blur-sm',
      accentColor: 'text-emerald-600 dark:text-emerald-400',
      starFill: '#34d399',
      buttonBg: 'bg-emerald-600/80 hover:bg-emerald-500 text-white',
      hoverRing: 'focus:ring-emerald-500/30'
    },
    thought: {
      cardBg: 'bg-gradient-to-b from-[#fffaf0]/70 to-[#fef3c7]/70 border-amber-300/40 dark:from-[#2d1a0c]/70 dark:to-[#1a0f05]/70 dark:border-amber-900/40 text-slate-800 dark:text-amber-50 backdrop-blur-lg',
      badgeBg: 'bg-[#f59e0b]/70 text-white border-[#fbbf24]/30 backdrop-blur-sm',
      accentColor: 'text-amber-600 dark:text-amber-400',
      starFill: '#f59e0b',
      buttonBg: 'bg-[#f59e0b]/80 hover:bg-[#d97706] text-slate-955',
      hoverRing: 'focus:ring-amber-500/30'
    }
  }[type];

  const typeLabel = {
    book: t('إصدار سحابي', currentLang),
    article: t('مقالة وعي', currentLang),
    thought: t('خاطرة إيمانية', currentLang)
  }[type];

  // Specific category icons
  const getCategoryIcon = (cat: string) => {
    const norm = (cat || '').toLowerCase();
    if (norm.includes('عقيدة') || norm.includes('توحيد') || norm.includes('إيمان')) {
      return <Shield size={10} className="shrink-0 text-rose-500" />;
    }
    if (norm.includes('فلسفة') || norm.includes('حكمة') || norm.includes('فكر')) {
      return <Sparkles size={10} className="shrink-0 text-amber-500" />;
    }
    if (norm.includes('تفسير') || norm.includes('قرآن') || norm.includes('تدبر')) {
      return <Compass size={10} className="shrink-0 text-sky-505" />;
    }
    return <Tag size={10} className="shrink-0 text-slate-400 dark:text-slate-300" />;
  };

  const itemTitle = 'title' in item ? (item.title || 'خاطرة وجدانية حرة') : 'أطروحة سكينة حرة';
  const itemAuthor = item.author || 'قلم مجهول بالرواق';
  const itemDesc = 'description' in item ? (item.description || '') : (item as Thought).content;

  // 1. Render for THOUGHT CARD (خاطرة)
  // "اما تصميم الخواطر فنفس التصميم السابق مع الغاء مدة القراءة فقط والباقي كما هو"
  if (type === 'thought') {
    return (
      <div
        onClick={onSelect}
        className={`rounded-tr-[40px] rounded-bl-[40px] rounded-tl-[16px] rounded-br-[16px] p-5 shadow-sm border w-full flex flex-col justify-between text-right space-y-4 hover:scale-[1.015] hover:shadow-md transition-all duration-350 cursor-pointer relative ${styles.cardBg}`}
      >
        <Quote size={60} className="absolute -top-3 -left-3 stroke-[0.5] select-none pointer-events-none opacity-[0.06] text-amber-500" />
        
        <div className="space-y-3 relative z-10">
          {/* Top Bar for Thoughts: Category right, views / read count left */}
          <div className="flex justify-between items-center text-[10px] font-bold select-none">
            <span className="text-slate-800 dark:text-amber-250 flex items-center gap-1 bg-black/5 dark:bg-white/5 py-0.5 px-2.5 rounded-full border border-black/5 dark:border-white/5">
              {getCategoryIcon(item.category)}
              <span>{t(item.category || typeLabel, currentLang)}</span>
            </span>

            {/* عداد القراءة عين وبجوارها رقم */}
            <span className="font-sans font-bold text-[10px] text-zinc-500 dark:text-amber-300/80 flex items-center gap-1 bg-black/5 dark:bg-white/5 py-0.5 px-2.5 rounded-full border border-black/5 dark:border-white/5">
              <Eye size={11} className="text-amber-500" />
              <span>{localViews} {t('قراءة', currentLang)}</span>
            </span>
          </div>

          {/* Central content */}
          <div className="py-2">
            <p className="text-xs md:text-sm font-serif italic text-slate-800 dark:text-amber-50 leading-relaxed font-semibold">
              "{itemDesc}"
            </p>
          </div>

          {/* Divider and Title / Rating */}
          <div className="border-t border-slate-200/40 dark:border-white/5 pt-2 flex justify-between items-center select-none text-[10px]">
            <div>
              <h5 className="font-serif font-black text-amber-600 dark:text-amber-400">✦ {itemTitle}</h5>
              <p className="text-[9px] text-slate-555 dark:text-slate-405 mt-0.5">{t('بقلم:', currentLang)} {itemAuthor}</p>
            </div>

            {/* Stars Rating and nothing else (التقييم في مكانه الأول بدون إضافات) */}
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={(e) => handleStarRating(star, e)}
                  style={{ color: curRating >= star ? styles.starFill : '#94a3b8' }}
                  className="hover:scale-120 transition-transform cursor-pointer border-none bg-transparent p-0 flex items-center mr-0.5"
                >
                  <Star size={10} fill={curRating >= star ? 'currentColor' : 'none'} className="stroke-slate-400 dark:stroke-slate-500" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Actions for Thoughts: Save, Like with count inside */}
        <div className="flex justify-between items-center pt-2.5 border-t border-slate-200/40 dark:border-white/5 select-none relative z-10">
          <div className="flex items-center gap-1.5">
            {/* Bookmark */}
            <button
              onClick={handleBookmarkToggle}
              className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all cursor-pointer ${
                isFav
                  ? 'bg-amber-500 text-slate-955 border-amber-600 shadow-sm'
                  : 'bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 border-black/5 dark:border-white/10 text-slate-400 dark:text-slate-500'
              }`}
            >
              <Bookmark size={11} fill={isFav ? 'currentColor' : 'none'} />
            </button>

            {/* Like */}
            <button
              onClick={handleLikeClick}
              className={`px-2.5 py-1 rounded-full border transition-all cursor-pointer flex items-center gap-1 text-[9.5px] ${
                isLiked
                  ? 'bg-rose-500 text-white border-rose-600'
                  : 'bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 border-black/5 dark:border-white/10 text-slate-400 dark:text-slate-500'
              }`}
            >
              <Heart size={10} fill={isLiked ? 'currentColor' : 'none'} className={isLiked ? 'text-white' : 'text-rose-500'} />
              <span className="font-mono font-bold">{localLikes}</span>
            </button>
          </div>

          <button
            onClick={onSelect}
            className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-slate-955 text-[9px] font-black rounded-lg transition-all"
          >
            {t('عرض الخاطرة', currentLang)}
          </button>
        </div>
      </div>
    );
  }

  // 2. Render for BOOK or ARTICLE CARD (كتب ومقالات)
  // Re-orchestrated exactly according to user specifies
  return (
    <div
      onClick={onSelect}
      className={`rounded-tr-[40px] rounded-bl-[40px] rounded-tl-[16px] rounded-br-[16px] p-4 shadow-md border w-full flex flex-col justify-between text-right space-y-3 hover:scale-[1.015] hover:shadow-lg transition-all duration-350 cursor-pointer relative ${styles.cardBg}`}
    >
      <div className="space-y-3">
        {/* أ. صورة المقال او الكتاب في الاعلى وعليها في اليمنين اعلى ايقونة عين مع رقم العداد وفي اليسار اعلى الصورة بشكل مائل السعر او كلمة مجاني للكتب وفي المقالات نوعها */}
        <div className="relative w-full h-[120px] rounded-tr-[32px] rounded-bl-[32px] rounded-tl-[12px] rounded-br-[12px] overflow-hidden shadow-inner border border-black/5 dark:border-rose-955/20 bg-slate-950/15">
          {'coverImage' in item && item.coverImage ? (
            <img
              src={item.coverImage}
              alt={itemTitle}
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
              referrerPolicy="no-referrer"
            />
          ) : isABook && bookItem?.coverStyle?.bg ? (
            <div className={`w-full h-full bg-gradient-to-br ${bookItem.coverStyle?.bg} p-3 flex flex-col justify-between text-white relative`}>
              <span className="text-[9px] bg-white/10 px-2 py-0.5 rounded border border-white/15 self-start">{item.category}</span>
              <div className="space-y-1">
                <Quote size={14} className="text-amber-400 opacity-60" />
                <h5 className="font-serif font-black text-[11px] leading-snug line-clamp-2">{itemTitle}</h5>
              </div>
            </div>
          ) : (
            // Fallback Cover representation
            <div className="w-full h-full bg-gradient-to-br from-[#1E020B] to-[#3D0A1B] p-3.5 flex flex-col justify-between text-white relative">
              <span className="text-[9px] bg-white/10 px-2.5 py-0.5 rounded-full border border-white/10 self-start">{t(item.category, currentLang)}</span>
              <div className="space-y-1">
                <Quote size={15} className="text-amber-400/50" />
                <h5 className="font-serif font-black text-xs leading-snug line-clamp-2">{itemTitle}</h5>
              </div>
              <span className="text-[8px] font-mono text-slate-300 opacity-80">{t('بقلم:', currentLang)} {itemAuthor}</span>
            </div>
          )}

          {/* عداد القراءة في الاعلى في اليمين: ايقونة عين مع رقم العداد */}
          <div className="absolute top-2 right-2 select-none font-sans font-black text-[9px] z-10">
            <span className="px-2 py-0.5 rounded-full bg-black/75 backdrop-blur-md text-amber-300 border border-amber-400/20 shadow-md flex items-center gap-1 font-bold">
              <Eye size={10} className="text-amber-400" />
              <span>{localViews}</span>
            </span>
          </div>

          {/* وفي اليسار اعلى الصورة بشكل مائل السعر او كلمة مجاني للكتب وفي المقالات نوعها */}
          <div className="absolute top-2 left-2 select-none font-sans font-black text-[9px] z-10">
            {isABook ? (
              <span className={`px-2 py-0.5 rounded-full shadow-md font-extrabold border block transform -rotate-12 ${
                isFreeCopy 
                  ? 'bg-teal-500 text-white border-teal-400' 
                  : isPurchased 
                  ? 'bg-emerald-600 text-white border-emerald-500'
                  : 'bg-rose-600 text-white border-rose-500'
              }`}>
                {isFreeCopy ? t('مجاني', currentLang) : priceText}
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full shadow-md font-extrabold border block transform -rotate-12 bg-[#10b981]/80 text-white border-[#34d399]/30">
                {typeLabel}
              </span>
            )}
          </div>
        </div>

        {/* ب. وتحت يكتب قسم الكتاب ومقابله التقييم - بدون أي إضافات رقمية للتقييم */}
        <div className="flex items-center justify-between text-[10px] font-bold select-none pt-0.5">
          <span className="text-slate-800 dark:text-sky-205 flex items-center gap-1 bg-black/5 dark:bg-white/5 py-0.5 px-2 rounded-full border border-black/5 dark:border-white/5">
            {getCategoryIcon(item.category)}
            <span>{t(item.category || typeLabel, currentLang)}</span>
          </span>

          {/* التقييم في مكانه الأول بدون إضافات أرقام */}
          <div className="flex items-center gap-0.5" title="أنقر للتصويت">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={(e) => handleStarRating(star, e)}
                style={{ color: curRating >= star ? styles.starFill : '#94a3b8' }}
                className="hover:scale-125 transition-transform cursor-pointer border-none bg-transparent p-0 flex items-center mr-0.5"
              >
                <Star size={10} fill={curRating >= star ? 'currentColor' : 'none'} className="stroke-slate-400 dark:stroke-slate-500" />
              </button>
            ))}
          </div>
        </div>

        {/* ج. وتحت العنوان */}
        <div className="space-y-1">
          <h4 className="text-xs md:text-sm font-black font-serif text-slate-900 dark:text-white hover:text-sky-600 dark:hover:text-[#00b4d8] transition-colors leading-snug line-clamp-1">
            🌸 {itemTitle}
          </h4>
          <p className="text-[9.5px] text-slate-555 dark:text-slate-400 font-sans">
            {t('بقلم:', currentLang)} <span className="font-bold text-slate-705 dark:text-sky-200">{itemAuthor}</span>
          </p>
          
          {/* د. وتحت مختصر */}
          <p className="text-[10px] text-slate-705 dark:text-sky-100/90 leading-relaxed font-sans line-clamp-2 mt-1.5">
            {itemDesc}
          </p>
        </div>
      </div>

      {/* هـ. وتحت رموز الحفظ والاعجاب مع رقم العداد وعرض اذا كان مجاني او مقال وشراء اذا كان الكتاب بمبلغ */}
      <div className="space-y-2 pt-1 select-none">
        <div className="border-t border-slate-200/40 dark:border-white/10 pt-2" />
        <div className="flex justify-between items-center">
          
          <div className="flex items-center gap-1.5 font-sans">
            {/* رمز الحفظ (bookmark) */}
            <button
              onClick={handleBookmarkToggle}
              className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all cursor-pointer ${
                isFav
                  ? 'bg-amber-500 text-slate-955 border-amber-600 shadow-sm'
                  : 'bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 border-black/5 dark:border-white/10 text-slate-400 dark:text-slate-500'
              }`}
              title="تضمين بقائمتي المحفوظة للرجوع السريع"
            >
              <Bookmark size={11} fill={isFav ? 'currentColor' : 'none'} className={isFav ? 'text-slate-955' : 'text-slate-400 dark:text-slate-500'} />
            </button>

            {/* رمز الإعجاب مع رقم العداد جواره */}
            <button
              onClick={handleLikeClick}
              className={`px-2.5 py-1.5 rounded-full border transition-all cursor-pointer flex items-center gap-1 text-[9.5px] ${
                isLiked
                  ? 'bg-rose-600 text-white border-rose-700 shadow-sm font-bold'
                  : 'bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 border-black/5 dark:border-white/10 text-slate-400 dark:text-slate-500'
              }`}
              title="تسجيل إعجابك وتفاعل الوعي"
            >
              <Heart size={10} fill={isLiked ? 'currentColor' : 'none'} className={isLiked ? 'text-white' : 'text-rose-500'} />
              <span className={`font-mono font-bold ${isLiked ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`}>{localLikes}</span>
            </button>
          </div>

          <div className="flex items-center gap-1">
            {isABook ? (
              <button
                onClick={onSelect}
                className={`px-3.5 py-1.5 text-white font-black rounded-lg text-[9.5px] cursor-pointer transition-all flex items-center gap-1 shadow-sm hover:scale-105 ${styles.buttonBg}`}
              >
                <span>{t('عرض المزيد', currentLang)}</span>
                <span>←</span>
              </button>
            ) : (
              <button
                onClick={onSelect}
                className={`px-3.5 py-1.5 text-white font-black rounded-lg text-[9.5px] cursor-pointer transition-all flex items-center gap-1 shadow-sm hover:scale-105 ${styles.buttonBg}`}
              >
                <span>{type === 'article' ? t('مطالعة المقال', currentLang) : t('عرض', currentLang)}</span>
                <span>←</span>
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
