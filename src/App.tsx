import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  INITIAL_BOOKS, INITIAL_ARTICLES, INITIAL_THOUGHTS, INITIAL_REVIEWS
} from './data';
import { Book, Article, Thought, Review, UserSession, RegisteredUser } from './types';
import SkyIntro from './components/SkyIntro';
import BookReader from './components/BookReader';
import ArticleView from './components/ArticleView';
import AdminPanel from './components/AdminPanel';

// Import our beautiful new modular custom components
import PersonalCabinet from './components/PersonalCabinet';
import ThoughtsCarousel from './components/ThoughtsCarousel';
import UniversalExplorer from './components/UniversalExplorer';
import AllThoughtsModal from './components/AllThoughtsModal';

import {
  BookOpen, Sparkles, FileText, Search, Plus, LogOut, Compass,
  ShieldCheck, ThumbsUp, Copy, Check, Heart, Bookmark, ArrowUp,
  SlidersHorizontal, MessageSquare, Star, BookOpenText, User, HelpCircle,
  Languages, Moon, Sun, Settings, Quote, X, Users, Type, CreditCard, ChevronDown
} from 'lucide-react';

import { t, LANGUAGES, translateBook, translateArticle, translateThought } from './utils/translation';
import siteLogo from './assets/images/site_logo_1781429602478.jpg';

function formatPHPUrl(inputUrl: string): string {
  if (!inputUrl) return "";
  let formatted = inputUrl.trim();
  if (!formatted.toLowerCase().includes(".php")) {
    if (!formatted.endsWith("/")) {
      formatted += "/";
    }
    formatted += "api.php";
  }
  return formatted;
}

// Smart Client-side Fetch Router to bypass cloud connection restrictions for local databases like XAMPP
export async function smartFetch(url: string, options?: RequestInit): Promise<Response> {
  const rawPhpUrl = localStorage.getItem('custom_php_api_url') || localStorage.getItem('detected_php_api_url') || '';
  const phpUrl = formatPHPUrl(rawPhpUrl);
  const isLocalhost = phpUrl && (phpUrl.includes('localhost') || phpUrl.includes('127.0.0.1'));
  
  if (isLocalhost && url.startsWith('/api/')) {
    const parts = url.split('/');
    const endpoint = parts[2]; // 'books', 'articles', etc.
    const id = parts[3]; // if exists
    
    try {
      const targetUrl = new URL(phpUrl);
      targetUrl.searchParams.set('action', endpoint);
      if (id) {
        targetUrl.searchParams.set('id', id);
      }
      
      const phpOptions: RequestInit = {
        ...options,
        mode: 'cors',
        credentials: 'omit'
      };
      
      console.log(`[SmartFetch Local Direct Route] ${url} -> ${targetUrl.toString()}`);
      return await fetch(targetUrl.toString(), phpOptions);
    } catch (e) {
      console.error('Failed to construct direct browser request to localhost PHP:', e);
    }
  }
  
  return fetch(url, options);
}

