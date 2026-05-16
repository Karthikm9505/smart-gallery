import React from 'react';
import { Authenticator } from '@aws-amplify/ui-react';
import { Navigate } from 'react-router-dom';
import '@aws-amplify/ui-react/styles.css'; // Ensures Amplify UI looks correct

const LoginPage = () => {
  return (
    // We reuse your dark navy background from the design system here
    <div className="min-h-screen flex items-center justify-center bg-[#0B0F19]">
      <Authenticator>
        {({ user }) => (
          // Once the user successfully authenticates, this child is rendered.
          // We use it to immediately redirect them to the main gallery.
          <Navigate to="/app" replace={true} />
        )}
      </Authenticator>
    </div>
  );
};

export default LoginPage;