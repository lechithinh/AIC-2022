import os
import numpy as np
from tqdm import tqdm
import torch
import clip
from typing import List, Tuple
import pandas as pd
from scipy.spatial.distance import cityblock
from sklearn.metrics.pairwise import cosine_similarity
from IPython.display import clear_output, Markdown, display
import ipywidgets as widgets
from ipywidgets import interact, interact_manual
import json
import unidecode
import PIL.Image
from PIL import ImageTk, Image
from bisect import bisect_left
import matplotlib.pyplot as plt

from helpers import *
from path import *

# config paths
# IMAGE_KEYFRAME_PATH = r"C:\Users\thinhlc\Documents\KeyFrames"
# VISUAL_FEATURES_PATH = r"C:\Users\thinhlc\Documents\CLIPFeatures"
# KEYFRAME_P_PATH = r'C:\Users\thinhlc\Documents\Keyframe_P\keyframe_p'
# META_LINK = r'C:\Users\thinhlc\Documents\Metadata'

# config files
# JSON_KEYFRAME_FILES = r'C:\Users\thinhlc\Documents\aic_api\keyframe_files.json'
# JSON_TRANSCIPRTS = r'C:\Users\thinhlc\Documents\aic_api\transcripts.json'
# JSON_OBJECTS = r'C:\Users\thinhlc\Documents\aic_api\objects.json'
# JSON_COLORS = r'C:\Users\thinhlc\Documents\aic_api\colors.json'
# JSON_REVERSED_OBJECTS = r'C:\Users\thinhlc\Documents\aic_api\reversed_objects.json'
# TEXT_CLASS = r'C:\Users\thinhlc\Documents\aic_api\classes.txt'


# Load data map keyframe
map_frame = dict([])
files = os.listdir(KEYFRAME_P_PATH)
for file in tqdm(files):
    frame_id = pd.read_csv(os.path.join(KEYFRAME_P_PATH, file), header=None)
    frame_id[0] = frame_id[0].map(lambda x: x[:-4])
    name = file[:-4] + "_" + frame_id[0].astype(int).astype(str)
    for i in range(len(name)):
        map_frame[name[i]] = str("000000" + str(frame_id[1][i]))[-6:]


def map_keyframe(query):
    name = query[0].map(lambda x: x[:-4]) + "_" + query[1].astype(int).astype(str)

    query[1] = name.map(lambda x: map_frame[x])

    return query


def indexing_methods() -> List[
    Tuple[str, int, np.ndarray],
]:
    db = []

    files = sorted(os.listdir(VISUAL_FEATURES_PATH))
    for feat_npy in tqdm(files):
        video_name = feat_npy.split(".")[0]
        feats_arr = np.load(os.path.join(VISUAL_FEATURES_PATH, feat_npy))
        keyframes = sorted(os.listdir(os.path.join(IMAGE_KEYFRAME_PATH, video_name)))
        for idx, feat in enumerate(feats_arr):

            instance = (video_name, keyframes[idx], feat)
            db.append(instance)
    return db


