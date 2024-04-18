import axios from 'axios';
import Cookies from 'js-cookie';
import React, { useState, useEffect } from 'react';
import './style.css';

const MessagesList = () => {
  const [messagesList, setMessagesList] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const messagesPerPage = 5;

  useEffect(() => {
    const token = Cookies.get('token');
    if (token) {
      axios.get('http://127.0.0.1:8000/create/org/request', {
        headers: {
          Authorization: `Token ${token}`
        }
      })
      .then(response => {
        console.log('Messages:', response.data);
        setMessagesList(response.data);
      })
      .catch(error => {
        console.error('Error fetching events:', error);
      });
    }
  }, []);

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getClassNamesFor = (name) => {
    if (!sortConfig) {
      return;
    }
    return sortConfig.key === name ? sortConfig.direction : undefined;
  };

  const sortedMessages = [...messagesList].sort((a, b) => {
    if (sortConfig.direction === 'ascending') {
      return a[sortConfig.key] > b[sortConfig.key] ? 1 : -1;
    }
    if (sortConfig.direction === 'descending') {
      return a[sortConfig.key] < b[sortConfig.key] ? 1 : -1;
    }
    return 0;
  });

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredMessages = sortedMessages.filter((message) =>
    message.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.senderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.timestamp.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastMessage = currentPage * messagesPerPage;
  const indexOfFirstMessage = indexOfLastMessage - messagesPerPage;
  const currentMessages = filteredMessages.slice(indexOfFirstMessage, indexOfLastMessage);

  const nextPage = () => {
    if (currentPage < Math.ceil(filteredMessages.length / messagesPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="msg-list-container">
      <input
        type="text"
        placeholder="Search by title, sender name, or timestamp..."
        value={searchTerm}
        onChange={handleSearch}
        className="msg-search-bar"
      />
      <div className="msg-grid-container">
        <table className="msg-table">
          <thead>
            <tr>
              <th onClick={() => requestSort('title')} className={`msg-th ${getClassNamesFor('title')}`}>
                Organization Creation Request
              </th>
              <th onClick={() => requestSort('senderName')} className={`msg-th ${getClassNamesFor('senderName')}`}>
                Sender
              </th>
              <th onClick={() => requestSort('timestamp')} className={`msg-th ${getClassNamesFor('timestamp')}`}>
                Timestamp
              </th>
            </tr>
          </thead>
          <tbody>
            {currentMessages.map((message, index) => (
              <tr key={index} className="msg-tr">
                <td className="msg-td">{message.title}</td>
                <td className="msg-td">{message.senderName}</td>
                <td className="msg-td">{message.timestamp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="page-select">
        <button onClick={prevPage} disabled={currentPage === 1}>
          {'< '}
        </button>
        <span>Page {currentPage} of {Math.ceil(filteredMessages.length / messagesPerPage)}</span>
        <button onClick={nextPage} disabled={currentPage === Math.ceil(filteredMessages.length / messagesPerPage)}>
          {' >'}
        </button>
      </div>
    </div>
  );
};

export default MessagesList;
