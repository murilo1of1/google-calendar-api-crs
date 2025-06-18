import React, { useEffect, useState } from 'react';
import './App.css';

const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getMonthName(month, year) {
  return new Date(year, month).toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
}

function App() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);

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

  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
    setSelectedDate(null);
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
    setSelectedDate(null);
  };

  const handleDateClick = (day) => {
    setSelectedDate(new Date(currentYear, currentMonth, day));
  };

  // Eventos do dia selecionado
  const eventsForSelectedDate = selectedDate
    ? events.filter(event => {
        const eventDate = event.start?.dateTime || event.start?.date;
        if (!eventDate) return false;
        const eventDay = new Date(eventDate);
        return (
          eventDay.getDate() === selectedDate.getDate() &&
          eventDay.getMonth() === selectedDate.getMonth() &&
          eventDay.getFullYear() === selectedDate.getFullYear()
        );
      })
    : [];

  // Monta a tabela do calendário
  const renderCalendarTable = () => {
    const rows = [];
    let cells = [];
    let day = 1;
    // Primeira linha (pode começar no meio)
    for (let i = 0; i < 7; i++) {
      if (i < firstDay) {
        cells.push(<td key={"empty-start-" + i}></td>);
      } else {
        cells.push(renderDayButton(day++));
      }
    }
    rows.push(<tr key="row-0">{cells}</tr>);
    // Demais linhas
    while (day <= daysInMonth) {
      cells = [];
      for (let i = 0; i < 7; i++) {
        if (day > daysInMonth) {
          cells.push(<td key={"empty-end-" + i}></td>);
        } else {
          cells.push(renderDayButton(day++));
        }
      }
      rows.push(<tr key={"row-" + day}>{cells}</tr>);
    }
    return rows;
  };

  function renderDayButton(day) {
    const isToday =
      day === today.getDate() &&
      currentMonth === today.getMonth() &&
      currentYear === today.getFullYear();
    const isSelected =
      selectedDate &&
      day === selectedDate.getDate() &&
      currentMonth === selectedDate.getMonth() &&
      currentYear === selectedDate.getFullYear();
    const hasEvent = events.some(event => {
      const eventDate = event.start?.dateTime || event.start?.date;
      if (!eventDate) return false;
      const eventDay = new Date(eventDate);
      return (
        eventDay.getDate() === day &&
        eventDay.getMonth() === currentMonth &&
        eventDay.getFullYear() === currentYear
      );
    });
    return (
      <td key={day} style={{ textAlign: 'center', padding: 0 }}>
        <button
          onClick={() => handleDateClick(day)}
          className={`calendar-btn${isToday ? ' today' : ''}${isSelected ? ' selected' : ''}`}
        >
          {day}
          {hasEvent && <span className="event-dot-table" />}
        </button>
      </td>
    );
  }

  return (
    <div className="calendar-app-wrapper">
      <div className="calendar-table-container">
        <h1>Minha Agenda</h1>
        <div className="calendar-header-table">
          <button onClick={handlePrevMonth}>&lt;</button>
          <span>{getMonthName(currentMonth, currentYear)}</span>
          <button onClick={handleNextMonth}>&gt;</button>
        </div>
        <table className="calendar-table">
          <thead>
            <tr>
              {daysOfWeek.map((d) => (
                <th key={d}>{d}</th>
              ))}
            </tr>
          </thead>
          <tbody>{renderCalendarTable()}</tbody>
        </table>
      </div>
      <div className="event-list-table-container">
        <h2>Eventos do dia</h2>
        {selectedDate ? (
          loading ? (
            <p>Carregando eventos...</p>
          ) : error ? (
            <p style={{ color: 'red' }}>{error}</p>
          ) : eventsForSelectedDate.length === 0 ? (
            <p>Nenhum evento para este dia.</p>
          ) : (
            <ul className="event-list-table">
              {eventsForSelectedDate.map((event) => (
                <li key={event.id} className="event-item-table">
                  <strong>{event.summary || 'Sem título'}</strong>
                  <br />
                  <span>
                    {event.start?.dateTime ? new Date(event.start.dateTime).toLocaleString() : event.start?.date}
                    {' '}até{' '}
                    {event.end?.dateTime ? new Date(event.end.dateTime).toLocaleString() : event.end?.date}
                  </span>
                  {event.description && (
                    <div className="event-description-table">{event.description}</div>
                  )}
                </li>
              ))}
            </ul>
          )
        ) : (
          <p>Selecione um dia para ver os eventos.</p>
        )}
      </div>
    </div>
  );
}

export default App;
