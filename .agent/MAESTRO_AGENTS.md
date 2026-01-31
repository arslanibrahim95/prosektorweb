# AGENTS.md - Maestro Agent Registry

> **Version 1.0** - All available agents and their capabilities

---

## Overview

Maestro uses specialized agents for domain-specific tasks. Each agent has:
- **Skills**: Loaded from `skills/` folder
- **Tools**: Available Claude Code tools
- **Model**: AI model to use (inherit = parent model)

---

## Agent Categories

```
┌─────────────────────────────────────────────────────────────┐
│                      ORCHESTRATION                          │
├─────────────────────────────────────────────────────────────┤
│  orchestrator          │ Multi-agent coordination           │
│  content-orchestrator  │ AI content pipeline                │
│  project-planner       │ Planning & task breakdown          │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                      DEVELOPMENT                            │
├─────────────────────────────────────────────────────────────┤
│  frontend-specialist   │ Web UI/UX                          │
│  backend-specialist    │ API, server, database              │
│  mobile-developer      │ iOS, Android, React Native         │
│  game-developer        │ Game development                   │
│  database-architect    │ Schema design, optimization        │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                      QUALITY & SECURITY                     │
├─────────────────────────────────────────────────────────────┤
│  test-engineer         │ Testing strategy                   │
│  security-auditor      │ Vulnerability analysis             │
│  penetration-tester    │ Security testing                   │
│  quality-controller    │ Quality gate enforcement           │
│  debugger              │ Root cause analysis                │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                      OPERATIONS                             │
├─────────────────────────────────────────────────────────────┤
│  devops-engineer       │ CI/CD, deployment                  │
│  performance-optimizer │ Speed optimization                 │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                      CONTENT & SEO                          │
├─────────────────────────────────────────────────────────────┤
│  seo-specialist        │ SEO + GEO optimization             │
│  documentation-writer  │ Technical documentation            │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                      UTILITY                                │
├─────────────────────────────────────────────────────────────┤
│  explorer-agent        │ Codebase discovery                 │
└─────────────────────────────────────────────────────────────┘
```

---

## Agent Details

### 1. orchestrator

**Purpose:** Multi-agent coordination and task orchestration

**When to Use:**
- Complex tasks requiring multiple perspectives
- Parallel analysis across domains
- Tasks needing security + backend + frontend expertise combined

**Skills:**
```
clean-code, parallel-agents, behavioral-modes, plan-writing,
brainstorming, architecture, lint-and-validate
```

**Key Features:**
- Decomposes complex tasks into subtasks
- Invokes specialized agents via Agent Tool
- Synthesizes results into cohesive output
- Verifies plans before execution

---

### 2. content-orchestrator

**Purpose:** Multi-model AI content pipeline coordinator

**When to Use:**
- Bulk content generation
- OSGB site content creation
- Multi-model content workflows

**Skills:**
```
clean-code, multi-model-connector, content-review,
content-creation, content-optimization, content-publishing, quality-gate
```

**Model Routing:**

| Content Type | Primary | Fallback |
|--------------|---------|----------|
| Blog | Claude | Gemini → GPT-4 |
| Service Page | Claude | Gemini → GPT-4 |
| Landing Page | Gemini | Claude → GPT-4 |
| FAQ | Gemini | GLM → Claude |
| Product Desc | GLM 4.7 | Gemini → Claude |

**Pipeline:**
```
REQUEST → TEMPLATE → MODEL → OPTIMIZE → REVIEW → PUBLISH
```

---

### 3. project-planner

**Purpose:** Planning, task breakdown, and methodology

**When to Use:**
- New project initialization
- Complex feature planning
- Architecture decisions

**Skills:**
```
clean-code, plan-writing, brainstorming, architecture
```

**4-Phase Methodology:**
1. ANALYSIS → Research, questions
2. PLANNING → Task breakdown
3. SOLUTIONING → Architecture design
4. IMPLEMENTATION → Code + tests

---

### 4. frontend-specialist

**Purpose:** Web UI/UX development

**When to Use:**
- React/Next.js applications
- Web interfaces
- UI component development

**Skills:**
```
clean-code, frontend-design, testing-patterns, accessibility
```

**Key Rules:**
- No violet/purple colors (Purple Ban)
- No standard template layouts
- Deep design thinking required

---

### 5. backend-specialist

**Purpose:** API, server, and database development

**When to Use:**
- REST/GraphQL API development
- Server-side logic
- Database operations

**Skills:**
```
clean-code, api-patterns, database-design, testing-patterns
```

---

### 6. mobile-developer

**Purpose:** Mobile application development

**When to Use:**
- iOS applications
- Android applications
- React Native / Flutter

**Skills:**
```
clean-code, mobile-design, testing-patterns
```

**Key Rules:**
- Mobile-specific UI patterns
- Platform guidelines (iOS HIG, Material Design)
- Performance optimization for mobile

---

### 7. database-architect

**Purpose:** Database schema design and optimization

**When to Use:**
- Schema design
- Query optimization
- Database migrations

**Skills:**
```
clean-code, database-design, performance-profiling
```

---

### 8. security-auditor

**Purpose:** Security vulnerability analysis

**When to Use:**
- Security audits
- Code review for vulnerabilities
- OWASP compliance checks

**Skills:**
```
clean-code, vulnerability-scanner, security-patterns
```

---

### 9. penetration-tester

**Purpose:** Active security testing

