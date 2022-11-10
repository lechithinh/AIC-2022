import React from "react";
import ImageList from "@mui/material/ImageList";
import ImageListItem from "@mui/material/ImageListItem";
import { useStore } from "../../store";

const ImagePanel = () => {
  const [state, dispatch] = useStore();

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
            <img src={e} loading="lazy" alt="keyframes" />
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
