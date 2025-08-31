# DotDotDot_KampungKaki

# What you’ll build

A production‑grade starter for **KampungKaki**: a React PWA + TypeScript microservices backend (Node.js/NestJS), Postgres, Redis (geo + cache), Firebase RTDB chat, and Google Cloud Storage for media proofs. It implements:

* Singpass OIDC login (with a local mock for dev)
* Posting & browsing help requests with categories, urgency, date/time
* Volunteer matching with Redis GEO search
* In‑app chat (ephemeral), masked phone placeholder
* Start/Complete flow + code verification and VIA hours
* Ratings/credibility score
* Map & travel time (Google Maps + Distance Matrix)
* Photo proof upload via signed URLs -> GCS
* Admin audit endpoints (flags, long‑hour checks)
* Accessibility (ARIA, keyboard nav, voice input)
* CI/CD to Cloud Run + Terraform IaC

---

# Repo layout (pnpm workspaces)

```
kampungkaki/
  package.json
  pnpm-workspace.yaml
  .env.example
  .gitignore
  .prettierrc
  .eslintrc.cjs
  turbo.json
  /apps
    /web               # React PWA (Vite + TS)
    /api-auth          # Singpass OIDC, JWT minting
    /api-task          # Requests CRUD, accept, rating, proofs
    /api-location      # Location ingestion (volunteers), WS push, Redis GEO
    /api-notify        # Push/FCM email/SMS hooks (stub)
    /api-admin         # Audits, reports, RBAC
  /packages
    /db                # Prisma schema + client
    /types             # Shared TypeScript types (DTOs, events)
    /config            # Config loader, zod validation
    /utils             # Common utils (auth, errors)
  /infra
    /docker            # docker-compose for local stack
    /terraform         # Cloud Run, Postgres, Redis, GCS buckets, secrets
  /.github/workflows   # CI/CD
```

---

# Prereqs

* Node 20+, pnpm 9+
* Docker Desktop 4+
* GCloud CLI (prod deploy)
* A Firebase project (enable RTDB)
* A Google Maps API key (Maps JS + Distance Matrix)
* Singpass OIDC credentials (for prod). For dev we run a mock OIDC.

---

# Quick start (local)

1. **Clone & boot services**

```
cp .env.example .env
pnpm i
cd infra/docker
docker compose up -d  # postgres, redis, minio, mailhog, mock-oidc
```

2. **Migrate DB & seed**

```
pnpm -C packages/db prisma migrate dev
pnpm -C packages/db tsx scripts/seed.ts
```

3. **Run backend & web**

```
pnpm -C apps/api-auth dev
pnpm -C apps/api-task dev
pnpm -C apps/api-location dev
pnpm -C apps/api-admin dev
pnpm -C apps/web dev
```

