import React, { useState, useEffect, useRef, FormEvent } from 'react';
import {
  Sparkles,
  Send,
  Sliders,
  Globe,
  RefreshCw,
  AlertTriangle,
  Check,
  Copy,
  Cpu,
  BookOpen,
  MessageSquare,
  FileText,
  X,
  Paperclip,
  Trash2,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  LogOut,
  Settings2,
  Plus
} from 'lucide-react';

import ChemistryLanding from './components/ChemistryLanding';
import Sidebar from './components/Sidebar';
import SettingsModal from './components/SettingsModal';

// --- File Attachment interface ---
interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  base64?: string;
  textContent?: string;
}

// --- File processing utility helper ---
const processFile = async (file: File): Promise<Attachment> => {
  const id = Math.random().toString(36).substring(2, 9);
  const name = file.name;
  const type = file.type || 'application/octet-stream';
  const size = file.size;
  const ext = name.split('.').pop()?.toLowerCase();

  // 1. Text files (.txt, .md, .json, .csv, .xml, .yaml, .yml, .js, .ts, etc.)
  if (
    type.startsWith('text/') ||
    ['txt', 'md', 'json', 'csv', 'xml', 'yaml', 'yml', 'js', 'ts', 'tsx', 'jsx', 'html', 'css'].includes(ext || '')
  ) {
    const textContent = await file.text();
    return { id, name, type, size, textContent };
  }

  // 2. Word Documents (.docx)
  if (ext === 'docx' || type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const mammoth = await import('mammoth');
      const mammothLib = (mammoth as any).default || mammoth;
      const result = await mammothLib.extractRawText({ arrayBuffer });
      return { id, name, type, size, textContent: result.value };
    } catch (err) {
      console.error('Error parsing docx file:', err);
      return { id, name, type, size, textContent: `[Attached Word Document: ${name} (${size} bytes) - Error parsing text content]` };
    }
  }

  // 3. Images and PDFs (Native base64 encoded inlineData)
  const base64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const res = reader.result as string;
      const base64Data = res.substring(res.indexOf(',') + 1);
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const finalType = ext === 'pdf' ? 'application/pdf' : type;
  return { id, name, type: finalType, size, base64 };
};

