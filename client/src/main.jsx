import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// 1. Import Amplify and the default styles
import { Amplify } from 'aws-amplify';
import '@aws-amplify/ui-react/styles.css';

// 2. Configure it with your newly created User Pool
Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: 'us-east-1_pHbLoSlRO',
      userPoolClientId: '3bj9fls9vp5487k525hl7g9q4n',
    }
  }
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)