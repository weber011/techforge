# Complete HealthGrid Upgrades
import os

BASE_DIRS = ['.', 'healthgrid-web']

def write_file(rel_path, content):
    for base in BASE_DIRS:
        full = os.path.join(base, rel_path)
        os.makedirs(os.path.dirname(full), exist_ok=True)
        with open(full, 'w', encoding='utf-8') as f:
            f.write(content)
        print('Wrote:', full)

print('make_all ready')
