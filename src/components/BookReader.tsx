import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Book, Review, UserSession } from '../types';
import { 
  X, ChevronRight, ChevronLeft, Bookmark, BookmarkCheck, Share2, 
  Type, ThumbsUp, Star, MessageSquareCode, CalendarDays, Check, Eye,
  BookOpen, FileType, MessageSquare, CornerDownLeft, Copy
} from 'lucide-react';

interface BookReaderProps {
  book: Book;
  session: UserSession;
  onClose: () => void;
  allReviews: Review[];
  onAddReview: (review: Review) => void;
}

export default function BookReader({ book, session, onClose, allReviews, onAddReview }: BookReaderProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [fontSize, setFontSize] = useState<'sm' | 'md' | 'lg' | 'xl'>('md');
  const [readingMode, setReadingMode] = useState<'text' | 'pdf' | 'freeCopy'>('text'); // standard text, Drive PDF, or free copyable text
  const [theme, setTheme] = useState<'light' | 'sepia' | 'dark'>('sepia');
  const [bookmarked, setBookmarked] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedFree, setCopiedFree] = useState(false);
  const [showReviewsTab, setShowReviewsTab] = useState(false);

  const [hasLiked, setHasLiked] = useState(() => {
    return localStorage.getItem(`liked_book_${book.id}`) === 'true';
  });
  const [localLikes, setLocalLikes] = useState(() => {
    const isL = localStorage.getItem(`liked_book_${book.id}`) === 'true';
    return (book.isFree ? 27 : 63) + (isL ? 1 : 0);
  });
  const [localAverageRating, setLocalAverageRating] = useState(() => {
    const saved = localStorage.getItem(`rating_book_${book.id}`);
    return saved ? parseInt(saved, 10) : (book.rating || 5);
  });

  const handleLike = () => {
    if (session.role === 'guest') {
      alert('⚠️ الإعجاب بالكتب وحفظ الإحصائيات متاح للأعضاء المسجلين فقط 🌸');
      return;
    }
    const isL = localStorage.getItem(`liked_book_${book.id}`) === 'true';
    const newVal = !isL;
    localStorage.setItem(`liked_book_${book.id}`, newVal.toString());
    setHasLiked(newVal);
    setLocalLikes(prev => newVal ? prev + 1 : prev - 1);
  };

  const handleRateBookDirect = (score: number) => {
    if (session.role === 'guest') {
      alert('⚠️ التقييم التفاعلي متاح للأعضاء فقط. يرجى تسجيل الدخول بكود الوعي 🌸');
      return;
    }
    localStorage.setItem(`rating_book_${book.id}`, score.toString());
    setLocalAverageRating(score);

    const ratingsLog = JSON.parse(localStorage.getItem('library_ratings') || '[]');
    const cleaned = ratingsLog.filter((r: any) => !(r.itemId === book.id && r.username === session.username));
    cleaned.push({
      id: `rating-reader-${Date.now()}`,
      itemId: book.id,
      itemType: 'book',
      itemName: book.title,
      rating: score,
      username: session.username,
      name: session.name,
      date: 'الآن'
    });
    localStorage.setItem('library_ratings', JSON.stringify(cleaned));
  };

  // Nested replies state
  const [replyText, setReplyText] = useState<{ [reviewId: string]: string }>({});
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);

  // Filter reviews for this specific book
  const bookReviews = allReviews.filter((r) => r.itemId === book.id);

  // Load reading progress from localStorage if it exists
  useEffect(() => {
    const savedPage = localStorage.getItem(`read_progress_${book.id}`);
    if (savedPage !== null) {
      setCurrentPage(parseInt(savedPage, 10));
    }
    const isBookmarked = localStorage.getItem(`bookmark_${book.id}`) === 'true';
    setBookmarked(isBookmarked);

    // Default to PDF reading if drive link exists and no plain content is available, or keep option
    if (book.drivePdfUrl && (!book.content || book.content.length === 0 || book.content[0] === "")) {
      setReadingMode('pdf');
    }
  }, [book.id]);

  // Save current page state
  const handlePageChange = (pageNum: number) => {
    if (pageNum >= 0 && book.content && pageNum < book.content.length) {
      setCurrentPage(pageNum);
      localStorage.setItem(`read_progress_${book.id}`, pageNum.toString());
    }
  };

  const toggleBookmark = () => {
    const newVal = !bookmarked;
    setBookmarked(newVal);
    localStorage.setItem(`bookmark_${book.id}`, newVal.toString());
  };

  const handleShare = () => {
    navigator.clipboard.writeText(`${window.location.origin}/book/${book.id}`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyFreeContent = () => {
    if (book.freeCopyContent) {
      navigator.clipboard.writeText(book.freeCopyContent);
      setCopiedFree(true);
      setTimeout(() => setCopiedFree(false), 2500);
    }
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewText.trim()) return;

    const newReview: Review = {
      id: `r-user-${Date.now()}`,
      itemId: book.id,
      authorName: session.role === 'guest' ? `${session.name} (زائر)` : `${session.name} (عضو)`,
      content: reviewText.trim(),
      rating,
      date: 'الآن',
      userId: session.username,
      replies: []
    };

    onAddReview(newReview);
    setReviewText('');
    setRating(5);
  };

  const handleReplySubmit = (reviewId: string) => {
    const text = replyText[reviewId];
    if (!text || !text.trim()) return;

    // We can enrich the review in localStorage directly for instant feedback
    const localReviews: Review[] = JSON.parse(localStorage.getItem('library_reviews') || '[]');
    const targetIdx = localReviews.findIndex(r => r.id === reviewId);
    
    const replyItem = {
      id: `reply-${Date.now()}`,
      authorName: session.role === 'guest' ? `${session.name} (زائر)` : `${session.name} (عضو)`,
      content: text.trim(),
      date: 'الآن'
    };

    if (targetIdx !== -1) {
      if (!localReviews[targetIdx].replies) {
        localReviews[targetIdx].replies = [];
      }
      localReviews[targetIdx].replies!.push(replyItem);
      localStorage.setItem('library_reviews', JSON.stringify(localReviews));
    }

    // Now call onAddReview with an update mechanism or simply mutate client-side for rapid flow
    const updatedReview = allReviews.find(r => r.id === reviewId);
    if (updatedReview) {
      if (!updatedReview.replies) updatedReview.replies = [];
      updatedReview.replies.push(replyItem);
      onAddReview(updatedReview); // triggers state change in App.tsx
    }

    setReplyText(prev => ({ ...prev, [reviewId]: '' }));
    setActiveReplyId(null);
  };

  const getEmbedUrl = (url?: string) => {
    if (!url) return '';
    try {
      let embed = url;
      if (url.includes('drive.google.com')) {
        if (url.includes('/view')) {
          embed = url.split('/view')[0] + '/preview';
        } else if (url.includes('/file/d/')) {
          const parts = url.split('/file/d/');
          if (parts[1]) {
            const fileId = parts[1].split('/')[0];
            embed = `https://drive.google.com/file/d/${fileId}/preview`;
          }
        }
      }
      return embed;
    } catch (e) {
      return url;
    }
  };

  const getTextSizeClass = () => {
    switch (fontSize) {
      case 'sm': return 'text-sm md:text-base leading-relaxed';
      case 'lg': return 'text-lg md:text-2xl leading-[2]';
      case 'xl': return 'text-xl md:text-3xl leading-[2.2]';
      default: return 'text-base md:text-lg leading-loose';
    }
  };

  const getThemeClass = () => {
    switch (theme) {
      case 'light': return 'bg-white text-slate-900 border-slate-200';
      case 'dark': return 'bg-slate-950 text-slate-100 border-slate-900';
      default: return 'bg-[#FAF6EE] text-[#433422] border-[#E8DFC9]'; // sepia
    }
  };

  return (
    <div id={`book-reader-${book.id}`} className="fixed inset-0 z-50 overflow-hidden flex flex-col md:flex-row bg-black/80 backdrop-blur-md text-right select-text" dir="rtl">
      
      {/* Sidebar Drawer Container */}
      <div className="md:w-96 w-full max-h-[35vh] md:max-h-full overflow-y-auto bg-slate-900 border-l border-slate-800 text-slate-100 flex flex-col z-10 transition-all">
        {/* Book Header info */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/40 space-y-4">
          <div className="flex gap-4">
            
            {/* Custom/fallback Cover element */}
            {book.coverImage ? (
              <img 
                src={book.coverImage} 
                alt={book.title} 
                className="w-20 h-28 rounded-xl object-cover shadow-lg border border-slate-700 shrink-0"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className={`w-20 h-28 rounded-lg bg-gradient-to-br ${book.coverStyle.bg} flex flex-col justify-between p-2 shadow-md border border-white/10 text-xs shrink-0 font-serif`}>
                <span className="opacity-70 text-[8px] line-clamp-1">{book.category}</span>
                <span className="font-bold text-[10px] line-clamp-2">{book.title}</span>
                <span className="text-[8px] text-left mt-auto opacity-80">{book.author}</span>
              </div>
            )}

            <div className="flex flex-col justify-center min-w-0">
              <span className="text-[10px] text-amber-400 font-bold tracking-wider">{book.category}</span>
              <h2 className="text-base font-black font-serif text-white truncate">{book.title}</h2>
              <p className="text-slate-300 text-xs mt-1">الكاتب: {book.author}</p>
              {book.editor && (
                <p className="text-emerald-400 text-[11px] mt-0.5">المحرر: {book.editor}</p>
              )}
              <div className="flex items-center gap-2 mt-1 select-none">
                <div className="flex items-center text-amber-500">
                  <Star size={11} fill="currentColor" />
                  <span className="text-xs font-bold mr-1">
                    {bookReviews.filter(r => r.rating).length > 0
                      ? (bookReviews.reduce((acc, r) => acc + (r.rating || 0), 0) / bookReviews.filter(r => r.rating).length).toFixed(1)
                      : '٥.٠'}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400">({bookReviews.filter(r => r.rating).length} مراجعة)</span>
              </div>
            </div>
          </div>

          <p className="text-slate-300 text-xs leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-slate-800/85">
            {book.description}
          </p>

          {/* Interactive Row inside full book reader (Saves, Likes, Ratings, Views) */}
          <div className="mt-3 p-3 bg-slate-950/45 rounded-xl border border-slate-850 space-y-2.5 select-none">
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-bold">
              <span className="flex items-center gap-1">
                <Eye size={12} className="text-amber-400" />
                <span>المشاهدات المتراكمة:</span>
                <span className="font-mono text-slate-200">{book.views || 482}</span>
              </span>
              <span className="flex items-center gap-1">
                <Star size={11} className="text-amber-500 fill-amber-500" />
                <span>التقييم الحالي:</span>
                <span className="font-mono text-amber-300">{localAverageRating}.0 / 5.0</span>
              </span>
            </div>

            <div className="flex items-center justify-between gap-1 border-t border-slate-800/60 pt-2.5">
              {/* Clickable Interactive Stars for direct rating inside view */}
              <div className="flex items-center gap-1">
                <span className="text-[9.5px] text-slate-400">تقييمك:</span>
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleRateBookDirect(star)}
                      className="hover:scale-125 transition-transform cursor-pointer"
                    >
                      <Star
                        size={13}
                        fill={localAverageRating >= star ? '#eab308' : 'none'}
                        className={localAverageRating >= star ? 'text-amber-500' : 'text-slate-500'}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Liking action indicator inside of sidebar */}
              <button
                type="button"
                onClick={handleLike}
                className={`py-1.5 px-3 rounded-lg text-[10px] font-black cursor-pointer transition-all flex items-center gap-1.5 ${
                  hasLiked 
                    ? 'bg-rose-500/20 border border-rose-500/45 text-rose-400' 
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/80 hover:scale-105'
                }`}
              >
                <span>👍</span>
                <span>{hasLiked ? 'مُفضّل' : 'إعجاب'} ({localLikes})</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-800 bg-slate-900 font-medium text-xs select-none">
          <button
            onClick={() => setShowReviewsTab(false)}
            className={`flex-1 py-3 text-center border-b-2 transition-colors cursor-pointer ${
              !showReviewsTab ? 'border-amber-400 text-amber-400 font-bold bg-slate-850/40' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            الفهرس والمطالعة
          </button>
          <button
            id="book-reviews-tab-btn"
            onClick={() => setShowReviewsTab(true)}
            className={`flex-1 py-3 text-center border-b-2 transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
              showReviewsTab ? 'border-amber-400 text-amber-400 font-bold bg-slate-850/40' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <span>التفاعل ومراجعات القراء</span>
            <span className="bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded-full text-[9px]">
              {bookReviews.length}
            </span>
          </button>
        </div>

        {/* Dynamic Sidebar content */}
        <div className="flex-1 p-5 overflow-y-auto">
          {!showReviewsTab ? (
            <div className="space-y-5">
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">نمط العرض ومصدر القراءة</span>
                
                <div className="grid grid-cols-3 gap-1.5 bg-slate-950/60 p-1 rounded-xl border border-slate-800">
                  <button
                    onClick={() => setReadingMode('text')}
                    className={`py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                      readingMode === 'text' ? 'bg-amber-400 text-slate-900' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    قراءة نصية
                  </button>

                  <button
                    onClick={() => {
                      if (!book.drivePdfUrl) {
                        alert('هذا الكتاب لا يملك ملف PDF مرفوعاً من قوقل درايف حالياً.');
                        return;
                      }
                      setReadingMode('pdf');
                    }}
                    className={`py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center justify-center gap-0.5 ${
                      !book.drivePdfUrl ? 'opacity-30 cursor-not-allowed' : ''
                    } ${readingMode === 'pdf' ? 'bg-amber-400 text-slate-900' : 'text-slate-400 hover:text-white'}`}
                  >
                    <FileType size={10} />
                    <span>ملف PDF</span>
                  </button>

                  <button
                    onClick={() => {
                      if (!book.freeCopyContent) {
                        alert('هذا الكتاب لا يملك نسخة قراءة مجانية قابلة للنسخ حالياً.');
                        return;
                      }
                      setReadingMode('freeCopy');
                    }}
                    className={`py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                      !book.freeCopyContent ? 'opacity-30 cursor-not-allowed' : ''
                    } ${readingMode === 'freeCopy' ? 'bg-amber-400 text-slate-900' : 'text-slate-400 hover:text-white'}`}
                  >
                    تفريغ للنقل
                  </button>
                </div>
              </div>

              {readingMode === 'text' && book.content && book.content.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">الفصول والصفحات الموثقة</h4>
                  <div className="space-y-1.5 max-h-[40vh] overflow-y-auto pr-1">
                    {book.content.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => handlePageChange(idx)}
                        className={`w-full text-right p-2.5 rounded-xl text-xs flex items-center justify-between border transition-all cursor-pointer ${
                          currentPage === idx
                            ? 'bg-amber-400/10 border-amber-400/40 text-amber-300 font-bold'
                            : 'bg-slate-950/20 border-slate-800/80 hover:bg-slate-850/40 text-slate-300'
                        }`}
                      >
                        <span className="font-serif">الصفحة {idx + 1}</span>
                        <Eye size={12} className={currentPage === idx ? 'text-amber-400' : 'text-slate-500'} />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-slate-800 space-y-2 text-[11px] text-slate-400">
                <div className="flex justify-between">
                  <span>تاريخ النشر في المكتبة:</span>
                  <span className="text-slate-200">{book.publishDate}</span>
                </div>
                <div className="flex justify-between">
                  <span>مدة القراءة التقريبية:</span>
                  <span className="text-slate-200">{book.readTime}</span>
                </div>
                {book.editor && (
                  <div className="flex justify-between">
                    <span>محرر ومراجع النسخة:</span>
                    <span className="text-emerald-400">{book.editor}</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col h-full space-y-4">
              
              {/* Review submit forms */}
              <form onSubmit={handleReviewSubmit} className="space-y-3 bg-slate-950/40 p-4 rounded-xl border border-slate-800">
                <span className="block text-xs font-bold text-slate-300">أضف تقييمك ورأيك النقدي</span>
                
                {/* Score Selector */}
                <div className="flex items-center gap-1 select-none">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(null)}
                      onClick={() => setRating(star)}
                      className="text-amber-400 cursor-pointer p-0.5"
                    >
                      <Star
                        size={16}
                        fill={(hoverRating !== null ? hoverRating >= star : rating >= star) ? 'currentColor' : 'none'}
                      />
                    </button>
                  ))}
                  <span className="text-xs text-slate-400 mr-2">({rating} نجوم)</span>
                </div>

                <textarea
                  id="book-review-textarea"
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="اكتب ملاحظتك الأدبية، تعليقاتك تثري وتغذي عقول القراء..."
                  rows={2}
                  maxLength={400}
                  className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />

                <button
                  type="submit"
                  disabled={!reviewText.trim()}
                  className="w-full py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl text-xs transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  نشر المراجعة التفاعلية
                </button>
              </form>

              {/* Reviews Feed with replies */}
              <div className="space-y-3 overflow-y-auto max-h-[40vh] md:max-h-full">
                {bookReviews.length === 0 ? (
                  <div className="text-center py-6 text-slate-500 flex flex-col items-center gap-1">
                    <MessageSquareCode size={20} className="opacity-50" />
                    <span className="text-xs">لا يوجد مراجعات حالياً. كن الملهم الأول للفكر!</span>
                  </div>
                ) : (
                  bookReviews.slice().reverse().map((r) => (
                    <div key={r.id} className="p-3 bg-slate-950/50 border border-slate-850 rounded-xl space-y-2 text-right">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-200">{r.authorName}</span>
                        <span className="text-[9px] text-slate-500 font-sans">{r.date}</span>
                      </div>
                      
                      {r.rating && (
                        <div className="flex items-center gap-0.5 text-amber-500">
                          {Array.from({ length: r.rating }).map((_, i) => (
                            <Star key={i} size={8} fill="currentColor" className="shrink-0" />
                          ))}
                        </div>
                      )}

                      <p className="text-xs text-slate-300 leading-relaxed font-sans">{r.content}</p>

                      {/* Display replies */}
                      {r.replies && r.replies.length > 0 && (
                        <div className="mt-2 pl-0 pr-3 border-r border-slate-700/60 space-y-2 bg-black/10 py-1.5 rounded-l-md">
                          {r.replies.map((reply) => (
                            <div key={reply.id} className="text-[10px] space-y-0.5">
                              <div className="flex justify-between text-slate-400 font-bold">
                                <span>{reply.authorName}</span>
                                <span>{reply.date}</span>
                              </div>
                              <p className="text-slate-300 font-sans">{reply.content}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Reply field container */}
                      <div className="pt-1.5 flex flex-col gap-1.5 select-none">
                        {activeReplyId === r.id ? (
                          <div className="flex gap-1 items-center">
                            <input
                              type="text"
                              placeholder="أدخل ردك هنا..."
                              value={replyText[r.id] || ''}
                              onChange={(e) => setReplyText(prev => ({ ...prev, [r.id]: e.target.value }))}
                              className="grow bg-slate-900 border border-slate-800 text-[10px] p-1.5 px-2 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-sans"
                            />
                            <button
                              onClick={() => handleReplySubmit(r.id)}
                              className="bg-amber-400 text-slate-900 px-2 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer"
                            >
                              إرسال
                            </button>
                            <button
                              onClick={() => setActiveReplyId(null)}
                              className="text-slate-400 text-[10px] hover:underline px-1"
                            >
                              إلغاء
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setActiveReplyId(r.id)}
                            className="text-amber-400 hover:text-amber-300 text-[10px] tracking-wide flex items-center gap-1 font-bold cursor-pointer self-start"
                          >
                            <CornerDownLeft size={10} />
                            <span>إضافة رد تفاعلي</span>
                          </button>
                        )}
                      </div>

                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Reading Canvas */}
      <div className="flex-1 flex flex-col h-full bg-[#1e2530]">
        
        {/* Top Controls Ribbon */}
        <div className="p-4 bg-slate-900 border-b border-slate-800/80 flex items-center justify-between select-none z-20">
          <button
            id="close-reader-btn"
            onClick={onClose}
            className="p-2 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-colors cursor-pointer flex items-center gap-1 text-xs"
          >
            <X size={18} />
            <span className="hidden sm:inline">إغلاق القارئ</span>
          </button>

          {readingMode === 'text' && (
            <div className="flex items-center gap-2 sm:gap-4 text-xs">
              {/* Font Size selectors */}
              <div className="flex items-center gap-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800">
                <Type size={12} className="text-slate-400 mx-1" />
                {['sm', 'md', 'lg', 'xl'].map((sz) => (
                  <button
                    key={sz}
                    onClick={() => setFontSize(sz as any)}
                    className={`px-2 py-1 rounded-md text-[10px] cursor-pointer transition-all ${
                      fontSize === sz ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    {sz === 'sm' ? 'صغير' : sz === 'md' ? 'متوسط' : sz === 'lg' ? 'كبير' : 'ضخم'}
                  </button>
                ))}
              </div>

              {/* Theme palettes selectors */}
              <div className="flex items-center gap-1.5 bg-slate-950/60 p-1.5 rounded-xl border border-slate-800">
                {(['light', 'sepia', 'dark'] as const).map((th) => (
                  <button
                    key={th}
                    onClick={() => setTheme(th)}
                    className={`w-5 h-5 rounded-full border transition-all cursor-pointer ${
                      th === 'light' ? 'bg-white' : th === 'sepia' ? 'bg-[#E8DFC9]' : 'bg-slate-950'
                    } ${theme === th ? 'border-amber-400 ring-2 ring-amber-400/30 font-bold' : 'border-slate-700'}`}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            {readingMode === 'text' && (
              <button
                onClick={toggleBookmark}
                className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                  bookmarked 
                    ? 'bg-amber-400/20 border-amber-400/40 text-amber-400' 
                    : 'bg-slate-950/40 border-slate-800 text-slate-300 hover:text-slate-200'
                }`}
                title={bookmarked ? 'تم حفظ العلامة المرجعية' : 'حفظ علامة القراءة'}
              >
                {bookmarked ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
              </button>
            )}
            
            <button
              onClick={handleShare}
              className="p-2 bg-slate-950/40 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-slate-200 rounded-xl transition-colors cursor-pointer relative"
              title="مشاركة رابط الكتاب"
            >
              {copiedLink ? <Check size={18} className="text-emerald-400" /> : <Share2 size={18} />}
              <AnimatePresence>
                {copiedLink && (
                  <motion.span
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-emerald-500 text-white font-bold text-[9px] px-2 py-1 rounded-md whitespace-nowrap shadow-md border border-emerald-400"
                  >
                    تم نسخ الرابط!
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>

        {/* Dynamic reading stage */}
        <div className="flex-1 overflow-hidden relative">
          
          {/* OPTION 1: Plain text reader */}
          {readingMode === 'text' && (
            <div className={`w-full h-full p-4 md:p-8 overflow-y-auto flex items-start justify-center transition-all ${
              theme === 'dark' ? 'bg-[#0f131a]' : theme === 'sepia' ? 'bg-[#f4ecd8]' : 'bg-slate-50'
            }`}>
              {book.content && book.content.length > 0 ? (
                <motion.div
                  key={currentPage}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`w-full max-w-3xl rounded-3xl p-6 md:p-12 shadow-md border ${getThemeClass()} flex flex-col min-h-[60vh]`}
                >
                  <div className="flex items-center justify-between opacity-50 text-[10px] md:text-xs mb-8 border-b pb-2 border-current/15 select-none font-medium">
                    <span>الكتاب الرقمي المنسق: {book.title}</span>
                    <span className="font-serif">الصفحة {currentPage + 1} من {book.content.length}</span>
                  </div>

                  <div className={`flex-1 font-serif select-text outline-none ${getTextSizeClass()}`}>
                    {(book.content[currentPage] && (
                      book.content[currentPage].includes('<p') || 
                      book.content[currentPage].includes('<div') || 
                      book.content[currentPage].includes('<span') || 
                      book.content[currentPage].includes('<br') || 
                      book.content[currentPage].includes('style=') || 
                      book.content[currentPage].includes('align=')
                    )) ? (
                      <div dangerouslySetInnerHTML={{ __html: book.content[currentPage] }} className="html-formatted-content" />
                    ) : (
                      <div className="whitespace-pre-wrap text-justify">{book.content[currentPage]}</div>
                    )}
                  </div>

                  {bookmarked && (
                    <div className="mt-8 flex items-center justify-start gap-1 text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 px-3 py-1.5 rounded-lg border border-amber-500/20 select-none w-fit font-sans">
                      <BookmarkCheck size={12} />
                      <span>قيد العلامة المرجعية؛ سيتم فتح هذه الصفحة كحل بديل فوري عند عودتك.</span>
                    </div>
                  )}
                </motion.div>
              ) : (
                <div className="text-center py-24 text-slate-400 space-y-4">
                  <BookOpen size={48} className="mx-auto opacity-30 animate-pulse" />
                  <p className="text-sm">لا يتوفر محتوى نصي عادي لهذا الكتاب. يرجى اختيار تبويب "ملف PDF" من القائمة الجانبية لقراءة المخطوطة الأصلية.</p>
                </div>
              )}
            </div>
          )}

          {/* OPTION 2: Google Drive Embeddable PDF reader */}
          {readingMode === 'pdf' && (
            <div className="w-full h-full bg-slate-900 flex flex-col relative">
              <div className="bg-slate-950 p-2.5 text-center text-slate-300 text-xs border-b border-slate-800 flex items-center justify-between px-6">
                <span>قارئ ملفات PDF المدمج (صفحات Google Drive الرسمية)</span>
                {book.drivePdfUrl && (
                  <a 
                    href={book.drivePdfUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-amber-400 hover:underline hover:text-amber-300 font-bold"
                  >
                    فتح في نافذة مستقلة ↗
                  </a>
                )}
              </div>
              
              {book.drivePdfUrl ? (
                <iframe
                  src={getEmbedUrl(book.drivePdfUrl)}
                  className="w-full flex-1 border-none bg-slate-900"
                  allow="autoplay"
                  referrerPolicy="no-referrer"
                  title="Google Drive Document Interactive PDF Viewer"
                />
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-slate-400 space-y-3">
                  <X size={44} className="text-rose-500" />
                  <p className="text-sm font-sans font-bold">عذراً، لم يتم العثور على رابط ملف PDF صالح لهذا الكتاب.</p>
                </div>
              )}
            </div>
          )}

          {/* OPTION 3: Free Copy text version */}
          {readingMode === 'freeCopy' && (
            <div className="w-full h-full bg-[#1A2230] p-6 overflow-y-auto flex items-start justify-center">
              <div className="w-full max-w-3xl bg-slate-950 text-white border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 select-none">
                  <div>
                    <span className="block text-amber-400 text-xs font-bold font-sans">قراءة حرة مجانية</span>
                    <h3 className="text-base font-serif font-bold text-white mt-0.5">تفويض القراءة المجانية والنقل الكامل</h3>
                  </div>
                  
                  <button
                    onClick={handleCopyFreeContent}
                    className="px-4 py-2 bg-[#3282B8] hover:bg-[#0F4C75] text-white font-bold rounded-xl text-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow-md"
                  >
                    {copiedFree ? <Check size={14} className="text-emerald-300" /> : <Copy size={14} />}
                    <span>{copiedFree ? 'تم النسخ!' : 'نسخ كامل الكتاب المجاني'}</span>
                  </button>
                </div>

                <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 text-sm md:text-base leading-relaxed font-serif text-slate-200 select-all whitespace-pre-wrap max-h-[50vh] overflow-y-auto">
                  {book.freeCopyContent || 'محتوى هذه النسخة للقراءة المجانية والنقل غير معد بعد. يرجى مراجعة الإدارة.'}
                </div>
                
                <p className="text-[10px] text-slate-500 leading-normal font-sans select-none">
                  * رخصت هذه النسخة للنفل والاقتباس كقراءة مجانية تضامناً مع توسيع الفائدة لطلاب المعرفة ومطالعي ثقافة الدرعي الرقمية العريقة.
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Bottom controls bar if mode matches */}
        {readingMode === 'text' && book.content && book.content.length > 0 && (
          <div className="p-4 bg-slate-900 border-t border-slate-800/80 flex items-center justify-between select-none z-25">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 0}
              className="px-4 py-2 bg-slate-950/60 border border-slate-800 hover:border-slate-700 text-slate-300 disabled:opacity-30 rounded-xl transition-all flex items-center gap-1 text-xs cursor-pointer"
            >
              <ChevronRight size={16} />
              <span>الصفحة السابقة</span>
            </button>

            <div className="flex items-center flex-col gap-1">
              <div className="w-24 sm:w-48 bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-800">
                <div 
                  className="bg-amber-400 h-full transition-all duration-300" 
                  style={{ width: `${((currentPage + 1) / book.content.length) * 100}%` }}
                />
              </div>
              <span className="text-[9px] text-slate-400 font-serif">
                نسبة الإنجاز: {Math.round(((currentPage + 1) / book.content.length) * 100)}%
              </span>
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === book.content.length - 1}
              className="px-4 py-2 bg-slate-950/60 border border-slate-800 hover:border-slate-700 text-slate-300 disabled:opacity-30 rounded-xl transition-all flex items-center gap-1 text-xs cursor-pointer"
            >
              <span>الصفحة التالية</span>
              <ChevronLeft size={16} />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
