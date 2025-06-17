import React, { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('http://localhost:3001/api/events')
      .then((res) => {
        if (!res.ok) throw new Error('Erro ao buscar eventos');
        return res.json();
      })
      .then((data) => {
        setEvents(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ maxWidth: 600, margin: '40px auto', fontFamily: 'sans-serif' }}>
      <h1>Eventos do Google Calendar</h1>
      {loading && <p>Carregando eventos...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!loading && !error && (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {events.length === 0 && <li>Nenhum evento encontrado.</li>}
          {events.map((event) => (
            <li key={event.id} style={{ marginBottom: 20, padding: 16, border: '1px solid #eee', borderRadius: 8 }}>
              <strong>{event.summary || 'Sem título'}</strong>
              <br />
              <span>
                {event.start?.dateTime ? new Date(event.start.dateTime).toLocaleString() : event.start?.date}
                {' '}até{' '}
                {event.end?.dateTime ? new Date(event.end.dateTime).toLocaleString() : event.end?.date}
              </span>
              {event.description && (
                <div style={{ marginTop: 8, color: '#555' }}>{event.description}</div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;
