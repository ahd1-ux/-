export interface Language {
  code: string;
  initial: string;
  name: string;
  isRtl: boolean;
}

export const LANGUAGES: Language[] = [
  { code: 'AR', initial: 'SA', name: 'العربية', isRtl: true },
  { code: 'EN', initial: 'GB', name: 'English', isRtl: false },
  { code: 'FR', initial: 'FR', name: 'Français', isRtl: false },
  { code: 'TR', initial: 'TR', name: 'Türkçe', isRtl: false },
  { code: 'FA', initial: 'IR', name: 'فارسی', isRtl: true },
  { code: 'DE', initial: 'DE', name: 'Deutsch', isRtl: false },
  { code: 'ES', initial: 'ES', name: 'Español', isRtl: false },
  { code: 'UR', initial: 'PK', name: 'اردو', isRtl: true },
  { code: 'ZH', initial: 'CN', name: '中文', isRtl: false },
  { code: 'RU', initial: 'RU', name: 'Русский', isRtl: false },
  { code: 'IT', initial: 'IT', name: 'Italiano', isRtl: false },
  { code: 'PT', initial: 'PT', name: 'Português', isRtl: false },
  { code: 'JA', initial: 'JP', name: '日本語', isRtl: false },
  { code: 'KO', initial: 'KR', name: '한국어', isRtl: false },
  { code: 'ID', initial: 'ID', name: 'Bahasa Indonesia', isRtl: false },
  { code: 'NL', initial: 'NL', name: 'Nederlands', isRtl: false },
  { code: 'PL', initial: 'PL', name: 'Polski', isRtl: false },
  { code: 'HE', initial: 'IL', name: 'עברית', isRtl: true },
  { code: 'SV', initial: 'SE', name: 'Svenska', isRtl: false },
  { code: 'MS', initial: 'MY', name: 'Bahasa Melayu', isRtl: false }
];

