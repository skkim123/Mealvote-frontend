import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import { serverURL } from './environment';

const root = ReactDOM.createRoot(document.getElementById('root'));
axios.defaults.baseURL = serverURL;

root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
