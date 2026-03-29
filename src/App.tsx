import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  doc, 
  deleteDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { useAuth, AuthProvider } from './hooks/useAuth';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { 
  BookOpen, 
  Plus, 
  Trash2, 
  ExternalLink, 
  CheckCircle, 
  User, 
  LogOut, 
  LayoutDashboard, 
  Settings, 
  ChevronRight, 
  ArrowLeft, 
  Eye, 
  BarChart3, 
  Globe, 
  FileText, 
  HelpCircle,
  GraduationCap,
  Edit2,
  Save,
  X,
  Image as ImageIcon,
  Youtube,
  Sun,
  Moon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import Markdown from 'react-markdown';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types ---
interface Step {
  id: string;
  type: 'web-app' | 'content' | 'quiz' | 'firebase-studio';
  title: string;
  content: string;
  layout?: 'full' | 'split';
  order: number;
}

interface Scenario {
  id: string;
  title: string;
  description: string;
  teacherId: string;
  backgroundImage?: string;
  backgroundOpacity?: number;
  steps: Step[];
  createdAt: any;
}

interface Progress {
  id: string;
  userId: string;
  scenarioId: string;
  completedSteps: string[];
  lastUpdated: any;
}

interface ProfileContent {
  id?: string;
  userId: string;
  type: 'about' | 'academic';
  content: string;
  images: string[];
  backgroundImage?: string;
  backgroundOpacity?: number;
  lastUpdated?: any;
}

interface TabSettings {
  id?: string;
  userId: string;
  tabId: string;
  backgroundImage: string;
  backgroundOpacity: number;
}

// --- Error Handling ---

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  // We don't throw here to avoid crashing the app, but we log it clearly
}

// --- Hooks ---

function useTabSettings(tabId: string) {
  const { profile } = useAuth();
  const [settings, setSettings] = useState<TabSettings | null>(null);

  useEffect(() => {
    if (!profile) return;
    const q = query(collection(db, 'tab_settings'), where('userId', '==', profile.uid), where('tabId', '==', tabId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        setSettings({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as TabSettings);
      } else {
        setSettings(null);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'tab_settings');
    });
    return () => unsubscribe();
  }, [profile, tabId]);

  const saveSettings = async (url: string, opacity: number) => {
    if (!profile) return;
    const data = {
      userId: profile.uid,
      tabId,
      backgroundImage: url,
      backgroundOpacity: opacity
    };

    try {
      if (settings?.id) {
        await updateDoc(doc(db, 'tab_settings', settings.id), data);
      } else {
        await addDoc(collection(db, 'tab_settings'), data);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'tab_settings');
    }
  };

  return { settings, saveSettings };
}

// --- Components ---

function Login() {
  const { signIn } = useAuth();
  const { t } = useLanguage();
  return (
    <div className="min-h-screen flex items-center justify-center bg-warm-bg font-sans relative overflow-hidden">
      <div className="grain-overlay" />
      <div className="absolute top-[-10%] left-[-10%] w-[40%] aspect-square bg-olive-50 rounded-full blur-[120px] opacity-50" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] aspect-square bg-stone-200 rounded-full blur-[120px] opacity-30" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-xl p-12 rounded-[40px] shadow-2xl shadow-stone-200/50 max-w-md w-full text-center border border-white relative z-10"
      >
        <div className="w-24 h-24 bg-olive-600 rounded-[32px] flex items-center justify-center mx-auto mb-10 shadow-xl shadow-olive-600/20 rotate-3">
          <BookOpen className="text-white w-12 h-12 -rotate-3" />
        </div>
        <h1 className="text-5xl font-display font-medium tracking-tight text-stone-900 mb-4">{t('appName')}</h1>
        <p className="font-serif text-lg text-stone-500 mb-12 leading-relaxed italic">
          {t('loginTagline')}
        </p>
        <button 
          onClick={signIn}
          className="w-full bg-olive-600 text-white py-5 rounded-full font-medium hover:bg-olive-700 transition-all flex items-center justify-center gap-3 shadow-lg shadow-olive-600/20 group"
        >
          <User className="w-5 h-5 group-hover:scale-110 transition-transform" />
          {t('signInWithGoogle')}
        </button>
        
        <div className="mt-12 pt-8 border-t border-stone-100">
          <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400">{t('educationalExcellence')}</p>
        </div>
      </motion.div>
    </div>
  );
}

