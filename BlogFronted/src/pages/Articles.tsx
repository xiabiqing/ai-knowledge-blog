import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import {
  ArrowLeft,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  FileText,
  Loader2,
  Maximize2,
  Minus,
  PencilLine,
  Plus,
  Sparkles,
  RefreshCcw,
  Save,
  Trash2,
  UploadCloud,
  X,
} from 'lucide-react';
import type { Article, CreateArticlePayload, UpdateArticlePayload } from '../types';
import {
  completeArticle,
  createArticle,
  deleteArticle,
  getArticle,
  listArticles,
  updateArticle,
  uploadArticleFile,
} from '../api';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';

// PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

const PAGE_SIZE = 8;
const emptyForm: CreateArticlePayload = {
  title: '',
  sourceFilePath: '',
  description: '',
  experience: '',
};

type Toast = { type: 'success' | 'error'; message: string } | null;
type EditorMode = 'create' | 'edit';
type ScreenMode = 'list' | 'detail';

export default function Articles() {
  const { isAdmin } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [form, setForm] = useState<CreateArticlePayload>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editorMode, setEditorMode] = useState<EditorMode>('create');
  const [screenMode, setScreenMode] = useState<ScreenMode>('list');
  const [current, setCurrent] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [toast, setToast] = useState<Toast>(null);

  const [editorOpen, setEditorOpen] = useState(false);

  const canPrev = current > 1;
  const canNext = current < pages;

  useEffect(() => {
    void fetchArticles(current);
  }, [current]);

  function notify(type: Toast['type'], message: string) {
    setToast({ type, message });
    window.setTimeout(() => setToast(null), 2600);
  }

  async function fetchArticles(page = 1) {
    setLoading(true);
    try {
      const result = await listArticles(page, PAGE_SIZE);
      setArticles(result.records ?? []);
      setPages(Math.max(result.pages || 1, 1));
      setTotal(result.total ?? 0);
    } catch (error) {
      notify('error', error instanceof Error ? error.message : '文章列表加载失败');
    } finally {
      setLoading(false);
    }
  }

  async function openDetail(id: number) {
    setDetailLoading(true);
    setScreenMode('detail');
    try {
      const article = await getArticle(id);
      setSelectedArticle(article);
    } catch (error) {
      setScreenMode('list');
      notify('error', error instanceof Error ? error.message : '文章详情加载失败');
    } finally {
      setDetailLoading(false);
    }
  }

  function closeEditor() {
    setEditorOpen(false);
    setForm(emptyForm);
    setEditingId(null);
  }

  function backToList() {
    setScreenMode('list');
  }

  function startCreate() {
    setEditorMode('create');
    setEditingId(null);
    setForm(emptyForm);
    setEditorOpen(true);
  }

  async function startEdit(article: Article) {
    setEditorMode('edit');
    setEditingId(article.id);
    const fullArticle = article.description && article.experience ? article : await getArticle(article.id);
    setForm({
      title: fullArticle.title ?? '',
      sourceFilePath: fullArticle.sourceFilePath ?? '',
      description: fullArticle.description ?? '',
      experience: fullArticle.experience ?? '',
    });
    setSelectedArticle(fullArticle);
    setScreenMode('list');
    setEditorOpen(true);
  }

  async function handleUpload(file?: File) {
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadArticleFile(file);
      setForm((prev) => ({ ...prev, sourceFilePath: url }));
      notify('success', '源文件上传完成，已自动写入文章地址');
    } catch (error) {
      notify('error', error instanceof Error ? error.message : '文件上传失败');
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.title.trim() || !form.description.trim() || !form.experience.trim()) {
      notify('error', '标题、问题描述和学习精华不能为空');
      return;
    }

    setSubmitting(true);
    try {
      if (editorMode === 'edit' && editingId) {
        const payload: UpdateArticlePayload = { id: editingId, ...form };
        await updateArticle(payload);
        notify('success', '文章已更新');
      } else {
        await createArticle(form);
        notify('success', '文章已发布');
      }
      closeEditor();
      await fetchArticles(current);
    } catch (error) {
      notify('error', error instanceof Error ? error.message : '保存失败');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleAIComplete() {
    if (!form.sourceFilePath) {
      notify('error', '请先上传源文件（Markdown / PDF / 图片），AI 需要读取文件内容才能补全。');
      return;
    }
    setAiLoading(true);
    try {
      const result = await completeArticle(form.sourceFilePath);
      setForm({
        ...form,
        title: result.title || form.title,
        description: result.description || form.description,
        experience: result.experience || form.experience,
      });
      notify('success', 'AI 已根据文件内容补全标题、问题描述和学习精华');
    } catch (error) {
      notify('error', error instanceof Error ? error.message : 'AI 补全失败，请稍后重试');
    } finally {
      setAiLoading(false);
    }
  }

  async function handleDelete(article: Article) {
    if (!window.confirm(`确定删除「${article.title}」吗？`)) return;
    try {
      await deleteArticle(article.id);
      notify('success', '文章已删除');
      if (selectedArticle?.id === article.id) {
        setSelectedArticle(null);
        setScreenMode('list');
      }
      await fetchArticles(current);
    } catch (error) {
      notify('error', error instanceof Error ? error.message : '删除失败');
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-10">
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className={`fixed right-6 top-24 z-50 border px-5 py-3 text-xs uppercase tracking-[0.18em] shadow-sm ${
              toast.type === 'success' ? 'border-natural-accent bg-natural-accent text-white' : 'border-red-200 bg-red-50 text-red-700'
            }`}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {screenMode === 'detail' ? (
          <ArticleDetailView
            key="article-detail"
            article={selectedArticle}
            loading={detailLoading}
            isAdmin={isAdmin}
            onBack={backToList}
            onEdit={(article) => void startEdit(article)}
            onDelete={(article) => void handleDelete(article)}
          />
        ) : (
          <motion.div key="article-list" initial={{ opacity: 0, x: -18 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 18 }} transition={{ duration: 0.25 }}>
            <section className="space-y-8">
              <div className="flex flex-col gap-6 border-b border-natural-border pb-8 md:flex-row md:items-end md:justify-between">
                <div>
                  <span className="text-xs uppercase tracking-[0.2em] text-natural-light font-semibold">Live Archive</span>
                  <h2 className="text-4xl md:text-5xl font-serif leading-[1.1] mt-4 mb-4 text-natural-text">文章列表</h2>
                  <p className="text-lg text-natural-muted leading-relaxed max-w-xl">点击文章进入独立阅读页；点击右上按钮发布新文章。</p>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => void fetchArticles(current)} className="inline-flex items-center gap-2 border border-natural-border px-4 py-3 text-[10px] uppercase tracking-widest text-natural-muted transition hover:border-natural-accent hover:text-natural-accent">
                    <RefreshCcw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} /> 刷新
                  </button>
                  {isAdmin && (
                    <button onClick={startCreate} className="inline-flex items-center gap-2 bg-natural-accent px-5 py-3 text-[10px] uppercase tracking-widest text-white transition hover:bg-natural-accent-hover">
                      <Plus className="h-3.5 w-3.5" /> 发布文章
                    </button>
                  )}
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                {loading && articles.length === 0 ? (
                  <div className="md:col-span-2">
                    <StateCard icon={<Loader2 className="h-5 w-5 animate-spin" />} title="正在读取文章" description="等待后端 /article/list 返回分页数据。" />
                  </div>
                ) : articles.length === 0 ? (
                  <div className="md:col-span-2">
                    <StateCard icon={<FileText className="h-5 w-5" />} title="暂无文章" description="点击右上角「发布文章」开始记录第一条知识。" />
                  </div>
                ) : (
                  articles.map((article) => (
                    <article key={article.id} className="group flex min-h-[260px] flex-col justify-between border border-natural-border bg-[#fffefa] p-6 transition hover:-translate-y-1 hover:border-natural-accent hover:shadow-sm">
                      <button onClick={() => void openDetail(article.id)} className="block w-full text-left">
                        <span className="inline-flex items-center gap-2 text-[10px] text-natural-light font-medium tracking-widest uppercase">
                          <Calendar className="h-3 w-3" />
                          {article.updatetime ? new Date(article.updatetime).toLocaleDateString() : 'No date'}
                        </span>
                        <h3 className="mt-4 font-serif text-2xl leading-snug transition-colors group-hover:text-natural-accent">{article.title}</h3>
                        <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-natural-muted">{article.description || '点击进入独立详情页阅读完整内容。'}</p>
                      </button>

                      <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-natural-border pt-4 text-[10px] uppercase tracking-widest text-natural-light">
                        <button onClick={() => void openDetail(article.id)} className="inline-flex items-center gap-2 transition hover:text-natural-accent">
                          阅读全文
                          <ChevronRight className="h-3 w-3" />
                        </button>
                        {isAdmin && (
                          <div className="flex gap-3">
                            <button onClick={() => void startEdit(article)} className="transition hover:text-natural-accent" title="编辑文章">
                              <PencilLine className="h-3.5 w-3.5" />
                            </button>
                            <button onClick={() => void handleDelete(article)} className="transition hover:text-red-600" title="删除文章">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </article>
                  ))
                )}
              </div>

              <div className="flex items-center justify-between border-t border-natural-border pt-6 text-xs text-natural-muted">
                <span>
                  共 {total} 条 · 第 {current} / {pages} 页
                </span>
                <div className="flex gap-2">
                  <button disabled={!canPrev} onClick={() => setCurrent((value) => value - 1)} className="border border-natural-border p-2 transition hover:border-natural-accent disabled:cursor-not-allowed disabled:opacity-30">
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button disabled={!canNext} onClick={() => setCurrent((value) => value + 1)} className="border border-natural-border p-2 transition hover:border-natural-accent disabled:cursor-not-allowed disabled:opacity-30">
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </section>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Editor slide-in panel */}
      <AnimatePresence>
        {editorOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
              onClick={closeEditor}
            />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 280 }}
              className="fixed right-0 top-0 z-50 h-full w-full max-w-lg overflow-y-auto border-l border-natural-border bg-[#fffefa] shadow-2xl"
            >
              <div className="p-8">
                <ArticleEditor
                  form={form}
                  editorMode={editorMode}
                  uploading={uploading}
                  submitting={submitting}
                  aiLoading={aiLoading}
                  hasSourceFile={Boolean(form.sourceFilePath)}
                  onCancelEdit={closeEditor}
                  onUpload={handleUpload}
                  onAIComplete={() => void handleAIComplete()}
                  onSubmit={handleSubmit}
                  onChange={setForm}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function formatDate(dateStr?: string) {
  if (!dateStr) return null;
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return null;
    return d.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
  } catch {
    return null;
  }
}

const TEXT_EXTENSIONS = ['md', 'markdown', 'txt'];
const IMAGE_EXTENSIONS = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'];
const PREVIEW_EXTENSIONS = [...IMAGE_EXTENSIONS, 'pdf', 'html', 'htm', ...TEXT_EXTENSIONS];

function ArticleDetailView({ article, loading, isAdmin, onBack, onEdit, onDelete }: { article: Article | null; loading: boolean; isAdmin: boolean; onBack: () => void; onEdit: (article: Article) => void; onDelete: (article: Article) => void }) {
  const [previewExpanded, setPreviewExpanded] = useState(false);
  const [imageModalSrc, setImageModalSrc] = useState<string | null>(null);
  const [textContent, setTextContent] = useState<string | null>(null);
  const [textLoading, setTextLoading] = useState(false);
  const [numPages, setNumPages] = useState(0);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const zoomRef = useRef(1);
  const panRef = useRef({ x: 0, y: 0 });
  const dragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const openImageModal = useCallback((src: string) => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    zoomRef.current = 1;
    panRef.current = { x: 0, y: 0 };
    setImageModalSrc(src);
  }, []);

  const closeImageModal = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    zoomRef.current = 1;
    panRef.current = { x: 0, y: 0 };
    setImageModalSrc(null);
  }, []);

  const applyTransform = useCallback(() => {
    const el = document.getElementById('img-modal-preview');
    if (el) {
      el.style.transform = `translate(${panRef.current.x}px, ${panRef.current.y}px) scale(${zoomRef.current})`;
    }
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.15 : 0.15;
    const next = Math.min(Math.max(0.3, zoomRef.current + delta), 5);
    zoomRef.current = next;
    setZoom(next);
    applyTransform();
  }, [applyTransform]);

  // Native pointer events for reliable drag — bypasses React synthetic events entirely
  useEffect(() => {
    if (!imageModalSrc) return;
    const el = document.getElementById('img-modal-preview');
    const container = containerRef.current;
    if (!el || !container) return;

    const onPointerDown = (e: PointerEvent) => {
      e.preventDefault();
      el.setPointerCapture(e.pointerId);
      dragging.current = true;
      lastPos.current = { x: e.clientX, y: e.clientY };
      el.style.cursor = 'grabbing';
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!dragging.current) return;
      const dx = e.clientX - lastPos.current.x;
      const dy = e.clientY - lastPos.current.y;
      panRef.current = {
        x: panRef.current.x + dx,
        y: panRef.current.y + dy,
      };
      lastPos.current = { x: e.clientX, y: e.clientY };
      el.style.transform = `translate(${panRef.current.x}px, ${panRef.current.y}px) scale(${zoomRef.current})`;
    };

    const onPointerUp = () => {
      if (!dragging.current) return;
      dragging.current = false;
      el.style.cursor = 'grab';
      setPan({ ...panRef.current });
    };

    const onDragStart = (e: DragEvent) => e.preventDefault();

    el.addEventListener('pointerdown', onPointerDown);
    el.addEventListener('pointermove', onPointerMove);
    el.addEventListener('pointerup', onPointerUp);
    el.addEventListener('pointercancel', onPointerUp);
    el.addEventListener('dragstart', onDragStart);
    return () => {
      el.removeEventListener('pointerdown', onPointerDown);
      el.removeEventListener('pointermove', onPointerMove);
      el.removeEventListener('pointerup', onPointerUp);
      el.removeEventListener('pointercancel', onPointerUp);
      el.removeEventListener('dragstart', onDragStart);
    };
  }, [imageModalSrc, applyTransform]);

  const zoomIn = useCallback(() => {
    setZoom((prev) => {
      const next = Math.min(prev + 0.25, 5);
      zoomRef.current = next;
      return next;
    });
  }, []);

  const zoomOut = useCallback(() => {
    setZoom((prev) => {
      const next = Math.max(prev - 0.25, 0.3);
      zoomRef.current = next;
      return next;
    });
  }, []);

  useEffect(() => {
    if (imageModalSrc) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [imageModalSrc]);

  if (loading) {
    return (
      <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex min-h-[520px] items-center justify-center border border-natural-border bg-[#fffefa]">
        <div className="flex items-center gap-3 text-sm text-natural-muted">
          <Loader2 className="h-5 w-5 animate-spin" /> 正在打开文章详情
        </div>
      </motion.section>
    );
  }

  if (!article) {
    return (
      <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <StateCard icon={<FileText className="h-5 w-5" />} title="未选择文章" description="返回列表后选择一篇文章阅读。" />
        <button onClick={onBack} className="mt-6 inline-flex items-center gap-2 text-xs uppercase tracking-widest text-natural-muted hover:text-natural-accent">
          <ArrowLeft className="h-4 w-4" /> 返回列表
        </button>
      </motion.section>
    );
  }

  const displayDate = formatDate(article.updatetime) || formatDate(article.createtime);
  const fileExt = article.sourceFilePath?.split('?')[0].split('.').pop()?.toLowerCase();
  const canInlinePreview = Boolean(article.sourceFilePath) && PREVIEW_EXTENSIONS.includes(fileExt ?? '');
  const isImage = IMAGE_EXTENSIONS.includes(fileExt ?? '');
  const isPdf = fileExt === 'pdf';
  const isHtml = fileExt === 'html' || fileExt === 'htm';
  const isText = TEXT_EXTENSIONS.includes(fileExt ?? '');

  useEffect(() => {
    if (!isText || !article.sourceFilePath) return;
    let cancelled = false;
    setTextLoading(true);
    setTextContent(null);
    fetch(article.sourceFilePath)
      .then((res) => (res.ok ? res.text() : Promise.reject(res.statusText)))
      .then((text) => { if (!cancelled) setTextContent(text); })
      .catch(() => { if (!cancelled) setTextContent(null); })
      .finally(() => { if (!cancelled) setTextLoading(false); });
    return () => { cancelled = true; };
  }, [article.sourceFilePath, isText]);

  return (
    <motion.article initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.28 }} className="mx-auto max-w-3xl">
      {/* Top bar */}
      <div className="mb-8 flex items-center justify-between">
        <button onClick={onBack} className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-natural-muted transition hover:text-natural-accent">
          <ArrowLeft className="h-4 w-4" /> 返回列表
        </button>
        {isAdmin && (
          <div className="flex gap-3">
            <button onClick={() => onEdit(article)} className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-natural-light transition hover:text-natural-accent">
              <PencilLine className="h-3 w-3" /> 编辑
            </button>
            <button onClick={() => onDelete(article)} className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-natural-light transition hover:text-red-600">
              <Trash2 className="h-3 w-3" /> 删除
            </button>
          </div>
        )}
      </div>

      {/* Header */}
      <header className="mb-10">
        {displayDate && (
          <span className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-natural-light">
            <Calendar className="h-3 w-3" /> {displayDate}
          </span>
        )}
        <h1 className="mt-4 font-serif text-3xl leading-snug text-natural-text md:text-4xl">{article.title}</h1>
      </header>

      {/* File preview */}
      {article.sourceFilePath && canInlinePreview && (
        <section className={`mb-10 overflow-hidden border border-natural-border bg-white transition-all duration-300 ${previewExpanded ? 'h-[70vh]' : 'h-64'}`}>
          <div className="flex items-center justify-between border-b border-natural-border px-4 py-2.5 text-[10px] uppercase tracking-[0.2em] text-natural-light">
            <span>附件预览</span>
            <button onClick={() => setPreviewExpanded((v) => !v)} className="inline-flex items-center gap-1.5 text-natural-muted transition hover:text-natural-accent">
              {previewExpanded ? <Minus className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
              {previewExpanded ? '收起' : '展开'}
            </button>
          </div>

          {isImage ? (
            <button onClick={() => openImageModal(article.sourceFilePath!)} className="flex h-[calc(100%-37px)] w-full items-center justify-center bg-[#faf8f4]">
              <img src={article.sourceFilePath} alt={article.title} className="max-h-full max-w-full object-contain" />
            </button>
          ) : isPdf ? (
            <div className="h-[calc(100%-37px)] overflow-auto bg-[#faf8f4] flex flex-col items-center">
              <Document
                file={article.sourceFilePath}
                onLoadSuccess={({ numPages: n }) => { setNumPages(n); setPdfLoading(false); }}
                onLoadError={() => setPdfLoading(false)}
                loading={
                  <div className="flex items-center justify-center py-20 text-sm text-natural-muted">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 加载 PDF...
                  </div>
                }
                error={
                  <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <span className="text-sm text-red-500">PDF 加载失败，请确认文件可访问</span>
                    <a href={article.sourceFilePath} target="_blank" rel="noreferrer" className="text-xs text-natural-accent underline">在新窗口打开</a>
                  </div>
                }
              >
                {Array.from({ length: numPages }, (_, i) => (
                  <Page
                    key={`page_${i + 1}`}
                    pageNumber={i + 1}
                    renderTextLayer={true}
                    renderAnnotationLayer={true}
                    className="shadow-sm mb-4"
                  />
                ))}
              </Document>
            </div>
          ) : isHtml ? (
            <iframe src={article.sourceFilePath} title="article-preview" className="h-[calc(100%-37px)] w-full border-0 bg-white" />
          ) : isText ? (
            <div className="h-[calc(100%-37px)] overflow-auto">
              {textLoading ? (
                <div className="flex h-full items-center justify-center text-sm text-natural-muted">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 加载文件内容...
                </div>
              ) : textContent !== null ? (
                <div className="markdown-body p-5 text-sm" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(marked(textContent)) }} />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-natural-light">无法加载文件内容，请确认文件可访问</div>
              )}
            </div>
          ) : (
            <div className="flex h-[calc(100%-37px)] items-center justify-center text-sm text-natural-light">
              暂不支持此文件类型的预览
            </div>
          )}
        </section>
      )}

      {/* Body — single column reading flow */}
      <div className="space-y-10">
        <section>
          <h2 className="mb-5 text-[10px] uppercase tracking-[0.24em] text-natural-light">问题描述</h2>
          <p className="whitespace-pre-wrap text-base leading-8 text-natural-muted">{article.description || '暂无问题描述。'}</p>
        </section>

        <section className="border-l-2 border-natural-accent bg-[#f8f4ed] px-6 py-6">
          <h2 className="mb-4 text-[10px] uppercase tracking-[0.24em] text-natural-light">学习精华</h2>
          <p className="whitespace-pre-wrap text-base leading-8 text-natural-text">{article.experience || '暂无学习精华。'}</p>
        </section>
      </div>

      {/* Image modal with zoom */}
      <AnimatePresence>
        {imageModalSrc && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/85 p-4" onClick={closeImageModal}>
            {/* Toolbar */}
            <div className="absolute left-1/2 top-4 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black/60 px-4 py-2 backdrop-blur" onClick={(e) => e.stopPropagation()}>
              <button onClick={zoomOut} className="rounded-full p-1.5 text-white/80 transition hover:bg-white/20 hover:text-white" title="缩小">
                <Minus className="h-4 w-4" />
              </button>
              <span className="min-w-[3.5rem] text-center text-xs text-white/80 tabular-nums">{Math.round(zoom * 100)}%</span>
              <button onClick={zoomIn} className="rounded-full p-1.5 text-white/80 transition hover:bg-white/20 hover:text-white" title="放大">
                <Plus className="h-4 w-4" />
              </button>
              <span className="mx-1 h-5 w-px bg-white/30" />
              <button onClick={closeImageModal} className="rounded-full p-1.5 text-white/80 transition hover:bg-white/20 hover:text-white" title="关闭">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Image container */}
            <motion.div
              ref={containerRef}
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              className="flex max-h-[88vh] max-w-[94vw] items-center justify-center overflow-hidden rounded-md"
              onClick={(e) => e.stopPropagation()}
              onWheel={handleWheel}
              style={{ cursor: 'grab' }}
            >
              <img
                id="img-modal-preview"
                src={imageModalSrc}
                alt="preview"
                className="block select-none touch-none"
                style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}
                draggable={false}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}

