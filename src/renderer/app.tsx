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
import { WindowsName } from '../shared';

export const App: React.FC = () => (
  <HashRouter>
    <Routes>
      <Route
        path={`/${WindowsName.Preferences}`}
        element={<Preferences />}
      />
      <Route
        path={`/${WindowsName.Message}`}
        element={<Message />}
      />
      <Route
        path={`/${WindowsName.KeyPin}`}
        element={<KeyPin />}
      />
      <Route
        path={`/${WindowsName.P11Pin}`}
        element={<P11Pin />}
      />
    </Routes>
  </HashRouter>
);
