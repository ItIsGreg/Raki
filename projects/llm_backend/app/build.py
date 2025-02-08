import os
import platform
import shutil
import subprocess
from pathlib import Path

def get_target_name():
    system = platform.system().lower()
    machine = platform.machine().lower()
    
    if system == "linux":
        return f"main-x86_64-unknown-linux-gnu"
    elif system == "windows":
        return f"main-x86_64-pc-windows-msvc.exe"
    elif system == "darwin":  # macOS
        # On Mac we create both architectures
        return [f"main-x86_64-apple-darwin", f"main-aarch64-apple-darwin"]
    else:
        raise ValueError(f"Unsupported platform: {system}")

def build_and_rename():
    # Change to the app directory
    app_dir = Path(__file__).parent
    os.chdir(app_dir)
    
    # Build with PyInstaller
    subprocess.run([
        "pyinstaller",
        "-F",
        "main.py",
        "--clean",
        "--hidden-import=pydantic",
        "--hidden-import=pydantic-core",
        "--hidden-import=pydantic.deprecated.decorator"
    ], check=True)
    
    # Get the source file (platform dependent)
    source = "dist/main.exe" if platform.system().lower() == "windows" else "dist/main"
    
    # Get target name(s)
    targets = get_target_name()
    if not isinstance(targets, list):
        targets = [targets]
    
    # Create copies with appropriate names
    for target in targets:
        target_path = Path("dist") / target
        shutil.copy2(source, target_path)
        print(f"Created {target_path}")

if __name__ == "__main__":
    build_and_rename() 