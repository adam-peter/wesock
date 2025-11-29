import { useEffect, useState } from 'react';
import { config } from './config';
import { Button } from './components/ui/button';

export default function App() {
  const [message, setMessage] = useState<string>('Loading...');

  useEffect(() => {
    const fetchMessage = async () => {
      try {
        const res = await fetch(`${config.apiBaseUrl}/`);
        const data = await res.json();
        setMessage(data.message);
      } catch (err) {
        console.error(err);
        setMessage(
          `Error: ${err instanceof Error ? err.message : 'Unknown error'}`
        );
      }
    };

    fetchMessage();
  }, []);

  return (
    <div>
      <h1 className="text-xl">Hello! :D</h1>
      <p>{message}</p>
      <Button>Click me</Button>
    </div>
  );
}
