import hashlib
from datetime import datetime, timedelta
import random
from email.message import EmailMessage

import aiosmtplib
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import Depends, HTTPException, status, BackgroundTasks

from src.config import settings
from src.base import get_async_session
from src.handler import get_user_uuid
from src.users.auth.shemas import UserRegister, UserAuthorization
from src.users.models import UsersORM, UserProfilesORM, UserCodes
from src.utils import get_active_payload


async def check_conflict_user(userData, session):
    query = select(UsersORM).where(UsersORM.email == userData.email)
    if (await session.execute(query)).scalar():
        raise HTTPException(status_code=409, detail="User already exists")


async def register_user_db(userData: UserRegister, background_tasks: BackgroundTasks,
                           session: AsyncSession = Depends(get_async_session), ):
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

    verification_code = "".join(random.choices("0123456789", k=5))

    userCode = UserCodes(
        user_uuid=userOrm.uuid,
        verification_code=verification_code,
        verification_code_expiration=datetime.now() + timedelta(hours=1),
    )
    session.add(userCode)

    await session.commit()
    background_tasks.add_task(send_email, userData.email, "Подтверждение регистрации на сайте",
                              verification_code)
    return userOrm


async def find_auth_user(user_Auth: UserAuthorization, session: AsyncSession = Depends(get_async_session)):
    query = select(UsersORM).where(user_Auth.email == UsersORM.email)
    user = (await session.execute(query)).scalar()

    enter_hash_password = hashlib.sha256(user_Auth.password.encode('utf-8')).hexdigest()

    if not user or enter_hash_password != user.hash_password:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='email or password wrong')
    return user


async def send_email(recipient_email: str, subject: str, body: str):
    message = EmailMessage()
    message["From"] = settings.EMAIL_HOST
    message["To"] = recipient_email
    message["Subject"] = subject
    message.set_content(body)

    try:
        await aiosmtplib.send(
            message,
            hostname="smtp.mail.ru",
            port=465,
            username=settings.EMAIL_HOST,
            password=settings.EMAIL_HOST_PASSWORD,
            use_tls=True,
        )
        print("Email sent successfully")
    except Exception as e:
        print(f"Failed to send email: {e}")


async def send_mail_again(background_tasks: BackgroundTasks,
                          user=Depends(get_active_payload),
                          session: AsyncSession = Depends(get_async_session)):
    user = await session.get(UsersORM, user.uuid)
    if user.is_verified:
        raise HTTPException(status_code=400, detail="Verify")
    verification_code = "".join(random.choices("0123456789", k=5))
    if userCode := (await session.get(UserCodes, user.uuid)):
        userCode.verification_code = verification_code
        userCode.verification_code_expiration = datetime.now() + timedelta(hours=1)
    else:
        userCode = UserCodes(
            user_uuid=user.uuid,
            verification_code=verification_code,
            verification_code_expiration=datetime.now() + timedelta(hours=1),
        )
        session.add(userCode)

    background_tasks.add_task(send_email, user.email, "Подтверждение регистрации на сайте",
                              verification_code)
    await session.commit()

    return {'details': 'ok'}

class VerifyCode(BaseModel):
    user_code: str

async def verify_mail_db(verifyCode: VerifyCode,
                         user=Depends(get_active_payload),
                         session=Depends(get_async_session)):
    user_inf = await get_user_uuid(user.uuid, session)
    if user_inf.is_verified:
        raise HTTPException(status_code=400, detail="Verify")

    userCode = (await session.get(UserCodes, user.uuid))
    if userCode.verification_code == verifyCode.user_code and userCode.verification_code_expiration >= datetime.now():
        userCode.verification_code = None
        userCode.verification_code_expiration = None
        user_inf.is_verified = True
        await session.commit()
        return user_inf

    raise HTTPException(status_code=400, detail='verification code expired')
