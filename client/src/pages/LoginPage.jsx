import React from 'react';
import { Authenticator } from '@aws-amplify/ui-react';
import { Navigate } from 'react-router-dom';
import '@aws-amplify/ui-react/styles.css';

const LoginPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B0F19]">

      <Authenticator
        formFields={{
          signIn: {
            username: {
              label: 'Email',
              placeholder: 'Enter your email',
            },
          },

          signUp: {
            username: {
              label: 'Email',
              placeholder: 'Enter your email',
            },
          },
        }}
      >
        {({ user }) => (
          <Navigate to="/app" replace={true} />
        )}

      </Authenticator>

    </div>
  );
};

export default LoginPage;