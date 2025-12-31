import aiohttp
from bs4 import BeautifulSoup
from urllib.parse import urlparse, urljoin
import asyncio
from typing import Set, List, Dict

class Crawler:
    def __init__(self, start_url: str):
        self.start_url = start_url
        self.domain = urlparse(start_url).netloc
        self.visited: Set[str] = set()
        self.pages: List[Dict] = []
        self.semaphore = asyncio.Semaphore(10)  # Limit concurrent requests

    async def crawl(self):
        to_visit = [self.start_url]
        self.visited.add(self.start_url)
        
        while to_visit:
            current_batch = to_visit[:20] # Process in batches
            to_visit = to_visit[20:]
            
            tasks = [self._process_url(url) for url in current_batch]
            results = await asyncio.gather(*tasks)
            
            for new_links in results:
                for link in new_links:
                    if link not in self.visited:
                        self.visited.add(link)
                        to_visit.append(link)
        
        return self.pages

    async def _process_url(self, url: str) -> Set[str]:
        async with self.semaphore:
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
            }
            try:
                async with aiohttp.ClientSession(headers=headers) as session:
                    async with session.get(url, timeout=10, allow_redirects=True) as response:
                        if response.status != 200:
                            print(f"Failed to crawl {url}: Status {response.status}")
                            return set()
                        
                        html = await response.text()
                        soup = BeautifulSoup(html, 'html.parser')
                        
                        # Store page info
                        self.pages.append({
                            "url": url,
                            "title": soup.title.string if soup.title else url,
                            "has_video": self._has_video(soup)
                        })

                        # Extract links
                        links = set()
                        for a in soup.find_all('a', href=True):
                            href = a['href']
                            full_url = urljoin(url, href)
                            parsed = urlparse(full_url)
                            
                            if parsed.netloc == self.domain and parsed.scheme in ['http', 'https']:
                                links.add(full_url)
                        
                        return links
            except Exception as e:
                print(f"Error crawling {url}: {e}")
                return set()

    def _has_video(self, soup: BeautifulSoup) -> bool:
        if soup.find('video'):
            return True
        
        iframes = soup.find_all('iframe')
        for iframe in iframes:
            src = iframe.get('src', '').lower()
            if 'youtube' in src or 'vimeo' in src or 'dailymotion' in src or 'facebook' in src or 'instagram' in src or 'twitter' in src or 'tiktok' in src:
                return True
                
        return False