export const UI_TRANSLATIONS: Record<string, Record<string, string>> = {
  "مكتبة الدرعي الرقمية": {
    EN: "Al-Dir'i Digital Library",
    FR: "Bibliothèque Numérique Al-Dir'i",
    TR: "Al-Dir'i Dijital Kütüphanesi",
    FA: "کتابخانه دیجیتال الدروع",
    DE: "Al-Dir'i Digitale Bibliothek",
    ES: "Biblioteca Digital Al-Dir'i",
    UR: "الدرعی ڈیجیٹل لائبریری",
    ZH: "阿勒第里数字图书馆",
    RU: "Цифровая библиотека Аль-Дири"
  },
  "رواق التدبر ونقاء الحكمة الوجدانية": {
    EN: "The Gallery of Contemplation & Purity of Spiritual Wisdom",
    FR: "La Galerie de Contemplation & Pureté de Sagesse Spirituelle",
    TR: "Tefekkür ve Manevi Hikmet Saflığı Galerisi",
    FA: "رواق تدبر و پاکی حکمت وجدانی",
    DE: "Die Galerie der Kontemplation & Reinheit Spiritueller Weisheit",
    ES: "La Galería de la Contemplación y Pureza de la Sabiduría Espiritual",
    UR: "تدبر اور روحانی حکمت کی پاکیزگی کا رواق",
    ZH: "冥想与心灵智慧纯洁画廊",
    RU: "Галерея созерцания и чистоты духовной мудрости"
  },
  "نبض الكلمة وسحر الأطروحات الفكرية": {
    EN: "Pulse of the Word & Magic of Intellectual Theses",
    FR: "Le Pouls de la Parole & Magie des Thèses Intellectuelles",
    TR: "Kelimenin Nabzı ve Entelektüel Tezlerin Büyüsü",
    FA: "نبض کلمه و جادوی پایان نامه‌های فکری",
    DE: "Der Puls des Wortes & Die Magie Intellektueller Thesen",
    ES: "El pulso de la palabra y la magia de las tesis intelectuales",
    UR: "لفظوں کی نبض اور فکری نظریات کا سحر",
    ZH: "言语的脉搏与知识论点之美妙",
    RU: "Пульс слова и магия интеллектуальных тезисов"
  },
  "نبض الكلمة وديوان الخواطر والدرر الكامل": {
    EN: "Pulse of the Word & Complete Diwan of Thoughts",
    FR: "Le Pouls de la Parole & Diwan Complet de Pensées",
    TR: "Kelimenin Nabzı ve Tüm Düşünceler Divânı",
    FA: "نبض کلمه و دیوان کامل خواطر و اندیشه‌ها",
    DE: "Der Puls des Wortes & Das vollständige Diwan der Gedanken",
    ES: "El pulso de la palabra y el diván completo de pensamientos",
    UR: "لفظوں کی نبض اور افکار کا مکمل دیوان",
    ZH: "言语的脉搏与完整的思想诗集",
    RU: "Пульс слова и полный диван мыслей"
  },
  "نبض الكلمة وديوان الخواطر الوجدانية الكامل": {
    EN: "Pulse of the Word & Complete Diwan of Thoughts",
    FR: "Le Pouls de la Parole & Diwan Complet de Pensées",
    TR: "Kelimenin Nabzı ve Tüm Düşünceler Divânı",
    FA: "نبض کلمه و دیوان کامل خواطر",
    DE: "Der Puls des Wortes & Das vollständige Diwan",
    ES: "El pulso de la palabra y diván de pensamientos",
    UR: "لفظوں کی نبض اور افکار کا مکمل دیوان",
    ZH: "言语的脉搏与完整心灵之诗",
    RU: "Пульс слова и полный диван мыслей"
  },
  "قراءة المزيد": {
    EN: "Read More",
    FR: "Lire la suite",
    TR: "Dahası",
    FA: "ادامه مطلب",
    DE: "Mehr lesen",
    ES: "Leer más",
    UR: "مزید پڑھیں",
    ZH: "阅读更多",
    RU: "Читать далее"
  },
  "ركن التوصيات الكبرى والأضواء الساطعة للرواق الأدبي": {
    EN: "Corner of Grand Recommendations & Shining Lights",
    FR: "Coin des Grandes Recommandations & Lumières Brillantes",
    TR: "Büyük Tavsiyeler ve Parlak Işıklar Köşesi",
    FA: "رکن توصیه‌های بزرگ و چراغ‌های تابان رواق الماسی",
    DE: "Ecke der Großen Empfehlungen & Glänzenden Lichter",
    ES: "Rincón de grandes recomendaciones y luces brillantes",
    UR: "ادبی رواق کے اہم سفارشی کتب اور روشن لیمپ",
    ZH: "文学沙龙之巨大推荐与璀璨灯火",
    RU: "Уголок великих рекомендаций и сияющих огней"
  },
  "المواد والتصانيف الأكثر قراءة وتصفحاً بالمنبر": {
    EN: "Most Read & Visited Materials in the Forum",
    FR: "Matériel le plus lu et visité dans le forum",
    TR: "Forumda En Çok Okunan ve Ziyaret Edilen Materyaller",
    FA: "مطالب و دسته‌بندی‌های پرخواننده‌تر در انجمن",
    DE: "Meistgelesene & -besuchte Materialien im Forum",
    ES: "Los materiales y categorías más leídos del foro",
    UR: "فورم میں سب سے زیادہ پڑھے جانے والے مواد",
    ZH: "论坛中最受欢迎的材料与分类",
    RU: "Самые читаемые материалы форума"
  },
  "تبديل المستخدم": {
    EN: "Switch User",
    FR: "Changer d'utilisateur",
    TR: "Kullanıcı Değiştir",
    FA: "تعویض کاربر",
    DE: "Benutzer wechseln",
    ES: "Cambiar de usuario",
    UR: "صارف تبدیل کریں",
    ZH: "切换用户",
    RU: "Сменить пользователя"
  },
  "رواق الإدارة": {
    EN: "Admin Cockpit",
    FR: "Cockpit Admin",
    TR: "Yönetici Paneli",
    FA: "رواق مدیریت",
    DE: "Admin-Bereich",
    ES: "Panel de administración",
    UR: "انتظامی پینل",
    ZH: "管理中心",
    RU: "Панель администратора"
  },
  "الملف الشخصي": {
    EN: "Profile",
    FR: "Profil",
    TR: "Profil",
    FA: "پروفایل",
    DE: "Profil",
    ES: "Perfil",
    UR: "پروفائل",
    ZH: "个人资料",
    RU: "Профиль"
  },
  "بوابة السداد والشراء الآمن للكتب الرقمية": {
    EN: "Secure Payment Portal for E-Books",
    FR: "Portail de Paiement Sécurisé pour E-Books",
    TR: "E-Kitaplar için Güvenli Ödeme Portalı",
    FA: "درگاه پرداخت امن برای کتاب‌های دیجیتال",
    DE: "Sicheres Zahlungsportal für E-Books",
    ES: "Portal de pago seguro para libros digitales",
    UR: "ای بکس کے لیے محفوظ ادائیگی پورٹل",
    ZH: "电子书安全支付网关",
    RU: "Безопасная оплата электронных книг"
  },
  "مطالعة الصفحة": {
    EN: "Read Page",
    FR: "Lire la page",
    TR: "Sayfayı Oku",
    FA: "مطالعه صفحه",
    DE: "Seite lesen",
    ES: "Leer página",
    UR: "صفحہ پڑھیں",
    ZH: "阅读页面",
    RU: "Читать страницу"
  },
  "شراء": {
    EN: "Buy",
    FR: "Acheter",
    TR: "Satın Al",
    FA: "خرید",
    DE: "Kaufen",
    ES: "Comprar",
    UR: "خریدیں",
    ZH: "购买",
    RU: "Купить"
  },
  "حفظ بمفضلتي": {
    EN: "Save to Favorites",
    FR: "Ajouter aux favoris",
    TR: "Favorilere Ekle",
    FA: "ذخیره در علاقمندی‌ها",
    DE: "In Favoriten speichern",
    ES: "Añadir a favoritos",
    UR: "پسندیدہ میں محفوظ کریں",
    ZH: "保存到收藏夹",
    RU: "Сохранить в избранное"
  },
  "نسخ نص الأطروحة للذاكرة": {
    EN: "Copy thought text",
    FR: "Copier la pensée",
    TR: "Düşünceyi Kopyala",
    FA: "کپی متن اندیشه",
    DE: "Gedanke kopieren",
    ES: "Copiar pensamiento",
    UR: "افکار کاپی کریں",
    ZH: "复制思想内容",
    RU: "Скопировать мысль"
  },
  "السابق": {
    EN: "Previous",
    FR: "Précédent",
    TR: "Önceki",
    FA: "قبلی",
    DE: "Zurück",
    ES: "Anterior",
    UR: "پچھلا",
    ZH: "上一页",
    RU: "Предыдущий"
  },
  "التالي": {
    EN: "Next",
    FR: "Suivant",
    TR: "Sonraki",
    FA: "بعدی",
    DE: "Weiter",
    ES: "Siguiente",
    UR: "اگلا",
    ZH: "下一页",
    RU: "Следующий"
  },
  "تأملات": {
    EN: "Contemplations",
    FR: "Contemplations",
    TR: "Tefekkürler",
    FA: "تأملات",
    DE: "Kontemplationen",
    ES: "Contemplaciones",
    UR: "تاملات",
    ZH: "冥想",
    RU: "Размышления"
  },
  "إلهام": {
    EN: "Inspiration",
    FR: "Inspiration",
    TR: "İlham",
    FA: "الهام بخش",
    DE: "Inspiration",
    ES: "Inspiración",
    UR: "الہام",
    ZH: "灵感",
    RU: "Вдохновение"
  },
  "حكمة": {
    EN: "Wisdom",
    FR: "Sagesse",
    TR: "Hikmet",
    FA: "حکمت",
    DE: "Weisheit",
    ES: "Sabiduría",
    UR: "حکمت",
    ZH: "智慧",
    RU: "Мудрость"
  },
  "أدب": {
    EN: "Literature",
    FR: "Littérature",
    TR: "Edebiyat",
    FA: "ادبیات",
    DE: "Literatur",
    ES: "Literatura",
    UR: "ادب",
    ZH: "文学",
    RU: "Литература"
  },
  "فلسفة": {
    EN: "Philosophy",
    FR: "Philosophie",
    TR: "Felsefe",
    FA: "فلسفه",
    DE: "Philosophie",
    ES: "Filosofía",
    UR: "فلسفہ",
    ZH: "哲学",
    RU: "Философия"
  },
  "بوابة الرحالة والتصفح المفصل للمنتجات والأطروحات": {
    EN: "Traveler Gate & Detailed Browsing of Creations",
    FR: "Portail du Voyageur & Navigation Détaillée des Créations",
    TR: "Gezgin Kapısı ve Eserlerin Detaylı İncelemesi",
    FA: "دروازه مسافر و جستجوی دقیق موضوعات و آثار فکری",
    DE: "Reisenden-Portal & Detailliertes Durchsuchen",
    ES: "Portal del viajero y exploración detallada de productos y tesis",
    UR: "مسافروں کا پورٹل اور مصنوعات کا تفصیلی مطالعہ",
    ZH: "探索者门户与创作的详细浏览",
    RU: "Портал путешественника и детальный просмотр книг и статей"
  },
  "مربع البحث والتحري": {
    EN: "Unified Search Bar",
    FR: "Barre de recherche",
    TR: "Arama Kutusu",
    FA: "کادر جستجو و کاوش",
    DE: "Suchfeld",
    ES: "Buscador unificado",
    UR: "سرچ باکس",
    ZH: "搜索栏",
    RU: "Поисковая строка"
  },
  "ابحث بكتابة عنوان الكتاب، عنوان المقال، اسم المؤلف أو موضوع الخاطرة الوجدانية...": {
    EN: "Search by book title, article title, author or keyword...",
    FR: "Rechercher par titre de livre, d'article, auteur ou mots-clés...",
    TR: "Kitap, makale başlığı, yazar veya anahtar kelimeye göre ara...",
    FA: "جستجو با عنوان کتاب، عنوان مقاله، نام نویسنده یا موضوع...",
    DE: "Suchen Sie nach Buchtitel, Artikel, Autor oder Stichwort...",
    ES: "Buscar por título de libro, artículo, autor o palabra clave...",
    UR: "کتاب، مضمون، مصنف یا لفظ لکھ کر تلاش کریں...",
    ZH: "输入图书、文章名、作者或关键词搜索...",
    RU: "Поиск по названию книги, статьи, автору или ключевому слову..."
  },
  "تصفح كافة الأقسام": {
    EN: "Browse All Categories",
    FR: "Toutes les catégories",
    TR: "Tüm Kategoriler",
    FA: "تصفح تمام بخش‌ها",
    DE: "Alle Kategorien",
    ES: "Ver todas las categorías",
    UR: "تمام زمرہ جات دیکھیں",
    ZH: "浏览所有分类",
    RU: "Все категории"
  },
  "تذوق درر المعارف والخواطر الوجدانية والكتب الرقمية": {
    EN: "Savor precious knowledge, spiritual thoughts and e-books",
    FR: "Savourer connaissances précieuses, pensées spirituelles et e-books",
    TR: "Manevi düşüncelerin ve e-kitapların tadını çıkarın",
    FA: "چشیدن لذت معارف، درر، خواطر و کتب دیجیتال",
    DE: "Köstliche Weisheit, spirituelle Gedanken und E-Books genießen",
    ES: "Disfrute de los pensamientos espirituales y los libros digitales",
    UR: "علم و دانش، روحانی خیالات اور ای بکس سے مستفید ہوں",
    ZH: "品味珍贵的知识、心灵感想与数字图书",
    RU: "Вкусите драгоценные знания, духовные мысли и электронные книги"
  },
  "القسم": {
    EN: "Category",
    FR: "Catégorie",
    TR: "Kategori",
    FA: "بخش",
    DE: "Kategorie",
    ES: "Categoría",
    UR: "زمرہ",
    ZH: "分类",
    RU: "Категория"
  },
  "المؤلف": {
    EN: "Author",
    FR: "Auteur",
    TR: "Yazar",
    FA: "نویسنده",
    DE: "Autor",
    ES: "Autor",
    UR: "مصنف",
    ZH: "作者",
    RU: "Автор"
  },
  "الرئيسية والديوان": {
    EN: "Home & Bureau",
    FR: "Accueil & Cabinet",
    TR: "Ana Sayfa ve Divân",
    FA: "کابینه من و صفحه اصلی",
    DE: "Startseite & Kabinett",
    ES: "Inicio y Diván",
    UR: "ہوم اور دیوان",
    ZH: "主页与文苑",
    RU: "Главная и Кабинет"
  },
  "حجم الخط والصفحة": {
    EN: "Font & Frame Scale",
    FR: "Taille de l'écran",
    TR: "Ekran Boyutu",
    FA: "اندازه متن و صفحه",
    DE: "Schriftgröße",
    ES: "Tamaño de fuente",
    UR: "فونٹ اور اسکیل",
    ZH: "字体与页面缩放",
    RU: "Размер шрифта"
  },
  "تغيير سمات الفضاء والألوان": {
    EN: "Toggle Dark/Light Mode",
    FR: "Mode Sombre/Clair",
    TR: "Aydınlık/Karanlık Mod",
    FA: "تغییر تم تاریک/روشن",
    DE: "Dunkel-/Hellmodus",
    ES: "Modo Oscuro/Claro",
    UR: "ڈارک/لائٹ موڈ",
    ZH: "切换深色/浅色模式",
    RU: "Тёмный/Светлый режим"
  },
  "خروج بأمان للبداية": {
    EN: "Log Out Safely",
    FR: "Se déconnecter",
    TR: "Güvenli Çıkış",
    FA: "خروج ایمن",
    DE: "Abmelden",
    ES: "Cerrar sesión",
    UR: "محفوظ لاگ آؤٹ",
    ZH: "安全退出",
    RU: "Безопасный выход"
  },
  "تصفحت خمس خواطر ملهمة! اضغط لقراءة المزيد": {
    EN: "You browsed five inspiring thoughts! Click to read more",
    FR: "Vous avez lu cinq pensées inspirantes! Cliquez pour en voir plus",
    TR: "Beş ilham verici düşünceyi incelediniz! Dahası için tıklayın",
    FA: "شما ۵ اندیشه الهام‌بخش را خوانده‌اید! جهت دسترسی بیشتر کلیک کنید",
    DE: "Sie haben fünf inspirierende Gedanken gelesen! Mehr anzeigen",
    ES: "¡Has visto cinco pensamientos inspiradores! Haz clic para leer más",
    UR: "آپ نے پانچ الہامی خیالات پڑھے ہیں! مزید کے لیے کلیک کریں",
    ZH: "你已经浏览了五条启发性思想！点击阅读更多",
    RU: "Вы прочитали 5 вдохновляющих мыслей! Нажмите, чтобы узнать больше"
  },
  "رواق الحكمة الوجدانية والتدبر": {
    EN: "Hall of Wisdom & Meditation",
    FR: "Salon de Sagesse & Méditation",
    TR: "Manevi Hikmet ve Tefekkür Salonu",
    FA: "تالار حکمت وجدانی و تدبر",
    DE: "Halle der Weisheit & Kontemplation",
    ES: "Salón de la sabiduría y meditación",
    UR: "روحانی حکمت اور تدبر کی گیلری",
    ZH: "心灵智慧与沉思之苑",
    RU: "Зал духовной мудрости и созерцания"
  },
  "انضم إلينا في جولة أدبية كاملة لمداد النور والفهم العذب.": {
    EN: "Join us in an full literary journey of light and graceful expression.",
    FR: "Rejoignez-nous dans un voyage littéraire complet de lumière.",
    TR: "Huzurlu ve aydınlık dolu edebiyat yolculuğumuza katılın.",
    FA: "به ما در یک سفر کامل ادبی مملو از روشنایی بپیوندید.",
    DE: "Begleiten Sie uns auf einer literarischen Reise des Lichts.",
    ES: "Únete a un viaje literario lleno de luz y sabiduría.",
    UR: "روشنی اور عذب فہم کے ایک خوبصورت ادبی سفر میں ہمارے ساتھ شامل ہوں۔",
    ZH: "加入我们，开启一场充盈光芒与优雅表达的完整文学之旅。",
    RU: "Присоединяйтесь к нам в полном литературном путешествии света."
  },
  "تأملات وجدانية حرة": {
    EN: "Free Spiritual Reflections",
    FR: "Réflexions spirituelles libres",
    TR: "Özgür Manevi Ruh Düşünceleri",
    FA: "تاملات وجدانی آزاد",
    DE: "Freie spirituelle Reflexionen",
    ES: "Reflexiones espirituales libres",
    UR: "آزاد وجدانی تاملات",
    ZH: "自由心灵感悟",
    RU: "Свободные духовные размышления"
  },
  "أطروحة وجدانية حرة": {
    EN: "Spiritual Reflection",
    FR: "Réflexion Spirituelle",
    TR: "Hür Düşünce",
    FA: "انديشه وجدانی آزاد",
    DE: "Freier Gedanke",
    ES: "Reflexión espiritual libre",
    UR: "آزاد وجدانی نظریہ",
    ZH: "心灵论文",
    RU: "Духовное суждение"
  },
  "بقلم المبدع:": {
    EN: "By our creator:",
    FR: "Par le créateur:",
    TR: "Yazar:",
    FA: "به قلم مقتدر:",
    DE: "Vom Schöpfer:",
    ES: "Por el creador:",
    UR: "بذریعہ تخلیق کار:",
    ZH: "创作者：",
    RU: "Автор:"
  },
  "خواطر السكينة": {
    EN: "Thoughts of Serenity",
    FR: "Pensées de Sérénité",
    TR: "Huzur Düşünceleri",
    FA: "خواطر آرامش و سکینه",
    DE: "Gedanken der Gelassenheit",
    ES: "Pensamientos de serenidad",
    UR: "سکینت کے خیالات",
    ZH: "宁静思绪",
    RU: "Мысли об умиротворении"
  },
  "تم توثيق تقييمك ورأيك السديد بنجاح! ⭐": {
    EN: "Your rating and wise opinion were registered successfully! ⭐",
    FR: "Votre vote et opinion ont été enregistrés avec succès! ⭐",
    TR: "Değerlendirmeniz başarıyla kaydedildi! ⭐",
    FA: "امتیاز و نظر ارزشمند شما با موفقیت ثبت شد! ⭐",
    DE: "Ihre Bewertung wurde erfolgreich registriert! ⭐",
    ES: "¡Tu valoración y sabia opinión han sido registradas! ⭐",
    UR: "آپ کی درجہ بندی اور رائے کامیابی سے درج ہو گئی! ⭐",
    ZH: "你的评分与睿智见解已提交成功！ ⭐",
    RU: "Ваша оценка и мудрое мнение успешно учтены! ⭐"
  },
  "لقد تفاعلت مع هذه الخاطرة مسبقاً ✨": {
    EN: "You have already interacted with this thought ✨",
    FR: "Vous avez déjà aimé cette pensée ✨",
    TR: "Bu düşünceyle zaten etkileşime girdiniz ✨",
    FA: "قبلاً با این اندیشه تعامل داشته‌اید ✨",
    DE: "Sie haben bereits mit diesem Gedanken interagiert ✨",
    ES: "Ya interactuaste con este pensamiento ✨",
    UR: "آپ پہلے ہی اس خیال پر تعامل کر چکے ہیں ✨",
    ZH: "你已经点赞过这条感想了 ✨",
    RU: "Вы уже отреагировали на эту мысль ✨"
  },
  "شكراً لدعمك خواطر الدرعي الوجدانية! ❤️": {
    EN: "Thank you for supporting Al-Dir'i reflections! ❤️",
    FR: "Merci de soutenir les réflexions de Al-Dir'i! ❤️",
    TR: "Al-Dir'i manevi düşüncelerini desteklediğiniz için teşekkürler! ❤️",
    FA: "از حمایت شما از خواطر وجدانی الدرعی سپاسگزاریم! ❤️",
    DE: "Danke, dass Sie Al-Dir'i-Gedanken unterstützen! ❤️",
    ES: "¡Gracias por apoyar los pensamientos de Al-Dir'i! ❤️",
    UR: "الدرعی کی وجدانی افکار کی حمایت کے لیے شکریہ! ❤️",
    ZH: "感谢您支持阿勒第里的心灵感悟！ ❤️",
    RU: "Спасибо за поддержку духовных мыслей Аль-Дири! ❤️"
  },
  "شكرًا لتسجيل إعجابك بالمقال الفكري المميز! 👍": {
    EN: "Thank you for liking this outstanding article! 👍",
    FR: "Merci d'avoir aimé cet excellent article! 👍",
    TR: "Bu seçkin makaleyi beğendiğiniz için teşekkürler! 👍",
    FA: "ممنون از پسندیدن این مقاله فکری ارزشمند! 👍",
    DE: "Danke, dass Ihnen dieser intellektuelle Artikel gefällt! 👍",
    ES: "¡Gracias por indicar que te gusta este artículo! 👍",
    UR: "بہترین فکری مضمون کو پسند کرنے کے لیے شکریہ! 👍",
    ZH: "感谢金赞此精彩学术文章！ 👍",
    RU: "Благодарим за лайк к этой прекрасной статье! 👍"
  },
  "نسخ نص الأطروحة بنجاح! 📋": {
    EN: "Thought text copied successfully! 📋",
    FR: "Texte copié avec succès! 📋",
    TR: "Düşünce metni başarıyla kopyalandı! 📋",
    FA: "متن اندیشه با موفقیت کپی شد! 📋",
    DE: "Gedankentext erfolgreich kopiert! 📋",
    ES: "¡Texto copiado con éxito! 📋",
    UR: "خیال کا متن کامیابی سے کاپی ہو گیا! 📋",
    ZH: "思想内容复制成功！ 📋",
    RU: "Текст духовного суждения скопирован! 📋"
  },
  "أطروحة فكرية": {
    EN: "Intellectual Thesis",
    FR: "Thèse Intellectuelle",
    TR: "Fikri Tez",
    FA: "اطروحه فکری",
    DE: "Intellektuelle These",
    ES: "Tesis intelectual",
    UR: "فکری نظریہ",
    ZH: "学术论点",
    RU: "Интеллектуальный тезис"
  },
  "مقالة وعي": {
    EN: "Awareness Article",
    FR: "Article d'Éveil",
    TR: "Farkındalık Makalesi",
    FA: "مقاله آگاهی",
    DE: "Bewusstseinsartikel",
    ES: "Artículo de conciencia",
    UR: "شعور و آگہی کا مضمون",
    ZH: "思想觉悟文章",
    RU: "Статья об осознанности"
  },
  "ديوان الخواطر والدرر الوجدانية الكامل": {
    EN: "Complete Divan of Emotional Thoughts & Pearls",
    FR: "Diwan Complet de Pensées et Perles Spirituelles",
    TR: "Tüm Manevi Düşünceler ve İnciler Divânı",
    FA: "دیوان کامل خواطر وجدانی و دررهای معنوی",
    DE: "Vollständiges Diwan spiritueller Gedanken & Perlen",
    ES: "Diván completo de pensamientos y perlas espirituales",
    UR: "جذباتی افکار اور دانائی کے پر اسرار موتیوں کا مکمل دیوان",
    ZH: "心灵感想与智慧珍珠之完整诗集",
    RU: "Полный диван духовных размышлений и жемчужин мудрости"
  },
  "ابحث في خواطر السكينة والدرر الوجدانية...": {
    EN: "Search in thoughts of serenity and spiritual pearls...",
    FR: "Rechercher dans les pensées de sérénité...",
    TR: "Huzur düşünceleri ve manevi incilerde ara...",
    FA: "جستجو در خواطر آرامش و دررهای وجدانی...",
    DE: "Suchen Sie in Gedanken der Gelassenheit...",
    ES: "Buscar en pensamientos de serenidad y perlas...",
    UR: "سکینت اور وجدانی افکار میں تلاش کریں...",
    ZH: "在宁静思绪与心灵珍珠中搜索...",
    RU: "Поиск в мыслях о мире и жемчужинах мудрости..."
  },
  "أغلق اللوحة": {
    EN: "Close Panel",
    FR: "Fermer",
    TR: "Kapat",
    FA: "بستن صفحه",
    DE: "Schließen",
    ES: "Cerrar",
    UR: "پینل بند کریں",
    ZH: "关闭窗口",
    RU: "Закрыть"
  },
  "الرواق الفكري والوجداني للدرعي": {
    EN: "Al-Dir'i Intellectual & Spiritual Salon",
    FR: "Salon Intellectuel & Spirituel Al-Dir'i",
    TR: "Al-Dir'i Entelektüel ve Manevi Salonu",
    FA: "رواق فکری و وجدانی الدرعی",
    DE: "Al-Dir'i Intellektueller & Spiritueller Salon",
    ES: "Salón intelectual y espiritual de Al-Dir'i",
    UR: "الدرعی کا فکری اور وجدانی قلعہ",
    ZH: "阿勒第里学术与灵性展示空间",
    RU: "Интеллектуальный и духовный салон Аль-Дири"
  }
};

