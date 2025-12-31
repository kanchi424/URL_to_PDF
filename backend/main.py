from fastapi import FastAPI, HTTPException, BackgroundTasks, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from services.crawler import Crawler
from services.pdf_engine import PdfEngine
import shutil
import os
import uuid
import asyncio
from PyPDF2 import PdfMerger

from fastapi.staticfiles import StaticFiles

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("generated_pdfs", exist_ok=True)
app.mount("/generated_pdfs", StaticFiles(directory="generated_pdfs"), name="pdfs")

class CrawlRequest(BaseModel):
    url: str

jobs = {}

@app.post("/api/crawl")
async def start_crawl(request: CrawlRequest, background_tasks: BackgroundTasks):
    job_id = str(uuid.uuid4())
    jobs[job_id] = {
        "status": "processing",
        "url": request.url,
        "pages": [],
        "pdfs_generated": 0
    }
    
    background_tasks.add_task(process_site, job_id, request.url)
    return {"job_id": job_id}

@app.get("/api/status/{job_id}")
async def get_status(job_id: str):
    if job_id not in jobs:
        raise HTTPException(status_code=404, detail="Job not found")
    return jobs[job_id]

async def process_site(job_id: str, url: str):
    try:
        # 1. Crawl
        crawler = Crawler(url)
        pages = await crawler.crawl()
        jobs[job_id]["pages"] = pages
        jobs[job_id]["total_pages"] = len(pages)
        
        # 2. Generate PDFs
        pdf_engine = PdfEngine(output_dir=f"generated_pdfs/{job_id}")
        
        for i, page in enumerate(pages):
            filename = f"page_{i}.pdf"
            await pdf_engine.generate_pdf(page["url"], filename)
            jobs[job_id]["pdfs_generated"] += 1
            page["pdf_path"] = f"generated_pdfs/{job_id}/{filename}"
        
        # 3. Merge PDFs
        print(f"Starting merge for job {job_id}...")
        try:
            merger = PdfMerger(strict=False)
            files_merged = 0
            for i in range(len(pages)):
                pdf_path = f"generated_pdfs/{job_id}/page_{i}.pdf"
                if os.path.exists(pdf_path):
                    print(f"Appending {pdf_path} to merger")
                    with open(pdf_path, 'rb') as f:
                        merger.append(f)
                    files_merged += 1
                else:
                    print(f"Warning: File not found for merging: {pdf_path}")
            
            if files_merged > 0:
                merged_pdf_path = f"generated_pdfs/{job_id}/merged.pdf"
                with open(merged_pdf_path, 'wb') as f:
                    merger.write(f)
                merger.close()
                jobs[job_id]["merged_pdf_path"] = merged_pdf_path
                print(f"Successfully created merged PDF at {merged_pdf_path}")
            else:
                print(f"No files were available to merge for job {job_id}")
        except Exception as merge_err:
            print(f"Merge failed specifically: {merge_err}")

            # We don't want to fail the whole job just because merge failed, 
            # but we should at least log it.

        
        # 4. Zip
        shutil.make_archive(f"generated_pdfs/{job_id}_all", 'zip', f"generated_pdfs/{job_id}")
        jobs[job_id]["zip_path"] = f"generated_pdfs/{job_id}_all.zip"
        
        jobs[job_id]["status"] = "completed"
        
    except Exception as e:
        print(f"Job failed: {e}")
        jobs[job_id]["status"] = "failed"
        jobs[job_id]["error"] = str(e)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
