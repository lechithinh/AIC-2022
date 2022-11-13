import React from "react";
import {  Dialog, DialogTitle, Fab } from "@mui/material";
import { Col, Image, Row } from "react-bootstrap";
import { actions, useStore } from "../../store";
import DriveFileMoveIcon from "@mui/icons-material/DriveFileMove";
import { FetchResult } from "../../utils/FetchResult";
import YouTubeIcon from "@mui/icons-material/YouTube";

const Previewer = () => {
  const [state, dispatch] = useStore();

  const handleClose = () => {
    dispatch(
      actions.setPreviewer({
        ...state,
        previewerConfig: {
          ...state.previewerConfig,
          open: false,
        },
      })
    );
  };

  const handleClick = async (e) => {
    e.preventDefault();
    // const url = e.target.src;

    // console.log(url);
    try {
      await FetchResult(state.previewerConfig.folderPath, "get");
    } catch (error) {
      alert(error);
    }
  };

  return (
    <Dialog onClose={handleClose} open={state.previewerConfig.open || false}>
      <DialogTitle>
        <Row>
          <Col lg={10}>{state.previewerConfig.title}</Col>
          <Col lg={1}>
            <Fab size="small" color="success" onClick={handleClick}>
              <DriveFileMoveIcon />
            </Fab>
          </Col>
          <Col lg={1}>
            <Fab
              size="small"
              color="error"
              href={state.previewerConfig.videoLink || ""}
              target="_blank"
            >
              <YouTubeIcon />
            </Fab>
          </Col>
        </Row>
      </DialogTitle>
      <Image src={state.previewerConfig.src} fluid={true} />
    </Dialog>
  );
};

export default Previewer;
