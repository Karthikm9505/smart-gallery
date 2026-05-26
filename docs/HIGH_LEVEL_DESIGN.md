# Smart Gallery — High-Level Design

## 1) Overview

Smart Gallery is a cloud-native image gallery application with secure authentication, direct object storage uploads, and metadata-driven browsing.

The system is split into:
- **Client layer** (`/client`) built with React + Vite
- **API layer** (`/server`) built with Node.js + Express
- **Storage and identity layer** on AWS (Cognito, S3, DynamoDB)
- **Optional async AI enrichment layer** (Lambda + Rekognition)

---

## 2) Architecture

```text
User
  │
  ▼
React + Vite Client (Amplify Auth)
  │  (Bearer access token)
  ▼
Express API
  ├── Cognito JWT verification
  ├── S3 presigned URL generation (upload/download)
  └── DynamoDB metadata CRUD
       │
       ├── Amazon S3 (image objects)
       └── Amazon DynamoDB (metadata + aiTags)

Optional async extension:
S3 ObjectCreated event ──► Lambda ──► Rekognition ──► DynamoDB aiTags update
```

---

## 3) Client Layer

### Responsibilities
- Render public landing page, authentication page, and secure gallery page
- Authenticate users with AWS Amplify + Cognito
- Fetch API data and render gallery state
- Perform direct uploads via presigned URL flow
- Support:
  - Upload
  - List
  - Search (filename + AI tags)
  - Download
  - Delete

### Key routes
- `/` → landing page
- `/login` → Cognito-authenticated sign-in/up
- `/app` → authenticated gallery

---

## 4) API Layer

### Responsibilities
- Enforce authentication for protected operations
- Generate presigned S3 URLs
- Persist and query metadata in DynamoDB
- Enforce cross-origin policy and JSON API behavior

### Main endpoints
- `GET /api/upload-url`
- `POST /api/confirm-upload`
- `GET /api/gallery`
- `GET /api/download-url`
- `DELETE /api/delete-image`
- `GET /health`

### Security middleware
- Cognito JWT verification derives `req.user.id`
- Protected endpoints operate on user-scoped data only

---

## 5) Storage and Data Model

### Amazon S3
- Stores image binaries
- Object key format is user-scoped:
  - `uploads/{userId}/{timestamp}_{fileName}`

### Amazon DynamoDB
- Stores image metadata and AI tags
- Logical item shape:
  - `userId` (partition key)
  - `createdAt` (sort key)
  - `id` (S3 key)
  - `fileName`
  - `fileType`
  - `s3Url`
  - `aiTags` (array)

### Multi-tenant isolation
- Data access constrained by authenticated user ID
- User-specific partitioning in both object storage and metadata queries

---

## 6) Core Flows

### Upload flow
1. User signs in via Cognito
2. Client requests `GET /api/upload-url`
3. API returns presigned S3 URL + object key
4. Client uploads binary directly to S3
5. Client calls `POST /api/confirm-upload`
6. API stores metadata in DynamoDB
7. Client refreshes gallery list

### Gallery retrieval flow
1. Client calls `GET /api/gallery` with access token
2. API queries DynamoDB by `userId`
3. API returns newest-first gallery items

### Download flow
1. Client requests `GET /api/download-url?key=...`
2. API returns presigned GET URL
3. Browser downloads file from S3

### Delete flow
1. Client calls `DELETE /api/delete-image` with `s3Key` + `createdAt`
2. API deletes S3 object
3. API deletes DynamoDB metadata record
4. Client refreshes gallery list

---

## 7) Identity and Security

- Amazon Cognito handles user identity and token issuance
- Client sends Bearer token for authenticated APIs
- Server verifies JWT with Cognito configuration
- CORS allows trusted origins for browser clients
- Presigned URLs reduce server-side file handling exposure

---

## 8) AI Tagging Extension (Recommended)

Current UI supports displaying `aiTags`, but async tagging is not yet implemented in this repository.

Recommended extension:
1. Configure S3 `ObjectCreated` event notification
2. Trigger Lambda tagging worker
3. Worker calls Amazon Rekognition for labels
4. Worker writes labels into DynamoDB `aiTags`
5. Client gallery refresh shows completed tags

Benefits:
- Keeps upload latency low
- Scales independently from API
- Enables eventual consistency for enrichment features

---

## 9) Deployment Model

### Current repository model
- Frontend and backend are containerized separately
- `docker-compose.yaml` runs both services locally
- GitHub Actions CI builds backend and frontend Docker images

### Suggested production topology
- Frontend: Vercel or static hosting/CDN
- Backend: container runtime (managed service)
- AWS managed services: Cognito, S3, DynamoDB
- Optional: Lambda + Rekognition for AI tagging

---

## 10) Non-Functional Design Qualities

- Secure direct-to-S3 uploads
- Stateless API service
- Clear separation of concerns (client/API/cloud)
- Tenant isolation by authenticated user context
- Extensible asynchronous AI processing architecture

---

## 11) Current Gaps and Next Steps

1. Async AI tagging pipeline is not implemented
2. Explicit rate limiting is not implemented
3. Audit logging and observability are minimal
4. Infrastructure-as-code definitions are missing
5. Backend automated test coverage is missing

