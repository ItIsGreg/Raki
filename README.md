# Raki
Raki is a platform to extract structured information from medical reports of intervention and diagnostic procedures.

## Setup

### Option 1: Using Docker (Recommended)

1. Make sure you have Docker and Docker Compose installed on your system.

2. Start the application:
```bash
docker-compose up
```

This will start both the backend service (on port 8000) and the frontend service (on port 3000).

### Option 2: Manual Setup

#### Backend Build (Required First)

Make sure you have Python 3.12+ installed.

1. Install uv:
```bash
pip install uv
```

2. Navigate to the backend directory:
```bash
cd projects/llm_backend/
```

3. Create a virtual environment and install dependencies:
```bash
uv venv
. .venv/bin/activate  # For Unix-like systems
# or
.\.venv\Scripts\activate  # For Windows
uv sync
```

4. Navigate to the backend app directory:
```bash
cd app
```

3. Create executable:
```bash
pyinstaller -F main.py --clean --hidden-import=pydantic --hidden-import=pydantic-core --hidden-import=pydantic.deprecated.decorator
```

4. Append OS-specific suffix to the executable in `dist/` directory:
- Linux: `-x86_64-unknown-linux-gnu`
- macOS: `-aarch64-apple-darwin`
- Windows: `-x86_64-pc-windows-msvc`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd projects/frontend
```

2. Install dependencies:
```bash
yarn
```

3. Install Rust
Make sure you have Rust installed on your system. You can install it from [https://www.rust-lang.org/tools/install](https://www.rust-lang.org/tools/install)

4. Run the app:

For web development mode:
```bash
yarn dev
```

For desktop development mode:
```bash
yarn tauri dev
```

### Backend Development Server (Optional)

1. Navigate to the backend directory:
```bash
cd projects/llm_backend
```

2. Create a virtual environment and install dependencies:
```bash
uv venv
. .venv/bin/activate  # For Unix-like systems
# or
.\.venv\Scripts\activate  # For Windows
uv sync
```

3. Run the development server:
```bash
uvicorn app.main:app --reload --port 8000
```

## Building for Production

1. First build the backend executable (if not already done):
```bash
cd projects/llm_backend/app
pyinstaller -F main.py --clean --hidden-import=pydantic --hidden-import=pydantic-core --hidden-import=pydantic.deprecated.decorator
```
Don't forget to append the OS-specific suffix to the executable in `dist/` directory.

2. Build the desktop application:
```bash
cd projects/frontend
yarn tauri build
```

The bundled application will be available in `src-tauri/target/bundle`
