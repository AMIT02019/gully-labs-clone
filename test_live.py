import urllib.request
import re
import sys
from bs4 import BeautifulSoup

sys.stdout.reconfigure(encoding='utf-8')

URL = "https://gully-labs-hand-lasted-indian-sneak.vercel.app"
print(f"Testing live website: {URL}")

req = urllib.request.Request(URL, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})
try:
    with urllib.request.urlopen(req) as response:
        status = response.status
        content_type = response.headers.get('Content-Type')
        html_bytes = response.read()
        html = html_bytes.decode('utf-8', errors='ignore')
        print(f"✓ Root page HTTP Status: {status}")
        print(f"✓ Content-Type: {content_type}")
        print(f"✓ Content Length: {len(html_bytes):,} bytes ({len(html_bytes)/(1024*1024):.2f} MB)")
except Exception as e:
    print(f"✗ Failed to fetch root: {e}")
    sys.exit(1)

soup = BeautifulSoup(html, 'html.parser')

print("\n--- 1. TITLE & META ---")
print("Title:", soup.title.string if soup.title else "None")

print("\n--- 2. CSS STYLESHEETS CHECK ---")
css_links = [link.get('href') for link in soup.find_all('link', rel=lambda r: r and 'stylesheet' in r)]
for href in css_links:
    full_url = href if href.startswith('http') else f"{URL.rstrip('/')}/{href.lstrip('/')}"
    try:
        r = urllib.request.Request(full_url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(r) as resp:
            data = resp.read()
            print(f"✓ Stylesheet {href}: Status {resp.status}, Size {len(data):,} bytes")
    except Exception as e:
        print(f"✗ Stylesheet {href} failed: {e}")

print("\n--- 3. JAVASCRIPT ASSETS CHECK ---")
js_scripts = [s.get('src') for s in soup.find_all('script') if s.get('src')]
for src in js_scripts:
    full_url = src if src.startswith('http') else f"{URL.rstrip('/')}/{src.lstrip('/')}"
    try:
        r = urllib.request.Request(full_url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(r) as resp:
            data = resp.read()
            print(f"✓ Script {src}: Status {resp.status}, Size {len(data):,} bytes")
    except Exception as e:
        print(f"✗ Script {src} failed: {e}")

print("\n--- 4. IMAGES SAMPLE VERIFICATION ---")
img_srcs = [img.get('src') for img in soup.find_all('img') if img.get('src')]
print(f"Total img tags: {len(img_srcs)}")

# Check distinct local assets
local_imgs = sorted(list(set([src for src in img_srcs if 'assets/images' in src])))
print(f"Distinct local assets referenced: {len(local_imgs)}")

checked = 0
failed = 0
for src in local_imgs[:15]:
    full_url = f"{URL.rstrip('/')}/{src.lstrip('/')}"
    try:
        r = urllib.request.Request(full_url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(r) as resp:
            if resp.status == 200:
                checked += 1
            else:
                print(f"✗ Image {src} returned {resp.status}")
                failed += 1
    except Exception as e:
        print(f"✗ Image {src} failed: {e}")
        failed += 1

print(f"Sample images checked: {checked} passed, {failed} failed.")

print("\n--- 5. DOM SECTIONS CHECK ---")
sections = soup.find_all(class_=re.compile(r'shopify-section'))
print(f"Total shopify sections rendered: {len(sections)}")
for s in sections[:8]:
    h = s.find(['h1', 'h2', 'h3', 'h4'])
    h_text = h.get_text(strip=True) if h else ""
    print(f"  - Section ID: {s.get('id', '')[:45]} | Heading: {h_text}")

