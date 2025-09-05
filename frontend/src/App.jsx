import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
import { useState } from 'react';

function App() {
  const [data, setData] = useState(null);
  const load = async () => {
    const res = await fetch('http://localhost:5000/api/requests');
    const json = await res.json();
    setData(json);
  };
  return (
    <div className='p-6 space-y-4'>
      <h1 className='text-2xl font-bold'>kampungkaki</h1>
      <button className='px-3 py-2 border rounded' onClick={load}>Load Requests</button>
      <pre className='bg-gray-100 p-3 rounded'>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
export default App;
