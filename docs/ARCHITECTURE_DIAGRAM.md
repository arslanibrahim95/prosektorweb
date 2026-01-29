# ProSektorWeb - Visual Architecture Diagram

> **System Architecture & Module Dependency Map**
> **Last Updated:** 2026-01-28

---

## 🏗️ High-Level System Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        USER[User/Browser]
        subgraph "React Components"
            UI[UI Components]
            PROMPT[PromptInput.tsx]
            GALLERY[Gallery View]
            PREVIEW[Preview Panel]
        end
    end

    subgraph "Next.js App Router"
        ROUTES[API Routes]
        ACTIONS[Server Actions]
        PAGES[App Pages]
    end

    subgraph "Core Infrastructure"
        AUTH[NextAuth.js]
        PRISMA[Prisma ORM]
        REDIS[Redis Cache]
        LOGGER[Pino Logger]
    end

    subgraph "External Services"
        OPENAI[OpenAI API]
        DB[(MariaDB)]
        SENTRY[Sentry]
    end

    USER --> UI
    UI --> PROMPT
    UI --> GALLERY
    UI --> PREVIEW
    
    PROMPT --> ACTIONS
    GALLERY --> ACTIONS
    PREVIEW --> ROUTES
    
    ACTIONS --> AUTH
    ROUTES --> AUTH
    
    ACTIONS --> PRISMA
    ROUTES --> PRISMA
    
    PRISMA --> DB
    
    ACTIONS --> REDIS
    ROUTES --> REDIS
    
    ACTIONS --> LOGGER
    ROUTES --> LOGGER
    
    ACTIONS -.-> OPENAI
    
    LOGGER -.-> SENTRY
```

---

## 🤖 AI Generation Feature - Detailed Module Structure

```mermaid
graph TB
    subgraph "AI Generation Feature Module"
        direction TB
        
        subgraph "📱 Client Components [Blue]"
            style CLIENT fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
            CLIENT[PromptInput.tsx]
            CLIENT_GALLERY[GalleryGrid.tsx]
            CLIENT_PREVIEW[GenerationPreview.tsx]
            CLIENT_STATUS[StatusIndicator.tsx]
        end
        
        subgraph "⚡ Server Actions [Green]"
            style SERVER fill:#e8f5e9,stroke:#388e3c,stroke-width:2px
            ACTION_CREATE[createGeneration]
            ACTION_STATUS[getGenerationStatus]
            ACTION_CANCEL[cancelGeneration]
            ACTION_LIST[getGeneratedWebsites]
            ACTION_CLONE[cloneWebsite]
            ACTION_ROLLBACK[rollbackWebsite]
            ACTION_DELETE[deleteWebsite]
            ACTION_TEMPLATES[getGenerationTemplates]
        end
        
        subgraph "🔧 Business Logic Libraries [Orange]"
            style LIB fill:#fff3e0,stroke:#f57c00,stroke-width:2px
            ORCH[GenerationOrchestrator.ts]
            VALID[validation.ts]
        end
        
        subgraph "📊 Type Definitions [Purple]"
            style TYPES fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
            TYPES_FILE[index.ts]
        end
        
        subgraph "🗄️ Database Layer [Gray]"
            style DBL fill:#f5f5f5,stroke:#616161,stroke-width:2px
            MIGRATION[Migration SQL]
            SCHEMA[Prisma Schema Ext]
        end
    end

    %% Client to Server Actions
    CLIENT -->|"submit prompt"| ACTION_CREATE
    CLIENT_GALLERY -->|"fetch list"| ACTION_LIST
    CLIENT_GALLERY -->|"clone/edit"| ACTION_CLONE
    CLIENT_GALLERY -->|"rollback"| ACTION_ROLLBACK
    CLIENT_GALLERY -->|"delete"| ACTION_DELETE
    CLIENT_PREVIEW -->|"poll status"| ACTION_STATUS
    CLIENT_PREVIEW -->|"cancel"| ACTION_CANCEL
    
    %% Server Actions to Libraries
    ACTION_CREATE -->|"validate"| VALID
    ACTION_CREATE -->|"orchestrate"| ORCH
    ACTION_CLONE -->|"validate"| VALID
    ACTION_ROLLBACK -->|"validate"| VALID
    
    %% Orchestrator internal flow
    ORCH -->|"step 1"| ORCH_ANAL[Analysis Step]
    ORCH -->|"step 2"| ORCH_DES[Design Step]
    ORCH -->|"step 3"| ORCH_CONT[Content Step]
    ORCH -->|"step 4"| ORCH_CODE[Code Step]
    ORCH -->|"step 5"| ORCH_BUILD[Build Step]
    
    %% All server actions use types
    ACTION_CREATE -.->|"imports types"| TYPES_FILE
    ACTION_LIST -.->|"imports types"| TYPES_FILE
    ORCH -.->|"imports types"| TYPES_FILE
    VALID -.->|"imports types"| TYPES_FILE
    CLIENT -.->|"imports types"| TYPES_FILE
