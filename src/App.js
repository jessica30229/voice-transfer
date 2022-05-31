import React, { useRef, useState, useEffect } from "react";
import { useReactMediaRecorder } from "react-media-recorder";
import "./App.css";
import microPhoneIcon from "./img/microphone.svg";

function App() {
  const [isListening, setIsListening] = useState(false);
  const microphoneRef = useRef(null);
  useEffect(() => {
    const sendAudioFile = async () => {
      const audioFile = new File([mediaBlobUrl], "voice.wav", {
        type: "audio/wav",
      });
      const formData = new FormData();
      formData.append("audio-file", audioFile);
      return fetch("http://localhost:3000/audioUpload", {
        method: "POST",
        body: formData,
      });
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
  const handleTransfer = () => {
    fetch("http://localhost:3000/audioUpload", {
      method: "GET",
    })
      .then((res) => res.json()) /*把request json化*/
      .then((data) => {
        /*接到request data後要做的事情*/
        
        return data;
      })
      .catch((e) => {
        /*發生錯誤時要做的事情*/
      });
  };

  console.log("deed", mediaBlobUrl);
  return (
    <div className="microphone-wrapper">
      <div className="mircophone-title">
        Welcome to the world of voice changing!
      </div>
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
      {mediaBlobUrl && (
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
    </div>
  );
}
export default App;
