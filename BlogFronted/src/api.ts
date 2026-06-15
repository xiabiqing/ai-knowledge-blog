import type { AICompleteArticle, Article, ArticlePage, BackendResponse, CreateArticlePayload, EmpiricalKnowledge, KnowledgePage, UpdateArticlePayload } from './types';
import { mockArticles, mockKnowledge } from './mockData';

// ===== Mock 模式开关：改为 true 即可使用本地假数据（无需后端） =====
const USE_MOCK = false;
// ================================================================

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';

// ---- mock helpers ----
function delay<T>(value: T, ms = 180): Promise<T> {
  return new Promise((r) => setTimeout(() => r(value), ms));
}

function paginate<T>(list: T[], current: number, size: number): { records: T[]; total: number; size: number; current: number; pages: number } {
  const total = list.length;
  const pages = Math.max(1, Math.ceil(total / size));
  const start = (current - 1) * size;
  const records = list.slice(start, start + size);
  return { records, total, size, current, pages };
}

async function parseResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type') ?? '';
  const payload = contentType.includes('application/json')
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message = typeof payload === 'object' && payload !== null
      ? String((payload as Record<string, unknown>).msg || (payload as Record<string, unknown>).message || `请求失败：${response.status}`)
      : `请求失败：${response.status}`;
    throw new Error(message);
  }

  const body = payload as BackendResponse<T>;
  if (typeof body === 'object' && body !== null && 'code' in body && body.code !== 0 && body.code !== 200) {
    throw new Error(body.msg || body.message || '接口返回异常');
  }

  return body.data;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      ...(init?.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...init?.headers,
    },
  });

  return parseResponse<T>(response);
}

// ==================== Articles ====================

export function listArticles(current = 1, size = 10) {
  if (USE_MOCK) return delay(paginate(mockArticles, current, size));
  const params = new URLSearchParams({ current: String(current), size: String(size) });
  return request<ArticlePage>(`/article/list?${params.toString()}`);
}

export function getArticle(articleId: number) {
  if (USE_MOCK) {
    const article = mockArticles.find((a) => a.id === articleId);
    return delay(article ?? null).then((a) => {
      if (!a) throw new Error('文章不存在');
      return a;
    });
  }
  const params = new URLSearchParams({ articleId: String(articleId) });
  return request<Article>(`/article/get?${params.toString()}`);
}

export function createArticle(payload: CreateArticlePayload) {
  if (USE_MOCK) {
    const newArticle: Article = {
      id: Math.max(0, ...mockArticles.map((a) => a.id)) + 1,
      ...payload,
      createtime: new Date().toISOString(),
      updatetime: new Date().toISOString(),
    };
    mockArticles.unshift(newArticle);
    return delay(true);
  }
  return request<boolean>('/article/add', {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: getAuthHeaders(),
  });
}

export function updateArticle(payload: UpdateArticlePayload) {
  if (USE_MOCK) {
    const idx = mockArticles.findIndex((a) => a.id === payload.id);
    if (idx !== -1) {
      mockArticles[idx] = { ...mockArticles[idx], ...payload, updatetime: new Date().toISOString() };
    }
    return delay(true);
  }
  return request<boolean>('/article/update', {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: getAuthHeaders(),
  });
}