```

---

## 🔗 Integration Points & Cross-Module Dependencies

```mermaid
graph LR
    subgraph "AI Generation System"
        AI_GEN[AI Generation Module]
        AI_TYPES[types/index.ts]
        AI_ORCH[lib/orchestrator.ts]
        AI_VALID[lib/validation.ts]
        AI_ACTIONS[actions/generation.ts]
    end
    
    subgraph "Core Infrastructure"
        INFRA_AUTH[auth.ts]
        INFRA_PRISMA[lib/prisma.ts]
        INFRA_REDIS[lib/redis.ts]
        INFRA_LOGGER[lib/logger.ts]
        INFRA_OPENAI[lib/ai/openai-connector.ts]
    end
    
    subgraph "External Services"
        EXT_DB[(MariaDB)]
        EXT_REDIS[(Redis)]
        EXT_OPENAI[OpenAI API]
    end

    %% AI Generation to Infrastructure
    AI_ACTIONS -->|"auth()"| INFRA_AUTH
    AI_ACTIONS -->|"prisma.$queryRaw"| INFRA_PRISMA
    AI_VALID -->|"prisma.$queryRaw"| INFRA_PRISMA
    AI_ORCH -->|"prisma.$queryRaw"| INFRA_PRISMA
    AI_ORCH -->|"redis.publish"| INFRA_REDIS
    AI_ORCH -->|"getOpenAIConnector()"| INFRA_OPENAI
    AI_ACTIONS -->|"logger.info/error"| INFRA_LOGGER
    AI_ORCH -->|"logger.info/error"| INFRA_LOGGER
    AI_VALID -->|"logger.error"| INFRA_LOGGER
    
    %% Infrastructure to External
    INFRA_PRISMA -->|"SQL queries"| EXT_DB
    INFRA_REDIS -->|"TCP connection"| EXT_REDIS
    INFRA_OPENAI -->|"HTTPS REST API"| EXT_OPENAI
    
    %% Type dependencies
    AI_GEN -.->|"exports"| AI_TYPES
    AI_ORCH -.->|"imports"| AI_TYPES
    AI_VALID -.->|"imports"| AI_TYPES
    AI_ACTIONS -.->|"imports"| AI_TYPES
