import * as React from 'react';
import {
  HashRouter,
  Routes,
  Route,
} from 'react-router-dom';
import {
  Preferences,
  Message,
  KeyPin,
  P11Pin,
} from './containers';

export const App: React.FC = () => (
  <HashRouter>
    <Routes>
      <Route
        path="/preferences"
        element={<Preferences />}
      />
      <Route
        path="/message"
        element={<Message />}
      />
      <Route
        path="/key-pin"
        element={<KeyPin />}
      />
      <Route
        path="/p11-pin"
        element={<P11Pin />}
      />
    </Routes>
  </HashRouter>
);
