
import cv2
import numpy as np
from io import BytesIO
from typing import List, Tuple
import matplotlib.pyplot as plt
import PIL.Image
import pandas as pd
import webcolors
import os

import pandas as pd
import os
from tqdm import tqdm

def standardize_frameid(frameid):
    return str("000000" + str(frameid))[-6:]


def bring_to_top(a, i):
    return [a[i-1]] + a[:i-1] + a[i:]

def bring_list_to_top(a, b):
    for i in range(len(b)-1, -1, -1):
        vt = b[i] + sum([1 if b[j] > b[i] else 0 for j in range(len(b)-1, i, -1)])
        a = bring_to_top(a, vt)
        
    return a


def uncompress(x):
    res = x.split('_')
    return (res[0] + '_' + res[1], standardize_frameid(res[2]) + '.jpg')

def gallery(array, ncols=5):
    assert array.shape[0] != 0
    
    extra_array = []
    base_h, base_w = array[0].shape[:2]
    
    for i in range(array.shape[0]):
        extra_array.append(cv2.resize(array[i], dsize=(base_w, base_h)))

    while len(extra_array) % ncols != 0:
        extra_array.append(np.zeros((base_h, base_w, 3), dtype = "uint8"))
    
    array = np.array(extra_array)
    nindex, height, width, intensity = array.shape

    nrows = nindex//ncols
    assert nindex == nrows*ncols
    # want result.shape = (height*nrows, width*ncols, intensity)
    result = (array.reshape(nrows, ncols, height, width, intensity)
              .swapaxes(1,2)
              .reshape(height*nrows, width*ncols, intensity))
    return result

def visualize_qt(imgs: List[PIL.Image.Image, ]) -> None:
    #plt.figure(figsize=(20, 9))
    plt.figure(figsize=(10, 5))
    plt.axis('off')
    plt.tight_layout(h_pad=0.2, w_pad=0.2)
    result = gallery(np.array(imgs))
    plt.imshow(result)
    plt.show()


def convert_image(data):
    return PIL.Image.open(BytesIO(data))

def get_csv(search_result):
    submits = []
    for res in search_result:
      videoName = f"{res['video_name']}.mp4"
      image_file = res["keyframe_id"]
      frameName = image_file.split('.')[0]
      submits.append([videoName, frameName])

    df = pd.DataFrame(submits)
    #return df
    return df.to_csv(header=False, index=False).encode('utf-8')


#Phần này bỏ qua 
def closest_colour(requested_colour):
    min_colours = {}
    for key, name in webcolors.CSS3_HEX_TO_NAMES.items():
        r_c, g_c, b_c = webcolors.hex_to_rgb(key)
        rd = (r_c - requested_colour[0]) ** 2
        gd = (g_c - requested_colour[1]) ** 2
        bd = (b_c - requested_colour[2]) ** 2
        min_colours[(rd + gd + bd)] = name
    return min_colours[min(min_colours.keys())]

def get_colour_name(requested_colour):
    try:
        closest_name = actual_name = webcolors.rgb_to_name(requested_colour)
    except ValueError:
        closest_name = closest_colour(requested_colour)
        actual_name = None
    return actual_name, closest_name

#======================


#map keyframe utils
def reverse_to_csv(TESTDATA):
    submits = []
    for sample in TESTDATA.split("\n"):
        submits.append(sample.split(','))

    df = pd.DataFrame(submits)
    return df[:-1]

#search by drawing
def convert_to_binary(sketch):
    sketch_gray = cv2.cvtColor(sketch, cv2.COLOR_RGB2GRAY)
    sketch_binary = np.zeros(sketch_gray.shape[:2])
    sketch_binary[sketch_gray < 255] = 1
    
    return sketch_binary