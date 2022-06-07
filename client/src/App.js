import React, { useRef, useState, useEffect } from "react";
import { useReactMediaRecorder } from "react-media-recorder";
import "./App.css";
import microPhoneIcon from "./img/microphone.svg";
import output_audio from "./static/output.wav";

function App() {
  const [isListening, setIsListening] = useState(false);
  const [isTransformed, setIsTransformed] = useState(false);
  const microphoneRef = useRef(null);
  useEffect(() => {
    const sendAudioFile = async () => {
      const audioFile = new File([mediaBlobUrl], "voice.wav", {
        type: "audio/wav",
      });
      const formData = new FormData();
      formData.append("audio-file", audioFile);
      /*return fetch("/audioUpload", {
        method: "POST",
        body: formData,
      });*/
    };
    sendAudioFile();
  }, []);
  const {
    // status,
    startRecording,
    stopRecording,
    // pauseRecording,
    mediaBlobUrl,
  } = useReactMediaRecorder({
    video: false,
    audio: true,
    // echoCancellation: true,
  });

  const handleListing = () => {
    setIsListening(true);
    microphoneRef.current.classList.add("listening");
    startRecording();
  };
  const stopHandle = () => {
    setIsListening(false);
    microphoneRef.current.classList.remove("listening");
    stopRecording();
  };

  const HttpsProxyAgent = require("https-proxy-agent");
  var proxy = {
    protocol: "http:",
    host: "127.0.0.1",
    port: 5000,
  };
  const options = {};
  if (proxy) {
    options.agent = new HttpsProxyAgent(proxy);
  }
  const handleTransfer = () => {
    fetch(`audioUpload/${mediaBlobUrl}`, options)
      // ,
      //   {
      //     agent: new HttpsProxyAgent("http://127.0.0.1:5000"),
      //   }
      .then((res) => {
        return res.blob();
      })
      .then((data) => {
        console.log(data.url);
        // run_script(in_url, out_url);
      })
      .catch((e) => {
        /*發生錯誤時要做的事情*/
      });
    setIsTransformed(true);
  };
  const stopHandleTransfer = () => {
    setIsTransformed(false);
  };
  console.log(mediaBlobUrl);
  return (
    <div className="microphone-wrapper">
      <div className="mircophone-title">
        Welcome to the world of voice changing!
      </div>
      {!isTransformed && (
        <div className="mircophone-container">
          <div
            className="microphone-icon-container"
            ref={microphoneRef}
            onClick={handleListing}
          >
            <img
              src={microPhoneIcon}
              alt="microPhoneIcon"
              className="microphone-icon"
            />
          </div>
          <div className="microphone-status">
            {isListening ? "Listening........." : "Click to start Listening"}
          </div>
          {isListening && (
            <button
              className="microphone-stop btn"
              onClick={() => {
                stopHandle();
              }}
            >
              Stop
            </button>
          )}
        </div>
      )}
      {!isTransformed && mediaBlobUrl && (
        <div className="microphone-result-container">
          <video
            className="microphone-result-audio"
            src={mediaBlobUrl}
            controls
            loop
          />
          <button className="microphone-transfer btn" onClick={handleTransfer}>
            start to transfer
          </button>
        </div>
      )}
      {isTransformed && (
        <div className="microphone-result-container">
          <audio
            className="microphone-result-audio"
            src={output_audio}
            controls
            loop
          />
          <button
            className="microphone-transfer btn"
            onClick={stopHandleTransfer}
          >
            back to transfer
          </button>
        </div>
      )}
    </div>
  );
}
export default App;