// --- Monospace Code Block Component with Copy feedback ---
function CodeBlock({ code, language }: { code: string; language: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="code-block-container" className="my-4 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-950 text-slate-100 shadow-sm max-w-full">
      <div id="code-block-header" className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 text-xs font-mono text-slate-400">
        <span className="uppercase tracking-wider text-[10px] font-bold text-slate-500">{language || 'code'}</span>
        <button
          id="code-block-copy-btn"
          onClick={handleCopy}
          className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
        >
          {copied ? <Check size={13} className="text-green-400" /> : <Copy size={13} />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
      <pre id="code-block-pre" className="p-4 overflow-x-auto text-sm font-mono leading-relaxed select-text whitespace-pre">
        <code>{code}</code>
      </pre>
    </div>
  );
}

// --- Dynamic Text Formatter (Inline Bold, Lists, Code) ---
function parseMarkdown(text: string) {
  if (!text) return null;

  // Split by code blocks first
  const parts = text.split(/(```[\s\S]*?```)/g);

  return parts.map((part, index) => {
    if (part.startsWith('```')) {
      // Extract language and contents of the code block
      const match = part.match(/```(\w*)\n([\s\S]*?)```/);
      const language = match ? match[1] : '';
      const code = match ? match[2] : part.slice(3, -3);
      return (
        <div key={index}>
          <CodeBlock code={code.trim()} language={language} />
        </div>
      );
    } else {
      // Split into paragraphs/lines
      const lines = part.split('\n');
      return (
        <div key={index} className="space-y-2 select-text">
          {lines.map((line, lineIdx) => {
            const trimmedLine = line.trim();
            // Handle bullet points
            if (trimmedLine.startsWith('* ') || trimmedLine.startsWith('- ')) {
              const content = trimmedLine.slice(2);
              return (
                <li key={lineIdx} className="ml-4 list-disc pl-1 text-slate-800 dark:text-slate-100 leading-relaxed py-0.5">
                  {formatInlineText(content)}
                </li>
              );
            }
            // Handle empty line (break)
            if (trimmedLine === '') {
              return <div key={lineIdx} className="h-2" />;
            }
            // Handle headers
            if (trimmedLine.startsWith('# ')) {
              return (
                <h2 key={lineIdx} className="text-xl font-black text-slate-950 dark:text-white mt-6 mb-3 border-b border-slate-100 dark:border-slate-800 pb-1.5">
                  {formatInlineText(trimmedLine.slice(2))}
                </h2>
              );
            }
            if (trimmedLine.startsWith('### ')) {
              return (
                <h4 key={lineIdx} className="text-base font-bold text-slate-950 dark:text-white mt-4 mb-2">
                  {formatInlineText(trimmedLine.slice(4))}
                </h4>
              );
            }
            if (trimmedLine.startsWith('## ')) {
              return (
                <h3 key={lineIdx} className="text-lg font-bold text-slate-950 dark:text-white mt-5 mb-2 border-b border-slate-100 dark:border-slate-800 pb-1">
                  {formatInlineText(trimmedLine.slice(3))}
                </h3>
              );
            }
            // Standard paragraph
            return (
              <p key={lineIdx} className="text-slate-800 dark:text-slate-100 leading-relaxed">
                {formatInlineText(line)}
              </p>
            );
          })}
        </div>
      );
    }
  });
}

// Format bold text and inline code in text
function formatInlineText(text: string) {
  const boldParts = text.split(/(\*\*.*?\*\*)/g);
  return boldParts.map((bPart, bIdx) => {
    if (bPart.startsWith('**') && bPart.endsWith('**')) {
      const innerText = bPart.slice(2, -2);
      return (
        <strong key={bIdx} className="font-extrabold text-slate-950 dark:text-white">
          {formatInlineCodeAndText(innerText)}
        </strong>
      );
    }
    return <React.Fragment key={bIdx}>{formatInlineCodeAndText(bPart)}</React.Fragment>;
  });
}

function formatInlineCodeAndText(text: string) {
  const codeParts = text.split(/(`.*?`)/g);
  return codeParts.map((cPart, cIdx) => {
    if (cPart.startsWith('`') && cPart.endsWith('`')) {
      return (
        <code 
          key={cIdx} 
          className="px-1.5 py-0.5 mx-0.5 rounded-md bg-slate-100 dark:bg-slate-800/80 text-indigo-700 dark:text-indigo-300 font-mono text-[11px] font-semibold border border-slate-200/60 dark:border-slate-700/60 shadow-sm"
        >
          {cPart.slice(1, -1)}
        </code>
      );
    }
    return cPart;
  });
}

// Preset types
interface Preset {
  id: string;
  name: string;
  desc: string;
  systemInstruction: string;
  prompt: string;
  icon: any;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Array<{ role: 'user' | 'model'; text: string; grounding?: any; attachments?: Attachment[] }>;
  createdAt: number;
}

export default function App() {
  // --- Auth state and definitions ---
  interface User {
    email: string;
  }
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('gemini_chat_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const ALLOWED_USERS = [
    { email: 'xxxxxcode@gmail.com', password: 'codexxxxx' },
    { email: 'martinajj420@gmail.com', password: 'Marty420' }
  ];

  const handleLogout = () => {
    setCurrentUser(null);
    setIsGateUnlocked(false);
    localStorage.removeItem('gemini_chat_user');
    localStorage.removeItem('isGateUnlocked');
  };

  // --- States ---
  const [isGateUnlocked, setIsGateUnlocked] = useState<boolean>(() => {
    return localStorage.getItem('isGateUnlocked') === 'true';
  });

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('darkMode');
    return saved === 'true';
  });

  useEffect(() => {
    localStorage.setItem('darkMode', String(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const [userApiKey, setUserApiKey] = useState<string>(() => {
    return localStorage.getItem('userApiKey') || '';
  });
  const [keyInput, setKeyInput] = useState(userApiKey);
  const [showKey, setShowKey] = useState(false);

  // Modal & Collapsible states
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    if (userApiKey) {
      localStorage.setItem('userApiKey', userApiKey);
    } else {
      localStorage.removeItem('userApiKey');
    }
  }, [userApiKey]);

  const [systemInstruction, setSystemInstruction] = useState('');
  const [temperature, setTemperature] = useState(0.7);
  const [useSearchGrounding, setUseSearchGrounding] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gemini-2.5-flash');

  // Interactive flow states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // File Upload states
  const [chatAttachments, setChatAttachments] = useState<Attachment[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files ? Array.from(e.dataTransfer.files) : [];
    if (files.length === 0) return;

    try {
      const processed = await Promise.all(files.map(processFile));
      setChatAttachments((prev) => [...prev, ...processed]);
    } catch (err: any) {
      setError(err.message || 'Failed to process files');
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length === 0) return;

    try {
      const processed = await Promise.all(files.map(processFile));
      setChatAttachments((prev) => [...prev, ...processed]);
    } catch (err: any) {
      setError(err.message || 'Failed to process files');
    }
    e.target.value = '';
  };

  const renderAttachmentsPreview = (attachments: Attachment[], onRemove: (id: string) => void) => {
    if (attachments.length === 0) return null;

    return (
      <div className="flex flex-wrap gap-2 py-2 select-none">
        {attachments.map((att) => {
          const isImg = att.type.startsWith('image/');
          const sizeStr = att.size > 1024 * 1024 
            ? `${(att.size / (1024 * 1024)).toFixed(1)} MB` 
            : `${(att.size / 1024).toFixed(0)} KB`;

          return (
            <div
              key={att.id}
              className="relative flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl max-w-[240px] group transition-all"
            >
              {isImg && att.base64 ? (
                <img
                  src={`data:${att.type};base64,${att.base64}`}
                  alt={att.name}
                  className="w-8 h-8 rounded object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-8 h-8 rounded bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                  <FileText size={16} />
                </div>
              )}
              <div className="flex-1 min-w-0 pr-4">
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">{att.name}</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">{sizeStr}</p>
              </div>
              <button
                type="button"
                onClick={() => onRemove(att.id)}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-100 hover:bg-red-200 text-red-600 dark:bg-red-950/60 dark:hover:bg-red-900/60 dark:text-red-400 rounded-full flex items-center justify-center opacity-100 md:opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity cursor-pointer shadow-sm border border-red-200 dark:border-red-900/40"
              >
                <X size={12} />
              </button>
            </div>
          );
        })}
      </div>
    );
  };

  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    try {
      const saved = localStorage.getItem('gemini_chat_sessions');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error loading chat sessions:', e);
    }
    return [
      {
        id: 'default',
        title: 'New Conversation',
        messages: [
          {
            role: 'model',
            text: "Hello! I am Chat Igloo, your intelligent assistant. I can help with analytical reasoning, coding queries, creative brainstorms, and file-parsing. Use the Workspace Config inside the sidebar to adjust my persona preset, set parameters, or supply custom API keys.",
          }
        ],
        createdAt: Date.now()
      }
    ];
  });

  const [activeSessionId, setActiveSessionId] = useState<string>(() => {
    try {
      const savedActive = localStorage.getItem('gemini_chat_active_session_id');
      if (savedActive) {
        return savedActive;
      }
    } catch (e) {}
    return 'default';
  });

  // Keep localStorage in sync
  useEffect(() => {
    localStorage.setItem('gemini_chat_sessions', JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem('gemini_chat_active_session_id', activeSessionId);
  }, [activeSessionId]);

  // Derived state
  const activeSession = sessions.find((s) => s.id === activeSessionId) || sessions[0] || {
    id: 'default',
    title: 'New Conversation',
    messages: [
      {
        role: 'model',
        text: "Hello! I am Chat Igloo, your intelligent assistant. I can help with analytical reasoning, coding queries, creative brainstorms, and file-parsing. Use the Workspace Config inside the sidebar to adjust my persona preset, set parameters, or supply custom API keys.",
      }
    ],
    createdAt: Date.now()
  };

  const chatMessages = activeSession.messages;

  const setChatMessages = (
    newMessages: 
      | Array<{ role: 'user' | 'model'; text: string; grounding?: any; attachments?: Attachment[] }>
      | ((prev: Array<{ role: 'user' | 'model'; text: string; grounding?: any; attachments?: Attachment[] }>) => Array<{ role: 'user' | 'model'; text: string; grounding?: any; attachments?: Attachment[] }>)
  ) => {
    setSessions((prevSessions) => {
      return prevSessions.map((s) => {
        if (s.id === activeSession.id) {
          const updatedMsgs = typeof newMessages === 'function' ? newMessages(s.messages) : newMessages;
          
          let newTitle = s.title;
          if (s.title === 'New Conversation' || s.title === 'New Chat') {
            const firstUserMsg = updatedMsgs.find(m => m.role === 'user');
            if (firstUserMsg) {
              newTitle = firstUserMsg.text.slice(0, 24) + (firstUserMsg.text.length > 24 ? '...' : '');
            }
          }

          return {
            ...s,
            title: newTitle,
            messages: updatedMsgs,
          };
        }
        return s;
      });
    });
  };

  const createNewChatSession = () => {
    const newSessionId = Math.random().toString(36).substring(2, 9);
    const newSession: ChatSession = {
      id: newSessionId,
      title: 'New Chat',
      messages: [
        {
          role: 'model',
          text: "New conversation stream initiated. How can I assist you now?",
        }
      ],
      createdAt: Date.now()
    };
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSessionId);
    setError(null);
  };

  const deleteChatSession = (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    
    setSessions((prev) => {
      const filtered = prev.filter((s) => s.id !== id);
      if (filtered.length === 0) {
        return [
          {
            id: 'default',
            title: 'New Conversation',
            messages: [
              {
                role: 'model',
                text: "Hello! I am Chat Igloo, your intelligent assistant. I can help with analytical reasoning, coding queries, creative brainstorms, and file-parsing. Use the Workspace Config inside the sidebar to adjust my persona preset, set parameters, or supply custom API keys.",
              }
            ],
            createdAt: Date.now()
          }
        ];
      }
      return filtered;
    });

    if (activeSessionId === id) {
      setSessions((prev) => {
        const filtered = prev.filter((s) => s.id !== id);
        if (filtered.length > 0) {
          setActiveSessionId(filtered[0].id);
        } else {
          setActiveSessionId('default');
        }
        return prev;
      });
    }
  };

  const [chatInput, setChatInput] = useState('');

  // Key configurations check
  const [hasKey, setHasKey] = useState<boolean | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, loading]);

  // Check key availability on load
  useEffect(() => {
    fetch('/api/config')
      .then((res) => res.json())
      .then((data) => setHasKey(data.hasKey))
      .catch(() => setHasKey(false));
  }, []);

  // System presets
  const presets: Preset[] = [
    {
      id: 'socratic',
      name: 'Socratic Guide',
      desc: 'Prompts critical thinking through friendly questions',
      systemInstruction:
        'You are a Socratic tutor. Your goal is to help the user think through their questions or concepts themselves by asking guiding, thought-provoking questions, rather than simply giving the direct answers. Keep your questions friendly, short, and focused on uncovering core principles.',
      prompt: 'Can you explain how state management works in React?',
      icon: BookOpen,
    },
    {
      id: 'architect',
      name: 'TS Architect',
      desc: 'Refactors code snippets for cleanliness and typing',
      systemInstruction:
        'You are an expert software architect specializing in TypeScript and React. Analyze code snippets for type safety, modern patterns, optimization, readability, and security. Provide concrete, well-commented code blocks alongside explaining the architectural decisions clearly.',
      prompt:
        'Review this function and make it type-safe:\n\nfunction processData(items) {\n  return items.filter(x => x.active).map(x => x.val);\n}',
      icon: Cpu,
    },
    {
      id: 'writer',
      name: 'Creative Writer',
      desc: 'Atmospheric narrative designer for rich descriptive prose',
      systemInstruction:
        'You are an immersive narrative designer. Your style is deeply atmospheric, visual, and precise. Avoid clichés, use rich sensory detail, and focus on character emotions and environments.',
      prompt: 'Describe a quiet, high-tech research lab in the clouds during a thunderstorm.',
      icon: Sparkles,
    },
    {
      id: 'json',
      name: 'Structured JSON',
      desc: 'Produces strict JSON outputs matching your schema',
      systemInstruction:
        'You are a data extraction system. Your response must be strict, valid JSON only. Do not wrap your response in markdown blocks (e.g. do not use ```json), do not write explanations. Produce exactly the requested schema.',
      prompt:
        'Extract the names and founding years of 3 pioneering space organizations and return them as a JSON list with "name" and "year" fields.',
      icon: FileText,
    },
  ];

  const applyPreset = (preset: Preset) => {
    setSystemInstruction(preset.systemInstruction);
    setChatInput(preset.prompt);
  };

  // Run chat message
  const handleSendChat = async (e: FormEvent) => {
    e.preventDefault();
    if ((!chatInput.trim() && chatAttachments.length === 0) || loading) return;

    const userMessageText = chatInput.trim() || (chatAttachments.length > 1 ? "Analyze these attached files:" : "Analyze this attached file:");
    const currentAttachments = [...chatAttachments];

    setChatInput('');
    setChatAttachments([]);
    setError(null);

    // Format new user message
    const updatedMessages = [
      ...chatMessages,
      { role: 'user' as const, text: userMessageText, attachments: currentAttachments },
    ];
    setChatMessages(updatedMessages);
    setLoading(true);

    try {
      // Map frontend messages format to standard Gemini API contents structure
      const apiContents = updatedMessages.map((msg) => {
        if (msg.attachments && msg.attachments.length > 0) {
          const parts: any[] = [{ text: msg.text }];
          for (const att of msg.attachments) {
            if (att.base64) {
              parts.push({
                inlineData: {
                  mimeType: att.type,
                  data: att.base64
                }
              });
            } else if (att.textContent) {
              parts.push({
                text: `\n\n[Attached File: ${att.name}]\n${att.textContent}\n`
              });
            }
          }
          return {
            role: 'user',
            parts
          };
        }
        return {
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }]
        };
      });

      const fetchHeaders: Record<string, string> = { 'Content-Type': 'application/json' };
      if (userApiKey) {
        fetchHeaders['x-api-key'] = userApiKey;
      }

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: fetchHeaders,
        body: JSON.stringify({
          messages: apiContents,
          systemInstruction: systemInstruction.trim() || undefined,
          temperature,
          useSearchGrounding,
          model: selectedModel,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to get chat response');
      }

      setChatMessages((prev) => [
        ...prev,
        {
          role: 'model',
          text: data.text,
          grounding: data.grounding,
        },
      ]);
    } catch (err: any) {
      setError(err.message || 'An error occurred during chat.');
      // Restore user inputs on error to allow retry
      setChatInput(userMessageText);
      setChatAttachments(currentAttachments);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setChatMessages([
      {
        role: 'model',
        text: 'Hello! Stored chat has been reset. How can I assist you now?',
      },
    ]);
    setError(null);
  };

  // IF USER IS NOT LOGGED IN, RENDER ENERGETIC 3D CHEMISTRY LANDING EXPERIENCE WITH INTEGRATED SMOOTH UNBLUR LOGIN FORM
  if (!currentUser) {
    return (
      <ChemistryLanding
        onUnlock={(email) => {
          const newUser = { email };
          setCurrentUser(newUser);
          setIsGateUnlocked(true);
          localStorage.setItem('gemini_chat_user', JSON.stringify(newUser));
          localStorage.setItem('isGateUnlocked', 'true');
        }}
        onVerifyLogin={(email, pass) => {
          const matched = ALLOWED_USERS.find(
            (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === pass
          );
          return !!matched;
        }}
        darkMode={darkMode}
      />
    );
  }

  // LOGGED IN: SHOW PREMIUM ONE-SCREEN CHAT INTERFACE
  return (
    <div id="app-root" className="h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex font-sans selection:bg-indigo-150 overflow-hidden">
      
      {/* Collapsible Sidebar */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        sessions={sessions}
        activeSessionId={activeSessionId}
        setActiveSessionId={setActiveSessionId}
        createNewChatSession={createNewChatSession}
        deleteChatSession={deleteChatSession}
        currentUser={currentUser}
        onLogout={handleLogout}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onOpenSettings={() => setIsSettingsOpen(true)}
        userApiKey={userApiKey}
        hasKey={hasKey}
      />

      {/* Main Full-Bleed Interactive Chat Area */}
      <main id="app-main" className="flex-1 flex flex-col h-full bg-white dark:bg-slate-900 overflow-hidden relative">
        
        {/* Chat Area Top Header */}
        <header id="chat-header" className="px-6 py-4.5 border-b border-slate-150 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex items-center justify-between gap-4 shrink-0 select-none">
          <div className="min-w-0">
            <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider truncate flex items-center gap-2">
              <MessageSquare size={15} className="text-indigo-600 dark:text-indigo-400" />
              <span>{activeSession.title}</span>
            </h2>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold mt-1">
              Model: <span className="font-mono text-indigo-700 dark:text-indigo-400 font-extrabold">{selectedModel}</span> • Temp: {temperature}
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {/* Grounding Source Badge */}
            {useSearchGrounding && (
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-black bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/40 px-2 py-0.5 rounded-full uppercase tracking-wider">
                <Globe size={10} className="animate-pulse" />
                <span>Search Live</span>
              </span>
            )}

            {/* Custom API badge */}
            {userApiKey && (
              <span className="text-[10px] font-bold bg-green-500/10 text-green-500 px-2 py-0.5 rounded-full border border-green-500/20 font-mono">
                Custom Key Active
              </span>
            )}

            {/* Clear conversation button */}
            <button
              onClick={clearChat}
              className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors flex items-center gap-1.5 px-3 py-1.5 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl cursor-pointer shadow-sm border border-slate-200 dark:border-slate-800"
              title="Reset Chat Session"
            >
              <Trash2 size={13} />
              <span className="hidden sm:inline">Clear Chat</span>
            </button>

            {/* Workspace settings action */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer shadow-sm flex items-center justify-center transition-colors"
              title="Open Workspace Configuration"
            >
              <Settings2 size={15} />
            </button>
          </div>
        </header>

        {/* Chat Messages Bubble Scroller */}
        <div 
          id="chat-scroller" 
          className="flex-1 overflow-y-auto no-scrollbar px-6 py-6 space-y-5 bg-slate-50/40 dark:bg-slate-950/15"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {chatMessages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
            >
              <div
                className={`max-w-[85%] rounded-3xl px-5 py-3.5 text-sm leading-relaxed shadow-sm ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-none'
                    : 'bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-none'
                }`}
              >
                {msg.role === 'model' ? (
                  <div className="prose prose-slate dark:prose-invert max-w-none text-slate-800 dark:text-slate-100">
                    {parseMarkdown(msg.text)}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="whitespace-pre-wrap select-text">{msg.text}</p>
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-2 border-t border-indigo-500/30">
                        {msg.attachments.map((att) => {
                          const isImg = att.type.startsWith('image/');
                          return (
                            <div
                              key={att.id}
                              className="flex items-center gap-1.5 px-2 py-1 bg-white/15 dark:bg-slate-900/60 rounded-lg text-white dark:text-slate-200 text-[11px] font-medium"
                            >
                              {isImg && att.base64 ? (
                                <img
                                  src={`data:${att.type};base64,${att.base64}`}
                                  alt={att.name}
                                  className="w-5 h-5 rounded object-cover shrink-0"
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                <FileText size={12} className="text-white/80 dark:text-slate-400 shrink-0" />
                              )}
                              <span className="truncate max-w-[120px]" title={att.name}>
                                {att.name}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Web Grounding inside bubble */}
                {msg.grounding?.chunks && msg.grounding.chunks.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                    <span className="font-extrabold text-slate-400 dark:text-slate-500 flex items-center gap-1 mb-2 select-none uppercase tracking-wider text-[9px] font-mono">
                      <Globe size={11} className="text-indigo-500 dark:text-indigo-400" />
                      <span>Verified Citations</span>
                    </span>
                    <div className="space-y-1.5 select-none">
                      {msg.grounding.chunks.map((chunk: any, chunkIdx: number) => {
                        if (!chunk.web) return null;
                        return (
                          <a
                            key={chunkIdx}
                            href={chunk.web.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline truncate"
                          >
                            • {chunk.web.title}
                          </a>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Thinking indicators */}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-3xl rounded-bl-none px-5 py-3.5 shadow-sm text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-450 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-450 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-450 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span>Chat Igloo is thinking...</span>
              </div>
            </div>
          )}

          {/* Errors indicators */}
          {error && (
            <div className="flex justify-start select-text">
              <div className="bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/40 rounded-3xl rounded-bl-none px-4 py-3.5 shadow-sm flex items-start gap-2.5 text-red-700 dark:text-red-400">
                <AlertTriangle size={15} className="shrink-0 mt-0.5" />
                <div className="space-y-0.5 text-xs font-semibold">
                  <p className="font-extrabold uppercase tracking-wide text-[10px]">Failed to complete generation</p>
                  <p className="text-red-650 dark:text-red-400 mt-1 leading-normal">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Message Entry box Form */}
        <form
          onSubmit={handleSendChat}
          className="p-5 bg-white dark:bg-slate-900 border-t border-slate-150 dark:border-slate-800/80 flex flex-col gap-2 shrink-0 shadow-lg relative"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {renderAttachmentsPreview(chatAttachments, (id) => setChatAttachments((prev) => prev.filter((x) => x.id !== id)))}

          <div className="flex gap-3 items-center">
            {/* Hidden native input */}
            <input
              type="file"
              id="chat-file-upload"
              multiple
              className="sr-only"
              onChange={handleFileChange}
            />
            {/* Visual Trigger */}
            <label
              htmlFor="chat-file-upload"
              className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors cursor-pointer shadow-sm flex items-center justify-center shrink-0"
              title="Attach media files, PDFs, text, or docs"
            >
              <Paperclip size={16} />
            </label>

            {/* Main prompt box */}
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder={isDragging ? "Drop files here!" : (loading ? "Waiting for Chat Igloo..." : "Type a message... (Drop files to attach)")}
              disabled={loading}
              className={`flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3.5 text-sm focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 disabled:opacity-60 select-text text-slate-800 dark:text-slate-100 ${
                isDragging ? 'ring-1 ring-indigo-500 border-indigo-500 bg-indigo-50/10' : ''
              }`}
            />

            {/* Submission button */}
            <button
              type="submit"
              disabled={loading || (!chatInput.trim() && chatAttachments.length === 0)}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-600 text-white p-3.5 rounded-2xl transition-all shadow-md flex items-center justify-center shrink-0 cursor-pointer"
            >
              <Send size={15} />
            </button>
          </div>
        </form>

      </main>

      {/* Global Config settings modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        userApiKey={userApiKey}
        setUserApiKey={setUserApiKey}
        keyInput={keyInput}
        setKeyInput={setKeyInput}
        showKey={showKey}
        setShowKey={setShowKey}
        selectedModel={selectedModel}
        setSelectedModel={setSelectedModel}
        systemInstruction={systemInstruction}
        setSystemInstruction={setSystemInstruction}
        temperature={temperature}
        setTemperature={setTemperature}
        useSearchGrounding={useSearchGrounding}
        setUseSearchGrounding={setUseSearchGrounding}
        presets={presets}
        onApplyPreset={applyPreset}
        hasKey={hasKey}
      />
    </div>
  );
}
