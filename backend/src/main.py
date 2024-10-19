from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.responses import RedirectResponse

from .users.router import router as user_router
from .benefits.router import router as benefits_router


app = FastAPI()

origins = [
    "http://26.25.133.178:3000",
    "https://26.25.133.178:3000",
    "http://26.25.133.178",
    "https://26.25.133.178",
    "http://localhost:8000",
    "http://localhost:3000",
    "http://localhost",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get('/')
async def root():
    return RedirectResponse(url='/docs')


app.include_router(user_router)
app.include_router(benefits_router)