// Dynamic Translations for Books, Articles and Thoughts
export const TEXT_CONTENT_TRANSLATIONS: Record<string, Record<string, string>> = {
  // Book & Article Titles
  "العقيدة الواسطية": {
    EN: "The Wasitiyyah Creed (Al-Aqeedah Al-Wasitiyyah)",
    FR: "Le Credo de Wasitiyyah (Al-Aqeedah Al-Wasitiyyah)",
    TR: "Vâsıtıyye Akidesi (العقيدة الواسطية)",
    FA: "العقیده الواسطیه (اعتقادات اهل سنت)",
    DE: "Das Wasitiyyah-Glaubensbekenntnis",
    ES: "El credo de la Wasitiyyah",
    UR: "العقیدہ الواسطیہ (اہل سنت کا عقیدہ)",
    ZH: "瓦西提亚教义",
    RU: "Акида аль-Васития (Ибн Таймия)"
  },
  "شيخ الإسلام ابن تيمية": {
    EN: "Sheikh al-Islam Ibn Taymiyyah",
    FR: "Cheikh al-Islam Ibn Taymiyyah",
    TR: "Şeyhulislâm İbn Teymiyye",
    FA: "شیخ‌الاسلام ابن تیمیه",
    DE: "Scheich al-Islam Ibn Taymiyyah",
    ES: "Sheij al-Islam Ibn Taymiyyah",
    UR: "شیخ الاسلام ابن تیمیہ",
    ZH: "伊本·泰米叶",
    RU: "Шейх уль-Ислам Ибн Таймийя"
  },
  "أبو حاتم الدرعي": {
    EN: "Abu Hatim Al-Dir'i",
    FA: "ابو حاتم الدرعی",
    UR: "ابو حاتم الدرعی",
    ZH: "阿布·哈蒂姆·阿勒第里",
    RU: "Абу Хатим Аль-Дири"
  },
  "عقيدة وتوحيد": {
    EN: "Creed & Monotheism",
    FR: "Dogme & Unicité",
    TR: "Akide ve Tevhid",
    FA: "عقیده و توحید",
    DE: "Glauben & Monotheismus",
    ES: "Credo y Monoteísmo",
    UR: "عقیدہ اور توحید",
    ZH: "教义与一神论",
    RU: "Вероубеждение и Таухид"
  },
  "متن العقيدة الواسطية الشهير لشيخ الإسلام ابن تيمية رحمه الله، وعناية المحرر أبو حاتم الدرعي، يُعنى بتقرير عقيدة أهل السنة والجماعة بأدلة محكمة من الكتاب والسنة.": {
    EN: "The famous creedal text written by Sheikh al-Islam Ibn Taymiyyah (may Allah have mercy on him), edited and cataloged by Abu Hatim Al-Dir'i. Focuses on outlining the beliefs of Ahlus-Sunnah wal-Jama'ah with robust evidence from the Quran and Sunnah.",
    FR: "Le célèbre dogme rédigé par Cheikh al-Islam Ibn Taymiyyah, édité par Abu Hatim Al-Dir'i. Il énonce les préceptes d'Ahlus-Sunnah wal-Jama'ah selon le Livre et la Sunnah.",
    TR: "Şeyhulislâm İbn Teymiyye'nin meşhur Vâsıtıyye Akidesi metni, editör Ebu Hatim Al-Dir'i'nin titiz çalışmasıyla Ehli Sünnet ve'l Cemaat inancını Kitap ve Sünnet'ten delillerle açıklar.",
    FA: "متن معروف العقيدة الواسطية نوشته فرانام شیخ‌الاسلام ابن تیمیه رحمه الله به کوشش ابوحا‌تم الدرعی، تبیین‌کننده عقاید اهل سنت و جماعت با ادله محکم قرآنی و نبوی.",
    DE: "Das berühmte Glaubensbekenntnis von Scheich al-Islam Ibn Taymiyyah, herausgegeben von Abu Hatim Al-Dir'i. Behandelt das Bekenntnis der Ahlus-Sunnah wal-Jama'ah mit Belegen aus Buch und Sunnah.",
    ES: "El famoso texto doctrinal de Sheij al-Islam Ibn Taymiyyah, editado por Abu Hatim Al-Dir'i. Aborda las creencias de Ahlus-Sunnah wal-Jama'ah.",
    UR: "شیخ الاسلام ابن تیمیہ رحمہ اللہ کا مشہور متن العقیدہ الواسطیہ، ایڈیٹر ابو حاتم الدرعی کی خدمت میں، جو کتاب و سنت کے مستند دلائل کے ساتھ اہل سنت و الجماعت کے عقیدے کو پیش کرتا ہے۔",
    ZH: "由伊斯兰谢赫·伊本·泰米叶所著、阿布·哈蒂姆·阿勒第里校勘的著名瓦西提亚教义原文，旨在以经训确凿证据论证逊尼派大众的信仰。",
    RU: "Знаменитый текст по вероубеждению Шейха уль-Ислама Ибн Таймии (да помилует его Аллах), отредактированный Абу Хатимом Аль-Дири. Систематизирует убеждения Ахлю-Сунна валь-Джама'а."
  },
  "فلسفة السحاب والوجود": {
    EN: "The Philosophy of Clouds and Existence",
    FR: "La Philosophie des Nuages et de l'Existence",
    TR: "Bulutların ve Varlığın Felsefesi",
    FA: "فلسفه ابرها و وجود",
    DE: "Die Philosophie der Wolken und des Daseins",
    ES: "La filosofía de las nubes y la existencia",
    UR: "بادلوں اور وجود کا فلسفہ",
    ZH: "云彩与存在的哲学",
    RU: "Философия облаков и бытия"
  },
  "أديب الدرعي": {
    EN: "Adib Al-Dir'i",
    FR: "Adib Al-Dir'i",
    TR: "Adib Al-Dir'i",
    FA: "ادیب الدرعی",
    DE: "Adib Al-Dir'i",
    ES: "Adib Al-Dir'i",
    UR: "ادیب الدرعی",
    ZH: "阿迪卜·阿勒第里",
    RU: "Адиб Аль-Дири"
  },
  "فلسفة وتأمل": {
    EN: "Philosophy & Reflects",
    FR: "Philosophie & Méditation",
    TR: "Felsefe ve Tefekkür",
    FA: "فلسفه و تامل",
    DE: "Philosophie & Reflexion",
    ES: "Filosofía y meditación",
    UR: "فلسفہ اور تامل",
    ZH: "哲学与冥想",
    RU: "Философия и созерцание"
  },
  "كتاب يستكشف العلاقة الرمزية بين السحب المتحركة في كبد السماء وحياة الإنسان الرحالة، متطرقاً إلى السلام الداخلي وقبول التغيير.": {
    EN: "A book that explores the structural symbolic relationship between cloud dynamics and nomadic human life, highlighting mechanisms of internal peace and accepting change.",
    FR: "Un livre explorant la relation symbolique entre les nuages en mouvement et la vie nomade de l'homme, abordant la paix intérieure et le changement.",
    TR: "Gökyüzündeki hareketli bulutlar ile göçebe insan hayatı arasındaki sembolik ilişkiyi araştıran, iç huzura ve değişimi kabul etmeye değinen bir kitap.",
    FA: "کتابی در کشف رابطه نمادین میان حرکت ابرها در دل آسمان و زندگی سفرگونه انسان، با گریز به آرامش درونی و پذیرش دگرگونی‌ها.",
    DE: "Ein Buch, das die symbolische Beziehung zwischen den wandernden Wolken am Himmel und dem nomadischen Leben des Menschen untersucht.",
    ES: "Un libro que explora la relación simbólica entre las nubes en el cielo y la vida nómada del ser humano, abordando la paz interior.",
    UR: "ایک ایسی کتاب جو آسمان پر اڑتے بادلوں اور انسانی زندگی کے مسافرانہ پہلوؤں کے مابین علامتی تعلق کو تلاش کرتی ہے، جس میں اندرونی سکون اور قبولیت تبدیلی پر بحث کی گئی ہے۔",
    ZH: "本书探索天空漂浮的云彩与人类漂泊生活之间的象征关系，触及内心平静与接纳变化的智慧。",
    RU: "Книга, исследующая символическую связь между плывущими по небу облаками и кочевой жизнью человека, затрагивая темы внутреннего покоя и принятия перемен."
  },
  "رحلتنا نحو الضياء": {
    EN: "Our Journey Towards Light",
    FR: "Notre Voyage vers la Lumière",
    TR: "Işığa Doğru Yolculuğumuz",
    FA: "سفر ما به سوی روشنایی",
    DE: "Unsere Reise zum Licht",
    ES: "Nuestro viaje hacia la luz",
    UR: "ہماری روشنی کی طرف اڑان",
    ZH: "奔向光明之旅",
    RU: "Наш путь к свету"
  },
  "عبدالله الدرعي": {
    EN: "Abdullah Al-Dir'i",
    FA: "عبدالله الدرعی",
    UR: "عبداللہ الدرعی",
    ZH: "阿卜杜拉·阿勒第里",
    RU: "Абдулла Аль-Дири"
  },
  "تطوير الذات والروح": {
    EN: "Spiritual & Self Development",
    FR: "Développement Personnel & Spirituel",
    TR: "Kişisel ve Manevi Gelişim",
    FA: "توسعه فردی و روح",
    DE: "Selbst- & spirituelle Entwicklung",
    ES: "Desarrollo personal y espiritual",
    UR: "ذاتی اور روحانی ارتقاء",
    ZH: "心灵长进与个人成长",
    RU: "Развитие личности и духа"
  },
  "دليل عملي ووجداني يهدف إلى ارتقاء الفرد بروحه وفكره عبر تنظيم عادات الذهن والتأمل والتصالح مع الذات لتجاوز عثرات الحياة المعاصرة.": {
    EN: "A practical and emotional guide aimed at achieving spiritual elevation through mindful habit structures, meditation, and inner peace in the face of modern distractions.",
    FR: "Un guide pratique visant à élever l'esprit et la pensée en organisant les habitudes mentales, la méditation et la réconciliation avec soi-même.",
    TR: "Zihinsel alışkanlıkları, meditasyonu düzenleyerek ve modern yaşamın zorluklarını aşmak için kendini kabullenmeyi sağlayarak bireyin ruhunu ve düşüncesini yükseltmeyi amaçlayan pratik rehber.",
    FA: "رهنمودی کاربردی و معنوی با هدف بالندگی روح و اندیشه از طریق نظم‌بخشی به عادت‌های ذهن، تامل و مصالحه با خود برای گذشتن از سختی‌های مدرنیته.",
    DE: "Ein praktischer und spiritueller Leitfaden, der darauf abzielt, die Seele und das Denken des Einzelnen durch die Organisation von Geistesgewohnheiten zu stärken.",
    ES: "Guía práctica y espiritual diseñada para elevar la mente organizando los hábitos de pensamiento, la meditación y el perdón a uno mismo.",
    UR: "ایک عملی اور روحانی کتاب جس کا مقصد ذہنی عادات، مراقبہ اور اپنی ذات کے ساتھ مصالحت کے ذریعے فرد کے فکری و روحانی مرتبے کو بلند کرنا ہے تاکہ جدید زندگی کی مشکلات پر قابو پایا جا سکے۔",
    ZH: "一本实用且富有灵性的指南，旨在通过调整思维习惯、沉思和自我和解，帮助个体升华灵魂与思想，超脱现代生活的纷扰。",
    RU: "Практическое и духовное руководство, направленное на возвышение разума и духа человека через упорядочивание ментальных привычек, созерцание и примирение с собой."
  },
  "مخطوطات الروح وتاريخ الحكمة": {
    EN: "Spirit Manuscripts and History of Wisdom",
    FR: "Manuscrits de l'Âme & Histoire de la Sagesse",
    TR: "Ruhun Elyazmaları ve Hikmetin Tarihi",
    FA: "نسخه‌های خطی روح و تاریخ حکمت",
    DE: "Manuskripte der Seele & Geschichte der Weisheit",
    ES: "Manuscritos del alma e historia de la sabiduría",
    UR: "روح کی دستاویزات اور حکمت کی تاریخ",
    ZH: "心灵的手稿与智慧历史",
    RU: "Рукописи души и история мудрости"
  },
  "د. مريم الدرعي": {
    EN: "Dr. Maryam Al-Dir'i",
    FR: "Dr. Maryam Al-Dir'i",
    TR: "Dr. Meryem Al-Dir'i",
    FA: "دکتر مریم الدرعی",
    DE: "Dr. Maryam Al-Dir'i",
    ES: "Dra. Maryam Al-Dir'i",
    UR: "ڈاکٹر مریم الدرعی",
    ZH: "玛丽亚姆·阿勒第里 博士",
    RU: "Д-р Марьям Аль-Дири"
  },
  "تاريخ وأدب": {
    EN: "History & Literature",
    FR: "Histoire & Littérature",
    TR: "Tarih ve Edebiyat",
    FA: "تاریخ و ادبیات",
    DE: "Geschichte & Literatur",
    ES: "Historia y Literatura",
    UR: "تاریخ اور ادب",
    ZH: "历史与文学",
    RU: "История и литература"
  },
  "جولة تاريخية ماتعة بين أهم المكتبات في حضارتنا الإسلامية والإنسانية، مسلطة الضوء على قيمة الكلمة وتأثيرها على مر العصور والقرون المسطرة.": {
    EN: "An enjoyable historical tour around crucial library hubs of Islamic and global civilizations, highlighting the infinite power of words across recorded history.",
    FR: "Un superbe voyage historique parmi les plus grandes bibliothèques islamiques et humaines, mettant en lumière la valeur des écrits à travers les âges.",
    TR: "İslam ve insanlık medeniyetimizin en önemli kütüphaneleri arasında keyifli bir tarihi tur; kelimenin değerini ve çağlar boyunca etkisini vurguluyor.",
    FA: "سیری دلپذیر در پهنای تاریخ و میان کتابخانه‌های کلیدی تمدن خودمان و فرهنگ بشری، با تاکید بر ارزش واژه‌ها و مکتوبات در گذار سده‌ها.",
    DE: "Ein unterhaltsamer historischer Rundgang durch die wichtigsten Bibliotheken unserer islamischen und menschlichen Zivilisation.",
    ES: "Un recorrido histórico agradable por las bibliotecas más importantes de nuestra civilización islámica y humana, destacando la importancia del lenguaje.",
    UR: "ہماری اسلامی اور عالمی تہذیب کے عظیم ترین کتب خانوں کا ایک تاریخی اور دلکش سفر، جس میں صدیوں کے دوران قلم اور الفاظ کی قدر و قیمت پر روشنی ڈالی گئی ہے۔",
    ZH: "领略伊斯兰及人类文明中几大核心图书馆，在这场美妙的历史旅程中，探索并感受文字贯穿千百年来震古烁今的价值与力量。",
    RU: "Увлекательный исторический обзор ключевых библиотек нашей исламской и мировой цивилизации, проливающий свет на ценность и силу слова сквозь века."
  },
  // Articles
  "أهمية القراءة الهادئة في عصر التشتت الرقمي المفرط": {
    EN: "Importance of Quiet Reading in an Age of Hyper Digital Distraction",
    FR: "L'importance de la lecture calme à l'ère de l'extrême distraction",
    TR: "Aşırı Dijital Dikkat Dağınıklığı Çağında Sakin Okumanın Önemi",
    FA: "اهمیت مطالعه آرام در عصر آشفتگی مفرط دیجیتال",
    DE: "Wichtigkeit des ruhigen Lesens im Zeitalter digitaler Ablenkung",
    ES: "La importancia de la lectura silenciosa ante la distracción digital",
    UR: "شدید ترین ڈیجیٹل انتشار کے دور میں پرسکون مطالعہ کی اہمیت",
    ZH: "在过度数字分心时代安静阅读的重要性",
    RU: "Важность спокойного чтения в эпоху чрезмерного цифрового хаоса"
  },
  "وعي فكري": {
    EN: "Intellectual Awareness",
    FR: "Conscience Intellectuelle",
    TR: "Entelektüel Farkındalık",
    FA: "بینش فکری",
    DE: "Intellektuelles Bewusstsein",
    ES: "Conciencia intelectual",
    UR: "فکری بیداری",
    ZH: "思想觉悟",
    RU: "Интеллектуальное просвещение"
  },
  "تأملات تحت الغمام: كيف تلهم الطبيعة الأقلام العربية؟": {
    EN: "Reflections Under the Clouds: How Nature Inspires Arabic Writing?",
    FR: "Méditations sous les nuages: Comment la nature inspire-t-elle les écrits?",
    TR: "Bulutların Altında Tefekkür: Doğa Arap Kalemlerine Nasıl İlham Veriyor?",
    FA: "تاملات در زیر ابرها: چگونه طبیعت به قلم‌های عربی الهام می‌بخشد؟",
    DE: "Meditationen unter Wolken: Wie die Natur das Schreiben inspiriert",
    ES: "Meditaciones bajo las nubes: inspiración para el escritor",
    UR: "بادلوں کی چھاؤں میں تامل: فطرت کس طرح عرب قلموں کو مہمیز کرتی ہے؟",
    ZH: "云下漫想：自然如何启迪阿拉伯文学？",
    RU: "Размышления под облаками: как природа вдохновляет арабских авторов?"
  },
  "أدب وبيئة": {
    EN: "Literature & Nature",
    FR: "Littérature & Environnement",
    TR: "Edebiyat ve Çevre",
    FA: "ادبیات و طبیعت",
    DE: "Literatur & Umwelt",
    ES: "Literatura y Medio Ambiente",
    UR: "ادب اور ماحول",
    ZH: "文学与环境",
    RU: "Литература и природа"
  },
  "أدب الخاطرة: الفارق بين الصرخة الوجدانية والمقال الفلسفي المنظم": {
    EN: "The Art of the Thought: Cry of the Soul vs Organized Philosophical Article",
    FR: "L'Art de la Pensée: Cri de l'âme vs Article Philosophique Structuré",
    TR: "Düşünce Edebiyatı: Ruhun Haykırışı ile Sistemli Felsefi Makale Farkı",
    FA: "ادبیات خاطره‌نویسی: تفاوت میان فریاد وجدانی و مقاله فلسفی منظم",
    DE: "Die Kunst des Gedankens: Seele vs. strukturierter philosophischer Aufsatz",
    ES: "El arte del pensamiento: del suspiro emocional al ensayo filosófico",
    UR: "صنف خاطرہ: وجدانی پکار اور باقاعدہ فکری مضمون میں فرق",
    ZH: "感悟文学：情感的呼喊与有组织哲学论文的差别",
    RU: "Искусство мысли: отличие эмоционального крика от структурированной статьи"
  },
  "أدب ونقد": {
    EN: "Literature & Criticism",
    FR: "Littérature & Critique",
    TR: "Edebiyat ve Eleştiri",
    FA: "ادبیات و نقد",
    DE: "Literatur & Kritik",
    ES: "Literatura y Crítica",
    UR: "ادب اور تنقید",
    ZH: "文学与评论",
    RU: "Литература и критика"
  },
  "مها الدرعي": {
    EN: "Maha Al-Dir'i",
    FA: "مها الدرعی",
    UR: "مہا الدرعی",
    ZH: "玛哈·阿勒第里",
    RU: "Маха Аль-Дири"
  },
  "سارة الدرعي": {
    EN: "Sara Al-Dir'i",
    FA: "ساره الدرعی",
    UR: "سارہ الدرعی",
    ZH: "萨拉·阿勒第里",
    RU: "Сара Аль-Дири"
  },
  "فيلسوف الدرعي": {
    EN: "Philosopher Al-Dir'i",
    FR: "Le Philosophe d'Al-Dir'i",
    TR: "Filozof Al-Dir'i",
    FA: "فیلسوف الدرعی",
    DE: "Philosoph Al-Dir'i",
    ES: "Filósofo Al-Dir'i",
    UR: "فلسفی الدرعی",
    ZH: "哲人·阿勒第里",
    RU: "Философ Аль-Дири"
  }
};

