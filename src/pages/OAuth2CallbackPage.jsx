/**
 * OAuth 2.0 was removed from this project.
 * This file is retained only because the filesystem does not support deletion
 * through current tooling. Delete it manually.
 *
 * If a user somehow navigates to /oauth2/callback they are redirected to /login.
 * The route for /oauth2/callback has been removed from App.jsx.
 */
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function OAuth2CallbackPage() {
  const navigate = useNavigate();
  useEffect(() => { navigate('/login', { replace: true }); }, [navigate]);
  return null;
}
