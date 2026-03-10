from app.main import app
for r in app.routes:
    if hasattr(r, 'path'): print("ROUTE PATH:", r.path)
    else: print("MOUNT PATH:", r.path)