class Filter:
    def __init__(self):
        f = open(JSON_KEYFRAME_FILES, "r")
        self.keyframe_files = json.load(f)  #
        f = open(JSON_TRANSCIPRTS, "r")
        self.transcripts = json.load(f)  #

        keys = self.transcripts.keys()  #

        for key in keys:
            old_index = None
            for i in range(len(self.transcripts[key])):
                self.transcripts[key][i]["text"] = self.transcripts[key][i][
                    "text"
                ].lower()
                if old_index is not None:
                    self.transcripts[key][old_index]["text"] += (
                        " " + self.transcripts[key][i]["text"]
                    )
                    self.transcripts[key][old_index]["duration"] += self.transcripts[
                        key
                    ][i]["duration"]
                self.transcripts[key][i]["estimated_keyframe"] = int(
                    float(self.transcripts[key][i]["start"]) * 24.0
                )
                old_index = i
        f = open(JSON_OBJECTS, "r")
        self.objects = json.load(f)  #

        f = open(JSON_REVERSED_OBJECTS, "r")
        self.reversed_objects = json.load(f)  #

        with open(JSON_COLORS) as json_file:
            self.colors = json.load(json_file)

        for video, content in self.colors.items():
            for img, color_list in content.items():
                for i in range(len(color_list)):
                    if isinstance(color_list[i], list):
                        if set(color_list[i]) == set([255, 255, 255]):
                            color_list[i] = "white"
                        elif set(color_list[i]) == set([0, 0, 0]):
                            color_list[i] = "black"

        f = open(TEXT_CLASS, "w")
        for key in self.reversed_objects.keys():
            f.write(key + "\n")
        f.close()

    def find_set_of_nearest_frame(
        self, video_name, estimated_keyframe, left_bound=0, right_bound=1
    ):
        if left_bound + right_bound <= 0:
            right_bound = 1

        keyframe_index = bisect_left(
            self.keyframe_files[video_name], estimated_keyframe
        )

        num_of_frame = len(self.keyframe_files[video_name])

        index = (
            self.keyframe_files[video_name][
                keyframe_index : min(num_of_frame, keyframe_index + right_bound)
            ]
            + self.keyframe_files[video_name][
                max(0, keyframe_index - left_bound) : keyframe_index
            ]
        )

        results = [(video_name, x) for x in index]

        return results

    def voice_filter(self, keyword):
        results = []

        for key in self.transcripts.keys():
            for i in self.transcripts[key]:
                if keyword in i["text"]:
                    num_frame = int(i["duration"]) + 12
                    nearest_frame = self.find_set_of_nearest_frame(
                        key,
                        standardize_frameid(i["estimated_keyframe"]),
                        left_bound=0,
                        right_bound=num_frame,
                    )
                    results += nearest_frame

        return list(set(results))

    def objects_filter(self, obj):
        if len(obj) == 1:
            return [uncompress(x) for x in set(self.reversed_objects[obj[0]])]

        res = set(self.reversed_objects[obj[0]]).intersection(
            self.reversed_objects[obj[1]]
        )

        for i in range(2, len(obj)):
            res = set(res).intersection(self.reversed_objects[obj[i]])

        res = [uncompress(x) for x in res]

        return res

    def get_element_from_filter(self, visual_features_db, filter_result):
        results = []
        num_of_features = len(visual_features_db)  # NOTE
        for i in range(num_of_features):
            if (visual_features_db[i][0], visual_features_db[i][1]) in filter_result:
                results.append(i)

        return results

    def read_image(self, results):
        images = []
        paths = []
        for res in results:
            image_file = res["keyframe_id"]
            image_path = os.path.join(
                IMAGE_KEYFRAME_PATH, res["video_name"], image_file
            )
            paths.append(image_path)
            image = PIL.Image.open(image_path)
            images.append(np.array(image))
        return images, paths

    def filter_by_color(self, input_color):
        clean_input = tuple(map(int, input_color.split(", ")))
        input_color = [clean_input]
        input_colorname = []
        for c in input_color:
            actual_name, closest_name = get_colour_name(c)
            if actual_name != None:
                input_colorname.append(actual_name)
            else:
                input_colorname.append(closest_name)

        filter_res = []
        for video, content in self.colors.items():
            for img, color_list in content.items():
                if set(input_colorname) <= set(color_list):
                    tup = (video, img)
                    filter_res.append(tup)

        return filter_res


class ImageEmbedding_1:
    def __init__(self, visual_features_db):
        self.device = "cpu"
        self.model, self.preprocess = clip.load("ViT-B/16", device=self.device)
        self.visual_features_db = visual_features_db

    def __call__(self, path_image: str) -> np.ndarray:
        image = self.preprocess(path_image).unsqueeze(0).to(self.device)
        with torch.no_grad():
            image_features = self.model.encode_image(image)
        return image_features.detach().cpu().numpy()  # return


class ImageEmbedding:
    def __init__(self, visual_features_db):
        self.visual_features_db = visual_features_db
        self.image_model = ImageEmbedding_1(self.visual_features_db)

    def search_by_image(
        self,
        path_image: str,
        topk: int = 5,
        measure_method: str = "dot_product",
        filter_result=None,
    ) -> List[dict,]:

        query_arr = self.image_model(path_image)
        measure = []

        if measure_method == "cosine":
            em_list = []
            for i in self.visual_features_db:
                em_list.append(i[2])
            em_list = np.array(em_list)

            kq = cosine_similarity(em_list, [query_arr])

            for i, x in enumerate(kq):
                measure.append((i, x))

        else:
            for ins_id, instance in enumerate(self.visual_features_db):
                if (
                    filter_result is None
                    or (
                        self.visual_features_db[ins_id][0],
                        self.visual_features_db[ins_id][1],
                    )
                    in filter_result
                ):
                    video_name, idx, feat_arr = instance
                    if measure_method == "dot_product":
                        distance = query_arr @ feat_arr.T
                    elif measure_method == "l1_norm":
                        distance = -cityblock(query_arr, feat_arr)
                    elif measure_method == "l2_norm":
                        distance = -np.linalg.norm(query_arr - feat_arr)
                    measure.append((ins_id, distance))

        measure = sorted(measure, key=lambda x: x[-1], reverse=True)

        search_result = []
        for instance in measure[:topk]:
            ins_id, distance = instance
            video_name, idx, _ = self.visual_features_db[ins_id]
            search_result.append(
                {"video_name": video_name, "keyframe_id": idx, "score": distance}
            )
        return search_result


class TextEmbedding_1:
    def __init__(self, visual_features_db):
        self.device = "cpu"
        self.model, _ = clip.load("ViT-B/16", device=self.device)
        self.visual_features_db = visual_features_db

    def __call__(self, text: str) -> np.ndarray:
        text_inputs = clip.tokenize([text]).to(self.device)
        with torch.no_grad():
            text_feature = self.model.encode_text(text_inputs)[0]
            return text_feature.detach().cpu().numpy()


