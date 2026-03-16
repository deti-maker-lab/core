from fastapi import FastAPI

app = FastAPI(title="DETI Maker Lab API", version="1.0")

@app.get("/")
def read_root():
    return {"message": "Hello World"}
