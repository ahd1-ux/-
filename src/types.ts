export interface Book {
  id: string;
  title: string;
  author: string;
  editor?: string; // المحرر
  category: string;
  description: string;
  content: string[]; // Chapters or pages
  freeCopyContent?: string; // كتابة قابلة للنسخ
  drivePdfUrl?: string; // رابط بي دي اف من قوقل درايف
  coverImage?: string; // صورة للكتاب غلاف
  readTime: string;
  publishDate: string;
  isFree?: boolean; // هل الكتاب مجاني أم للشراء
  price?: number; // سعر الكتاب بالدرهم / ريال
  rating?: number; // التقييم المتوسط المعروض بالتصميم (مثال 4.8)
  views?: number; // عدد المشاهدات
  coverStyle: {
    bg: string;
    text: string;
    accent: string;
    pattern: 'minimal' | 'stars' | 'geometric' | 'sky';
  };
}

export interface RichContentElement {
  id: string;
  type: 'h1' | 'h2' | 'p' | 'ol' | 'img' | 'link';
  text?: string;
  align?: 'right' | 'center' | 'left';
  src?: string; // image source or url
  scale?: 'small' | 'medium' | 'large'; // image size
}

export interface Article {
  id: string;
  title: string;
  author: string;
  category: string;
  description?: string; // وصف المقال
  coverImage?: string; // صورة غلاف المقال
  content: string[]; // Fallback paragraphs
  richContent?: RichContentElement[]; // المنسق بمحرر مدمج
  readTime: string;
  date: string;
  imageStyle: {
    from: string;
    to: string;
    pattern: string;
  };
  views: number;
  likes: number;
  rating?: number; // التقييم بالنجوم للمقالات
}

export interface Thought {
  id: string;
  title?: string; // اسم الخاطرة
  content: string; // وصف الخاطرة
  author: string;
  category: string;
  date: string;
  likes: number;
  rating?: number; // التقييم بالنجوم للخواطر
  views?: number; // عدد المشاهدات
}

export interface Review {
  id: string;
  itemId: string; // bookId or articleId
  authorName: string;
  content: string;
  rating?: number; // Only for books
  date: string;
  userId: string;
  replies?: Array<{
    id: string;
    authorName: string;
    content: string;
    date: string;
  }>;
}

export interface UserSession {
  username: string;
  name: string;
  role: 'guest' | 'user' | 'admin';
  avatarSeed: string;
  email?: string;
}

export interface RegisteredUser {
  username: string;
  email: string;
  password?: string;
  name: string;
  role: 'user' | 'admin';
  avatarSeed: string;
}
