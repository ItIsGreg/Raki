# Raki
Raki is a platform to extract structured information from medical reports of intervention and diagnostic procedures.

## Development Setup

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

1. Run the app:

For web development mode:
```bash
yarn dev
```

For desktop development mode:
```bash
yarn tauri dev
```

### Backend Setup

1. Navigate to the backend directory:
```bash
cd projects/llm_backend
```

2. Create a virtual environment:

For Windows:
```bash
python -m venv venv
.\venv\Scripts\activate
```

For macOS/Linux:
```bash
python3 -m venv venv
source venv/bin/activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Run the development server:
```bash
uvicorn app.main:app --reload --port 8000
```

## Building for Production

### Backend Build

1. Navigate to the backend app directory:
```bash
cd projects/llm_backend/app
```

2. Create executable:
```bash
pyinstaller -F main.py --clean --hidden-import=pydantic --hidden-import=pydantic-core --hidden-import=pydantic.deprecated.decorator
```

3. Append OS-specific suffix to the executable in `dist/` directory:
- Linux: `-x86_64-unknown-linux-gnu`
- macOS: `-aarch64-apple-darwin`
- Windows: `-x86_64-pc-windows-msvc`

### Frontend Build

1. Navigate to the frontend directory:
```bash
cd projects/frontend
```

2. Build the desktop application:
```bash
yarn tauri build
```

The bundled application will be available in `src-tauri/target/bundle`

## Development Resources

Excalidraw:
[https://excalidraw.com/#json=yQBFTY2Es-D9PvV2uUigK,-VK_8ZYhWF8_FpJjFTOC6A](https://excalidraw.com/#room=13970e40647ab9ff4574,zjdjVMs0e0rIZinKMYXIFg)
