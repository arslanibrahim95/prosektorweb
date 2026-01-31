# CMS Integration

> Guides for integrating with various content management systems.

---

## 1. WordPress

### REST API

```python
import requests

# Authentication
auth = ('username', 'application_password')
base_url = 'https://yoursite.com/wp-json/wp/v2'

# Create post
post_data = {
    'title': 'Post Title',
    'content': '<p>Post content here</p>',
    'status': 'publish',  # or 'draft'
    'categories': [1, 2],
    'tags': [3, 4],
    'meta': {
        'description': 'Meta description'
    }
}

response = requests.post(
    f'{base_url}/posts',
    auth=auth,
    json=post_data
)
```

### WP-CLI

```bash
# Create post
wp post create --post_title="Title" --post_content="Content" --post_status="publish"

# Update post
wp post update 123 --post_title="New Title"

# List posts
wp post list --post_type=post --format=json
```

---

## 2. Contentful

### Management API

```javascript
const contentful = require('contentful-management');

const client = contentful.createClient({
  accessToken: 'MANAGEMENT_TOKEN'
});

async function publishContent() {
  const space = await client.getSpace('SPACE_ID');
  const environment = await space.getEnvironment('master');

  // Create entry
  const entry = await environment.createEntry('blogPost', {
    fields: {
      title: { 'en-US': 'Post Title' },
      body: { 'en-US': 'Post content...' },
      slug: { 'en-US': 'post-slug' }
    }
  });

  // Publish
  await entry.publish();
}
```

### Content Model

```json
{
  "name": "Blog Post",
  "fields": [
    { "id": "title", "type": "Symbol", "required": true },
    { "id": "slug", "type": "Symbol", "required": true },
    { "id": "body", "type": "RichText" },
    { "id": "author", "type": "Link", "linkType": "Entry" },
    { "id": "publishDate", "type": "Date" }
  ]
}
```

---

## 3. Sanity

### Client SDK

```javascript
import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'your-project-id',
  dataset: 'production',
  token: 'your-write-token',
  useCdn: false
});

// Create document
const doc = {
  _type: 'post',
  title: 'Post Title',
  slug: { current: 'post-slug' },
  body: [
    {
      _type: 'block',
      children: [{ _type: 'span', text: 'Content...' }]
    }
  ]
};

const result = await client.create(doc);

// Publish (Sanity auto-publishes on create)
console.log(`Created: ${result._id}`);
```

### Schema

```javascript
// schemas/post.js
export default {
  name: 'post',
  title: 'Post',
  type: 'document',
  fields: [
    { name: 'title', type: 'string' },
    { name: 'slug', type: 'slug', options: { source: 'title' } },
    { name: 'body', type: 'blockContent' },
    { name: 'publishedAt', type: 'datetime' }
  ]
};
```

---

## 4. Strapi

### REST API

```python
import requests

base_url = 'http://localhost:1337/api'
headers = {
    'Authorization': f'Bearer {jwt_token}',
    'Content-Type': 'application/json'
}

# Create article
article_data = {
    'data': {
        'title': 'Post Title',
        'content': 'Post content...',
        'slug': 'post-slug',
        'publishedAt': '2024-01-15T10:00:00.000Z'
    }
}

response = requests.post(
    f'{base_url}/articles',
    headers=headers,
    json=article_data
)
```

### GraphQL

```graphql
mutation CreateArticle($data: ArticleInput!) {
  createArticle(data: $data) {
    data {
      id
      attributes {
        title
        slug
        publishedAt
      }
    }
  }
}
```

---

## 5. MDX (Static Sites)

### File-Based Publishing

```markdown
---
title: "Post Title"
date: "2024-01-15"
description: "Meta description"
author: "Author Name"
tags: ["tag1", "tag2"]
---

# Post Title

Content goes here with MDX support.

<CustomComponent />

Regular markdown also works.
```

### Automated Publishing

```python
import os
from datetime import datetime

def publish_mdx(title, content, metadata):
    slug = title.lower().replace(' ', '-')
    filename = f"{datetime.now().strftime('%Y-%m-%d')}-{slug}.mdx"

    frontmatter = "---\n"
    for key, value in metadata.items():
        frontmatter += f"{key}: {value}\n"
    frontmatter += "---\n\n"

    filepath = f"content/posts/{filename}"
    with open(filepath, 'w') as f:
        f.write(frontmatter + content)

    return filepath
```

---

## 6. Common Integration Patterns

### Webhook Flow

```
Content Created → Webhook → Build Trigger → Deploy
                         → Notify Team
                         → Update Search Index
```

### API Authentication

| CMS | Auth Method |
|-----|-------------|
| WordPress | Application passwords, JWT |
| Contentful | Management token |
| Sanity | Project token |
| Strapi | JWT |

### Error Handling

```python
def publish_with_retry(publish_func, max_retries=3):
    for attempt in range(max_retries):
        try:
            return publish_func()
        except Exception as e:
            if attempt == max_retries - 1:
                raise
            time.sleep(2 ** attempt)  # Exponential backoff
```

---

## 7. Multi-CMS Strategy

### Content Hub Pattern

```
Central Content Repository
         │
    ┌────┴────┐
    │         │
    v         v
 WordPress  Sanity
 (Blog)     (Docs)
```

### Syndication

- Primary publish location
- Automated cross-posting
- Canonical URL management
- Content differentiation per platform

---

> **Principle:** Treat your CMS as an API. Automate everything that can be automated.
