import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Book, Article, Thought, Review, RegisteredUser, RichContentElement } from '../types';
import { 
  X, Plus, Trash2, Library, BookOpenText, FileText, 
  Sparkles, PlusCircle, CheckCircle, HelpCircle, Eye,
  Users, BarChart3, Edit, RotateCcw, ImageIcon, AlignRight, 
  AlignCenter, AlignLeft, ListOrdered, ArrowUpDown, Star,
  Database, Server, Wifi, WifiOff, RefreshCw, Music
} from 'lucide-react';
import MarkdownEditor from './MarkdownEditor';

const convertArticleToHtml = (art: Article): string => {
  if (art.richContent && art.richContent.length > 0) {
    return art.richContent.map(el => {
      if (el.type === 'h1') {
        return `<h1 style="font-size: 1.8em; font-weight: 850; margin: 15px 0 10px 0; color: #1e3a8a;">${el.text || ''}</h1>`;
      } else if (el.type === 'h2') {
        return `<h2 style="font-size: 1.5em; font-weight: 800; margin: 12px 0 8px 0; color: #0c4a6e;">${el.text || ''}</h2>`;
      } else if (el.type === 'ol') {
        return `<ol style="list-style-type: decimal; padding-right: 24px; margin: 10px 0;"><li>${el.text || ''}</li></ol>`;
      } else if (el.type === 'img') {
        const scaleDesc = el.scale === 'small' ? 'max-width: 40%;' : el.scale === 'large' ? 'max-width: 100%;' : 'max-width: 70%;';
        return `<div style="text-align: center; margin: 15px 0;"><img src="${el.src || ''}" style="${scaleDesc}; height: auto; border-radius: 12px; display: block; margin: 15px auto;" /></div>`;
      } else if (el.type === 'link') {
        return `<p style="text-align: center;"><a href="${el.src || ''}" target="_blank" style="color: #fbbf24; font-weight: bold; text-decoration: underline;">${el.text || ''}</a></p>`;
      } else {
        const alignDesc = el.align ? `text-align: ${el.align};` : '';
        const styleText = alignDesc ? `style="${alignDesc}"` : '';
        return `<p ${styleText}>${el.text || ''}</p>`;
      }
    }).join('');
  }
  return art.content ? art.content.join('\n\n') : '';
};

interface AdminPanelProps {
  books: Book[];
  articles: Article[];
  thoughts: Thought[];
  onAddBook: (book: Book) => void;
  onAddArticle: (article: Article) => void;
  onAddThought: (thought: Thought) => void;
  onUpdateBook?: (book: Book) => void;
  onUpdateArticle?: (art: Article) => void;
  onUpdateThought?: (thought: Thought) => void;
  onDeleteBook: (id: string) => void;
  onDeleteArticle: (id: string) => void;
  onDeleteThought: (id: string) => void;
  onClose: () => void;
}

type AdminTab = 'analytics' | 'book' | 'article' | 'thought' | 'users' | 'manager';

import { smartFetch, getAutoDetectedPhpUrl, formatPHPUrl } from '../utils/api';

