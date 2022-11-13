from fastapi import FastAPI
from api_module import *
from helpers import *
from fastapi import FastAPI, UploadFile, File, Response
from PIL import Image
import numpy as np
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import io
import pandas as pd
import subprocess
from fastapi import FastAPI, Request
from starlette.responses import RedirectResponse
from pydantic import BaseModel

class Payload(BaseModel):
    csv: str

app = FastAPI()
model = Searching()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/text")
async def read_item(
    text_query: str,
    topk: int = 20,
    object_filter: str = "",
    voice_filter: str = "",
    color_filter: str = "",
    swap_top: str = "",
):
    images, paths, csv = model.search(
        text_query=text_query,
        top_k=int(topk),
        objects_filter_text=object_filter,
        voice_filter_text=voice_filter,
        color_filter=color_filter,
        swap_top=swap_top,
    )

    return {"paths": paths, "csv": csv}


@app.post("/image")
async def read_item(
    file: UploadFile = File(...),
    topk: int = 20,
    object_filter: str = "",
    voice_filter: str = "",
    color_filter: str = "",
    swap_top: str = "",
):
    image_query = convert_image(await file.read())
    images, paths, csv = model.search(
        image_query=image_query,
        top_k=int(topk),
        objects_filter_text=object_filter,
        voice_filter_text=voice_filter,
        color_filter=color_filter,
        swap_top=swap_top,
    )

    return {"paths": paths, "csv": csv}


@app.get("/stream/{_:path}")
async def show_image(path: str):
    try:
        image = Image.open(r"{}".format(path))
        buf = BytesIO()
        image.save(buf, format="JPEG")

        return Response(content=buf.getvalue(), media_type="image/jpg")
    except Exception as e:
        print(e)
        return "Error when stream image: {}".format(path)


@app.get("/explore/{_:path}")
def open_folder(path: str = ""):
    path = path[:-11] #chỗ này không cố định, cần kiểm tra xóa cái đuôi ảnh ra
    print("path", path)
    try:
        os.startfile(path)
        return {"status": "sucess"}
    except Exception as e:
        print(e)
        subprocess.Popen(["xdg-open", path])
        return {"status": "sucess1"}

@app.get("/ytb/{_:path}")
def redirect_link(path: str):
    # path: <tên video>/<Keyframe ID>.jpg Ví dụ: C00_V0135/029928.jpg
    video_name = path.split("/")[0]
    link_path = f'{META_LINK}/{video_name}.json'
    f = open(link_path, encoding="utf8")
    data = json.load(f)
    url = data['watch_url']
    print(url)
    return RedirectResponse(url)



@app.post("/map")
def csv_mapping(payload: Payload):
    TESTDATA = payload.csv
    df = reverse_to_csv(TESTDATA)
    map_df = map_keyframe(df)
    csv = map_df.to_csv(header=False, index=False).encode('utf-8')
    return {"csv": csv}