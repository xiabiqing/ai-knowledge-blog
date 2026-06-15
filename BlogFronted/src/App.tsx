import { useRef, useState } from 'react';
import { ViewState } from './types';
import Articles from './pages/Articles';
import KnowledgeBase from './pages/KnowledgeBase';
import AgentPublish from './pages/AgentPublish';
import AdminLoginModal from './components/AdminLoginModal';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LogOut } from 'lucide-react';

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}

function AppShell() {
  const [currentView, setCurrentView] = useState<ViewState>('articles');
  const { isAdmin, logout } = useAuth();
  const [loginOpen, setLoginOpen] = useState(false);
  const logoClickRef = useRef({ count: 0, timer: 0 });

  function handleLogoClick() {
    const now = Date.now();
    const prev = logoClickRef.current;
    // 超过 800ms 重置计数
    if (now - prev.timer > 800) prev.count = 0;
    prev.count += 1;
    prev.timer = now;
    if (prev.count >= 3) {
      prev.count = 0;
      setLoginOpen(true);
    }
  }

  function handleNavClick(view: ViewState) {
    setCurrentView(view);
  }

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-natural-border">
      {/* Navbar */}
      <nav className="sticky top-0 z-10 bg-natural-bg/90 backdrop-blur-md border-b border-natural-border">
        <div className="max-w-4xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4 text-natural-text font-serif">
            <img
              src="/微信图片_20260609100857_297_12.jpg"
              alt="静思录"
              className="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover cursor-pointer"
              onClick={handleLogoClick}
              title=""
            />
            <span
              className="text-xl sm:text-2xl font-medium tracking-tight cursor-pointer"
              onClick={() => setCurrentView('articles')}
            >
              静思录
            </span>
          </div>

          <div className="flex space-x-4 sm:space-x-8 text-sm text-natural-muted">
            <NavButton
              active={currentView === 'articles'}
              onClick={() => handleNavClick('articles')}
              label="文章"
            />
            <NavButton
              active={currentView === 'knowledge'}
              onClick={() => handleNavClick('knowledge')}
              label="知识库"
            />

            <NavButton
              active={currentView === 'agent'}
              onClick={() => handleNavClick('agent')}
              label="Agent智能体"
            />
          </div>

          {/* 右侧：管理员登出 */}
          <div className="flex items-center gap-3 ml-4">
            {isAdmin && (
              <button
                onClick={logout}
                className="text-[10px] text-natural-light hover:text-red-500 transition-colors flex items-center gap-1"
                title="退出登录"
              >
                <LogOut className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content — 挂载后保持不卸载，避免切 tab 丢状态 */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-6 py-16">
        <div className={currentView === 'articles' ? '' : 'hidden'}><Articles /></div>
        <div className={currentView === 'knowledge' ? '' : 'hidden'}><KnowledgeBase /></div>
        <div className={currentView === 'agent' ? '' : 'hidden'}><AgentPublish /></div>
      </main>

      {/* Footer with hidden login trigger */}
      <footer className="mt-auto py-8 text-xs text-natural-light border-t border-natural-border">
        <div className="max-w-4xl mx-auto px-6 flex justify-between items-center">
          <span>&copy; {new Date().getFullYear()} 静思录</span>
          <div className="flex gap-6 hidden sm:flex">
            <span>隐私政策</span>
            <span>服务条款</span>
            <span>邮件订阅</span>
          </div>
        </div>
      </footer>

      {/* Admin Login Modal */}
      <AdminLoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </div>
  );
}

function NavButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`transition-colors flex items-center ${
        active ? 'text-natural-accent font-semibold' : 'hover:text-natural-accent'
      }`}
    >
      <span>{label}</span>
    </button>
  );
}