function ArticleEditor({ form, editorMode, uploading, submitting, aiLoading, hasSourceFile, onCancelEdit, onUpload, onAIComplete, onSubmit, onChange }: { form: CreateArticlePayload; editorMode: EditorMode; uploading: boolean; submitting: boolean; aiLoading: boolean; hasSourceFile: boolean; onCancelEdit: () => void; onUpload: (file?: File) => Promise<void>; onAIComplete: () => void; onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>; onChange: (value: CreateArticlePayload) => void }) {
  return (
    <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
      <section className="border border-natural-border bg-[#fffefa] p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-[0.2em] text-natural-light">{editorMode === 'edit' ? 'Edit Entry' : 'New Entry'}</span>
            <h3 className="mt-2 font-serif text-2xl text-natural-text">{editorMode === 'edit' ? '编辑文章' : '发布文章'}</h3>
          </div>
          {editorMode === 'edit' ? (
            <button onClick={onCancelEdit} className="text-natural-light transition hover:text-natural-accent">
              <X className="h-4 w-4" />
            </button>
          ) : (
            <Plus className="h-5 w-5 text-natural-light" />
          )}
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          <Field label="标题" value={form.title} maxLength={100} onChange={(value) => onChange({ ...form, title: value })} />
          <TextArea label="问题描述" value={form.description} maxLength={1000} rows={4} onChange={(value) => onChange({ ...form, description: value })} />
          <TextArea label="学习精华" value={form.experience} maxLength={1000} rows={5} onChange={(value) => onChange({ ...form, experience: value })} />

          <label className="block border border-dashed border-natural-border p-4 text-center transition hover:border-natural-accent">
            <UploadCloud className="mx-auto mb-2 h-5 w-5 text-natural-light" />
            <span className="block text-[10px] uppercase tracking-widest text-natural-muted">{uploading ? '上传中...' : '上传源文件'}</span>
            <input type="file" className="hidden" disabled={uploading} onChange={(event) => void onUpload(event.target.files?.[0])} />
          </label>

          {form.sourceFilePath && (
            <a href={form.sourceFilePath} target="_blank" rel="noreferrer" className="flex items-center gap-2 break-all text-xs text-natural-muted hover:text-natural-accent">
              <ExternalLink className="h-3 w-3 shrink-0" />
              {form.sourceFilePath}
            </a>
          )}

          {hasSourceFile && (
            <button type="button" onClick={onAIComplete} disabled={aiLoading} className="flex w-full items-center justify-center gap-2 border border-natural-accent px-5 py-3 text-[10px] uppercase tracking-widest text-natural-accent transition hover:bg-natural-accent hover:text-white disabled:cursor-not-allowed disabled:opacity-60">
              {aiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {aiLoading ? 'AI 正在分析文件...' : 'AI 智能补全'}
            </button>
          )}

          <button type="submit" disabled={submitting || uploading} className="flex w-full items-center justify-center gap-2 bg-natural-accent px-5 py-3 text-[10px] uppercase tracking-widest text-white transition hover:bg-natural-accent-hover disabled:cursor-not-allowed disabled:opacity-60">
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {editorMode === 'edit' ? '保存修改' : '发布入库'}
          </button>
        </form>
      </section>
    </aside>
  );
}

function Field({ label, value, maxLength, onChange }: { label: string; value: string; maxLength: number; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-natural-light">
        <span>{label}</span>
        <span className={`tabular-nums ${value.length > maxLength * 0.9 ? 'text-red-500' : value.length > 0 ? 'text-natural-muted' : ''}`}>{value.length}/{maxLength}</span>
      </span>
      <input value={value} maxLength={maxLength} onChange={(event) => onChange(event.target.value)} className="w-full border-b border-natural-border bg-transparent px-1 py-2 font-serif text-lg outline-none transition focus:border-natural-accent" />
    </label>
  );
}

function TextArea({ label, value, maxLength, rows, onChange }: { label: string; value: string; maxLength: number; rows: number; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-natural-light">
        <span>{label}</span>
        <span className={`tabular-nums ${value.length > maxLength * 0.9 ? 'text-red-500' : value.length > 0 ? 'text-natural-muted' : ''}`}>{value.length}/{maxLength}</span>
      </span>
      <textarea value={value} maxLength={maxLength} rows={rows} onChange={(event) => onChange(event.target.value)} className="w-full resize-none border border-natural-border bg-transparent p-3 text-sm leading-relaxed outline-none transition focus:border-natural-accent" />
    </label>
  );
}

function StateCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex items-center gap-4 border border-natural-border bg-[#fffefa] p-8 text-natural-muted">
      <div className="text-natural-light">{icon}</div>
      <div>
        <h3 className="font-serif text-xl text-natural-text">{title}</h3>
        <p className="mt-1 text-sm">{description}</p>
      </div>
    </div>
  );
}
