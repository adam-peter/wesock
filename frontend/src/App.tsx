import { useEffect, useState } from 'react';
import { config } from './config';

export default function App() {
  const [message, setMessage] = useState<string>('Loading...');

  useEffect(() => {
    fetch(`${config.apiBaseUrl}/`)
      .then((res) => res.json())
      .then((data) => setMessage(data.message))
      .catch((err) => setMessage(`Error: ${err.message}`));
  }, []);

  return (
    <div>
      <h1 className="text-xl">Hello! :D</h1>
      <p>{message}</p>
    </div>
  );
}
