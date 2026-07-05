import { Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './auth-context.js';

export function LogoutButton() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  async function handleClick() {
    await logout();
    navigate('/login', { replace: true });
  }

  return <Button onClick={handleClick}>Log out</Button>;
}
