import React, { useRef, useState, useEffect } from "react";
import { useReactMediaRecorder } from "react-media-recorder";
import "./App.css";
import microPhoneIcon from "./img/microphone.svg";
import output_audio from "./converted_audio/output.wav";

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
  const handleTransfer = () => {
    fetch(`/audioUpload/${mediaBlobUrl}`)
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
  };

  console.log(mediaBlobUrl);
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
          <audio
            className="microphone-result-audio"
            src={output_audio}
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
