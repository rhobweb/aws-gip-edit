import '../public/gip-common.css';

import * as React          from 'react';

import useConfig     from "./components/useConfig";
import GipEdit       from './components/gip_edit';
import Authenticator from './components/authenticator';

/**
 * Our Web Application
 */
export default function App() {
  const config = useConfig();
  return (
    <Authenticator>
      <GipEdit />
    </Authenticator>
  );
}

/*
      <GipEdit />
    <div className="app">
      <Helmet>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-rbsA2VBKQhggwzxH7pPCaAqO46MgnOM80zW1RWuH61DGLwZJEdK2Kadq2F9CUG65" crossOrigin="anonymous"/>
      </Helmet>
      <GipEdit />
    </div>
*/