**When to Use:**
- Authorized penetration testing
- CTF challenges
- Security research

**Skills:**
```
clean-code, vulnerability-scanner, security-patterns
```

⚠️ **Authorization Required:** Only for authorized testing contexts

---

### 10. test-engineer

**Purpose:** Testing strategy and implementation

**When to Use:**
- Test suite creation
- Testing strategy design
- CI/CD test integration

**Skills:**
```
clean-code, testing-patterns, webapp-testing
```

**Test Types:**
- Unit tests
- Integration tests
- E2E tests (Playwright)

---

### 11. quality-controller

**Purpose:** Quality gate enforcement

**When to Use:**
- Pre-release quality checks
- Code quality audits
- Standards compliance

**Skills:**
```
clean-code, quality-gate, lint-and-validate
```

**Quality Gates:**
1. Security scan
2. Lint check
3. Schema validation
4. Test coverage
5. UX audit
6. SEO check
7. Performance (Lighthouse)

---

### 12. debugger

**Purpose:** Root cause analysis and bug fixing

**When to Use:**
- Complex bug investigation
- Performance issues
- Crash analysis

**Skills:**
```
clean-code, debugging-patterns, performance-profiling
```

---

### 13. devops-engineer

**Purpose:** CI/CD and deployment

**When to Use:**
- CI/CD pipeline setup
- Deployment configuration
- Infrastructure as code

**Skills:**
```
clean-code, deployment-patterns, monitoring
```

---

### 14. performance-optimizer

**Purpose:** Application speed optimization

**When to Use:**
- Performance bottleneck analysis
- Bundle size optimization
- Core Web Vitals improvement

**Skills:**
```
clean-code, performance-profiling, frontend-design
```

**Targets:**
| Metric | Target |
|--------|--------|
| LCP | < 2.5s |
| INP | < 200ms |
| CLS | < 0.1 |

---

### 15. seo-specialist

**Purpose:** SEO and GEO (Generative Engine Optimization)

**When to Use:**
- SEO audits
- Core Web Vitals optimization
- E-E-A-T content strategy
- AI search visibility (GEO)

**Skills:**
```
clean-code, seo-fundamentals, geo-fundamentals,
seo-advanced, local-seo, technical-seo
```

**SEO vs GEO:**

| Aspect | SEO | GEO |
|--------|-----|-----|
| Goal | Rank #1 in Google | Be cited in AI responses |
| Platform | Google, Bing | ChatGPT, Claude, Perplexity |

---

### 16. documentation-writer

**Purpose:** Technical documentation and code documentation

**When to Use:**
- API documentation (OpenAPI/Swagger)
- README files and user guides
- Code documentation (JSDoc, TSDoc)
- Architecture Decision Records (ADR)
- Changelogs and release notes
- llms.txt for AI discovery

**Skills:**
```
clean-code, documentation-templates, documentation-patterns
```

**Documentation Types:**

| Type | Tool/Format | Use Case |
|------|-------------|----------|
| README | Markdown | Project overview, quick start |
| API Docs | Markdown/OpenAPI | Endpoint documentation |
| Code Docs | JSDoc/TSDoc | Function/class documentation |
| ADR | Markdown | Architecture decisions |
| Changelog | Markdown | Version history |
| llms.txt | Text | AI/LLM discovery |

**Key Principles:**
- Clarity over completeness
- Examples matter (show, don't just tell)
- Keep it updated
- Audience-first writing

---

### 17. game-developer

**Purpose:** Game development

**When to Use:**
- Game logic
- Game engine integration
- Interactive experiences

**Skills:**
```
clean-code, game-patterns
```

---

### 18. explorer-agent

**Purpose:** Codebase discovery and navigation

**When to Use:**
- Understanding new codebases
- Finding specific implementations
- Code architecture exploration

**Skills:**
```
clean-code
```

**Capabilities:**
- File pattern search
- Code search
- Architecture analysis

---

## Agent Invocation

### From CLAUDE.md

Agents are automatically activated based on:
1. Request type classification
2. Project type detection
3. Explicit user request

### Direct Invocation

```
@agent-name command
```

### Orchestrator Invocation

The orchestrator can invoke other agents:

```python
# Example: Security + Performance audit
orchestrator → [security-auditor, performance-optimizer]
              → synthesize results
              → report
```

---

## Agent Selection Guide

| Task | Recommended Agent |
|------|-------------------|
| Build new feature | `project-planner` → `frontend/backend-specialist` |
| Fix bug | `debugger` |
| Security audit | `security-auditor` |
| Performance issue | `performance-optimizer` |
| SEO optimization | `seo-specialist` |
| Content generation | `content-orchestrator` |
| Database design | `database-architect` |
| Deploy | `devops-engineer` |
| Write tests | `test-engineer` |
| Complex multi-domain | `orchestrator` |

---

## Adding New Agents

1. Create `agents/{agent-name}.md`
2. Add frontmatter:
   ```yaml
   ---
   name: agent-name
   description: What this agent does
   tools: Read, Grep, Glob, Bash, Write, Edit
   model: inherit
   skills: clean-code, other-skills
   ---
   ```
3. Define agent rules and behavior
4. Update this file (AGENTS.md)
5. Update ARCHITECTURE.md

---

## See Also

- `ARCHITECTURE.md` - System architecture
- `CODEBASE.md` - File structure
- `skills/` - Available skills
- `scripts/` - Runtime scripts
