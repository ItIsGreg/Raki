from fastapi import APIRouter, FastAPI, Request, status
from fastapi.encoders import jsonable_encoder
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from starlette.middleware.cors import CORSMiddleware

from app.routers import substrings, values, pipeline, profile_chat

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
    prefix="/substrings",
)
router.include_router(
    values.router,
    tags=["values"],
    prefix="/values",
)
router.include_router(
    pipeline.router,
    tags=["pipeline"],
    prefix="/pipeline",
)
router.include_router(
    profile_chat.router,
    tags=["profile_chat"],
    prefix="/profile-chat",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)
