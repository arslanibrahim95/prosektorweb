#!/usr/bin/env python3
"""Merge all blog sources into single file"""
import json
import os

# Load main blog file (364 posts)
with open('/Users/ibrahimarslan/Desktop/osgb/blog-backup/blog-posts-364.json', 'r') as f:
    main_data = json.load(f)

main_posts = main_data['posts']
categories = main_data['categories']

# Get existing slugs
existing_slugs = set(p['slug'] for p in main_posts)

# Load blog-queue files (60 posts) and merge unique ones
queue_dir = '/Users/ibrahimarslan/Desktop/osgb/blog-backup/blog-queue'
new_posts = []

for filename in os.listdir(queue_dir):
    if filename.endswith('.json'):
        with open(os.path.join(queue_dir, filename), 'r') as f:
            post = json.load(f)
            if post['slug'] not in existing_slugs:
                new_posts.append(post)
                existing_slugs.add(post['slug'])

# Merge
all_posts = main_posts + new_posts

# Create final consolidated file
final_data = {
    'posts': all_posts,
    'categories': categories,
    'meta': {
        'total_posts': len(all_posts),
        'from_main': len(main_posts),
        'from_queue': len(new_posts),
        'generated_at': '2026-01-16'
    }
}

# Save
output_path = '/Users/ibrahimarslan/Desktop/osgb/blog-backup/all-blogs-consolidated.json'
with open(output_path, 'w', encoding='utf-8') as f:
    json.dump(final_data, f, ensure_ascii=False, indent=2)

print(f"✅ Consolidated blog file created!")
print(f"   📁 Path: {output_path}")
print(f"   📝 Total posts: {len(all_posts)}")
print(f"   📊 From main: {len(main_posts)}")
print(f"   📊 From queue: {len(new_posts)}")
print(f"   📁 Categories: {len(categories)}")
