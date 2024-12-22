FROM python:3.12-slim

WORKDIR /app

# Install uv
RUN pip install uv

# Copy pyproject.toml
COPY pyproject.toml .

# Create venv and install dependencies
RUN uv venv && \
    . .venv/bin/activate && \
    uv sync

COPY ./app ./app

# Use shell form to activate venv and run uvicorn
CMD . .venv/bin/activate && uvicorn app.main:app --host 0.0.0.0 --port 8000 