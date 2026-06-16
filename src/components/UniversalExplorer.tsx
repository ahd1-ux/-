import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, FileText, Star, Bookmark, Filter, X, CreditCard, ShieldCheck } from 'lucide-react';
import { Book, Article, UserSession } from '../types';
import MarkdownEditor from './MarkdownEditor';
import UnifiedCard from './UnifiedCard';
import { t } from '../utils/translation';

interface UniversalExplorerProps {
  books: Book[];
  articles: Article[];
  session: UserSession;
  onSelectBook: (book: Book) => void;
  onSelectArticle: (art: Article) => void;
  onAddBook: (newBook: Book) => void;
  onAddArticle: (newArt: Article) => void;
  triggerToast: (msg: string) => void;
  currentLang?: string;
}

export default function UniversalExplorer({
  books,
  articles,
  session,
  onSelectBook,
  onSelectArticle,
  onAddBook,
  onAddArticle,
  triggerToast,
  currentLang = 'AR'
}: UniversalExplorerProps) {
  // Filter and search states
  const [searchQuery, setSearchQuery] = useState('');
  const [explorerType, setExplorerType] = useState<'all' | 'books' | 'articles'>('all');
  const [explorerCategory, setExplorerCategory] = useState<string>('all');
  const [explorerTag, setExplorerTag] = useState<'all' | 'saved' | 'pdf' | 'high_likes'>('all');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);

  // Reset pagination on filter update
  useEffect(() => {
    setCurrentPage(1);
  }, [explorerType, explorerCategory, explorerTag, searchQuery]);

  // Sync query from general layout quick search if there is any window state or session query
  useEffect(() => {
    const handleGlobalSearch = (e: any) => {
      if (e.detail && typeof e.detail.query === 'string') {
        setSearchQuery(e.detail.query);
      }
    };
    window.addEventListener('globalSearch', handleGlobalSearch);
    return () => {
      window.removeEventListener('globalSearch', handleGlobalSearch);
    };
  }, []);

  // Addition form modal/collapse state
  const [showAddForm, setShowAddForm] = useState<'none' | 'book' | 'article'>('none');

  // eBooks custom image covers, price tags state
  const [favorites, setFavorites] = useState<{ [key: string]: boolean }>({});
  const [ratings, setRatings] = useState<{ [key: string]: number }>({});
  const [purchasedBooks, setPurchasedBooks] = useState<{ [key: string]: boolean }>({});

  // Checkout billing state
  const [checkoutBook, setCheckoutBook] = useState<Book | null>(null);
  const [cardHolder, setCardHolder] = useState('');
  const [cardNumber, setCardNumber] = useState('4000 1234 5678 9010');
  const [cardExpir, setCardExpir] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('321');

  // Addition field states
  const [addTitle, setAddTitle] = useState('');
  const [addAuthor, setAddAuthor] = useState('');
  const [addCategory, setAddCategory] = useState('فلسفة وتأمل');
  const [addDescription, setAddDescription] = useState('');
  const [addReadTime, setAddReadTime] = useState('١٥ دقيقة قراءة');
  const [addPdfUrl, setAddPdfUrl] = useState('');
  const [addPrice, setAddPrice] = useState('٤٩ درهم');
  const [addType, setAddType] = useState<'free' | 'paid'>('free');
  const [addCoverImage, setAddCoverImage] = useState('');

  // Load and sync favorites, purchases, and ratings on mount
  useEffect(() => {
    const initialFavs: { [key: string]: boolean } = {};
    const initialRatings: { [key: string]: number } = {};
    const initialPurchased: { [key: string]: boolean } = {};

    books.forEach((b) => {
      initialFavs[`book_${b.id}`] = localStorage.getItem(`bookmark_book_${b.id}`) === 'true';
      initialRatings[`book_${b.id}`] = parseInt(localStorage.getItem(`rating_book_${b.id}`) || '5');
      initialPurchased[b.id] = localStorage.getItem(`purchased_book_${b.id}`) === 'true';
    });

    articles.forEach((a) => {
      initialFavs[`article_${a.id}`] = localStorage.getItem(`liked_article_${a.id}`) === 'true';
      initialRatings[`article_${a.id}`] = parseInt(localStorage.getItem(`rating_article_${a.id}`) || '5');
    });

    setFavorites(initialFavs);
    setRatings(initialRatings);
    setPurchasedBooks(initialPurchased);
  }, [books, articles]);

  // Extract list of all unique categories based on selected explorerType
  const availableCategories = useMemo(() => {
    const cats = new Set<string>();
    if (explorerType === 'all' || explorerType === 'books') {
      books.forEach(b => cats.add(b.category));
    }
    if (explorerType === 'all' || explorerType === 'articles') {
      articles.forEach(a => cats.add(a.category));
    }
    return Array.from(cats);
  }, [books, articles, explorerType]);

  // Reset selected category to 'all' if it is not valid under the current available list
  useEffect(() => {
    if (explorerCategory !== 'all' && !availableCategories.includes(explorerCategory)) {
      setExplorerCategory('all');
    }
  }, [explorerType, availableCategories, explorerCategory]);

  // Handle submissions
  const handleAddNewBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addTitle.trim() || !addAuthor.trim()) {
      triggerToast('⚠️ فضلاً أكمل العنوان واسم المؤلف');
      return;
    }

    const newB: Book = {
      id: `b-custom-${Date.now()}`,
      title: addTitle.trim(),
      author: addAuthor.trim(),
      category: addCategory,
      description: addDescription.trim() || 'لا يوجد وصف متاح للتفصيل',
      publishDate: 'الآن',
      readTime: addReadTime,
      drivePdfUrl: addPdfUrl.trim() || undefined,
      isFree: addType === 'free',
      price: addType === 'paid' ? parseInt(addPrice) || 45 : undefined,
      coverImage: addCoverImage.trim() || undefined,
      content: ['الفصل الأول: معارف منقوشة بقلم المؤلف الجديد.\n\nإن سماء الأفكار رحبة والكلمة الطيبة غيث يسقي العقول الظمأى.'],
      coverStyle: {
        bg: 'from-amber-600 via-rose-700 to-indigo-950',
        text: 'text-white',
        accent: 'border-amber-400 bg-amber-500/20 text-amber-100',
        pattern: 'sky'
      }
    };

    onAddBook(newB);
    triggerToast('🎉 تم إضافة وإشهار كتابك الرقمي الجديد بنجاح في المكتبة!');
    resetForm();
  };

  const handleAddNewArticle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addTitle.trim() || !addAuthor.trim()) {
      triggerToast('⚠️ فضلاً أكمل العنوان واسم الكاتب');
      return;
    }

    const newA: Article = {
      id: `a-custom-${Date.now()}`,
      title: addTitle.trim(),
      author: addAuthor.trim(),
      category: addCategory,
      readTime: addReadTime,
      date: 'اليوم',
      views: 1,
      likes: 0,
      content: [
        addDescription.trim() || 'فقرة المقال المكتوبة بقلم الكاتب لتغذية الروح والفكر ونقاء الفهم.'
      ],
      imageStyle: {
        from: 'from-violet-600',
        to: 'to-rose-600',
        pattern: 'waves'
      }
    };

    onAddArticle(newA);
    triggerToast('🎉 تم نشر وتوثيق مقالك الفكري الجديد بنجاح في الرواق!');
    resetForm();
  };

  const resetForm = () => {
    setAddTitle('');
    setAddAuthor('');
    setAddDescription('');
    setAddReadTime('١٥ دقيقة قراءة');
    setAddPdfUrl('');
    setAddPrice('٤٩ درهم');
    setAddCoverImage('');
    setShowAddForm('none');
  };

  // Toggle favorite
  const toggleFavorite = (id: string, type: 'book' | 'article', title: string) => {
    if (session.role === 'guest') {
      triggerToast('⚠️ المفضلة مخصصة للأعضاء فقط! يرجى تسجيل الدخول أو التبديل لحساب عادل 🌸');
      return;
    }

    const key = `${type}_${id}`;
    const storageKey = type === 'book' ? `bookmark_book_${id}` : `liked_article_${id}`;
    const generalBookmarkKey = `bookmark_${id}`;

    const currentVal = favorites[key] || false;
    const newVal = !currentVal;

    localStorage.setItem(storageKey, newVal.toString());
    localStorage.setItem(generalBookmarkKey, newVal.toString());
    localStorage.setItem(`liked_${type}_${id}`, newVal.toString());

    setFavorites(prev => ({ ...prev, [key]: newVal }));

    const favLog = JSON.parse(localStorage.getItem('library_favorites') || '[]');
    if (newVal) {
      favLog.push({
        id: `fav-log-${Date.now()}`,
        itemId: id,
        itemType: type,
        itemTitle: title,
        username: session.username,
        name: session.name,
        date: 'الآن'
      });
      triggerToast(`❤️ تمت إضافة [${title}] لمفضلتك وحفظت في أرشيفك الشخصي!`);
    } else {
      const updatedLog = favLog.filter((f: any) => !(f.itemId === id && f.username === session.username));
      localStorage.setItem('library_favorites', JSON.stringify(updatedLog));
      triggerToast(`🤍 تمت إزالة [${title}] من مفضلتك.`);
    }
    window.dispatchEvent(new Event('storage'));
  };

  // Star Rating Clicker
  const assignRating = (id: string, type: 'book' | 'article', val: number, name: string) => {
    if (session.role === 'guest') {
      triggerToast('⚠️ التقييم بالنجوم متاح للأعضاء الملهمين فقط! يرجى التبديل لتسجيل النجوم 🌸');
      return;
    }

    const key = `${type}_${id}`;
    const storageKey = `rating_${type}_${id}`;
    localStorage.setItem(storageKey, val.toString());
    setRatings(prev => ({ ...prev, [key]: val }));

    const ratingsLog = JSON.parse(localStorage.getItem('library_ratings') || '[]');
    const cleaned = ratingsLog.filter((r: any) => !(r.itemId === id && r.username === session.username));
    cleaned.push({
      id: `rating-log-${Date.now()}`,
      itemId: id,
      itemType: type,
      itemName: name,
      rating: val,
      username: session.username,
      name: session.name,
      date: 'الآن'
    });
    localStorage.setItem('library_ratings', JSON.stringify(cleaned));
    triggerToast(`⭐ قيمت [${name}] بـ ${val} نجوم! تم تحديث سجل التقييمات بنجاح.`);
    window.dispatchEvent(new Event('storage'));
  };

  // Trigger purchase popup
  const startPurchaseFlow = (book: Book) => {
    if (session.role === 'guest') {
      triggerToast('⚠️ شراء الكتب متاح للأعضاء المسجلين فقط! تفضل بتسجيل حساب لتفعيل خدمات الدفع والمطالعة الممتلئة 🌸');
      return;
    }
    setCheckoutBook(book);
    setCardHolder(session.name);
  };

  // Confirm check out credit-card
  const executeBuyBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkoutBook) return;

    localStorage.setItem(`purchased_book_${checkoutBook.id}`, 'true');
    setPurchasedBooks(prev => ({ ...prev, [checkoutBook.id]: true }));
    triggerToast(`🎉 مبروك! تم سداد قيمة الكتاب [${checkoutBook.title}] بنجاح وحفظت رخصتك بالملفات! تم فك الحظر عن القراءة.`);
    setCheckoutBook(null);
  };

  // Compile full list under matching filter conditions
  const filteredAndSearchedItems = useMemo(() => {
    const list: Array<{
      id: string;
      title: string;
      author: string;
      category: string;
      readTime: string;
      description: string;
      type: 'book' | 'article';
      originalItem: any;
    }> = [];

    books.forEach(b => {
      list.push({
        id: b.id,
        title: b.title,
        author: b.author,
        category: b.category,
        readTime: b.readTime,
        description: b.description,
        type: 'book',
        originalItem: b
      });
    });

    articles.forEach(a => {
      list.push({
        id: a.id,
        title: a.title,
        author: a.author,
        category: a.category,
        readTime: a.readTime,
        description: a.content[0] || '',
        type: 'article',
        originalItem: a
      });
    });

    return list.filter(item => {
      const targetType = explorerType === 'books' ? 'book' : explorerType === 'articles' ? 'article' : 'all';
      if (targetType !== 'all' && item.type !== targetType) return false;
      if (explorerCategory !== 'all' && item.category !== explorerCategory) return false;

      if (explorerTag === 'saved') {
        const isSaved = localStorage.getItem(`bookmark_${item.id}`) === 'true' || localStorage.getItem(`bookmark_book_${item.id}`) === 'true';
        if (!isSaved) return false;
      }
      if (explorerTag === 'pdf') {
        if (item.type !== 'book' || !item.originalItem.drivePdfUrl) return false;
      }
      if (explorerTag === 'high_likes') {
        if (item.type === 'article' && item.originalItem.likes < 5) return false;
        if (item.type === 'book' && !item.originalItem.drivePdfUrl) return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        return (
          item.title.toLowerCase().includes(q) ||
          item.author.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q)
        );
      }

      return true;
    });
  }, [books, articles, explorerType, explorerCategory, explorerTag, searchQuery]);

  // Separate books and articles from the filtered list to handle dual-track pagination
  const filteredBooks = useMemo(() => {
    return filteredAndSearchedItems.filter(item => item.type === 'book');
  }, [filteredAndSearchedItems]);

  const filteredArticles = useMemo(() => {
    return filteredAndSearchedItems.filter(item => item.type === 'article');
  }, [filteredAndSearchedItems]);

  const itemsPerPage = 6;

  const totalPages = useMemo(() => {
    if (explorerType === 'books') {
      return Math.ceil(filteredBooks.length / itemsPerPage) || 1;
    } else if (explorerType === 'articles') {
      return Math.ceil(filteredArticles.length / itemsPerPage) || 1;
    } else {
      // explorerType === 'all'
      const booksPages = Math.ceil(filteredBooks.length / itemsPerPage);
      const articlesPages = Math.ceil(filteredArticles.length / itemsPerPage);
      return Math.max(booksPages, articlesPages) || 1;
    }
  }, [filteredBooks, filteredArticles, explorerType]);

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = currentPage * itemsPerPage;

    if (explorerType === 'books') {
      return filteredBooks.slice(start, end);
    } else if (explorerType === 'articles') {
      return filteredArticles.slice(start, end);
    } else {
      // explorerType === 'all' -> group books and articles together (6 books and 6 articles)
      const booksSlice = filteredBooks.slice(start, end);
      const articlesSlice = filteredArticles.slice(start, end);
      return [...booksSlice, ...articlesSlice];
    }
  }, [filteredBooks, filteredArticles, explorerType, currentPage]);

  return (
    <div className="space-y-6 font-sans select-none" dir="rtl">
      
      {/* 1. Addition Panel Header - ONLY FOR ADMINS */}
      {session.role === 'admin' && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/20 dark:bg-rose-955/10 p-5 rounded-3xl border border-white/30 dark:border-rose-900/30 shadow-md font-sans">
          <div className="space-y-1">
            <h3 className="text-sm font-black text-rose-950 dark:text-rose-100 font-serif flex items-center gap-1.5">
              <ShieldCheck size={16} className="text-amber-500 animate-pulse text-xl" />
              <span>مقصورة الإشعاع - مكتب شؤون الإشعار العام</span>
            </h3>
            <p className="text-[10px] text-slate-600 dark:text-rose-200 font-semibold">بصفتك مديراً معتمداً للرواق، يمكنك إدراج فصول الكتب والمقالات المنورة لتكون متاحة للقراء فوراً.</p>
          </div>

          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => setShowAddForm(showAddForm === 'book' ? 'none' : 'book')}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-black cursor-pointer transition-all flex items-center gap-1 border ${
                showAddForm === 'book'
                  ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-sm'
                  : 'bg-white/40 dark:bg-[#3D0A1B] border-white/30 dark:border-rose-900/30 text-slate-800 dark:text-rose-100 hover:bg-white/35'
              }`}
            >
              <span>+ إضافة كتاب جديد</span>
            </button>

            <button
              onClick={() => setShowAddForm(showAddForm === 'article' ? 'none' : 'article')}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-black cursor-pointer transition-all flex items-center gap-1 border ${
                showAddForm === 'article'
                  ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-sm'
                  : 'bg-white/40 dark:bg-[#3D0A1B] border-white/30 dark:border-rose-900/30 text-slate-800 dark:text-rose-100 hover:bg-white/35'
              }`}
            >
              <span>+ كتابة مقال فكري</span>
            </button>
          </div>
        </div>
      )}

      {/* Adding form drawer */}
      <AnimatePresence>
        {session.role === 'admin' && showAddForm !== 'none' && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden bg-white/40 dark:bg-black/45 backdrop-blur-md p-5 rounded-3xl border border-white/30 dark:border-rose-950/40"
          >
            <form onSubmit={showAddForm === 'book' ? handleAddNewBook : handleAddNewArticle} className="space-y-4">
              <h4 className="text-xs font-black dark:text-yellow-450 text-rose-950 font-serif flex items-center gap-1.5 border-b border-white/10 pb-2">
                <span>✦</span>
                <span>{showAddForm === 'book' ? 'تأثيث وتنزيل كتاب رقمي جديد لقاعدة البيانات العامة' : 'صياغة عمود مقالي جديد مهدى للقراء الظامئين'}</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] text-slate-500 dark:text-rose-250 mb-1">اسم المؤلف أو الكاتب</label>
                  <input
                    type="text"
                    required
                    value={addAuthor}
                    onChange={(e) => setAddAuthor(e.target.value)}
                    placeholder="صالح الدرعي..."
                    className="w-full p-2.5 bg-white/55 dark:bg-slate-950/60 border border-black/5 dark:border-rose-955 rounded-xl text-xs text-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-550 dark:text-rose-250 mb-1">العنوان كعنوان رئيسي</label>
                  <input
                    type="text"
                    required
                    value={addTitle}
                    onChange={(e) => setAddTitle(e.target.value)}
                    placeholder="مخطوط الرواق..."
                    className="w-full p-2.5 bg-white/55 dark:bg-slate-955 border border-black/5 dark:border-rose-955 rounded-xl text-xs text-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-555 dark:text-rose-250 mb-1">التصنيف أو القسم</label>
                  <select
                    value={addCategory}
                    onChange={(e) => setAddCategory(e.target.value)}
                    className="w-full p-2.5 bg-white/55 dark:bg-slate-955 border border-black/5 dark:border-rose-955 rounded-xl text-xs text-slate-800 dark:text-white"
                  >
                    <option value="عقيدة وتوحيد">عقيدة وتوحيد</option>
                    <option value="وعي فكري">وعي فكري</option>
                    <option value="فلسفة وتأمل">فلسفة وتأمل</option>
                    <option value="أدب ونقد">أدب ونقد</option>
                    <option value="تطوير الذات والروح">تطوير الذات والروح</option>
                    <option value="تاريخ وأدب">تاريخ وأدب</option>
                  </select>
                </div>
              </div>

              {showAddForm === 'book' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-white/10 dark:bg-black/10 p-3.5 rounded-2xl border border-white/15">
                  <div>
                    <label className="block text-[10px] text-slate-550 dark:text-rose-250 mb-1">طبيعة الكتاب وهيكل التسعير</label>
                    <select
                      value={addType}
                      onChange={(e) => setAddType(e.target.value as 'free' | 'paid')}
                      className="w-full p-2 bg-white/40 dark:bg-slate-900 border border-rose-950/20 text-xs rounded-xl text-slate-800 dark:text-white"
                    >
                      <option value="free">كتاب أدبي مجاني</option>
                      <option value="paid">نسخة مدفوعة للشراء</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-550 dark:text-rose-250 mb-1">تسعيرة الكتاب المقدرة للبيع</label>
                    <input
                      type="text"
                      className="w-full p-2 bg-white/40 dark:bg-slate-900 border border-rose-950/20 text-xs rounded-xl text-slate-800 dark:text-white"
                      value={addPrice}
                      onChange={(e) => setAddPrice(e.target.value)}
                      placeholder="٤٥ درهم"
                      disabled={addType === 'free'}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-550 dark:text-rose-250 mb-1">أدخل غلاف الكتاب التزييني</label>
                    <input
                      type="text"
                      className="w-full p-2 bg-white/40 dark:bg-slate-900 border border-rose-950/20 text-xs rounded-xl text-slate-800 dark:text-white font-mono"
                      value={addCoverImage}
                      onChange={(e) => setAddCoverImage(e.target.value)}
                      placeholder="https://images.unsplash.com/photo-..."
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 border-t border-white/5 pt-3.5">
                <div>
                  <label className="block text-[10px] text-slate-550 dark:text-rose-250 mb-1">{t('تقدير مدة تصفح وجدولة المادة', currentLang)}</label>
                  <input
                    type="text"
                    value={addReadTime}
                    onChange={(e) => setAddReadTime(e.target.value)}
                    placeholder={t('١٥ دقيقة قراءة', currentLang)}
                    className="w-full p-2.5 bg-white/55 dark:bg-slate-955 border border-black/5 dark:border-rose-955 rounded-xl text-xs text-slate-800 dark:text-white"
                  />
                </div>

                {showAddForm === 'book' && (
                  <div>
                    <label className="block text-[10px] text-slate-550 dark:text-rose-250 mb-1">{t('رابط PDF حر من درايف للمطالعة (سحابي غني)', currentLang)}</label>
                    <input
                      type="text"
                      className="w-full p-2.5 bg-white/55 dark:bg-slate-955 border border-black/5 dark:border-rose-955 rounded-xl text-xs text-slate-800 dark:text-white font-mono"
                      value={addPdfUrl}
                      onChange={(e) => setAddPdfUrl(e.target.value)}
                      placeholder="https://drive.google.com/..."
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-black text-rose-950 dark:text-rose-200 mb-1.5 font-serif select-none flex items-center gap-1">
                  <span>🖋️</span>
                  <span>{showAddForm === 'book' ? t('موجز ووصف أدبي عن فكرة ومحتويات المجلد', currentLang) : t('متن وصيغة المقال بالتفصيل', currentLang)}</span>
                </label>
                <MarkdownEditor
                  value={addDescription}
                  onChange={setAddDescription}
                  placeholder={
                    showAddForm === 'book'
                      ? t('موجز يسقي الفضول ويعرّف القراء بمحتوى هذا المجلد لتشجيعهم على التحميل والمطالعة الفورية...', currentLang)
                      : t('الكتابة بمداد من النور والوعي... ابدأ بصياغة مقالك الفكري المتميز هنا. يمكنك استخدام الأزرار الفاخرة بالأعلى لتنسيق العناوين، الاقتباسات، الأسطر العريضة، أو إدراج فواصل الفقرات.', currentLang)
                  }
                />
              </div>

              <div className="flex justify-end gap-2 text-[10px] select-none">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-1.5 bg-black/10 dark:bg-rose-955/25 text-slate-700 dark:text-rose-250 rounded-lg cursor-pointer hover:bg-black/15"
                >
                  {t('إلغاء الخروج', currentLang)}
                </button>
                <button
                  type="submit"
                  className="px-5 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-900 font-black rounded-lg cursor-pointer shadow-md"
                >
                  {t('حفظ في رفوف المكتبة ✦', currentLang)}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Global Filtration Bar */}
      <div className="bg-white/45 dark:bg-[#1C000B]/50 backdrop-blur-md rounded-3xl p-5 border border-white/30 dark:border-rose-955/30 shadow-md space-y-4">
        <div className="flex items-center justify-between border-b border-black/5 dark:border-white/10 pb-3">
          <div className="flex items-center gap-1.5 select-none">
            <Filter size={15} className="text-amber-500" />
            <span className="text-xs font-black text-[#1C000B] dark:text-rose-100 font-serif">{t('قسم الفرز والبلورة الآني للمواد والكتب', currentLang)}</span>
          </div>
          <span className="text-[10px] text-slate-550 dark:text-slate-400 font-mono font-bold">{t('المجموع المقارن:', currentLang)} {filteredAndSearchedItems.length} {t('مصنف', currentLang)}</span>
        </div>

        {/* Filters levels */}
        <div className="space-y-3 text-[10px] font-bold">
          {/* Level 1: Content Type */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-500 text-[9px] w-14 shrink-0 select-none">{t('نوع الرف:', currentLang)}</span>
            <button
              onClick={() => setExplorerType('all')}
              className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                explorerType === 'all'
                  ? 'bg-amber-500/70 text-slate-900 border border-amber-400/40 shadow-sm backdrop-blur-sm'
                  : 'bg-white/40 dark:bg-[#3D0A1B]/40 border border-black/5 dark:border-rose-955/20 text-slate-700 dark:text-slate-355 hover:bg-white/50'
              }`}
            >
              {t('عرض الكل', currentLang)}
            </button>
            <button
              onClick={() => setExplorerType('books')}
              className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                explorerType === 'books'
                  ? 'bg-sky-500/70 text-slate-900 dark:text-white border border-sky-305/40 shadow-sm backdrop-blur-sm'
                  : 'bg-white/40 dark:bg-[#3D0A1B]/40 border border-black/5 dark:border-rose-955/20 text-slate-705 dark:text-slate-355 hover:bg-white/50'
              }`}
            >
              <BookOpen size={10} />
              <span>{t('عرض الكتب', currentLang)}</span>
            </button>
            <button
              onClick={() => setExplorerType('articles')}
              className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                explorerType === 'articles'
                  ? 'bg-emerald-500/70 text-slate-950 dark:text-white border border-emerald-355/40 shadow-sm backdrop-blur-sm'
                  : 'bg-white/40 dark:bg-[#3D0A1B]/40 border border-black/5 dark:border-rose-955/20 text-slate-705 dark:text-slate-355 hover:bg-white/50'
              }`}
            >
              <FileText size={10} />
              <span>{t('عرض المقالات', currentLang)}</span>
            </button>
          </div>

          {/* Level 2: Categories Row */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-500 text-[9px] w-14 shrink-0 select-none">{t('أقسام ومواطن:', currentLang)}</span>
            <button
              onClick={() => setExplorerCategory('all')}
              className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                explorerCategory === 'all'
                  ? 'bg-amber-400 text-slate-950 border border-amber-305 shadow-sm'
                  : 'bg-white/40 dark:bg-[#3D0A1B] border border-transparent dark:border-rose-955/20 text-slate-700 dark:text-slate-350 hover:bg-white/35'
              }`}
            >
              {t('كل الأقسام الفرعية', currentLang)}
            </button>
            {availableCategories.map(cat => (
              <button
                key={cat}
                onClick={() => setExplorerCategory(cat)}
                className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                  explorerCategory === cat
                    ? 'bg-amber-400 text-slate-950 border border-amber-300 shadow-sm'
                    : 'bg-white/40 dark:bg-[#3D0A1B] border border-transparent dark:border-rose-955/20 text-slate-700 dark:text-slate-355 hover:bg-white/35'
                }`}
              >
                {t(cat, currentLang)}
              </button>
            ))}
          </div>

          {/* Level 3: Extra Tags/Kinds */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-500 text-[9px] w-14 shrink-0 select-none">{t('معايير مخصصة:', currentLang)}</span>
            <button
              onClick={() => setExplorerTag('all')}
              className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                explorerTag === 'all'
                  ? 'bg-amber-400 text-slate-950 border border-amber-300 shadow-sm'
                  : 'bg-white/40 dark:bg-[#3D0A1B] border border-transparent dark:border-rose-955/20 text-slate-700 dark:text-slate-350 hover:bg-white/35'
              }`}
            >
              {t('كل المحتويات', currentLang)}
            </button>
            <button
              onClick={() => setExplorerTag('saved')}
              className={`px-3 py-1 rounded-full transition-all cursor-pointer flex items-center gap-1 ${
                explorerTag === 'saved'
                  ? 'bg-amber-400 text-slate-950 border border-amber-300 shadow-sm'
                  : 'bg-white/40 dark:bg-[#3D0A1B] border border-transparent dark:border-rose-955/20 text-slate-705 dark:text-[#E2F1FF] hover:bg-white/35'
              }`}
            >
              <span>{t('المحفوظات الشخصية والمفضلة 🤍', currentLang)}</span>
            </button>
            <button
              onClick={() => setExplorerTag('pdf')}
              className={`px-3 py-1 rounded-full transition-all cursor-pointer flex items-center gap-1 ${
                explorerTag === 'pdf'
                  ? 'bg-amber-400 text-slate-950 border border-amber-300 shadow-sm'
                  : 'bg-white/40 dark:bg-[#3D0A1B] border border-transparent dark:border-rose-955/20 text-slate-700 dark:text-[#E2F1FF] hover:bg-white/35'
              }`}
            >
              <span>{t('مرفق بملف PDF مباشر للتحميل 📥', currentLang)}</span>
            </button>
          </div>
        </div>
      </div>


      {/* 3. Re-orchestrated GRID of UnifiedCards supporting identical designs and size constraints */}
      <h3 className="text-slate-800 dark:text-rose-100 font-serif text-sm font-black flex items-center gap-2 mt-4 select-none">
        <BookOpen className="text-amber-500 shrink-0 animate-bounce" size={16} />
        <span>{t('المعروضات ومصنفات الرفوف المتناسقة', currentLang)}</span>
      </h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 pt-1">
        {paginatedItems.map(item => {
          return (
            <motion.div
              layout
              key={item.id}
              className="w-full font-sans"
            >
              <UnifiedCard
                item={item.originalItem}
                type={item.type === 'book' ? 'book' : 'article'}
                session={session}
                currentLang={currentLang}
                onSelect={() => {
                  if (item.type === 'book') {
                    onSelectBook(item.originalItem);
                  } else {
                    onSelectArticle(item.originalItem);
                  }
                }}
                onToggleFavorite={(id, type, t) => toggleFavorite(id, type === 'book' ? 'book' : 'article', t)}
                onAssignRating={(id, type, val, t) => assignRating(id, type === 'book' ? 'book' : 'article', val, t)}
                onPurchase={(book) => setCheckoutBook(book)}
                triggerToast={triggerToast}
              />
            </motion.div>
          );
        })}

        {filteredAndSearchedItems.length === 0 && (
          <div className="col-span-full text-center py-12 bg-sky-950/20 rounded-3xl border border-dashed border-sky-900/30 text-xs text-slate-500 font-sans">
            🔍 عذراً، لم نجد أي كتب أو مقالات تطابق شروط الفرز والبحث المخصصة الآن.
          </div>
        )}
      </div>

      {/* Pagination Controls below the grid */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-6 select-none font-sans">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="p-1.5 px-4 text-[10px] font-bold rounded-xl bg-sky-200/45 dark:bg-rose-950/20 border border-sky-300/45 dark:border-rose-900/30 text-slate-800 dark:text-rose-100 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-sky-300/40 cursor-pointer transition-colors"
          >
            السابق
          </button>
          
          <span className="text-[11px] font-black px-3.5 py-1.5 rounded-lg border border-sky-300/20 dark:border-rose-900/40 bg-white/55 dark:bg-rose-955/25 text-slate-800 dark:text-amber-300 shadow-inner">
            {currentPage}
          </span>

          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="p-1.5 px-4 text-[10px] font-bold rounded-xl bg-sky-200/45 dark:bg-rose-950/20 border border-sky-300/45 dark:border-rose-900/30 text-slate-800 dark:text-rose-100 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-sky-300/40 cursor-pointer transition-colors"
          >
            التالي
          </button>
        </div>
      )}

      {/* 5. CHECKOUT BILLING POPUP MODAL */}
      <AnimatePresence>
        {checkoutBook && (
          <div id="checkout-sheet-overlay" className="fixed inset-0 z-55 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#2A0413] border border-rose-900/30 p-6 rounded-3xl w-full max-w-md shadow-2xl text-right my-auto text-rose-100 font-sans"
            >
              <div className="flex justify-between items-center pb-4 border-b border-rose-955/40 select-none">
                <h3 className="font-extrabold font-serif text-white text-sm flex items-center gap-1.5">
                  <CreditCard className="text-amber-400" size={18} />
                  <span>بوابة السداد والشراء الآمن للكتب الرقمية</span>
                </h3>
                <button
                  onClick={() => setCheckoutBook(null)}
                  className="p-1 hover:bg-rose-950/30 rounded-lg text-slate-400 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={executeBuyBook} className="space-y-4 mt-4 text-xs font-sans">
                <div className="bg-rose-950/30 p-3.5 rounded-2xl border border-rose-900/30 text-[10px] space-y-1 select-none">
                  <span className="text-amber-400 font-extrabold block font-sans">الكتاب المراد شراؤه:</span>
                  <div className="flex justify-between font-serif text-white font-bold">
                    <span>{checkoutBook.title}</span>
                    <span>{checkoutBook.price} درهم</span>
                  </div>
                  <p className="text-slate-455 mt-0.5 font-sans">ترخيص قراءة أبدي مرتبط ببريدك الإلكتروني.</p>
                </div>

                <div>
                  <label className="block text-slate-350 mb-1">اسم صاحب البطاقة الافتراضية</label>
                  <input
                    type="text"
                    required
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value)}
                    className="w-full p-2.5 bg-black/40 border border-rose-950/30 rounded-xl text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-350 mb-1">رقم بطاقة الدفع (محمي ببروتوكول SSL آمن)</label>
                  <input
                    type="text"
                    required
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full p-2.5 bg-black/40 border border-rose-955/30 rounded-xl text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-350 mb-1">تاريخ الانتهاء</label>
                    <input
                      type="text"
                      required
                      value={cardExpir}
                      onChange={(e) => setCardExpir(e.target.value)}
                      className="w-full p-2.5 bg-black/40 border border-rose-950/30 rounded-xl text-white font-mono focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-350 mb-1">رقم التحقق (CVV)</label>
                    <input
                      type="password"
                      required
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      className="w-full p-2.5 bg-black/40 border border-rose-950/30 rounded-xl text-white font-mono focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-lg cursor-pointer"
                  >
                    تأكيد وإتمام السداد الفوري
                  </button>
                  <button
                    type="button"
                    onClick={() => setCheckoutBook(null)}
                    className="px-4 py-2 bg-rose-955/30 rounded-lg text-slate-350 cursor-pointer"
                  >
                    رجوع
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
