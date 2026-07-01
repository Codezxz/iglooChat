import React from 'react';
import { 
  Sparkles, 
  Plus, 
  MessageSquare, 
  Trash2, 
  X, 
  Settings2, 
  Sun, 
  Moon, 
  LogOut, 
  ChevronLeft, 
  ChevronRight, 
  Key,
  Globe,
  Lock
} from 'lucide-react';

interface ChatSession {
  id: string;
  title: string;
  messages: Array<any>;
  createdAt: number;
}

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (val: boolean) => void;
  sessions: ChatSession[];
  activeSessionId: string;
  setActiveSessionId: (id: string) => void;
  createNewChatSession: () => void;
  deleteChatSession: (id: string, e: any) => void;
  currentUser: { email: string } | null;
  onLogout: () => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  onOpenSettings: () => void;
  userApiKey: string;
  hasKey: boolean | null;
}

export default function Sidebar({
  isCollapsed,
  setIsCollapsed,
  sessions,
  activeSessionId,
  setActiveSessionId,
  createNewChatSession,
  deleteChatSession,
  currentUser,
  onLogout,
  darkMode,
  setDarkMode,
  onOpenSettings,
  userApiKey,
  hasKey
}: SidebarProps) {
  // Extract initial from email for user card avatar
  const userInitial = currentUser?.email ? currentUser.email.charAt(0).toUpperCase() : '?';
  const shortEmail = currentUser?.email ? currentUser.email.split('@')[0] : 'User';

  return (
    <aside 
      id="app-sidebar"
      className={`h-screen bg-slate-900 text-slate-100 flex flex-col border-r border-slate-800 transition-all duration-300 relative shrink-0 z-40 select-none ${
        isCollapsed ? 'w-[70px]' : 'w-72'
      }`}
    >
      {/* Collapse/Expand Toggle Button floating on border */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute top-6 -right-3 w-6 h-6 bg-slate-800 border border-slate-700 hover:bg-slate-700 rounded-full flex items-center justify-center text-slate-300 hover:text-white cursor-pointer shadow-md transition-colors z-50"
        title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
      >
        {isCollapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
      </button>

      {/* Brand Section */}
      <div className={`p-4 flex items-center gap-3 border-b border-slate-800/60 overflow-hidden shrink-0 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 via-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shrink-0">
            <Sparkles size={16} className="animate-pulse" />
          </div>
          {!isCollapsed && (
            <div className="min-w-0 animate-fade-in">
              <h1 className="text-xs font-black tracking-wider uppercase text-white leading-none">CHAT IGLOO</h1>
              <p className="text-[9px] text-slate-400 font-bold mt-1">INTELLIGENT SANDBOX</p>
            </div>
          )}
        </div>
      </div>

      {/* Connections Status Indicator */}
      {!isCollapsed && (
        <div className="px-4 py-2.5 bg-slate-950/40 border-b border-slate-800/30 flex items-center justify-between shrink-0 animate-fade-in">
          <div className="flex items-center gap-2 min-w-0">
            <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${userApiKey || hasKey ? 'bg-green-500' : 'bg-amber-500'}`} />
            <span className="text-[10px] text-slate-400 font-semibold font-mono truncate">
              {userApiKey ? 'Custom API Active' : hasKey ? 'API Engine Ready' : 'Key Required'}
            </span>
          </div>
        </div>
      )}

      {/* Action Items List */}
      <div className="p-3 space-y-2 shrink-0">
        {/* Create Session Button */}
        <button
          onClick={createNewChatSession}
          className={`w-full flex items-center gap-2.5 p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all shadow-md hover:shadow-indigo-500/10 cursor-pointer ${
            isCollapsed ? 'justify-center' : 'justify-start text-xs'
          }`}
          title="Create New Conversation"
        >
          <Plus size={15} />
          {!isCollapsed && <span className="animate-fade-in">New Conversation</span>}
        </button>

        {/* Configuration settings launcher */}
        <button
          onClick={onOpenSettings}
          className={`w-full flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer ${
            isCollapsed ? 'justify-center' : 'justify-start text-xs font-bold'
          }`}
          title="Configure Model & API Key"
        >
          <Settings2 size={15} className="text-indigo-400" />
          {!isCollapsed && <span className="animate-fade-in">Workspace Config</span>}
        </button>
      </div>

      {/* Conversation list section */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-3 py-2 space-y-1 select-none">
        {!isCollapsed && (
          <p className="text-[9px] font-black tracking-wider uppercase text-slate-500 px-2.5 pb-2">
            Active Conversations
          </p>
        )}
        
        {sessions.map((s) => {
          const isActive = s.id === activeSessionId;
          return (
            <div
              key={s.id}
              onClick={() => setActiveSessionId(s.id)}
              className={`group flex items-center rounded-xl cursor-pointer transition-all relative ${
                isActive 
                  ? 'bg-indigo-600/15 text-indigo-300 font-bold border border-indigo-500/20' 
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border border-transparent'
              } ${isCollapsed ? 'p-2.5 justify-center' : 'p-2.5 justify-between'}`}
              title={s.title}
            >
              <div className="flex items-center gap-2.5 min-w-0 pr-1.5">
                <MessageSquare size={14} className={isActive ? 'text-indigo-400' : 'text-slate-500'} />
                {!isCollapsed && <span className="text-xs truncate max-w-[140px] animate-fade-in">{s.title}</span>}
              </div>
              
              {!isCollapsed && sessions.length > 1 && (
                <button
                  onClick={(e) => deleteChatSession(s.id, e)}
                  className="p-1 rounded bg-transparent hover:bg-red-950/60 text-slate-500 hover:text-red-400 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer shrink-0"
                  title="Delete Conversation"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer Settings Row & User Card */}
      <div className="p-3 border-t border-slate-800/80 space-y-2.5 bg-slate-950/20 shrink-0">
        
        {/* Toggle Mode button when open */}
        {!isCollapsed ? (
          <div className="flex items-center justify-between gap-2 px-1">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono">Appearance</span>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
            >
              {darkMode ? <Sun size={13} className="text-amber-400" /> : <Moon size={13} />}
              <span>{darkMode ? 'Light' : 'Dark'}</span>
            </button>
          </div>
        ) : (
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="w-full flex justify-center p-2 rounded-xl hover:bg-slate-800/80 text-slate-400 hover:text-white cursor-pointer"
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {darkMode ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} />}
          </button>
        )}

        {/* User profile card & Logout action */}
        {currentUser && (
          <div className={`p-2.5 rounded-2xl bg-slate-950/40 border border-slate-800/50 flex items-center gap-3 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
            <div className="flex items-center gap-2.5 min-w-0">
              {/* Avatar circle */}
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-500 flex items-center justify-center text-white font-extrabold text-sm shadow-md shrink-0 select-none">
                {userInitial}
              </div>
              {!isCollapsed && (
                <div className="min-w-0 animate-fade-in leading-tight">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono">Authorized</p>
                  <p className="text-xs font-bold text-slate-200 truncate max-w-[120px]">{shortEmail}</p>
                </div>
              )}
            </div>
            {!isCollapsed && (
              <button
                onClick={onLogout}
                className="p-1.5 rounded-lg bg-slate-800/50 hover:bg-red-950/40 text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                title="Log Out of Gate"
              >
                <LogOut size={13} />
              </button>
            )}
          </div>
        )}

        {/* Floating Logout button when collapsed */}
        {isCollapsed && currentUser && (
          <button
            onClick={onLogout}
            className="w-full flex justify-center p-2 rounded-xl hover:bg-red-950/30 text-slate-500 hover:text-red-400 cursor-pointer"
            title="Log Out"
          >
            <LogOut size={15} />
          </button>
        )}
      </div>
    </aside>
  );
}