```

---

## 📊 Data Flow - User Prompt to Persisted Website

```mermaid
sequenceDiagram
    actor User
    participant Client as PromptInput.tsx
    participant Action as createGeneration
    participant Valid as validation.ts
    participant Orch as GenerationOrchestrator
    participant OpenAI as OpenAI Connector
    participant DB as MariaDB
    participant Redis as Redis Cache
    participant Logger as Pino Logger

    User->>Client: Enter prompt & submit
    Client->>Client: validatePrompt()
    Client->>Action: createGeneration({prompt})
    
    Action->>Valid: checkGenerationPermission()
    Valid-->>Action: {allowed: true}
    
    Action->>Valid: checkGenerationRateLimit()
    Valid-->>Action: {allowed: true, remaining: 9}
    
    Action->>Valid: validatePrompt()
    Valid-->>Action: {valid: true, complexity: 'MODERATE'}
    
    Action->>DB: INSERT AIGenerationJob
    DB-->>Action: jobId
    
    Action->>Logger: logger.info({jobId}, 'Generation job created')
    
    Action->>Orch: startGeneration(jobId, context)
    Action-->>Client: {success: true, jobId, estimatedDuration}
    
    par Async Generation Process
        Orch->>Orch: Step 1: ANALYSIS
        Orch->>OpenAI: generateWithSystem(prompt)
        OpenAI->>OpenAI: OpenAI.chat.completions.create()
        OpenAI-->>Orch: {content: JSON}
        Orch->>DB: UPDATE analysisResult
        Orch->>Redis: publish progress event
        
        Orch->>Orch: Step 2: DESIGN
        Orch->>OpenAI: generateWithSystem(designPrompt)
        OpenAI-->>Orch: {content: JSON}
        Orch->>DB: UPDATE designResult
        Orch->>Redis: publish progress event
        
        Orch->>Orch: Step 3: CONTENT
        Orch->>OpenAI: generateWithSystem(contentPrompt)
        OpenAI-->>Orch: {content: JSON}
        Orch->>DB: UPDATE contentResult
        Orch->>Redis: publish progress event
        
        Orch->>Orch: Step 4: CODE
        Orch->>OpenAI: generateWithSystem(codePrompt)
        OpenAI-->>Orch: {content: JSON}
        Orch->>DB: UPDATE codeResult
        Orch->>Redis: publish progress event
        
        Orch->>Orch: Step 5: BUILD
        Orch->>DB: INSERT GeneratedWebsite
        Orch->>DB: UPDATE AIGenerationJob status=COMPLETED
        Orch->>Redis: publish complete event
        Orch->>Logger: logger.info('Generation completed')
    end
    
    Client->>Redis: Subscribe to generation:jobId
    Redis-->>Client: Progress events (SSE/WebSocket)
    Client->>User: Real-time progress updates
```

---

## 🏛️ Layered Architecture

```mermaid
graph TB
    subgraph "Layer 1: Presentation Layer"
        direction LR
        L1A[PromptInput.tsx]
        L1B[GalleryGrid.tsx]
        L1C[GenerationPreview.tsx]
        L1D[StatusIndicator.tsx]
        L1E[Admin Panel Pages]
    end
    
    subgraph "Layer 2: Server Actions Layer"
        direction LR
        L2A[createGeneration]
        L2B[getGenerationStatus]
        L2C[getGeneratedWebsites]
        L2D[cloneWebsite]
        L2E[rollbackWebsite]
        L2F[cancelGeneration]
    end
    
    subgraph "Layer 3: Business Logic Layer"
        direction LR
        L3A[GenerationOrchestrator]
        L3B[validation.ts]
        L3C[rate limiting]
        L3D[permission checks]
    end
    
    subgraph "Layer 4: Service Connector Layer"
        direction LR
        L4A[OpenAI Connector]
        L4B[Prisma Client]
        L4C[Redis Client]
        L4D[Logger]
    end
    
    subgraph "Layer 5: External Services Layer"
        direction LR
        L5A[(MariaDB)]
        L5B[(Redis)]
        L5C[OpenAI API]
        L5D[Sentry]
    end

    %% Layer 1 to Layer 2
    L1A -->|"HTTP POST"| L2A
    L1B -->|"HTTP GET"| L2C
    L1C -->|"HTTP GET"| L2B
    L1C -->|"HTTP POST"| L2F
    
    %% Layer 2 to Layer 3
    L2A -->|"validate"| L3B
    L2A -->|"orchestrate"| L3A
    L2D -->|"validate"| L3B
    L2E -->|"validate"| L3B
    
    %% Layer 3 to Layer 4
    L3A -->|"generate"| L4A
    L3A -->|"query"| L4B
    L3A -->|"publish"| L4C
    L3A -->|"log"| L4D
    L3B -->|"query"| L4B
    L3B -->|"log"| L4D
    
    %% Layer 4 to Layer 5
    L4A -->|"REST API"| L5C
    L4B -->|"SQL"| L5A
    L4C -->|"TCP"| L5B
    L4D -->|"HTTP"| L5D