export function deleteArticle(articleId: number) {
  if (USE_MOCK) {
    const idx = mockArticles.findIndex((a) => a.id === articleId);
    if (idx !== -1) mockArticles.splice(idx, 1);
    return delay(true);
  }
  const params = new URLSearchParams({ articleId: String(articleId) });
  return request<boolean>(`/article/delete?${params.toString()}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
}

export async function uploadArticleFile(file: File) {
  if (USE_MOCK) return delay(`/uploads/mock/${file.name}`);
  const formData = new FormData();
  formData.append('file', file);
  return request<string>('/article/upload/only', {
    method: 'POST',
    body: formData,
    headers: getAuthHeaders(),
  });
}

export function completeArticle(imageURL: string) {
  if (USE_MOCK) {
    return delay<AICompleteArticle>({
      title: 'AI 提取的标题：' + imageURL.slice(-10),
      description: 'AI 根据文件内容自动生成的问题描述，包含问题背景和排查过程。',
      experience: 'AI 提炼的学习精华：核心解决方案加上认知启发，可直接用于知识库沉淀。',
    });
  }
  const params = new URLSearchParams({ imageURL });
  return request<AICompleteArticle>(`/article/AI/complete/article?${params.toString()}`, {
    headers: getAuthHeaders(),
  });
}

// ==================== Knowledge ====================

export function listKnowledge(current = 1, size = 10) {
  if (USE_MOCK) {
    const sorted = [...mockKnowledge].sort((a, b) => new Date(b.updatetime || b.createtime).getTime() - new Date(a.updatetime || a.createtime).getTime());
    return delay(paginate(sorted, current, size));
  }
  const params = new URLSearchParams({ current: String(current), size: String(size) });
  return request<KnowledgePage>(`/empirical-knowledge/listAll?${params.toString()}`);
}

export function searchKnowledge(q: string, current = 1, size = 10) {
  if (USE_MOCK) {
    const lower = q.toLowerCase();
    const filtered = mockKnowledge.filter(
      (k) => k.title.toLowerCase().includes(lower) || k.type.toLowerCase().includes(lower) || (k.content && k.content.includes(q)),
    );
    return delay(paginate(filtered, current, size));
  }
  const params = new URLSearchParams({ query: q, current: String(current), size: String(size) });
  return request<KnowledgePage>(`/empirical-knowledge/search?${params.toString()}`);
}

export function suggestKnowledge(q: string) {
  if (USE_MOCK) {
    const lower = q.toLowerCase();
    const matches = mockKnowledge
      .filter((k) => k.title.toLowerCase().includes(lower) || k.type.toLowerCase().includes(lower))
      .map((k) => k.title)
      .slice(0, 10);
    return delay(matches);
  }
  const params = new URLSearchParams({ prefix: q });
  return request<string[]>(`/empirical-knowledge/suggest?${params.toString()}`);
}

export function getKnowledgeDetail(id: number) {
  if (USE_MOCK) {
    const item = mockKnowledge.find((k) => k.id === id);
    return delay(item?.content ?? null).then((c) => {
      if (!c) throw new Error('学习精华不存在');
      return c;
    });
  }
  const params = new URLSearchParams({ id: String(id) });
  return request<string>(`/empirical-knowledge/getEmpiricalKnowledge?${params.toString()}`);
}

export function hitKnowledge(id: number) {
  if (USE_MOCK) {
    const item = mockKnowledge.find((k) => k.id === id);
    if (item) item.frequency += 1;
    return delay(true);
  }
  const params = new URLSearchParams({ id: String(id) });
  return request<boolean>(`/empirical-knowledge/hit?${params.toString()}`, { method: 'POST' });
}

// ==================== Agent ====================

export function agentChat(message: string, conversationId?: string) {
  if (USE_MOCK) {
    const cid = conversationId || crypto.randomUUID();
    const reply = `收到你的消息：「${message.slice(0, 50)}${message.length > 50 ? '...' : ''}」

我已经理解了你的技术问题。在实际项目中，这类问题通常可以从以下几个角度来思考：

1. **问题定位**：首先要明确问题的边界条件，缩小排查范围。
2. **根因分析**：不要只看表象，深入底层原理才能找到真正的根因。
3. **解决方案**：权衡多种方案的利弊，选择适合当前项目阶段的做法。

如果你能补充更多上下文信息（如技术栈、环境配置、错误日志），我可以给出更精准的分析和建议。`;
    return delay(`${cid}|||${reply}`, 500);
  }
  return request<string>('/article/AI/chat/Agent', {
    method: 'POST',
    body: JSON.stringify({ message, id: conversationId ?? '' }),
    headers: getAuthHeaders(),
  });
}

export function searchAgentChat(message: string, conversationId?: string) {
  if (USE_MOCK) {
    const cid = conversationId || crypto.randomUUID();
    const reply = `🔍 根据你的问题，我在知识库中搜索了相关经验…

如果站内暂时没有匹配的内容，你也可以换个关键词试试。或者把你的问题详细描述出来，我可以帮你整理发布。`;
    return delay(`${cid}|||${reply}`, 400);
  }
  return request<string>('/empirical-knowledge/AI/chat/Agent', {
    method: 'POST',
    body: JSON.stringify({ message, id: conversationId ?? '' }),
  });
}

// ==================== Admin Auth ====================

function getAdminToken(): string {
  try {
    const raw = localStorage.getItem('blog_admin_auth');
    if (!raw) return '';
    const parsed = JSON.parse(raw);
    return parsed.token ?? '';
  } catch {
    return '';
  }
}

async function adminRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getAdminToken();
  return request<T>(path, {
    ...init,
    headers: {
      ...(init?.headers as Record<string, string>),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}

export function adminLogin(username: string, password: string) {
  const params = new URLSearchParams({ username, password });
  return request<string>(`/admin/login?${params.toString()}`, { method: 'POST' });
}

export function checkAuth() {
  const token = getAdminToken();
  if (!token) return Promise.resolve(false);
  // 客户端解码 JWT 检查过期，无需后端接口
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return Promise.resolve(Date.now() < payload.exp * 1000);
  } catch {
    return Promise.resolve(false);
  }
}

export function getAuthHeaders(): Record<string, string> {
  const token = getAdminToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}
