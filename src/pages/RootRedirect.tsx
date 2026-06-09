import { Navigate } from 'react-router-dom';
import { Tokens } from '../lib/api';

export default function RootRedirect() {
  const splashShown = sessionStorage.getItem('splashShown');

  if (!splashShown) {
    return <Navigate to="/splash" replace />;
  }

  return <Navigate to={Tokens.access ? '/home' : '/login'} replace />;
}