export default function AdminPanel({
  books,
  articles,
  thoughts,
  onAddBook,
  onAddArticle,
  onAddThought,
  onUpdateBook,
  onUpdateArticle,
  onUpdateThought,
  onDeleteBook,
  onDeleteArticle,
  onDeleteThought,
  onClose
}: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>('analytics');
  const [notif, setNotif] = useState('');
  const [soundPreset, setSoundPreset] = useState(() => localStorage.getItem('intro_ambient_sound') || 'combined');

  const handleSaveSoundPreset = (preset: string) => {
    localStorage.setItem('intro_ambient_sound', preset);
    setSoundPreset(preset);
    setNotif('🎵 تم تعديل وحفظ إعدادات الصوت الترحيبي في المقدمة بنجاح!');
    setTimeout(() => setNotif(''), 4000);
  };

  // Dynamically computed categories list from the state to allow suggestions and new types
  const uniqueBookCategories = Array.from(new Set([
    'عقيدة وتوحيد',
    'فلسفة وتأمل',
    'أدب عربي وشعري',
    'تطوير الذات والروح',
    'تاريخ وحضارة',
    'علوم لغوية وثقافة',
    ...(books || []).map(b => b.category).filter(Boolean)
  ]));

  const uniqueArticleCategories = Array.from(new Set([
    'وعي فكري',
    'أدب وبيئة',
    'أدب ونقد',
    'تطوير الذات والروح',
    'فلسفة وتأمل',
    'تاريخ وأدب',
    'عقيدة وتوحيد',
    'دراسات فكرية',
    'تحليل فلسفي',
    'وعي نفسي واجتماعي',
    ...(articles || []).map(a => a.category).filter(Boolean)
  ]));

  const uniqueThoughtCategories = Array.from(new Set([
    'تأملات',
    'حكمة',
    'إلهام',
    'أدب',
    'فلسفة',
    ...(thoughts || []).map(t => t.category).filter(Boolean)
  ]));



  // Welcome Sound Upload States
  const [welcomeAudioFilename, setWelcomeAudioFilename] = useState<string | null>(null);
  const [isUploadingAudio, setIsUploadingAudio] = useState(false);
  const [audioUploadError, setAudioUploadError] = useState<string | null>(null);

  // Load welcome audio filename on mount
  useEffect(() => {
    smartFetch('/api/welcome-audio')
      .then(r => r.json())
      .then(data => {
        if (data && data.filename) {
          setWelcomeAudioFilename(data.filename);
        }
      })
      .catch(err => console.error('Error fetching welcome audio state:', err));
  }, []);

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('audio/')) {
      setAudioUploadError('خطأ: يرجى رفع ملف صووتي صالح (mp3, wav, ogg, m4a)');
      return;
    }

    if (file.size > 25 * 1024 * 1024) { // 25MB check
      setAudioUploadError('خطأ: حجم الملف الصوتي يجب أن لا يتجاوز 25 ميغابايت');
      return;
    }

    setIsUploadingAudio(true);
    setAudioUploadError(null);

    const reader = new FileReader();
    reader.onload = async () => {
      const base64Audio = reader.result as string;
      try {
        const response = await smartFetch('/api/welcome-audio', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            audio: base64Audio,
            filename: file.name
          })
        });
        
        let resData: any;
        try {
          resData = await response.json();
        } catch (jErr) {
          throw new Error('لم يرجع السيرفر استجابة JSON صالحة. يرجى التحقق من وجود ملف api.php وزرعه في مجلد htdocs.');
        }

        if (resData.success) {
          setWelcomeAudioFilename(file.name);
          setNotif('🎵 تم رفع وحفظ ملف الصوت الترحيبي الخاص بك بنجاح!');
          setTimeout(() => setNotif(''), 5000);
        } else {
          setAudioUploadError(resData.error || 'فشل في حفظ الملف الصوتي');
        }
      } catch (err: any) {
        setAudioUploadError('تعذر الاتصال بالسيرفر لرفع الملف: ' + (err?.message || err));
      } finally {
        setIsUploadingAudio(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAudioDelete = async () => {
    try {
      const response = await smartFetch('/api/welcome-audio', {
        method: 'DELETE'
      });
      
      let resData: any;
      try {
        resData = await response.json();
      } catch (jErr) {
        throw new Error('لم يرجع السيرفر استجابة JSON صالحة عند الحذف.');
      }

      if (resData.success) {
        setWelcomeAudioFilename(null);
        setNotif('🗑️ تم حذف ملف الصوت الترحيبي بنجاح، وسيعود النظام للأصوات الطبيعية الافتراضية!');
        setTimeout(() => setNotif(''), 5000);
      }
    } catch (err: any) {
      setAudioUploadError('تعذر حذف الملف: ' + (err?.message || err));
    }
  };

  // Database status states
  const [dbStatus, setDbStatus] = useState<{
    success?: boolean;
    status?: string;
    database?: string;
    initialized?: boolean;
    error?: string;
    loading: boolean;
  }>({ loading: true });

  const [syncLoading, setSyncLoading] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);
  const [customPhpUrl, setCustomPhpUrl] = useState(() => localStorage.getItem('custom_php_api_url') || '');

  const handleSaveCustomPhpUrl = async (url: string) => {
    const trimmed = url.trim();
    if (trimmed) {
      localStorage.setItem('custom_php_api_url', trimmed);
    } else {
      localStorage.removeItem('custom_php_api_url');
    }
    setCustomPhpUrl(trimmed);
    // Trigger direct state check immediately
    setTimeout(() => {
      fetchDbStatus();
    }, 50);
  };

  const fetchDbStatus = async () => {
    try {
      setDbStatus(prev => ({ ...prev, loading: true }));
      const res = await smartFetch('/api/status');
      let data: any;
      try {
        data = await res.json();
      } catch (parseErr) {
        if (!res.ok) {
          throw new Error(`خطأ في استجابة الخادم الداخلي: ${res.status}`);
        }
        throw new Error('لم يرجع خادم الموقع استجابة JSON صالحة.');
      }

      if (!res.ok) {
        throw new Error(data?.error || `خطأ في استجابة الخادم: ${res.status}`);
      }

      setDbStatus({
        success: data.success !== false,
        status: data.status,
        database: data.database,
        initialized: data.initialized,
        error: data.error,
        loading: false
      });
    } catch (e: any) {
      setDbStatus({
        success: false,
        loading: false,
        error: e.message || 'فشل الاتصال بخدمة التحقق'
      });
    }
  };

  useEffect(() => {
    fetchDbStatus();
  }, []);

  const handleForceSync = async () => {
    try {
      setSyncLoading(true);
      setSyncResult(null);

      // Get current local reviews & users states to push
      const localReviews = JSON.parse(localStorage.getItem('library_reviews') || '[]');
      const localUsers = JSON.parse(localStorage.getItem('library_users') || '{}');

      const body = {
        books,
        articles,
        thoughts,
        reviews: localReviews,
        users: localUsers
      };

      const res = await smartFetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      let responseData: any;
      try {
        responseData = await res.json();
      } catch (parseErr) {
        throw new Error(`استجابة غير صالحة من السيرفر (كود ${res.status}). يرجى التأكد من تشغيل Apache و MySQL في XAMPP، ووجود ملف api.php في مجلد htdocs الخاص بك.`);
      }

      if (!res.ok || responseData.success === false) {
        throw new Error(responseData.error || 'فشلت عملية المزامنة');
      }

      setSyncResult(`تمت مزامنة وقذف البيانات بالكامل بنجاح! تم رفع وزرع: ${books.length} كتاب، ${articles.length} مقال، ${thoughts.length} خاطرة وحسابات الأعضاء بنجاح في قاعدة بيانات MySQL الخارجية.`);
      fetchDbStatus();
    } catch (e: any) {
      setSyncResult(`خطأ أثناء المزامنة: ${e.message}`);
    } finally {
      setSyncLoading(false);
    }
  };

  // 1. New Book State
  const [bookTitle, setBookTitle] = useState('');
  const [bookAuthor, setBookAuthor] = useState('');
  const [bookEditor, setBookEditor] = useState(''); // New: المحرر
  const [bookCategory, setBookCategory] = useState('فلسفة وتأمل');
  const [bookDesc, setBookDesc] = useState('');
  const [bookPages, setBookPages] = useState<string[]>(['']);
  const [activeBookPageIndex, setActiveBookPageIndex] = useState<number>(0);
  const [activeEditBookPageIndex, setActiveEditBookPageIndex] = useState<number>(0);
  const [bookCoverTheme, setBookCoverTheme] = useState('sky');
  const [bookCoverImage, setBookCoverImage] = useState(''); // New: غلاف صورة رابط
  const [bookFreeContent, setBookFreeContent] = useState(''); // New: كتابة قابلة للنسخ
  const [bookDriveUrl, setBookDriveUrl] = useState(''); // New: رابط قوقل درايف

  // 2. Rich Article State (Visual sequence builder & Integrated HTML Markdown Editor)
  const [artTitle, setArtTitle] = useState('');
  const [artAuthor, setArtAuthor] = useState('');
  const [artCategory, setArtCategory] = useState('دراسات فكرية');
  const [artCoverImage, setArtCoverImage] = useState('');
  const [artHtmlContent, setArtHtmlContent] = useState('');
  const [richElements, setRichElements] = useState<RichContentElement[]>([]);
  
  // Temporary rich element builder fields
  const [tmpType, setTmpType] = useState<'h1' | 'h2' | 'p' | 'ol' | 'img' | 'link'>('p');
  const [tmpText, setTmpText] = useState('');
  const [tmpAlign, setTmpAlign] = useState<'right' | 'center' | 'left'>('right');
  const [tmpSrc, setTmpSrc] = useState('');
  const [tmpScale, setTmpScale] = useState<'small' | 'medium' | 'large'>('medium');

  // 3. New Thought State
  const [thoughtTitle, setThoughtTitle] = useState(''); // New: اسم الخاطرة
  const [thoughtMsg, setThoughtMsg] = useState(''); // description/content
  const [thoughtAuthor, setThoughtAuthor] = useState('');
  const [thoughtCategory, setThoughtCategory] = useState('حكمة');

  // 4. User management state
  const [registeredUsers, setRegisteredUsers] = useState<RegisteredUser[]>([]);
  const [editingUser, setEditingUser] = useState<RegisteredUser | null>(null);
  const [newPasswordVal, setNewPasswordVal] = useState('');

  // Content editing states
  const [editingBookState, setEditingBookState] = useState<Book | null>(null);
  const [editingArticleState, setEditingArticleState] = useState<Article | null>(null);
  const [editingThoughtState, setEditingThoughtState] = useState<Thought | null>(null);

  // Temporary state variables for the Visual builder during EDIT mode
  const [editTmpType, setEditTmpType] = useState<'h1' | 'h2' | 'p' | 'ol' | 'img' | 'link'>('p');
  const [editTmpText, setEditTmpText] = useState('');
  const [editTmpAlign, setEditTmpAlign] = useState<'right' | 'center' | 'left'>('right');
  const [editTmpSrc, setEditTmpSrc] = useState('');
  const [editTmpScale, setEditTmpScale] = useState<'small' | 'medium' | 'large'>('medium');

  // 4b. Member Interaction Files Database States
  const [localComments, setLocalComments] = useState<any[]>([]);
  const [localFavorites, setLocalFavorites] = useState<any[]>([]);
  const [localRatings, setLocalRatings] = useState<any[]>([]);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentText, setEditingCommentText] = useState('');

  // 5. Sorting States
  const [bookSortField, setBookSortField] = useState<keyof Book>('title');
  const [bookSortAsc, setBookSortAsc] = useState(true);

  const [artSortField, setArtSortField] = useState<keyof Article>('title');
  const [artSortAsc, setArtSortAsc] = useState(true);

  const [thoughtSortField, setThoughtSortField] = useState<keyof Thought>('author');
  const [thoughtSortAsc, setThoughtSortAsc] = useState(true);

  const [userSortField, setUserSortField] = useState<keyof RegisteredUser>('name');
  const [userSortAsc, setUserSortAsc] = useState(true);

  useEffect(() => {
    loadUsers();
    loadInteractiveLogs();
  }, [activeTab]);

  const loadInteractiveLogs = () => {
    try {
      const coms = localStorage.getItem('library_reviews') || '[]';
      const favs = localStorage.getItem('library_favorites') || '[]';
      const rats = localStorage.getItem('library_ratings') || '[]';
      
      let parsedComs = JSON.parse(coms);
      let parsedFavs = JSON.parse(favs);
      let parsedRats = JSON.parse(rats);

      if (!Array.isArray(parsedComs)) parsedComs = [];
      if (!Array.isArray(parsedFavs)) parsedFavs = [];
      if (!Array.isArray(parsedRats)) parsedRats = [];

      setLocalComments(parsedComs);
      setLocalFavorites(parsedFavs);
      setLocalRatings(parsedRats);
    } catch (e) {
      console.error('Error loading interactive logged databases: ', e);
      setLocalComments([]);
      setLocalFavorites([]);
      setLocalRatings([]);
    }
  };

  const handleDeleteComment = (id: string) => {
    const coms = localComments.filter((c: any) => c.id !== id);
    localStorage.setItem('library_reviews', JSON.stringify(coms));
    setLocalComments(coms);
    showNotification('🗑️ تم حذف التعليق من ملف التعليقات العام');
  };

  const startEditComment = (id: string, currentText: string) => {
    setEditingCommentId(id);
    setEditingCommentText(currentText);
  };

  const saveEditedComment = (id: string) => {
    const updated = localComments.map((com: any) => {
      if (com.id === id) {
        return { ...com, content: editingCommentText };
      }
      return com;
    });
    localStorage.setItem('library_reviews', JSON.stringify(updated));
    setLocalComments(updated);
    setEditingCommentId(null);
    showNotification('✏️ تم تعديل التعليق وتوثيقه بالملف');
  };

  const handleDeleteFavorite = (id: string) => {
    const favs = localFavorites.filter((f: any) => f.id !== id);
    localStorage.setItem('library_favorites', JSON.stringify(favs));
    setLocalFavorites(favs);
    showNotification('🗑️ تم شطب المادة من مفضلات المستندات');
  };

  const handleDeleteRating = (id: string) => {
    const rats = localRatings.filter((r: any) => r.id !== id);
    localStorage.setItem('library_ratings', JSON.stringify(rats));
    setLocalRatings(rats);
    showNotification('🗑️ تم حذف التقييم المختار كلياً');
  };

  const loadUsers = () => {
    const list = localStorage.getItem('library_users');
    if (list) {
      try {
        const parsed = JSON.parse(list);
        if (Array.isArray(parsed)) {
          setRegisteredUsers(parsed);
        } else if (typeof parsed === 'object' && parsed !== null) {
          const usersArray = Object.values(parsed) as RegisteredUser[];
          setRegisteredUsers(usersArray);
        } else {
          setRegisteredUsers([]);
        }
      } catch (err) {
        console.error('Error parsing library_users', err);
        setRegisteredUsers([]);
      }
    } else {
      setRegisteredUsers([]);
    }
  };

  const showNotification = (msg: string) => {
    setNotif(msg);
    setTimeout(() => setNotif(''), 3000);
  };

  // Create Book handler
  const handleCreateBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookTitle.trim() || !bookAuthor.trim() || !bookDesc.trim()) {
      showNotification('⚠️ يرجى تعبئة عنوان الكتاب والمؤلف والوصف باهتمام');
      return;
    }

    const finalPages = bookPages
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    if (finalPages.length === 0) {
      finalPages.push(bookDesc); // fallback page
    }

    let bgStyle = 'from-blue-600 via-indigo-700 to-indigo-950';
    if (bookCoverTheme === 'nature') {
      bgStyle = 'from-emerald-700 via-teal-850 to-indigo-950';
    } else if (bookCoverTheme === 'classic') {
      bgStyle = 'from-stone-850 via-slate-900 to-amber-950';
    }

    // calculate total characters or words across all finalPages to determine approximate read time
    const totalWords = finalPages.join(' ').split(/\s+/).length || 200;

    const newBook: Book = {
      id: `b-${Date.now()}`,
      title: bookTitle.trim(),
      author: bookAuthor.trim(),
      editor: bookEditor.trim() || undefined,
      category: bookCategory,
      description: bookDesc.trim(),
      content: finalPages,
      freeCopyContent: bookFreeContent.trim() || undefined,
      drivePdfUrl: bookDriveUrl.trim() || undefined,
      coverImage: bookCoverImage.trim() || undefined,
      publishDate: 'رجب ١٤٤٧هـ',
      readTime: `${Math.max(4, Math.round(totalWords / 150))} دقائق`,
      coverStyle: {
        bg: bgStyle,
        text: 'text-white',
        accent: 'border-amber-400 bg-amber-500/20',
        pattern: 'sky'
      }
    };

    onAddBook(newBook);
    showNotification('✅ تم حفظ الكتاب الرقمي والمرفق بنجاح!');
    
    // Clear
    setBookTitle('');
    setBookAuthor('');
    setBookEditor('');
    setBookDesc('');
    setBookPages(['']);
    setActiveBookPageIndex(0);
    setBookFreeContent('');
    setBookDriveUrl('');
    setBookCoverImage('');
  };

  // Add a sequenced element to Article builder
  const handleAddRichElement = () => {
    if (tmpType !== 'img' && tmpType !== 'link' && !tmpText.trim()) return;
    if (tmpType === 'img' && !tmpSrc.trim()) return;
    if (tmpType === 'link' && (!tmpText.trim() || !tmpSrc.trim())) {
      showNotification('⚠️ يرجى تعبة نص الرابط والـ URL معاً لإدراج الرابط!');
      return;
    }

    const newEl: RichContentElement = {
      id: `el-${Date.now()}-${Math.random()}`,
      type: tmpType,
      text: tmpText.trim() || undefined,
      align: tmpType === 'p' ? tmpAlign : undefined,
      src: (tmpType === 'img' || tmpType === 'link') ? tmpSrc.trim() : undefined,
      scale: tmpType === 'img' ? tmpScale : undefined
    };

    setRichElements([...richElements, newEl]);
    setTmpText('');
    setTmpSrc('');
    showNotification('✨ تم ربط العنصر المنسق بنجاح!');
  };

  const handleRemoveRichElement = (id: string) => {
    setRichElements(richElements.filter(el => el.id !== id));
  };

  const handleAddEditRichElement = () => {
    if (!editingArticleState) return;
    if (editTmpType !== 'img' && editTmpType !== 'link' && !editTmpText.trim()) return;
    if (editTmpType === 'img' && !editTmpSrc.trim()) return;
    if (editTmpType === 'link' && (!editTmpText.trim() || !editTmpSrc.trim())) {
      showNotification('⚠️ يرجى تعبة نص الرابط والـ URL معاً للدمج!');
      return;
    }

    const newEl: RichContentElement = {
      id: `el-${Date.now()}-${Math.random()}`,
      type: editTmpType,
      text: editTmpType !== 'img' ? editTmpText.trim() : undefined,
      align: editTmpType === 'p' ? editTmpAlign : undefined,
      src: (editTmpType === 'img' || editTmpType === 'link') ? editTmpSrc.trim() : undefined,
      scale: editTmpType === 'img' ? editTmpScale : undefined
    };

    const currentRich = editingArticleState.richContent || [];
    const updatedRich = [...currentRich, newEl];

    // Rebuild plain content array parallelly
    const updatedContent = updatedRich
      .map(el => (el.type === 'img' ? `[صورة: ${el.src}]` : el.type === 'link' ? `[🔗 رابط: ${el.text} (${el.src})]` : el.text || ''))
      .filter(t => t.length > 0);

    setEditingArticleState({
      ...editingArticleState,
      richContent: updatedRich,
      content: updatedContent
    });

    setEditTmpText('');
    setEditTmpSrc('');
    showNotification('✨ تم دمج العنصر المنسق الجديد في التعديل!');
  };

  const handleRemoveEditRichElement = (id: string) => {
    if (!editingArticleState) return;
    const currentRich = editingArticleState.richContent || [];
    const updatedRich = currentRich.filter(el => el.id !== id);
    const updatedContent = updatedRich
      .map(el => (el.type === 'img' ? `[صورة: ${el.src}]` : el.type === 'link' ? `[🔗 رابط: ${el.text} (${el.src})]` : el.text || ''))
      .filter(t => t.length > 0);

    setEditingArticleState({
      ...editingArticleState,
      richContent: updatedRich,
      content: updatedContent
    });
  };

  // Create Article handler
  const handleCreateArticle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!artTitle.trim() || !artAuthor.trim()) {
      showNotification('⚠️ يرجى تعبة العنوان واسم الكاتب المبدع');
      return;
    }

    const finalContent = artHtmlContent.trim() ? [artHtmlContent] : ['لم يتم كتابة فقرات نصية بعد.'];

    const newArt: Article = {
      id: `a-${Date.now()}`,
      title: artTitle.trim(),
      author: artAuthor.trim(),
      category: artCategory,
      coverImage: artCoverImage.trim() || undefined,
      content: finalContent,
      readTime: `${Math.max(3, Math.round((artHtmlContent.length || 100) / 150))} دقائق`,
      date: new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' }),
      imageStyle: {
        from: 'from-slate-800',
        to: 'to-blue-900',
        pattern: 'stars'
      },
      views: 12,
      likes: 1
    };

    onAddArticle(newArt);
    showNotification('✅ تم نشر المقالة المنسقة بشكل رائع!');
    
    // Clear
    setArtTitle('');
    setArtAuthor('');
    setArtCoverImage('');
    setArtHtmlContent('');
    setRichElements([]);
  };

  // Create Thought handler
  const handleCreateThought = (e: React.FormEvent) => {
    e.preventDefault();
    if (!thoughtMsg.trim() || !thoughtAuthor.trim()) {
      showNotification('⚠️ يرجى كتابة وصف الخاطرة واسم الكاتب');
      return;
    }

    const newThought: Thought = {
      id: `t-${Date.now()}`,
      title: thoughtTitle.trim() || undefined,
      content: thoughtMsg.trim(),
      author: thoughtAuthor.trim(),
      category: thoughtCategory,
      date: 'الآن',
      likes: 0
    };

    onAddThought(newThought);
    showNotification('✅ تم تدشين الخاطرة بنجاح!');
    
    // Clear
    setThoughtTitle('');
    setThoughtMsg('');
    setThoughtAuthor('');
  };

  // User Actions
  const handleSaveUserEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    let updatedUsers = registeredUsers.map(u => {
      if (u.username === editingUser.username) {
        const uitem = { ...u, name: editingUser.name, role: editingUser.role };
        if (newPasswordVal.trim()) {
          uitem.password = newPasswordVal.trim();
        }
        return uitem;
      }
      return u;
    });

    // Save as dictionary/object back to localStorage to match login & PHP sync expectations
    const usersObj: Record<string, RegisteredUser> = {};
    updatedUsers.forEach(u => {
      if (u.username) {
        usersObj[u.username.toLowerCase().trim()] = u;
      }
    });

    localStorage.setItem('library_users', JSON.stringify(usersObj));
    setRegisteredUsers(updatedUsers);
    setEditingUser(null);
    setNewPasswordVal('');
    showNotification('✅ تم تحديث بيانات العضو بنجاح كلياً!');
  };

  const handleDeleteUser = (username: string) => {
    if (confirm('هل أنت متأكد من حذف هذا العضو القارئ نهائياً؟')) {
      let updated = registeredUsers.filter(u => u.username !== username);

      // Save as dictionary/object back to localStorage
      const usersObj: Record<string, RegisteredUser> = {};
      updated.forEach(u => {
        if (u.username) {
          usersObj[u.username.toLowerCase().trim()] = u;
        }
      });

      localStorage.setItem('library_users', JSON.stringify(usersObj));
      setRegisteredUsers(updated);
      showNotification('🔥 تم شطب العضو نهائياً من سجلات الموقع');
    }
  };

  // Sorters
  const sortedBooks = [...books].sort((a, b) => {
    let valA = a[bookSortField] || '';
    let valB = b[bookSortField] || '';
    if (typeof valA === 'string') {
      return bookSortAsc ? valA.localeCompare(valB as string) : (valB as string).localeCompare(valA);
    }
    return bookSortAsc ? (valA as any) - (valB as any) : (valB as any) - (valA as any);
  });

  const sortedArticles = [...articles].sort((a, b) => {
    let valA = a[artSortField] || '';
    let valB = b[artSortField] || '';
    if (typeof valA === 'string') {
      return artSortAsc ? valA.localeCompare(valB as string) : (valB as string).localeCompare(valA);
    }
    return artSortAsc ? (valA as any) - (valB as any) : (valB as any) - (valA as any);
  });

  const sortedThoughts = [...thoughts].sort((a, b) => {
    let valA = a[thoughtSortField] || '';
    let valB = b[thoughtSortField] || '';
    if (typeof valA === 'string') {
      return thoughtSortAsc ? valA.localeCompare(valB as string) : (valB as string).localeCompare(valA);
    }
    return thoughtSortAsc ? (valA as any) - (valB as any) : (valB as any) - (valA as any);
  });

  const sortedUsers = [...registeredUsers].sort((a, b) => {
    let valA = a[userSortField] || '';
    let valB = b[userSortField] || '';
    if (typeof valA === 'string') {
      return userSortAsc ? valA.localeCompare(valB as string) : (valB as string).localeCompare(valA);
    }
    return userSortAsc ? (valA as any) - (valB as any) : (valB as any) - (valA as any);
  });

  return (
    <div id="admin-panel-overlay" className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex justify-center p-4 md:p-6 text-right select-text text-slate-100" dir="rtl">
      <motion.div
        initial={{ scale: 0.97, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.97, opacity: 0 }}
        className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-5xl shadow-2xl flex flex-col my-auto"
      >
        {/* Panel header bar */}
        <div className="p-6 bg-slate-950 border-b border-slate-850 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-600/20 text-blue-400 border border-blue-500/20 rounded-2xl">
              <Library size={24} />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-black font-serif text-white flex items-center gap-1.5">
                <span>رواق الإشراف والتحكم المتقدم</span>
                <span className="text-[9px] bg-red-400/10 text-red-400 px-2 py-0.5 rounded-full border border-red-500/15">التحكم الكامل</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">تعديل ونشر المحتويات، فرز المصنفات، وإدارة حسابات الأعضاء والقراء بصلاحيات مطلقة وبأمان كامل.</p>
            </div>
          </div>

          <button
            id="close-admin-panel-btn"
            onClick={onClose}
            className="px-4 py-2 bg-slate-850 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border border-slate-800"
          >
            <X size={15} />
            <span>رؤية الموقع العام</span>
          </button>
        </div>

        {/* Categories Tab selector bar */}
        <div className="px-6 pt-4 flex flex-wrap gap-1 border-b border-slate-800 bg-slate-950/40 select-none">
          {[
            { id: 'analytics', label: 'المؤشرات والرسوم الإحصائية', icon: BarChart3 },
            { id: 'book', label: 'إضافة كتاب رقمي', icon: BookOpenText },
            { id: 'article', label: 'محرر مقالات منسق', icon: FileText },
            { id: 'thought', label: 'إضافة خاطرة عابرة', icon: Sparkles },
            { id: 'users', label: 'إدارة الأعضاء والأمان', icon: Users },
            { id: 'manager', label: 'فرز وشطب المحتوى', icon: Edit }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as AdminTab)}
                className={`px-4 py-2.5 rounded-t-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 ${
                  activeTab === tab.id 
                    ? 'bg-slate-900 text-amber-400 border-t-2 border-amber-400 font-extrabold' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Icon size={12} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Status notif */}
        <AnimatePresence>
          {notif && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mx-6 mt-4 p-3 bg-teal-950/80 border border-teal-500/20 rounded-xl text-xs text-teal-300 font-sans font-bold"
            >
              {notif}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dynamic containers */}
        <div className="p-6 flex-1 max-h-[64vh] overflow-y-auto">
          
          {/* TAB 1: Analytics with beautiful vector styled charts */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <h3 className="text-sm font-bold text-amber-300 flex items-center gap-1.5 select-none text-right">
                <BarChart3 size={16} />
                <span>الرسم البياني لتوزع محتويات مكتبة الدرعي الكلية</span>
              </h3>

              {/* بوابة التزامن وقواعد البيانات */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 text-right space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-amber-400/10 text-amber-400 rounded-xl">
                      <Database size={18} />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-white">بوابة تزامن البيانات وقاعدة البيانات الخارجية (MySQL)</h4>
                      <p className="text-[10px] text-slate-400">تتبع حالة الاتصال بقاعدتك وضخ بيانات الموقع الافتراضية إليها بضغطة زر واحدة</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 self-start sm:self-center">
                    <button
                      type="button"
                      onClick={() => fetchDbStatus()}
                      className="p-1 px-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw size={10} className={dbStatus.loading ? "animate-spin" : ""} />
                      <span>تحديث الحالة</span>
                    </button>
                  </div>
                </div>

                {/* حقل ربط قاعدة بيانات مخصص (Local XAMPP Bypass) */}
                <div className="bg-slate-950 p-4 rounded-xl border border-dashed border-slate-800 space-y-3">
                  <span className="text-[10px] text-amber-400 block font-bold">🛠️ إعدادات ربط رابط الـ API الخاص بـ PHP (XAMPP / Remote):</span>
                  
                  <div className="space-y-1.5 font-sans">
                    <label className="text-[10px] text-slate-300 block">
                      رابط الـ API النشط لـ PHP على جهازك (يمكنك تعديله يدوياً):
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        dir="ltr"
                        value={customPhpUrl}
                        onChange={(e) => setCustomPhpUrl(e.target.value)}
                        placeholder={getAutoDetectedPhpUrl() || "http://localhost/dar-ee/api.php"}
                        className="flex-1 bg-slate-900 border border-slate-800 text-slate-100 rounded-lg px-2 py-1.5 text-xs font-mono focus:outline-none focus:border-amber-400 font-sans"
                      />
                      <button
                        type="button"
                        onClick={() => handleSaveCustomPhpUrl(customPhpUrl)}
                        className="px-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-lg text-xs transition-all cursor-pointer font-sans"
                      >
                        حفظ واختبار
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[10px] text-slate-400 font-sans leading-relaxed">
                    <div>
                      <span className="text-white font-bold block">💡 الرابط المكتشف تلقائياً:</span>
                      <code className="text-amber-400/90 font-mono block select-all break-all bg-slate-900 px-1.5 py-0.5 rounded mt-1">
                        {getAutoDetectedPhpUrl() || "لا يمكن كشفه خارج السيرفر المحلي"}
                      </code>
                    </div>
                    <div>
                      <span className="text-white font-bold block">📌 نصيحة مهمة لـ XAMPP:</span>
                      <span>
                        إذا قمت برفع ملفاتك إلى مجلد مثل <code className="text-slate-300 font-mono">htdocs/books/</code> فإن الرابط المناسب لك هو <code className="text-slate-300 font-mono">http://localhost/books/api.php</code>.
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-2">
                    <span className="text-[10px] text-slate-400 block font-bold">حالة الاتصال النشط:</span>
                    {dbStatus.loading ? (
                      <div className="text-xs text-slate-400 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                        <span>جاري قراءة تكوين السيرفر الخارجي والتحقق من الاستجابة...</span>
                      </div>
                    ) : dbStatus.status === 'ready' || dbStatus.status === 'connected' ? (
                      <div className="space-y-1.5">
                        <div className="text-xs text-emerald-400 flex items-center gap-1.5 font-bold">
                          <Wifi size={14} />
                          <span>متصل بنجاح بقاعدة البيانات MySQL الخارجية ومستعد تماماً!</span>
                        </div>
                        <p className="text-[10px] text-slate-300 leading-relaxed font-sans">
                          جميع العمليات وقراءة/كتابة الكتب والمقالات تم ربطها بنجاح مع خادم الـ PHP الخاص بك (<span className="text-amber-400 font-mono">MySQL-PDO</span>). أي تغييرات تضيفها هنا ستُحفظ في سيرفرك المحلي فوراً!
                        </p>
                      </div>
                    ) : dbStatus.status === 'tables_missing_please_import_sql' ? (
                      <div className="space-y-1.5">
                        <div className="text-xs text-blue-400 flex items-center gap-1.5 font-bold">
                          <Wifi size={14} />
                          <span>السيرفر متصل لكن الجداول فارغة (مستعد لصب البيانات)</span>
                        </div>
                        <p className="text-[10px] text-slate-300 leading-relaxed font-sans">
                          تم الاتصال بـ PHP و MySQL بنجاح لكن لم يتم العثور على الجداول. يرجى الضغط على <span className="text-amber-400 font-bold">"ضخ ومزامنة كافة المحتوى الآن"</span> بالجانب لتهيئة الجداول وملئها بالبيانات فوراً تلقائياً!
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <div className="text-xs text-red-400 flex items-center gap-1.5 font-bold">
                          <WifiOff size={14} />
                          <span>قاعدة البيانات جارية محلياً بالوضع الاحتياطي (فشل الاتصال بـ api.php)</span>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
                          تأكد من تشغيل Apache و MySQL في XAMPP، ومن صحة رابط الـ API المدخل أعلاه.
                        </p>
                      </div>
                    )}

                    {dbStatus.error && (
                      <div className="mt-2 p-2 bg-red-950/40 border border-red-500/20 rounded-xl text-[10px] text-red-400 font-sans leading-relaxed break-all">
                        <span className="font-bold block mb-0.5">تفاصيل خطأ السيرفر:</span>
                        {dbStatus.error}
                      </div>
                    )}
                  </div>

                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 flex flex-col justify-between gap-3">
                    <div className="space-y-1.5">
                      <span className="text-[10px] text-slate-400 block font-bold">ملء ومزامنة المحتوى فوراً لـ MySQL:</span>
                      <p className="text-[10px] text-slate-300 leading-relaxed font-sans">
                        بما أن الجداول الخاصة بك في MySQL فارغة حالياً ولم ترفع إليها البيانات المبدئية بعد، انقر على زر الضخ أدناه لإرسال وصب كافة الكتب الافتراضية، المقالات الفكرية، حسابات الأعضاء والخواطر المكتوبة بالموقع وتخزينها بالكامل بقاعدتك فوراً!
                      </p>
                    </div>

                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={handleForceSync}
                        disabled={syncLoading}
                        className={`w-full py-2 px-4 rounded-xl text-xs font-serif font-black transition-all flex items-center justify-center gap-2 ${
                          syncLoading 
                            ? 'bg-amber-400/20 text-amber-400 cursor-not-allowed'
                            : 'bg-amber-400 hover:bg-amber-500 text-slate-950 hover:shadow-lg hover:shadow-amber-400/10 cursor-pointer'
                        }`}
                      >
                        <RefreshCw size={13} className={syncLoading ? "animate-spin" : ""} />
                        <span>{syncLoading ? 'جاري ضخ ومزامنة الجداول...' : 'ضخ ومزامنة كافة محتوى الموقع لـ MySQL الآن (Force Sync)'}</span>
                      </button>

                      {syncResult && (
                        <div className={`p-2.5 rounded-xl text-[10px] font-sans leading-relaxed ${
                          syncResult.includes('خطأ') 
                            ? 'bg-red-950/40 border border-red-500/15 text-red-400' 
                            : 'bg-emerald-950/45 border border-emerald-500/15 text-emerald-400'
                        }`}>
                          {syncResult}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* إعدادات الصوت وخلفية الترحيب في المقدمة */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 text-right space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800 select-none">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-amber-400/10 text-amber-400 rounded-xl">
                      <Music size={16} />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-white">إعدادات الصوت وخلفية الترحيب في المقدمة</h4>
                      <p className="text-[10px] text-slate-400">اختر نوع الصوت المريح الذي يعمل تلقائياً عند زيارة القارئ للموقع للمرة الأولى</p>
                    </div>
                  </div>
                  {notif && (
                    <span className="text-[9px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-3 py-1 rounded-full font-bold">
                      {notif}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  {[
                    { id: 'combined', name: 'الدمج الكامل الطبيعي 🌲', desc: 'عصافير وزقزقة ناعمة مع خرير الماء الجاري' },
                    { id: 'birds', name: 'زقزقة العصافير الهادئة 🐦', desc: 'صوت عصافير الصباح الفياضة بالسلام والهدوء' },
                    { id: 'water', name: 'خرير الساقية وجريان المياه 💧', desc: 'صوت ساقية مائية ريفية دافئة تبعث الطمأنينة' },
                    { id: 'silent', name: 'الوضع الصامت بالكامل 🔇', desc: 'تصفح هادئ خالٍ من أي أصوات خلفية بالمقدمة' }
                  ].map((preset) => {
                    const active = soundPreset === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handleSaveSoundPreset(preset.id)}
                        className={`p-3.5 rounded-xl border text-right transition-all cursor-pointer flex flex-col justify-between h-24 ${
                          active
                            ? 'bg-amber-400/10 border-amber-400/80 text-white shadow-md shadow-amber-400/5'
                            : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700 hover:bg-slate-950/60'
                        }`}
                      >
                        <span className={`text-[11px] font-black ${active ? 'text-amber-400' : 'text-slate-200'}`}>{preset.name}</span>
                        <span className="text-[9px] text-slate-400 mt-1.5 leading-normal">{preset.desc}</span>
                      </button>
                    );
                  })}
                </div>

                {/* رفع ملف صوتي مخصص */}
                <div className="pt-4 border-t border-slate-800/80 space-y-3">
                  <div className="flex items-center gap-2 text-right">
                    <span className="text-[12px] font-black text-amber-300">🎙️ رفع ملف صوتي مخصص لشاشة الترحيب:</span>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-950/50 p-4 rounded-xl border border-slate-800/60">
                    <div className="flex-1 text-right select-none">
                      <p className="text-[10px] text-slate-300 font-bold">يمكنك استبدال الأصوات الطبيعية بمؤثر صوتي مخصص من جهازك (مثل تلاوة ترحيبية أو أناشيد هادئة بحد أقصى 25 ميغابايت):</p>
                      {welcomeAudioFilename ? (
                        <div className="mt-1.5 flex items-center justify-start gap-2 text-emerald-400 font-mono text-[9px] font-extrabold" dir="rtl">
                          <span>✓ الملف المرفوع حالياً:</span>
                          <span className="bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">{welcomeAudioFilename}</span>
                        </div>
                      ) : (
                        <span className="block mt-1 text-[9px] text-slate-500 font-medium font-bold">لم يتم رفع أي ملف صوتي بعد؛ النظام يستعمل حالياً المؤثرات الهادئة الافتراضية.</span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
                      <label className="flex items-center justify-center gap-1.5 py-2 px-4 bg-amber-400 hover:bg-amber-500 text-slate-950 rounded-xl text-xs font-serif font-black transition-all cursor-pointer shadow-sm select-none">
                        <span>{isUploadingAudio ? 'جاري رفع وتشفير الملف...' : 'اختر ملفاً صوتياً من جهازك'}</span>
                        <input
                          type="file"
                          accept="audio/*"
                          onChange={handleAudioUpload}
                          disabled={isUploadingAudio}
                          className="hidden"
                        />
                      </label>
                      {welcomeAudioFilename && (
                        <button
                          type="button"
                          onClick={handleAudioDelete}
                          className="py-2 px-3 bg-red-950/60 hover:bg-red-900 border border-red-500/20 text-red-400 rounded-xl text-[10px] font-black cursor-pointer transition-all"
                        >
                          🗑️ حذف واستعادة الافتراضي
                        </button>
                      )}
                    </div>
                  </div>
                  {audioUploadError && (
                    <p className="text-[10px] text-red-400 font-black text-right" dir="rtl">{audioUploadError}</p>
                  )}
                </div>
              </div>

              {/* إشعارات آخر ما أضيف حديثاً للرواق بالملفات */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 text-right space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800 select-none">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">🔔</span>
                    <div>
                      <h4 className="text-xs font-black text-white">إشعارات وقائع الرواق الأخيرة (أحدث الإضافات)</h4>
                      <p className="text-[10px] text-slate-405">رصد تلقائي فوري لأحدث المواد والكتب والخواطر التي طرأت على نظام الملفات</p>
                    </div>
                  </div>
                  <span className="text-[9px] bg-red-400/10 border border-red-500/20 text-red-400 px-2 py-0.5 rounded-full font-bold animate-pulse">تحديث فوري</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    ...(books || []).slice(-2).map(b => ({ ...b, itemType: 'book', label: 'كتاب رقمي جديد 📖', color: 'text-sky-450 bg-sky-500/10 border-sky-500/10' })),
                    ...(articles || []).slice(-2).map(a => ({ ...a, itemType: 'article', label: 'دراسة ومقال جديد ✍️', color: 'text-emerald-450 bg-emerald-500/10 border-emerald-500/10' })),
                    ...(thoughts || []).slice(-2).map(t => ({ ...t, itemType: 'thought', label: 'أطروحة وخاطرة 💭', color: 'text-amber-450 bg-amber-500/10 border-amber-500/10' }))
                  ].reverse().map((item, idx) => (
                    <div key={idx} className="p-3 bg-slate-950/80 rounded-xl border border-slate-850 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-950 transition-all text-xs">
                      <div className="space-y-1">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded border inline-block ${item.color}`}>
                          {item.label}
                        </span>
                        <h5 className="text-[11px] font-black text-slate-100 line-clamp-1">{item.title || 'خاطرة وجدانية جديدة'}</h5>
                        <p className="text-[9px] text-slate-400">
                          القسم: <span className="text-slate-300 font-bold">{item.category}</span> {item.author ? `• بقلم: ${item.author}` : ''}
                        </p>
                      </div>
                      <span className="text-[8px] bg-slate-900 border border-slate-800 text-slate-400 px-1.5 py-0.5 rounded select-none shrink-0 font-mono">موثق بالملفات ✓</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Flex CSS distribution bars */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 text-right space-y-2">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold select-none">عدد الكتب الكلية</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-amber-400">{books.length}</span>
                    <span className="text-xs text-slate-500">مصنف ورقي</span>
                  </div>
                  <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                    <div className="bg-amber-400 h-full" style={{ width: `${Math.min(100, (books.length / 20) * 100)}%` }} />
                  </div>
                </div>

                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 text-right space-y-2">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold select-none">المقالات والعمود الثقافي</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-[#52b788]">{articles.length}</span>
                    <span className="text-xs text-slate-500">موضوع وبحث</span>
                  </div>
                  <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                    <div className="bg-[#52b788] h-full" style={{ width: `${Math.min(100, (articles.length / 20) * 100)}%` }} />
                  </div>
                </div>

                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 text-right space-y-2">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold select-none">الخواطر الروحانية المرفوعة</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-blue-400">{thoughts.length}</span>
                    <span className="text-xs text-slate-500">خاطرة سحابية</span>
                  </div>
                  <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                    <div className="bg-blue-400 h-full" style={{ width: `${Math.min(100, (thoughts.length / 20) * 100)}%` }} />
                  </div>
                </div>
              </div>

              {/* Simple beautiful SVG chart illustrating proportional density */}
              <div className="bg-slate-950/50 p-6 rounded-2xl border border-slate-800 space-y-4">
                <span className="text-xs font-bold text-slate-300 block select-none">الرسم التوضيحي للأقسام والمصنفات:</span>
                
                <div className="flex flex-col md:flex-row items-center gap-6 justify-around">
                  {/* SVG pie ratio mock */}
                  <div className="w-32 h-32 relative">
                    <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                      <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#1e293b" strokeWidth="4" />
                      <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#f59e0b" strokeWidth="4" strokeDasharray={`${Math.max(10, Math.min(80, (books.length / (books.length + articles.length + thoughts.length || 1)) * 100))} 100`} />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center text-center">
                      <span className="text-xs font-black font-sans text-amber-400">كثافة الكتب</span>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-amber-400" />
                      <span className="text-slate-300">الكتب الرقمية: تشكل {( (books.length / (books.length + articles.length + thoughts.length || 1)) * 100).toFixed(0)}% من مكتبتك</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-[#52b788]" />
                      <span className="text-slate-300">المقالات المنوعة: تشكل {( (articles.length / (books.length + articles.length + thoughts.length || 1)) * 100).toFixed(0)}% من المنشورات</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-blue-400" />
                      <span className="text-slate-300">الخواطر الوجدانية: تشكل {( (thoughts.length / (books.length + articles.length + thoughts.length || 1)) * 100).toFixed(0)}% من السماء</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Add Book Form */}
          {activeTab === 'book' && (
            <form onSubmit={handleCreateBook} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">عنوان الكتاب المروي</label>
                  <input
                    type="text"
                    value={bookTitle}
                    onChange={(e) => setBookTitle(e.target.value)}
                    placeholder="عنوان الكتاب..."
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">اسم الكاتب أو المؤلف</label>
                  <input
                    type="text"
                    value={bookAuthor}
                    onChange={(e) => setBookAuthor(e.target.value)}
                    placeholder="مثال: صالح الدرعي"
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">اسم المحرر أو المراجع (اختياري)</label>
                  <input
                    type="text"
                    value={bookEditor}
                    onChange={(e) => setBookEditor(e.target.value)}
                    placeholder="مثال: أديب الدرعي الموقر"
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">نوع وتصنيف الكتاب (اختر أو اكتب جديداً)</label>
                  <input
                    type="text"
                    list="book-categories-datalist"
                    value={bookCategory}
                    onChange={(e) => setBookCategory(e.target.value)}
                    placeholder="كتب أو اختر تصنيفاً..."
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                  <datalist id="book-categories-datalist">
                    {uniqueBookCategories.map((cat) => (
                      <option key={cat} value={cat} />
                    ))}
                  </datalist>
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">تأثير نسق الغلاف الجمالي</label>
                  <select
                    value={bookCoverTheme}
                    onChange={(e) => setBookCoverTheme(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="sky">الأزرق السماوي الكوني</option>
                    <option value="nature">الواحة والجزيرة الخضراء</option>
                    <option value="classic">المخطوط العربي الكلاسيكي</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">رابط صورة غلاف الكتاب (اختياري)</label>
                  <input
                    type="url"
                    value={bookCoverImage}
                    onChange={(e) => setBookCoverImage(e.target.value)}
                    placeholder="مثال: https://images.unsplash.com/... (إن وجد)"
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">رابط ملف PDF من قوقل درايف (صالح للمشاهدة)</label>
                  <input
                    type="url"
                    value={bookDriveUrl}
                    onChange={(e) => setBookDriveUrl(e.target.value)}
                    placeholder="مثال: https://drive.google.com/file/d/ID/view?usp=sharing"
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">كتابة محتوى القراءة الحرة قابلة للنسخ والتحميل</label>
                  <input
                    type="text"
                    value={bookFreeContent}
                    onChange={(e) => setBookFreeContent(e.target.value)}
                    placeholder="أدخل مقتطفات أو التفريغ الكامل لنص الكتاب حر النقل..."
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">الوصف والملخص المختصر</label>
                <textarea
                  value={bookDesc}
                  onChange={(e) => setBookDesc(e.target.value)}
                  placeholder="موجز يسير لإثارة فضول المطالعين للطلب والقراءة..."
                  rows={2}
                  maxLength={300}
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none"
                />
              </div>

              <div className="bg-[#111827] rounded-xl border border-slate-800 p-5 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-800/80 pb-3">
                  <div>
                    <span className="block text-xs text-amber-300 font-bold">بناء هيكل صفحات الكتاب رقمياً 📖</span>
                    <span className="block text-[10px] text-slate-400 mt-0.5">صمم كتابك صفحة بصفحة باستخدام المحرر المرئي الفاخر. سيتم ترقيم الصفحات تلقائياً وترتيبها للقارئ.</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const updated = [...bookPages, ''];
                        setBookPages(updated);
                        setActiveBookPageIndex(updated.length - 1);
                        showNotification(`➕ تم إنشاء الصفحة رقم ${updated.length}`);
                      }}
                      className="px-3.5 py-1.5 bg-blue-600/20 text-blue-300 hover:bg-blue-600 hover:text-white border border-blue-500/30 rounded-xl text-[11px] font-bold cursor-pointer transition-all flex items-center gap-1"
                    >
                      <span>إضافة صفحة جديدة</span>
                      <span>➕</span>
                    </button>

                    {bookPages.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`هل أنت متأكد من رغبتك في شطب الصفحة الحالية رقم ${activeBookPageIndex + 1}؟`)) {
                            const updated = bookPages.filter((_, idx) => idx !== activeBookPageIndex);
                            setBookPages(updated);
                            setActiveBookPageIndex(Math.max(0, activeBookPageIndex - 1));
                            showNotification('🗑️ تم شطب الصفحة بنجاح من مسودة الكتاب');
                          }
                        }}
                        className="px-3 py-1.5 bg-rose-500/15 text-rose-300 hover:bg-rose-600 hover:text-white border border-rose-500/30 rounded-xl text-[11px] font-bold cursor-pointer transition-all flex items-center gap-1"
                      >
                        <span>شطب الصفحة الحالية</span>
                        <span>🗑️</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Pages Horizontal Scroll list with real-time length indicator details */}
                <div className="flex flex-wrap items-center gap-2 max-h-36 overflow-y-auto bg-slate-950 p-3 rounded-lg border border-slate-850">
                  {bookPages.map((pageText, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveBookPageIndex(idx)}
                      className={`px-3 py-2 rounded-xl text-[11px] font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                        activeBookPageIndex === idx
                          ? 'bg-amber-400/10 border-amber-400/40 text-amber-300 shadow-md ring-1 ring-amber-400/20'
                          : 'bg-slate-900 border-slate-800 hover:bg-slate-850 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span>الصفحة {idx + 1}</span>
                      <span className="text-[9px] px-1 bg-slate-950 text-slate-500 rounded-md font-sans">
                        {pageText ? pageText.replace(/<[^>]*>/g, '').length : 0} ح
                      </span>
                    </button>
                  ))}
                </div>

                {/* Markdown editor loaded internally for current index */}
                <div className="bg-slate-900/40 p-1.5 rounded-xl border border-slate-850">
                  <MarkdownEditor
                    value={bookPages[activeBookPageIndex] || ''}
                    onChange={(val) => {
                      const updated = [...bookPages];
                      updated[activeBookPageIndex] = val;
                      setBookPages(updated);
                    }}
                    placeholder={`اكتب هنا محتوى الصفحة رقم ${activeBookPageIndex + 1} المُرقمة...`}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-amber-400 text-slate-950 hover:bg-amber-300 rounded-xl text-xs font-bold cursor-pointer transition-colors"
              >
                حفظ ونشر الكتاب الرقمي الكلي
              </button>
            </form>
          )}

          {/* TAB 3: Add Article with sequenced block editor */}
          {activeTab === 'article' && (
            <div className="space-y-6">
              <form onSubmit={handleCreateArticle} className="space-y-4 bg-slate-950/40 p-4 rounded-2xl border border-slate-800/80">
                <span className="block text-xs text-amber-300 font-bold mb-3">1. البيانات التعريفية الرئيسية للمقالة</span>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">اسم المقالة</label>
                    <input
                      type="text"
                      value={artTitle}
                      onChange={(e) => setArtTitle(e.target.value)}
                      placeholder="عنوان المقال..."
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-xs text-white rounded-lg focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-300 mb-1">المفكر أو الكاتب</label>
                    <input
                      type="text"
                      value={artAuthor}
                      onChange={(e) => setArtAuthor(e.target.value)}
                      placeholder="اسم الكاتب..."
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-xs text-white rounded-lg focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">تصنيف المقال (اختر أو اكتب جديداً)</label>
                    <input
                      type="text"
                      list="article-categories-datalist"
                      value={artCategory}
                      onChange={(e) => setArtCategory(e.target.value)}
                      placeholder="أدخل أو اختر تصنيفاً..."
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-xs text-white rounded-lg focus:outline-none"
                    />
                    <datalist id="article-categories-datalist">
                      {uniqueArticleCategories.map((cat) => (
                        <option key={cat} value={cat} />
                      ))}
                    </datalist>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-300 mb-1">رابط صورة غلاف المقال (اختياري)</label>
                    <input
                      type="url"
                      value={artCoverImage}
                      onChange={(e) => setArtCoverImage(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-xs text-white rounded-lg focus:outline-none"
                    />
                  </div>
                </div>

                {/* ADVANCED INTEGRATED MARKDOWN EDITOR AS THE NEW SPECIFIC MANDATE */}
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-850 space-y-3">
                  <span className="block text-xs text-[#52b788] font-bold">2. محتوى وصياغة المقالة المنسقة (المحرر المرئي المتناسق)</span>
                  <MarkdownEditor
                    value={artHtmlContent}
                    onChange={setArtHtmlContent}
                    placeholder="اكتب مداد المقال هنا... استخدم الأزرار الفاخرة بالأعلى لتوسيط النصوص، ضبط المحاذاة، تكبير/تصغير الفقرات، وإدراج صور وروابط ذكية منسقة."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#52b788] hover:bg-[#40916c] text-slate-950 font-black rounded-xl text-xs cursor-pointer transition-all"
                >
                  نشر المقالة المنسقة المكتملة
                </button>
              </form>
            </div>
          )}

          {/* TAB 4: Add Thoughts */}
          {activeTab === 'thought' && (
            <form onSubmit={handleCreateThought} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-350 mb-1.5">اسم وعنوان الخاطرة (مثال: ومضة فكرية، تأمل الفجر)</label>
                <input
                  type="text"
                  value={thoughtTitle}
                  onChange={(e) => setThoughtTitle(e.target.value)}
                  placeholder="عنوان الخاطرة الأدبي..."
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-350 mb-1.5">نص وصياغة الخاطرة أو الوصف الكامل</label>
                <textarea
                  value={thoughtMsg}
                  onChange={(e) => setThoughtMsg(e.target.value)}
                  placeholder="الوصف أو نص التبصر..."
                  rows={4}
                  maxLength={250}
                  className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-350 mb-1.1">صاحب الحكمة والقول</label>
                  <input
                    type="text"
                    value={thoughtAuthor}
                    onChange={(e) => setThoughtAuthor(e.target.value)}
                    placeholder="اسم الكاتب..."
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-350 mb-1.1">فئة ومجال الخاطرة (اختر أو اكتب جديداً)</label>
                  <input
                    type="text"
                    list="thought-categories-datalist"
                    value={thoughtCategory}
                    onChange={(e) => setThoughtCategory(e.target.value)}
                    placeholder="اختر أو اكتب فئة جديدة..."
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                  <datalist id="thought-categories-datalist">
                    {uniqueThoughtCategories.map((cat) => (
                      <option key={cat} value={cat} />
                    ))}
                  </datalist>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl text-xs cursor-pointer transition-all"
              >
                تثبيت الخاطرة ونشرها في السماء زرقاء
              </button>
            </form>
          )}

          {/* TAB 5: Registered Users Directory Orchestrator */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <h3 className="text-sm font-bold text-amber-300 flex items-center gap-1.5 select-none font-serif">
                <Users size={16} />
                <span>إدارة المستخدمين والأعضاء القراء ({registeredUsers.length})</span>
              </h3>

              {editingUser ? (
                <form onSubmit={handleSaveUserEdit} className="bg-slate-950 p-4 border border-slate-800 rounded-2xl space-y-4 text-right">
                  <span className="block text-xs font-extrabold text-amber-400">تعديل بيانات المستخدم القارئ: [{editingUser.username}]</span>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block text-slate-300 mb-1">الاسم المستعار</label>
                      <input
                        type="text"
                        value={editingUser.name}
                        onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                        className="w-full p-2 bg-slate-900 border border-slate-800 text-white rounded focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 mb-1">الدور والصلاحية</label>
                      <select
                        value={editingUser.role}
                        onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as any })}
                        className="w-full p-2 bg-slate-900 border border-slate-800 text-white rounded focus:outline-none"
                      >
                        <option value="user">عضو قارئ (User)</option>
                        <option value="admin">مدير المكتبة (Admin)</option>
                      </select>
                    </div>
                  </div>

                  <div className="text-xs">
                    <label className="block text-slate-300 mb-1 font-bold">تعيين كلمة سر جديدة (أو اتركها فارغة للحفاظ عليها)</label>
                    <input
                      type="text"
                      placeholder="كلمة مرور جديدة للمصلحة..."
                      value={newPasswordVal}
                      onChange={(e) => setNewPasswordVal(e.target.value)}
                      className="w-full p-2.5 bg-slate-900 border border-slate-800 text-white rounded-xl focus:outline-none"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-lg cursor-pointer"
                    >
                      تحديث وحفظ التغييرات
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingUser(null)}
                      className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-bold rounded-lg cursor-pointer"
                    >
                      إلغاء التعديل
                    </button>
                  </div>
                </form>
              ) : null}

              {/* Users Sortable Table representation */}
              <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-x-auto text-xs">
                <table className="w-full text-right border-collapse">
                  <thead>
                    <tr className="bg-slate-900/60 border-b border-slate-800 text-slate-400">
                      <th onClick={() => { setUserSortField('name'); setUserSortAsc(!userSortAsc); }} className="p-3 cursor-pointer hover:bg-slate-800/50">
                        <span className="flex items-center gap-1">الاسم <ArrowUpDown size={11} /></span>
                      </th>
                      <th onClick={() => { setUserSortField('email'); setUserSortAsc(!userSortAsc); }} className="p-3 cursor-pointer hover:bg-slate-800/50">
                        <span className="flex items-center gap-1">البريد الإلكتروني <ArrowUpDown size={11} /></span>
                      </th>
                      <th onClick={() => { setUserSortField('role'); setUserSortAsc(!userSortAsc); }} className="p-3 cursor-pointer hover:bg-slate-800/50">
                        <span className="flex items-center gap-1">الصلاحية <ArrowUpDown size={11} /></span>
                      </th>
                      <th className="p-3 text-center">الإجراءات والتحكم</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedUsers.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-6 text-center text-slate-500">لا يوجد قراء مسجلين بالملفات حالياً.</td>
                      </tr>
                    ) : (
                      sortedUsers.map((user) => (
                        <tr key={user.username} className="border-b border-slate-850 hover:bg-slate-900/30">
                          <td className="p-3 font-bold text-white">{user.name}</td>
                          <td className="p-3 text-slate-330">{user.email || 'غير متاح'}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              user.role === 'admin' ? 'bg-rose-500/10 text-rose-400' : 'bg-blue-500/10 text-blue-400'
                            }`}>
                              {user.role === 'admin' ? 'أدمن الإشراف' : 'عضو تفاعلي'}
                            </span>
                          </td>
                          <td className="p-3 text-center flex justify-center gap-1.5">
                            <button
                              onClick={() => setEditingUser(user)}
                              className="px-2 py-1 bg-blue-900/40 text-blue-350 hover:bg-blue-900 border border-blue-950 rounded text-[10px] font-bold cursor-pointer"
                            >
                              تعديل صلاحياتهم
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.username)}
                              className="p-1 px-2.5 bg-red-950/40 text-red-400 hover:bg-red-900 rounded text-[10px] font-bold cursor-pointer border border-red-950/60"
                            >
                              إلغاء حسابهم
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: Sortable, Filterable Tables to Manage Current Content */}
          {activeTab === 'manager' && (
            <div className="space-y-8 select-text">

              {/* DYNAMIC EDIT FORMS OR PANELS */}
              {editingBookState && (
                <div className="p-5 bg-slate-905 border border-amber-500/40 rounded-3xl space-y-4 shadow-xl text-xs text-right">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <h4 className="font-extrabold text-[#e0a96d] font-serif flex items-center gap-2 text-sm">
                      <span>✏️</span>
                      <span>تعديل الكتاب الرقمي: {editingBookState.title}</span>
                    </h4>
                    <button onClick={() => setEditingBookState(null)} className="text-slate-400 hover:text-white p-1">إغلاق</button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1">اسم الكتاب</label>
                      <input
                        type="text"
                        value={editingBookState.title}
                        onChange={(e) => setEditingBookState({ ...editingBookState, title: e.target.value })}
                        className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">المؤلف</label>
                      <input
                        type="text"
                        value={editingBookState.author}
                        onChange={(e) => setEditingBookState({ ...editingBookState, author: e.target.value })}
                        className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1">المحقق/المحرر أو المراجع</label>
                      <input
                        type="text"
                        value={editingBookState.editor || ''}
                        onChange={(e) => setEditingBookState({ ...editingBookState, editor: e.target.value })}
                        className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                        placeholder="المحرر أو المحقق..."
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">التصنيف (اختر أو اكتب جديداً)</label>
                      <input
                        type="text"
                        list="book-categories-datalist-edit"
                        value={editingBookState.category}
                        onChange={(e) => setEditingBookState({ ...editingBookState, category: e.target.value })}
                        className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                        placeholder="أدخل أو اختر تصنيفاً..."
                      />
                      <datalist id="book-categories-datalist-edit">
                        {uniqueBookCategories.map((cat) => (
                          <option key={cat} value={cat} />
                        ))}
                      </datalist>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1">رابط صورة غلاف الكتاب</label>
                      <input
                        type="text"
                        value={editingBookState.coverImage || ''}
                        onChange={(e) => setEditingBookState({ ...editingBookState, coverImage: e.target.value || undefined })}
                        className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono text-[10px]"
                        placeholder="https://example.com/cover.png"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">رابط ملف PDF المخطوطة الكبرى (Google Drive)</label>
                      <input
                        type="url"
                        value={editingBookState.drivePdfUrl || ''}
                        onChange={(e) => setEditingBookState({ ...editingBookState, drivePdfUrl: e.target.value || undefined })}
                        className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono text-[10px]"
                        placeholder="https://drive.google.com/file/d/.../view"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">الوصف والموجز الروائي</label>
                    <textarea
                      value={editingBookState.description}
                      onChange={(e) => setEditingBookState({ ...editingBookState, description: e.target.value })}
                      rows={2}
                      className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">النص المفرغ الكامل القابل للنقل والنسخ (تفريغ للنقل للباحثين)</label>
                    <textarea
                      value={editingBookState.freeCopyContent || ''}
                      onChange={(e) => setEditingBookState({ ...editingBookState, freeCopyContent: e.target.value || undefined })}
                      rows={3}
                      className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-serif"
                      placeholder="ضع النص المفرغ هنا يسهل على الباحثين نسخه ولصقه بنقرة واحدة..."
                    />
                  </div>

                  <div className="bg-[#111827] rounded-xl border border-slate-800 p-4 space-y-4 font-sans">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-800/80 pb-3">
                      <div>
                        <span className="block text-xs text-amber-300 font-bold">تعديل محتوى صفحات الكتاب تفاعلياً 📖</span>
                        <span className="block text-[10px] text-slate-400 mt-0.5">أدرج صفحاتك أو عدّلها بسهولة منسقة عبر المحرر المرئي المتجاوب.</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const currentList = editingBookState.content ? [...editingBookState.content] : [];
                            const updated = [...currentList, ''];
                            setEditingBookState({
                              ...editingBookState,
                              content: updated
                            });
                            setActiveEditBookPageIndex(updated.length - 1);
                            showNotification(`➕ تم إضافة صفحة جديدة رقم ${updated.length} للتعديل`);
                          }}
                          className="px-3 py-1.5 bg-blue-600/20 text-blue-300 hover:bg-blue-600 hover:text-white border border-blue-500/30 rounded-xl text-[11px] font-bold cursor-pointer transition-all flex items-center gap-1"
                        >
                          <span>إضافة صفحة ➕</span>
                        </button>

                        {editingBookState.content && editingBookState.content.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`هل تود بالتأكيد شطب الصفحة رقم ${activeEditBookPageIndex + 1} من هذا الكتاب نهائياً؟`)) {
                                const updated = editingBookState.content!.filter((_, idx) => idx !== activeEditBookPageIndex);
                                setEditingBookState({
                                  ...editingBookState,
                                  content: updated
                                });
                                setActiveEditBookPageIndex(Math.max(0, activeEditBookPageIndex - 1));
                                showNotification('🗑️ تم شطب الصفحة المحددة من الكتاب');
                              }
                            }}
                            className="px-3 py-1.5 bg-rose-500/15 text-rose-300 hover:bg-rose-600 hover:text-white border border-rose-500/30 rounded-xl text-[11px] font-bold cursor-pointer transition-all flex items-center gap-1"
                          >
                            <span>شطب هذه الصفحة 🗑️</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Scrollable page indexes */}
                    <div className="flex flex-wrap items-center gap-2 max-h-36 overflow-y-auto bg-slate-950 p-2.5 rounded-lg border border-slate-850">
                      {(editingBookState.content || ['']).map((pageText, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setActiveEditBookPageIndex(idx)}
                          className={`px-3 py-2 rounded-xl text-[11px] font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                            activeEditBookPageIndex === idx
                              ? 'bg-amber-400/10 border-amber-400/40 text-amber-300 shadow-md ring-1 ring-amber-400/20'
                              : 'bg-slate-900 border-slate-800 hover:bg-slate-850 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <span>الصفحة {idx + 1}</span>
                          <span className="text-[9px] px-1 bg-slate-950 text-slate-500 rounded-md font-sans">
                            {pageText ? pageText.replace(/<[^>]*>/g, '').length : 0} ح
                          </span>
                        </button>
                      ))}
                    </div>

                    {/* Integrated visual editor */}
                    <div className="bg-slate-900/40 p-1 rounded-xl border border-slate-850">
                      <MarkdownEditor
                        value={editingBookState.content ? (editingBookState.content[activeEditBookPageIndex] || '') : ''}
                        onChange={(val) => {
                          const updated = editingBookState.content ? [...editingBookState.content] : [''];
                          updated[activeEditBookPageIndex] = val;
                          setEditingBookState({
                            ...editingBookState,
                            content: updated
                          });
                        }}
                        placeholder={`اكتب هنا محتوى وتنسيق الصفحة رقم ${activeEditBookPageIndex + 1}...`}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 text-[11px]">
                    <button
                      onClick={() => setEditingBookState(null)}
                      className="px-4 py-2 bg-slate-800 rounded-lg font-bold text-slate-300 cursor-pointer"
                    >
                      إلغاء التراجع
                    </button>
                    <button
                      onClick={() => {
                        if (onUpdateBook) {
                          onUpdateBook(editingBookState);
                          setEditingBookState(null);
                          showNotification('✏️ تم تعديل وإشهار الكتاب بالتحديثات الجديدة!');
                        }
                      }}
                      className="px-5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-lg cursor-pointer"
                    >
                      حفظ وتوثيق التحديثات ✦
                    </button>
                  </div>
                </div>
              )}

              {editingArticleState && (
                <div className="p-5 bg-slate-905 border border-[#52b788]/40 rounded-3xl space-y-4 shadow-xl text-xs text-right font-sans">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <h4 className="font-extrabold text-[#52b788] font-serif flex items-center gap-2 text-sm">
                      <span>✏️</span>
                      <span>تعديل المقال الفكري: {editingArticleState.title}</span>
                    </h4>
                    <button onClick={() => setEditingArticleState(null)} className="text-slate-400 hover:text-white p-1">إغلاق</button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1">عنوان المقالة</label>
                      <input
                        type="text"
                        value={editingArticleState.title}
                        onChange={(e) => setEditingArticleState({ ...editingArticleState, title: e.target.value })}
                        className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">الكاتب والمفكّر</label>
                      <input
                        type="text"
                        value={editingArticleState.author}
                        onChange={(e) => setEditingArticleState({ ...editingArticleState, author: e.target.value })}
                        className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                      />
                    </div>
                  </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1">التصنيف (اختر أو اكتب جديداً)</label>
                      <input
                        type="text"
                        list="article-categories-datalist-edit"
                        value={editingArticleState.category}
                        onChange={(e) => setEditingArticleState({ ...editingArticleState, category: e.target.value })}
                        className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                        placeholder="أدخل أو اختر تصنيفاً..."
                      />
                      <datalist id="article-categories-datalist-edit">
                        {uniqueArticleCategories.map((cat) => (
                          <option key={cat} value={cat} />
                        ))}
                      </datalist>
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">صورة الغلاف للمقالة (رابط URL)</label>
                      <input
                        type="text"
                        value={editingArticleState.coverImage || ''}
                        onChange={(e) => setEditingArticleState({ ...editingArticleState, coverImage: e.target.value || undefined })}
                        className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono text-[10px]"
                        placeholder="https://example.com/article-cover.jpg"
                      />
                    </div>
                  </div>

                  {/* FOR EDITING: INTEGRATED FORMATTED MARKDOWN EDITOR */}
                  <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-3">
                    <span className="block text-xs text-[#52b788] font-bold">محتوى المقالة التفصيلي المنسق (محرر مرئي متناسق)</span>
                    <MarkdownEditor
                      value={editingArticleState.content?.[0] || ''}
                      onChange={(val) => setEditingArticleState({
                        ...editingArticleState,
                        content: [val],
                        richContent: undefined // Switch to native HTML rendering
                      })}
                      placeholder="ابدأ بصياغة المقال المتميز هنا..."
                    />
                  </div>

                  <div className="flex justify-end gap-2 text-[11px]">
                    <button
                      onClick={() => setEditingArticleState(null)}
                      className="px-4 py-2 bg-slate-800 rounded-lg font-bold text-slate-300 cursor-pointer"
                    >
                      إلغاء التراجع
                    </button>
                    <button
                      onClick={() => {
                        if (onUpdateArticle) {
                          onUpdateArticle(editingArticleState);
                          setEditingArticleState(null);
                          showNotification('✏️ تم تعديل وإشهار المقال بالتحديثات الجديدة!');
                        }
                      }}
                      className="px-5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-lg cursor-pointer"
                    >
                      حفظ وتوثيق التحديثات ✦
                    </button>
                  </div>
                </div>
              )}

              {editingThoughtState && (
                <div className="p-5 bg-slate-905 border border-blue-500/40 rounded-3xl space-y-4 shadow-xl text-xs text-right">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <h4 className="font-extrabold text-blue-400 font-serif flex items-center gap-2 text-sm">
                      <span>✏️</span>
                      <span>تعديل الخاطرة الفكرية</span>
                    </h4>
                    <button onClick={() => setEditingThoughtState(null)} className="text-slate-400 hover:text-white p-1">إغلاق</button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1">بقلم (الكاتب)</label>
                      <input
                        type="text"
                        value={editingThoughtState.author}
                        onChange={(e) => setEditingThoughtState({ ...editingThoughtState, author: e.target.value })}
                        className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">الفئة (اختر أو اكتب جديداً)</label>
                      <input
                        type="text"
                        list="thought-categories-datalist-edit"
                        value={editingThoughtState.category}
                        onChange={(e) => setEditingThoughtState({ ...editingThoughtState, category: e.target.value })}
                        className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                        placeholder="أدخل أو اختر فئة جديدة..."
                      />
                      <datalist id="thought-categories-datalist-edit">
                        {uniqueThoughtCategories.map((cat) => (
                          <option key={cat} value={cat} />
                        ))}
                      </datalist>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">عنوان الخاطرة</label>
                    <input
                      type="text"
                      value={editingThoughtState.title || ''}
                      onChange={(e) => setEditingThoughtState({ ...editingThoughtState, title: e.target.value })}
                      className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">صيغة الخاطرة ونظرة التأمل</label>
                    <textarea
                      value={editingThoughtState.content}
                      onChange={(e) => setEditingThoughtState({ ...editingThoughtState, content: e.target.value })}
                      rows={3}
                      className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                    />
                  </div>

                  <div className="flex justify-end gap-2 text-[11px]">
                    <button
                      onClick={() => setEditingThoughtState(null)}
                      className="px-4 py-2 bg-slate-800 rounded-lg font-bold text-slate-300 cursor-pointer"
                    >
                      إلغاء التراجع
                    </button>
                    <button
                      onClick={() => {
                        if (onUpdateThought) {
                          onUpdateThought(editingThoughtState);
                          setEditingThoughtState(null);
                          showNotification('✏️ تم تعديل وإشهار الخاطرة بالتحديثات الجديدة!');
                        }
                      }}
                      className="px-5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-lg cursor-pointer"
                    >
                      حفظ وتوثيق التحديثات ✦
                    </button>
                  </div>
                </div>
              )}
               
               {/* BOOKS TABLE */}
               <div className="space-y-3">
                 <h3 className="text-sm font-bold text-amber-305 border-b border-slate-800 pb-1.5 flex items-center justify-between font-serif">
                   <div className="flex items-center gap-1.5 text-amber-400">
                     <BookOpenText size={16} />
                     <span>جدول فرز وتعديل الكتب الرقمية ({books.length})</span>
                   </div>
                 </h3>
 
                 <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-x-auto text-xs">
                   <table className="w-full text-right border-collapse">
                     <thead>
                       <tr className="bg-slate-900/60 border-b border-slate-800 text-slate-400">
                         <th onClick={() => { setBookSortField('title'); setBookSortAsc(!bookSortAsc); }} className="p-2.5 cursor-pointer hover:bg-slate-850">
                           <span className="flex items-center gap-1">العنوان <ArrowUpDown size={10} /></span>
                         </th>
                         <th onClick={() => { setBookSortField('author'); setBookSortAsc(!bookSortAsc); }} className="p-2.5 cursor-pointer hover:bg-slate-850">
                           <span className="flex items-center gap-1">المؤلف <ArrowUpDown size={10} /></span>
                         </th>
                         <th onClick={() => { setBookSortField('category'); setBookSortAsc(!bookSortAsc); }} className="p-2.5 cursor-pointer hover:bg-slate-850">
                           <span className="flex items-center gap-1">التصنيف <ArrowUpDown size={10} /></span>
                         </th>
                         <th className="p-2.5 text-center">الإجراءات والتحكم</th>
                       </tr>
                     </thead>
                     <tbody>
                       {sortedBooks.map((b) => (
                         <tr key={b.id} className="border-b border-slate-850 hover:bg-slate-900/30">
                           <td className="p-2.5 font-bold text-white max-w-xs truncate">{b.title}</td>
                           <td className="p-2.5 text-slate-300">{b.author}</td>
                           <td className="p-2.5 text-amber-400">{b.category}</td>
                           <td className="p-2.5 text-center flex items-center justify-center gap-1.5">
                             <button
                               onClick={() => { setEditingBookState(b); setActiveEditBookPageIndex(0); }}
                               className="p-1 px-2 text-[10px] bg-blue-900/50 text-blue-300 hover:bg-blue-800 border border-blue-900/50 rounded cursor-pointer"
                             >
                               تعديل
                             </button>
                             <button
                               onClick={() => {
                                 onDeleteBook(b.id);
                                 showNotification('🔥 تم إزالة الكتاب من الأرشيف كلياً');
                               }}
                               className="p-1 px-2 bg-rose-950/40 text-rose-400 hover:bg-rose-900 rounded border border-rose-950 text-[10px] cursor-pointer"
                             >
                               شطب
                             </button>
                           </td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                 </div>
               </div>
 
               {/* ARTICLES TABLE */}
               <div className="space-y-3">
                 <h3 className="text-sm font-bold border-b border-slate-800 pb-1.5 flex items-center justify-between font-serif text-[#52b788]">
                   <div className="flex items-center gap-1.5">
                     <FileText size={16} />
                     <span>جدول فرز وتعديل المقالات ({articles.length})</span>
                   </div>
                 </h3>
 
                 <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-x-auto text-xs">
                   <table className="w-full text-right border-collapse">
                     <thead>
                       <tr className="bg-slate-900/60 border-b border-slate-800 text-slate-400">
                         <th onClick={() => { setArtSortField('title'); setArtSortAsc(!artSortAsc); }} className="p-2.5 cursor-pointer hover:bg-slate-850">
                           <span className="flex items-center gap-1">المقالة <ArrowUpDown size={10} /></span>
                         </th>
                         <th onClick={() => { setArtSortField('author'); setArtSortAsc(!artSortAsc); }} className="p-2.5 cursor-pointer hover:bg-slate-850">
                           <span className="flex items-center gap-1">الكاتب <ArrowUpDown size={10} /></span>
                         </th>
                         <th onClick={() => { setArtSortField('category'); setArtSortAsc(!artSortAsc); }} className="p-2.5 cursor-pointer hover:bg-slate-850">
                           <span className="flex items-center gap-1">التصنيف <ArrowUpDown size={10} /></span>
                         </th>
                         <th className="p-2.5 text-center">الإجراءات والتحكم</th>
                       </tr>
                     </thead>
                     <tbody>
                       {sortedArticles.map((a) => (
                         <tr key={a.id} className="border-b border-slate-850 hover:bg-slate-900/30">
                           <td className="p-2.5 font-bold text-white max-w-xs truncate">{a.title}</td>
                           <td className="p-2.5 text-slate-300">{a.author}</td>
                           <td className="p-2.5 text-[#52b788]">{a.category}</td>
                           <td className="p-2.5 text-center flex items-center justify-center gap-1.5">
                             <button
                               onClick={() => setEditingArticleState({
                                  ...a,
                                  content: [convertArticleToHtml(a)],
                                  richContent: undefined
                                })}
                               className="p-1 px-2 text-[10px] bg-blue-900/50 text-blue-300 hover:bg-blue-800 border border-blue-900/50 rounded cursor-pointer"
                             >
                               تعديل
                             </button>
                             <button
                               onClick={() => {
                                 onDeleteArticle(a.id);
                                 showNotification('🔥 تم إزالة المقالة من الخوادم');
                               }}
                               className="p-1 px-2 bg-rose-950/40 text-rose-400 hover:bg-rose-900 rounded border border-rose-950 text-[10px] cursor-pointer"
                             >
                               شطب
                             </button>
                           </td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                 </div>
               </div>
 
               {/* THOUGHTS TABLE */}
               <div className="space-y-3">
                 <h3 className="text-sm font-bold text-blue-400 border-b border-slate-800 pb-1.5 flex items-center justify-between font-serif">
                   <div className="flex items-center gap-1.5">
                     <Sparkles size={16} />
                     <span>جدول فرز وتعديل خواطر السماء ({thoughts.length})</span>
                   </div>
                 </h3>
 
                 <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-x-auto text-xs">
                   <table className="w-full text-right border-collapse">
                     <thead>
                       <tr className="bg-slate-900/60 border-b border-slate-800 text-slate-400">
                         <th onClick={() => { setThoughtSortField('author'); setThoughtSortAsc(!thoughtSortAsc); }} className="p-2.5 cursor-pointer hover:bg-slate-850">
                           <span className="flex items-center gap-1">بقلم <ArrowUpDown size={10} /></span>
                         </th>
                         <th onClick={() => { setThoughtSortField('category'); setThoughtSortAsc(!thoughtSortAsc); }} className="p-2.5 cursor-pointer hover:bg-slate-850">
                           <span className="flex items-center gap-1">الفئة <ArrowUpDown size={10} /></span>
                         </th>
                         <th className="p-2.5">الخاطرة والقول المأثور</th>
                         <th className="p-2.5 text-center">الإجراءات والتحكم</th>
                       </tr>
                     </thead>
                     <tbody>
                       {sortedThoughts.map((t) => (
                         <tr key={t.id} className="border-b border-slate-850 hover:bg-slate-900/30">
                           <td className="p-2.5 font-bold text-white">{t.author}</td>
                           <td className="p-2.5 text-blue-400">{t.category}</td>
                           <td className="p-2.5 max-w-xs text-slate-300 truncate font-serif">"{t.content}"</td>
                           <td className="p-2.5 text-center flex items-center justify-center gap-1.5">
                             <button
                               onClick={() => setEditingThoughtState(t)}
                               className="p-1 px-2 text-[10px] bg-blue-900/50 text-blue-300 hover:bg-blue-800 border border-blue-900/50 rounded cursor-pointer"
                             >
                               تعديل
                             </button>
                             <button
                               onClick={() => {
                                 onDeleteThought(t.id);
                                 showNotification('🔥 تم إزالة الخاطرة المحددة');
                               }}
                               className="p-1 px-2 bg-rose-950/40 text-rose-400 hover:bg-rose-900 rounded border border-rose-950 text-[10px] cursor-pointer"
                             >
                               شطب
                             </button>
                           </td>
                         </tr>
                       ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 4. SEPARATE COMMENTS FILE MANAGER ("كل نوع ملف مستقل ليتمكن مدير الموقع من المشاهدة والتعديل") */}
              <div className="space-y-3 bg-[#110107]/40 p-4 rounded-3xl border border-rose-950/20">
                <h3 className="text-sm font-extrabold text-cyan-400 border-b border-slate-800 pb-1.5 flex items-center justify-between font-serif">
                  <span>📝 ملف تفاعل الأعضاء للتعليقات والردود الأكاديمية ({localComments.length})</span>
                </h3>

                {editingCommentId && (
                  <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                    <span className="text-[10px] font-bold text-amber-400 block">تعديل صيغة التعليق:</span>
                    <textarea
                      value={editingCommentText}
                      onChange={(e) => setEditingCommentText(e.target.value)}
                      className="w-full p-2.5 bg-slate-900 border border-slate-800 text-white text-xs rounded-xl focus:outline-none"
                      rows={2}
                    />
                    <div className="flex gap-2 text-[10px]">
                      <button
                        onClick={() => saveEditedComment(editingCommentId)}
                        className="px-3 py-1.5 bg-emerald-650 text-white rounded font-bold cursor-pointer"
                      >
                        حفظ التعديل السريع
                      </button>
                      <button
                        onClick={() => setEditingCommentId(null)}
                        className="px-3 py-1.5 bg-slate-800 text-slate-305 rounded cursor-pointer"
                      >
                        إلغاء التراجع
                      </button>
                    </div>
                  </div>
                )}

                <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-x-auto text-xs">
                  <table className="w-full text-right border-collapse">
                    <thead>
                      <tr className="bg-slate-900/60 border-b border-slate-800 text-slate-400">
                        <th className="p-2.5">المُستخدِم</th>
                        <th className="p-2.5">التعليق الأدبي</th>
                        <th className="p-2.5">رقم المادة المعنية</th>
                        <th className="p-2.5 text-center">التحكم الفوري بملف التعليق</th>
                      </tr>
                    </thead>
                    <tbody>
                      {localComments.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="p-4 text-center text-slate-500">لا توجد سجلات تعليقات في الملف حالياً.</td>
                        </tr>
                      ) : (
                        localComments.map((com: any) => (
                          <tr key={com.id} className="border-b border-slate-850 hover:bg-slate-900/30">
                            <td className="p-2.5 font-bold text-white">{com.authorName}</td>
                            <td className="p-2.5 text-slate-300 italic">"{com.content}"</td>
                            <td className="p-2.5 text-slate-500 text-[10px] font-mono">{com.itemId}</td>
                            <td className="p-2.5 text-center flex justify-center gap-1.5">
                              <button
                                onClick={() => startEditComment(com.id, com.content)}
                                className="px-2 py-0.5 bg-cyan-950/40 text-cyan-400 hover:bg-cyan-900 rounded border border-cyan-950 text-[9px] cursor-pointer"
                              >
                                تعديل
                              </button>
                              <button
                                onClick={() => handleDeleteComment(com.id)}
                                className="px-2 py-0.5 bg-rose-950/40 text-rose-400 hover:bg-rose-900 rounded border border-rose-950/50 text-[9px] cursor-pointer"
                              >
                                حذف
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 5. SEPARATE FAVORITES FILE MANAGER */}
              <div className="space-y-3 bg-[#110107]/40 p-4 rounded-3xl border border-rose-950/20">
                <h3 className="text-sm font-extrabold text-rose-400 border-b border-slate-800 pb-1.5 flex items-center justify-between font-serif">
                  <span>❤️ ملف الأرشيف الخاص لمفضلات الأعضاء ومحتويات الحفظ ({localFavorites.length})</span>
                </h3>

                <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-x-auto text-xs">
                  <table className="w-full text-right border-collapse">
                    <thead>
                      <tr className="bg-slate-900/60 border-b border-slate-800 text-slate-400">
                        <th className="p-2.5">اسم العضو القارئ</th>
                        <th className="p-2.5">العنصر المفضل</th>
                        <th className="p-2.5">نوع العنصر</th>
                        <th className="p-2.5 text-center">شطب من ملف التفضيلات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {localFavorites.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="p-4 text-center text-slate-500">لا توجد سجلات مفضلة في الملف حالياً.</td>
                        </tr>
                      ) : (
                        localFavorites.map((fav: any) => (
                          <tr key={fav.id} className="border-b border-slate-850 hover:bg-slate-900/30">
                            <td className="p-2.5 font-bold text-white">{fav.name} ({fav.username})</td>
                            <td className="p-2.5 text-amber-300 font-serif font-black">{fav.itemTitle || fav.itemId}</td>
                            <td className="p-2.5 text-slate-400">{fav.itemType === 'book' ? '📖 كتاب رقمي' : '✍️ مقال'}</td>
                            <td className="p-2.5 text-center">
                              <button
                                onClick={() => handleDeleteFavorite(fav.id)}
                                className="px-2.5 py-0.5 bg-rose-950/40 text-rose-400 hover:bg-rose-900 rounded border border-rose-950/50 text-[10px] cursor-pointer"
                              >
                                شطب وحذف
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 6. SEPARATE RATINGS FILE MANAGER */}
              <div className="space-y-3 bg-[#110107]/40 p-4 rounded-3xl border border-rose-950/20">
                <h3 className="text-sm font-extrabold text-amber-400 border-b border-slate-800 pb-1.5 flex items-center justify-between font-serif">
                  <span>⭐ ملف سجلات تقييمات الأعضاء بالنجوم والتقييم الحر ({localRatings.length})</span>
                </h3>

                <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-x-auto text-xs">
                  <table className="w-full text-right border-collapse">
                    <thead>
                      <tr className="bg-slate-900/60 border-b border-slate-800 text-slate-400">
                        <th className="p-2.5">اسم العضو</th>
                        <th className="p-2.5">اسم المادة المقيَّمة</th>
                        <th className="p-2.5">العلامة والتصنيف بالنجوم</th>
                        <th className="p-2.5 text-center">مسح التقييم من ملف النجوم</th>
                      </tr>
                    </thead>
                    <tbody>
                      {localRatings.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="p-4 text-center text-slate-500">لا توجد تقييمات موثقة بالملف حالياً.</td>
                        </tr>
                      ) : (
                        localRatings.map((rat: any) => (
                          <tr key={rat.id} className="border-b border-slate-850 hover:bg-slate-900/30">
                            <td className="p-2.5 font-bold text-white">{rat.name} ({rat.username})</td>
                            <td className="p-2.5 text-slate-305">{rat.itemName}</td>
                            <td className="p-2.5 text-amber-500 font-bold flex items-center gap-1 select-none">
                              {Array.from({ length: rat.rating || 5 }).map((_, idx) => (
                                <Star key={idx} size={9} fill="currentColor" />
                              ))}
                              <span className="text-[10px] font-mono mr-1">({rat.rating} / 5)</span>
                            </td>
                            <td className="p-2.5 text-center">
                              <button
                                onClick={() => handleDeleteRating(rat.id)}
                                className="px-2.5 py-0.5 bg-rose-950/40 text-rose-400 hover:bg-rose-900 rounded border border-rose-950/50 text-[10px] cursor-pointer"
                              >
                                شطب
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

        </div>
      </motion.div>
    </div>
  );
}
