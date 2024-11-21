from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.responses import RedirectResponse

from src.base import async_session_maker
from src.file_tasks import process_expired_benefits, create_super_user
from src.statistics.router import router as test_router
from src.users.router import router as user_router
from src.benefits.router import router as benefits_router

app = FastAPI()
scheduler = AsyncIOScheduler()

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

@scheduler.scheduled_job(CronTrigger(hour=0, minute=1))
async def scheduled_task():
    async with async_session_maker() as session:
        await process_expired_benefits(session)

async def create_admin():
    async with async_session_maker() as session:
        await create_super_user(session)

@app.on_event("startup")
async def startup_event():
    await create_admin()
    scheduler.start()


@app.on_event("shutdown")
async def shutdown_event():
    scheduler.shutdown()

@app.get('/')
async def root():
    return RedirectResponse(url='/docs')


app.include_router(user_router)
app.include_router(benefits_router)
app.include_router(test_router)
