import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
// import { BrowserRouter } from 'react-router-dom'; // Remove this import
import './index.css'; // Tailwind CSS import
import Modal from 'react-modal'; // Import the Modal component

const rootElement = document.getElementById('root');
Modal.setAppElement(rootElement); // Set the app element for react-modal

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);