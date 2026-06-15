import { motion, AnimatePresence } from 'motion/react';
import type { Article, EmpiricalKnowledge, KnowledgePage } from '../types';
import { getArticle, getKnowledgeDetail, listKnowledge, searchKnowledge, suggestKnowledge } from '../api';
import { Search, TrendingUp, Loader2, X, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

const PAGE_SIZE = 10;

type Toast = { type: 'success' | 'error'; message: string } | null;

export default function KnowledgeBase() {
  const [knowledge, setKnowledge] = useState<EmpiricalKnowledge[]>([]);
  const [page, setPage] = useState<KnowledgePage | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggest, setShowSuggest] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [activeSearch, setActiveSearch] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [contentLoadingId, setContentLoadingId] = useState<number | null>(null);
  const [toast, setToast] = useState<Toast>(null);
  const [viewingArticle, setViewingArticle] = useState<Article | null>(null);

  async function handleViewArticle(articleId: number | undefined, e: React.MouseEvent) {
    e.stopPropagation();
    if (!articleId) return;
    try {
      const article = await getArticle(articleId);
      setViewingArticle(article);
    } catch {
      notify('error', '加载原文失败');
    }
  }

  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const searchContainerRef = useRef<HTMLDivElement>(null);

  function notify(type: 'success' | 'error', message: string) {
    setToast({ type, message });
    window.setTimeout(() => setToast(null), 2600);
  }

  async function fetchKnowledge(pageNum = 1) {
    setLoading(true);
    try {
      const result = await listKnowledge(pageNum, PAGE_SIZE);
      setPage(result);
      setKnowledge(result.records);
    } catch (error) {
      notify('error', error instanceof Error ? error.message : '加载学习精华失败');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchKnowledge();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounced suggest
  const handleInputChange = useCallback(
    (value: string) => {
      setQuery(value);

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      if (!value.trim()) {
        setSuggestions([]);
        setShowSuggest(false);
        if (activeSearch) {
          setActiveSearch(null);
          fetchKnowledge(currentPage);
        }
        return;
      }

      debounceRef.current = setTimeout(async () => {
        try {
          const result = await suggestKnowledge(value.trim());
          const list = result ?? [];
          setSuggestions(list);
          setShowSuggest(list.length > 0);
        } catch {
          setSuggestions([]);
          setShowSuggest(false);
        }
      }, 300);
    },
    [activeSearch, currentPage],
  );

  // Execute search
  async function executeSearch(q: string) {
    const trimmed = q.trim();
    if (!trimmed) return;
    setIsSearching(true);
    setShowSuggest(false);
    setActiveSearch(trimmed);
    try {
      const result = await searchKnowledge(trimmed, 1, PAGE_SIZE);
      setPage(result);
      setKnowledge(result.records);
      setCurrentPage(1);
      if (result.records.length === 0) {
        notify('success', `未找到与「${trimmed}」相关的结果`);
      }
    } catch (error) {
      notify('error', error instanceof Error ? error.message : '搜索失败');
    } finally {
      setIsSearching(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      executeSearch(query);
    }
    if (e.key === 'Escape') {
      setShowSuggest(false);
    }
  }

  function handleSuggestionClick(text: string) {
    setQuery(text);
    setShowSuggest(false);
    executeSearch(text);
  }

  function handleClear() {
    setQuery('');
    setSuggestions([]);
    setShowSuggest(false);
    setActiveSearch(null);
    setCurrentPage(1);
    fetchKnowledge(1);
  }

  // Click outside to dismiss suggest dropdown
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSuggest(false);
      }
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  async function goToPage(p: number) {
    if (p < 1 || (page && p > page.pages)) return;
    setCurrentPage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setLoading(true);
    try {
      if (activeSearch) {
        const result = await searchKnowledge(activeSearch, p, PAGE_SIZE);
        setPage(result);
        setKnowledge(result.records);
      } else {
        const result = await listKnowledge(p, PAGE_SIZE);
        setPage(result);
        setKnowledge(result.records);
      }
    } catch (error) {
      notify('error', error instanceof Error ? error.message : '加载失败');
    } finally {
      setLoading(false);
    }
  }

  const sortedKnowledge = [...knowledge].sort((a, b) => b.score * b.frequency - a.score * a.frequency);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-16"
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

      {/* Header + Search */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-8 pb-12 border-b border-natural-border">
        <div className="flex flex-col">
          <span className="text-xs uppercase tracking-[0.2em] text-natural-light font-semibold">Curated Intelligence</span>
          <h2 className="text-4xl font-serif leading-[1.1] mt-4 mb-2 text-natural-text">学习精华库</h2>
          <p className="text-sm text-natural-muted leading-relaxed">
            {activeSearch ? `搜索「${activeSearch}」的结果` : '由 AI 自动归类提炼，按复用价值动态排序。'}
          </p>
        </div>

        <div ref={searchContainerRef} className="relative w-full sm:w-72">
          <div className="flex items-center border-b border-natural-border focus-within:border-natural-accent transition-colors">
            <Search className="w-4 h-4 text-natural-light shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => suggestions.length > 0 && setShowSuggest(true)}
              placeholder="搜索学习精华..."
              className="flex-1 pl-3 pr-2 py-2 bg-transparent text-sm focus:outline-none placeholder:text-natural-light"
            />
            {query && (
              <button
                onClick={handleClear}
                className="p-1 text-natural-light hover:text-natural-muted transition-colors"
                aria-label="清除搜索"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            {isSearching && <Loader2 className="w-3.5 h-3.5 text-natural-accent animate-spin mr-1" />}
          </div>

          {/* Suggest dropdown */}
          <AnimatePresence>
            {showSuggest && suggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="absolute top-full left-0 right-0 mt-1 bg-white border border-natural-border shadow-lg z-20 overflow-hidden"
              >
                {suggestions.map((text, i) => (
                  <button
                    key={i}
                    onClick={() => handleSuggestionClick(text)}
                    className="block w-full text-left px-4 py-2.5 text-sm text-natural-text hover:bg-natural-bg transition-colors border-b border-natural-border last:border-b-0"
                  >
                    {text}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 text-natural-accent animate-spin" />
        </div>
      )}

      {/* Empty */}
      {!loading && knowledge.length === 0 && (
        <div className="text-center py-24">
          <p className="text-natural-muted text-lg">暂无学习精华</p>
          {activeSearch && (
            <button
              onClick={handleClear}
              className="mt-4 text-sm text-natural-accent hover:text-natural-accent-hover transition-colors underline underline-offset-2"
            >
              清除搜索，查看全部
            </button>
          )}
        </div>
      )}

      {/* Grid */}
      {!loading && knowledge.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <AnimatePresence mode="popLayout">
            {sortedKnowledge.map((item) => {
              const isExpanded = expandedId === item.id;
              return (
                <motion.div key={item.id} layout>
                  <Card
                    item={item}
                    expanded={isExpanded}
                    contentLoading={contentLoadingId === item.id}
                    onToggle={async () => {
                      if (isExpanded) {
                        setExpandedId(null);
                      } else {
                        setExpandedId(item.id);
                        // 每次展开都调后端（频率递增由后端完成），只有首次才显示 loading
                        if (!item.content) {
                          setContentLoadingId(item.id);
                        }
                        try {
                          const content = await getKnowledgeDetail(item.id);
                          setKnowledge((prev) =>
                            prev.map((k) =>
                              k.id === item.id
                                ? { ...k, content: k.content ?? content, frequency: k.frequency + 1 }
                                : k,
                            ),
                          );
                        } catch {
                          // 后端失败也不影响展开
                        } finally {
                          setContentLoadingId(null);
                        }
                      }
                    }}
                    onViewArticle={(e) => handleViewArticle(item.articleIdEmp, e)}
                  />
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Pagination */}
      {page && page.pages > 1 && (
        <div className="flex items-center justify-center gap-6 pt-8 border-t border-natural-border">
          <button
            disabled={currentPage <= 1}
            onClick={() => goToPage(currentPage - 1)}
            className="inline-flex items-center gap-1 text-xs text-natural-muted hover:text-natural-accent transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            上一页
          </button>
          <span className="text-xs text-natural-light">
            {currentPage} / {page.pages}
          </span>
          <button
            disabled={currentPage >= page.pages}
            onClick={() => goToPage(currentPage + 1)}
            className="inline-flex items-center gap-1 text-xs text-natural-muted hover:text-natural-accent transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            下一页
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Article Modal */}
      <AnimatePresence>
        {viewingArticle && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
            onClick={() => setViewingArticle(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-natural-bg border border-natural-border max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto p-8 shadow-xl"
            >
              <div className="flex items-start justify-between mb-6">
                <h3 className="text-xl font-serif text-natural-text pr-4">{viewingArticle.title}</h3>
                <button
                  onClick={() => setViewingArticle(null)}
                  className="text-natural-light hover:text-natural-muted transition-colors shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <section className="mb-6">
                <h4 className="text-[10px] uppercase tracking-[0.2em] text-natural-light mb-2">问题描述</h4>
                <p className="text-sm text-natural-muted leading-relaxed whitespace-pre-wrap">
                  {viewingArticle.description || '暂无'}
                </p>
              </section>

              <section className="border-l-2 border-natural-accent bg-[#f8f4ed] px-5 py-4">
                <h4 className="text-[10px] uppercase tracking-[0.2em] text-natural-light mb-2">学习精华</h4>
                <p className="text-sm text-natural-text leading-relaxed whitespace-pre-wrap">
                  {viewingArticle.experience || '暂无'}
                </p>
              </section>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function Card({
  item,
  expanded,
  contentLoading,
  onToggle,
  onViewArticle,
}: {
  item: EmpiricalKnowledge;
  expanded: boolean;
  contentLoading: boolean;
  onToggle: () => void;
  onViewArticle: (e: React.MouseEvent) => void;
}) {
  return (
    <div
      onClick={onToggle}
      className="border border-natural-border p-8 hover:border-natural-accent transition-colors cursor-pointer relative group flex flex-col justify-between"
    >
      <div className="flex justify-between items-start mb-6">
        <span className="text-[10px] uppercase tracking-widest text-natural-light font-medium">
          {item.type}
        </span>

        <div className="flex items-center gap-4 text-[10px] uppercase tracking-widest text-natural-light">
          <span title="AI 价值评分">Score {item.score}</span>
          <span className="flex items-center" title="复用频次">
            <TrendingUp className="w-3 h-3 mr-1" />
            {item.frequency}x
          </span>
        </div>
      </div>

      <h3 className="text-xl font-serif text-natural-text mb-4 mt-2 group-hover:text-natural-accent transition-colors">
        {item.title}
      </h3>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {contentLoading ? (
              <div className="flex items-center gap-2 py-4 text-sm text-natural-light">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                加载中...
              </div>
            ) : item.content ? (
              <>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-natural-muted pb-4">
                  {item.content}
                </p>
                {item.articleIdEmp && (
                  <button
                    onClick={onViewArticle}
                    className="inline-flex items-center gap-1.5 pb-4 text-[10px] uppercase tracking-widest text-natural-accent hover:text-natural-accent-hover transition-colors"
                  >
                    <FileText className="w-3 h-3" />
                    查看原文
                  </button>
                )}
                <div className="border-b border-natural-border mb-4" />
              </>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between text-[10px] text-natural-light mt-auto pt-6 border-t border-natural-border border-opacity-50 uppercase tracking-widest">
        <span>Retrieved {new Date(item.createtime).toLocaleDateString()}</span>
        <span className="text-natural-muted">
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </span>
      </div>
    </div>
  );
}
