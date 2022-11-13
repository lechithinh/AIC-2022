import React from "react";
import ImageList from "@mui/material/ImageList";
import ImageListItem from "@mui/material/ImageListItem";
import { actions, useStore } from "../../store";
import { FetchResult } from "../../utils/FetchResult";

const ImagePanel = () => {
  const [state, dispatch] = useStore();

  const handleClick = (e) => {
    const folderPath = e.target.src.split("/stream/").join("/explore/");
    const path = new URL(e.target.src).searchParams.get("path");
    const keyframeLocation = path.split("/KeyFrames/")[1]; // video name/keyframeid.jpg
    const videoLink = new URL("http://localhost:8000/ytb/{_}");
    videoLink.searchParams.append("path", keyframeLocation);
    dispatch(
      actions.setPreviewer({
        open: true,
        title: keyframeLocation,
        src: e.target.src,
        folderPath: folderPath,
        videoLink: videoLink.toString(),
      })
    );
  };

  return (
    <ImageList
      sx={{ width: "100%", height: "fit-content", marginTop: "20px" }}
      cols={5}
      rowHeight={164}
    >
      {state.dataRcv.urls.map((e, i) => (
        <ImageListItem key={i} className="position-relative">
          <p className="position-absolute top-0 start-0 bg-white text-dark">
            {i + 1}
          </p>
          {e !== "" ? (
            <img src={e} loading="lazy" alt="keyframes" onClick={handleClick} />
          ) : (
            <img
              src="/error-image-generic.png"
              loading="lazy"
              alt="keyframes"
            />
          )}
        </ImageListItem>
      ))}
    </ImageList>
  );
};

export default ImagePanel;
