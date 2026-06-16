import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, ShieldAlert, Compass, Eye, EyeOff, BookOpen, Sparkles, AlertCircle } from 'lucide-react';
import { UserSession } from '../types';
import { ambientSound } from '../utils/ambientAudio';
import { smartFetch } from '../utils/api';
import siteLogo from '../assets/images/site_logo_1781429602478.jpg';

interface SkyIntroProps {
  onSelectSession: (session: UserSession) => void;
}

export default function SkyIntro({ onSelectSession }: SkyIntroProps) {
  const [animationPhase, setPhase] = useState<'above' | 'descending' | 'under' | 'controls'>('above');
  const [showModal, setShowModal] = useState<'none' | 'login' | 'admin'>('none');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [nameInput, setNameInput] = useState(''); // for custom signup
  const [isSignUp, setIsSignUp] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Play cloud descent animation
  useEffect(() => {
    // Phase 1: Above clouds (duration 0 - 3s)
    const phase1Timer = setTimeout(() => {
      setPhase('descending');
    }, 2500);

    // Phase 2: Diving through clouds (duration 3s - 6s)
    const phase2Timer = setTimeout(() => {
      setPhase('under');
    }, 5500);

    // Phase 3: Settle in blue sky, show text and options (duration 6s+)
    const phase3Timer = setTimeout(() => {
      setPhase('controls');
    }, 8000); // Wait 8 seconds of cumulative elegant flow, close to 10s as requested

    return () => {
      clearTimeout(phase1Timer);
      clearTimeout(phase2Timer);
      clearTimeout(phase3Timer);
    };
  }, []);

  const skipAnimations = () => {
    setPhase('controls');
  };

  const [rememberMe, setRememberMe] = useState(true);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [forgotStep, setForgotStep] = useState<1 | 2>(1);

  // Custom uploaded welcome audio state
  const [uploadedAudio, setUploadedAudio] = useState<string | null>(null);
  const customAudioObj = React.useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    smartFetch('/api/welcome-audio')
      .then(res => res.json())
      .then(data => {
        if (data && data.audio) {
          setUploadedAudio(data.audio);
        }
      })
      .catch(err => console.error('Error loading custom welcome audio:', err));
  }, []);

  // Sound system state
  const [soundPlaying, setSoundPlaying] = useState(false);
  const [rainVol, setRainVol] = useState(0.4);
  const [birdsVol, setBirdsVol] = useState(0.15);
  const [waterVol, setWaterVol] = useState(0.3);

  // Load preset volumes on mount based on administrator's control configuration
  useEffect(() => {
    const preset = localStorage.getItem('intro_ambient_sound') || 'combined';
    if (preset === 'combined') {
      setBirdsVol(0.15);
      setWaterVol(0.3);
    } else if (preset === 'birds') {
      setBirdsVol(0.15);
      setWaterVol(0);
    } else if (preset === 'water') {
      setBirdsVol(0);
      setWaterVol(0.3);
    } else if (preset === 'silent') {
      setBirdsVol(0);
      setWaterVol(0);
    }
  }, []);

  // Auto start/resume sounds if enabled
  useEffect(() => {
    if (soundPlaying) {
      if (uploadedAudio) {
        if (!customAudioObj.current) {
          customAudioObj.current = new Audio(uploadedAudio);
          customAudioObj.current.loop = true;
          customAudioObj.current.volume = 0.8;
        }
        customAudioObj.current.play().catch(e => console.log('Autoplay blocked:', e));
      } else {
        ambientSound.start();
        ambientSound.setRainVolume(rainVol);
        ambientSound.setBirdsVolume(birdsVol);
        ambientSound.setWaterVolume(waterVol);
      }
    } else {
      if (customAudioObj.current) {
        customAudioObj.current.pause();
      }
      ambientSound.stop();
    }
  }, [soundPlaying, uploadedAudio]);

  useEffect(() => {
    ambientSound.setRainVolume(rainVol);
  }, [rainVol]);

  useEffect(() => {
    ambientSound.setBirdsVolume(birdsVol);
  }, [birdsVol]);

  useEffect(() => {
    ambientSound.setWaterVolume(waterVol);
  }, [waterVol]);

  // Clean ambient audio on unmount
  useEffect(() => {
    // If we have saved session on mount, load it
    const savedSess = localStorage.getItem('library_session');
    if (savedSess) {
      try {
        onSelectSession(JSON.parse(savedSess));
      } catch (e) {}
    }

    return () => {
      ambientSound.stop();
      if (customAudioObj.current) {
        customAudioObj.current.pause();
        customAudioObj.current = null;
      }
    };
  }, []);

  const handleGuestLogin = () => {
    const randomGuestId = Math.floor(1000 + Math.random() * 9000);
    const sessionData: UserSession = {
      username: `guest_${randomGuestId}`,
      name: `زائر #${randomGuestId}`,
      role: 'guest',
      avatarSeed: 'G'
    };
    if (rememberMe) {
      localStorage.setItem('library_session', JSON.stringify(sessionData));
    }
    onSelectSession(sessionData);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorMsg('فضلاً املأ جميع الحقول المطلوبة');
      return;
    }

    if (isSignUp) {
      if (!nameInput.trim()) {
        setErrorMsg('فضلاً أدخل اسمك الكامل المفضل');
        return;
      }
      // Save custom user to localStorage (acting as our User.json)
      const users = JSON.parse(localStorage.getItem('library_users') || '{}');
      const lowerEmail = username.toLowerCase().trim();

      if (users[lowerEmail]) {
        setErrorMsg('هذا البريد الإلكتروني مسجل سابقاً!');
        return;
      }

      users[lowerEmail] = {
        username: lowerEmail,
        email: lowerEmail,
        password: password,
        name: nameInput,
        role: 'user',
        avatarSeed: nameInput.substring(0, 1).toUpperCase()
      };
      localStorage.setItem('library_users', JSON.stringify(users));

      const sessionData: UserSession = {
        username: lowerEmail,
        name: nameInput,
        role: 'user',
        avatarSeed: nameInput.substring(0, 1).toUpperCase(),
        email: lowerEmail
      };

      if (rememberMe) {
        localStorage.setItem('library_session', JSON.stringify(sessionData));
      }

      onSelectSession(sessionData);
    } else {
      // Check pre-defined mock user or local storage
      const users = JSON.parse(localStorage.getItem('library_users') || '{}');
      const lowerEmail = username.toLowerCase().trim();

      if (lowerEmail === 'user' && password === 'user') {
        const sessionData: UserSession = {
          username: 'user',
          name: 'ضيف المكتبة الفخري',
          role: 'user',
          avatarSeed: 'U',
          email: 'user@example.com'
        };
        if (rememberMe) {
          localStorage.setItem('library_session', JSON.stringify(sessionData));
        }
        onSelectSession(sessionData);
      } else if (users[lowerEmail] && users[lowerEmail].password === password) {
        const sessionData: UserSession = {
          username: lowerEmail,
          name: users[lowerEmail].name,
          role: 'user',
          avatarSeed: users[lowerEmail].name.substring(0, 1).toUpperCase(),
          email: lowerEmail
        };
        if (rememberMe) {
          localStorage.setItem('library_session', JSON.stringify(sessionData));
        }
        onSelectSession(sessionData);
      } else {
        setErrorMsg('خطأ في البريد الإلكتروني أو كلمة المرور. يرجى التحقق وإعادة المحاولة.');
      }
    }
  };

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'Mm777654926mM') {
      const sessionData: UserSession = {
        username: 'admin',
        name: 'أمين مكتبة الدرعي',
        role: 'admin',
        avatarSeed: 'A'
      };
      if (rememberMe) {
        localStorage.setItem('library_session', JSON.stringify(sessionData));
      }
      onSelectSession(sessionData);
    } else {
      setErrorMsg('رمز الإدارة غير صحيح. كلمة السر الصحيحة مطلوبة للدخول.');
    }
  };

  const handlePasswordRecovery = (e: React.FormEvent) => {
    e.preventDefault();
    const users = JSON.parse(localStorage.getItem('library_users') || '{}');
    const lowerEmail = forgotEmail.toLowerCase().trim();

    if (forgotStep === 1) {
      if (lowerEmail === 'user') {
        setResetMessage('تم التعرف على الحساب الفخري التجريبي. يرجى كتابة كلمة المرور الجديدة له.');
        setForgotStep(2);
        setErrorMsg('');
      } else if (users[lowerEmail]) {
        setResetMessage(`تم العثور على حسابك: ${users[lowerEmail].name}. اكتب الآن كلمة المرور الجديدة لتحديث حسابك في ملفات الموقع.`);
        setForgotStep(2);
        setErrorMsg('');
      } else {
        setErrorMsg('البريد الإلكتروني المدخل غير مسجل لدينا!');
      }
    } else {
      if (!newPassword.trim()) {
        setErrorMsg('يرجى إدخال كلمة مرور جديدة صالحة');
        return;
      }
      if (lowerEmail === 'user') {
        // Just success alert for main mock account
        setResetMessage('تم تحديث كلمة مرور الحساب الفخري بنجاح!');
        setTimeout(() => {
          setShowForgot(false);
          setForgotStep(1);
          setForgotEmail('');
          setNewPassword('');
          setResetMessage('');
        }, 2000);
      } else {
        users[lowerEmail].password = newPassword;
        localStorage.setItem('library_users', JSON.stringify(users));
        setResetMessage('تم تحديث وحفظ كلمة المرور الجديدة في ملفات الأعضاء المشفرة بنجاح! يمكنك الآن تسجيل الدخول.');
        setTimeout(() => {
          setShowForgot(false);
          setForgotStep(1);
          setForgotEmail('');
          setNewPassword('');
          setResetMessage('');
        }, 2500);
      }
    }
  };

  return (
    <div id="sky-intro-container" className="relative w-full h-screen overflow-hidden select-none bg-gradient-to-b from-[#0F4C75] via-[#3282B8] to-[#BBE1FA] font-sans text-right font-semibold" dir="rtl">
      {/* Sky Canvas Layers */}
      <div className="absolute inset-0 z-0 transition-all duration-[4000ms] ease-in-out">
        {/* Sky Color transition */}
        <div className={`absolute inset-0 transition-opacity duration-[5000ms] bg-gradient-to-b from-[#0F4C75] via-[#1F628F] to-[#4FA4D7] ${
          animationPhase === 'under' || animationPhase === 'controls' ? 'opacity-0' : 'opacity-100'
        }`} />
        
        <div className={`absolute inset-0 transition-opacity duration-[5000ms] bg-gradient-to-b from-[#0F4C75] via-[#3282B8] to-[#BBE1FA] ${
          animationPhase === 'under' || animationPhase === 'controls' ? 'opacity-100' : 'opacity-0'
        }`} />
      </div>

      {/* Sun or Radiant Center */}
      <motion.div
        animate={{
          scale: animationPhase === 'above' ? 0.9 : 1.2,
          opacity: animationPhase === 'above' ? 0.4 : 0.85,
          y: animationPhase === 'above' ? -100 : 0,
        }}
        transition={{ duration: 8, ease: 'easeOut' }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-radial from-white/30 via-white/10 to-transparent blur-3xl pointer-events-none"
      />

      {/* Floating clouds during "Above" & "Descending" Phases */}
      <AnimatePresence>
        {(animationPhase === 'above' || animationPhase === 'descending') && (
          <div className="absolute inset-0 z-10 pointer-events-none">
            {/* Massive Above-Cloud Layer */}
            <motion.div
              initial={{ scale: 1, opacity: 0.9, y: 0 }}
              animate={{
                scale: animationPhase === 'descending' ? 2.5 : 1.05,
                opacity: animationPhase === 'descending' ? 0 : 0.9,
                y: animationPhase === 'descending' ? 400 : -20,
              }}
              transition={{ duration: 6, ease: 'easeInOut' }}
              className="absolute inset-[10%] flex flex-wrap justify-around items-center"
            >
              <div className="w-[30vw] h-[15vh] bg-white/70 rounded-full blur-2xl filter drop-shadow-xl" />
              <div className="w-[45vw] h-[25vh] bg-white/60 rounded-full blur-3xl filter" />
              <div className="w-[35vw] h-[18vh] bg-white/75 rounded-full blur-2xl filter" />
            </motion.div>

            {/* Clouds that float upwards as camera dives downwards */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0.7, y: 151 }}
              animate={{
                scale: animationPhase === 'descending' ? 3.5 : 1,
                opacity: animationPhase === 'descending' ? 0 : 0.7,
                y: animationPhase === 'descending' ? -600 : 50,
              }}
              transition={{ duration: 6, ease: 'easeInOut' }}
              className="absolute inset-x-0 bottom-0 flex justify-between"
            >
              <div className="w-[50vw] h-[20vh] bg-white/50 rounded-full blur-3xl transform translate-y-10" />
              <div className="w-[60vw] h-[30vh] bg-white/40 rounded-full blur-3xl transform translate-y-5" />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Under the clouds - Blue sky with gentle scattered clouds */}
      <AnimatePresence>
        {(animationPhase === 'under' || animationPhase === 'controls') && (
          <div className="absolute inset-0 z-10 pointer-events-none">
            {/* Slow moving scattered clouds in looking-up state */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 3 }}
              className="absolute inset-0"
            >
              {/* Cloud #1 */}
              <motion.div
                animate={{ x: [0, 40, 0], y: [0, 5, 0] }}
                transition={{ repeat: Infinity, duration: 25, ease: 'easeInOut' }}
                className="absolute top-[15%] right-[10%] w-64 h-24 bg-white/50 rounded-full blur-xl animate-pulse"
              />
              {/* Cloud #2 */}
              <motion.div
                animate={{ x: [0, -30, 0], y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 30, ease: 'easeInOut' }}
                className="absolute top-[40%] left-[15%] w-80 h-32 bg-white/30 rounded-full blur-2xl"
              />
              {/* Cloud #3 */}
              <motion.div
                animate={{ x: [0, 20, 0] }}
                transition={{ repeat: Infinity, duration: 20, ease: 'easeInOut' }}
                className="absolute bottom-[20%] right-[25%] w-48 h-16 bg-white/45 rounded-full blur-lg animate-pulse"
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Skipping presentation button */}
      {animationPhase !== 'controls' && (
        <button
          id="skip-intro-btn"
          onClick={skipAnimations}
          className="absolute top-6 left-6 z-40 px-4 py-2 bg-white/20 hover:bg-white/40 backdrop-blur-md text-[#1B262C] rounded-full text-xs font-bold cursor-pointer transition-all border border-white/30 flex items-center gap-2"
        >
          <span>تخطي العرض الفني</span>
          <BookOpen size={14} className="animate-pulse text-[#1B262C]" />
        </button>
      )}

      {/* Centered Welcome Message and Action Menu */}
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center">
        <AnimatePresence mode="wait">
          {/* Introductory Step Words */}
          {animationPhase === 'above' && (
            <motion.div
              key="intro-above"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 1.2 }}
              className="text-white max-w-lg px-4"
            >
              <span className="text-white font-serif tracking-widest text-sm uppercase block mb-3 font-bold opacity-90">آفاق الحكمة والمعرفة</span>
              <h1 className="text-3xl md:text-5xl font-extrabold font-serif leading-relaxed text-shadow text-white drop-shadow-md">نرتقي فوق الغمام... لنصحبكم في رحلة الحرف</h1>
            </motion.div>
          )}

          {animationPhase === 'descending' && (
            <motion.div
              key="intro-descending"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 1.2 }}
              className="text-white backdrop-blur-[2px] rounded-2xl p-6 max-w-xl"
            >
              <h2 className="text-2xl md:text-3xl font-bold font-serif text-white drop-shadow-md leading-relaxed">
                عبوراً من بساط السحاب الأبيض المتألق إلى وادٍ تسكنه روائع الفنون...
              </h2>
            </motion.div>
          )}

          {/* Settle: Welcome and Options */}
          {(animationPhase === 'under' || animationPhase === 'controls') && (
            <motion.div
              key="main-options"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.5 }}
              className="w-full max-w-2xl px-4 flex flex-col items-center select-text"
            >
              {/* Logo Emblem holding standard branding rules */}
              <motion.div
                initial={{ rotate: -10, scale: 0.8 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ delay: 0.4, type: 'spring' }}
                className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-lg shadow-blue-900/10 mb-6 border border-[#a8dadc]/60 overflow-hidden"
              >
                <img
                  src={siteLogo}
                  alt="Logo"
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </motion.div>

              <motion.h1
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6, duration: 1 }}
                className="text-3xl md:text-5xl font-black font-serif text-[#1B262C] text-shadow-sm mb-2 leading-snug"
              >
                مرحبا بك في مكتبة الدرعي الرقمية
              </motion.h1>

              <motion.p
                initial={{ y: 15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.9, duration: 0.8 }}
                className="text-[#1B262C]/85 font-sans text-sm md:text-base max-w-md md:max-w-lg leading-relaxed mb-10"
              >
                واحة من المعرفة الهادفة تضم أمهات الأفكار والكتب والخواطر المكتوبة بعناية لتغذية الذهن ونقاء الروح تحت زرقة الأفق الواسع.
              </motion.p>

              {/* Three Options layout */}
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.2, duration: 1 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full"
              >
                {/* Guest option */}
                <button
                  id="browse-guest-btn"
                  onClick={handleGuestLogin}
                  className="group px-6 py-4 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-3xl text-[#1B262C] font-bold transition-all duration-300 border border-white/30 hover:border-white/50 flex flex-col items-center gap-3 shadow-md hover:shadow-lg hover:-translate-y-1 cursor-pointer"
                >
                  <div className="p-3 bg-[#0F4C75]/10 group-hover:bg-[#0F4C75]/25 rounded-2xl transition-colors">
                    <Compass size={24} className="text-[#0F4C75]" />
                  </div>
                  <div>
                    <span className="block text-base">التصفح كضيف</span>
                    <span className="block text-xs font-normal text-slate-700 mt-1 font-semibold">ولوج سريع بدون حساب</span>
                  </div>
                </button>

                {/* User login option */}
                <button
                  id="user-login-btn"
                  onClick={() => {
                    setShowModal('login');
                    setErrorMsg('');
                    setUsername('');
                    setPassword('');
                    setNameInput('');
                    setIsSignUp(false);
                  }}
                  className="group px-6 py-4 bg-[#1B262C] hover:bg-[#0F4C75] text-white rounded-3xl font-black transition-all duration-300 border border-white/20 flex flex-col items-center gap-3 shadow-md hover:shadow-lg hover:-translate-y-1 cursor-pointer"
                >
                  <div className="p-3 bg-white/10 group-hover:bg-white/20 rounded-2xl transition-colors">
                    <User size={24} className="text-white" />
                  </div>
                  <div>
                    <span className="block text-base">تسجيل دخول</span>
                    <span className="block text-xs font-normal text-slate-200 mt-1">تفاعل كامل وكتابة خواطر</span>
                  </div>
                </button>

                {/* Admin login option */}
                <button
                  id="admin-login-btn"
                  onClick={() => {
                    setShowModal('admin');
                    setErrorMsg('');
                    setUsername('');
                    setPassword('');
                  }}
                  className="group px-6 py-4 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-3xl text-[#1B262C] font-bold transition-all duration-300 border border-white/30 hover:border-white/50 flex flex-col items-center gap-3 shadow-md hover:shadow-lg hover:-translate-y-1 cursor-pointer"
                >
                  <div className="p-3 bg-[#1B262C]/10 group-hover:bg-[#1B262C]/25 rounded-2xl transition-colors">
                    <ShieldAlert size={24} className="text-[#1B262C]" />
                  </div>
                  <div>
                    <span className="block text-base">دخول الإدارة</span>
                    <span className="block text-xs font-normal text-slate-700 mt-1 font-semibold">لوحة التعديل والاضافات</span>
                  </div>
                </button>
              </motion.div>

            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Login and Register Modals */}
      <AnimatePresence>
        {showModal !== 'none' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#1B262C]/95 text-white border border-[#0F4C75]/40 rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl backdrop-blur-xl relative select-text"
            >
              <div className="flex items-center justify-between mb-6 pb-2 border-b border-white/10">
                <h3 className="text-xl font-bold font-serif flex items-center gap-2 text-white">
                  {showModal === 'admin' ? (
                    <>
                      <ShieldAlert size={22} className="text-white" />
                      <span>دخول الإشراف والإدارة</span>
                    </>
                  ) : showForgot ? (
                    <>
                      <Sparkles size={22} className="text-white animate-pulse" />
                      <span>استعادة كلمة المرور</span>
                    </>
                  ) : isSignUp ? (
                    <>
                      <User size={22} className="text-white" />
                      <span>إنشاء حساب قارئ جديد</span>
                    </>
                  ) : (
                    <>
                      <User size={22} className="text-white" />
                      <span>تسجيل دخول الأعضاء</span>
                    </>
                  )}
                </h3>
                <button
                  id="close-modal-btn"
                  onClick={() => {
                    setShowModal('none');
                    setShowForgot(false);
                    setForgotStep(1);
                  }}
                  className="text-white/60 hover:text-white text-xl cursor-pointer p-1"
                >
                  ✕
                </button>
              </div>

              {/* Welcome message with zero credential disclosure */}
              <div className="mb-4 p-4.5 bg-white/5 rounded-2xl border border-white/10 flex items-start gap-3 text-xs text-slate-100 leading-relaxed font-sans text-right">
                <Sparkles size={18} className="text-amber-300 shrink-0 mt-0.5 animate-pulse" />
                <div>
                  {showForgot ? (
                    <p className="font-bold">أهلاً بك في نظام استعادة الحسابات. يرجى إدخال بريدك الإلكتروني المسجل لدينا للبدء في تحديث رمز المرور الخاص بك وتأمين عضويتك.</p>
                  ) : showModal === 'admin' ? (
                    <p className="font-bold">مرحباً بك يا أمين مكتبة الدرعي الفاضل في لوحة التحكم الإشرافية. يرجى التفضل بإدخال وتقديم الرمز السري للإدارة للوصول لخيارات التحكم وتحرير الرفوف والبيانات.</p>
                  ) : (
                    <p className="font-bold">أهلاً وسهلاً بقارئنا الكريم في رحاب مكتبة ورواق الدرعي الرقمي الفاخر. يرجى إدخال حسابك المسجل لتتمكن من مناقشة الكتب وتدوين خواطرك الإبداعية على جدران المعرفة.</p>
                  )}
                </div>
              </div>

              {errorMsg && (
                <div id="auth-error" className="mb-4 p-3 bg-rose-550/20 border border-rose-500/30 rounded-xl text-xs text-rose-300">
                  ⚠️ {errorMsg}
                </div>
              )}

              {resetMessage && (
                <div className="mb-4 p-3 bg-emerald-550/20 border border-emerald-500/30 rounded-xl text-xs text-emerald-300">
                  ✨ {resetMessage}
                </div>
              )}

              {showForgot ? (
                // Forgot Password Form
                <form onSubmit={handlePasswordRecovery} className="space-y-4">
                  {forgotStep === 1 ? (
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">البريد الإلكتروني للغريق</label>
                      <input
                        type="text"
                        dir="ltr"
                        required
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        className="w-full px-4 py-3 bg-black/25 border border-white/10 rounded-xl text-white placeholder-slate-400 text-sm focus:outline-none focus:border-[#3282B8] transition-colors"
                        placeholder="user@example.com أو user"
                      />
                      <p className="text-[10px] text-slate-400 mt-1">سنبحث عن هذا البريد في ملفات الأعضاء لاستعادة الحساب.</p>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">أدخل كلمة المرور الجديدة</label>
                      <input
                        type="password"
                        dir="ltr"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-4 py-3 bg-black/25 border border-white/10 rounded-xl text-white placeholder-slate-400 text-sm focus:outline-none focus:border-[#3282B8] transition-colors"
                        placeholder="أدخل كلمة مرور سرية جديدة"
                      />
                    </div>
                  )}

                  <div className="pt-3">
                    <button
                      type="submit"
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl text-sm transition-colors cursor-pointer shadow-lg shadow-black/10"
                    >
                      {forgotStep === 1 ? 'الخطوة التالية ↺' : 'تأكيد وحفظ كلمة المرور الجديدة'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowForgot(false);
                        setForgotStep(1);
                        setErrorMsg('');
                        setResetMessage('');
                      }}
                      className="w-full py-2 mt-2 bg-transparent hover:underline text-xs text-slate-400"
                    >
                      الرجوع لتسجيل الدخول
                    </button>
                  </div>
                </form>
              ) : (
                // Sign Up / Login Form
                <form onSubmit={showModal === 'admin' ? handleAdminSubmit : handleLoginSubmit} className="space-y-4">
                  {showModal === 'login' && isSignUp && (
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">الاسم الكامل المفضل</label>
                      <input
                        type="text"
                        dir="rtl"
                        value={nameInput}
                        onChange={(e) => setNameInput(e.target.value)}
                        className="w-full px-4 py-3 bg-black/25 border border-white/10 rounded-xl text-white placeholder-slate-400 text-sm focus:outline-none focus:border-[#3282B8] transition-colors"
                        placeholder="امجد الدرعي"
                      />
                    </div>
                  )}

                  {showModal !== 'admin' && (
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        البريد الإلكتروني / اسم الحساب
                      </label>
                      <input
                        type="text"
                        dir="ltr"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full px-4 py-3 bg-black/25 border border-white/10 rounded-xl text-white placeholder-slate-400 text-sm focus:outline-none focus:border-[#3282B8] transition-colors"
                        placeholder="yourname@domain.com"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">كلمة المرور / الرمز السري</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        dir="ltr"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-3 pl-10 bg-black/25 border border-white/10 rounded-xl text-white placeholder-slate-400 text-sm focus:outline-none focus:border-[#3282B8] transition-colors"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        tabIndex={-1}
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 hover:text-white cursor-pointer"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  {/* Remember Me and Forgot Password checkboxes row */}
                  <div className="flex items-center justify-between text-xs text-slate-300 pt-1">
                    <label className="flex items-center gap-1.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="rounded border-white/20 bg-black/40 text-[#0F4C75] focus:ring-0 w-3.5 h-3.5"
                      />
                      <span>حفظ تسجيل الدخول</span>
                    </label>

                    {showModal === 'login' && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowForgot(true);
                          setForgotStep(1);
                          setForgotEmail(username);
                          setErrorMsg('');
                          setResetMessage('');
                        }}
                        className="hover:text-white hover:underline cursor-pointer"
                      >
                        نسيت كلمة المرور؟
                      </button>
                    )}
                  </div>

                  <div className="pt-3">
                    <button
                      type="submit"
                      className="w-full py-3 bg-[#0F4C75] hover:bg-[#3282B8] text-white font-extrabold rounded-xl text-sm transition-colors cursor-pointer shadow-lg shadow-black/10"
                    >
                      {showModal === 'admin' ? 'تأكيد دخول المشرف وبدء الإدارة' : isSignUp ? 'إنشاء الحساب وبدء تصفح المكتبة' : 'تسجيل الدخول'}
                    </button>
                  </div>
                </form>
              )}

              {showModal === 'login' && !showForgot && (
                <div className="mt-4 text-center">
                  <button
                    onClick={() => {
                      setIsSignUp(!isSignUp);
                      setErrorMsg('');
                    }}
                    className="text-xs text-slate-300 hover:text-white underline cursor-pointer"
                  >
                    {isSignUp ? 'لديك حساب بالفعل؟ سجل دخولك' : 'لا تملك حساباً؟ أنشئ حساباً قارئاً فوراً'}
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Nature Ambient Sounds Control Dashboard (Floating block) */}
      <div className="absolute bottom-6 right-6 z-40 max-w-sm w-[90vw] md:w-80 bg-[#1B262C]/75 backdrop-blur-xl border border-white/20 rounded-2xl p-4 text-white shadow-xl flex flex-col gap-3 font-sans" dir="rtl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${soundPlaying ? 'bg-emerald-400' : 'bg-amber-400'} opacity-75`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${soundPlaying ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
            </span>
            <span className="text-xs font-bold text-shadow-sm select-none">الأصوات الطبيعية المصاحبة للمطالعة</span>
          </div>
          <button
            onClick={() => setSoundPlaying(!soundPlaying)}
            className={`px-3 py-1 rounded-full text-[10px] font-bold cursor-pointer transition-all ${
              soundPlaying ? 'bg-rose-600 hover:bg-rose-500' : 'bg-emerald-600 hover:bg-emerald-500'
            }`}
          >
            {soundPlaying ? 'إيقاف الأصوات' : 'تشغيل الأصوات الطبيعية'}
          </button>
        </div>

        {soundPlaying && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2 text-[11px] pt-1 border-t border-white/10"
          >
            {/* Birds Vol */}
            <div className="flex items-center justify-between gap-2">
              <span className="w-24 text-slate-300 font-semibold text-right flex items-center gap-1">
                <span>🐦</span> <span>عصافير الغابة:</span>
              </span>
              <input
                type="range"
                min="0"
                max="0.5"
                step="0.05"
                value={birdsVol}
                onChange={(e) => setBirdsVol(parseFloat(e.target.value))}
                className="grow cursor-pointer accent-[#3282B8]"
              />
              <span className="w-6 text-left font-mono text-slate-400">{Math.round(birdsVol * 100)}%</span>
            </div>

            {/* Water Vol */}
            <div className="flex items-center justify-between gap-2">
              <span className="w-24 text-slate-300 font-semibold text-right flex items-center gap-1">
                <span>💧</span> <span>خرير المياه:</span>
              </span>
              <input
                type="range"
                min="0"
                max="0.8"
                step="0.05"
                value={waterVol}
                onChange={(e) => setWaterVol(parseFloat(e.target.value))}
                className="grow cursor-pointer accent-[#3282B8]"
              />
              <span className="w-6 text-left font-mono text-slate-400">{Math.round(waterVol * 100)}%</span>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