export const THOUGHTS_CONTENT_TRANSLATIONS: Record<string, DataTypeTranslations> = {
  "t-1": {
    title: {
      EN: "Light of Wisdom & Serenity",
      FR: "Lumière de Sagesse & Sérénité",
      TR: "Hikmet ve Saflık Işığı",
      FA: "نور حکمت و صفا",
      DE: "Licht der Weisheit & Reinheit",
      ES: "Luz de la sabiduría y serenidad",
      UR: "دانائی اور صفائے باطن کی روشنی",
      ZH: "智慧与纯洁之光",
      RU: "Свет мудрости и душевной чистоты"
    },
    content: {
      EN: "Libraries are not just rows of shelves, but time gateways that transport us between the minds of philosophers and the souls of poets without leaving our seats.",
      FR: "Les bibliothèques ne sont pas que des étagères alignées, mais des portails temporels qui nous font voyager entre les esprits de philosophes et de poètes.",
      TR: "Kütüphaneler sadece yan yana dizilmiş raflardan ibaret değildir; yerimizden bile kalkmadan bizi filozofların zihinleri ile şairlerin ruhları arasında dolaştıran zaman kapılarıdır.",
      FA: "کتابخانه‌ها صرفاً قفسه‌های ردیف‌شده نیستند، بلکه دروازه‌هایی زمانی هستند که ما را بدون کوچک‌ترین نیازی به ترک صندلی‌امان، میان ذهن فلاسفه و روح شاعران به پرواز درمی‌آورند.",
      DE: "Bibliotheken sind nicht nur Reihen von Regalen, sondern Zeittore, die uns zwischen den Geistern von Philosophen und den Seelen von Dichtern transportieren.",
      ES: "Las bibliotecas no son solo estantes alineados, sino portales temporales que nos llevan de viaje por las mentes de filósofos y las almas de poetas.",
      UR: "لائبریریاں محض ترتیب سے سجی قطاریں نہیں ہیں، بلکہ یہ وہ زمانی دروازے ہیں جو ہمیں اپنی نشست چھوڑے بغیر فلاسفہ کے دماغوں اور شعراء کی روحوں کے درمیاں لے جاتے ہیں۔",
      ZH: "图书馆不仅是陈列书架的场所，更是一扇扇时光之门，无需离开我们的座位，便能带领我们穿梭于哲人们的思绪和诗人们的灵魂之间。",
      RU: "Библиотеки – это не просто ряды полок, а временные порталы, переносящие нас в умы философов и души поэтов без необходимости покидать свои кресла."
    }
  },
  "t-2": {
    title: {
      EN: "Flower of the Soul & Paper",
      FR: "Fleur de l'Âme & du Papier",
      TR: "Ruhun ve Kâğıdın Çiçeği",
      FA: "گلبرگ روح و ورق",
      DE: "Blume der Seele & des Papiers",
      ES: "Flor del alma y el papel",
      UR: "روح اور کاغذ کا پھول",
      ZH: "灵魂与书页之花",
      RU: "Цветок души и бумаги"
    },
    content: {
      EN: "Every book you read plants a unique intellectual flower in your soul, watered by your imagination and blooming in your daily words and actions.",
      FR: "Chaque livre lu plante une fleur intellectuelle unique dans votre âme, arrosée par votre imagination et s'épanouissant dans vos paroles et actions.",
      TR: "Okuduğunuz her kitap ruhunuza eşsiz bir entelektüel çiçek eker, hayal gücünüzle sulanır ve günlük sözleriniz ile davranışlarınızda çiçek açar.",
      FA: "هر کتابی که می‌خوانید، گل فکری یگانه‌ای را در روحتان می‌کارد که از تخیلتان ریشه گرفته و در گفتار و کردار روزمره‌اتان به شکوفایی می‌نشیند.",
      DE: "Jedes Buch, das Sie lesen, pflanzt eine einzigartige intellektuelle Blume in Ihre Seele, die durch Ihre Fantasie bewässert wird und in Ihren täglichen Worten aufblüht.",
      ES: "Cada libro que lees planta una flor intelectual única en tu alma, regada por tu imaginación y floreciendo en tus palabras rutinarias.",
      UR: "ہر وہ کتاب جو آپ پڑھتے ہیں وہ آپ کی روح میں ایک انوکھا فکری پھول بوتی ہے، جسے آپ کا تخیل سیراب کرتا ہے اور وہ آپ کی روزمرہ کی باتوں اور کاموں میں کھلتا ہے۔",
      ZH: "你读过的每一本书，都会在你的灵魂深处种下一朵独特的智慧之花，由你的想象力浇灌，并在你的日常言行中静静绽放。",
      RU: "Каждая прочитанная книга сажает в вашей душе уникальный интеллектуальный цветок, который орошается вашим воображением и расцветает в делах."
    }
  },
  "t-3": {
    title: {
      EN: "Rain of Knowledge & Clouds",
      FR: "Pluie du Savoir & Nuages",
      TR: "Bilgi Yağmuru ve Bulutlar",
      FA: "باران معرفت و سحاب",
      DE: "Regen des Wissens & Wolken",
      ES: "Lluvia de sabiduría y nubes",
      UR: "بادل اور علم کی بارش",
      ZH: "学问之雨与乌云",
      RU: "Дождь знаний и облака"
    },
    content: {
      EN: "Like a cloud that offers rainfall as a relief to the thirsty land, wisdom offers knowledge as a relief to the thirsty minds.",
      FR: "Comme le nuage qui donne sa pluie pour étancher la terre, la sagesse offre la connaissance aux esprits assoiffés.",
      TR: "Kurumuş toprağa can veren yağmur gibi bulutlar nasıl cömertse, bilgelik de susuz kalmış zihinlere öyle bilgi sunar.",
      FA: "مانند ابری که با بخشش باران، زمین تشنه را سیراب می‌کند، حکمت نیز با چشمه معرفت، به یاری ذهن‌های تشنه می‌شتابد.",
      DE: "Wie eine Wolke, die geizig Regen für das durstige Land spendet, gibt Weisheit Erkenntnis für den durstigen Geist.",
      ES: "Así como la nube derrama su lluvia sobre la tierra sedienta, la sabiduría ofrece el conocimiento como alivio a las almas hambrientas.",
      UR: "جیسے بادل پیاسی زمین کی پیاس بجھانے کے لیے مینہ برساتے ہیں، اسی طرح دانائی پیاسے ذہنوں کی پیاس بجھانے کے لیے علم فراہم کرتی ہے۔",
      ZH: "如同乌云洒下甘霖去滋润干涸的土地，智慧也将播撒知识之露去启迪饥渴的心灵。",
      RU: "Как облако проливает дождь на жаждущую землю, так и мудрость дарует знания жаждущим умам."
    }
  },
  "t-4": {
    title: {
      EN: "Immortalizing Fleeting Moments",
      FR: "Immortaliser les Moments Éphémères",
      TR: "Geçici Anları Ölümsüzleştirmek",
      FA: "جاودانه‌سازی لحظات گذرا",
      DE: "Vergängliche Momente verewigen",
      ES: "Inmortalizando instantes fugaces",
      UR: "عارضی لمحات کو لافانی بنانا",
      ZH: "定格流逝的瞬间",
      RU: "Увековечивание мимолетных мгновений"
    },
    content: {
      EN: "Writing is a desperate but beautiful attempt to immortalize fleeting moments and embody feelings that mouths fail to voice out loud.",
      FR: "L'écriture est une tentative désespérée mais magnifique d'immortaliser l'instant et d'incarner les sentiments inexprimables de la voix.",
      TR: "Yazmak, geçici anları ölümsüzleştirmek ve dillerin yüksek sesle söyleyemediği duyguları somutlaştırmak için umutsuz ama harika bir çabadır.",
      FA: "نگارش، تکاپویی بیهوده اما شکوهمند برای همیشگی کردن لحظه‌های روان و تجسم بخشی به احساساتی است که لب‌ها از تکلم رسا با صدای بلند پیرامونش عاجزند.",
      DE: "Schreiben ist ein verzweifelter, aber schöner Versuch, vergängliche Momente zu verewigen und Gefühle zu verkörpern.",
      ES: "La escritura es un intento desesperado pero hermoso de capturar los momentos más hermosos y dar forma a lo que las palabras no pueden decir por sí solas.",
      UR: "لکھنا ایک مایوس کن لیکن خوبصورت کوشش ہے ان عارضی لمحات کو لافانی بنانے کی اور ان جذبات کو مجسم کرنے کی جنہیں ہونٹ اونچی آواز میں ادا کرنے سے قاصر رہتے ہیں۔",
      ZH: "写作是一种虽徒劳却极为美妙 kindle 般的尝试，旨在留定转瞬即逝的每一个瞬间，并具象那些单凭言语难以高声倾吐的情感。",
      RU: "Письмо — это отчаянная, но прекрасная попытка увековечить мимолетный миг и выразить чувства, которые уста не могут произнести вслух."
    }
  },
  "t-5": {
    title: {
      EN: "Free Lessons from the Sky",
      FR: "Leçons gratuites du ciel",
      TR: "Gökyüzünün Ücretsiz Dersleri",
      FA: "درس‌های رایگان آسمان",
      DE: "Kostenlose Lektionen des Himmels",
      ES: "Lecciones gratuitas desde el cielo",
      UR: "آسمان کے مفت سبق",
      ZH: "天空赐予的免费教诲",
      RU: "Бесплатные уроки неба"
    },
    content: {
      EN: "Gazing at the blue sky and contemplating scattered clouds is a free lesson in flexibility; for the clouds march on while the pure blue remains forever.",
      FR: "Regarder le ciel bleu et les nuages épars est une leçon gratuite de flexibilité; car les nuages passent mais la pureté demeure toujours.",
      TR: "Mavi gökyüzüne bakıp oradaki beyaz bulutları seyretmek esneklik konusunda ücretsiz bir derstir; bulutlar gider ama gökyüzünün temizliği baki kalır.",
      FA: "نگاه انداختن به آسمان نیلگون و خیره شدن در به ابرها، درسی بی مایه برای تاب‌آوری است؛ ابرها روان راهی دگر می‌شوند و زلالی برای ابد مستدام جای می‌گیرد.",
      DE: "Der Blick in den blauen Himmel und das Betrachten der Wolken ist eine kostenlose Lektion in Flexibilität; Wolken vergehen, aber die Klarheit bleibt.",
      ES: "Ver el cielo y contemplar las nubes es una gran lección de resiliency; porque las nubes viajan y el azul despejado brilla eternamente.",
      UR: "نیلے آسمان کی طرف دیکھنا اور بکھرے بادلوں کا جائزہ لینا، لچک کا ایک بالکل مفت سبق ہے؛ بادل گزر جاتے ہیں جبکہ صفائے آسمان ہمیشہ قائم رہتا ہے۔",
      ZH: "仰望蔚蓝天空，凝视朵朵白云，是上天赋予我们一堂弹性人生的免费课程：乌云终会合聚消散，而纯净的苍穹将恒久存留。",
      RU: "Взгляд на синее небо и созерцание облаков – бесплатный урок гибкости: облака уходят, но чистота неба остается навсегда."
    }
  }
};

