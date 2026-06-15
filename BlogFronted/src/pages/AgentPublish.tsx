import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Sparkles, Loader2, Plus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { agentChat, searchAgentChat } from '../api';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

function renderMarkdown(text: string) {
  return { __html: DOMPurify.sanitize(marked(text)) };
}

interface Message {
  role: 'user' | 'agent';
  text: string;
}

type Toast = { type: 'success' | 'error'; message: string } | null;

const PUBLISH_GREETING = '你好！我是你的知识管理助手。直接发一段技术笔记或踩坑经历给我，我来帮你整理成文章发布。';
const SEARCH_GREETING = '你好！我是静思录的智能检索助手。告诉我你最近遇到的技术问题或想了解的方向，我来帮你从知识库中找答案。';

export default function AgentPublish() {
  const { isAdmin } = useAuth();
  const greeting = isAdmin ? PUBLISH_GREETING : SEARCH_GREETING;
  const apiCall = isAdmin ? agentChat : searchAgentChat;

  const [messages, setMessages] = useState<Message[]>(() => [
    { role: 'agent', text: greeting },
  ]);

  // 管理员登录/登出后自动重置对话
  useEffect(() => {
    setMessages([{ role: 'agent', text: greeting }]);
    setConversationId('');
  }, [isAdmin]);
  const [conversationId, setConversationId] = useState('');
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState<Toast>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function notify(type: 'success' | 'error', message: string) {
    setToast({ type, message });
    window.setTimeout(() => setToast(null), 3000);
  }

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleNewConversation() {
    setConversationId('');
    setMessages([{ role: 'agent', text: greeting }]);
    inputRef.current?.focus();
  }

  async function handleSend() {
    const trimmed = input.trim();
    if (!trimmed || sending) return;

    const userMessage: Message = { role: 'user', text: trimmed };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setSending(true);

    try {
      const raw = await apiCall(trimmed, conversationId || undefined);

      // 后端返回格式：conversationId|||回复内容
      const sepIdx = raw.indexOf('|||');
      const cid = sepIdx !== -1 ? raw.substring(0, sepIdx) : '';
      const reply = sepIdx !== -1 ? raw.substring(sepIdx + 3) : raw;

      if (cid && !conversationId) {
        setConversationId(cid);
      }

      setMessages((prev) => [...prev, { role: 'agent', text: reply }]);
    } catch (error) {
      notify('error', error instanceof Error ? error.message : '发送失败，请稍后重试');
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="max-w-2xl mx-auto h-full flex flex-col"
    >
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-24 right-8 z-50 px-5 py-3 text-sm shadow-lg backdrop-blur-md ${
              toast.type === 'success'
                ? 'bg-natural-accent/90 text-white'
                : 'bg-red-100/90 text-red-800 border border-red-200'
            }`}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col text-center items-center shrink-0 pb-8">
        <span className="text-xs uppercase tracking-[0.2em] text-natural-light font-semibold">
          {isAdmin ? 'Publishing Assistant' : 'Search Assistant'}
        </span>
        <h2 className="text-4xl font-serif leading-[1.1] mt-4 mb-4 text-natural-text">
          {isAdmin ? 'Agent 辅助发布' : 'Agent 智能检索'}
        </h2>
        <p className="text-sm text-natural-muted leading-relaxed max-w-sm">
          {isAdmin
            ? '用对话的方式，AI 引导你完成一篇高质量技术文章的发布。'
            : '告诉我你遇到的技术问题，AI 从知识库中匹配最相关的经验解答。'
          }
        </p>
        {conversationId && (
          <button
            onClick={handleNewConversation}
            className="mt-3 inline-flex items-center gap-1 text-[10px] uppercase tracking-widest text-natural-light hover:text-natural-accent transition-colors"
          >
            <Plus className="w-3 h-3" />
            新对话
          </button>
        )}
      </div>

      {/* Chat Card */}
      <div className="bg-natural-bg border border-natural-border rounded-sm overflow-hidden flex flex-col flex-1 min-h-0 shadow-sm">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#F9F8F6]">
          {messages.map((msg, i) =>
            msg.role === 'agent' ? (
              <div key={i} className="flex gap-3 max-w-[85%]">
                <div className="w-7 h-7 rounded-full bg-natural-accent text-white flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div
                  className="bg-natural-bg border border-natural-border px-5 py-3.5 rounded-sm rounded-tl-none text-sm text-natural-text leading-relaxed [&_p]:mb-2 [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4 [&_strong]:font-semibold [&_code]:bg-natural-bg [&_code]:px-1 [&_code]:text-xs [&_pre]:bg-natural-bg [&_pre]:p-3 [&_pre]:text-xs [&_pre]:overflow-x-auto [&_h3]:font-serif [&_h3]:text-base [&_h3]:mb-2 [&_hr]:border-natural-border"
                  dangerouslySetInnerHTML={renderMarkdown(msg.text)}
                />
              </div>
            ) : (
              <div key={i} className="flex justify-end">
                <div className="max-w-[80%] bg-natural-accent/10 border border-natural-border px-5 py-3 rounded-sm text-sm text-natural-text leading-relaxed whitespace-pre-wrap">
                  {msg.text}
                </div>
              </div>
            ),
          )}

          {/* Loading bubble */}
          {sending && (
            <div className="flex gap-3 max-w-[85%]">
              <div className="w-7 h-7 rounded-full bg-natural-accent text-white flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div className="bg-natural-bg border border-natural-border px-5 py-3.5 rounded-sm rounded-tl-none flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-natural-muted rounded-full animate-bounce" />
                <span className="w-1.5 h-1.5 bg-natural-muted rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <span className="w-1.5 h-1.5 bg-natural-muted rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-natural-bg border-t border-natural-border flex items-center gap-3">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="发给我一条技术笔记..."
            disabled={sending}
            className="flex-1 bg-transparent border-b border-natural-border focus:border-natural-accent px-2 py-2 text-sm outline-none transition-all placeholder:text-natural-light"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || sending}
            className="p-2.5 bg-natural-accent text-white rounded-sm hover:bg-natural-accent-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          >
            {sending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
