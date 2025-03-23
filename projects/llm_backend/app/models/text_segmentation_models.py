from pydantic import BaseModel

class PDFExtractionReq(BaseModel):
    # Add any configuration parameters you need, for example:
    include_images: bool = False
    preserve_formatting: bool = True 