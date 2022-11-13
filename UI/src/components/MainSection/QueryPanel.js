import React from "react";
import { Row, Image, Col } from "react-bootstrap";
import { Typography, Tab, Tabs, Box, Button, TextField } from "@mui/material";
import PropTypes from "prop-types";
import { useState } from "react";
import { FetchResult } from "../../utils/FetchResult";
import { actions, useStore } from "../../store";
import { JoinImagePath } from "../../utils/joinImagePath";

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      className="mt-3"
      {...other}
    >
      {value === index && children}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

const QueryPanel = () => {
  const [state, dispatch] = useStore();
  const [tabInx, setTabInx] = useState(0);
  const [imageQuery, setimageQuery] = useState(null);
  const [textQuery, setTextQuery] = useState("");

  const changeTab = (event, newValue) => {
    setTabInx(newValue);
  };

  const selectImage = (e) => {
    if (e.target.files[0]) {
      setimageQuery(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleChangeText = (e) => {
    setTextQuery(e.target.value);
  };

  const handleSubmit = async (type) => {
    dispatch(
      actions.setRcvData({
        csv: [],
        urls: [],
      })
    );

    if (type === "text") {
      if (textQuery === "") {
        alert("Ẩu rồi đó! Nhập câu query đi ba!");
        return;
      }
      dispatch(actions.showSpinner());

      const {
        colorFilter,
        numberOfPredictions,
        objectFilter,
        transcriptFilter,
      } = state.dataSend;

      const params = {
        text_query: textQuery,
        topk: numberOfPredictions,
        object_filter: objectFilter,
        voice_filter: transcriptFilter,
        color_filter: colorFilter,
      };

      try {
        const res = await FetchResult(
          "http://localhost:8000/text?" +
            new URLSearchParams(params).toString(),
          "get"
        );

        const urls = res.data.paths.map((l) => {
          const baseUrl = "http://127.0.0.1:8000/stream/{_}";
          const imgPath = l;
          return JoinImagePath(baseUrl, imgPath);
        });

        dispatch(
          actions.setRcvData({
            csv: res.data.csv,
            urls: urls,
          })
        );
        dispatch(actions.hideSpinner());
      } catch (error) {
        alert(error);
        console.error(error);
        dispatch(actions.hideSpinner());
      }
    }

    if (type === "image") {
      if (imageQuery === null) {
        console.error("Select image!");
        alert("Chọn hình đi ba");
        return;
      }
      dispatch(actions.showSpinner());

      const e = document.getElementById("img-input");

      const {
        colorFilter,
        numberOfPredictions,
        objectFilter,
        transcriptFilter,
      } = state.dataSend;
      const params = {
        topk: numberOfPredictions,
        object_filter: objectFilter,
        voice_filter: transcriptFilter,
        color_filter: colorFilter,
      };
      const formData = new FormData();
      formData.append("file", e.files[0]);
      console.log(e.files);
      try {
        const res = await FetchResult(
          "http://localhost:8000/image?" +
            new URLSearchParams(params).toString(),
          "post",
          formData
        );

        const urls = res.data.paths.map((l) => {
          const baseUrl = "http://127.0.0.1:8000/stream/{_}";
          const imgPath = l;
          return JoinImagePath(baseUrl, imgPath);
        });

        dispatch(
          actions.setRcvData({
            csv: res.data.csv,
            urls: urls,
          })
        );
        dispatch(actions.hideSpinner());
      } catch (error) {
        alert(error);
        console.error(error);
        dispatch(actions.hideSpinner());
      }
    }
  };

  return (
    <Row className="bg-secondary bg-opacity-10 rounded">
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs value={tabInx} onChange={changeTab}>
          <Tab label="Text search" {...a11yProps(0)} />
          <Tab label="Image search" {...a11yProps(1)} />
        </Tabs>
      </Box>

      <TabPanel index={0} value={tabInx}>
        <Typography variant="h6" gutterBottom>
          Query by text
        </Typography>
        <TextField
          label="Query content"
          value={textQuery}
          onChange={handleChangeText}
          variant="standard"
          className="w-100"
          required
          multiline
        />
        <Button
          variant="contained"
          onClick={() => handleSubmit("text")}
          size="medium"
          className="my-3"
          color="error"
        >
          Query
        </Button>
      </TabPanel>

      <TabPanel index={1} value={tabInx}>
        <Typography variant="h6" gutterBottom>
          Query by image
        </Typography>
        <Row>
          <Col lg="4">
            <Typography variant="body1">Select a local image</Typography>
            <Button variant="contained" component="label">
              Select
              <input
                hidden
                accept="image/*"
                type="file"
                onChange={selectImage}
                id="img-input"
              />
            </Button>
            <Button
              variant="contained"
              size="medium"
              className="my-3 mx-3"
              color="error"
              onClick={() => handleSubmit("image")}
            >
              Query
            </Button>
          </Col>
          <Col lg="8">
            {imageQuery !== "" && (
              <Image src={imageQuery} fluid className="mb-3" />
            )}
          </Col>
        </Row>
      </TabPanel>
    </Row>
  );
};

export default QueryPanel;