export default function App() {
  // Session State
  const [session, setSession] = useState<UserSession | null>(null);

  // Core Content States (loaded from localStorage on mount)
  const [books, setBooks] = useState<Book[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);

  // Font/Page Sizing State ("امكانية تكبير الخط او الصفحة من زر اعلى الصفحة")
  const [fontSizeLevel, setFontSizeLevel] = useState<number>(() => {
    return parseInt(localStorage.getItem('global_font_size_level') || '100');
  });

  // Reader overlays & Modals
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showProfile, setShowProfile] = useState(false); 
  const [showAllThoughtsModal, setShowAllThoughtsModal] = useState(false); 
  const [currentLang, setCurrentLang] = useState<string>(() => {
    const saved = localStorage.getItem('current_lang');
    if (saved) return saved;
    try {
      const browserLang = (navigator.language || (navigator as any).userLanguage || '').split('-')[0].toUpperCase();
      const matched = LANGUAGES.find(l => l.code === browserLang);
      if (matched) {
        localStorage.setItem('current_lang', matched.code);
        return matched.code;
      }
    } catch (e) {
      console.warn('Failed to detect browser language:', e);
    }
    return 'AR';
  });
  const [showLangDropdown, setShowLangDropdown] = useState(false); 

  // Theme settings (الوضع الفاتح السماوي بسحب متفرقة والداكن العنابي الفاخر)
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('library_dark_mode') === 'true';
  });

  // Search states
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState('');

  // Profile Form States
  const [profileName, setProfileName] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [profileSeed, setProfileSeed] = useState('');

  // Synchronized premium card interactions (Favorites, Ratings, Purchases, Billing)
  const [favorites, setFavorites] = useState<{ [key: string]: boolean }>({});
  const [ratings, setRatings] = useState<{ [key: string]: number }>({});
  const [purchasedBooks, setPurchasedBooks] = useState<{ [key: string]: boolean }>({});
  const [checkoutBook, setCheckoutBook] = useState<Book | null>(null);
  const [cardHolder, setCardHolder] = useState('');
  const [cardNumber, setCardNumber] = useState('4000 1234 5678 9010');
  const [cardExpir, setCardExpir] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('321');

  const syncInteractives = () => {
    const initialFavs: { [key: string]: boolean } = {};
    const initialRatings: { [key: string]: number } = {};
    const initialPurchased: { [key: string]: boolean } = {};

    // For books
    books.forEach(b => {
      const bKey = `book_${b.id}`;
      const isFav = localStorage.getItem(`bookmark_book_${b.id}`) === 'true' || 
                    localStorage.getItem(`bookmark_${b.id}`) === 'true' ||
                    localStorage.getItem(`liked_book_${b.id}`) === 'true';
      initialFavs[bKey] = isFav;

      const savedRate = localStorage.getItem(`rating_book_${b.id}`);
      if (savedRate) initialRatings[bKey] = parseInt(savedRate, 10);

      initialPurchased[b.id] = localStorage.getItem(`purchased_book_${b.id}`) === 'true';
    });

    // For articles
    articles.forEach(a => {
      const aKey = `article_${a.id}`;
      const isFav = localStorage.getItem(`liked_article_${a.id}`) === 'true' || 
                    localStorage.getItem(`bookmark_${a.id}`) === 'true' ||
                    localStorage.getItem(`liked_article_${a.id}`) === 'true';
      initialFavs[aKey] = isFav;

      const savedRate = localStorage.getItem(`rating_article_${a.id}`);
      if (savedRate) initialRatings[aKey] = parseInt(savedRate, 10);
    });

    setFavorites(initialFavs);
    setRatings(initialRatings);
    setPurchasedBooks(initialPurchased);
  };

  // Run on mount or when content logs change
  useEffect(() => {
    syncInteractives();
  }, [books, articles]);

  // Synchronize global root font-sizing for ALL text elements, readers and modals
  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSizeLevel}%`;
    localStorage.setItem('global_font_size_level', fontSizeLevel.toString());
  }, [fontSizeLevel]);

  // Synchronically handle document language and text-direction based on current choice
  useEffect(() => {
    const isRtl = currentLang === 'AR' || currentLang === 'FA' || currentLang === 'UR';
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    document.documentElement.lang = currentLang.toLowerCase();
    localStorage.setItem('current_lang', currentLang);
  }, [currentLang]);

  // Sync back from other components' storage edits dynamically
  useEffect(() => {
    const handleStorageChange = () => {
      syncInteractives();
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [books, articles]);

  // Redefined interactive actions for home premium cards
  const handleToggleFavorite = (id: string, type: 'book' | 'article', title: string) => {
    if (session?.role === 'guest') {
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

    // Sync to separate favorite list as requested
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

    // Force updates by triggering storage event
    window.dispatchEvent(new Event('storage'));
  };

  const handleAssignRating = (id: string, type: 'book' | 'article', val: number, name: string) => {
    if (session?.role === 'guest') {
      triggerToast('⚠️ التقييم بالنجوم متاح للأعضاء الملهمين فقط! يرجى التبديل لتسجيل النجوم 🌸');
      return;
    }

    const key = `${type}_${id}`;
    const storageKey = `rating_${type}_${id}`;
    localStorage.setItem(storageKey, val.toString());
    setRatings(prev => ({ ...prev, [key]: val }));

    // Sync to separate rating list as requested
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

    // Force updates by triggering storage event
    window.dispatchEvent(new Event('storage'));
  };

  const startPurchaseFlow = (book: Book) => {
    if (session?.role === 'guest') {
      triggerToast('⚠️ شراء الكتب متاح للأعضاء المسجلين فقط! تفضل بتسجيل حساب لتفعيل خدمات الدفع والمطالعة الممتلئة 🌸');
      return;
    }
    setCheckoutBook(book);
    setCardHolder(session.name);
  };

  const executeBuyBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkoutBook) return;

    localStorage.setItem(`purchased_book_${checkoutBook.id}`, 'true');
    setPurchasedBooks(prev => ({ ...prev, [checkoutBook.id]: true }));
    triggerToast(`🎉 مبروك! تم سداد قيمة الكتاب [${checkoutBook.title}] بنجاح وحفظت رخصتك بالملفات! تم فك الحظر عن القراءة.`);
    setCheckoutBook(null);

    // Force updates by triggering storage event
    window.dispatchEvent(new Event('storage'));
  };



  // Override localStorage.setItem locally to intercept any library modifications
  // and sync them immediately with our server-side database in the background.
  useEffect(() => {
    const originalSetItem = localStorage.setItem;

    localStorage.setItem = function(key: string, value: string) {
      originalSetItem.apply(this, [key, value]);

      if (key.startsWith('library_')) {
        try {
          const parsed = JSON.parse(value);
          const body: any = {};
          if (key === 'library_books') body.books = parsed;
          else if (key === 'library_articles') body.articles = parsed;
          else if (key === 'library_thoughts') body.thoughts = parsed;
          else if (key === 'library_reviews') body.reviews = parsed;
          else if (key === 'library_users') body.users = parsed;

          if (Object.keys(body).length > 0) {
            smartFetch('/api/sync', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(body)
            }).catch(err => console.error('Database Sync network error:', err));
          }
        } catch (e) {
          console.error('Database Sync serialization error:', e);
        }
      }
    };

    return () => {
      localStorage.setItem = originalSetItem;
    };
  }, []);

  // Load state from Express server database or local storage fallback on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const originalSetItem = localStorage.setItem;

        // Step 1: Check server database status
        const statusRes = await smartFetch('/api/status');
        const status = await statusRes.json();

        // Save detected PHP API URL if provided (enables client direct bypass for localhost XAMPP)
        if (status.phpApiUrl) {
          localStorage.setItem('detected_php_api_url', status.phpApiUrl);
        } else {
          localStorage.removeItem('detected_php_api_url');
        }

        // Step 2: Bootstrap/seed database files on server if they don't exist yet
        if (!status.initialized) {
          const defaultUsers = JSON.parse(localStorage.getItem('library_users') || '{}');
          await smartFetch('/api/bootstrap', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              books: INITIAL_BOOKS,
              articles: INITIAL_ARTICLES,
              thoughts: INITIAL_THOUGHTS,
              reviews: INITIAL_REVIEWS,
              users: defaultUsers,
            }),
          });
          console.log('Database initialized from client defaults successfully.');
        }

        // Step 3: Fetch updated states from dynamic API database 
        const [booksRes, articlesRes, thoughtsRes, reviewsRes, usersRes] = await Promise.all([
          smartFetch('/api/books'),
          smartFetch('/api/articles'),
          smartFetch('/api/thoughts'),
          smartFetch('/api/reviews'),
          smartFetch('/api/users'),
        ]);

        const dbBooks = await booksRes.json();
        const dbArticles = await articlesRes.json();
        const dbThoughts = await thoughtsRes.json();
        const dbReviews = await reviewsRes.json();
        const dbUsers = await usersRes.json();

        // Prevent recursive triggers by calling the original storage setter directly
        originalSetItem.call(localStorage, 'library_books', JSON.stringify(dbBooks));
        originalSetItem.call(localStorage, 'library_articles', JSON.stringify(dbArticles));
        originalSetItem.call(localStorage, 'library_thoughts', JSON.stringify(dbThoughts));
        originalSetItem.call(localStorage, 'library_reviews', JSON.stringify(dbReviews));
        originalSetItem.call(localStorage, 'library_users', JSON.stringify(dbUsers));

        setBooks(dbBooks);
        setArticles(dbArticles);
        setThoughts(dbThoughts);
        setReviews(dbReviews);

      } catch (err) {
        console.warn('API Database server unreachable, falling back to local client state cache:', err);
        const localBooks = localStorage.getItem('library_books');
        const localArticles = localStorage.getItem('library_articles');
        const localThoughts = localStorage.getItem('library_thoughts');
        const localReviews = localStorage.getItem('library_reviews');

        let loadedBooks: Book[] = localBooks ? JSON.parse(localBooks) : INITIAL_BOOKS;
        if (!loadedBooks.some(b => b.id === 'b-wasitiyyah')) {
          const wasitiyyahDefault = INITIAL_BOOKS.find(b => b.id === 'b-wasitiyyah');
          if (wasitiyyahDefault) {
            loadedBooks = [wasitiyyahDefault, ...loadedBooks];
            localStorage.setItem('library_books', JSON.stringify(loadedBooks));
          }
        }

        setBooks(loadedBooks);
        setArticles(localArticles ? JSON.parse(localArticles) : INITIAL_ARTICLES);
        setThoughts(localThoughts ? JSON.parse(localThoughts) : INITIAL_THOUGHTS);
        setReviews(localReviews ? JSON.parse(localReviews) : INITIAL_REVIEWS);
      }
    };

    loadData();
  }, []);

  // Sync profile values
  useEffect(() => {
    if (session) {
      setProfileName(session.name);
      setProfileEmail(session.email || '');
      setProfileSeed(session.avatarSeed || '📚');
    }
  }, [session]);

  const saveBooks = (updated: Book[]) => {
    setBooks(updated);
    localStorage.setItem('library_books', JSON.stringify(updated));
  };

  const saveArticles = (updated: Article[]) => {
    setArticles(updated);
    localStorage.setItem('library_articles', JSON.stringify(updated));
  };

  const saveThoughts = (updated: Thought[]) => {
    setThoughts(updated);
    localStorage.setItem('library_thoughts', JSON.stringify(updated));
  };

  const saveReviews = (updated: Review[]) => {
    setReviews(updated);
    localStorage.setItem('library_reviews', JSON.stringify(updated));
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const toggleDarkMode = () => {
    const newVal = !isDarkMode;
    setIsDarkMode(newVal);
    localStorage.setItem('library_dark_mode', newVal.toString());
    triggerToast(newVal ? 'تم تفعيل الوضع العنابي الفاخر والنجوم المتلألئة 🍷✨' : 'تم تفعيل وضع النهار السماوي الفاتح ☀️☁️');
  };

  // Profile Update Handler (now working dynamically for both guests & members!)
  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!session || !profileName.trim()) return;

    const updatedSess: UserSession = {
      ...session,
      name: profileName.trim(),
      email: profileEmail.trim(),
      avatarSeed: profileSeed.trim() || '📚'
    };
    setSession(updatedSess);

    // Save back to local registered users if not guest
    if (session.role !== 'guest') {
      const users = JSON.parse(localStorage.getItem('library_users') || '{}');
      if (users[session.username]) {
        users[session.username].name = profileName.trim();
        users[session.username].email = profileEmail.trim();
        users[session.username].avatarSeed = profileSeed.trim();
        localStorage.setItem('library_users', JSON.stringify(users));
      }
    }

    setShowProfile(false);
    triggerToast('✅ تم تحديث ملفك الشخصي بنجاح!');
  };

  const handleAddBook = (newBook: Book) => {
    saveBooks([...books, newBook]);
  };

  const handleDeleteBook = (id: string) => {
    saveBooks(books.filter((b) => b.id !== id));
    if (selectedBook?.id === id) setSelectedBook(null);
  };

  const handleAddArticle = (newArt: Article) => {
    saveArticles([...articles, newArt]);
  };

  const handleDeleteArticle = (id: string) => {
    saveArticles(articles.filter((a) => a.id !== id));
    if (selectedArticle?.id === id) setSelectedArticle(null);
  };

  const handleAddThought = (newThought: Thought) => {
    saveThoughts([...thoughts, newThought]);
  };

  const handleDeleteThought = (id: string) => {
    saveThoughts(thoughts.filter((t) => t.id !== id));
  };

  const handleUpdateBook = (updatedBook: Book) => {
    saveBooks(books.map((b) => (b.id === updatedBook.id ? updatedBook : b)));
    if (selectedBook?.id === updatedBook.id) setSelectedBook(updatedBook);
    triggerToast('✏️ تم تعديل وتحديث بيانات الكتاب بنجاح!');
  };

  const handleUpdateArticle = (updatedArt: Article) => {
    saveArticles(articles.map((a) => (a.id === updatedArt.id ? updatedArt : a)));
    if (selectedArticle?.id === updatedArt.id) setSelectedArticle(updatedArt);
    triggerToast('✏️ تم تعديل وتحديث المقالة بنجاح!');
  };

  const handleUpdateThought = (updatedThought: Thought) => {
    saveThoughts(thoughts.map((t) => (t.id === updatedThought.id ? updatedThought : t)));
    triggerToast('✏️ تم تعديل وتحديث الخاطرة بنجاح!');
  };

  const handleAddReview = (newReview: Review) => {
    const existingIdx = reviews.findIndex(r => r.id === newReview.id);
    if (existingIdx !== -1) {
      const copyReviews = [...reviews];
      copyReviews[existingIdx] = newReview;
      saveReviews(copyReviews);
    } else {
      saveReviews([...reviews, newReview]);
      triggerToast('تم توثيق تقييمك ورأيك السديد بنجاح! ⭐');
    }
  };

  const handleLikeThought = (thoughtId: string) => {
    const hasAlreadyLiked = localStorage.getItem(`liked_thought_${thoughtId}`);
    if (hasAlreadyLiked) {
      triggerToast('لقد تفاعلت مع هذه الخاطرة مسبقاً ✨');
      return;
    }

    const updated = thoughts.map((t) => {
      if (t.id === thoughtId) {
        return { ...t, likes: t.likes + 1 };
      }
      return t;
    });
    saveThoughts(updated);
    localStorage.setItem(`liked_thought_${thoughtId}`, 'true');
    triggerToast('شكراً لدعمك خواطر الدرعي الوجدانية! ❤️');
  };

  const handleLikeArticle = (articleId: string) => {
    const updated = articles.map((a) => {
      if (a.id === articleId) {
        return { ...a, likes: a.likes + 1 };
      }
      return a;
    });
    saveArticles(updated);
    if (selectedArticle?.id === articleId) {
      setSelectedArticle({ ...selectedArticle, likes: selectedArticle.likes + 1 });
    }
    triggerToast('شكرًا لتسجيل إعجابك بالمقال الفكري المميز! 👍');
  };

  const handleCopyThought = (thought: Thought) => {
    const titleLead = thought.title ? `[خاطرة: ${thought.title}] ` : '';
    navigator.clipboard.writeText(`${titleLead}"${thought.content}" - بقلم: ${thought.author} (مكتبة الدرعي الرقمية)`);
    setCopiedId(thought.id);
    triggerToast('تم نسخ الخاطرة إلى الحافظة لنشرها 📋');
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Switch User - allows user to dynamically log out / switch to another role
  const handleSwitchUser = () => {
    localStorage.removeItem('library_session'); // clear autosave
    setSession(null); // triggers skyintro screen
    triggerToast('محول الجلسة: الانتقال إلى صفحة تصنيف وتبديل المستخدمين 🔄');
  };

  const handleLogout = () => {
    localStorage.removeItem('library_session');
    setSession(null);
    triggerToast('تم تسجيل الخروج بأمان من مكتبة الدرعي 🚪');
  };

  // Calculate Most Viewed and Latest Items for section
  const translatedBooks = useMemo(() => books.map(b => translateBook(b, currentLang)), [books, currentLang]);
  const translatedArticles = useMemo(() => articles.map(a => translateArticle(a, currentLang)), [articles, currentLang]);
  const translatedThoughts = useMemo(() => thoughts.map(tData => translateThought(tData, currentLang)), [thoughts, currentLang]);

  const mostViewedBooks = useMemo(() => {
    // Sort books by rating or we can sort by ratings/views, taking the best rated
    return translatedBooks.slice().sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 3);
  }, [translatedBooks]);

  const mostViewedArticles = useMemo(() => {
    return translatedArticles.slice().sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 3);
  }, [translatedArticles]);

  const latestBooks = useMemo(() => {
    return translatedBooks.slice().reverse().slice(0, 3);
  }, [translatedBooks]);

  const latestArticles = useMemo(() => {
    return translatedArticles.slice().reverse().slice(0, 3);
  }, [translatedArticles]);

  // If there's no active session, show the beautiful sky descent welcome
  if (!session) {
    return <SkyIntro onSelectSession={(userSess) => setSession(userSess)} />;
  }

  return (
    <div
      id="main-applet-root"
      style={{ fontSize: `${fontSizeLevel}%` }}
      className={`min-h-screen font-sans flex flex-col relative select-text transition-all duration-700 ease-in-out ${
        isDarkMode
          ? 'bg-gradient-to-br from-[#1E020B] via-[#350516] to-[#0A0003] text-rose-50'
          : 'bg-gradient-to-b from-[#E6F3FF] via-[#F2F8FF] to-[#DCEEFF] text-slate-900'
      }`}
      dir="rtl"
    >
      {/* ☁️ Decorative Cloud Elements when daylight on (Light sky blue with scattered clouds) */}
      {!isDarkMode && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          <motion.div
            animate={{ x: [-100, 1400], y: [30, 45] }}
            transition={{ repeat: Infinity, duration: 65, ease: 'linear' }}
            className="absolute top-10 left-10 w-44 h-14 bg-white/60 blur-xl rounded-full"
          />
          <motion.div
            animate={{ x: [1200, -200], y: [130, 110] }}
            transition={{ repeat: Infinity, duration: 80, ease: 'linear' }}
            className="absolute top-36 right-20 w-64 h-16 bg-white/50 blur-3xl rounded-full"
          />
          <motion.div
            animate={{ x: [-200, 1200], y: [240, 225] }}
            transition={{ repeat: Infinity, duration: 70, ease: 'linear' }}
            className="absolute top-80 left-20 w-56 h-16 bg-white/40 blur-xl rounded-full"
          />
        </div>
      )}

      {/* 🌌 Decorative stars layer when Burgundy mode is enabled (Luxury burgundy stars) */}
      {isDarkMode && (
        <div id="stars-sky-canvas" className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          {Array.from({ length: 45 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full animate-pulse"
              style={{
                top: `${Math.random() * 95}%`,
                left: `${Math.random() * 100}%`,
                width: `${Math.random() * 2 + 1}px`,
                height: `${Math.random() * 2 + 1}px`,
                backgroundColor: i % 2 === 0 ? '#FBD38D' : '#FFE3EC', // gold-rose stars
                animationDuration: `${Math.random() * 3.5 + 1.5}s`,
                opacity: Math.random() * 0.8 + 0.2,
              }}
            />
          ))}
        </div>
      )}

      {/* Header bar element (incorporating translation and user controls globally) */}
      <header className={`sticky top-0 z-40 px-4 py-3 select-none backdrop-blur-md transition-colors border-b ${
        isDarkMode
          ? 'bg-rose-950/40 border-rose-900/30 text-rose-100'
          : 'bg-white/40 border-white/30 text-slate-800 shadow-sm'
      }`}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-3 shrink-0 select-none">
            <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center bg-white border border-slate-200 dark:border-white/25 shadow-md">
              <img
                src={siteLogo}
                alt="Logo"
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <h1 className="text-xs md:text-sm font-black font-serif leading-none">{t('مكتبة الدرعي الرقمية', currentLang)}</h1>
              <span className="text-[9px] font-bold block mt-0.5 opacity-90">{t('رواق التدبر ونقاء الحكمة الوجدانية', currentLang)}</span>
            </div>
          </div>

          {/* Translation Dropdown Widget (Custom styled matching reference image perfectly) */}
          <div className="relative z-50 select-none">
            <button
              onClick={() => setShowLangDropdown(!showLangDropdown)}
              className="border-2 border-[#00b4d8] bg-sky-50/60 dark:bg-slate-900/60 hover:bg-sky-50/90 dark:hover:bg-slate-900/90 rounded-2xl px-3 py-1.5 flex items-center justify-between gap-3 text-slate-800 dark:text-rose-100 font-sans cursor-pointer transition-all shadow-sm duration-200"
              title={t('اختر لغة لترجمة كامل الموقع فوراً', currentLang)}
            >
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-[9px] bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-300 uppercase font-black tracking-wider">
                  {(LANGUAGES.find(l => l.code === currentLang) || LANGUAGES[0]).initial}
                </span>
                <span className="font-black text-xs">
                  {(LANGUAGES.find(l => l.code === currentLang) || LANGUAGES[0]).name}
                </span>
              </div>
              <ChevronDown 
                size={12} 
                className={`text-[#00b4d8] transition-transform duration-300 ${showLangDropdown ? 'rotate-180' : ''}`} 
              />
            </button>

            <AnimatePresence>
              {showLangDropdown && (
                <>
                  {/* Click outside backdrop for closing the dropdown */}
                  <div 
                    className="fixed inset-0 z-40 bg-transparent" 
                    onClick={() => setShowLangDropdown(false)}
                  />
                  
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute z-50 top-full mt-2 left-1/2 -translate-x-1/2 md:left-auto md:right-0 md:translate-x-0 bg-white dark:bg-[#1E020B] border border-slate-200 dark:border-rose-955/30 rounded-[20px] shadow-2xl w-44 overflow-hidden flex flex-col py-1 max-h-[300px] overflow-y-auto scrollbar-thin"
                  >
                    {LANGUAGES.map((lang) => {
                      const isSelected = lang.code === currentLang;
                      return (
                        <button
                          key={lang.code}
                          onClick={() => {
                            setCurrentLang(lang.code);
                            localStorage.setItem('current_lang', lang.code);
                            setShowLangDropdown(false);
                            triggerToast(`🌐 Display language: [ ${lang.name} ]`);
                          }}
                          className={`px-3 py-2 text-left flex items-center gap-2.5 text-xs cursor-pointer transition-colors duration-150 ${
                            isSelected
                              ? 'bg-[#1d4ed8] text-white font-extrabold shadow-sm' // Royal blue selected state matching image!
                              : 'hover:bg-slate-100 dark:hover:bg-rose-955/20 text-slate-700 dark:text-rose-250'
                          }`}
                        >
                          <span className={`font-mono text-[9px] uppercase font-black px-1 rounded ${
                            isSelected 
                              ? 'bg-white/20 text-white' 
                              : 'bg-slate-100 dark:bg-rose-955/10 text-slate-400 dark:text-rose-300'
                          }`}>
                            {lang.initial}
                          </span>
                          <span className="font-sans font-black flex-1 text-[11px]">{lang.name}</span>
                        </button>
                      );
                    })}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* 3 User Actions + theme ("وزر تبديل المستتخدم وزر الخروج وزر الملف الشخصي") */}
          <div className="flex items-center flex-wrap gap-2">
            {/* Theme Toggle */}
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
                isDarkMode
                  ? 'bg-[#3D0A1B] border-[#5E122D] text-amber-300 shadow-sm shadow-rose-900/20'
                  : 'bg-white/55 hover:bg-white/70 border-white/40 text-slate-700'
              }`}
              title="تغيير سمات الفضاء والألوان"
            >
              {isDarkMode ? <Sun size={14} /> : <Moon size={14} />}
            </button>

            {/* Font Size Adjustment ("تكبير الخط او الصفحة من زر اعلى الصفحة") */}
            <div className={`flex items-center gap-1 p-1 rounded-xl border select-none ${
              isDarkMode
                ? 'bg-rose-950/20 border-rose-900/30 text-rose-100'
                : 'bg-white/55 border-white/40 text-slate-705'
            }`} title="حجم الخط والصفحة">
              <button
                onClick={() => setFontSizeLevel(Math.max(80, fontSizeLevel - 10))}
                className="px-2 py-0.5 text-[10px] font-black hover:bg-black/10 dark:hover:bg-white/10 rounded cursor-pointer transition-colors"
                title="تصغير الخط"
              >
                A-
              </button>
              <span className="text-[9px] font-black font-mono px-1.5 border-x border-slate-300 dark:border-rose-955/40">{fontSizeLevel}%</span>
              <button
                onClick={() => setFontSizeLevel(Math.min(140, fontSizeLevel + 10))}
                className="px-2 py-0.5 text-[10px] font-black hover:bg-black/10 dark:hover:bg-white/10 rounded cursor-pointer transition-colors"
                title="تكبير الخط"
              >
                A+
              </button>
            </div>

            {/* Profile Button ("يشتغل مع كل المستخدمين") */}
            {(session.role === 'user' || session.role === 'admin') && (
              <button
                onClick={() => setShowProfile(true)}
                className="flex items-center gap-1.5 p-1.5 px-3 bg-white/20 dark:bg-[#3D0A1B]/55 hover:bg-white/40 rounded-full border border-white/20 dark:border-rose-900/30 text-xs transition-colors cursor-pointer text-slate-800 dark:text-rose-100"
                title="إعداد وتعديل ملفي الشخصي الوجداني"
              >
                <div className="w-5 h-5 rounded-full bg-[#1E020B] text-amber-200 flex items-center justify-center text-[9px] font-bold">
                  {session.avatarSeed || '👤'}
                </div>
                <span className="text-[10px] font-black">{session.name}</span>
              </button>
            )}

            {/* Switch User Button ("وزر تبديل المستخدم") */}
            <button
              onClick={handleSwitchUser}
              className="px-3 py-1.5 bg-black/10 dark:bg-[#3D0A1B] text-[#1e020b]/90 dark:text-amber-200 hover:bg-black/20 rounded-full text-[9px] font-bold cursor-pointer transition-all border border-white/10 flex items-center gap-1"
              title="العودة لشاشرة البداية لتغيير الدور"
            >
              <Users size={11} />
              <span>تبديل المستخدم</span>
            </button>

            {/* Admin cockpit option - RESTRICTED FOR GUESTS */}
            {session.role === 'admin' && (
              <button
                onClick={() => setShowAdminPanel(true)}
                className="px-3 py-1.5 bg-[#4A0B22] border border-rose-800/40 text-amber-300 rounded-full text-[9px] font-black transition-all cursor-pointer shadow-md flex items-center gap-1"
              >
                <ShieldCheck size={11} />
                <span>رواق الإدارة</span>
              </button>
            )}

            {/* Logout Button ("زر الخروج") */}
            <button
              onClick={handleLogout}
              className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl transition-colors cursor-pointer"
              title="خروج بأمان للبداية"
            >
              <LogOut size={13} />
            </button>
          </div>

        </div>
      </header>

      {/* Main Container Stage */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 space-y-12 z-10 relative">

        {/* 1. Personal cabinet showcasing Saves, Favorites, and Ratings ("وتظهر فيها التقييمات والحفظ والمفضلة") */}
        {session.role !== 'guest' && (
          <section id="cabinet-section" className="transition-all">
            <PersonalCabinet
              books={translatedBooks}
              articles={translatedArticles}
              reviews={reviews}
              session={session}
              onSelectBook={setSelectedBook}
              onSelectArticle={setSelectedArticle}
              triggerToast={triggerToast}
            />
          </section>
        )}

        {/* 2. Thoughts Carousel alongside articles ("الخواطر تظهر خاطرة واحدة والتنقل بينها بزر التنقل ومقابلها مربع المقالات") */}
        <section id="thoughts-articles-carousel-section" className="space-y-3">
          <div className="flex items-center justify-between gap-3 border-b border-black/5 dark:border-white/10 pb-2 mb-3">
            <div className="flex items-center gap-1.5 text-xs font-serif font-black text-slate-850 dark:text-rose-100">
              <Sparkles size={14} className="text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
              <button
                onClick={() => {
                  setShowAllThoughtsModal(true);
                  triggerToast('📜 جاري فتح ديوان الخواطر والدرر الوجدانية الكاملة...');
                }}
                className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors text-right cursor-pointer flex items-center gap-1 font-bold bg-transparent border-none p-0"
                title="اضغط لفتح صفحة كافة الخواطر"
              >
                <span>نبض الكلمة وسحر الأطروحات الفكرية</span>
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-normal underline">(قراءة المزيد)</span>
              </button>
            </div>
            
            <button
              onClick={() => {
                setShowAllThoughtsModal(true);
                triggerToast('📜 جاري فتح ديوان الخواطر والدرر الوجدانية الكاملة...');
              }}
              className="px-3 py-1 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-full text-[10px] font-black cursor-pointer transition-colors shadow-sm"
            >
              قراءة المزيد ✦
            </button>
          </div>

          <ThoughtsCarousel
            thoughts={translatedThoughts}
            articles={translatedArticles}
            session={session}
            onSelectArticle={setSelectedArticle}
            onLikeThought={handleLikeThought}
            onCopyThought={handleCopyThought}
            copiedId={copiedId}
            triggerToast={triggerToast}
            onViewAllThoughts={() => {
              setShowAllThoughtsModal(true);
              triggerToast('📜 جاري فتح ديوان الخواطر والدرر الوجدانية الكاملة...');
            }}
          />
        </section>

        {/* 3. Underneath: Most viewed and latest highlights ("وتحت الأكثر مشاهدة والأحدث إضافة") */}
        <section id="highlights-section" className="space-y-6 select-none animate-fadeIn">
          <div className="flex items-center gap-1.5 text-xs font-serif font-black mb-1 text-slate-800 dark:text-rose-100">
            <Compass size={14} className="text-amber-400 animate-pulse" />
            <span>ركن التوصيات الكبرى والأضواء الساطعة للرواق الأدبي</span>
          </div>

          {/* FIRST BOX: MOST VIEWED (مربع خاص لوحده الأكثر قراءة ومشاهدة) */}
          <div className="bg-white/45 dark:bg-[#1E020A]/40 backdrop-blur-md p-6 rounded-[32px] border border-white/30 dark:border-rose-955/20 shadow-xl space-y-5 text-right">
            <div className="flex items-center justify-between border-b border-black/5 dark:border-white/10 pb-3">
              <h4 className="text-xs md:text-sm font-serif font-black text-amber-700 dark:text-amber-400 flex items-center gap-2">
                <span>🔥</span>
                <span>المواد والتصانيف الأكثر قراءة وتصفحاً بالمنبر</span>
              </h4>
              <span className="text-[10px] bg-amber-400/10 text-amber-700 dark:text-amber-200 px-2.5 py-0.5 rounded-full border border-amber-400/20 font-bold select-none">
                رواج واطلاع دائم
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Articles right subbox */}
              <div className="space-y-3.5">
                <div className="flex items-center gap-1.5 text-[11px] font-black text-emerald-700 dark:text-emerald-400 border-r-2 border-emerald-500 pr-2">
                  <span>✍️</span>
                  <span>المقالات والدراسات الأكثر مشاهدة وتفاعلاً (٣ مقالات)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3 gap-4">
                  {mostViewedArticles.map((art) => {
                    const key = `article_${art.id}`;
                    const isFav = favorites[key] || false;
                    const curRating = ratings[key] || art.rating || 5;

                    return (
                      <div
                        key={art.id}
                        className="rounded-tr-[30px] rounded-bl-[30px] rounded-tl-[12px] rounded-br-[12px] p-4 shadow-md border w-full flex flex-col justify-between text-right space-y-3 hover:scale-[1.01] hover:shadow-lg transition-all duration-300 relative bg-gradient-to-b from-[#f5fdf9] to-[#edfcf2]/95 border-emerald-250/30 dark:from-[#092214] dark:to-[#021008] dark:border-[#1F4C36]/40 text-slate-800 dark:text-sky-50"
                      >
                        <div className="space-y-2">
                          <div className="relative w-full h-[100px] rounded-tr-[24px] rounded-bl-[24px] rounded-tl-[8px] rounded-br-[8px] overflow-hidden shadow-inner bg-slate-950/10 border border-black/5">
                            {art.coverImage ? (
                              <img
                                src={art.coverImage}
                                alt={art.title}
                                className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-[#1E020B] to-[#3D0A1B] p-2 flex flex-col justify-between text-white">
                                <span className="text-[8px] bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/10 text-emerald-300 self-start">{art.category}</span>
                                <h5 className="font-serif font-black text-[10px] leading-snug line-clamp-2">{art.title}</h5>
                                <span className="text-[8px] text-rose-300/80">بقلم: {art.author}</span>
                              </div>
                            )}
                            <div className="absolute top-2 left-2 select-none z-10 font-black text-[8px]">
                              <span className="px-1.5 py-0.5 rounded-full bg-[#10b981] text-white border border-[#34d399]/40">مقالة</span>
                            </div>
                            <div className="absolute top-2 right-2 select-none z-10 font-black text-[8px]">
                              <span className="px-1.5 py-0.5 rounded-full bg-black/60 text-amber-300">👁️ {art.views}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-[9px] font-bold">
                            <span className="text-slate-705 dark:text-sky-200">القسم: {art.category}</span>
                            <div className="flex items-center gap-0.5 select-none" title="تقييم المقال">
                              <span className="text-[9.5px] text-slate-550 dark:text-sky-305 font-mono">({curRating}.0)</span>
                              <div className="flex items-center">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <button
                                    key={star}
                                    onClick={() => handleAssignRating(art.id, 'article', star, art.title)}
                                    className="text-amber-500 hover:scale-125 transition-transform cursor-pointer border-none bg-transparent p-0"
                                  >
                                    <Star size={8} fill={curRating >= star ? '#f59e0b' : 'none'} className="text-[#f59e0b] stroke-[#f59e0b]" />
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>

                          <h4
                            onClick={() => setSelectedArticle(art)}
                            className="text-[11px] font-black font-serif text-slate-900 dark:text-white hover:text-sky-600 dark:hover:text-[#00b4d8] cursor-pointer transition-colors leading-snug line-clamp-1"
                          >
                            🌸 {art.title}
                          </h4>
                        </div>

                        <div className="space-y-2 pt-1">
                          <div className="border-t border-slate-200/40 dark:border-sky-900/10 pt-2" />
                          <div className="flex justify-between items-center text-[10px]">
                            <button
                              onClick={() => handleToggleFavorite(art.id, 'article', art.title)}
                              className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all cursor-pointer ${
                                isFav
                                  ? 'bg-rose-500/15 text-rose-500 border-rose-500/30'
                                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-850/45 dark:hover:bg-slate-850 border-slate-200/50 dark:border-rose-900/20 text-slate-400 hover:text-rose-500'
                              }`}
                              title="مفضلة"
                            >
                              <Heart size={10} fill={isFav ? 'currentColor' : 'none'} className="text-rose-500" />
                            </button>
                            <button
                              onClick={() => setSelectedArticle(art)}
                              className="px-2.5 py-1 bg-[#00b4d8] hover:bg-[#0096c7] text-[#001D24] font-black rounded-lg text-[9px] cursor-pointer transition-all flex items-center gap-1 shadow-sm"
                            >
                              <span>تصفح المقال</span>
                              <span>←</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Books left subbox */}
              <div className="space-y-3.5">
                <div className="flex items-center gap-1.5 text-[11px] font-black text-rose-750 dark:text-rose-350 border-r-2 border-rose-450 pr-2">
                  <span>📚</span>
                  <span>الكتب والدواوين الفاخرة الأكثر قراءة وتقييماً (٣ كتب)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3 gap-4">
                  {mostViewedBooks.map((book) => {
                    const key = `book_${book.id}`;
                    const isFav = favorites[key] || false;
                    const curRating = ratings[key] || book.rating || 5;
                    const isFreeCopy = book.isFree !== false;
                    const priceStr = book.price ? `${book.price} درهم` : '٤٥ درهم';
                    const isPurchased = purchasedBooks[book.id] || localStorage.getItem(`purchased_book_${book.id}`) === 'true';

                    return (
                      <div
                        key={book.id}
                        className="rounded-tr-[30px] rounded-bl-[30px] rounded-tl-[12px] rounded-br-[12px] p-4 shadow-md border w-full flex flex-col justify-between text-right space-y-3 hover:scale-[1.01] hover:shadow-lg transition-all duration-300 relative bg-gradient-to-b from-[#f5faff] to-[#edf7fe]/95 border-sky-250/30 dark:from-[#0b1c2b] dark:to-[#030d16] dark:border-[#0f4c75]/40 text-slate-800 dark:text-[#E2F1FF]"
                      >
                        <div className="space-y-2">
                          <div className="relative w-full h-[100px] rounded-tr-[24px] rounded-bl-[24px] rounded-tl-[8px] rounded-br-[8px] overflow-hidden shadow-inner bg-slate-950/10 border border-black/5">
                            {book.coverImage ? (
                              <img
                                src={book.coverImage}
                                alt={book.title}
                                className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className={`w-full h-full bg-gradient-to-br ${book.coverStyle?.bg || 'from-[#1e293b] to-[#0f172a]'} p-2 flex flex-col justify-between text-white relative`}>
                                <span className="text-[8px] bg-white/10 px-1.5 py-0.5 rounded text-white border border-white/10 self-start">{book.category}</span>
                                <h5 className="font-serif font-black text-[10px] leading-snug line-clamp-2">{book.title}</h5>
                                <span className="text-[8px] text-amber-255 font-bold self-end">{isFreeCopy ? 'مجاني' : 'فاخر'}</span>
                              </div>
                            )}
                            <div className="absolute top-2 left-2 select-none z-10 font-black text-[8px]">
                              <span className="px-1.5 py-0.5 rounded-full bg-[#2563eb] text-white border border-[#4482ff]/40">كتاب</span>
                            </div>
                            <div className="absolute top-2 right-2 select-none z-10 font-black text-[8px]">
                              <span className={`px-1.5 py-0.5 rounded-full border text-white ${isFreeCopy ? 'bg-teal-600' : 'bg-rose-600'}`}>
                                {isFreeCopy ? 'مجاني' : isPurchased ? 'مملوك' : priceStr}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-[9px] font-bold">
                            <span className="text-slate-705 dark:text-sky-200">القسم: {book.category}</span>
                            <div className="flex items-center gap-0.5 select-none" title="تقييم الكتاب">
                              <span className="text-[9.5px] text-slate-550 dark:text-sky-305 font-mono">({curRating}.0)</span>
                              <div className="flex items-center">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <button
                                    key={star}
                                    onClick={() => handleAssignRating(book.id, 'book', star, book.title)}
                                    className="text-amber-500 hover:scale-125 transition-transform cursor-pointer border-none bg-transparent p-0"
                                  >
                                    <Star size={8} fill={curRating >= star ? '#f59e0b' : 'none'} className="text-[#f59e0b] stroke-[#f59e0b]" />
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>

                          <h4
                            onClick={() => setSelectedBook(book)}
                            className="text-[11px] font-black font-serif text-slate-900 dark:text-white hover:text-sky-600 dark:hover:text-[#00b4d8] cursor-pointer transition-colors leading-snug line-clamp-1"
                          >
                            🌸 {book.title}
                          </h4>
                        </div>

                        <div className="space-y-2 pt-1">
                          <div className="border-t border-slate-200/40 dark:border-sky-900/10 pt-2" />
                          <div className="flex justify-between items-center text-[10px]">
                            <button
                              onClick={() => handleToggleFavorite(book.id, 'book', book.title)}
                              className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all cursor-pointer ${
                                isFav
                                  ? 'bg-rose-500/15 text-rose-500 border-rose-500/30'
                                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-850/45 dark:hover:bg-slate-850 border-slate-200/50 dark:border-rose-900/20 text-slate-400 hover:text-rose-500'
                              }`}
                              title="مفضلة"
                            >
                              <Heart size={10} fill={isFav ? 'currentColor' : 'none'} className="text-rose-500" />
                            </button>

                            <div className="flex items-center gap-1">
                              {!isFreeCopy && !isPurchased && (
                                <button
                                  onClick={() => startPurchaseFlow(book)}
                                  className="px-2 py-1 bg-rose-600 hover:bg-rose-550 text-white font-bold rounded text-[8px] cursor-pointer"
                                >
                                  شراء
                                </button>
                              )}
                              <button
                                onClick={() => setSelectedBook(book)}
                                className="px-2.5 py-1 bg-[#00b4d8] hover:bg-[#0096c7] text-[#001D24] font-black rounded-lg text-[9px] cursor-pointer transition-all flex items-center gap-1 shadow-sm"
                              >
                                <span>مطالعة</span>
                                <span>←</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* SECOND BOX: RECENTLY ADDED (مربع مستقل للمستجدات والأطروحات المضافة حديثاً) */}
          <div className="bg-white/45 dark:bg-[#1E020A]/40 backdrop-blur-md p-6 rounded-[32px] border border-white/30 dark:border-rose-955/20 shadow-xl space-y-5 text-right">
            <div className="flex items-center justify-between border-b border-black/5 dark:border-white/10 pb-3">
              <h4 className="text-xs md:text-sm font-serif font-black text-[#5E122D] dark:text-rose-300 flex items-center gap-2">
                <span>⏱️</span>
                <span>المستودع والمصنفات المنشورة والمضافة حديثاً بالرواق</span>
              </h4>
              <span className="text-[10px] bg-rose-450/10 text-[#5E122D] dark:text-rose-200 px-2.5 py-0.5 rounded-full border border-rose-450/20 font-bold select-none">
                أحدث الإسهامات
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recently added Articles right subbox */}
              <div className="space-y-3.5">
                <div className="flex items-center gap-1.5 text-[11px] font-black text-emerald-700 dark:text-emerald-400 border-r-2 border-emerald-500 pr-2">
                  <span>✍️</span>
                  <span>مقالات الوعي والدراسات المنشورة حديثاً (٣ مقالات)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3 gap-4">
                  {latestArticles.map((art) => {
                    const key = `article_${art.id}`;
                    const isFav = favorites[key] || false;
                    const curRating = ratings[key] || art.rating || 5;

                    return (
                      <div
                        key={art.id}
                        className="rounded-tr-[30px] rounded-bl-[30px] rounded-tl-[12px] rounded-br-[12px] p-4 shadow-md border w-full flex flex-col justify-between text-right space-y-3 hover:scale-[1.01] hover:shadow-lg transition-all duration-300 relative bg-gradient-to-b from-[#f5fdf9] to-[#edfcf2]/95 border-emerald-250/30 dark:from-[#092214] dark:to-[#021008] dark:border-[#1F4C36]/40 text-slate-800 dark:text-sky-50"
                      >
                        <div className="space-y-2">
                          <div className="relative w-full h-[100px] rounded-tr-[24px] rounded-bl-[24px] rounded-tl-[8px] rounded-br-[8px] overflow-hidden shadow-inner bg-slate-950/10 border border-black/5">
                            {art.coverImage ? (
                              <img
                                src={art.coverImage}
                                alt={art.title}
                                className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-[#1E020B] to-[#3D0A1B] p-2 flex flex-col justify-between text-white">
                                <span className="text-[8px] bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/10 text-emerald-300 self-start">{art.category}</span>
                                <h5 className="font-serif font-black text-[10px] leading-snug line-clamp-2">{art.title}</h5>
                                <span className="text-[8px] text-rose-300/80">بقلم: {art.author}</span>
                              </div>
                            )}
                            <div className="absolute top-2 left-2 select-none z-10 font-black text-[8px]">
                              <span className="px-1.5 py-0.5 rounded-full bg-[#10b981] text-white border border-[#34d399]/40">مقالة</span>
                            </div>
                            <div className="absolute top-2 right-2 select-none z-10 font-black text-[8px]">
                              <span className="px-1.5 py-0.5 rounded-full bg-black/60 text-amber-300">👁️ {art.views}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-[9px] font-bold">
                            <span className="text-slate-705 dark:text-sky-200">القسم: {art.category}</span>
                            <div className="flex items-center gap-0.5 select-none" title="تقييم المقال">
                              <span className="text-[9.5px] text-slate-550 dark:text-sky-305 font-mono">({curRating}.0)</span>
                              <div className="flex items-center">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <button
                                    key={star}
                                    onClick={() => handleAssignRating(art.id, 'article', star, art.title)}
                                    className="text-amber-500 hover:scale-125 transition-transform cursor-pointer border-none bg-transparent p-0"
                                  >
                                    <Star size={8} fill={curRating >= star ? '#f59e0b' : 'none'} className="text-[#f59e0b] stroke-[#f59e0b]" />
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>

                          <h4
                            onClick={() => setSelectedArticle(art)}
                            className="text-[11px] font-black font-serif text-slate-900 dark:text-white hover:text-sky-600 dark:hover:text-[#00b4d8] cursor-pointer transition-colors leading-snug line-clamp-1"
                          >
                            🌸 {art.title}
                          </h4>
                        </div>

                        <div className="space-y-2 pt-1">
                          <div className="border-t border-slate-200/40 dark:border-sky-900/10 pt-2" />
                          <div className="flex justify-between items-center text-[10px]">
                            <button
                              onClick={() => handleToggleFavorite(art.id, 'article', art.title)}
                              className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all cursor-pointer ${
                                isFav
                                  ? 'bg-rose-500/15 text-rose-500 border-rose-500/30'
                                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-850/45 dark:hover:bg-slate-850 border-slate-200/50 dark:border-rose-900/20 text-slate-400 hover:text-rose-500'
                              }`}
                              title="مفضلة"
                            >
                              <Heart size={10} fill={isFav ? 'currentColor' : 'none'} className="text-rose-500" />
                            </button>
                            <button
                              onClick={() => setSelectedArticle(art)}
                              className="px-2.5 py-1 bg-[#00b4d8] hover:bg-[#0096c7] text-[#001D24] font-black rounded-lg text-[9px] cursor-pointer transition-all flex items-center gap-1 shadow-sm"
                            >
                              <span>تصفح المقال</span>
                              <span>←</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Recently added Books left subbox */}
              <div className="space-y-3.5">
                <div className="flex items-center gap-1.5 text-[11px] font-black text-[#5E122D] dark:text-rose-300 border-r-2 border-rose-450 pr-2">
                  <span>📚</span>
                  <span>الكتب والدواوين الرقمية المدخلة حديثاً (٣ كتب)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3 gap-4">
                  {latestBooks.map((book) => {
                    const key = `book_${book.id}`;
                    const isFav = favorites[key] || false;
                    const curRating = ratings[key] || book.rating || 5;
                    const isFreeCopy = book.isFree !== false;
                    const priceStr = book.price ? `${book.price} درهم` : '٤٥ درهم';
                    const isPurchased = purchasedBooks[book.id] || localStorage.getItem(`purchased_book_${book.id}`) === 'true';

                    return (
                      <div
                        key={book.id}
                        className="rounded-tr-[30px] rounded-bl-[30px] rounded-tl-[12px] rounded-br-[12px] p-4 shadow-md border w-full flex flex-col justify-between text-right space-y-3 hover:scale-[1.01] hover:shadow-lg transition-all duration-300 relative bg-gradient-to-b from-[#f5faff] to-[#edf7fe]/95 border-sky-250/30 dark:from-[#0b1c2b] dark:to-[#030d16] dark:border-[#0f4c75]/40 text-slate-800 dark:text-[#E2F1FF]"
                      >
                        <div className="space-y-2">
                          <div className="relative w-full h-[100px] rounded-tr-[24px] rounded-bl-[24px] rounded-tl-[8px] rounded-br-[8px] overflow-hidden shadow-inner bg-slate-950/10 border border-black/5">
                            {book.coverImage ? (
                              <img
                                src={book.coverImage}
                                alt={book.title}
                                className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className={`w-full h-full bg-gradient-to-br ${book.coverStyle?.bg || 'from-[#1e293b] to-[#0f172a]'} p-2 flex flex-col justify-between text-white relative`}>
                                <span className="text-[8px] bg-white/10 px-1.5 py-0.5 rounded text-white border border-white/10 self-start">{book.category}</span>
                                <h5 className="font-serif font-black text-[10px] leading-snug line-clamp-2">{book.title}</h5>
                                <span className="text-[8px] text-amber-255 font-bold self-end">{isFreeCopy ? 'مجاني' : 'فاخر'}</span>
                              </div>
                            )}
                            <div className="absolute top-2 left-2 select-none z-10 font-black text-[8px]">
                              <span className="px-1.5 py-0.5 rounded-full bg-[#2563eb] text-white border border-[#4482ff]/40">كتاب</span>
                            </div>
                            <div className="absolute top-2 right-2 select-none z-10 font-black text-[8px]">
                              <span className={`px-1.5 py-0.5 rounded-full border text-white ${isFreeCopy ? 'bg-teal-600' : 'bg-rose-600'}`}>
                                {isFreeCopy ? 'مجاني' : isPurchased ? 'مملوك' : priceStr}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-[9px] font-bold">
                            <span className="text-slate-755 dark:text-sky-200">القسم: {book.category}</span>
                            <div className="flex items-center gap-0.5 select-none" title="تقييم الكتاب">
                              <span className="text-[9.5px] text-slate-550 dark:text-sky-305 font-mono">({curRating}.0)</span>
                              <div className="flex items-center">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <button
                                    key={star}
                                    onClick={() => handleAssignRating(book.id, 'book', star, book.title)}
                                    className="text-amber-500 hover:scale-125 transition-transform cursor-pointer border-none bg-transparent p-0"
                                  >
                                    <Star size={8} fill={curRating >= star ? '#f59e0b' : 'none'} className="text-[#f59e0b] stroke-[#f59e0b]" />
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>

                          <h4
                            onClick={() => setSelectedBook(book)}
                            className="text-[11px] font-black font-serif text-slate-900 dark:text-white hover:text-sky-600 dark:hover:text-[#00b4d8] cursor-pointer transition-colors leading-snug line-clamp-1"
                          >
                            🌸 {book.title}
                          </h4>
                        </div>

                        <div className="space-y-2 pt-1">
                          <div className="border-t border-slate-200/40 dark:border-sky-900/10 pt-2" />
                          <div className="flex justify-between items-center text-[10px]">
                            <button
                              onClick={() => handleToggleFavorite(book.id, 'book', book.title)}
                              className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all cursor-pointer ${
                                isFav
                                  ? 'bg-rose-500/15 text-rose-500 border-rose-500/30'
                                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-850/45 dark:hover:bg-slate-850 border-slate-200/50 dark:border-rose-900/20 text-slate-400 hover:text-rose-500'
                              }`}
                              title="مفضلة"
                            >
                              <Heart size={10} fill={isFav ? 'currentColor' : 'none'} className="text-rose-500" />
                            </button>

                            <div className="flex items-center gap-1">
                              {!isFreeCopy && !isPurchased && (
                                <button
                                  onClick={() => startPurchaseFlow(book)}
                                  className="px-2 py-1 bg-rose-600 hover:bg-rose-550 text-white font-bold rounded text-[8px] cursor-pointer"
                                >
                                  شراء
                                </button>
                              )}
                              <button
                                onClick={() => setSelectedBook(book)}
                                className="px-2.5 py-1 bg-[#00b4d8] hover:bg-[#0096c7] text-[#001D24] font-black rounded-lg text-[9px] cursor-pointer transition-all flex items-center gap-1 shadow-sm"
                              >
                                <span>مطالعة</span>
                                <span>←</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Complete dynamic filtration & search engine of books, articles, tags and categories ("ثم العرض والفرز والبحث الموحد") */}
        <section id="explorer-portal-section" className="space-y-4">
          <UniversalExplorer
            books={translatedBooks}
            articles={translatedArticles}
            session={session}
            onSelectBook={setSelectedBook}
            onSelectArticle={setSelectedArticle}
            onAddBook={handleAddBook}
            onAddArticle={handleAddArticle}
            triggerToast={triggerToast}
          />
        </section>

      </main>

      {/* FOOTER */}
      <footer className="mt-20 py-10 bg-[#0A0003] dark:bg-black/90 text-rose-100/90 relative border-t border-rose-950/40 select-none">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-4">
          <p className="font-serif text-amber-200 text-xs font-black">مكتبة الدرعي الرقمية العريقة © عام ٢٠٢٦م / رجب ١٤٤٧هـ</p>
          <div className="flex flex-wrap justify-center items-center gap-3 text-[9px] text-slate-500">
            <span>التصفح كضيف متاح للجميع</span>
            <span>•</span>
            <span>أزرار تبديل المستخدم والملف الشخصي نشطة دائماً</span>
            <span>•</span>
            <span className="text-amber-400 font-bold">بوابة الفرز تدعم الكتب والمقالات مع السحب المتناثرة والوضع الياقوتي الفاخر</span>
          </div>
        </div>
      </footer>

      {/* REALTIME SYSTEM TOAST notifier */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 px-4 py-3 bg-slate-950/90 border border-rose-900/30 text-amber-300 font-bold font-sans rounded-xl text-xs shadow-2xl flex items-center gap-1.5"
          >
            <Sparkles size={13} className="text-amber-300 animate-spin" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL OVERLAY: PROFILE EDIT ("الملف الشخصي") - Now fully active for ALL visitors */}
      <AnimatePresence>
        {showProfile && (
          <div id="profile-modal-overlay" className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#21020C] border border-rose-900/30 p-6 rounded-3xl w-full max-w-md shadow-2xl text-right my-auto text-rose-100"
            >
              <div className="flex justify-between items-center pb-4 border-b border-rose-950/30 select-none">
                <h3 className="font-extrabold font-serif text-white text-sm flex items-center gap-1.5">
                  <User size={18} className="text-amber-400" />
                  <span>الملف الشخصي والرمز التفاعلي للأعضاء والضيوف</span>
                </h3>
                <button
                  onClick={() => setShowProfile(false)}
                  className="p-1 hover:bg-rose-950/30 rounded-lg text-slate-400 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-4 mt-4 text-xs font-sans">
                <div>
                  <label className="block text-slate-300 mb-1">الاسم الكامل المفضل</label>
                  <input
                    type="text"
                    required
                    maxLength={30}
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full p-2.5 bg-black/40 border border-rose-950/30 rounded-xl text-white focus:outline-none focus:border-amber-450"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">البريد الإلكتروني الموثق</label>
                  <input
                    type="email"
                    placeholder="guest@darailibrary.com"
                    value={profileEmail}
                    onChange={(e) => setProfileEmail(e.target.value)}
                    className="w-full p-2.5 bg-black/40 border border-rose-950/30 rounded-xl text-white focus:outline-none focus:border-amber-450"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">رمز الأفتار المصور المفضل (إيموجي كرموز)</label>
                  <input
                    type="text"
                    maxLength={2}
                    placeholder="📖 أو ✨ أو 👤"
                    value={profileSeed}
                    onChange={(e) => setProfileSeed(e.target.value)}
                    className="w-full p-2.5 bg-black/40 border border-rose-950/30 rounded-xl text-white focus:outline-none focus:border-amber-450"
                  />
                </div>

                <div className="bg-black/30 p-3.5 rounded-xl border border-rose-950/40 space-y-1 select-none text-[10px] text-rose-200">
                  <span className="text-slate-400 font-bold block mb-1">معلومات الحساب الموثق:</span>
                  <div className="flex justify-between">
                    <span>دورك الحالي:</span>
                    <span className="font-bold text-amber-300">
                      {session.role === 'admin' ? 'مشرف عام المكتبة' : session.role === 'guest' ? 'زائر المكتبة الرقمية' : 'قارئ ملهم معتمد'}
                    </span>
                  </div>
                  <div className="flex justify-between font-mono">
                    <span>الاسم الفريد:</span>
                    <span>@{session.username}</span>
                  </div>
                </div>

                {/* 🔔 إشعارات آخر إضافات الرواق */}
                <div className="border-t border-rose-950/30 pt-3.5 select-none space-y-2">
                  <div className="flex items-center gap-1.5 text-[11px] font-black text-amber-400">
                    <span>🔔</span>
                    <span>إشعارات الأثير (آخر المنشورات والمصنفات):</span>
                  </div>
                  <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                    {[
                      ...(books || []).slice(-2).map(b => ({ id: `bk-${b.id}`, title: b.title, type: 'book', label: 'كتاب رقمي 📖', color: 'bg-sky-500/10 text-sky-305 border border-sky-400/10' })),
                      ...(articles || []).slice(-2).map(a => ({ id: `ar-${a.id}`, title: a.title, type: 'article', label: 'دراسة ومقال ✍️', color: 'bg-emerald-500/10 text-emerald-305 border border-emerald-400/10' })),
                      ...(thoughts || []).slice(-2).map(t => ({ id: `th-${t.id}`, title: t.title || 'خاطرة جديدة', type: 'thought', label: 'خاطرة ورواق 💭', color: 'bg-amber-500/10 text-amber-305 border border-amber-400/10' }))
                    ].reverse().map((item) => (
                      <div key={item.id} className="p-2.5 bg-black/45 hover:bg-black/60 border border-rose-950/15 rounded-xl flex items-center justify-between gap-2 transition-all text-[10px]">
                        <div className="flex flex-col text-right truncate">
                          <span className="font-extrabold text-slate-100 line-clamp-1">{item.title}</span>
                          <span className="text-[8px] text-slate-400 mt-0.5">جديد في الرفوف الفكرية</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[8px] font-bold shrink-0 ${item.color}`}>
                          {item.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl cursor-pointer"
                  >
                    تثبيت وتحديث علاماتي
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowProfile(false)}
                    className="px-4 py-2 bg-rose-950/40 hover:bg-rose-950/60 rounded-xl text-slate-300 cursor-pointer"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* OVERLAY MODAL ROUTING */}
      <AnimatePresence>
        {selectedBook && (
          <BookReader
            book={translateBook(selectedBook, currentLang)}
            session={session}
            allReviews={reviews}
            onAddReview={handleAddReview}
            onClose={() => setSelectedBook(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedArticle && (
          <ArticleView
            article={translateArticle(selectedArticle, currentLang)}
            session={session}
            allComments={reviews}
            onAddComment={handleAddReview}
            onLikeArticle={handleLikeArticle}
            onClose={() => setSelectedArticle(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAdminPanel && (
          <AdminPanel
            books={books}
            articles={articles}
            thoughts={thoughts}
            onAddBook={handleAddBook}
            onAddArticle={handleAddArticle}
            onAddThought={handleAddThought}
            onUpdateBook={handleUpdateBook}
            onUpdateArticle={handleUpdateArticle}
            onUpdateThought={handleUpdateThought}
            onDeleteBook={handleDeleteBook}
            onDeleteArticle={handleDeleteArticle}
            onDeleteThought={handleDeleteThought}
            onClose={() => setShowAdminPanel(false)}
          />
        )}
      </AnimatePresence>

      {/* Checkout Billings Popup Modal for Highlights purchasing */}
      <AnimatePresence>
        {checkoutBook && (
          <div id="checkout-sheet-overlay" className="fixed inset-0 z-55 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#2A0413] border border-rose-900/30 p-6 rounded-3xl w-full max-w-md shadow-2xl text-right my-auto text-rose-100"
            >
              <div className="flex justify-between items-center pb-4 border-b border-rose-955/40 select-none">
                <h3 className="font-extrabold font-serif text-white text-sm flex items-center gap-1.5">
                  <CreditCard className="text-amber-400" size={18} />
                  <span>بوابة السداد والشراء الآمن للكتب الرقمية</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setCheckoutBook(null)}
                  className="p-1 hover:bg-rose-955/30 rounded-lg text-slate-400 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={executeBuyBook} className="space-y-4 mt-4 text-xs font-sans">
                <div className="bg-rose-955/30 p-3.5 rounded-2xl border border-rose-900/30 text-[10px] space-y-1 select-none">
                  <span className="text-amber-400 font-extrabold block">الكتاب المراد شراؤه:</span>
                  <div className="flex justify-between font-serif text-white font-bold">
                    <span>{checkoutBook.title}</span>
                    <span>{checkoutBook.price} درهم</span>
                  </div>
                  <p className="text-slate-400 mt-0.5">ترخيص قراءة أبدي مرتبط ببريدك الإلكتروني.</p>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">اسم صاحب البطاقة الافتراضية</label>
                  <input
                    type="text"
                    required
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value)}
                    className="w-full p-2.5 bg-black/40 border border-rose-950/30 rounded-xl text-white focus:outline-none focus:border-amber-400 font-sans"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">رقم بطاقة الدفع (محمي ببروتوكول SSL آمن)</label>
                  <input
                    type="text"
                    required
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full p-2.5 bg-black/40 border border-[#4a0b22] rounded-xl text-white focus:outline-none focus:border-amber-400 font-mono tracking-widest text-center"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 mb-1">تاريخ الانتهاء</label>
                    <input
                      type="text"
                      required
                      placeholder="12/28"
                      value={cardExpir}
                      onChange={(e) => setCardExpir(e.target.value)}
                      className="w-full p-2.5 bg-black/40 border border-[#4a0b22] rounded-xl text-white focus:outline-none focus:border-amber-400 font-mono text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1">الرمز السري (CVV)</label>
                    <input
                      type="text"
                      required
                      placeholder="321"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      className="w-full p-2.5 bg-black/40 border border-[#4a0b22] rounded-xl text-white focus:outline-none focus:border-amber-400 font-mono text-center"
                    />
                  </div>
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-gradient-to-l from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black rounded-xl cursor-pointer"
                  >
                    تأكيد الدفع الآمن الآن ({checkoutBook.price} درهم)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCheckoutBook(null)}
                    className="px-4 py-2 bg-rose-950/40 hover:bg-rose-950/60 rounded-xl text-slate-300 cursor-pointer"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* All Thoughts Modal ("نبض الكلمة") */}
      <AnimatePresence>
        {showAllThoughtsModal && (
          <AllThoughtsModal
            thoughts={thoughts}
            currentLang={currentLang}
            onClose={() => setShowAllThoughtsModal(false)}
            onLikeThought={handleLikeThought}
            onCopyThought={handleCopyThought}
            copiedId={copiedId}
            triggerToast={triggerToast}
            isDarkMode={isDarkMode}
            onSetDarkMode={setIsDarkMode}
          />
        )}
      </AnimatePresence>

    </div>
  );
}
