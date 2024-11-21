import hashlib

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import Depends, HTTPException, status

from src.base import get_async_session
from src.users.auth.shemas import UserRegister, UserAuthorization
from src.users.models import UsersORM, UserProfilesORM


async def check_conflict_user(userData, session):
    query = select(UsersORM).where(UsersORM.email == userData.email)
    if (await session.execute(query)).scalar():
        raise HTTPException(status_code=409, detail="User already exists")


async def register_user_db(userData: UserRegister, session: AsyncSession = Depends(get_async_session)):
    await check_conflict_user(userData, session)
    hash_password = hashlib.sha256(userData.password.encode('utf-8')).hexdigest()
    userOrm = UsersORM(email=userData.email, hash_password=hash_password)
    session.add(userOrm)
    await session.flush()
    userProfile = UserProfilesORM(user_uuid=userOrm.uuid,
                                  firstname=userData.firstname,
                                  lastname=userData.lastname,
                                  middlename=userData.middlename,
                                  )
    session.add(userProfile)
    await session.commit()

    return userOrm

async def find_auth_user(user_Auth: UserAuthorization, session: AsyncSession = Depends(get_async_session)):
    query = select(UsersORM).where(user_Auth.email == UsersORM.email)
    user = (await session.execute(query)).scalar()

    enter_hash_password = hashlib.sha256(user_Auth.password.encode('utf-8')).hexdigest()

    if not user or enter_hash_password != user.hash_password:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='email or password wrong')
    return user