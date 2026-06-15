export interface Article {
  id: number;
  title: string;
  sourceFilePath?: string;
  description?: string;
  experience?: string;
  createtime?: string;
  updatetime?: string;
}

export interface BackendResponse<T> {
  code: number;
  data: T;
  msg?: string;
  message?: string;
  description?: string;
}

export interface ArticlePage {
  records: Article[];
  total: number;
  size: number;
  current: number;
  pages: number;
}

export interface CreateArticlePayload {
  title: string;
  sourceFilePath?: string;
  description: string;
  experience: string;
}

export interface UpdateArticlePayload extends CreateArticlePayload {
  id: number;
}

export interface EmpiricalKnowledge {
  id: number;
  articleIdEmp?: number;
  type: string;
  title: string;
  content?: string;
  frequency: number;
  score: number;
  createtime: string;
  updatetime?: string;
}

export interface KnowledgePage {
  records: EmpiricalKnowledge[];
  total: number;
  size: number;
  current: number;
  pages: number;
}

export interface AICompleteArticle {
  title: string;
  description: string;
  experience: string;
}

export type ViewState = 'articles' | 'knowledge' | 'agent';
