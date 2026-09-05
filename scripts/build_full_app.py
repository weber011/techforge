import os
import json

BASE_DIRS = ['.', 'healthgrid-web']

def write_file(rel_path, content):
    for base in BASE_DIRS:
        full_path = os.path.join(base, rel_path)
        os.makedirs(os.path.dirname(full_path), exist_ok=True)
        with open(full_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f'Wrote {full_path}')

print('Writer utility ready')