interface DataTypeTranslations {
  title?: Record<string, string>;
  content?: Record<string, string>;
  description?: Record<string, string>;
  publishDate?: Record<string, string>;
  readTime?: Record<string, string>;
  editor?: Record<string, string>;
}

// Translate UI phrase
export function t(key: string, lang: string): string {
  if (lang === 'AR' || !lang) return key;
  const translationSet = UI_TRANSLATIONS[key];
  if (translationSet && translationSet[lang]) {
    return translationSet[lang];
  }
  // Check text content dictionary as secondary
  const fallbackSet = TEXT_CONTENT_TRANSLATIONS[key];
  if (fallbackSet && fallbackSet[lang]) {
    return fallbackSet[lang];
  }
  return key;
}

// Translate complex Item schemas dynamically without cluttering original DB code
export function translateBook(book: any, lang: string) {
  if (lang === 'AR' || !lang) return book;
  
  const titleTr = TEXT_CONTENT_TRANSLATIONS[book.title]?.[lang] || book.title;
  const authorTr = TEXT_CONTENT_TRANSLATIONS[book.author]?.[lang] || book.author;
  const categoryTr = TEXT_CONTENT_TRANSLATIONS[book.category]?.[lang] || book.category;
  const descriptionTr = TEXT_CONTENT_TRANSLATIONS[book.description]?.[lang] || book.description;
  const editorTr = book.editor ? (TEXT_CONTENT_TRANSLATIONS[book.editor]?.[lang] || book.editor) : undefined;
  
  // Custom pages translation block check to preserve full integrity (translate known paragraphs beautifully)
  let translatedPages = [...book.content];
  if (book.id === 'b-wasitiyyah') {
    if (lang === 'EN') {
      translatedPages = [
        `Introduction of editing - by editor Abu Hatim Al-Dir'i:
Praise be to Allah alone, and peace and blessings be upon the Messenger of Allah, his family and companions, and whoever follows his guidance until the Day of Resurrection.
As for what follows: By the grace of Allah, care was taken of (Al-Aqeedah Al-Wasitiyyah by Sheikh Al-Islam Ibn Taymiyyah), summarizing where possible so it reaches the reader in the best form. I referenced authenticity in books of Al-Albani and others, maintaining clean and ordered style.`,
        `Chapter One: Basmalah, Hamdalah & Belief in Allah & His Attributes:
In the name of Allah, the Beneficent, the Merciful.
Praise be to Allah Who sent His Messenger with guidance and the religion of truth to manifest it over all religions, and Allah is sufficient as a witness. This is the faith of the saved sect (Ahlus-Sunnah wal-Jama'ah): Belief in Allah, His Angels, His Books, His Messengers, Resurrection, and Divine Decree (Qadar).
Part of belief in Allah is believing in how He described Himself in His Book, without distortion or denial, and without declaring 'how' or likening Him to creation.`
      ];
    } else {
      translatedPages = book.content.map((p: string) => `[${lang}] ` + p.substring(0, 300) + "...");
    }
  } else if (book.id === 'b-1' && lang === 'EN') {
    translatedPages = [
      `Chapter One: Majesty of the Distant Horizon
Standing below the wide heavens installs a deep feeling of marvel, elevating our understanding of nature. Clouds drift like peaceful messages telling stories about flexibility and flow. They don't block the mountain peaks but smoothly bend around them.`,
      `Chapter Two: The Art of Silent Departure
Clouds offer us ultimate advice regarding letting go and renewing. A cloud never stays in one place mourning its circumstances, but morphs into tiny water droplets to feed and nurture dry soil below.`,
      `Chapter Three: Gazing Upwards as Mental Relief
Often humans look down at their devices and earthly issues. Try to lay on green grass for five minutes, looking into blue sky. Your massive issues will suddenly look like tiny dust motes in infinite space.`
    ];
  } else if (book.id === 'b-2' && lang === 'EN') {
    translatedPages = [
      `Intro: From Darkness to Enlightenment
Light is not external, but a seed lying inside you hidden by daily workloads and stress. To embark on the journey, reduce unnecessary excess baggage: old grudges, regrets, and expectations.`,
      `Step One: Conscious Silence
We survive in constant noise. Conscious silence means keeping twenty minutes daily of complete quietness. Silence is full of answers.`,
      `Step Two: Daily Gratitude practice
Every single morning before touching your phone, declare three things you are grateful for. Gratitude changes your inner brain chemistry.`
    ];
  } else if (book.id === 'b-3' && lang === 'EN') {
    translatedPages = [
      `Section One: House of Wisdom in Baghdad
In the gold age of Baghdad, the House of Wisdom was built as an international beacon of translations and sciences, where multiple languages gathered into eloquent Arabic text.`,
      `Section Two: Cordoba Library in Andalusia
In Islamic Spain, Cordoba had a giant palace library counting over 400,000 carefully indexed manuscripts, where women actively worked as scribes and main copyists.`,
      `Section Three: Our Digital Generation's Message
As papers decay under history's wheel, digital technology opens boundless gateways. Our current role is to curate useful libraries instead of superficial contents.`
    ];
  }

  return {
    ...book,
    title: titleTr,
    author: authorTr,
    editor: editorTr,
    category: categoryTr,
    description: descriptionTr,
    content: translatedPages
  };
}

