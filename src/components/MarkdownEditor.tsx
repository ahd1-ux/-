import React, { useRef, useState, useEffect } from 'react';
import { 
  Bold, Italic, AlignRight, AlignCenter, AlignLeft, AlignJustify, 
  Trash2, ZoomIn, ZoomOut, Type, Palette, List, ListOrdered, Minus, Eraser, Image
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MarkdownEditorProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

export default function MarkdownEditor({ value, onChange, placeholder }: MarkdownEditorProps) {
  // Tabs: 'visual' corresponds to direct render editing, 'code' to HTML content
  const [activeTab, setActiveTab] = useState<'visual' | 'code'>('visual');
  const [editorFontSize, setEditorFontSize] = useState<number>(15); // Default comfortable font size
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showSizePicker, setShowSizePicker] = useState(false);
  const [showImageInserter, setShowImageInserter] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  
  // Show advanced classic tools by default or via toggle
  const [showAdvanced, setShowAdvanced] = useState(false);

  const editorRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync value to contentEditable editor ref on mount or toggled state
  useEffect(() => {
    if (editorRef.current && activeTab === 'visual') {
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value || '';
      }
    }
  }, [value, activeTab]);

  const triggerChange = () => {
    if (activeTab === 'visual' && editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const executeCommand = (command: string, arg: string = '') => {
    if (activeTab !== 'visual') return;
    document.execCommand(command, false, arg);
    triggerChange();
  };

  // Safe tag wrapper helper for raw HTML text editing (Code view)
  const wrapHtmlSelection = (startTag: string, endTag: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);
    const replacement = startTag + selectedText + endTag;
    const newValue = text.substring(0, start) + replacement + text.substring(end);
    onChange(newValue);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + startTag.length, start + startTag.length + selectedText.length);
    }, 50);
  };

  // Custom styling commands for selected blocks
  const applyCustomStyle = (styleName: string, styleValue: string) => {
    if (activeTab !== 'visual') return;
    
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
      applyBlockStyle(styleName, styleValue);
      return;
    }
    
    const range = selection.getRangeAt(0);
    const span = document.createElement('span');
    span.style.setProperty(styleName, styleValue);
    
    try {
      range.surroundContents(span);
    } catch (e) {
      const fragment = range.extractContents();
      span.appendChild(fragment);
      range.insertNode(span);
    }
    triggerChange();
    setShowColorPicker(false);
    setShowSizePicker(false);
  };

  const applyBlockStyle = (styleName: string, styleValue: string) => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);
    
    let parent = range.commonAncestorContainer as HTMLElement;
    if (parent.nodeType === Node.TEXT_NODE) {
      parent = parent.parentNode as HTMLElement;
    }
    
    while (parent && parent !== editorRef.current && !['P', 'DIV', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'LI'].includes(parent.tagName)) {
      parent = parent.parentNode as HTMLElement;
    }
    
    if (parent && parent !== editorRef.current) {
      parent.style.setProperty(styleName, styleValue);
      triggerChange();
    } else {
      const div = document.createElement('div');
      div.style.setProperty(styleName, styleValue);
      if (!range.collapsed) {
        try {
          range.surroundContents(div);
        } catch (e) {
          const fragment = range.extractContents();
          div.appendChild(fragment);
          range.insertNode(div);
        }
      } else {
        div.innerHTML = 'نص جديد...';
        range.insertNode(div);
      }
      triggerChange();
    }
  };

  const insertLineBreak = () => {
    if (activeTab === 'visual') {
      executeCommand('insertHTML', '<br>');
    } else {
      const textarea = textareaRef.current;
      if (!textarea) return;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = textarea.value;
      const newValue = text.substring(0, start) + '<br>' + text.substring(end);
      onChange(newValue);
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + 4, start + 4);
      }, 50);
    }
  };

  const clearFormatting = () => {
    if (activeTab === 'visual') {
      executeCommand('removeFormat');
      triggerChange();
    }
  };

  const handleTabChange = (newTab: 'visual' | 'code') => {
    if (newTab === activeTab) return;
    setActiveTab(newTab);
  };

  const insertImageUrl = () => {
    if (!imageUrl.trim()) return;
    if (activeTab === 'visual') {
      const imgHtml = `<div style="text-align: center; margin: 15px 0;"><img src="${imageUrl.trim()}" alt="صورة" style="max-width: 100%; height: auto; border-radius: 12px;" referrerPolicy="no-referrer" /></div>`;
      executeCommand('insertHTML', imgHtml);
    } else {
      const textarea = textareaRef.current;
      if (!textarea) return;
      const start = textarea.selectionStart;
      const text = textarea.value;
      const imgMarkup = `\n<div style="text-align: center; margin: 15px 0;"><img src="${imageUrl.trim()}" style="max-width: 100%; border-radius: 12px;" /></div>\n`;
      onChange(text.substring(0, start) + imgMarkup + text.substring(textarea.selectionEnd));
    }
    setImageUrl('');
    setShowImageInserter(false);
  };

  const presetSizes = [
    { label: 'صغير جداً (11px)', value: '11px' },
    { label: 'صغير (13px)', value: '13px' },
    { label: 'معتدل (15px)', value: '15px' },
    { label: 'كبير (18px)', value: '18px' },
    { label: 'كبير جداً (22px)', value: '22px' },
    { label: 'عريض (28px)', value: '28px' },
  ];

  const presetColors = [
    { name: 'افتراضي الهيكل', value: 'inherit' },
    { name: 'العسلي الدافئ', value: '#d97706' },
    { name: 'الدمشقي الأحمر', value: '#dc2626' },
    { name: 'الأخضر الروحاني', value: '#059669' },
    { name: 'الأزرق الفلسفي', value: '#2563eb' },
    { name: 'الرمادي الوقور', value: '#4b5563' },
    { name: 'الذهبي المتميز', value: '#d97706' },
  ];

  // Default Arabic placeholder from the screenshot to match absolutely
  const defaultPlaceholder = "تتحلل النظريات الأندلسية بمقاربات كبار المؤرخين... اكتب كامل المقال هنا واستعن بفلسفة التعديل!";

  return (
    <div className="space-y-2.5 font-sans text-right select-none" dir="rtl">
      
      {/* =========================================================================
          THE PRIMARY HEADER BAR - 100% IDENTICAL TO THE USER'S ATTACHED SCREENSHOT
          ========================================================================= */}
      <div className="flex flex-row items-center justify-between py-2 px-1 text-right gap-3 select-none w-full" dir="rtl">
        {/* Right side title exactly from the screenshot */}
        <span className="text-[12.5px] md:text-[14px] font-black text-[#1e293b] dark:text-[#f1f5f9] leading-6 select-none">
          نص وهيكل التدوينة التفصيلي (Content/HTML):
        </span>
        
        {/* Left side button strip exactly from the screenshot (rendered in correct RTL order) */}
        <div className="flex flex-row items-center gap-[6px] md:gap-[8px]">
          {/* Button 1: معاينة فورية (Blue/silver pill button with custom red indicator) */}
          <button
            type="button"
            onClick={() => handleTabChange(activeTab === 'visual' ? 'code' : 'visual')}
            className={`h-[30px] px-3 md:px-3.5 rounded-[8px] flex items-center gap-1.5 text-[11px] font-bold border transition-all cursor-pointer shadow-sm select-none ${
              activeTab === 'visual'
                ? 'bg-[#E0F2FE] hover:bg-sky-200 text-[#0369A1] border-sky-200/60 dark:bg-sky-950/45 dark:text-sky-300 dark:border-sky-900/30'
                : 'bg-amber-100 hover:bg-amber-200 text-amber-800 border-amber-200 dark:bg-amber-950/45 dark:text-amber-300 dark:border-amber-900/30'
            }`}
            title="تبديل معاينة المقال"
          >
            <span>معاينة فورية</span>
            <span className="w-3.5 h-3.5 rounded-full bg-[#8E1C2B] border border-[#fca5a5]/30 flex items-center justify-center text-[8.5px] text-white font-black shadow-inner select-none">
              👁️
            </span>
          </button>

          {/* WordPress Classic Tools Toggle Button */}
          {activeTab === 'visual' && (
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={`h-[30px] px-2.5 rounded-[8px] flex items-center gap-1 text-[11px] font-bold border transition-all cursor-pointer shadow-sm select-none ${
                showAdvanced
                  ? 'bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200'
                  : 'bg-[#F8FAFC] dark:bg-rose-950/20 text-[#334155] dark:text-rose-200 border-slate-300/50 dark:border-rose-900/30 hover:bg-slate-50'
              }`}
              title="تفعيل/تعطيل محاذاة وتكبير وأدوات ووردبريس كلاسيك"
            >
              <span>أدوات كلاسيكية</span>
              <span>🛠️</span>
            </button>
          )}

          {/* Button 4: سطر ↵ */}
          <button
            type="button"
            onClick={insertLineBreak}
            className="h-[30px] px-3.5 text-[11px] font-bold text-[#334155] dark:text-rose-100 bg-[#F8FAFC] dark:bg-rose-950/20 border border-slate-300/50 dark:border-rose-900/30 rounded-[8px] hover:bg-slate-50 dark:hover:bg-rose-955/30 cursor-pointer shadow-sm transition-all select-none"
            title="إدراج سطر جديد (BR)"
          >
            سطر ↵
          </button>

          {/* Button 3: H3 */}
          <button
            type="button"
            onClick={() => {
              if (activeTab === 'visual') {
                executeCommand('formatBlock', '<h3>');
              } else {
                wrapHtmlSelection('<h3>', '</h3>');
              }
            }}
            className="h-[30px] px-[14px] text-[11px] font-bold text-[#334155] dark:text-rose-100 bg-[#F8FAFC] dark:bg-rose-950/20 border border-slate-300/50 dark:border-rose-900/30 rounded-[8px] hover:bg-slate-50 dark:hover:bg-rose-955/30 cursor-pointer shadow-sm transition-all select-none"
            title="رأسية مقال H3"
          >
            H3
          </button>

          {/* Button 2: / (Italic) */}
          <button
            type="button"
            onClick={() => {
              if (activeTab === 'visual') {
                executeCommand('italic');
              } else {
                wrapHtmlSelection('<em>', '</em>');
              }
            }}
            className="w-[30px] h-[30px] flex items-center justify-center text-[12px] font-mono italic text-[#334155] dark:text-rose-100 bg-[#F8FAFC] dark:bg-rose-950/20 border border-slate-300/50 dark:border-rose-900/30 rounded-[8px] hover:bg-slate-50 dark:hover:bg-rose-955/30 cursor-pointer shadow-sm transition-all select-none"
            title="مائل (Italic)"
          >
            /
          </button>

          {/* Button 1: B (Bold) */}
          <button
            type="button"
            onClick={() => {
              if (activeTab === 'visual') {
                executeCommand('bold');
              } else {
                wrapHtmlSelection('<strong>', '</strong>');
              }
            }}
            className="w-[30px] h-[30px] flex items-center justify-center text-[12px] font-bold text-[#334155] dark:text-rose-100 bg-[#F8FAFC] dark:bg-rose-950/20 border border-slate-300/50 dark:border-rose-900/30 rounded-[8px] hover:bg-slate-50 dark:hover:bg-rose-955/30 cursor-pointer shadow-sm transition-all select-none"
            title="عريض (Bold)"
          >
            B
          </button>
        </div>
      </div>

      {/* =========================================================================
          MAIN EDITING CARD COMPONENT - Pure White Box matching screenshot beautifully
          ========================================================================= */}
      <div className="border border-slate-200 dark:border-rose-900/20 rounded-[14px] overflow-hidden bg-white dark:bg-[#120105]/75 shadow-sm">
        
        {/* =========================================================================
            COLLAPSIBLE CLASSIC WORDPRESS TOOLBAR (TinyMCE Simulator)
            ========================================================================= */}
        <AnimatePresence>
          {showAdvanced && activeTab === 'visual' && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="relative z-30 border-b border-slate-100 dark:border-rose-955/10 bg-[#FAF9F5] dark:bg-[#1C0409] px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-slate-700 dark:text-rose-200 select-none animate-in fade-in"
              dir="rtl"
            >
              {/* Option Bar list simulation */}
              <div className="flex items-center gap-3 text-[10.5px] font-black text-slate-400 dark:text-rose-400 border-l border-slate-200/70 dark:border-rose-900/30 pl-3">
                <span className="hover:text-amber-500 cursor-pointer transition-colors">ملف</span>
                <span className="hover:text-amber-500 cursor-pointer transition-colors">تعديل</span>
                <span className="hover:text-amber-500 cursor-pointer transition-colors">إدراج</span>
                <span className="hover:text-[#db2777] cursor-pointer transition-colors">تنسيق</span>
                <span className="hover:text-amber-500 cursor-pointer transition-colors">أدوات</span>
              </div>

              {/* TinyMCE Classic Kitchen Sink Toolbar buttons */}
              <div className="flex flex-wrap items-center gap-1.5 grow justify-start sm:justify-end">
                
                {/* Alignments group */}
                <div className="flex items-center bg-white dark:bg-[#20050D] rounded-lg p-0.5 border border-slate-200 dark:border-rose-900/20 shadow-sm">
                  <button
                    type="button"
                    onClick={() => executeCommand('justifyRight')}
                    className="p-1 px-[6px] hover:bg-slate-100 dark:hover:bg-rose-900/30 rounded text-slate-700 dark:text-rose-200 cursor-pointer transition-all"
                    title="محاذاة لليمين"
                  >
                    <AlignRight size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => executeCommand('justifyCenter')}
                    className="p-1 px-[6px] hover:bg-slate-100 dark:hover:bg-rose-900/30 rounded text-slate-700 dark:text-rose-200 cursor-pointer transition-all"
                    title="توسيط المحاذاة"
                  >
                    <AlignCenter size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => executeCommand('justifyLeft')}
                    className="p-1 px-[6px] hover:bg-slate-100 dark:hover:bg-rose-900/30 rounded text-slate-700 dark:text-rose-200 cursor-pointer transition-all"
                    title="محاذاة لليسار"
                  >
                    <AlignLeft size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => executeCommand('justifyFull')}
                    className="p-1 px-[6px] hover:bg-slate-100 dark:hover:bg-rose-900/30 rounded text-slate-700 dark:text-rose-200 cursor-pointer transition-all"
                    title="ضبط الهوامش بالكامل (Justify)"
                  >
                    <AlignJustify size={13} />
                  </button>
                </div>

                {/* Font dimension scale dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setShowSizePicker(!showSizePicker);
                      setShowColorPicker(false);
                    }}
                    className="h-[24px] px-2 rounded-lg border bg-white dark:bg-[#20050D] border-slate-200/80 dark:border-rose-900/20 text-slate-700 dark:text-rose-100 hover:bg-[#F8FAFC] text-[9.5px] font-bold cursor-pointer flex items-center gap-1 shadow-sm transition-all"
                  >
                    <Type size={10} />
                    <span>مقاس الخط</span>
                  </button>
                  {showSizePicker && (
                    <div className="absolute right-0 top-full mt-1 w-36 bg-white dark:bg-[#20050D] rounded-xl border border-slate-200/85 dark:border-rose-900/40 shadow-xl z-50 overflow-hidden divide-y divide-slate-100 dark:divide-rose-955/25 animate-in fade-in slide-in-from-top-1 duration-100 text-right" dir="rtl">
                      {presetSizes.map(size => (
                        <button
                          key={size.value}
                          type="button"
                          onClick={() => applyCustomStyle('font-size', size.value)}
                          className="w-full text-right px-2.5 py-1.5 text-[10px] font-bold hover:bg-amber-400 hover:text-slate-900 dark:hover:bg-amber-500 transition-colors flex items-center justify-between"
                        >
                          <span>{size.label}</span>
                          <span style={{ fontSize: size.value }}>أ</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Font color dropper selector */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setShowColorPicker(!showColorPicker);
                      setShowSizePicker(false);
                    }}
                    className="h-[24px] px-2 rounded-lg border bg-white dark:bg-[#20050D] border-slate-200/80 dark:border-rose-900/20 text-slate-700 dark:text-rose-100 hover:bg-[#F8FAFC] text-[9.5px] font-bold cursor-pointer flex items-center gap-1 shadow-sm transition-all"
                  >
                    <Palette size={10} className="text-amber-500" />
                    <span>لون الخط</span>
                  </button>
                  {showColorPicker && (
                    <div className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-[#20050D] rounded-xl border border-slate-200/85 dark:border-rose-900/40 shadow-xl z-50 overflow-hidden divide-y divide-slate-100 dark:divide-rose-955/20 animate-in fade-in slide-in-from-top-1 duration-100 text-right" dir="rtl">
                      {presetColors.map(color => (
                        <button
                          key={color.value}
                          type="button"
                          onClick={() => applyCustomStyle('color', color.value)}
                          className="w-full text-right px-2.5 py-1.5 text-[10px] font-bold hover:bg-slate-50 dark:hover:bg-rose-950/40 transition-colors flex items-center gap-2"
                        >
                          <span className="w-2.5 h-2.5 rounded-full border border-black/10 flex-shrink-0" style={{ backgroundColor: color.value === 'inherit' ? 'transparent' : color.value }} />
                          <span className="text-slate-800 dark:text-rose-150">{color.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Bullets, numbers, separator lines */}
                <div className="flex items-center bg-white dark:bg-[#20050D] rounded-lg p-0.5 border border-slate-200 dark:border-rose-900/20 shadow-sm">
                  <button
                    type="button"
                    onClick={() => executeCommand('insertUnorderedList')}
                    className="p-1 hover:bg-slate-150 rounded text-slate-700"
                    title="قائمة نقطية"
                  >
                    <List size={12} />
                  </button>
                  <button
                    type="button"
                    onClick={() => executeCommand('insertOrderedList')}
                    className="p-1 hover:bg-slate-150 rounded text-slate-700"
                    title="قائمة رقمية"
                  >
                    <ListOrdered size={12} />
                  </button>
                  <button
                    type="button"
                    onClick={() => executeCommand('formatBlock', '<blockquote>')}
                    className="p-1 px-[6px] hover:bg-slate-150 rounded text-slate-700 text-[10px] font-black"
                    title="اقتباس أدبي"
                  >
                    ”
                  </button>
                  <button
                    type="button"
                    onClick={() => executeCommand('insertHorizontalRule')}
                    className="p-1 hover:bg-slate-150 rounded text-slate-700"
                    title="إدراج فاصل سطر"
                  >
                    <Minus size={12} />
                  </button>
                </div>

                {/* Image Insertion option */}
                <button
                  type="button"
                  onClick={() => setShowImageInserter(!showImageInserter)}
                  className="h-[24px] px-2 rounded-lg border bg-white dark:bg-[#20050D] border-slate-200/80 dark:border-rose-900/20 text-slate-700 dark:text-rose-100 hover:bg-[#F8FAFC] text-[9.5px] font-bold cursor-pointer flex items-center gap-1 shadow-sm transition-all"
                  title="تضمين صورة ذكية"
                >
                  <Image size={10} />
                  <span>تضمين صورة</span>
                </button>

                {/* Font Zooms */}
                <div className="flex items-center gap-1 bg-white dark:bg-[#20050D] rounded-lg p-0.5 border border-slate-200 dark:border-rose-900/20 shadow-sm px-1.5 h-[24px]">
                  <button
                    type="button"
                    onClick={() => setEditorFontSize(prev => Math.max(prev - 1, 10))}
                    className="p-0.5 hover:bg-slate-100 rounded text-slate-500 cursor-pointer"
                    title="تصغير خط الكتابة"
                  >
                    <ZoomOut size={9} />
                  </button>
                  <span className="text-[9px] font-mono font-bold text-slate-500 select-none">{editorFontSize}px</span>
                  <button
                    type="button"
                    onClick={() => setEditorFontSize(prev => Math.min(prev + 1, 30))}
                    className="p-0.5 hover:bg-slate-100 rounded text-slate-500 cursor-pointer"
                    title="تكبير خط الكتابة"
                  >
                    <ZoomIn size={9} />
                  </button>
                </div>

                {/* Clear style formatting */}
                <button
                  type="button"
                  onClick={clearFormatting}
                  className="p-1 hover:bg-slate-100 border border-slate-200/70 rounded text-[#EF4444] cursor-pointer shadow-sm bg-white"
                  title="تطهير ومسح جميع التنسيقات الملوحة"
                >
                  <Eraser size={11} />
                </button>

                {/* Complete Reset */}
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('هل تود تفريغ نص الرق والبدء من جديد؟')) {
                      onChange('');
                      if (editorRef.current) editorRef.current.innerHTML = '';
                    }
                  }}
                  className="p-1 px-1.5 bg-rose-500/10 hover:bg-rose-500 hover:text-white border border-rose-500/25 text-[9px] font-black text-rose-600 rounded-lg transition-all cursor-pointer shadow-none flex items-center gap-0.5"
                  title="تصفير كلي للنص"
                >
                  <Trash2 size={10} />
                  <span>تفريغ</span>
                </button>

              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Image insertion URL widget card */}
        {showImageInserter && (
          <div className="p-3 bg-slate-50 dark:bg-[#1C0409] border-b border-slate-100 dark:border-rose-955/10 flex flex-wrap gap-2 items-center text-[11px] font-bold">
            <span className="text-slate-700 dark:text-rose-200">ضع رابط الصورة المباشر:</span>
            <input
              type="text"
              placeholder="https://example.com/art.jpg"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="grow px-3 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-rose-900/30 rounded-lg text-[11px] text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
            <button
              type="button"
              onClick={insertImageUrl}
              className="px-3 py-1 bg-amber-400 hover:bg-amber-300 text-slate-900 rounded-lg font-black"
            >
              تضمين
            </button>
            <button
              type="button"
              onClick={() => setShowImageInserter(false)}
              className="px-2 py-1 bg-slate-200 text-slate-600 dark:bg-rose-950/20 dark:text-rose-200 rounded-lg animate-pulse"
            >
              إلغاء
            </button>
          </div>
        )}

        {/* =========================================================================
            THE VISUAL OR CODE EDITABLE REGION (White canvas background)
            ========================================================================= */}
        <div className="bg-white dark:bg-transparent min-h-[300px] flex flex-col cursor-text relative">
          {activeTab === 'visual' ? (
            <div
              ref={editorRef}
              contentEditable
              onInput={triggerChange}
              onBlur={triggerChange}
              placeholder={placeholder || defaultPlaceholder}
              style={{ fontSize: `${editorFontSize}px` }}
              className="w-full grow p-6 md:p-8 bg-transparent text-slate-800 dark:text-slate-100 min-h-[320px] leading-relaxed border-none focus:ring-0 focus:outline-none placeholder:text-slate-400/90 font-sans text-right select-text focus-within:ring-2 focus-within:ring-amber-500/5 overflow-y-auto block format-visual-block cursor-text resize-y"
            />
          ) : (
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder || defaultPlaceholder}
              style={{ fontSize: `${editorFontSize}px` }}
              className="w-full grow p-6 md:p-8 bg-[#1A0308]/5 dark:bg-[#070102]/85 text-slate-800 dark:text-emerald-400 font-mono min-h-[320px] leading-relaxed border-none focus:ring-0 focus:outline-none placeholder:text-slate-500 text-right direction-ltr focus-within:ring-2 focus-within:ring-amber-400/25 overflow-y-auto block cursor-text resize-y"
            />
          )}

          {/* Graphical Resize Handle Diagonal Lines in Bottom-Left Corner (100% Identical to the Screenshot Grabber) */}
          <div className="absolute bottom-[4.5px] left-[4.5px] w-3 h-3 pointer-events-none select-none opacity-40 hover:opacity-80 transition-opacity flex flex-col justify-end items-start [transform:rotate(45deg)]" dir="ltr">
            <div className="w-[10px] h-[1px] bg-slate-400 dark:bg-rose-300 mb-[1.5px]" />
            <div className="w-[6px] h-[1px] bg-slate-400 dark:bg-rose-300 mb-[1.5px]" />
            <div className="w-[2px] h-[1px] bg-slate-400 dark:bg-rose-300" />
          </div>
        </div>

        {/* Bottom stats metrics row */}
        <div className="flex justify-between items-center px-4 py-2 bg-slate-50 dark:bg-[#110105]/75 border-t border-slate-100 dark:border-rose-955/15 text-[9.5px] font-mono text-slate-500 dark:text-rose-350 select-none">
          <span>الحروف المكتوبة: <span className="text-emerald-600 dark:text-amber-400 font-bold">{value?.length || 0}</span> حرف</span>
          <span>الكلمات: <span className="text-sky-600 dark:text-amber-400 font-bold">{value?.trim() ? value.trim().split(/\s+/).length : 0}</span> كلمة</span>
          <span>نمط المحاذاة الشامل: تدفق حر (RTL)</span>
        </div>

      </div>

      {/* Embedded pristine alignments CSS renderer */}
      <style>{`
        .format-visual-block blockquote {
          border-right: 4px solid #f59e0b;
          padding-right: 12px;
          margin-right: 6px;
          font-style: italic;
          color: #4b5563;
        }
        .dark .format-visual-block blockquote {
          border-right-color: #fbbf24;
          color: #d1d5db;
        }
        .format-visual-block ul {
          list-style-type: disc !important;
          padding-right: 24px;
          margin: 10px 0;
        }
        .format-visual-block ol {
          list-style-type: decimal !important;
          padding-right: 24px;
          margin: 10px 0;
        }
        .format-visual-block h1 {
          font-size: 1.8em;
          font-weight: 850;
          margin: 15px 0 10px 0;
          color: #1e3a8a;
        }
        .dark .format-visual-block h1 {
          color: #fbbf24;
        }
        .format-visual-block h2 {
          font-size: 1.5em;
          font-weight: 800;
          margin: 12px 0 8px 0;
          color: #0c4a6e;
        }
        .dark .format-visual-block h2 {
          color: #f59e0b;
        }
        .format-visual-block h3 {
          font-size: 1.25em;
          font-weight: 800;
          margin: 10px 0 6px 0;
          color: #111827;
        }
        .dark .format-visual-block h3 {
          color: #fef08a;
        }
        .format-visual-block img {
          max-width: 100%;
          border-radius: 12px;
          margin: 15px auto;
          display: block;
        }
        .format-visual-block p {
          margin-bottom: 0.75rem;
          line-height: 1.8;
        }
        .format-visual-block:empty::before {
          content: attr(placeholder);
          color: #94a3b8;
          display: block;
        }
      `}</style>

    </div>
  );
}
