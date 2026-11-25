FROM python:3.12-slim
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
WORKDIR /app
RUN pip install --no-cache-dir uv
COPY pyproject.toml ./
COPY app ./app
RUN uv pip install --system --no-cache .
RUN useradd -u 10001 -m app
USER app
EXPOSE 8000
# Proses worker: ganti CMD menjadi ["python", "-m", "app.worker"]
CMD ["uvicorn", "app.main:_default_app", "--factory", "--host", "0.0.0.0", "--port", "8000"]
