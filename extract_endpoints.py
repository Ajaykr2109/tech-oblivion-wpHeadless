import os
import re
from pathlib import Path

# Read all API documentation files
api_docs_dir = Path('docs/wp_api')
endpoints = []

for md_file in api_docs_dir.glob('*.md'):
    if md_file.name == 'README.md':
        continue

    with open(md_file, 'r', encoding='utf-8') as f:
        content = f.read()

    # Extract namespace from filename
    namespace = md_file.stem

    # Find all endpoint definitions
    endpoint_pattern = r'^##\s+`([^`]+)`'
    matches = re.findall(endpoint_pattern, content, re.MULTILINE)

    for endpoint in matches:
        if endpoint != namespace:  # Skip namespace headers
            endpoints.append(f'{namespace}: {endpoint}')

# Sort and display all endpoints
for ep in sorted(endpoints):
    print(ep)