Open [http://localhost:5173](http://localhost:5173)

---

# Environment (.env.example)

```
# Shared
NODE_ENV=development
JWT_ISSUER=kampungkaki
JWT_AUDIENCE=kk-clients
JWT_SECRET=devsupersecret

# Postgres
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/kk

# Redis
REDIS_URL=redis://localhost:6379

# Firebase RTDB (frontend uses Vite env)
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_DATABASE_URL=...
VITE_FIREBASE_PROJECT_ID=...

# Google Maps
VITE_GOOGLE_MAPS_API_KEY=...

# Media (MinIO for local, GCS in prod)
MEDIA_PROVIDER=minio
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=kk-media

# Signed URL
SIGNED_URL_TTL_SECONDS=600

# Singpass OIDC
OIDC_ISSUER_URL=http://localhost:5556/dex
OIDC_CLIENT_ID=kk-local
OIDC_CLIENT_SECRET=kk-secret
OIDC_REDIRECT_URI=http://localhost:3001/auth/callback

# Admin
ADMIN_EMAILS=you@example.com,partner@example.org
```

---

# Database schema (Prisma)

`packages/db/prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum RequestLabel { COMPANIONSHIP SHOPPING TRANSPORTATION HOME_TASKS OTHER }
enum RequestUrgency { LOW MEDIUM HIGH }

enum UserRole { BENEFICIARY VOLUNTEER ADMIN }

enum MediaKind { PROOF PROFILE }

enum TaskStatus { OPEN ACCEPTED IN_PROGRESS COMPLETED CANCELED }

model User {
  id            String   @id @default(cuid())
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  email         String   @unique
  phone         String?
  role          UserRole
  displayName   String
  photoUrl      String?
  credibility   Float    @default(0)
  goodCount     Int      @default(0)
  badCount      Int      @default(0)
  profile       Profile?
  requests      Request[]        @relation("UserRequests")
  acceptances   TaskAcceptance[]
  ratingsGiven  Rating[]         @relation("RatingsGiven")
  ratingsRecv   Rating[]         @relation("RatingsRecv")
}

model Profile {
  id        String @id @default(cuid())
  userId    String @unique
  user      User   @relation(fields: [userId], references: [id])
  address   String?
  lat       Float?
  lng       Float?
  govIdHash String? // hash of NRIC-like identifier if ever stored
}

model Request {
  id          String         @id @default(cuid())
  createdAt   DateTime       @default(now())
  updatedAt   DateTime       @updatedAt
  creatorId   String
  creator     User           @relation("UserRequests", fields: [creatorId], references: [id])
  label       RequestLabel
  title       String
  details     String
  whenStart   DateTime
  whenEnd     DateTime
  urgency     RequestUrgency
  lat         Float
  lng         Float
  address     String
  status      TaskStatus     @default(OPEN)
  acceptance  TaskAcceptance?
  media       Media[]
}

model TaskAcceptance {
  id           String     @id @default(cuid())
  requestId    String     @unique
  request      Request    @relation(fields: [requestId], references: [id])
  volunteerId  String
  volunteer    User       @relation(fields: [volunteerId], references: [id])
  acceptedAt   DateTime   @default(now())
  startedAt    DateTime?
  completedAt  DateTime?
  startCode    String     // 6-digit code issued to beneficiary
  status       TaskStatus @default(ACCEPTED)
  viaMinutes   Int        @default(0)
}

model Rating {
  id         String   @id @default(cuid())
  createdAt  DateTime @default(now())
  fromId     String
  toId       String
  score      Int      // +1 good, -1 bad
  note       String?
  requestId  String
  from       User     @relation("RatingsGiven", fields: [fromId], references: [id])
  to         User     @relation("RatingsRecv", fields: [toId], references: [id])
}

model Media {
  id         String   @id @default(cuid())
  createdAt  DateTime @default(now())
  kind       MediaKind
  url        String
  requestId  String?
  request    Request? @relation(fields: [requestId], references: [id])
  uploaderId String?
}

model AuditLog {
  id         String   @id @default(cuid())
  createdAt  DateTime @default(now())
  actorId    String?
  action     String
  meta       Json?
}
```

---

# Backend services (NestJS)

All APIs are JWT‑protected (except OIDC callback). We use `zod` for request validation and `class-transformer` for DTOs.

## api-auth (Singpass OIDC + JWT)

* Routes: `/auth/login` → redirect to OIDC, `/auth/callback` → exchange code → create User → issue JWT (httpOnly cookie), `/auth/me`.
* Dev: a **mock OIDC** provider runs in docker (`dex`) so the flow works locally.

`apps/api-auth/src/main.ts`

```ts
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { AppModule } from './module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.enableCors({ origin: ['http://localhost:5173'], credentials: true });
  await app.listen(3001);
}
bootstrap();
```

`apps/api-auth/src/oidc.service.ts` (using `openid-client`)

```ts
import { Injectable } from '@nestjs/common';
import { Issuer, generators, Client } from 'openid-client';

@Injectable()
export class OidcService {
  private client!: Client;
  private codeVerifier!: string;

  async init() {
    const issuer = await Issuer.discover(process.env.OIDC_ISSUER_URL!);
    this.client = new issuer.Client({
      client_id: process.env.OIDC_CLIENT_ID!,
      client_secret: process.env.OIDC_CLIENT_SECRET!,
      redirect_uris: [process.env.OIDC_REDIRECT_URI!],
      response_types: ['code'],
    });
  }

  authUrl() {
    this.codeVerifier = generators.codeVerifier();
    const codeChallenge = generators.codeChallenge(this.codeVerifier);
    return this.client.authorizationUrl({
      scope: 'openid email profile',
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
    });
  }

  async callback(params: Record<string, any>) {
    const tokenSet = await this.client.callback(process.env.OIDC_REDIRECT_URI!, params, { code_verifier: this.codeVerifier });
    return tokenSet;
  }
}
```

`apps/api-auth/src/auth.controller.ts`

```ts
@Post('login')
redirectToLogin(@Res() res: Response) {
  const url = this.oidc.authUrl();
  return res.redirect(url);
}

@Get('callback')
async cb(@Req() req: Request, @Res() res: Response) {
  const tokenSet = await this.oidc.callback(req.query as any);
  const { email, name, picture } = tokenSet.claims();
  const user = await this.userSvc.upsertFromOidc({ email, displayName: name, photoUrl: picture });
  const jwt = this.jwtSvc.sign({ sub: user.id, role: user.role });
  res.cookie('kk_jwt', jwt, { httpOnly: true, sameSite: 'lax' });
  return res.redirect('http://localhost:5173');
}
```

## api-task

* Requests CRUD: create, list nearby, details
* Accept a request → create `TaskAcceptance` (locks)
* Start (needs beneficiary 6‑digit code) → set `startedAt`
* Complete (beneficiary only) → set `completedAt`, compute minutes, add rating
* Signed URLs for photo proof

`apps/api-task/src/matching.service.ts` (Redis GEO)

```ts
import { createClient } from 'redis';
const GEO_KEY = 'kk:volunteer:geo';

export class MatchingService {
  private redis = createClient({ url: process.env.REDIS_URL });
  async onModuleInit(){ await this.redis.connect(); }

  async setVolunteerLocation(userId: string, lat: number, lng: number){
    // GEOADD: lon, lat order
    await this.redis.geoAdd(GEO_KEY, [{ longitude: lng, latitude: lat, member: userId }]);
  }

  async findNearby(lat: number, lng: number, km = 5){
    // GEOSEARCH by radius
    const res = await this.redis.geoSearch(GEO_KEY, { latitude: lat, longitude: lng }, { radius: km, unit: 'km', withCoordinates: true, withDistances: true, sort: 'ASC' });
    return res; // list of userIds + dist
  }
}
```

`apps/api-task/src/request.controller.ts`

```ts
@Post()
async create(@Body() dto: CreateRequestDto, @Req() req){
  // zod validate, then
  return this.prisma.request.create({ data: { ...dto, creatorId: req.user.sub, status: 'OPEN' } });
}

@Get('nearby')
async nearby(@Query() q: { lat: number; lng: number; km?: number }){
  // query Postgres by haversine or pre‑computed cube/earthdistance
  return this.prisma.$queryRaw`SELECT * FROM list_nearby_requests(${q.lat}, ${q.lng}, ${q.km ?? 5})`;
}

@Post(':id/accept')
async accept(@Param('id') id: string, @Req() req){
  const code = Math.floor(100000 + Math.random()*900000).toString();
  return this.prisma.taskAcceptance.create({ data: { requestId: id, volunteerId: req.user.sub, startCode: code } });
}

@Post(':id/start')
async start(@Param('id') id: string, @Body() body: { code: string }, @Req() req){
  const t = await this.prisma.taskAcceptance.findUniqueOrThrow({ where: { requestId: id } });
  if(t.volunteerId !== req.user.sub) throw new ForbiddenException();
  if(t.startCode !== body.code) throw new BadRequestException('Bad code');
  return this.prisma.taskAcceptance.update({ where: { id: t.id }, data: { startedAt: new Date(), status: 'IN_PROGRESS' } });
}

@Post(':id/complete')
async complete(@Param('id') id: string, @Req() req){
  const r = await this.prisma.request.findUniqueOrThrow({ where: { id }, include: { acceptance: true } });
  if(r.creatorId !== req.user.sub) throw new ForbiddenException();
  const now = new Date();
  const minutes = Math.max(0, Math.round(((+now) - (+r.acceptance!.startedAt!)) / 60000));
  await this.prisma.taskAcceptance.update({ where: { id: r.acceptance!.id }, data: { completedAt: now, viaMinutes: minutes, status: 'COMPLETED' } });
  return { minutes };
}
```

`apps/api-task/src/media.controller.ts` (signed URL)

```ts
@Post('proof/signed-url')
async signed(@Body() body: { filename: string; contentType: string }){
  const { url, fields } = await this.mediaSvc.createSignedUrl(body.filename, body.contentType);
  return { url, fields, expireIn: Number(process.env.SIGNED_URL_TTL_SECONDS) };
}
```

## api-location

* `POST /location` save volunteer GPS (Redis only by default), and edge‑publish to requestor via WS topic (e.g., `socket.io` or SSE)

## api-admin

* `GET /admin/reviews/long-via` suspicious tasks
* `POST /admin/flag` accept flags, write `AuditLog`

---

# SQL helpers

Enable geospatial search with Postgres `earthdistance` (optional if Redis GEO is primary):

```sql
CREATE EXTENSION IF NOT EXISTS cube;
CREATE EXTENSION IF NOT EXISTS earthdistance;

CREATE OR REPLACE FUNCTION list_nearby_requests(lat float, lng float, km float)
RETURNS SETOF requests AS $$
  SELECT * FROM "Request"
  WHERE status = 'OPEN'
  AND earth_distance(ll_to_earth(lat, lng), ll_to_earth("lat", "lng")) <= km * 1000
  ORDER BY earth_distance(ll_to_earth(lat, lng), ll_to_earth("lat", "lng"));
$$ LANGUAGE sql STABLE;
```

---

# Frontend (React + Vite + TS)

Key libs: React Router, Zustand (state), `@react-google-maps/api`, Firebase RTDB, `react-hook-form`, `zod`, `vaul` for accessible modals.

## Routing

```
/apps/web/src
  main.tsx
  App.tsx
  routes/
    Home.tsx
    Login.tsx
    Requests.tsx
    CreateRequest.tsx
    Search.tsx
    TaskDetail.tsx
    Chat.tsx
    Profile.tsx
    Admin.tsx
  components/
    Map.tsx
    VoiceField.tsx
    RatingBadge.tsx
    RequestCard.tsx
```

## Create Request page

`CreateRequest.tsx`

```tsx
const schema = z.object({
  label: z.enum(['COMPANIONSHIP','SHOPPING','TRANSPORTATION','HOME_TASKS','OTHER']),
  title: z.string().min(5),
  details: z.string().min(10),
  whenStart: z.string(),
  whenEnd: z.string(),
  urgency: z.enum(['LOW','MEDIUM','HIGH']),
  address: z.string(),
  lat: z.number(),
  lng: z.number(),
});

export default function CreateRequest(){
  const { register, handleSubmit, setValue, formState: { errors } } = useForm({ resolver: zodResolver(schema) });
  return (
    <form onSubmit={handleSubmit(async (data)=>{
      await fetch('/api-task/requests', { method:'POST', headers: { 'Content-Type':'application/json' }, credentials:'include', body: JSON.stringify(data) });
      location.href = '/requests';
    })} aria-label="Create help request">
      <fieldset>
        <legend>Request details</legend>
        <select {...register('label')} aria-label="Category">
          <option value="SHOPPING">Shopping</option>
          <option value="COMPANIONSHIP">Companionship</option>
          <option value="TRANSPORTATION">Transportation</option>
          <option value="HOME_TASKS">Home Tasks</option>
          <option value="OTHER">Others</option>
        </select>
        <input {...register('title')} placeholder="Short title" />
        <VoiceField onText={(t)=> setValue('details', t)} />
        <input {...register('details')} placeholder="Describe the help" aria-describedby="detailsHelp" />
        <div id="detailsHelp">You can also use voice input above.</div>

        <label>When</label>
        <input type="datetime-local" {...register('whenStart')} />
        <input type="datetime-local" {...register('whenEnd')} />

        <label>Urgency</label>
        <select {...register('urgency')}>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
        </select>

        <MapPicker onPick={(pos)=>{ setValue('lat', pos.lat); setValue('lng', pos.lng); setValue('address', pos.address); }} />
        <button type="submit">Create</button>
      </fieldset>
    </form>
  );
}
```

## Voice input (Web Speech API)

`components/VoiceField.tsx`

```tsx
export function VoiceField({ onText }: { onText: (t: string)=>void }){
  const [rec, setRec] = useState<SpeechRecognition | null>(null);
  const [recording, setRecording] = useState(false);
  useEffect(()=>{
    const SR: any = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if(SR){ const r = new SR(); r.lang = 'en-SG'; r.continuous = false; r.interimResults = false; r.onresult = (e:any)=> onText(e.results[0][0].transcript); setRec(r); }
  },[]);
  return (
    <div>
      <button type="button" onClick={()=>{ if(!rec) return; setRecording(true); rec.start(); }} aria-pressed={recording}>🎙 Start voice</button>
      <button type="button" onClick={()=>{ rec?.stop(); setRecording(false); }}>Stop</button>
    </div>
  );
}
```

## Map picker & distance

`components/Map.tsx`

```tsx
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';

export function MapPicker({ onPick }:{ onPick:(p:{lat:number;lng:number;address:string})=>void }){
  const { isLoaded } = useJsApiLoader({ googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY, libraries:['places'] });
  const [center, setCenter] = useState({ lat:1.3521, lng:103.8198 });
  if(!isLoaded) return null;
  return (
    <GoogleMap mapContainerStyle={{ width:'100%', height:300 }} center={center} zoom={12} onClick={async (e)=>{
      const lat = e.latLng!.lat(); const lng = e.latLng!.lng();
      const geocoder = new google.maps.Geocoder();
      const res = await geocoder.geocode({ location: { lat, lng } });
      onPick({ lat, lng, address: res.results?.[0]?.formatted_address ?? '' });
    }}>
      <Marker position={center} />
    </GoogleMap>
  );
}
```

## Chat (Firebase RTDB)

`routes/Chat.tsx`

```tsx
import { getDatabase, ref, push, onChildAdded } from 'firebase/database';
import { initializeApp } from 'firebase/app';

const app = initializeApp({ /* VITE_ envs */ });
const db  = getDatabase(app);

export default function Chat({ threadId, user }:{ threadId:string; user:{ id:string; name:string } }){
  const [msgs, setMsgs] = useState<any[]>([]);
  useEffect(()=>{
    const r = ref(db, `threads/${threadId}`);
    return onChildAdded(r, snap => setMsgs(m=>[...m, snap.val()]));
  },[threadId]);
  const send = async (text:string)=>{ await push(ref(db, `threads/${threadId}`), { text, from:user.id, name:user.name, ts: Date.now() }); };
  return (
    <div role="log" aria-live="polite">
      {msgs.map((m,i)=>(<div key={i}>{m.name}: {m.text}</div>))}
      <input onKeyDown={(e)=> e.key==='Enter' && send((e.target as HTMLInputElement).value)} aria-label="Type your message" />
    </div>
  );
}
```

---

# Proof upload flow (frontend)

```ts
// 1) ask backend for signed URL
const r = await fetch('/api-task/proof/signed-url', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ filename:file.name, contentType:file.type }) }).then(r=>r.json());
// 2) upload directly (S3‑style or GCS form). Example uses fetch PUT for simplicity
await fetch(r.url, { method:'PUT', body:file, headers:{ 'Content-Type': file.type }});
// 3) notify backend to attach Media to Request
await fetch('/api-task/requests/'+reqId+'/attach-proof', { method:'POST', body: JSON.stringify({ url:r.url }) });
```

---

# Accessibility checklist

* Keyboard focus outline preserved, logical tab order
* `aria-label`, `aria-live` for dynamic regions (chat, toasts)
* Form fields have `label`/`aria-describedby`
* Color contrast ≥ 4.5:1; scalable font sizes
* Voice input fallback to manual
* Screen reader roles: `role="log"` for chat, `role="navigation"` for menus

---

# Notifications (stub)

`api-notify` exposes `/notify/push` that would call FCM/APNS or send SMS via a provider. For now, emit to console and write `AuditLog`.

---

# Admin heuristics example

```sql
-- Long VIA: tasks > 6 hours for categories that are usually short
SELECT t.id, r.label, t.startedAt, t.completedAt, t.viaMinutes
FROM "TaskAcceptance" t
JOIN "Request" r ON r.id = t."requestId"
WHERE t."viaMinutes" > 360
ORDER BY t."viaMinutes" DESC;
```

---

# CI/CD (GitHub Actions → Cloud Run)

`.github/workflows/deploy.yaml`

```yaml
name: deploy
on:
  push:
    branches: [ main ]
jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: 'pnpm' }
      - run: pnpm i --frozen-lockfile
      - run: |
          docker build -t gcr.io/$PROJECT/api-task:$(git rev-parse --short HEAD) apps/api-task
          docker build -t gcr.io/$PROJECT/api-auth:$(git rev-parse --short HEAD) apps/api-auth
      - uses: google-github-actions/auth@v2
        with: { credentials_json: '${{ secrets.GCP_SA_KEY }}' }
      - uses: google-github-actions/deploy-cloudrun@v2
        with:
          service: kk-api-task
          image: gcr.io/${{ env.PROJECT }}/api-task:${{ github.sha }}
```

---

# Terraform sketch (`infra/terraform`)

* Cloud SQL (Postgres), Memorystore (Redis), Cloud Run services (api‑\*), GCS bucket, Artifact Registry, Secret Manager, VPC connector.
* Outputs: URLs, DB connection string, Redis host.

---

# Testing & quality

* Unit tests with Vitest/Jest
* E2E (Playwright) covering: login (mock), create request, accept, start with code, upload proof, complete, rate.

---

# Roadmap hooks

* Masked phone via Twilio proxy numbers (later)
* Feature flags (Unleash) for pilot groups
* i18n (English/Chinese/Malay/Tamil) with `react-intl`

---

# Tips when going to prod

* Enforce HTTPS and `secure` cookies
* Rotate JWT secrets; store in Secret Manager
* Short TTL for chat persistence (12h) via DB job or RTDB TTL rules
* Audit admin actions exhaustively

---

# License

MIT (replace if you need).

---

# Appendix: Dev docker compose

`infra/docker/docker-compose.yml`

```yaml
version: '3.9'
services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: kk
    ports: [ '5432:5432' ]
  redis:
    image: redis:7
    ports: [ '6379:6379' ]
  minio:
    image: minio/minio
    command: server /data --console-address :9001
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    ports: [ '9000:9000', '9001:9001' ]
  dex:
    image: ghcr.io/dexidp/dex:v2.39.0
    volumes: [ './dex.yaml:/etc/dex/config.yaml' ]
    ports: [ '5556:5556' ]
```

This blueprint gives you working code paths and a clear path to production. Start with local dev (mock OIDC), wire the core flows, then swap mocks for real Singpass, GCS, and FCM in staging → prod.
