/**
 * Articles / Writing Content
 *
 * The seven canonical writing topics for the portfolio — all authored and
 * published. Each article is grounded in real production work (BVISIONR's
 * queue-based WhatsApp platform, StopSearch's matchmaking platform, Radique's
 * radiology workflow, and the Aura commerce platform) rather than generic
 * filler.
 *
 * @module content/articles
 */

import type { Article, RichText, RichTextNode } from '../types/content';
import type { Placeholder } from '../utils/placeholder';

/**
 * Article entry with placeholder support for unset body content.
 * (All entries are authored; the Placeholder union is retained so future
 * draft articles can be added without a type change.)
 */
export type ArticleEntry = Omit<Article, 'summary' | 'body'> & {
  summary: string | Placeholder<string>;
  body?: RichText | Placeholder<RichText>;
};

// ── Rich-text authoring helpers ──────────────────────────────────────────────

const p = (content: string): RichTextNode => ({ type: 'paragraph', content });
const h2 = (content: string, id: string): RichTextNode => ({
  type: 'heading',
  content,
  attrs: { level: 2, id },
});
const ul = (...items: string[]): RichTextNode => ({
  type: 'list',
  children: items.map((content) => ({ type: 'paragraph', content })),
});
const code = (content: string): RichTextNode => ({ type: 'code', content });
const quote = (content: string): RichTextNode => ({ type: 'blockquote', content });

/**
 * The seven Writing Topics — authored and published.
 */
