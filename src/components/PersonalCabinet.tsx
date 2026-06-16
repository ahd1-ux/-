import React, { useState } from 'react';
import { Bookmark, Heart, Star, BookOpen, Sparkles, CreditCard, Quote } from 'lucide-react';
import { Book, Article, Review, UserSession } from '../types';

interface PersonalCabinetProps {
  books: Book[];
  articles: Article[];
  reviews: Review[];
  session: UserSession;
  onSelectBook: (book: Book) => void;
  onSelectArticle: (art: Article) => void;
  triggerToast: (msg: string) => void;
}

export default function PersonalCabinet({
  books,
  articles,
  reviews,
  session,
  onSelectBook,
  onSelectArticle,
  triggerToast
}: PersonalCabinetProps) {
  const [activeTab, setActiveTab] = useState<'bookmarks' | 'favorites' | 'ratings'>('bookmarks');

  // filter bookmarks
  const bookmarkedBooks = books.filter(b => localStorage.getItem(`bookmark_${b.id}`) === 'true');
  
  // filter favorites
  const favoriteArticles = articles.filter(a => localStorage.getItem(`liked_article_${a.id}`) === 'true');
  const favoriteBooks = books.filter(b => localStorage.getItem(`liked_book_${b.id}`) === 'true');

  // filter ratings written by user
  const userReviews = reviews.filter(
    r => r.userId === `u-${session.username}` || r.authorName.includes(session.name)
  );

  const handleRemoveBookmark = (bookId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    localStorage.removeItem(`bookmark_${bookId}`);
    triggerToast('تمت إزالة الكتاب من المحفوظات بنجاح 📌');
  };

  const handleRemoveFavoriteArt = (artId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    localStorage.removeItem(`liked_article_${artId}`);
    triggerToast('تمت إزالة المقال من المفضلة 🤍');
  };

  return (
    <div className="bg-white/10 dark:bg-black/30 backdrop-blur-md rounded-3xl p-5 border border-white/20 dark:border-rose-955/40 shadow-xl space-y-4 font-sans select-none">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-amber-400/20 text-amber-300 rounded-xl">
            <Sparkles size={16} className="animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-800 dark:text-rose-105 font-serif">ركن سكينة الهدوء والمطالعة الخاصة بك</h3>
            <p className="text-[10px] text-slate-600 dark:text-rose-300/80">لوحتك التفاعلية لحفظ المواد، المقالات المفضلة، وتقييماتك للمؤلفات</p>
          </div>
        </div>

        {/* Tab triggers */}
        <div className="flex flex-wrap gap-2 text-[10px]">
          <button
            onClick={() => setActiveTab('bookmarks')}
            className={`px-4 py-2 transition-all cursor-pointer flex items-center gap-1.5 font-bold shadow-md hover:scale-105 active:scale-95 rounded-tr-[18px] rounded-bl-[18px] rounded-tl-[8px] rounded-br-[8px] border ${
              activeTab === 'bookmarks'
                ? 'bg-gradient-to-tr from-amber-400 to-amber-300 text-slate-950 border-amber-300 ring-2 ring-amber-400/20'
                : 'bg-white/20 dark:bg-slate-900 border-white/20 dark:border-rose-955/20 text-slate-700 dark:text-slate-300 hover:bg-white/30'
            }`}
          >
            <Bookmark size={11} />
            <span>المحفوظات السريعة ({bookmarkedBooks.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('favorites')}
            className={`px-4 py-2 transition-all cursor-pointer flex items-center gap-1.5 font-bold shadow-md hover:scale-105 active:scale-95 rounded-tr-[18px] rounded-bl-[18px] rounded-tl-[8px] rounded-br-[8px] border ${
              activeTab === 'favorites'
                ? 'bg-gradient-to-tr from-amber-400 to-amber-300 text-slate-950 border-amber-300 ring-2 ring-amber-400/20'
                : 'bg-white/20 dark:bg-slate-900 border-white/20 dark:border-rose-955/20 text-slate-700 dark:text-slate-300 hover:bg-white/30'
            }`}
          >
            <Heart size={11} />
            <span>مفضلتي ({favoriteArticles.length + favoriteBooks.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('ratings')}
            className={`px-4 py-2 transition-all cursor-pointer flex items-center gap-1.5 font-bold shadow-md hover:scale-105 active:scale-95 rounded-tr-[18px] rounded-bl-[18px] rounded-tl-[8px] rounded-br-[8px] border ${
              activeTab === 'ratings'
                ? 'bg-gradient-to-tr from-amber-400 to-amber-300 text-slate-950 border-amber-300 ring-2 ring-amber-400/20'
                : 'bg-white/20 dark:bg-slate-900 border-white/20 dark:border-rose-955/20 text-slate-700 dark:text-slate-300 hover:bg-white/30'
            }`}
          >
            <Star size={11} />
            <span>تقييماتي ({userReviews.length})</span>
          </button>
        </div>
      </div>

      {/* Tab content renders */}
      <div className="min-h-[100px] flex flex-col justify-center">
        {activeTab === 'bookmarks' && (
          <div>
            {bookmarkedBooks.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-500 dark:text-rose-300/60">
                📌 قائمة محفوظاتك خالية حالياً. اضغط على رمز الحفظ (العلامة المرجعية) لتظهر هنا.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 pb-2">
                {bookmarkedBooks.map(b => {
                  const isFreeCopy = b.isFree !== false;
                  const priceStr = b.price ? `${b.price} درهم` : '٤٥ درهم';
                  const isPurchased = localStorage.getItem(`purchased_book_${b.id}`) === 'true';
                  const curRating = b.rating || 5;
                  return (
                    <div
                      key={b.id}
                      className="rounded-tr-[40px] rounded-bl-[40px] rounded-tl-[16px] rounded-br-[16px] p-4 shadow-md border w-full flex flex-col justify-between text-right space-y-3 hover:scale-[1.015] hover:shadow-lg transition-all duration-300 relative bg-gradient-to-b from-[#f0f9ff] to-[#e0f2fe]/95 border-sky-200/40 dark:from-[#0b1e2e]/95 dark:to-[#030d16]/95 dark:border-sky-950/40 text-slate-800 dark:text-[#E2F1FF]"
                    >
                      <div className="space-y-2.5">
                        <div className="relative w-full h-[120px] rounded-tr-[32px] rounded-bl-[32px] rounded-tl-[12px] rounded-br-[12px] overflow-hidden shadow-inner border border-black/5 dark:border-rose-955/20 select-none bg-slate-950/10">
                          {b.coverImage ? (
                            <img
                              src={b.coverImage}
                              alt={b.title}
                              className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className={`w-full h-full bg-gradient-to-br ${b.coverStyle?.bg || 'from-[#1e293b] to-[#0f172a]'} p-3.5 flex flex-col justify-between text-white relative`}>
                              <span className="text-[9px] bg-white/10 px-2.5 py-0.5 rounded-full border border-white/10 self-start">{b.category}</span>
                              <div className="space-y-1 py-1">
                                <Quote size={14} className="text-amber-400 opacity-60" />
                                <h5 className="font-serif font-black text-xs leading-snug line-clamp-2">{b.title}</h5>
                              </div>
                              <span className="text-[9px] text-amber-200/90 font-bold self-end">نسخة {isFreeCopy ? 'مطالعة حرة' : 'مصنفة فاخرة'}</span>
                            </div>
                          )}

                          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 select-none font-black text-[9px]">
                            <span className="px-2.5 py-1 rounded-tr-[12px] rounded-bl-[12px] rounded-tl-[4px] rounded-br-[4px] bg-[#2563eb] text-white border border-[#4482ff]/40 flex items-center gap-1 font-bold shadow-md">
                              <span>📖</span> <span>كتاب رقمي</span>
                            </span>
                            <span className={`px-2 py-0.5 rounded-tr-[10px] rounded-bl-[10px] rounded-tl-[3px] rounded-br-[3px] text-[8px] font-bold text-center border shadow-sm ${
                              isFreeCopy 
                                ? 'bg-teal-500 text-white border-teal-400' 
                                : isPurchased 
                                ? 'bg-emerald-600 text-white border-emerald-500'
                                : 'bg-rose-600 text-white border-rose-500'
                            }`}>
                              {isFreeCopy ? 'مجاني' : isPurchased ? 'مملوك' : priceStr}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[10px] font-bold">
                          <span className="text-slate-850 dark:text-sky-200">القسم: {b.category}</span>
                          <div className="flex items-center gap-0.5 text-amber-500">
                            <span className="text-[10px] text-slate-550 dark:text-sky-305 font-mono font-bold">({curRating}.0)</span>
                            <Star size={10} fill="#f59e0b" className="text-[#f59e0b]" />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <h4
                            onClick={() => onSelectBook(b)}
                            className="text-xs md:text-sm font-black font-serif text-slate-900 dark:text-white hover:text-sky-600 dark:hover:text-amber-400 transition-colors cursor-pointer leading-snug line-clamp-1 mt-1"
                          >
                            🌸 {b.title}
                          </h4>
                          <p className="text-[9.5px] text-slate-555 dark:text-slate-400">بقلم: <span className="font-bold text-slate-705 dark:text-sky-200">{b.author}</span> • {b.readTime}</p>
                          <p className="text-[10.5px] text-slate-700 dark:text-sky-100/90 leading-relaxed font-sans line-clamp-2 mt-1.5">
                            {b.description}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="border-t border-slate-200/60 dark:border-sky-900/20 pt-3" />
                        <div className="flex justify-between items-center">
                          <button
                            onClick={(e) => handleRemoveBookmark(b.id, e)}
                            className="w-9 h-9 rounded-[12px] rounded-tr-[18px] rounded-bl-[18px] rotate-3 flex items-center justify-center border transition-all cursor-pointer shadow-md hover:rotate-12 bg-rose-500/10 text-rose-500 border-rose-500/20 hover:bg-rose-500/20 text-xs font-black"
                            title="إزالة الحفظ"
                          >
                            ✕
                          </button>
                          <button
                            onClick={() => onSelectBook(b)}
                            className="px-4 py-1.5 bg-[#00b4d8] hover:bg-[#0096c7] text-[#001D24] font-black rounded-tr-[15px] rounded-bl-[15px] rounded-tl-[5px] rounded-br-[5px] text-[10px] cursor-pointer transition-all flex items-center gap-1 shadow-md hover:scale-105 active:scale-95"
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
            )}
          </div>
        )}

        {activeTab === 'favorites' && (
          <div>
            {favoriteArticles.length === 0 && favoriteBooks.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-500 dark:text-rose-300/60">
                ❤️ قائمة مفضلتك الوجدانية خالية حالياً. اضغط على رمز القلب لتفضيل أي مادة.
              </div>
            ) : (
              <div className="space-y-8">
                {/* 1. Favorite Articles */}
                {favoriteArticles.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 border-r-2 border-emerald-500 pr-2 select-none">المقالات المفضلة</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 pb-2">
                      {favoriteArticles.map(a => {
                        const curRating = a.rating || 5;
                        return (
                          <div
                            key={a.id}
                            className="rounded-tr-[40px] rounded-bl-[40px] rounded-tl-[16px] rounded-br-[16px] p-4 shadow-md border w-full flex flex-col justify-between text-right space-y-3 hover:scale-[1.015] hover:shadow-lg transition-all duration-300 relative bg-gradient-to-b from-[#f0fdf4] to-[#dcfce7]/95 border-emerald-200/40 dark:from-[#092415]/95 dark:to-[#021008]/95 dark:border-emerald-950/40 text-slate-800 dark:text-[#E2FFE2]"
                          >
                            <div className="space-y-2.5">
                              <div className="relative w-full h-[120px] rounded-tr-[32px] rounded-bl-[32px] rounded-tl-[12px] rounded-br-[12px] overflow-hidden shadow-inner border border-black/5 dark:border-rose-955/20 select-none bg-slate-950/10">
                                {a.coverImage ? (
                                  <img
                                    src={a.coverImage}
                                    alt={a.title}
                                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                                    referrerPolicy="no-referrer"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-gradient-to-br from-[#1E020B] to-[#3D0A1B] p-3.5 flex flex-col justify-between text-white">
                                    <span className="text-[9px] bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/10 text-emerald-300 self-start">{a.category}</span>
                                    <h5 className="font-serif font-black text-xs leading-snug line-clamp-2">{a.title}</h5>
                                    <span className="text-[9px] font-mono text-rose-300/85">دراسة بقلم: {a.author}</span>
                                  </div>
                                )}

                                <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 select-none font-black text-[9px]">
                                  <span className="px-2.5 py-1 rounded-tr-[12px] rounded-bl-[12px] rounded-tl-[4px] rounded-br-[4px] bg-[#10b981] text-white border border-[#34d399]/40 flex items-center gap-1 font-bold shadow-md">
                                    <span>✍️</span> <span>مقالة وعي</span>
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center justify-between text-[10px] font-bold">
                                <span className="text-slate-850 dark:text-sky-200">القسم: {a.category}</span>
                                <div className="flex items-center gap-0.5 text-amber-500">
                                  <span className="text-[10px] text-slate-550 dark:text-sky-305 font-mono font-bold">({curRating}.0)</span>
                                  <Star size={10} fill="#f59e0b" className="text-[#f59e0b]" />
                                </div>
                              </div>

                              <div className="space-y-1">
                                <h4
                                  onClick={() => onSelectArticle(a)}
                                  className="text-xs md:text-sm font-black font-serif text-slate-900 dark:text-white hover:text-sky-600 dark:hover:text-amber-400 transition-colors cursor-pointer leading-snug line-clamp-1 mt-1"
                                >
                                  🌸 {a.title}
                                </h4>
                                <p className="text-[9.5px] text-slate-555 dark:text-slate-400">بقلم: <span className="font-bold text-slate-705 dark:text-sky-200">{a.author}</span> • {a.readTime}</p>
                                <p className="text-[10.5px] text-slate-705 dark:text-sky-100/95 leading-relaxed font-sans line-clamp-2 mt-1.55">
                                  {a.description}
                                </p>
                              </div>
                            </div>

                            <div className="space-y-3">
                              <div className="border-t border-slate-200/60 dark:border-sky-900/20 pt-3" />
                              <div className="flex justify-between items-center">
                                <button
                                  onClick={(e) => handleRemoveFavoriteArt(a.id, e)}
                                  className="w-9 h-9 rounded-[12px] rounded-tr-[18px] rounded-bl-[18px] rotate-3 flex items-center justify-center border transition-all cursor-pointer shadow-md hover:rotate-12 bg-rose-500/15 text-rose-500 border-rose-500/30 text-xs"
                                  title="إزالة المفضلة"
                                >
                                  ❤️
                                </button>
                                <button
                                  onClick={() => onSelectArticle(a)}
                                  className="px-4 py-1.5 bg-[#00b4d8] hover:bg-[#0096c7] text-[#001D24] font-black rounded-tr-[15px] rounded-bl-[15px] rounded-tl-[5px] rounded-br-[5px] text-[10px] cursor-pointer transition-all flex items-center gap-1 shadow-md hover:scale-105 active:scale-95"
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
                )}

                {/* 2. Favorite Books */}
                {favoriteBooks.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-sky-600 dark:text-sky-400 border-r-2 border-sky-500 pr-2 select-none">الكتب المفضلة</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 pb-2">
                      {favoriteBooks.map(b => {
                        const isFreeCopy = b.isFree !== false;
                        const priceStr = b.price ? `${b.price} درهم` : '٤٥ درهم';
                        const isPurchased = localStorage.getItem(`purchased_book_${b.id}`) === 'true';
                        const curRating = b.rating || 5;
                        return (
                          <div
                            key={b.id}
                            className="rounded-tr-[40px] rounded-bl-[40px] rounded-tl-[16px] rounded-br-[16px] p-4 shadow-md border w-full flex flex-col justify-between text-right space-y-3 hover:scale-[1.015] hover:shadow-lg transition-all duration-300 relative bg-gradient-to-b from-[#f0f9ff] to-[#e0f2fe]/95 border-sky-200/40 dark:from-[#0b1e2e]/95 dark:to-[#030d16]/95 dark:border-sky-950/40 text-slate-800 dark:text-[#E2F1FF]"
                          >
                            <div className="space-y-2.5">
                              <div className="relative w-full h-[120px] rounded-tr-[32px] rounded-bl-[32px] rounded-tl-[12px] rounded-br-[12px] overflow-hidden shadow-inner border border-black/5 dark:border-rose-955/20 select-none bg-slate-950/10">
                                {b.coverImage ? (
                                  <img
                                    src={b.coverImage}
                                    alt={b.title}
                                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                                    referrerPolicy="no-referrer"
                                  />
                                ) : (
                                  <div className={`w-full h-full bg-gradient-to-br ${b.coverStyle?.bg || 'from-[#1e293b] to-[#0f172a]'} p-3.5 flex flex-col justify-between text-white relative`}>
                                    <span className="text-[9px] bg-white/10 px-2.5 py-0.5 rounded-full border border-white/10 self-start">{b.category}</span>
                                    <div className="space-y-1 py-1">
                                      <Quote size={14} className="text-amber-400 opacity-60" />
                                      <h5 className="font-serif font-black text-xs leading-snug line-clamp-2">{b.title}</h5>
                                    </div>
                                    <span className="text-[9px] text-amber-200/90 font-bold self-end">نسخة {isFreeCopy ? 'مطالعة حرة' : 'مصنفة فاخرة'}</span>
                                  </div>
                                )}

                                <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 select-none font-black text-[9px]">
                                  <span className="px-2.5 py-1 rounded-tr-[12px] rounded-bl-[12px] rounded-tl-[4px] rounded-br-[4px] bg-[#2563eb] text-white border border-[#4482ff]/40 flex items-center gap-1 font-bold shadow-md">
                                    <span>📖</span> <span>كتاب رقمي</span>
                                  </span>
                                  <span className={`px-2 py-0.5 rounded-tr-[10px] rounded-bl-[10px] rounded-tl-[3px] rounded-br-[3px] text-[8px] font-bold text-center border shadow-sm ${
                                    isFreeCopy 
                                      ? 'bg-teal-500 text-white border-teal-400' 
                                      : isPurchased 
                                      ? 'bg-emerald-600 text-white border-emerald-500'
                                      : 'bg-rose-600 text-white border-rose-500'
                                  }`}>
                                    {isFreeCopy ? 'مجاني' : isPurchased ? 'مملوك' : priceStr}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center justify-between text-[10px] font-bold">
                                <span className="text-slate-850 dark:text-sky-200">القسم: {b.category}</span>
                                <div className="flex items-center gap-0.5 text-amber-500">
                                  <span className="text-[10px] text-slate-550 dark:text-sky-305 font-mono font-bold">({curRating}.0)</span>
                                  <Star size={10} fill="#f59e0b" className="text-[#f59e0b]" />
                                </div>
                              </div>

                              <div className="space-y-1">
                                <h4
                                  onClick={() => onSelectBook(b)}
                                  className="text-xs md:text-sm font-black font-serif text-slate-900 dark:text-white hover:text-sky-600 dark:hover:text-amber-400 transition-colors cursor-pointer leading-snug line-clamp-1 mt-1"
                                >
                                  🌸 {b.title}
                                </h4>
                                <p className="text-[9.5px] text-slate-555 dark:text-slate-400">بقلم: <span className="font-bold text-slate-705 dark:text-sky-200">{b.author}</span> • {b.readTime}</p>
                                <p className="text-[10.5px] text-slate-700 dark:text-sky-101/90 leading-relaxed font-sans line-clamp-2 mt-1.5">
                                  {b.description}
                                </p>
                              </div>
                            </div>

                            <div className="space-y-3">
                              <div className="border-t border-slate-200/60 dark:border-sky-900/20 pt-3" />
                              <div className="flex justify-between items-center">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    localStorage.removeItem(`liked_book_${b.id}`);
                                    triggerToast('تمت إزالة الكتاب من المفضلة 🤍');
                                  }}
                                  className="w-9 h-9 rounded-[12px] rounded-tr-[18px] rounded-bl-[18px] rotate-3 flex items-center justify-center border transition-all cursor-pointer shadow-md hover:rotate-12 bg-rose-500/15 text-rose-500 border-rose-500/30 text-xs"
                                  title="إزالة المفضلة"
                                >
                                  ❤️
                                </button>
                                <button
                                  onClick={() => onSelectBook(b)}
                                  className="px-4 py-1.5 bg-[#00b4d8] hover:bg-[#0096c7] text-[#001D24] font-black rounded-tr-[15px] rounded-bl-[15px] rounded-tl-[5px] rounded-br-[5px] text-[10px] cursor-pointer transition-all flex items-center gap-1 shadow-md hover:scale-105 active:scale-95"
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
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'ratings' && (
          <div className="space-y-2">
            {userReviews.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-500 dark:text-rose-300/60">
                ⭐ لم تسجل أي تقييم أو مراجعة شخصية بعد. يمكنك إضافة مراجعة أو نجوم تقييم عند قراءة أي مستند أو كتاب رقمية في المكتبة.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {userReviews.map(r => (
                  <div
                    key={r.id}
                    className="p-3 bg-black/15 dark:bg-black/40 rounded-2xl border border-white/10 dark:border-rose-900/20 flex flex-col justify-between space-y-2 text-right"
                  >
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="font-bold text-amber-400">تقييمك للمادة: </span>
                      {r.rating && (
                        <div className="flex text-amber-400 font-bold select-none">
                          {Array.from({ length: r.rating }).map((_, idx) => (
                            <Star key={idx} size={10} className="fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-200 italic font-serif">"{r.content}"</p>
                    <span className="text-[9px] text-slate-400 self-end">{r.date}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
