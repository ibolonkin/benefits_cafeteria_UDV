#FROM python:3.12.1
#
#WORKDIR /app
#
#COPY requirements.txt requirements.txt
#
#RUN pip install -r requirements.txt
#
#COPY . .
#
#CMD ["sh", "-c", "alembic upgrade head && uvicorn src.main:app --host 0.0.0.0 --port 8000"]

version: "3.2"
services:
  redis:
    image: "redis:alpine"
    command: redis-server
    ports:
      - "6379:6379"
    volumes:
      - $PWD/redis-data:/var/lib/redis
      - $PWD/r.conf:/usr/local/etc/redis/r.conf
    environment:
      - REDIS_REPLICATION_MODE=master