export const articles: ArticleEntry[] = [
  {
    slug: 'multi-tenant-saas',
    title: 'Multi-Tenant SaaS',
    summary:
      'How to isolate tenants without drowning in complexity — schema strategies, access control, noisy-neighbour control, and the tradeoffs between shared and dedicated infrastructure.',
    readingTimeMinutes: 9,
    status: 'published',
    publishedAt: '2025-02-18',
    tags: ['saas', 'multi-tenant', 'architecture'],
    toc: [
      { id: 'a-data-problem', label: 'Multi-tenancy is a data problem', level: 2 },
      { id: 'isolation-at-the-data-layer', label: 'Isolation at the data layer', level: 2 },
      { id: 'rbac-as-structure', label: 'RBAC as a structural property', level: 2 },
      { id: 'noisy-neighbour', label: 'The noisy-neighbour problem', level: 2 },
      { id: 'onboarding-without-code', label: 'Onboarding without code', level: 2 },
      { id: 'takeaways', label: 'Takeaways', level: 2 },
    ],
    body: [
      p('When I built BVISIONR — a WhatsApp automation platform that serves many businesses from one backend — the hardest part was never a feature. It was making sure that one tenant could never see, touch, or slow down another. Multi-tenancy looks like a product decision, but it is really a data-architecture decision that you make once and live with forever.'),
      h2('Multi-tenancy is a data problem', 'a-data-problem'),
      p('A tenant is a boundary. Every row of data, every job in a queue, every websocket message belongs to exactly one tenant, and the system has to enforce that boundary on every single access. The failure mode is not subtle: a missing filter in one query leaks another company\u2019s conversations. That is the kind of bug that ends a product, so it cannot depend on a developer remembering to add a where-clause.'),
      h2('Isolation at the data layer', 'isolation-at-the-data-layer'),
      p('The approach that held up was to make tenant scoping a property of the data-access layer rather than a convention in controllers. Instead of filtering by tenant in each handler, the tenant context is threaded through a single access path, and queries without it simply cannot be built. There are three broad strategies, in increasing isolation and cost:'),
      ul(
        'Shared schema, tenant column — one dataset, a tenant id on every row. Cheapest to run, but isolation lives entirely in your query layer, so centralise it.',
        'Schema or database per tenant — stronger isolation and easy per-tenant backup, at the cost of migrations and connection management multiplying.',
        'Dedicated infrastructure per tenant — reserved for the rare enterprise customer who pays for it; do not default here.',
      ),
      p('For most SaaS the shared-schema model with rigorously centralised scoping is the right first choice — it is the one that lets a small team move fast without betting the company on a forgotten filter.'),
      h2('RBAC as a structural property', 'rbac-as-structure'),
      p('Tenancy answers "whose data is this?"; role-based access control answers "what may this user do with it?". The two are separate boundaries and both should be checked on every request. On BVISIONR the event-driven RBAC model gates the shared team inbox so a tenant\u2019s roles and permissions travel with the request, not with the UI. When authorization is enforced at one boundary rather than sprinkled across the codebase, you can actually reason about it.'),
      h2('The noisy-neighbour problem', 'noisy-neighbour'),
      p('Isolation is not only about data — it is about resources. One tenant firing a huge campaign should not starve everyone else. This is where a queue earns its place: work is enqueued per tenant and drained by rate-aware workers, so scheduling stays fair and a burst is absorbed instead of cascading. Without that boundary, throughput becomes first-come-first-served, and your quietest customers feel the loudest one.'),
      h2('Onboarding without code', 'onboarding-without-code'),
      p('The test of a real multi-tenant system is whether a new tenant can be added through configuration rather than a deployment. If onboarding needs a code change, tenancy is not finished. Getting there means every tenant-specific value — templates, automations, roles, limits — lives in data, not in branches.'),
      h2('Takeaways', 'takeaways'),
      ul(
        'Make tenant scoping a property of the data layer, never a per-query habit.',
        'Treat tenancy and RBAC as two separate boundaries, both enforced every request.',
        'Use a queue to keep resource usage fair between tenants.',
        'If onboarding a tenant needs a deploy, the design is not done.',
      ),
    ],
  },
  {
    slug: 'distributed-messaging-pipelines',
    title: 'Distributed Messaging Pipelines',
    summary:
      'Designing high-throughput messaging pipelines that stay correct under load: queues, backpressure, idempotent consumers, and delivery guarantees that survive partial failure.',
    readingTimeMinutes: 11,
    status: 'published',
    publishedAt: '2025-03-05',
    tags: ['messaging', 'distributed-systems', 'pipelines'],
    toc: [
      { id: 'synchronous-trap', label: 'The synchronous trap', level: 2 },
      { id: 'decouple-with-a-queue', label: 'Decouple with a queue', level: 2 },
      { id: 'idempotency-and-retries', label: 'Idempotency and retries', level: 2 },
      { id: 'backpressure', label: 'Backpressure and fairness', level: 2 },
      { id: 'dead-letters', label: 'Dead letters and poison jobs', level: 2 },
      { id: 'observability', label: 'Observability', level: 2 },
    ],
    body: [
      p('BVISIONR sends messages through the WhatsApp Cloud API at campaign scale. The first version anyone reaches for — call the API once per recipient inside the request handler — falls over almost immediately. Building a pipeline that processes 1,000+ messages per campaign with zero message loss meant unlearning the synchronous instinct.'),
      h2('The synchronous trap', 'synchronous-trap'),
      p('Sending inline couples three unrelated things: the user\u2019s request, a third-party API\u2019s availability, and your throughput. Rate limits trip, requests time out, and a naive retry sends the same message twice. The request that should take milliseconds now waits on a network call you do not control, and one slow dependency stalls the whole handler.'),
      h2('Decouple with a queue', 'decouple-with-a-queue'),
      p('The fix is to make delivery asynchronous. API requests enqueue a job and return as soon as it is accepted; dedicated workers drain the queue and talk to the Cloud API at a controlled rate. On BVISIONR that queue is BullMQ backed by Redis. The request path stays fast, and the delivery path can be tuned, paused, and scaled independently.'),
      code('// Producer: accept fast, never call the vendor inline\nawait messageQueue.add(\'send\', {\n  tenantId, to, templateId, payload,\n}, {\n  attempts: 5,\n  backoff: { type: \'exponential\', delay: 2000 },\n  removeOnComplete: 1000,\n});\n// Handler returns 202 here \u2014 delivery happens in a worker.'),
      h2('Idempotency and retries', 'idempotency-and-retries'),
      p('Once you retry, you must guarantee that retrying is safe. Every job carries a stable key, and the worker checks whether that unit of work already completed before doing it again. Retries use exponential backoff so a struggling dependency is given room rather than hammered. The rule is simple: at-least-once delivery plus idempotent consumers equals effectively-once behaviour, which is what users actually expect.'),
      h2('Backpressure and fairness', 'backpressure'),
      p('A queue is also a shock absorber. When a burst arrives, it grows instead of overwhelming the API, and workers pull at a rate the vendor can accept. In a multi-tenant system this is where fairness lives — scheduling across tenant queues keeps one large campaign from starving everyone else. Backpressure is not a failure mode; it is the system doing its job.'),
      h2('Dead letters and poison jobs', 'dead-letters'),
      p('Some jobs will never succeed — a bad number, a rejected template. Without a plan they retry forever and clog the pipeline. A dead-letter queue captures these poison jobs after their attempts are exhausted, so they can be inspected and replayed without blocking healthy traffic. Containing failure is what keeps a single bad job from becoming an incident.'),
      h2('Observability', 'observability'),
      p('The thing that made this operable for a small team was being able to trace one message across every state — queued, sent, delivered, read, failed. If you cannot follow a single unit of work through the pipeline, you cannot debug it in production. Model that state machine early; almost every question you get later traces back to it.'),
      quote('A queue does not make a system reliable by itself. It gives you a boundary where you can put reliability \u2014 retries, backpressure, fairness, and tracing \u2014 in one place instead of scattering it across handlers.'),
    ],
  },
  {
    slug: 'whatsapp-infrastructure-at-scale',
    title: 'WhatsApp Infrastructure at Scale',
    summary:
      'Lessons from running the WhatsApp Cloud API in production — rate limits, template approvals, webhook reliability, and keeping delivery fast across thousands of conversations.',
    readingTimeMinutes: 10,
    status: 'published',
    publishedAt: '2025-03-22',
    tags: ['whatsapp', 'infrastructure', 'scale'],
    toc: [
      { id: 'low-level-api', label: 'The Cloud API is low-level', level: 2 },
      { id: 'rate-limits-templates', label: 'Rate limits and templates', level: 2 },
      { id: 'webhooks-as-a-source', label: 'Webhooks as a queue source', level: 2 },
      { id: 'delivery-state', label: 'Modelling delivery state', level: 2 },
      { id: 'past-self', label: 'What I\u2019d tell my past self', level: 2 },
    ],
    body: [
      p('Businesses want to run sales and support on WhatsApp. What they actually get from Meta is the WhatsApp Cloud API — a low-level surface of webhooks, template approvals, rate limits, and per-message delivery callbacks. BVISIONR exists to turn that raw channel into a managed product, and most of the engineering is in the gap between "the API works" and "the API is dependable".'),
      h2('The Cloud API is low-level', 'low-level-api'),
      p('The Cloud API does not think in campaigns or conversations. It thinks in individual message sends and asynchronous status callbacks that arrive out of order. Anything higher-level — a campaign, an automation, a shared inbox — is something you build on top. Accepting that early stops you from fighting the API and starts you designing around it.'),
      h2('Rate limits and templates', 'rate-limits-templates'),
      p('Two rules shape everything. First, there are rate limits, so outbound sends must flow through a rate-aware worker pool rather than a loop; the queue is what keeps you from tripping limits during a burst. Second, business-initiated messages must use pre-approved templates, so template state — approved, pending, rejected — has to be modelled explicitly. Tenants can only send what WhatsApp will actually accept, and the system should enforce that before a send, not after a rejection.'),
      h2('Webhooks as a queue source', 'webhooks-as-a-source'),
      p('Inbound messages and delivery receipts arrive as webhooks. The reliable pattern is to verify the signature, normalise the payload into an internal event, and feed it into the same queue system that handles outbound work. Treating webhooks as just another queue source means inbound and outbound share one observable pipeline with the same retry and backpressure guarantees — instead of two half-reliable code paths.'),
      h2('Modelling delivery state', 'delivery-state'),
      p('A message is not a boolean. It moves through queued, sent, delivered, read, and failed, and those transitions come from webhooks that can arrive late or out of order. Reconciling them against an explicit state machine is what lets the UI and analytics show the truth rather than an optimistic guess. Skip this and every "why does it say sent but they got it?" question becomes unanswerable.'),
      h2('What I\u2019d tell my past self', 'past-self'),
      ul(
        'Never call the Cloud API inline; put a rate-aware queue between your request and Meta.',
        'Model template approval state — it is part of your domain, not an afterthought.',
        'Verify and normalise webhooks, then route them through the same pipeline as sends.',
        'Design the message-state machine on day one; everything downstream depends on it.',
      ),
    ],
  },
  {
    slug: 'reliable-ai-automation',
    title: 'Reliable AI Automation',
    summary:
      'Making AI automation trustworthy in production: treating models as a stage not a spine, fallbacks when they fail, audit trails, and keeping the whole pipeline observable and explainable.',
    readingTimeMinutes: 8,
    status: 'published',
    publishedAt: '2025-04-10',
    tags: ['ai', 'automation', 'reliability'],
    toc: [
      { id: 'ai-as-a-stage', label: 'AI as a stage, not the spine', level: 2 },
      { id: 'mode-contracts', label: 'Fallbacks and mode contracts', level: 2 },
      { id: 'observable', label: 'Keeping it observable', level: 2 },
      { id: 'scoped-decisions', label: 'Scoping decisions to context', level: 2 },
      { id: 'closing', label: 'Closing', level: 2 },
    ],
    body: [
      p('Two of my products lean on AI: BVISIONR generates campaigns and drives no-code automations, and StopSearch uses a Gemini-powered layer to rank job matches. In both, the lesson was the same — an AI model is the least reliable component in the system, so the architecture has to treat it that way.'),
      h2('AI as a stage, not the spine', 'ai-as-a-stage'),
      p('The mistake is to put the model on the critical path where nothing works until it responds. Instead, AI runs as a stage in a pipeline that already has retries, backpressure, and observability. On BVISIONR routing and generation happen as queue stages, so a slow or failing model call never blocks delivery and can be retried on its own. The spine of the system is the pipeline; the model is a step within it.'),
      h2('Fallbacks and mode contracts', 'mode-contracts'),
      p('StopSearch taught me to design the feed as a mode contract: the frontend accepts either a ranked payload or a safe fallback shape, chosen by backend conditions. When the ranking branch is unavailable, users still get a coherent feed instead of an error. That single contract turns the AI layer from a single point of failure into an enhancement — the product degrades gracefully rather than breaking.'),
      h2('Keeping it observable', 'observable'),
      p('Trust in an AI system comes from being able to see what it did. Every decision should be traceable: what input it saw, what it produced, and which path it took. Because the automation runs inside a queue-based pipeline, it inherits the same tracing as everything else, and you can answer "why did this happen?" after the fact rather than shrugging at a black box.'),
      h2('Scoping decisions to context', 'scoped-decisions'),
      p('AI decisions are never global. On BVISIONR they are scoped per tenant — honouring that tenant\u2019s automations, templates, and roles — and on StopSearch they are scoped to the role and job context. Scoping is what keeps an automated decision correct for the situation it is actually in, and it is also what keeps a multi-tenant AI feature from leaking one customer\u2019s behaviour into another\u2019s.'),
      h2('Closing', 'closing'),
      p('Reliable AI automation is mostly good distributed-systems engineering with a model plugged into one stage. Make the model optional, make its output traceable, and give the system something sensible to do when the model is not there. Do that and AI becomes a feature you can put in front of real users.'),
    ],
  },
  {
    slug: 'rbac-patterns',
    title: 'RBAC Patterns',
    summary:
      'Practical role-based access control: modelling permissions that scale with the product, avoiding role explosion, enforcing authorization at one boundary, and isolating the admin surface.',
    readingTimeMinutes: 7,
    status: 'published',
    publishedAt: '2025-04-28',
    tags: ['rbac', 'authorization', 'patterns'],
    toc: [
      { id: 'roles-vs-permissions', label: 'Roles vs permissions', level: 2 },
      { id: 'role-explosion', label: 'Avoiding role explosion', level: 2 },
      { id: 'one-boundary', label: 'Enforce at one boundary', level: 2 },
      { id: 'isolate-admin', label: 'Isolate the admin surface', level: 2 },
      { id: 'audit', label: 'Audit everything', level: 2 },
    ],
    body: [
      p('Access control shows up in every product I have built — the BVISIONR team inbox, the Aura commerce dashboards for Admin, Dealer, and Partner roles, and the StopSearch platform with its isolated SuperAdmin console. A few patterns kept RBAC from becoming the messiest part of each system.'),
      h2('Roles vs permissions', 'roles-vs-permissions'),
      p('The core idea that scales is to grant permissions, not roles, in your checks. A role is just a named bundle of permissions. Code should ask "does this actor have permission X?" rather than "is this actor an admin?". When the check is permission-based, adding a new role is a data change, and changing what a role can do never means hunting through conditionals.'),
      h2('Avoiding role explosion', 'role-explosion'),
      p('The failure mode is a new role for every slightly different user, until you have forty roles nobody understands. Keep the role set small and let permissions do the fine-grained work. If two roles differ by one capability, that difference is a permission, not a new role. Scope permissions to resources — this action, on this kind of thing — rather than inventing role variants.'),
      h2('Enforce at one boundary', 'one-boundary'),
      p('Authorization scattered across controllers is authorization you cannot audit. Enforce it at a single boundary — a middleware or an access layer every request passes through — so the answer to "who can reach this?" lives in one place. On StopSearch a requireSuperAdmin middleware guards every admin route, which means there is exactly one door to reason about.'),
      h2('Isolate the admin surface', 'isolate-admin'),
      p('Operator tooling deserves stronger isolation than the app it manages. StopSearch keeps a completely separate Admin model with its own session namespace, so the admin console can never be reached through normal user authentication. An admin is not just a user with a flag; it is a different identity domain, and treating it that way removes a whole class of privilege-escalation risk.'),
      h2('Audit everything', 'audit'),
      p('Authorization decides who may act; auditing records what they did. Every state-changing admin action on StopSearch writes an audit log entry, and destructive operations are soft deletes rather than hard ones, so actions are reversible and reconstructable. In any system that touches money, hiring, or clinical data, that trail is not optional.'),
    ],
  },
  {
    slug: 'queue-based-system-design',
    title: 'Queue-Based System Design',
    summary:
      'Why queues change how you think about systems — decoupling producers from consumers, smoothing spikes, retry semantics, and the failure modes BullMQ taught me to plan for.',
    readingTimeMinutes: 9,
    status: 'published',
    publishedAt: '2025-05-14',
    tags: ['queues', 'system-design', 'bullmq'],
    toc: [
      { id: 'what-a-queue-buys', label: 'What a queue actually buys you', level: 2 },
      { id: 'decoupling', label: 'Producer/consumer decoupling', level: 2 },
      { id: 'retry-semantics', label: 'Retry semantics', level: 2 },
      { id: 'failure-modes', label: 'Failure modes BullMQ taught me', level: 2 },
      { id: 'when-not-to', label: 'When not to use a queue', level: 2 },
    ],
    body: [
      p('A queue is one of the highest-leverage tools in backend engineering, and also one of the easiest to misuse. Running BullMQ on Redis in production for BVISIONR changed how I reason about almost every system with a slow or unreliable step.'),
      h2('What a queue actually buys you', 'what-a-queue-buys'),
      p('A queue is not primarily about speed — it is about control. It gives you a place to absorb spikes, to retry safely, to schedule fairly, and to trace work. Those properties are hard to bolt onto a synchronous request path and almost free once a queue sits between producer and consumer. The value is the boundary, not the buffer.'),
      h2('Producer/consumer decoupling', 'decoupling'),
      p('The moment you enqueue instead of calling directly, the producer stops caring how, when, or how fast the work happens. A request handler can accept work in milliseconds while a worker pool does the heavy lifting at its own pace. Producer and consumer can now be scaled, deployed, paused, and reasoned about independently.'),
      h2('Retry semantics', 'retry-semantics'),
      p('Retries are the reason to use a queue and the reason people get burned by one. Two rules matter: retry with exponential backoff so a struggling dependency gets room, and make consumers idempotent so a retry is always safe. At-least-once delivery is what queues give you; idempotent consumers are how you turn that into the effectively-once behaviour users expect.'),
      h2('Failure modes BullMQ taught me', 'failure-modes'),
      ul(
        'Poison jobs that never succeed will retry forever \u2014 give them a dead-letter queue and stop retrying.',
        'Redis is now a dependency, so plan for persistence and reconnection, not just the happy path.',
        'Unbounded retention fills Redis \u2014 set removeOnComplete and removeOnFail.',
        'A job that mutates external state must be idempotent, or a retry doubles the effect.',
      ),
      h2('When not to use a queue', 'when-not-to'),
      p('Queues add eventual consistency and operational surface. If a caller needs an immediate, synchronous answer, a queue is the wrong tool — you would just be waiting on the job anyway. Reach for a queue when work is slow, spiky, external, or must survive failure. For a fast in-process computation, keep it in the request. The skill is knowing which side of that line you are on.'),
    ],
  },
  {
    slug: 'event-driven-architectures',
    title: 'Event-Driven Architectures',
    summary:
      'Events as the backbone of a system: when to reach for them, how to keep them versioned and ordered, and how to avoid the hidden coupling that makes event systems brittle.',
    readingTimeMinutes: 10,
    status: 'published',
    publishedAt: '2025-05-30',
    tags: ['event-driven', 'architecture', 'patterns'],
    toc: [
      { id: 'events-as-backbone', label: 'Events as the backbone', level: 2 },
      { id: 'versioning-ordering', label: 'Versioning and ordering', level: 2 },
      { id: 'hidden-coupling', label: 'The hidden coupling trap', level: 2 },
      { id: 'choreography-orchestration', label: 'Choreography vs orchestration', level: 2 },
      { id: 'closing', label: 'Closing', level: 2 },
    ],
    body: [
      p('BVISIONR is event-driven at its core — an inbound message, a delivery receipt, a status change all become events that flow through the system. Event-driven design is powerful, but it quietly moves complexity from code you can read into flows you cannot, so it rewards discipline.'),
      h2('Events as the backbone', 'events-as-backbone'),
      p('An event is a fact: something happened. Modelling a system around events — message received, campaign started, report signed off — decouples the thing that happened from everything that reacts to it. New reactions can be added without touching the producer, which is exactly what let BVISIONR grow features around the same message pipeline. The event is the stable contract; the reactions are free to change.'),
      h2('Versioning and ordering', 'versioning-ordering'),
      p('Two problems bite every event system. Events arrive out of order — WhatsApp delivery receipts are a perfect example — so consumers must tolerate reordering and reconcile against a state machine rather than assuming sequence. And event shapes change, so version them from the start; a consumer should ignore fields it does not know and never break because a producer added one. Treat the event schema as an API, because it is one.'),
      h2('The hidden coupling trap', 'hidden-coupling'),
      p('The seductive lie of event systems is that they are fully decoupled. They are not — they are coupled through the events themselves. If a consumer secretly depends on the order two events fire, or on a field only one producer sets, you have coupling that no compiler will catch. The discipline is to keep events self-contained and meaningful on their own, so a consumer never has to reconstruct hidden context.'),
      h2('Choreography vs orchestration', 'choreography-orchestration'),
      p('There are two ways to run a multi-step flow. Choreography lets each service react to events independently — flexible, but the overall flow lives nowhere and is hard to follow. Orchestration puts one coordinator in charge of the sequence — easier to reason about, at the cost of a central point. For simple fan-out, choreography is fine; for a flow with real ordering and failure rules, an orchestrator you can actually read is usually worth it.'),
      h2('Closing', 'closing'),
      p('Events are a superb backbone when you respect what they cost: ordering you must handle, schemas you must version, and coupling you must keep visible. Get those right and you get a system that grows by adding listeners instead of rewriting cores.'),
    ],
  },
];
