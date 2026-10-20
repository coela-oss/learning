import type { Domain, Language } from './types.ts'
export interface DomainInfo { id: Domain; title: Record<Language, string>; scope: Record<Language, string> }
export const domains: DomainInfo[] = [
  { id: 'foundations', title: { en: 'Foundations', ja: '基礎' }, scope: { en: 'Logic, algorithms, operating systems and information. Start with basic computer literacy.', ja: '論理・アルゴリズム・OS・情報の基礎。コンピューターの基本操作から。' } },
  { id: 'software', title: { en: 'Software', ja: 'ソフトウェア' }, scope: { en: 'Types, APIs, architecture and state. Prerequisite: basic programming.', ja: '型・API・設計・状態。前提はプログラミングの基礎。' } },
  { id: 'ui', title: { en: 'User interfaces', ja: 'UI' }, scope: { en: 'Accessible interaction, rendering and graph presentation. Prerequisite: HTML and component state.', ja: 'アクセシビリティ・描画・グラフ表現。前提はHTMLとコンポーネントの状態。' } },
  { id: 'data', title: { en: 'Data', ja: 'データ' }, scope: { en: 'Models, transactions, migration and recovery. Prerequisite: records and identifiers.', ja: 'モデル・トランザクション・移行・復元。前提はレコードと識別子。' } },
  { id: 'network', title: { en: 'Networks', ja: 'ネットワーク' }, scope: { en: 'Protocols, messages and integration. Prerequisite: requests and responses.', ja: 'プロトコル・メッセージ・連携。前提は要求と応答。' } },
  { id: 'security', title: { en: 'Security', ja: 'セキュリティ' }, scope: { en: 'Threats, identity, authority and privacy. Prerequisite: trust boundaries.', ja: '脅威・認証・認可・プライバシー。前提は信頼境界。' } },
  { id: 'cloud', title: { en: 'Cloud', ja: 'クラウド' }, scope: { en: 'Infrastructure, containers, reliability and cost. Prerequisite: operating systems and networks.', ja: 'インフラ・コンテナ・信頼性・費用。前提はOSとネットワーク。' } },
  { id: 'ai', title: { en: 'AI', ja: 'AI' }, scope: { en: 'Model use, evaluation, uncertainty and human decisions. Prerequisite: evidence and inference.', ja: 'モデル活用・評価・不確実性・人の判断。前提は根拠と推論。' } },
  { id: 'engineering', title: { en: 'Engineering practice', ja: '開発実務' }, scope: { en: 'Testing, review, documentation and decisions. Prerequisite: a small software project.', ja: 'テスト・レビュー・文書・技術判断。前提は小さな開発経験。' } }
]
