# API Conventions and Authorization Matrix

All application RPCs use tRPC under `/api/trpc`. Inputs are Zod-validated and
errors expose the standard tRPC code/status plus `data.requestId` and optional
`data.validation`; clients should branch on the code, not message text.
Mutations that target a missing or inaccessible row return `NOT_FOUND` rather
than a successful no-op.

Growing collections use `{ limit, cursor }`, where the cursor is
`{ createdAt, id }`, and return `{ items, nextCursor }`. Current cursor
procedures are `community.listPostsPage`, `notification.listPage`, and
`task.listPage`, `admin.listUsersPage`, `admin.listQuestionsPage`, and
`community.listReportsPage`. These are the only collection procedures for
those resources; obsolete offset variants were removed after every UI consumer
migrated to cursor pagination.

## Authorization and entitlement matrix

| Access        | Procedures                                                                                                                                                                            |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public        | `tools.*`, `interview.getCategories`, `dat.questionCount`, `community.listPostsPage`, `community.getPostCount`                                                                        |
| Authenticated | `auth.*`, `profile.*`, `task.*`, `notification.*`, `saved.*`, `flash.*`, community read/write/comment/reaction/report procedures, `pat.recordAttempt`, `pat.getQuota`, `pat.getStats` |
| Premium       | `pat.getPredictedScore`, `pat.getAnalytics`, DAT practice/attempt/stats/analytics/exam procedures, `interview.getQuestions`, `interview.getRandomSet`                                 |
| Admin         | `admin.*` and community moderation/report-review procedures                                                                                                                           |

The middleware builders in `server/middleware.ts` are the source of truth:
`publicQuery`, `authedQuery`, `premiumQuery`, `premiumPlusQuery`, and
`adminQuery`. Any newly sensitive procedure must select the builder before its
implementation is reviewed.

External HTTP endpoints use JSON status semantics: OAuth endpoints redirect,
Stripe webhooks return 4xx for invalid events and 5xx for retryable processing
failures, health endpoints return 200/503, and metrics requires a bearer token.