class TextEmbedding:
    def __init__(self, visual_features_db):
        self.visual_features_db = visual_features_db
        self.text_model = TextEmbedding_1(self.visual_features_db)

    def search_engine(
        self,
        text: str,
        topk: int = 5,
        measure_method: str = "dot_product",
        filter_result=None,
    ) -> List[dict,]:

        query_arr = self.text_model(text)
        measure = []

        if measure_method == "cosine":
            em_list = []
            for i in self.visual_features_db:
                em_list.append(i[2])
            em_list = np.array(em_list)

            kq = cosine_similarity(em_list, [query_arr])

            for i, x in enumerate(kq):
                measure.append((i, x))

        else:
            for ins_id, instance in enumerate(self.visual_features_db):
                if (
                    filter_result is None
                    or (
                        self.visual_features_db[ins_id][0],
                        self.visual_features_db[ins_id][1],
                    )
                    in filter_result
                ):
                    video_name, keyframe_id, feat_arr = instance
                    if measure_method == "dot_product":
                        distance = query_arr @ feat_arr.T
                    elif measure_method == "l1_norm":
                        distance = -cityblock(query_arr, feat_arr)
                    elif measure_method == "l2_norm":
                        distance = -np.linalg.norm(query_arr - feat_arr)
                    measure.append((ins_id, distance))

        measure = sorted(measure, key=lambda x: x[-1], reverse=True)

        search_result = []
        for instance in measure[:topk]:
            ins_id, distance = instance
            video_name, keyframe_id, _ = self.visual_features_db[ins_id]
            search_result.append(
                {
                    "video_name": video_name,
                    "keyframe_id": keyframe_id,
                    "score": distance,
                }
            )
        return search_result


# search by drawing
def sketch_engine(
    sketch, db, topk=10, filter_result=None
) -> List[dict,]:

    sketch_binary = convert_to_binary(sketch).astype(np.uint8)
    sketch_Lab = cv2.cvtColor(sketch, cv2.COLOR_RGB2Lab).astype("float")

    measure = []
    for ins_id, instance in enumerate(db):
        if filter_result is None or (db[ins_id][0], db[ins_id][1]) in filter_result:
            video_name, keyframe_id, _ = instance
            img = cv2.imread(os.path.join(IMAGE_KEYFRAME_PATH, video_name, keyframe_id))
            if img.shape != sketch.shape:
                img = cv2.resize(img, dsize=sketch.shape[:2][::-1])

            cropped_img = cv2.bitwise_and(img, img, mask=sketch_binary)

            img_Lab = cv2.cvtColor(cropped_img, cv2.COLOR_RGB2Lab)

            distance = np.sum((sketch_Lab - img_Lab) ** 2)

            measure.append((ins_id, distance))

    """Sắp xếp kết quả"""
    measure = sorted(measure, key=lambda x: x[-1])

    """Trả về top K kết quả"""
    search_result = []
    for instance in measure[:topk]:
        ins_id, distance = instance
        video_name, keyframe_id, _ = db[ins_id]
        search_result.append(
            {"video_name": video_name, "keyframe_id": keyframe_id, "score": distance}
        )
    return search_result


class Searching:
    def __init__(self):
        self.visual_features_db = indexing_methods()
        self.TextModel = TextEmbedding(self.visual_features_db)
        self.ImageModel = ImageEmbedding(self.visual_features_db)
        self.FilterModel = Filter()

    def search(
        self,
        text_query="",
        image_query=False,
        drawing_query="",
        voice_filter_text="",
        color_filter="",
        objects_filter_text="",
        top_k=20,
        swap_top="",
    ):

        filter_result = None

        colors_filter_result = None
        if color_filter != "":
            colors_filter_result = self.FilterModel.filter_by_color(color_filter)
            filter_result = colors_filter_result

        voice_filter_result = None
        if len(voice_filter_text) > 0:
            voice_filter_result = self.FilterModel.voice_filter(voice_filter_text)
            filter_result = voice_filter_result
        else:
            voice_filter_result = ""

        objects_filter_result = None
        if len(objects_filter_text) > 0:
            objects_filter_result = self.FilterModel.objects_filter(
                objects_filter_text.split(",")
            )

            if filter_result is not None:
                filter_result = set(filter_result).intersection(objects_filter_result)
            else:
                filter_result = objects_filter_result
        else:
            objects_filter_text = ""

        if filter_result is not None:
            filter_result = set(filter_result)

        search_result = None

        print(len(filter_result))
        if image_query:
            search_result = self.ImageModel.search_by_image(
                image_query, int(top_k), filter_result=filter_result
            )
            image_query = False
        elif (
            drawing_query != "" and filter_result is not None
        ):  # điều kiện số lượng ảnh từ <5k
            search_result = sketch_engine(
                drawing_query,
                db=self.visual_features_db,
                topk=int(top_k),
                filter_result=filter_result,
            )
        else:
            search_result = self.TextModel.search_engine(
                text_query, int(top_k), filter_result=filter_result
            )

        images, paths = self.FilterModel.read_image(search_result)

        if swap_top != "":
            ontop_list = [int(x) for x in swap_top.split(",")]
            images = bring_list_to_top(images, ontop_list)
            search_result = bring_list_to_top(search_result, ontop_list)
            images, paths = self.FilterModel.read_image(search_result)

        csv = get_csv(search_result)

        return images, paths, csv
