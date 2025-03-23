from fastapi import APIRouter, UploadFile, File
from app.services.text_segmentation.pdf_extraction import extract_pdf_to_markdown_service

router = APIRouter()

@router.post("/extract-pdf")
async def extract_pdf(
    file: UploadFile = File(...),
):
    """
    Extract markdown content from a PDF file.
    
    Args:
        file: Uploaded PDF file
        
    Returns:
        dict: Contains the extracted markdown text
    """
    markdown_content = await extract_pdf_to_markdown_service(file.file)
    return {"markdown": markdown_content}