```

---

## 🔀 Import/Export Relationships

```mermaid
graph LR
    subgraph "AI Generation Module"
        TYPES[types/index.ts]
        VALID[lib/validation.ts]
        ORCH[lib/orchestrator.ts]
        ACTIONS[actions/generation.ts]
        COMP[components/PromptInput.tsx]
    end
    
    subgraph "Core Library Exports"
        AUTH[auth.ts]
        PRISMA[lib/prisma.ts]
        REDIS[lib/redis.ts]
        LOGGER[lib/logger.ts]
        OPENAI[lib/ai/openai-connector.ts]
        UTILS[lib/utils.ts]
    end

    %% Types are imported by all
    TYPES -.->|"exports"| VALID
    TYPES -.->|"exports"| ORCH
    TYPES -.->|"exports"| ACTIONS
    TYPES -.->|"exports"| COMP
    
    %% Validation exports
    VALID -.->|"exports validatePrompt"| COMP
    VALID -.->|"exports checkGenerationRateLimit"| ACTIONS
    VALID -.->|"exports checkGenerationPermission"| ACTIONS
    
    %% Orchestrator exports
    ORCH -.->|"exports GenerationOrchestrator"| ACTIONS
    
    %% Core library imports
    AUTH -.->|"import { auth }"| ACTIONS
    PRISMA -.->|"import { prisma }"| ACTIONS
    PRISMA -.->|"import { prisma }"| VALID
    PRISMA -.->|"import { prisma }"| ORCH
    REDIS -.->|"import { redis }"| ORCH
    LOGGER -.->|"import { logger }"| ACTIONS
    LOGGER -.->|"import { logger }"| VALID
    LOGGER -.->|"import { logger }"| ORCH
    OPENAI -.->|"import { getOpenAIConnector }"| ORCH
    UTILS -.->|"import { cn }"| COMP
