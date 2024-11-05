from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from starlette.responses import RedirectResponse
from .users.router import router as user_router
from .benefits.router import router as benefits_router

app = FastAPI(
)

origins = [
    "http://26.25.133.178:3000",
    "https://26.25.133.178:3000",
    "http://26.25.133.178",
    "https://26.25.133.178",
    "http://localhost:8000",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    

    "http://192.168.65.1:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# @app.on_event("startup")
# async def startup(startup=Depends(create_super_user)):
#     startup = None
#     pass


@app.get('/')
async def root():
    return RedirectResponse(url='/docs')


app.include_router(user_router)
app.include_router(benefits_router)