export function translateArticle(article: any, lang: string) {
  if (lang === 'AR' || !lang) return article;

  const titleTr = TEXT_CONTENT_TRANSLATIONS[article.title]?.[lang] || article.title;
  const authorTr = TEXT_CONTENT_TRANSLATIONS[article.author]?.[lang] || article.author;
  const categoryTr = TEXT_CONTENT_TRANSLATIONS[article.category]?.[lang] || article.category;
  
  let translatedContent = [...article.content];
  if (article.id === 'a-1' && lang === 'EN') {
    translatedContent = [
      "We lives in a historical era where human brains receive a giant amount of notifications and short videos, reducing our core capabilities to focus and construct deep meditations.",
      "Quiet reading of e-books free from notifications is a beautiful active training for neural circuits to tolerate silence and improve working memory and analytical skills.",
      "To recover your peace of mind, commit twenty minutes daily before sleep with completely closed social apps, to read an elegant philosophical page. The results are pure balance."
    ];
  } else if (article.id === 'a-2' && lang === 'EN') {
    translatedContent = [
      "Since ancient times, clouds, rain, and meadows held a giant portion of Arabic poems and classical metaphors that are impossible to forget.",
      "The peace of nature and cloud movements is not a visuals luxury, but a dialogue between human souls and the universe that renews hope of rain and blossom.",
      "Our contemporary pens need to return to pure nature resources, instead of confining ourselves to concrete walls and modern monitors."
    ];
  } else if (article.id === 'a-3' && lang === 'EN') {
    translatedContent = [
      "A thought (Khaterah) is a sudden flash of feelings, an emotional spike written freely without structural rules or scientific logical constraints.",
      "On the other hand, an article is an organized construct, requesting solid thesis introduction, body points, and clear logical argument to convince minds.",
      "In our digital platform, we present both: the beautiful free-spirit warmth of emotional thoughts, alongside organized intellectual value of papers."
    ];
  }

  return {
    ...article,
    title: titleTr,
    author: authorTr,
    category: categoryTr,
    content: translatedContent
  };
}

export function translateThought(thought: any, lang: string) {
  if (lang === 'AR' || !lang) return thought;

  const translationSet = THOUGHTS_CONTENT_TRANSLATIONS[thought.id];
  const titleTr = translationSet?.title?.[lang] || thought.title;
  const authorTr = TEXT_CONTENT_TRANSLATIONS[thought.author]?.[lang] || thought.author;
  const categoryTr = TEXT_CONTENT_TRANSLATIONS[thought.category]?.[lang] || thought.category;
  const contentTr = translationSet?.content?.[lang] || thought.content;

  return {
    ...thought,
    title: titleTr, 
    author: authorTr,
    category: categoryTr,
    content: contentTr
  };
}
