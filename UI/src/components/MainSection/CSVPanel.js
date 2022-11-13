import React from "react";
import TextAreaWithLineNumber from "text-area-with-line-number";
import DownloadIcon from "@mui/icons-material/Download";
import Fab from "@mui/material/Fab";
import { actions, useStore } from "../../store";
import { JoinImagePath } from "../../utils/joinImagePath";
import { FetchResult } from "../../utils/FetchResult";

const CSVPanel = () => {
  const [state, dispatch] = useStore();

  const downLoadFile = (content, filename) => {
    const element = document.createElement("a");

    const blob = new Blob([content], { type: "plain/text" });

    const fileUrl = URL.createObjectURL(blob);

    element.setAttribute("href", fileUrl); //file location
    element.setAttribute("download", filename); // file name
    element.style.display = "none";

    document.body.appendChild(element);
    element.click();

    document.body.removeChild(element);
  };

  const handleDownloadClick = async () => {
    const { csvName: filename } = state.dataSend;
    const { csv } = state.dataRcv;

    if (filename === "") {
      alert("Nhập dùm cái tên file mới lưu được nè =))");
      return;
    }
    if (csv === "") {
      alert("csv rỗng sao tải về được :v");
      return;
    }
    try {
      const payload = {
        csv,
      };
      const res = await FetchResult(
        "http://localhost:8000/map",
        "post",
        payload
      );
      // console.log(res.data);
      downLoadFile(res.data.csv, filename + ".csv");
    } catch (error) {
      console.error(error);
      alert(error);
    }
  };

  const handleOnChange = (e) => {
    const value = e.target.value;
    const ImgFolder = state.dataSend.imgPath;
    console.log({ ImgLocation: ImgFolder });

    const urlList = value.split("\n").map((l) => {
      if (l === "") return "";
      const imagePath = ImgFolder + "/" + l.split(".mp4,").join("/") + ".jpg";

      return JoinImagePath("http://127.0.0.1:8000/stream/{_}", imagePath);
    });

    dispatch(
      actions.setRcvData({
        urls: urlList,
        csv: value,
      })
    );
  };

  return (
    <div className="position-relative">
      <TextAreaWithLineNumber
        height="75vh"
        textAreaBackgroundColor="#f5f5f5"
        lineNumberBackground="#f5f5f5"
        value={state.dataRcv.csv}
        onChange={handleOnChange}
      />

      <Fab
        color="primary"
        className="position-absolute"
        style={{
          bottom: "10px",
          right: "10px",
        }}
        size="small"
        onClick={handleDownloadClick}
      >
        <DownloadIcon />
      </Fab>
    </div>
  );
};

export default CSVPanel;
