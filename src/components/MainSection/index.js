import { Typography } from "@mui/material";
import React from "react";
import { Col, Row } from "react-bootstrap";

import "./style.css";
import QueryPanel from "./QueryPanel";
import ImagePanel from "./ImagePanel";
import CSVPanel from "./CSVPanel";

const MainSection = () => {
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

          <ImagePanel />
        </Col>
      </Row>
    </Col>
  );
};

export default MainSection;
