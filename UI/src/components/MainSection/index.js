import { Typography } from "@mui/material";
import React from "react";
import { Col, Row } from "react-bootstrap";
import { Backdrop } from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import "./style.css";
import QueryPanel from "./QueryPanel";
import ImagePanel from "./ImagePanel";
import CSVPanel from "./CSVPanel";
import Previewer from "./Previewer";
import { useStore } from "../../store";

const MainSection = () => {
  const [state, dispatch] = useStore();

  return (
    <Col lg={9} style={{ height: "fit-content" }}>
      <Typography variant="h2" my={4} textAlign="center">
        AI Challenge 2022
      </Typography>
      <Row className="px-2" style={{ height: "95%" }}>
        <Col lg={4} className="p-2 position-sticky top-0 align-self-start">
          <Typography variant="h6" gutterBottom>
            CSV result
          </Typography>
          <CSVPanel />
        </Col>

        <Col lg={8} className="p-2">
          <Typography variant="h6" gutterBottom>
            Query section
          </Typography>

          <QueryPanel />
          <Previewer />
          <ImagePanel />
        </Col>
      </Row>
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={state.openBackDrop}
      >
        <CircularProgress color="inherit" disableShrink />
      </Backdrop>
    </Col>
  );
};

export default MainSection;
