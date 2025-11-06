import SessionRecorder from '@multiplayer-app/session-recorder-browser';

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { MathJaxContext } from 'better-react-mathjax';
import reportWebVitals from './reportWebVitals';

SessionRecorder.init({
  application: 'MathToys',
  version: '1.0.0',
  environment: 'production',
  apiKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpbnRlZ3JhdGlvbiI6IjY4YzMzMDMxZTE0YjViY2RlZDdlZmRmMCIsIndvcmtzcGFjZSI6IjY4YzIwYTQ4ZWM5MzU5ZDhkNWQ0MjhmOSIsInByb2plY3QiOiI2OGMyMGE0YTdiNzkzMjcyNzYzNGMyMjgiLCJ0eXBlIjoiT1RFTCIsImlhdCI6MTc1NzYyMjMyMX0.D1ZLpMFLZhTs83uoKI8cy1MlOoamZbgMKe9uzByRyrM',
  propagateTraceHeaderCorsUrls: new RegExp(`https://mathtoys.toews-api.com`, 'i'),
  sampler: 'always_on'
});

if (SessionRecorder._isInitialized === false) {
  SessionRecorder.start();
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter><MathJaxContext><App /></MathJaxContext></BrowserRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