```

---

## 🎯 Dependency Graph with Relationship Types

```mermaid
graph TB
    subgraph "Module Dependencies"
        %% Nodes
        A[PromptInput.tsx]
        B[actions/generation.ts]
        C[lib/validation.ts]
        D[lib/orchestrator.ts]
        E[types/index.ts]
        F[auth.ts]
        G[lib/prisma.ts]
        H[lib/redis.ts]
        I[lib/logger.ts]
        J[lib/ai/openai-connector.ts]
        
        %% Edges with relationship types
        A ==>|"sync call"| B
        B ==>|"sync call"| C
        B ==>|"async instantiate"| D
        B -.->|"type import"| E
        C -.->|"type import"| E
        D -.->|"type import"| E
        A -.->|"type import"| E
        
        B -.->|"function import"| F
        B -.->|"function import"| G
        C -.->|"function import"| G
        D -.->|"function import"| G
        D -.->|"function import"| H
        D -.->|"function import"| J
        
        B -.->|"function import"| I
        C -.->|"function import"| I
        D -.->|"function import"| I
        
        %% Styling
        style A fill:#e3f2fd,stroke:#1976d2
        style B fill:#e8f5e9,stroke:#388e3c
        style C fill:#fff3e0,stroke:#f57c00
        style D fill:#fff3e0,stroke:#f57c00
        style E fill:#f3e5f5,stroke:#7b1fa2
        style F fill:#ffebee,stroke:#c62828
        style G fill:#ffebee,stroke:#c62828
        style H fill:#ffebee,stroke:#c62828
        style I fill:#ffebee,stroke:#c62828
        style J fill:#ffebee,stroke:#c62828
    end
    
    legend["Legend:
    🔵 Client Components
    🟢 Server Actions
    🟠 Business Logic
    🟣 Type Definitions
    🔴 Core Infrastructure"]
```

---

## 📁 File Structure Map

```
prosektorweb/
├── src/
│   ├── features/
│   │   └── ai-generation/           # AI Generation Feature Module
│   │       ├── types/
│   │       │   └── index.ts         # Type definitions (exports all types)
│   │       ├── lib/
│   │       │   ├── validation.ts    # Validation & rate limiting
│   │       │   └── orchestrator.ts  # Generation workflow orchestrator
│   │       ├── actions/
│   │       │   └── generation.ts    # Server actions (8 actions)
│   │       └── components/
│   │           └── PromptInput.tsx  # Main input component
│   ├── lib/
│   │   ├── ai/
│   │   │   └── openai-connector.ts  # OpenAI integration
│   │   ├── prisma.ts                # Database client
│   │   ├── redis.ts                 # Cache client
│   │   ├── logger.ts                # Structured logging
│   │   └── utils.ts                 # Utility functions
│   ├── auth.ts                      # Authentication
│   └── app/
│       └── admin/
│           └── ai-generation/       # Admin panel pages
├── prisma/
│   └── migrations/
│       └── 20260128000000_add_ai_website_generation/
│           └── migration.sql        # Database schema
└── docs/
    └── ARCHITECTURE_DIAGRAM.md      # This file
```

---

## 🔄 Async Operation Patterns

```mermaid
graph TB
    subgraph "Synchronous Operations [Solid Lines]"
        SYNC1[Prompt Validation]
        SYNC2[Permission Checks]
        SYNC3[Rate Limit Checks]
        SYNC4[Database Reads]
    end
    
    subgraph "Asynchronous Operations [Dashed Lines]"
        ASYNC1[AI Generation Steps]
        ASYNC2[External API Calls]
        ASYNC3[Background Jobs]
    end
    
    subgraph "Event-Driven Operations [Dotted Lines]"
        EVENT1[Redis Pub/Sub]
        EVENT2[Progress Updates]
        EVENT3[Activity Logging]
    end

    %% Sync flow
    CLIENT[Client] -->|"solid"| SYNC1
    SYNC1 -->|"solid"| SYNC2
    SYNC2 -->|"solid"| SYNC3
    
    %% Async flow
    SYNC3 -.->|"dashed"| ASYNC1
    ASYNC1 -.->|"dashed"| ASYNC2
    
    %% Event flow
    ASYNC1 -.->|"dotted"| EVENT1
    ASYNC1 -.->|"dotted"| EVENT3
    EVENT1 -.->|"dotted"| CLIENT
```

---

## 📈 Data Flow Summary

| Stage | From | To | Operation Type | Data Format |
|-------|------|-----|----------------|-------------|
| 1. Input | User | PromptInput | User Action | String |
| 2. Validation | PromptInput | validation.ts | Sync Function | Object |
| 3. Submission | PromptInput | createGeneration | HTTP POST | JSON |
| 4. Permission | createGeneration | auth.ts | Function Call | Session |
| 5. Rate Check | createGeneration | validation.ts | DB Query | SQL |
| 6. Job Create | createGeneration | MariaDB | INSERT | SQL |
| 7. Orchestrate | createGeneration | orchestrator.ts | Async Init | Object |
| 8. AI Call | orchestrator.ts | OpenAI | HTTPS API | JSON |
| 9. Progress | orchestrator.ts | Redis | PUBLISH | Event |
| 10. Persist | orchestrator.ts | MariaDB | UPDATE | SQL |
| 11. Complete | orchestrator.ts | Redis | PUBLISH | Event |
| 12. Display | Redis | PromptInput | SUBSCRIBE | Event |

---

## 🎨 Color Coding Reference

| Color | Hex Code | Usage |
|-------|----------|-------|
| Blue | `#e3f2fd` / `#1976d2` | Client Components |
| Green | `#e8f5e9` / `#388e3c` | Server Actions |
| Orange | `#fff3e0` / `#f57c00` | Business Logic |
| Purple | `#f3e5f5` / `#7b1fa2` | Type Definitions |
| Red | `#ffebee` / `#c62828` | Core Infrastructure |
| Gray | `#f5f5f5` / `#616161` | Database Layer |

---

## 🔐 Security Flow

```mermaid
graph LR
    USER[User] -->|"1. Request"| AUTH[NextAuth Middleware]
    AUTH -->|"2. Validate Session"| SESSION{Valid?}
    SESSION -->|"No"| DENY[403 Forbidden]
    SESSION -->|"Yes"| PERM[Permission Check]
    PERM -->|"3. Check Role"| ROLE{Authorized?}
    ROLE -->|"No"| DENY
    ROLE -->|"Yes"| RATE[Rate Limit Check]
    RATE -->|"4. Check Limit"| LIMIT{Under Limit?}
    LIMIT -->|"No"| DENY429[429 Rate Limited]
    LIMIT -->|"Yes"| PROCESS[Process Request]
    
    style DENY fill:#ffebee,stroke:#c62828
    style DENY429 fill:#ffebee,stroke:#c62828
    style PROCESS fill:#e8f5e9,stroke:#388e3c
```

---

**Diagram Legend:**
- **Solid arrows (→)** = Synchronous function calls
- **Dashed arrows (-.->)** = Asynchronous operations / Imports
- **Thick arrows (==>)** = HTTP requests / Major data flow
- **Dotted arrows (...>)** = Event-driven communication
