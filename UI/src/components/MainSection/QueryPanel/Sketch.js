import { ReactSketchCanvas } from "react-sketch-canvas";
import { Row, Col } from "react-bootstrap";
import React, { useEffect, useRef, useState } from "react";
import { Button, Switch } from "@mui/material";
import { Slider, Typography } from "@mui/material";
import { dataURLtoBlob } from "../../../utils/DataURLtoFile";
const SketchPanel = ({ onQuery }) => {
  const [options, setOptions] = useState({
    strokeWidth: 10,
    eraserWidth: 10,
    strokeColor: "#000000",
    canvasColor: "#ffffff",
  });
  const [drawing, setDrawing] = useState(true);
  const sketchRef = useRef(null);

  const styles = {
    width: "100%",
    height: "350px",
    border: "2px dashed gray",
  };

  const onChangeOptions = (e, type) => {
    if (type === "eraserWidth") setDrawing(false);
    if (type === "strokeWidth") setDrawing(true);
    setOptions({
      ...options,
      [type]: e.target.value,
    });
  };

  const onToggleDrawingMode = (e, type) => {
    const checked = e.target.checked;
    if (type === "draw") {
      setDrawing(checked);
    }
    if (type === "erase") {
      setDrawing(!checked);
    }
  };

  useEffect(() => {
    sketchRef.current.eraseMode(!drawing);
  }, [drawing]);

  const onClickSubmit = async () => {
    const sketchBlob = dataURLtoBlob(
      await sketchRef.current.exportImage("jpeg")
    );

    const file = new File([sketchBlob], "sketch.jpg", {
      type: "image/jpeg",
      lastModified: new Date(),
    });
    console.log({ sketchBlob, file });

    await onQuery("sketch", file);
  };

  return (
    <Row className="mt-3">
      <Col lg={8}>
        <ReactSketchCanvas ref={sketchRef} style={styles} {...options} />
      </Col>
      <Col lg={4}>
        <Row>
          <Col lg={6}>
            <label htmlFor="canvasColor">Bg color</label>
            <input
              id="canvasColor"
              type="color"
              className="form-control form-control-color"
              value={options.canvasColor}
              onChange={(e) => onChangeOptions(e, "canvasColor")}
            />
          </Col>
          <Col lg={6}>
            <label htmlFor="strokeColor">Pen color</label>

            <input
              id="strokeColor"
              type="color"
              className="form-control form-control-color"
              value={options.strokeColor}
              onChange={(e) => onChangeOptions(e, "strokeColor")}
            />
          </Col>
          <Col lg={6} className="mt-2">
            Draw
            <Switch
              label="Draw"
              checked={drawing}
              onChange={(e) => onToggleDrawingMode(e, "draw")}
            />
          </Col>
          <Col lg={6} className="p-0 mt-2">
            Erase
            <Switch
              label="Erase"
              checked={!drawing}
              onChange={(e) => onToggleDrawingMode(e, "erase")}
            />
          </Col>

          <Col lg={12} className="mt-2">
            <Typography gutterBottom>
              Pen size: {options.strokeWidth}
            </Typography>
            <Slider
              defaultValue={options.strokeWidth}
              valueLabelDisplay="auto"
              step={10}
              marks
              min={10}
              max={100}
              value={options.strokeWidth}
              onChange={(e) => onChangeOptions(e, "strokeWidth")}
            />
          </Col>

          <Col lg={12} className="mt-2">
            <Typography gutterBottom>
              Eraser size: {options.eraserWidth}
            </Typography>
            <Slider
              defaultValue={options.eraserWidth}
              valueLabelDisplay="auto"
              step={10}
              marks
              min={10}
              max={100}
              value={options.eraserWidth}
              onChange={(e) => onChangeOptions(e, "eraserWidth")}
            />
          </Col>

          <Col lg={12}>
            <Button
              variant="contained"
              onClick={() => sketchRef.current.clearCanvas()}
            >
              Clear all
            </Button>
          </Col>
        </Row>
      </Col>

      <Col>
        <Button
          variant="contained"
          size="medium"
          className="my-3"
          color="error"
          onClick={onClickSubmit}
        >
          Query
        </Button>
      </Col>
    </Row>
  );
};

export { SketchPanel };
