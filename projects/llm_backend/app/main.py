import multiprocessing
from fastapi import APIRouter, FastAPI, Request, status
from fastapi.encoders import jsonable_encoder
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
import uvicorn
from starlette.middleware.cors import CORSMiddleware

from app.routers.datapoint_extraction import substrings, values, pipeline, profile_chat
from app.routers.text_segmentation import pdf_extraction, profile_chat as text_segmentation_profile_chat, segments
from app.routers.auth import router as auth_router
from app.lib.db import init_db, close_db

app = FastAPI()

router = APIRouter()


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    print("validation_exception_handler")
    print(exc.errors())
    print(exc.body)
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content=jsonable_encoder({"detail": exc.errors(), "body": exc.body}),
    )


router.include_router(
    substrings.router,
    tags=["substrings"],
    prefix="/datapoint-extraction/substrings",
)
router.include_router(
    values.router,
    tags=["values"],
    prefix="/datapoint-extraction/values",
)
router.include_router(
    pipeline.router,
    tags=["pipeline"],
    prefix="/datapoint-extraction/pipeline",
)
router.include_router(
    profile_chat.router,
    tags=["profile_chat"],
    prefix="/datapoint-extraction",
)
router.include_router(
    pdf_extraction.router,
    tags=["pdf_extraction"],
    prefix="/text-segmentation",
)
router.include_router(
    text_segmentation_profile_chat.router,
    tags=["text_segmentation_profile_chat"],
    prefix="/text-segmentation",
)
router.include_router(
    segments.router,
    tags=["segments"],
    prefix="/text-segmentation",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Include routers
app.include_router(router)
app.include_router(auth_router)

@app.on_event("startup")
async def startup_event():
    """Initialize MongoDB on startup."""
    await init_db()

@app.on_event("shutdown")
async def shutdown_event():
    """Close MongoDB connection on shutdown."""
    await close_db()

if __name__ == "__main__":
    multiprocessing.freeze_support()  # For Windows support
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=False, workers=1)
