FROM python:3.12-slim

WORKDIR /app

# Install uv
RUN pip install uv

# Copy dependency manifests (lockfile included for reproducible installs)
COPY pyproject.toml uv.lock ./

# Create venv and install the exact locked dependencies
RUN uv venv && \
    . .venv/bin/activate && \
    uv sync --frozen

COPY ./app ./app

# Use shell form to activate venv and run uvicorn
CMD . .venv/bin/activate && uvicorn app.main:app --host 0.0.0.0 --port 8000 