import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Article, Review, UserSession, RichContentElement } from '../types';
import { 
  X, Calendar, Clock, ThumbsUp, Eye, Share2, 
  MessageSquareReply, Star, Check
} from 'lucide-react';

interface ArticleViewProps {
  article: Article;
  session: UserSession;
  onClose: () => void;
  allComments: Review[];
  onAddComment: (comment: Review) => void;
  onLikeArticle: (articleId: string) => void;
}

export default function ArticleView({ 
  article, 
  session, 
  onClose, 
  allComments, 
  onAddComment,
  onLikeArticle
}: ArticleViewProps) {
  const [commentText, setCommentText] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [hasLiked, setHasLiked] = useState(() => {
    return localStorage.getItem(`liked_article_${article.id}`) === 'true';
  });

  const [isFav, setIsFav] = useState(() => {
    return localStorage.getItem(`bookmark_article_${article.id}`) === 'true' || localStorage.getItem(`liked_article_${article.id}`) === 'true';
  });
  const [localRating, setLocalRating] = useState(() => {
    const saved = localStorage.getItem(`rating_article_${article.id}`);
    return saved ? parseInt(saved, 10) : (article.rating || 5);
  });
  const [readerTheme, setReaderTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('article_reader_theme') as 'dark' | 'light') || 'dark';
  });

  const isLightReader = readerTheme === 'light';

  const handleToggleReaderTheme = () => {
    const nextTheme = readerTheme === 'dark' ? 'light' : 'dark';
    setReaderTheme(nextTheme);
    localStorage.setItem('article_reader_theme', nextTheme);
  };

  const toggleBookmark = () => {
    if (session.role === 'guest') {
      alert('⚠️ الحفظ في المفضلة يتطلب ميزة تسجيل العضوية لتوثيقه ببروفايلك 🌸');
      return;
    }
    const nextVal = !isFav;
    setIsFav(nextVal);
    localStorage.setItem(`liked_article_${article.id}`, nextVal.toString());
    localStorage.setItem(`bookmark_article_${article.id}`, nextVal.toString());
    localStorage.setItem(`bookmark_${article.id}`, nextVal.toString());

    const favLog = JSON.parse(localStorage.getItem('library_favorites') || '[]');
    if (nextVal) {
      favLog.push({
        id: `fav-art-view-${Date.now()}`,
        itemId: article.id,
        itemType: 'article',
        itemTitle: article.title,
        username: session.username,
        name: session.name,
        date: 'الآن'
      });
      localStorage.setItem('library_favorites', JSON.stringify(favLog));
    } else {
      const updated = favLog.filter((f: any) => !(f.itemId === article.id && f.username === session.username));
      localStorage.setItem('library_favorites', JSON.stringify(updated));
    }
    window.dispatchEvent(new Event('storage'));
  };

  const handleRateArticle = (score: number) => {
    if (session.role === 'guest') {
      alert('⚠️ التقييم بالنجوم متاح للأعضاء المسجلين بمدونات الوعي فقط 🌸');
      return;
    }
    localStorage.setItem(`rating_article_${article.id}`, score.toString());
    localStorage.setItem(`rating_general_${article.id}`, score.toString());
    setLocalRating(score);

    const ratingsLog = JSON.parse(localStorage.getItem('library_ratings') || '[]');
    const cleaned = ratingsLog.filter((r: any) => !(r.itemId === article.id && r.username === session.username));
    cleaned.push({
      id: `rating-art-view-${Date.now()}`,
      itemId: article.id,
      itemType: 'article',
      itemName: article.title,
      rating: score,
      username: session.username,
      name: session.name,
      date: 'الآن'
    });
    localStorage.setItem('library_ratings', JSON.stringify(cleaned));
    window.dispatchEvent(new Event('storage'));
  };

  // Reply threads state
  const [replyText, setReplyText] = useState<{ [commentId: string]: string }>({});
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);

  // Filter comments/reviews for this article
  const articleComments = allComments.filter((c) => c.itemId === article.id);

  const handleLike = () => {
    if (hasLiked) return;
    onLikeArticle(article.id);
    setHasLiked(true);
    localStorage.setItem(`liked_article_${article.id}`, 'true');
  };

  const handleShare = () => {
    navigator.clipboard.writeText(`${window.location.origin}/article/${article.id}`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const newComment: Review = {
      id: `c-user-${Date.now()}`,
      itemId: article.id,
      authorName: session.role === 'guest' ? `${session.name} (زائر)` : `${session.name} (عضو)`,
      content: commentText.trim(),
      date: 'الآن',
      userId: session.username,
      replies: []
    };

    onAddComment(newComment);
    setCommentText('');
  };

  const handleReplySubmit = (commentId: string) => {
    const text = replyText[commentId];
    if (!text || !text.trim()) return;

    const localReviews: Review[] = JSON.parse(localStorage.getItem('library_reviews') || '[]');
    const targetIdx = localReviews.findIndex(r => r.id === commentId);

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

    // Sync state
    const updatedReview = allComments.find(c => c.id === commentId);
    if (updatedReview) {
      if (!updatedReview.replies) updatedReview.replies = [];
      updatedReview.replies.push(replyItem);
      onAddComment(updatedReview); // Sync to App component state
    }

    setReplyText(prev => ({ ...prev, [commentId]: '' }));
    setActiveReplyId(null);
  };

  const getAlignClass = (align?: 'right' | 'center' | 'left') => {
    if (align === 'center') return 'text-center';
    if (align === 'left') return 'text-left';
    return 'text-right';
  };

  const getImageScaleClass = (scale?: 'small' | 'medium' | 'large') => {
    if (scale === 'small') return 'max-w-xs h-auto rounded-xl mx-auto border border-slate-705 shadow-md';
    if (scale === 'medium') return 'max-w-md h-auto rounded-xl mx-auto border border-slate-705 shadow-lg';
    return 'max-w-full h-auto rounded-2xl mx-auto border border-slate-705 shadow-2xl';
  };

  const renderRichElement = (el: RichContentElement) => {
    switch (el.type) {
      case 'h1':
        return (
          <h2 key={el.id} className={`text-xl md:text-2xl font-black font-serif mt-6 mb-2 border-r-4 pr-3 ${isLightReader ? 'text-slate-900 border-amber-500' : 'text-white border-amber-400'}`}>
            {el.text}
          </h2>
        );
      case 'h2':
        return (
          <h3 key={el.id} className={`text-lg md:text-xl font-bold font-serif mt-4 mb-2 ${isLightReader ? 'text-amber-700' : 'text-amber-300'}`}>
            {el.text}
          </h3>
        );
      case 'p':
        return (
          <p key={el.id} className={`text-sm md:text-base leading-relaxed ${getAlignClass(el.align)} whitespace-pre-wrap select-text ${isLightReader ? 'text-slate-850' : 'text-slate-200'}`}>
            {el.text}
          </p>
        );
      case 'ol':
        return (
          <div key={el.id} className={`p-4 rounded-xl my-3 text-right border ${isLightReader ? 'bg-slate-100 border-slate-200' : 'bg-slate-950/40 border-slate-800/80'}`}>
            <span className={`font-sans text-xs font-bold mb-1.5 block ${isLightReader ? 'text-amber-600' : 'text-amber-400'}`}>عنصر تعداد مقالي:</span>
            <p className={`text-xs md:text-sm font-serif leading-relaxed select-text ${isLightReader ? 'text-slate-850' : 'text-slate-200'}`}>{el.text}</p>
          </div>
        );
      case 'img':
        return (
          <div key={el.id} className="my-4 text-center space-y-1">
            <img 
              src={el.src} 
              alt="صورة ملحقة في المقال" 
              className={getImageScaleClass(el.scale)}
              referrerPolicy="no-referrer"
            />
            {el.text && (
              <span className="text-[10px] text-slate-400 font-sans tracking-wide block">{el.text}</span>
            )}
          </div>
        );
      case 'link':
        return (
          <div key={el.id} className="my-3.5 text-right">
            <a
              href={el.src}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4.5 py-2.5 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 rounded-xl transition-all font-sans text-xs font-bold leading-normal shadow hover:scale-[1.02] select-all cursor-pointer"
            >
              <span>🔗 {el.text || 'طالع الرابط المدمج'}</span>
              <span className="text-[10px] text-slate-400 font-serif font-light flex items-center pr-1 ltr">({el.src})</span>
            </a>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div id={`article-view-${article.id}`} className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/90 backdrop-blur-md flex justify-center p-4 md:p-6 text-right select-text" dir="rtl">
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        className={`rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col my-auto transition-colors duration-300 border ${
          isLightReader 
            ? 'bg-[#FCFCFC] border-slate-200 text-slate-900' 
            : 'bg-slate-900 border-slate-800 text-slate-100'
        }`}
      >
        {/* Banner with cover color styling or Cover photo as request */}
        <div className="relative text-white overflow-hidden">
          
          {/* Main article cover background */}
          {article.coverImage ? (
            <div className="absolute inset-0 z-0">
              <img 
                src={article.coverImage} 
                alt={article.title} 
                className="w-full h-full object-cover opacity-32 blur-[2px]" 
                referrerPolicy="no-referrer"
              />
              <div className={`absolute inset-0 bg-gradient-to-b from-transparent transition-colors duration-300 ${
                isLightReader ? 'to-[#FCFCFC]' : 'to-slate-900'
              }`} />
            </div>
          ) : (
            <div className={`absolute inset-0 bg-gradient-to-br ${article.imageStyle.from} ${article.imageStyle.to} opacity-90 z-0`} />
          )}

          <div className="relative z-10 p-8 md:p-12">
            {/* Close button inside cover */}
            <button
              id="close-article-view-btn"
              onClick={onClose}
              className="absolute top-6 left-6 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full transition-all cursor-pointer border border-white/10 animate-pulse"
              title="إغلاق المقال"
            >
              <X size={18} />
            </button>

            <div className="max-w-2xl mt-4">
              <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-bold font-sans border border-white/10 text-white">
                {article.category}
              </span>
              <h1 className="text-2xl md:text-4xl font-extrabold font-serif leading-snug mt-4 text-shadow-md text-white">
                {article.title}
              </h1>
              
              {/* Meta information tags */}
              <div className="flex flex-wrap items-center gap-4 md:gap-5 mt-6 text-xs text-blue-100 opacity-90 select-none">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-ping" />
                  <span>الكاتب: {article.author}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Calendar size={13} className="text-amber-300" />
                  <span>تاريخ النشر: {article.date}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={13} className="text-amber-300" />
                  <span>وقت القراءة: {article.readTime}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Structure */}
        <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
          
          {/* Main article content block */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Live Interactive Control row inside the display */}
            <div className={`p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-4 select-none font-sans text-xs transition-colors duration-300 ${
              isLightReader 
                ? 'bg-slate-100 border-slate-200 text-slate-800' 
                : 'bg-slate-950/45 border-slate-800/80 text-slate-350'
            }`}>
              <div className="flex flex-wrap items-center gap-4">
                <span className="flex items-center gap-1.5 font-bold">
                  <Eye size={14} className="text-emerald-500" />
                  <span>المشاهدات:</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-300">{article.views || 615}</span>
                </span>
                
                <div className={`h-4 w-[1px] ${isLightReader ? 'bg-slate-300' : 'bg-slate-800'}`} />

                <div className="flex items-center gap-1">
                  <span className="font-bold">التقييم:</span>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => handleRateArticle(star)}
                        className="hover:scale-125 transition-transform cursor-pointer border-none bg-transparent p-0 flex items-center"
                        title={`تقييم بـ ${star} نجوم`}
                      >
                        <Star
                          size={13}
                          fill={localRating >= star ? '#eab308' : 'none'}
                          className={localRating >= star ? 'text-amber-500 fill-amber-500' : 'text-slate-400'}
                        />
                      </button>
                    ))}
                    <span className="font-mono font-bold mr-1">({localRating}.5)</span>
                  </div>
                </div>
              </div>

              {/* Theme Changer Toggle & Bookmark Save actions */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleToggleReaderTheme}
                  className={`py-1.5 px-3 rounded-lg font-black transition-all cursor-pointer flex items-center gap-1.5 text-[11px] ${
                    isLightReader
                      ? 'bg-amber-500/10 border border-amber-500/30 text-amber-600 hover:bg-amber-500/20'
                      : 'bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-300 hover:text-white'
                  }`}
                  title="تغيير مظهر القراءة"
                >
                  <span>{isLightReader ? '🌙 الوضع الداكن' : '☀️ الوضع المعتاد'}</span>
                </button>

                <button
                  onClick={toggleBookmark}
                  className={`py-1.5 px-3 rounded-lg font-black transition-all cursor-pointer flex items-center gap-1.5 text-[11px] ${
                    isFav
                      ? 'bg-amber-400/20 border border-amber-400/40 text-amber-300'
                      : 'bg-slate-800 hover:bg-slate-750 border border-slate-750 text-slate-300 hover:text-white hover:scale-[1.05]'
                  }`}
                >
                  <span>📌</span>
                  <span>{isFav ? 'محفوظ بالمفضلة' : 'حفظ في المفضلة'}</span>
                </button>
              </div>
            </div>

            {/* Rich Content display or general text array as fallback */}
            <div className={`font-serif text-base md:text-[17px] leading-relaxed space-y-5 transition-colors duration-300 ${
              isLightReader ? 'text-slate-800' : 'text-slate-200'
            }`}>
              {article.richContent && article.richContent.length > 0 ? (
                article.richContent.map((element) => renderRichElement(element))
              ) : (
                article.content.map((paragraph, index) => {
                  const hasHTML = paragraph.includes('<p') || paragraph.includes('<div') || paragraph.includes('<span') || paragraph.includes('<br') || paragraph.includes('style=') || paragraph.includes('align=');
                  if (hasHTML) {
                    return (
                      <div 
                        key={index} 
                        dangerouslySetInnerHTML={{ __html: paragraph }} 
                        className="select-text html-formatted-content" 
                      />
                    );
                  }
                  return (
                    <p key={index} className="text-justify whitespace-pre-wrap select-text">
                      {paragraph}
                    </p>
                  );
                })
              )}
            </div>

            {/* Quick Actions Likes and share */}
            <div className="pt-6 border-t border-slate-800/85 flex items-center justify-between select-none">
              <div className="flex items-center gap-3">
                <button
                  id="like-article-btn"
                  onClick={handleLike}
                  disabled={hasLiked}
                  className={`px-4 py-2 rounded-xl flex items-center gap-1.5 text-xs font-bold transition-all border cursor-pointer ${
                    hasLiked
                      ? 'bg-amber-400/10 border-amber-400/30 text-amber-300'
                      : 'bg-slate-800 hover:bg-slate-750 border-slate-700 text-slate-300 hover:text-white'
                  }`}
                >
                  <ThumbsUp size={13} className={hasLiked ? 'fill-amber-400' : ''} />
                  <span>{hasLiked ? 'لقد أعجبك هذا المقال' : 'أعجبني'}</span>
                  <span className="bg-slate-900 border border-slate-700 px-1.5 py-0.5 rounded-md text-[9px] text-slate-300">
                    {article.likes}
                  </span>
                </button>

                <button
                  id="share-article-btn"
                  onClick={handleShare}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer relative"
                >
                  <span className="flex items-center gap-1.5">
                    {copiedLink ? <Check size={13} className="text-emerald-400" /> : <Share2 size={13} />}
                    <span>{copiedLink ? 'تم نسخ الرابط' : 'مشاركة المقال'}</span>
                  </span>
                  <AnimatePresence>
                    {copiedLink && (
                      <motion.span
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-emerald-500 text-white font-bold text-[9px] px-2 py-1 rounded-md whitespace-nowrap shadow-md"
                      >
                        جاهز للنشر!
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
              </div>

              {/* Views count */}
              <div className="flex items-center gap-1.5 p-2 bg-slate-800/10 rounded-lg text-[10px] text-slate-400 border border-slate-300/25">
                <Eye size={12} />
                <span>{article.views + (hasLiked ? 1 : 0)} مشاهدة</span>
              </div>
            </div>

            {/* Comment Area */}
            <div className="pt-8 border-t border-slate-800/20">
              <h3 className="text-base font-black mb-4 font-serif flex items-center gap-1.5">
                <MessageSquareReply size={18} className="text-amber-400" />
                <span>تعليقات ومناقشات القراء</span>
              </h3>

              {/* Enter feedback input */}
              <form onSubmit={handleSubmitComment} className="flex gap-2 mb-6">
                <input
                  id="article-comment-input"
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="شارك بتعليق رزين يغني الحوار الوجداني في المقال..."
                  className="flex-1 px-4 py-2.5 bg-slate-950/40 border border-slate-800/60 rounded-xl text-xs placeholder-slate-500 text-slate-100 focus:outline-none focus:border-amber-400 transition-all font-sans"
                />
                <button
                  type="submit"
                  disabled={!commentText.trim()}
                  className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl text-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  تعليق
                </button>
              </form>

              {/* Comments Feed list */}
              <div className="space-y-3">
                {articleComments.length === 0 ? (
                  <div className="text-center py-6 text-slate-500 border border-dashed border-slate-850 rounded-xl">
                    <span className="text-[11px]">لم تسجل تعليقات بعد في هذا المقال الجميل. كُن أول من يُشارك فكرته!</span>
                  </div>
                ) : (
                  articleComments.slice().reverse().map((c) => (
                    <div key={c.id} className="p-3.5 bg-slate-950/20 border border-slate-850 rounded-xl space-y-2 text-right">
                      
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 bg-[#3282B8] rounded-full" />
                          <span className={`font-bold ${isLightReader ? 'text-slate-800' : 'text-slate-200'}`}>{c.authorName}</span>
                        </div>
                        <span className="text-[9px] text-slate-500 font-sans">{c.date}</span>
                      </div>
                      
                      <p className={`text-xs leading-normal font-sans pr-3 ${isLightReader ? 'text-slate-700' : 'text-slate-300'}`}>{c.content}</p>

                      {/* Display replies */}
                      {c.replies && c.replies.length > 0 && (
                        <div className="mt-2 pr-3 border-r border-slate-750/50 space-y-2 bg-black/15 py-1.5 rounded-l-md">
                          {c.replies.map((reply) => (
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

                      {/* Add reply */}
                      <div className="pt-1 select-none">
                        {activeReplyId === c.id ? (
                          <div className="flex gap-1.5 items-center mt-1">
                            <input
                              type="text"
                              placeholder="أدخل ردك الرزين..."
                              value={replyText[c.id] || ''}
                              onChange={(e) => setReplyText(prev => ({ ...prev, [c.id]: e.target.value }))}
                              className="grow bg-slate-900 border border-slate-800 text-[10px] p-2 rounded-lg text-white focus:outline-none focus:border-amber-400 font-sans"
                            />
                            <button
                              onClick={() => handleReplySubmit(c.id)}
                              className="bg-amber-400 text-slate-900 px-2 py-1 rounded-md text-[10px] font-bold cursor-pointer"
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
                            onClick={() => setActiveReplyId(c.id)}
                            className="text-amber-400 hover:text-amber-305 text-[10px] underline cursor-pointer font-sans"
                          >
                            ردّ على هذا التعليق ↩
                          </button>
                        )}
                      </div>

                    </div>
                  ))
                )}
              </div>

            </div>

          </div>

          {/* Right column/Sidebar */}
          <div className="space-y-6">
            <div className={`p-5 rounded-2xl border space-y-4 transition-colors duration-300 ${
              isLightReader 
                ? 'bg-slate-100 border-slate-200' 
                : 'bg-slate-950/40 border-slate-800/80'
            }`}>
              <h3 className={`text-[10px] uppercase font-bold tracking-wider ${isLightReader ? 'text-amber-800' : 'text-amber-400'}`}>الكاتب والمفكر</h3>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-400 to-amber-200 flex items-center justify-center font-bold text-slate-900 border border-amber-300 text-xs">
                  {article.author.substr(0, 2)}
                </div>
                <div>
                  <h4 className={`text-xs font-black ${isLightReader ? 'text-slate-900' : 'text-white'}`}>{article.author}</h4>
                  <p className={`text-[9px] ${isLightReader ? 'text-slate-550' : 'text-slate-400'}`}>رابطة أدباء الدرعي</p>
                </div>
              </div>

              <p className={`text-[11px] leading-relaxed font-sans ${isLightReader ? 'text-slate-600' : 'text-slate-300'}`}>
                عضو باحث وكاتب عمود دائم في مجلات الفكر والأطروحات، يكرس أبحاثه لتوضيح التقاطعات الأخلاقية والأدبية وبناء المعنى الإنساني الرفيع.
              </p>
            </div>

            {/* Inspiration quote block info */}
            <div className={`p-5 rounded-2xl border space-y-2 relative overflow-hidden transition-colors duration-300 ${
              isLightReader 
                ? 'bg-amber-500/5 border-amber-500/10' 
                : 'bg-amber-400/5 border-amber-400/10'
            }`}>
              <div className="absolute top-0 right-0 transform translate-x-3 -translate-y-3 text-6xl font-serif text-amber-500/10 select-none pointer-events-none">
                "
              </div>
              <span className={`text-[9px] font-bold block select-none ${isLightReader ? 'text-amber-700' : 'text-amber-400'}`}>شعاع الكلمة</span>
              <p className={`text-[11px] leading-relaxed font-serif ${isLightReader ? 'text-slate-700' : 'text-slate-300'}`}>
                " الكلمة نور، والبحث فيها أسمى مراتب الوجود الواعي. من مكتبة الدرعي تتدفق المعرفة لنبني جسراً متيناً من التفكير النيّر المتأمل. "
              </p>
            </div>

            {/* Reading advice */}
            <div className={`p-5 rounded-2xl border space-y-2 text-[11px] transition-colors duration-300 ${
              isLightReader 
                ? 'bg-slate-100 border-slate-200 text-slate-600' 
                : 'bg-slate-950/20 border-slate-800/50 text-slate-400'
            }`}>
              <h4 className={`font-bold ${isLightReader ? 'text-slate-800' : 'text-slate-300'}`}>💡 نصيحة لقارئ المقال:</h4>
              <p>خذ نفساً عميقاً في هدوء تام وتأمل الأسطر بروية. يمكنك الرد على تعليقات ومراجعات زملائك لطرح حوار فلسفي رائع وعميق.</p>
            </div>

          </div>

        </div>
      </motion.div>
    </div>
  );
}
