from typing import BinaryIO
import fitz  # pymupdf
import pymupdf4llm


async def extract_pdf_to_markdown_service(
    pdf_file: BinaryIO,
):
    """
    Service to extract markdown content from a PDF file using pymupdf4llm.
    
    Args:
        req: PDFExtractionReq object containing any configuration parameters
        pdf_file: The uploaded PDF file as a binary stream
    
    Returns:
        str: Extracted markdown text from the PDF
    """
    # Open the PDF document from the binary stream
    doc = fitz.open(stream=pdf_file.read(), filetype="pdf")
    
    # Process each page
    md_content = pymupdf4llm.to_markdown(doc)
    return md_content