function RoleSelection() {
  const { setRole } = useAuth();
  const { t } = useLanguage();
  return (
    <div className="min-h-screen flex items-center justify-center bg-warm-bg font-sans relative">
      <div className="grain-overlay" />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-16 rounded-[48px] shadow-2xl shadow-stone-200/50 max-w-3xl w-full text-center border border-white"
      >
        <h2 className="text-5xl font-display font-medium tracking-tight text-stone-900 mb-6">{t('welcomeTo')} <span className="italic font-serif">{t('appName')}</span></h2>
        <p className="font-serif text-lg text-stone-500 mb-16 italic">{t('selectPath')}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <button 
            onClick={() => setRole('teacher')}
            className="group p-12 rounded-[40px] border border-stone-100 hover:border-olive-600 hover:bg-olive-50 transition-all text-left relative overflow-hidden"
          >
            <div className="w-16 h-16 bg-olive-50 rounded-[24px] flex items-center justify-center mb-8 group-hover:bg-olive-600 group-hover:text-white transition-all shadow-sm">
              <Settings className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-display font-medium text-stone-900 mb-3">{t('educator')}</h3>
            <p className="font-serif text-stone-500 text-sm leading-relaxed italic">{t('educatorDesc')}</p>
          </button>
          <button 
            onClick={() => setRole('student')}
            className="group p-12 rounded-[40px] border border-stone-100 hover:border-stone-900 hover:bg-stone-50 transition-all text-left relative overflow-hidden"
          >
            <div className="w-16 h-16 bg-stone-50 rounded-[24px] flex items-center justify-center mb-8 group-hover:bg-stone-900 group-hover:text-white transition-all shadow-sm">
              <User className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-display font-medium text-stone-900 mb-3">{t('learner')}</h3>
            <p className="font-serif text-stone-500 text-sm leading-relaxed italic">{t('learnerDesc')}</p>
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function Sidebar({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (tab: string) => void }) {
  const { profile, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  
  const tabs = profile?.role === 'teacher' 
    ? [
        { id: 'scenarios', icon: LayoutDashboard, label: t('scenarios') },
        { id: 'progress', icon: BarChart3, label: t('progress') },
        { id: 'educational-apps', icon: Globe, label: t('educationalApps') },
        { id: 'about', icon: User, label: t('aboutMe') },
        { id: 'academic', icon: GraduationCap, label: t('academicWork') },
      ]
    : [
        { id: 'my-scenarios', icon: BookOpen, label: t('myLearning') },
        { id: 'educational-apps', icon: Globe, label: t('educationalApps') },
        { id: 'about', icon: User, label: t('aboutMe') },
        { id: 'academic', icon: GraduationCap, label: t('academicWork') },
      ];

  return (
    <div className="w-80 bg-warm-paper dark:bg-dark-paper border-r border-stone-200/50 dark:border-dark-border flex flex-col h-screen sticky top-0 transition-colors duration-300">
      <div className="p-10">
        <div className="flex items-center gap-4 mb-16">
          <div className="w-12 h-12 bg-olive-600 rounded-2xl flex items-center justify-center shadow-lg shadow-olive-600/20 rotate-3">
            <BookOpen className="text-white w-7 h-7 -rotate-3" />
          </div>
          <span className="text-2xl font-display font-medium tracking-tight text-stone-900 dark:text-stone-100">{t('appName')}</span>
        </div>
        
        <nav className="space-y-3">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-medium transition-all group",
                activeTab === tab.id 
                  ? "bg-olive-600 text-white shadow-xl shadow-olive-600/20 dark:shadow-stone-900/50" 
                  : "text-stone-500 dark:text-stone-400 hover:bg-white dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-stone-100 hover:shadow-sm"
              )}
            >
              <tab.icon className={cn("w-5 h-5 transition-transform", activeTab === tab.id ? "" : "group-hover:scale-110")} />
              <span className={cn(activeTab === tab.id ? "" : "font-serif italic")}>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>
      
      <div className="mt-auto p-10">
        <div className="flex items-center gap-2 p-2 bg-white/50 dark:bg-dark-paper/50 backdrop-blur-sm rounded-2xl border border-white dark:border-dark-border mb-4">
          <button
            onClick={toggleTheme}
            className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-sm"
          >
            {theme === 'light' ? (
              <>
                <Sun className="w-3 h-3" /> {t('lightMode')}
              </>
            ) : (
              <>
                <Moon className="w-3 h-3" /> {t('darkMode')}
              </>
            )}
          </button>
        </div>

        <div className="flex items-center gap-2 p-2 bg-white/50 dark:bg-dark-paper/50 backdrop-blur-sm rounded-2xl border border-white dark:border-dark-border mb-6">
          <button
            onClick={() => setLanguage('en')}
            className={cn(
              "flex-1 py-2 px-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
              language === 'en' ? "bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-sm" : "text-stone-400 hover:text-stone-600 dark:hover:text-stone-300"
            )}
          >
            EN
          </button>
          <button
            onClick={() => setLanguage('el')}
            className={cn(
              "flex-1 py-2 px-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
              language === 'el' ? "bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-sm" : "text-stone-400 hover:text-stone-600 dark:hover:text-stone-300"
            )}
          >
            ΕΛ
          </button>
        </div>

        <div className="bg-white/50 dark:bg-dark-paper/50 backdrop-blur-sm p-6 rounded-[32px] border border-white dark:border-dark-border mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-olive-50 dark:bg-olive-900/20 rounded-full flex items-center justify-center text-olive-700 dark:text-olive-400 font-display font-bold text-lg border border-olive-100 dark:border-olive-900/30">
              {profile?.displayName?.[0] || profile?.email?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-stone-900 dark:text-stone-100 truncate">{profile?.displayName}</p>
              <p className="text-[10px] uppercase tracking-widest text-stone-400 dark:text-stone-500 font-bold">
                {profile?.role === 'teacher' ? t('roleEducator') : t('roleLearner')}
              </p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
          >
            <LogOut className="w-4 h-4" />
            {t('logout')}
          </button>
        </div>
        <p className="text-[10px] text-center text-stone-300 uppercase tracking-[0.3em] font-bold">v1.0.4</p>
      </div>
    </div>
  );
}

// --- Teacher Views ---

function ScenarioEditor({ scenario, onSave, onCancel }: { scenario?: Scenario, onSave: (s: Partial<Scenario>) => void, onCancel: () => void }) {
  const { t } = useLanguage();
  const [title, setTitle] = useState(scenario?.title || '');
  const [description, setDescription] = useState(scenario?.description || '');
  const [backgroundImage, setBackgroundImage] = useState(scenario?.backgroundImage || '');
  const [backgroundOpacity, setBackgroundOpacity] = useState(scenario?.backgroundOpacity ?? 0.1);
  const [steps, setSteps] = useState<Step[]>(scenario?.steps || []);
  const [showVisualSettings, setShowVisualSettings] = useState(false);

  const addStep = (type: Step['type']) => {
    const newStep: Step = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      title: `New ${type}`,
      content: '',
      order: steps.length
    };
    setSteps([...steps, newStep]);
  };

  const updateStep = (id: string, updates: Partial<Step>) => {
    setSteps(steps.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const removeStep = (id: string) => {
    setSteps(steps.filter(s => s.id !== id));
  };

  return (
    <div className="max-w-5xl mx-auto py-16 px-10">
      <div className="flex items-center justify-between mb-16">
        <button onClick={onCancel} className="flex items-center gap-3 text-stone-400 hover:text-stone-900 transition-all font-serif italic">
          <ArrowLeft className="w-5 h-5" /> {t('backToDashboard')}
        </button>
        <button 
          onClick={() => onSave({ title, description, steps, backgroundImage, backgroundOpacity })}
          className="bg-olive-600 text-white px-10 py-4 rounded-[20px] font-bold hover:bg-olive-700 transition-all shadow-xl shadow-olive-100 flex items-center gap-3"
        >
          <CheckCircle className="w-5 h-5" /> {t('save')}
        </button>
      </div>

      <div className="flex items-center gap-4 mb-12">
        <button 
          onClick={() => setShowVisualSettings(!showVisualSettings)}
          className="flex items-center gap-3 px-8 py-4 bg-warm-paper rounded-[20px] text-sm font-bold text-stone-900 hover:bg-stone-100 transition-all border border-stone-100 shadow-sm"
        >
          <Settings className="w-5 h-5 text-olive-600" /> {t('backgroundAesthetic')}
        </button>
      </div>

      <AnimatePresence>
        {showVisualSettings && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-16"
          >
            <div className="bg-white/80 backdrop-blur-md p-10 rounded-[40px] border border-stone-100 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-3">
                <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400 ml-1">{t('imageUrl')}</label>
                <input 
                  type="url" 
                  placeholder="https://images.unsplash.com/..."
                  value={backgroundImage}
                  onChange={(e) => setBackgroundImage(e.target.value)}
                  className="w-full bg-stone-50/50 border border-stone-100 rounded-[16px] px-5 py-4 text-sm focus:ring-2 focus:ring-olive-500/20 transition-all"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400 ml-1">{t('opacity')} ({Math.round(backgroundOpacity * 100)}%)</label>
                <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.05"
                  value={backgroundOpacity}
                  onChange={(e) => setBackgroundOpacity(parseFloat(e.target.value))}
                  className="w-full h-2 bg-stone-100 rounded-lg appearance-none cursor-pointer accent-olive-600"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-10 mb-20">
        <input 
          type="text" 
          placeholder={t('scenarioTitle')}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-6xl font-display font-medium tracking-tight text-stone-900 w-full bg-transparent border-none focus:ring-0 placeholder:text-stone-200 p-0"
        />
        <textarea 
          placeholder={t('scenarioDesc')}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="text-2xl font-serif italic text-stone-500 w-full bg-transparent border-none focus:ring-0 placeholder:text-stone-200 resize-none h-32 p-0 leading-relaxed"
        />
      </div>

      <div className="space-y-10">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-display font-medium text-stone-900">{t('modules')}</h3>
          <div className="flex gap-3">
            <button onClick={() => addStep('content')} className="flex items-center gap-2 px-5 py-3 bg-warm-paper rounded-[16px] text-xs font-bold text-stone-600 hover:bg-stone-100 transition-all border border-stone-100">
              <FileText className="w-4 h-4" /> {t('content')}
            </button>
            <button onClick={() => addStep('web-app')} className="flex items-center gap-2 px-5 py-3 bg-warm-paper rounded-[16px] text-xs font-bold text-stone-600 hover:bg-stone-100 transition-all border border-stone-100">
              <Globe className="w-4 h-4" /> {t('webApp')}
            </button>
            <button onClick={() => addStep('firebase-studio')} className="flex items-center gap-2 px-5 py-3 bg-olive-50 text-olive-700 rounded-[16px] text-xs font-bold hover:bg-olive-100 transition-all border border-olive-100">
              <Settings className="w-4 h-4" /> {t('firebaseStudio')}
            </button>
            <button onClick={() => addStep('quiz')} className="flex items-center gap-2 px-5 py-3 bg-warm-paper rounded-[16px] text-xs font-bold text-stone-600 hover:bg-stone-100 transition-all border border-stone-100">
              <HelpCircle className="w-4 h-4" /> {t('quiz')}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {steps.map((step, index) => (
            <motion.div 
              key={step.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white/80 backdrop-blur-md p-10 rounded-[40px] border border-stone-100 shadow-sm relative group hover:shadow-xl transition-all"
            >
              <div className="flex items-start gap-8">
                <div className="w-12 h-12 bg-stone-50 rounded-[20px] flex items-center justify-center text-stone-400 font-display font-medium text-lg shrink-0 border border-stone-100">
                  {index + 1}
                </div>
                <div className="flex-1 space-y-6">
                  <div className="flex items-center justify-between">
                    <input 
                      type="text" 
                      value={step.title}
                      onChange={(e) => updateStep(step.id, { title: e.target.value })}
                      className="text-2xl font-display font-medium text-stone-900 bg-transparent border-none focus:ring-0 p-0 w-full"
                    />
                    <button onClick={() => removeStep(step.id)} className="text-stone-300 hover:text-red-500 transition-all p-2 hover:bg-red-50 rounded-xl">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  
                  {(step.type === 'web-app' || step.type === 'firebase-studio') && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400 ml-1">URL</label>
                        <input 
                          type="url" 
                          placeholder="https://example.com"
                          value={step.content}
                          onChange={(e) => updateStep(step.id, { content: e.target.value })}
                          className="w-full bg-stone-50/50 border border-stone-100 rounded-[16px] px-5 py-4 text-sm focus:ring-2 focus:ring-olive-500/20 transition-all"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400 ml-1">{t('stepLayout')}</label>
                        <div className="flex gap-3">
                          <button 
                            onClick={() => updateStep(step.id, { layout: 'full' })}
                            className={cn(
                              "flex-1 py-4 rounded-[16px] text-xs font-bold transition-all border",
                              step.layout === 'full' || !step.layout 
                                ? "bg-stone-900 text-white border-stone-900 shadow-lg" 
                                : "bg-stone-50/50 text-stone-400 border-stone-100 hover:bg-stone-100"
                            )}
                          >
                            {t('fullWidth')}
                          </button>
                          <button 
                            onClick={() => updateStep(step.id, { layout: 'split' })}
                            className={cn(
                              "flex-1 py-4 rounded-[16px] text-xs font-bold transition-all border",
                              step.layout === 'split' 
                                ? "bg-stone-900 text-white border-stone-900 shadow-lg" 
                                : "bg-stone-50/50 text-stone-400 border-stone-100 hover:bg-stone-100"
                            )}
                          >
                            {t('splitScreen')}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {step.type === 'content' && (
                    <div className="space-y-3">
                      <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400 ml-1">{t('stepContent')}</label>
                      <textarea 
                        placeholder={t('addContent')}
                        value={step.content}
                        onChange={(e) => updateStep(step.id, { content: e.target.value })}
                        className="w-full bg-stone-50/50 border border-stone-100 rounded-[16px] px-5 py-4 text-sm focus:ring-2 focus:ring-olive-500/20 h-40 resize-none transition-all leading-relaxed"
                      />
                    </div>
                  )}

                  {step.type === 'quiz' && (
                    <div className="space-y-3">
                      <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400 ml-1">{t('quizQuestion')}</label>
                      <textarea 
                        placeholder={t('enterQuizQuestion')}
                        value={step.content}
                        onChange={(e) => updateStep(step.id, { content: e.target.value })}
                        className="w-full bg-stone-50/50 border border-stone-100 rounded-[16px] px-5 py-4 text-sm focus:ring-2 focus:ring-olive-500/20 h-24 resize-none transition-all"
                      />
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {steps.length === 0 && (
          <div className="py-24 text-center border-2 border-dashed border-stone-100 rounded-[40px] bg-warm-paper/30">
            <p className="font-serif italic text-stone-400 text-lg">No steps added yet. Start by adding content or a web app.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function TeacherDashboard() {
  const { profile } = useAuth();
  const { t } = useLanguage();
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [editingScenario, setEditingScenario] = useState<Scenario | null | 'new'>(null);
  const [previewScenario, setPreviewScenario] = useState<Scenario | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showBgSettings, setShowBgSettings] = useState(false);
  const { settings, saveSettings } = useTabSettings('scenarios');

  useEffect(() => {
    if (!profile) return;
    const q = query(collection(db, 'scenarios'), where('teacherId', '==', profile.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setScenarios(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Scenario)));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'scenarios');
    });
    return unsubscribe;
  }, [profile]);

  const handleSave = async (data: Partial<Scenario>) => {
    if (!profile) return;
    try {
      if (editingScenario === 'new') {
        await addDoc(collection(db, 'scenarios'), {
          ...data,
          teacherId: profile.uid,
          createdAt: serverTimestamp()
        });
      } else if (editingScenario) {
        await updateDoc(doc(db, 'scenarios', editingScenario.id), data);
      }
      setEditingScenario(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'scenarios');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'scenarios', id));
      setDeletingId(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'scenarios');
    }
  };

  if (editingScenario) {
    return (
      <ScenarioEditor 
        scenario={editingScenario === 'new' ? undefined : editingScenario} 
        onSave={handleSave} 
        onCancel={() => setEditingScenario(null)} 
      />
    );
  }

  if (previewScenario) {
    return (
      <ScenarioViewer 
        scenario={previewScenario} 
        onBack={() => setPreviewScenario(null)} 
      />
    );
  }

  return (
    <div className="relative min-h-screen">
      <TabBackground url={settings?.backgroundImage} opacity={settings?.backgroundOpacity} />
      
      <div className="p-16 max-w-7xl mx-auto relative z-10">
        <div className="flex items-center justify-between mb-20">
          <div>
            <h1 className="text-5xl font-display font-medium tracking-tight text-stone-900 mb-3">{t('scenarios')}</h1>
            <p className="font-serif text-lg text-stone-500 italic">Design and manage your educational experiences.</p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => setShowBgSettings(!showBgSettings)}
              className="p-5 bg-white dark:bg-dark-paper border border-stone-200 dark:border-dark-border rounded-[24px] text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800 transition-all shadow-sm"
              title={t('backgroundAesthetic')}
            >
              <Settings className="w-6 h-6" />
            </button>
            <button 
              onClick={() => setEditingScenario('new')}
              className="bg-olive-600 text-white px-10 py-5 rounded-[24px] font-bold hover:bg-olive-700 transition-all flex items-center gap-3 shadow-xl shadow-olive-100"
            >
              <Plus className="w-6 h-6" />
              {t('createScenario')}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {showBgSettings && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-12 overflow-hidden"
            >
              <BackgroundSettings 
                backgroundImage={settings?.backgroundImage || ''}
                backgroundOpacity={settings?.backgroundOpacity ?? 0.1}
                onSave={(url, opacity) => {
                  saveSettings(url, opacity);
                  setShowBgSettings(false);
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {scenarios.map((scenario) => (
            <motion.div 
              key={scenario.id}
              layoutId={scenario.id}
              className="bg-white dark:bg-dark-paper p-10 rounded-[40px] border border-stone-100 dark:border-dark-border shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all group relative overflow-hidden"
            >
              {scenario.backgroundImage && (
                <div 
                  className="absolute inset-0 pointer-events-none z-0"
                  style={{ 
                    backgroundImage: `url(${scenario.backgroundImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    opacity: scenario.backgroundOpacity ?? 0.1
                  }}
                />
              )}
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-8">
                  <div className="w-14 h-14 bg-olive-50 dark:bg-olive-900/20 rounded-[20px] flex items-center justify-center text-olive-600 dark:text-olive-400 shadow-sm border border-olive-100 dark:border-olive-900/30">
                    <BookOpen className="w-7 h-7" />
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                    <button 
                      onClick={() => setPreviewScenario(scenario)}
                      className="p-3 bg-white dark:bg-stone-800 rounded-xl text-stone-400 hover:text-olive-600 shadow-sm border border-stone-50 dark:border-dark-border transition-all"
                      title={t('preview')}
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => setEditingScenario(scenario)}
                      className="p-3 bg-white dark:bg-stone-800 rounded-xl text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 shadow-sm border border-stone-50 dark:border-dark-border transition-all"
                      title={t('settings')}
                    >
                      <Settings className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => setDeletingId(scenario.id)}
                      className="p-3 bg-white dark:bg-stone-800 rounded-xl text-stone-400 hover:text-red-500 shadow-sm border border-stone-50 dark:border-dark-border transition-all"
                      title={t('delete')}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <AnimatePresence>
                  {deletingId === scenario.id && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="absolute inset-0 z-20 bg-white/95 dark:bg-stone-900/95 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center"
                    >
                      <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center text-red-500 mb-6">
                        <Trash2 className="w-8 h-8" />
                      </div>
                      <h4 className="text-xl font-display font-medium text-stone-900 dark:text-stone-100 mb-4">{t('confirmDelete')}</h4>
                      <div className="flex gap-4 w-full">
                        <button 
                          onClick={() => setDeletingId(null)}
                          className="flex-1 py-4 bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 rounded-2xl font-bold hover:bg-stone-200 dark:hover:bg-stone-700 transition-all"
                        >
                          {t('cancel')}
                        </button>
                        <button 
                          onClick={() => handleDelete(scenario.id)}
                          className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-100 dark:shadow-stone-900/50"
                        >
                          {t('delete')}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <h3 className="text-2xl font-display font-medium text-stone-900 dark:text-stone-100 mb-3">{scenario.title}</h3>
                <p className="font-serif text-stone-500 dark:text-stone-400 text-sm line-clamp-2 mb-10 leading-relaxed italic">{scenario.description}</p>
                <div className="flex items-center justify-between pt-8 border-t border-stone-50 dark:border-dark-border">
                  <span className="text-[10px] font-bold text-stone-300 dark:text-stone-600 uppercase tracking-[0.2em]">{scenario.steps.length} {t('modules')}</span>
                  <button 
                    onClick={() => setEditingScenario(scenario)}
                    className="text-olive-600 dark:text-olive-400 text-sm font-bold flex items-center gap-2 hover:gap-3 transition-all"
                  >
                    {t('edit')} <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProgressTracker() {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [progressData, setProgressData] = useState<Progress[]>([]);
  const [users, setUsers] = useState<Record<string, any>>({});
  const { profile } = useAuth();
  const { t } = useLanguage();
  const [showBgSettings, setShowBgSettings] = useState(false);
  const { settings, saveSettings } = useTabSettings('progress');

  useEffect(() => {
    if (!profile) return;
    
    // Fetch scenarios
    const qScenarios = query(collection(db, 'scenarios'), where('teacherId', '==', profile.uid));
    const unsubScenarios = onSnapshot(qScenarios, (snapshot) => {
      setScenarios(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Scenario)));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'scenarios');
    });

    // Fetch progress
    const qProgress = query(collection(db, 'progress'));
    const unsubProgress = onSnapshot(qProgress, (snapshot) => {
      setProgressData(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Progress)));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'progress');
    });

    // Fetch users (students)
    const qUsers = query(collection(db, 'users'), where('role', '==', 'student'));
    const unsubUsers = onSnapshot(qUsers, (snapshot) => {
      const usersMap: Record<string, any> = {};
      snapshot.docs.forEach(doc => {
        usersMap[doc.id] = doc.data();
      });
      setUsers(usersMap);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'users');
    });

    return () => {
      unsubScenarios();
      unsubProgress();
      unsubUsers();
    };
  }, [profile]);

  return (
    <div className="relative min-h-screen">
      <TabBackground url={settings?.backgroundImage} opacity={settings?.backgroundOpacity} />
      
      <div className="p-16 max-w-7xl mx-auto relative z-10">
        <div className="flex justify-between items-start mb-20">
          <div>
            <h1 className="text-5xl font-display font-medium tracking-tight text-stone-900 mb-3">{t('studentProgress')}</h1>
            <p className="font-serif text-lg text-stone-500 italic">Monitor and analyze student engagement across your scenarios.</p>
          </div>
          <button 
            onClick={() => setShowBgSettings(!showBgSettings)}
            className="p-4 bg-white border border-stone-200 rounded-2xl text-stone-600 hover:bg-stone-50 transition-all shadow-sm"
            title={t('backgroundAesthetic')}
          >
            <Settings className="w-6 h-6" />
          </button>
        </div>

        <AnimatePresence>
          {showBgSettings && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-12 overflow-hidden"
            >
              <BackgroundSettings 
                backgroundImage={settings?.backgroundImage || ''}
                backgroundOpacity={settings?.backgroundOpacity ?? 0.1}
                onSave={(url, opacity) => {
                  saveSettings(url, opacity);
                  setShowBgSettings(false);
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-16">
        {scenarios.map(scenario => {
          const scenarioProgress = progressData.filter(p => p.scenarioId === scenario.id);
          return (
            <div key={scenario.id} className="bg-white p-12 rounded-[48px] border border-stone-100 shadow-sm">
              <h2 className="text-3xl font-display font-medium text-stone-900 mb-10 italic">{scenario.title}</h2>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-stone-50">
                      <th className="text-left py-6 text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400">{t('student')}</th>
                      <th className="text-left py-6 text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400">{t('progress')}</th>
                      <th className="text-left py-6 text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400">{t('completed')}</th>
                      <th className="text-right py-6 text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400">{t('lastActive')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-50">
                    {scenarioProgress.map(p => {
                      const user = users[p.userId];
                      if (!user) return null;
                      const percentage = Math.round((p.completedSteps.length / scenario.steps.length) * 100);
                      return (
                        <tr key={p.id} className="group hover:bg-stone-50/50 transition-colors">
                          <td className="py-8">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-olive-50 rounded-full flex items-center justify-center text-sm font-bold text-olive-700 border border-olive-100">
                                {user.displayName?.[0] || user.email?.[0]}
                              </div>
                              <span className="text-sm font-bold text-stone-900">{user.displayName}</span>
                            </div>
                          </td>
                          <td className="py-8">
                            <div className="w-64 h-2 bg-stone-100 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${percentage}%` }}
                                className="h-full bg-olive-600"
                              />
                            </div>
                          </td>
                          <td className="py-8">
                            <span className="text-sm font-bold text-stone-900 font-mono">{p.completedSteps.length} / {scenario.steps.length}</span>
                          </td>
                          <td className="py-8 text-right">
                            <span className="text-xs font-serif italic text-stone-400">
                              {p.lastUpdated?.toDate().toLocaleDateString()}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                    {scenarioProgress.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-16 text-center text-stone-400 text-sm font-serif italic">No students have started this scenario yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  </div>
  );
}

// --- Student Views ---

function ScenarioViewer({ scenario, onBack }: { scenario: Scenario, onBack: () => void }) {
  const { profile } = useAuth();
  const { t } = useLanguage();
  const [progress, setProgress] = useState<Progress | null>(null);
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  useEffect(() => {
    if (!profile) return;
    const q = query(collection(db, 'progress'), where('userId', '==', profile.uid), where('scenarioId', '==', scenario.id));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        setProgress({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Progress);
      } else {
        // Create initial progress
        addDoc(collection(db, 'progress'), {
          userId: profile.uid,
          scenarioId: scenario.id,
          completedSteps: [],
          lastUpdated: serverTimestamp()
        }).catch(error => handleFirestoreError(error, OperationType.CREATE, 'progress'));
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'progress');
    });
    return unsubscribe;
  }, [profile, scenario]);

  const toggleStep = async (stepId: string) => {
    if (!progress) return;
    const isCompleted = progress.completedSteps.includes(stepId);
    const newCompleted = isCompleted 
      ? progress.completedSteps.filter(id => id !== stepId)
      : [...progress.completedSteps, stepId];
    
    try {
      await updateDoc(doc(db, 'progress', progress.id), {
        completedSteps: newCompleted,
        lastUpdated: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'progress');
    }
  };

  const getStepTypeLabel = (type: string) => {
    switch (type) {
      case 'firebase-studio': return t('firebaseStudio');
      case 'web-app': return t('webApp');
      case 'content': return t('content');
      case 'quiz': return t('quiz');
      default: return type;
    }
  };

  const activeStep = scenario.steps[activeStepIndex];

  return (
    <div className="flex h-screen bg-warm-bg dark:bg-dark-bg overflow-hidden relative transition-colors duration-300">
      {/* Background Image */}
      {scenario.backgroundImage && (
        <div 
          className="absolute inset-0 pointer-events-none z-0"
          style={{ 
            backgroundImage: `url(${scenario.backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: scenario.backgroundOpacity ?? 0.1
          }}
        />
      )}
      
      {/* Sidebar Steps */}
      <div className="w-80 bg-warm-paper/90 dark:bg-dark-paper/90 backdrop-blur-xl border-r border-stone-100 dark:border-dark-border flex flex-col h-full relative z-10 shadow-2xl">
        <div className="p-10 border-b border-stone-100 dark:border-dark-border">
          <button onClick={onBack} className="flex items-center gap-2 text-stone-400 hover:text-olive-600 transition-all mb-8 text-xs font-bold uppercase tracking-widest">
            <ArrowLeft className="w-4 h-4" /> {t('backToDashboard')}
          </button>
          <h2 className="text-2xl font-display font-medium text-stone-900 dark:text-stone-100 leading-tight">{scenario.title}</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {scenario.steps.map((step, index) => {
            const isCompleted = progress?.completedSteps.includes(step.id);
            const isActive = activeStepIndex === index;
            return (
              <button
                key={step.id}
                onClick={() => setActiveStepIndex(index)}
                className={cn(
                  "w-full flex items-center gap-4 p-5 rounded-[24px] text-left transition-all border",
                  isActive 
                    ? "bg-olive-600 text-white shadow-xl shadow-olive-100 dark:shadow-stone-900/50 border-olive-600" 
                    : "hover:bg-white/50 dark:hover:bg-stone-800/50 border-transparent text-stone-600 dark:text-stone-400"
                )}
              >
                <div className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center shrink-0 border-2 transition-all",
                  isCompleted 
                    ? "bg-white border-white text-olive-600" 
                    : isActive 
                      ? "border-white/30 text-white" 
                      : "border-stone-100 dark:border-dark-border text-stone-300 dark:text-stone-600"
                )}>
                  {isCompleted ? <CheckCircle className="w-4 h-4" /> : <span className="text-[10px] font-bold">{index + 1}</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn("text-sm font-bold truncate", isActive ? "text-white" : "text-stone-900 dark:text-stone-100")}>{step.title}</p>
                  <p className={cn("text-[10px] uppercase tracking-[0.2em] font-bold", isActive ? "text-white/50" : "text-stone-400 dark:text-stone-500")}>{getStepTypeLabel(step.type)}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full relative z-10">
        <div className="flex-1 p-16 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div 
              key={activeStep?.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={cn("mx-auto h-full", activeStep?.layout === 'split' ? "max-w-none w-full" : "max-w-4xl")}
            >
              <div className="flex items-center gap-4 mb-10">
                <span className="px-4 py-1.5 bg-olive-50 text-olive-600 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] border border-olive-100 shadow-sm">
                  {getStepTypeLabel(activeStep?.type || '')}
                </span>
                <span className="text-stone-200">•</span>
                <span className="font-serif italic text-stone-400">{t('module')} {activeStepIndex + 1} {t('of')} {scenario.steps.length}</span>
              </div>
              
              <h1 className="text-5xl font-display font-medium text-stone-900 dark:text-stone-100 mb-16">{activeStep?.title}</h1>

              {activeStep?.layout === 'split' ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 h-[calc(100%-180px)]">
                  {/* Screen 1: Instructions/Content */}
                  <div className="bg-white/90 dark:bg-dark-paper/90 backdrop-blur-xl p-12 rounded-[48px] shadow-sm border border-stone-100 dark:border-dark-border overflow-y-auto">
                    <h3 className="text-xl font-display font-medium text-stone-900 dark:text-stone-100 mb-8">{t('instructions')}</h3>
                    <div className="prose prose-stone dark:prose-invert max-w-none">
                      <p className="font-serif text-lg text-stone-600 dark:text-stone-400 leading-relaxed whitespace-pre-wrap italic">
                        {activeStep.type === 'firebase-studio' 
                          ? t('instructionsFirebase')
                          : t('instructionsWebApp')}
                      </p>
                    </div>
                  </div>
                  
                  {/* Screen 2: Web Browser / App */}
                  <div className="bg-white/90 dark:bg-dark-paper/90 backdrop-blur-xl rounded-[48px] shadow-sm border border-stone-100 dark:border-dark-border overflow-hidden flex flex-col">
                    <div className="bg-stone-50/50 dark:bg-stone-900/50 px-8 py-4 border-b border-stone-100 dark:border-dark-border flex items-center gap-4">
                      <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-200 dark:bg-red-900/50" />
                        <div className="w-3 h-3 rounded-full bg-yellow-200 dark:bg-yellow-900/50" />
                        <div className="w-3 h-3 rounded-full bg-green-200 dark:bg-green-900/50" />
                      </div>
                      <div className="flex-1 bg-white/80 dark:bg-stone-800/80 rounded-xl px-4 py-2 text-[10px] text-stone-400 dark:text-stone-500 truncate border border-stone-100 dark:border-dark-border font-mono">
                        {activeStep.content}
                      </div>
                    </div>
                    <iframe 
                      src={activeStep.content}
                      className="flex-1 w-full border-none"
                      title="Web Browser"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>
              ) : (
                <div className="bg-white/90 backdrop-blur-xl p-16 rounded-[48px] shadow-sm border border-stone-100 min-h-[500px] flex flex-col justify-center">
                  {activeStep?.type === 'content' && (
                    <div className="prose prose-stone max-w-none">
                      <p className="text-2xl font-serif italic text-stone-600 leading-relaxed whitespace-pre-wrap text-center">{activeStep.content}</p>
                    </div>
                  )}

                  {(activeStep?.type === 'web-app' || activeStep?.type === 'firebase-studio') && (
                    <div className="space-y-12 text-center">
                      <p className="font-serif text-xl text-stone-500 italic leading-relaxed max-w-2xl mx-auto">
                        {activeStep.type === 'firebase-studio' 
                          ? "Access your Firebase Studio project to receive updates for this scenario."
                          : "This step requires you to use an external tool. Click the button below to open it."}
                      </p>
                      <a 
                        href={activeStep.content} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-4 bg-olive-600 text-white px-10 py-5 rounded-[24px] font-bold hover:bg-olive-700 transition-all shadow-2xl shadow-olive-100"
                      >
                        {activeStep.type === 'firebase-studio' ? t('openFirebaseStudio') : t('openWebApp')} <ExternalLink className="w-5 h-5" />
                      </a>
                    </div>
                  )}

                  {activeStep?.type === 'quiz' && (
                    <div className="space-y-10 text-center">
                      <p className="text-3xl font-display font-medium text-stone-900 leading-relaxed max-w-2xl mx-auto">{activeStep.content}</p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="p-10 bg-white/90 backdrop-blur-xl border-t border-stone-100 flex items-center justify-between shadow-2xl">
          <div className="flex gap-4">
            <button 
              disabled={activeStepIndex === 0}
              onClick={() => setActiveStepIndex(activeStepIndex - 1)}
              className="px-8 py-4 rounded-[16px] text-sm font-bold text-stone-400 hover:text-stone-900 hover:bg-stone-50 disabled:opacity-20 transition-all"
            >
              {t('previous')}
            </button>
            <button 
              disabled={activeStepIndex === scenario.steps.length - 1}
              onClick={() => setActiveStepIndex(activeStepIndex + 1)}
              className="px-8 py-4 rounded-[16px] text-sm font-bold text-stone-600 hover:text-stone-900 hover:bg-stone-50 disabled:opacity-20 transition-all"
            >
              {t('next')}
            </button>
          </div>

          <button 
            onClick={() => toggleStep(activeStep.id)}
            className={cn(
              "px-10 py-5 rounded-[24px] font-bold transition-all flex items-center gap-3",
              progress?.completedSteps.includes(activeStep.id)
                ? "bg-olive-50 text-olive-600 border border-olive-100"
                : "bg-olive-600 text-white shadow-2xl shadow-olive-100 hover:bg-olive-700"
            )}
          >
            {progress?.completedSteps.includes(activeStep.id) ? (
              <>
                <CheckCircle className="w-6 h-6" /> {t('completed')}
              </>
            ) : (
              t('markAsComplete')
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function EducationalApps() {
  const { t } = useLanguage();
  const { settings, saveSettings } = useTabSettings('educational-apps');
  const [showBgSettings, setShowBgSettings] = useState(false);

  const apps = [
    {
      title: 'Interactive Books',
      url: 'https://dporpatonelis-crypto.github.io/interactive-books/index.html',
      icon: BookOpen,
      color: 'bg-blue-50 text-blue-600'
    },
    {
      title: 'Idea Weaver Board',
      url: 'https://idea-weaver-board.vercel.app/',
      icon: LayoutDashboard,
      color: 'bg-purple-50 text-purple-600'
    },
    {
      title: 'Mind Palace Cases',
      url: 'https://dporpatonelis-crypto.github.io/mind-palace-cases/',
      icon: HelpCircle,
      color: 'bg-amber-50 text-amber-600'
    },
    {
      title: 'Map Timeline',
      url: 'https://dporpatonelis-crypto.github.io/Map-Timeline/',
      icon: Globe,
      color: 'bg-emerald-50 text-emerald-600'
    },
    {
      title: 'History Explorer 3D',
      url: 'https://history-explorer-3d.vercel.app/',
      icon: GraduationCap,
      color: 'bg-rose-50 text-rose-600'
    }
  ];

  return (
    <div className="relative min-h-screen transition-colors duration-300">
      <TabBackground url={settings?.backgroundImage} opacity={settings?.backgroundOpacity} />
      
      <div className="p-16 max-w-7xl mx-auto relative z-10">
        <div className="flex items-center justify-between mb-20">
          <div>
            <h1 className="text-5xl font-display font-medium tracking-tight text-stone-900 dark:text-stone-100 mb-3">{t('educationalApps')}</h1>
            <p className="font-serif text-lg text-stone-500 dark:text-stone-400 italic">{t('educationalAppsDesc')}</p>
          </div>
          <button 
            onClick={() => setShowBgSettings(!showBgSettings)}
            className="p-5 bg-white dark:bg-dark-paper border border-stone-200 dark:border-dark-border rounded-[24px] text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800 transition-all shadow-sm"
          >
            <Settings className="w-6 h-6" />
          </button>
        </div>

        <AnimatePresence>
          {showBgSettings && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-12 overflow-hidden"
            >
              <BackgroundSettings 
                backgroundImage={settings?.backgroundImage || ''}
                backgroundOpacity={settings?.backgroundOpacity ?? 0.1}
                onSave={(url, opacity) => {
                  saveSettings(url, opacity);
                  setShowBgSettings(false);
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mb-20">
          {apps.map((app, index) => (
            <motion.a
              key={index}
              href={app.url}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ y: -8 }}
              className="bg-white/80 dark:bg-dark-paper/80 backdrop-blur-xl p-10 rounded-[40px] border border-stone-100 dark:border-dark-border shadow-sm hover:shadow-2xl transition-all group relative overflow-hidden block"
            >
              <div className={cn("w-14 h-14 rounded-[20px] flex items-center justify-center mb-8 shadow-sm", app.color)}>
                <app.icon className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-display font-medium text-stone-900 dark:text-stone-100 mb-3">{app.title}</h3>
              <div className="mt-10 pt-8 border-t border-stone-50 dark:border-dark-border flex items-center justify-between">
                <span className="text-[10px] font-bold text-stone-300 dark:text-stone-600 uppercase tracking-widest">External Tool</span>
                <span className="text-olive-600 dark:text-olive-400 text-sm font-bold flex items-center gap-2 group-hover:gap-3 transition-all">
                  Launch <ExternalLink className="w-4 h-4" />
                </span>
              </div>
            </motion.a>
          ))}
        </div>

        {/* YouTube Video Section */}
        <div className="bg-white/80 dark:bg-dark-paper/80 backdrop-blur-xl p-12 rounded-[48px] border border-stone-100 dark:border-dark-border shadow-sm">
          <h2 className="text-3xl font-display font-medium text-stone-900 dark:text-stone-100 mb-8 flex items-center gap-4">
            <div className="w-10 h-10 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl flex items-center justify-center">
              <Youtube className="w-5 h-5" />
            </div>
            Featured Video
          </h2>
          <div className="aspect-video w-full rounded-[32px] overflow-hidden shadow-2xl">
            <iframe 
              width="100%" 
              height="100%" 
              src="https://www.youtube.com/embed/Ftr5AbtSxWE?si=KR_zivqiwIqMX6Ij" 
              title="YouTube video player" 
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
              referrerPolicy="strict-origin-when-cross-origin" 
              allowFullScreen
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  );
}

function StudentDashboard() {
  const { profile } = useAuth();
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [progressData, setProgressData] = useState<Progress[]>([]);
  const [activeScenario, setActiveScenario] = useState<Scenario | null>(null);
  const [showBgSettings, setShowBgSettings] = useState(false);
  const { settings, saveSettings } = useTabSettings('my-scenarios');

  useEffect(() => {
    if (!profile) return;
    
    // Fetch all scenarios
    const unsubScenarios = onSnapshot(collection(db, 'scenarios'), (snapshot) => {
      setScenarios(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Scenario)));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'scenarios');
    });

    // Fetch user progress
    const qProgress = query(collection(db, 'progress'), where('userId', '==', profile.uid));
    const unsubProgress = onSnapshot(qProgress, (snapshot) => {
      setProgressData(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Progress)));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'progress');
    });

    return () => {
      unsubScenarios();
      unsubProgress();
    };
  }, [profile]);

  if (activeScenario) {
    return <ScenarioViewer scenario={activeScenario} onBack={() => setActiveScenario(null)} />;
  }

  return (
    <div className="relative min-h-screen">
      <TabBackground url={settings?.backgroundImage} opacity={settings?.backgroundOpacity} />
      
      <div className="p-16 max-w-7xl mx-auto relative z-10">
        <div className="flex items-center justify-between mb-20">
          <div>
            <h1 className="text-5xl font-display font-medium tracking-tight text-stone-900 dark:text-stone-100 mb-3">My Learning Journey</h1>
            <p className="font-serif text-lg text-stone-500 dark:text-stone-400 italic">Explore and complete educational scenarios designed for you.</p>
          </div>
          <button 
            onClick={() => setShowBgSettings(!showBgSettings)}
            className="p-5 bg-white dark:bg-dark-paper border border-stone-200 dark:border-dark-border rounded-[24px] text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800 transition-all shadow-sm"
          >
            <Settings className="w-6 h-6" />
          </button>
        </div>

        <AnimatePresence>
          {showBgSettings && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-12 overflow-hidden"
            >
              <BackgroundSettings 
                backgroundImage={settings?.backgroundImage || ''}
                backgroundOpacity={settings?.backgroundOpacity ?? 0.1}
                onSave={(url, opacity) => {
                  saveSettings(url, opacity);
                  setShowBgSettings(false);
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {scenarios.map((scenario) => {
          const progress = progressData.find(p => p.scenarioId === scenario.id);
          const percentage = progress ? Math.round((progress.completedSteps.length / scenario.steps.length) * 100) : 0;
          
          return (
            <motion.div 
              key={scenario.id}
              whileHover={{ y: -8 }}
              className="bg-white dark:bg-dark-paper p-10 rounded-[40px] border border-stone-100 dark:border-dark-border shadow-sm hover:shadow-2xl transition-all group cursor-pointer relative overflow-hidden"
              onClick={() => setActiveScenario(scenario)}
            >
              {scenario.backgroundImage && (
                <div 
                  className="absolute inset-0 pointer-events-none z-0"
                  style={{ 
                    backgroundImage: `url(${scenario.backgroundImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    opacity: scenario.backgroundOpacity ?? 0.1
                  }}
                />
              )}
              <div className="relative z-10">
                <div className="w-14 h-14 bg-olive-50 dark:bg-olive-900/20 rounded-[20px] flex items-center justify-center text-olive-600 dark:text-olive-400 mb-8 shadow-sm border border-olive-100 dark:border-olive-900/30">
                  <BookOpen className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-display font-medium text-stone-900 dark:text-stone-100 mb-3">{scenario.title}</h3>
                <p className="font-serif text-stone-500 dark:text-stone-400 text-sm line-clamp-2 mb-10 leading-relaxed italic">{scenario.description}</p>
                
                <div className="space-y-5">
                  <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.2em] font-bold">
                    <span className="text-stone-400 dark:text-stone-500">{percentage}% Complete</span>
                    <span className="text-stone-900 dark:text-stone-100 font-mono">{progress?.completedSteps.length || 0} / {scenario.steps.length}</span>
                  </div>
                  <div className="w-full h-2 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      className="h-full bg-olive-600"
                    />
                  </div>
                </div>

                <div className="mt-10 pt-8 border-t border-stone-50 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-stone-300 uppercase tracking-widest">Educator Portal</span>
                  <button className="text-olive-600 text-sm font-bold flex items-center gap-2 group-hover:gap-3 transition-all">
                    {percentage === 100 ? 'Review' : percentage > 0 ? 'Continue' : 'Begin'} <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  </div>
  );
}

// --- Main App ---

function Dashboard() {
  const { profile, loading } = useAuth();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('scenarios');

  useEffect(() => {
    if (profile?.role === 'student') {
      setActiveTab('my-scenarios');
    }
  }, [profile]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50">
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="w-10 h-10 border-4 border-stone-200 border-t-emerald-500 rounded-full"
      />
    </div>
  );

  if (!profile) return <RoleSelection />;

  return (
    <div className="flex min-h-screen font-sans relative transition-colors duration-300">
      <div className="fixed inset-0 bg-stone-50 dark:bg-dark-bg z-[-1]" />
      {/* Sidebar is hidden when viewing a scenario */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'scenarios' && <TeacherDashboard key="teacher" />}
          {activeTab === 'progress' && <ProgressTracker key="progress" />}
          {activeTab === 'educational-apps' && <EducationalApps key="educational-apps" />}
          {activeTab === 'my-scenarios' && <StudentDashboard key="student" />}
          {activeTab === 'about' && (
            <ProfileSection 
              key="about" 
              type="about" 
              title={t('aboutMeTitle')} 
              description={t('aboutMeDesc')} 
            />
          )}
          {activeTab === 'academic' && (
            <ProfileSection 
              key="academic" 
              type="academic" 
              title={t('academicWorkTitle')} 
              description={t('academicWorkDesc')} 
            />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function BackgroundSettings({ 
  backgroundImage, 
  backgroundOpacity, 
  onSave 
}: { 
  backgroundImage: string, 
  backgroundOpacity: number, 
  onSave: (url: string, opacity: number) => void 
}) {
  const [url, setUrl] = useState(backgroundImage);
  const [opacity, setOpacity] = useState(backgroundOpacity);
  const { t } = useLanguage();

  return (
    <div className="space-y-6 bg-stone-50 p-8 rounded-3xl border border-stone-100">
      <div className="flex items-center gap-3 mb-2">
        <ImageIcon className="w-5 h-5 text-olive-600" />
        <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider">{t('backgroundAesthetic')}</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-widest font-bold text-stone-400">{t('imageUrl')}</label>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://images.unsplash.com/..."
            className="w-full px-4 py-3 bg-white border border-stone-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-olive-500/20"
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-widest font-bold text-stone-400">{t('opacity')} ({Math.round(opacity * 100)}%)</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={opacity}
            onChange={(e) => setOpacity(parseFloat(e.target.value))}
            className="w-full accent-olive-600"
          />
        </div>
      </div>

      <button
        onClick={() => onSave(url, opacity)}
        className="w-full py-3 bg-stone-900 text-white rounded-xl text-xs font-bold hover:bg-stone-800 transition-all flex items-center justify-center gap-2"
      >
        <Save className="w-4 h-4" />
        {t('applyBackground')}
      </button>
    </div>
  );
}

function TabBackground({ url, opacity }: { url?: string, opacity?: number }) {
  if (!url) return null;
  return (
    <div 
      className="absolute inset-0 pointer-events-none z-0 overflow-hidden"
      style={{ 
        backgroundImage: `url("${url}")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        opacity: opacity ?? 0.1
      }}
    />
  );
}

function ProfileSection({ type, title, description }: { type: 'about' | 'academic', title: string, description: string }) {
  const { profile } = useAuth();
  const { t } = useLanguage();
  const [content, setContent] = useState<ProfileContent | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [editImages, setEditImages] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [bgUrl, setBgUrl] = useState('');
  const [bgOpacity, setBgOpacity] = useState(0.1);

  useEffect(() => {
    if (!profile) return;
    const q = query(collection(db, 'profile_content'), where('userId', '==', profile.uid), where('type', '==', type));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const data = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as ProfileContent;
        setContent(data);
        setEditContent(data.content || '');
        setEditImages(data.images || []);
        setBgUrl(data.backgroundImage || '');
        setBgOpacity(data.backgroundOpacity ?? 0.1);
      } else {
        setContent(null);
        setEditContent('');
        setEditImages([]);
        setBgUrl('');
        setBgOpacity(0.1);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'profile_content');
    });
    return () => unsubscribe();
  }, [profile, type]);

  const handleSave = async () => {
    if (!profile) return;
    const data = {
      userId: profile.uid,
      type,
      content: editContent,
      images: editImages,
      backgroundImage: bgUrl,
      backgroundOpacity: bgOpacity,
      lastUpdated: serverTimestamp()
    };

    try {
      if (content?.id) {
        await updateDoc(doc(db, 'profile_content', content.id), data);
      } else {
        await addDoc(collection(db, 'profile_content'), data);
      }
      setIsEditing(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'profile_content');
    }
  };

  const addImage = () => {
    if (newImageUrl.trim()) {
      setEditImages([...editImages, newImageUrl.trim()]);
      setNewImageUrl('');
    }
  };

  const removeImage = (index: number) => {
    setEditImages(editImages.filter((_, i) => i !== index));
  };

  return (
    <div className="relative min-h-screen">
      <TabBackground url={content?.backgroundImage} opacity={content?.backgroundOpacity} />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="p-16 max-w-7xl mx-auto relative z-10"
      >
        <div className="flex justify-between items-start mb-16">
          <div>
            <h1 className="text-5xl font-display font-medium tracking-tight text-stone-900 mb-3">{t(type)}</h1>
            <p className="font-serif text-lg text-stone-500 italic">{description}</p>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-stone-200 rounded-2xl text-sm font-bold text-stone-700 hover:bg-stone-50 transition-all shadow-sm"
          >
            {isEditing ? <><X className="w-4 h-4" /> {t('cancel')}</> : <><Edit2 className="w-4 h-4" /> {t('editSection')}</>}
          </button>
        </div>

        {isEditing ? (
          <div className="space-y-12 bg-white/90 backdrop-blur-md p-12 rounded-[48px] border border-stone-100 shadow-sm">
            <BackgroundSettings 
              backgroundImage={bgUrl}
              backgroundOpacity={bgOpacity}
              onSave={(url, opacity) => {
                setBgUrl(url);
                setBgOpacity(opacity);
              }}
            />

            <div className="space-y-4">
              <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400">{t('content')} (Markdown supported)</label>
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full h-64 p-6 bg-stone-50 border border-stone-100 rounded-3xl text-stone-900 font-serif text-lg focus:outline-none focus:ring-2 focus:ring-olive-500/20"
                placeholder={t('tellUsAboutYourself')}
              />
            </div>

            <div className="space-y-6">
              <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400">{t('addImages')}</label>
              <div className="flex gap-4">
                <input
                  type="text"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder={t('enterImageUrl')}
                  className="flex-1 px-6 py-4 bg-stone-50 border border-stone-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-olive-500/20"
                />
                <button
                  onClick={addImage}
                  className="px-6 py-4 bg-olive-600 text-white rounded-2xl text-sm font-bold hover:bg-olive-700 transition-all"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              
              <div className="grid grid-cols-4 gap-6">
                {editImages.map((url, index) => (
                  <div key={index} className="relative group aspect-square rounded-3xl overflow-hidden border border-stone-100">
                    <img src={url} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleSave}
              className="w-full py-6 bg-olive-600 text-white rounded-3xl text-lg font-bold hover:bg-olive-700 transition-all shadow-xl shadow-olive-600/20 flex items-center justify-center gap-3"
            >
              <Save className="w-6 h-6" />
              {t('saveChanges')}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div className="space-y-8">
              <div className="bg-white/90 backdrop-blur-md p-12 rounded-[48px] border border-stone-100 shadow-sm prose prose-stone max-w-none">
                {content?.content ? (
                  <div className="markdown-body font-serif text-xl leading-relaxed text-stone-700">
                    <Markdown>{content.content}</Markdown>
                  </div>
                ) : (
                  <p className="text-stone-400 font-serif italic">{t('noContentAdded')}</p>
                )}
              </div>
            </div>
            
            <div className="space-y-8">
              {content?.images && content.images.length > 0 ? (
                <div className="grid grid-cols-1 gap-8">
                  {content.images.map((url, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="rounded-[48px] overflow-hidden border border-stone-100 shadow-sm"
                    >
                      <img src={url} alt="" className="w-full h-auto" referrerPolicy="no-referrer" />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="bg-white/50 backdrop-blur-sm border-2 border-dashed border-stone-200 rounded-[48px] aspect-square flex flex-col items-center justify-center text-stone-400 gap-4">
                  <ImageIcon className="w-12 h-12" />
                  <p className="font-serif italic text-sm">{t('noImagesAdded')}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <ThemeProvider>
          <MainApp />
        </ThemeProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}

function MainApp() {
  const { user, loading } = useAuth();

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-warm-bg">
      <div className="grain-overlay" />
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="w-12 h-12 border-4 border-stone-100 border-t-olive-600 rounded-full"
      />
    </div>
  );

  return (
    <div className="selection:bg-olive-50 selection:text-olive-900">
      <div className="grain-overlay" />
      {!user ? <Login /> : <Dashboard />}
    </div>
  );
}
