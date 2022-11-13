import React, { useState, useEffect } from "react";
import { Col } from "react-bootstrap";
import { TextField, Slider, Typography } from "@mui/material";

import { actions, useStore } from "../../store";

const SideBar = () => {
  const [state, dispatch] = useStore();

  const [options, setOptions] = useState({
    csvName: "query-1",
    numberOfPredictions: 20,
    transcriptFilter: "",
    objectFilter: "",
    colorFilter: "",
    imgPath: "/home/ngohiep/Documents/AI_Challenge/KeyFrames",
  });

  useEffect(() => {
    dispatch(actions.setSentData(options));
  }, [options]);

  const handleChange = (e, type) => {
    let data = e.target.value;
    if (type === "transcriptFilter") data = data.toLowerCase();
    setOptions({ ...options, [type]: data });
  };

  return (
    <Col
      lg={3}
      className="border-end border-dark border-3 vh-100 position-sticky top-0"
    >
      <Typography variant="h2" my={4} textAlign="center">
        UIT - THOI
      </Typography>

      <Typography variant="h6" my={2}>
        Options panel
      </Typography>

      <TextField
        label="Local image path(absolute path)"
        variant="standard"
        value={options.imgPath}
        className="w-100 mb-4"
        onChange={(e) => handleChange(e, "imgPath")}
      />

      <TextField
        label="CSV filename"
        variant="standard"
        value={options.csvName}
        className="w-100 mb-4"
        onChange={(e) => handleChange(e, "csvName")}
      />

      <Typography gutterBottom>
        Number of predictions: {options.numberOfPredictions}
      </Typography>
      <Slider
        aria-label="Query result"
        defaultValue={options.numberOfPredictions}
        valueLabelDisplay="auto"
        step={10}
        marks
        min={10}
        max={100}
        value={options.numberOfPredictions}
        onChange={(e) => handleChange(e, "numberOfPredictions")}
      />

      <TextField
        label="Transcript filter(voice search)"
        variant="standard"
        className="w-100 mb-4"
        value={options.transcriptFilter}
        onChange={(e) => handleChange(e, "transcriptFilter")}
      />

      <TextField
        label="Object filter"
        variant="standard"
        className="w-100 mb-4"
        value={options.objectFilter}
        onChange={(e) => handleChange(e, "objectFilter")}
      />

      <TextField
        label="Color filter"
        variant="standard"
        className="w-100 mb-4"
        value={options.colorFilter}
        onChange={(e) => handleChange(e, "colorFilter")}
      />
    </Col>
  );
};

export default SideBar;
