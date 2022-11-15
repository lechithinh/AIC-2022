import React, { useEffect } from "react";
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
  const [submissionDetails, setSubmissionDetails] = useState({
    vidName: "",
    frameId: "",
    timecode: "",
  });
  const [toggleTextBox, setToggleTextBox] = useState({
    timecode: true,
    frame: true,
  });
  const [textQuery, setTextQuery] = useState("");
  const [sessionId, setSessionId] = useState("");

  useEffect(() => {
    if (submissionDetails.timecode === "" && submissionDetails.frameId === "") {
      setToggleTextBox({
        timecode: true,
        frame: true,
      });
      return;
    }
    if (submissionDetails.timecode !== "") {
      setToggleTextBox({
        timecode: true,
        frame: false,
      });
      return;
    }
    if (submissionDetails.frameId !== "") {
      setToggleTextBox({
        timecode: false,
        frame: true,
      });
      return;
    }
  }, [submissionDetails]);

  useEffect(() => {
    //get sessionId to submit query

    FetchResult("https://eventretrieval.one/api/v1/login", "post", {
      username: "grizzly05",
      password: "ba2Doacohc",
    })
      .then((response) => {
        const { data } = response;
        setSessionId(data.sessionId);
        console.log(data);
      })
      .catch((error) => {
        console.error(error);
        alert("Error when getting sessionId: " + error);
      });
  }, []);

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

  const handleQueryClick = async (type) => {
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

  const handleSubmitResult = async (e) => {
    e.preventDefault();
    const params = {
      item: submissionDetails.vidName,
      session: sessionId,
    };
    if (submissionDetails.frameId !== "")
      params.frame = submissionDetails.frameId;
    if (submissionDetails.timecode !== "")
      params.timecode = submissionDetails.timecode;

    const url = new URL("https://eventretrieval.one/api/v1/submit");
    for (let key in params) {
      url.searchParams.append(key, params[key]);
    }
    try {
      const submitResult = await FetchResult(url, "get");
      const { data } = submitResult;
      alert(data.submission + ": " + data.description);
    } catch (error) {
      console.log(error.response);
      if (error.response.data.description) {
        alert(error.response.data.description);
      }
    }
  };

  return (
    <Row className="bg-secondary bg-opacity-10 rounded">
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs value={tabInx} onChange={changeTab}>
          <Tab label="Text search" {...a11yProps(0)} />
          <Tab label="Image search" {...a11yProps(1)} />
          <Tab label="Sketch search" {...a11yProps(2)} />
          <Tab label="Submission" {...a11yProps(3)} />
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
          onClick={() => handleQueryClick("text")}
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
              onClick={() => handleQueryClick("image")}
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

      <TabPanel index={2} value={tabInx}>
        <Typography variant="h6" gutterBottom>
          Query by sketch image
        </Typography>
      </TabPanel>

      <TabPanel index={3} value={tabInx}>
        <Typography variant="h6" gutterBottom>
          Submission
        </Typography>
        <Typography variant="body2" gutterBottom>
          {<b>sessionId:</b>} {sessionId}
        </Typography>

        <form onSubmit={handleSubmitResult}>
          <TextField
            label="Video name"
            variant="outlined"
            className="w-100 mt-2"
            value={submissionDetails.vidName}
            onChange={(val) =>
              setSubmissionDetails({
                ...submissionDetails,
                vidName: val.target.value,
              })
            }
            required
            type="text"
          />
          <TextField
            label="Frame"
            variant="outlined"
            className="w-100 mt-3"
            value={submissionDetails.frameId}
            disabled={!toggleTextBox.frame}
            onChange={(val) =>
              setSubmissionDetails({
                ...submissionDetails,
                frameId: val.target.value,
              })
            }
            type="text"
          />
          <TextField
            type="text"
            className="w-100 mt-3"
            variant="outlined"
            label="Timecode"
            value={submissionDetails.timecode}
            disabled={!toggleTextBox.timecode}
            onChange={(val) =>
              setSubmissionDetails({
                ...submissionDetails,
                timecode: val.target.value,
              })
            }
          />
          <Button type="submit" className="my-3">
            Submit
          </Button>
        </form>
      </TabPanel>
    </Row>
  );
};

export default QueryPanel;
