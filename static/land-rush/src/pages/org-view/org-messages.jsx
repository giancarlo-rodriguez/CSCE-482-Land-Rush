import React, { useState } from 'react';
import './style.css';

const messages = [
  { title: 'Meeting Reminder', senderName: 'John Doe', timestamp: '2024-03-19 | 10:30:00' },
  { title: 'Project Update', senderName: 'Alice Smith', timestamp: '2024-03-19 | 12:45:00' },
  { title: 'Event Invitation', senderName: 'Emily Johnson', timestamp: '2024-03-18 | 15:20:00' },
  { title: 'Weekly Newsletter', senderName: 'Michael Brown', timestamp: '2024-03-17 | 09:00:00' },
  { title: 'Discussion Topic', senderName: 'Sarah Wilson', timestamp: '2024-03-16 | 11:10:00' },
  { title: 'Feedback Request', senderName: 'David Clark', timestamp: '2024-03-15 | 14:30:00' },
  { title: 'Announcement', senderName: 'Emma Lee', timestamp: '2024-03-14 | 16:25:00' },
  { title: 'Task Assignment', senderName: 'Daniel Taylor', timestamp: '2024-03-13 | 13:55:00' },
  { title: 'Upcoming Event Details', senderName: 'Olivia Martinez', timestamp: '2024-03-12 | 10:00:00' },
  { title: 'Reminder', senderName: 'James Wilson', timestamp: '2024-03-11 | 08:20:00' },
  { title: 'Meeting Reminder', senderName: 'John Doe', timestamp: '2024-03-19 | 10:30:00' },
  { title: 'Project Update', senderName: 'Alice Smith', timestamp: '2024-03-19 | 12:45:00' },
  { title: 'Event Invitation', senderName: 'Emily Johnson', timestamp: '2024-03-18 | 15:20:00' },
  { title: 'Weekly Newsletter', senderName: 'Michael Brown', timestamp: '2024-03-17 | 09:00:00' },
  { title: 'Discussion Topic', senderName: 'Sarah Wilson', timestamp: '2024-03-16 | 11:10:00' },
  { title: 'Feedback Request', senderName: 'David Clark', timestamp: '2024-03-15 | 14:30:00' },
  { title: 'Announcement', senderName: 'Emma Lee', timestamp: '2024-03-14 | 16:25:00' },
  { title: 'Task Assignment', senderName: 'Daniel Taylor', timestamp: '2024-03-13 | 13:55:00' },
  { title: 'Upcoming Event Details', senderName: 'Olivia Martinez', timestamp: '2024-03-12 | 10:00:00' },
  { title: 'Reminder', senderName: 'James Wilson', timestamp: '2024-03-11 | 08:20:00' },
  { title: 'Meeting Reminder', senderName: 'John Doe', timestamp: '2024-03-19 | 10:30:00' },
  { title: 'Project Update', senderName: 'Alice Smith', timestamp: '2024-03-19 | 12:45:00' },
  { title: 'Event Invitation', senderName: 'Emily Johnson', timestamp: '2024-03-18 | 15:20:00' },
  { title: 'Weekly Newsletter', senderName: 'Michael Brown', timestamp: '2024-03-17 | 09:00:00' },
  { title: 'Discussion Topic', senderName: 'Sarah Wilson', timestamp: '2024-03-16 | 11:10:00' },
  { title: 'Feedback Request', senderName: 'David Clark', timestamp: '2024-03-15 | 14:30:00' },
  { title: 'Announcement', senderName: 'Emma Lee', timestamp: '2024-03-14 | 16:25:00' },
  { title: 'Task Assignment', senderName: 'Daniel Taylor', timestamp: '2024-03-13 | 13:55:00' },
  { title: 'Upcoming Event Details', senderName: 'Olivia Martinez', timestamp: '2024-03-12 | 10:00:00' },
  { title: 'Reminder', senderName: 'James Wilson', timestamp: '2024-03-11 | 08:20:00' },
  { title: 'Meeting Reminder', senderName: 'John Doe', timestamp: '2024-03-19 | 10:30:00' },
  { title: 'Project Update', senderName: 'Alice Smith', timestamp: '2024-03-19 | 12:45:00' },
  { title: 'Event Invitation', senderName: 'Emily Johnson', timestamp: '2024-03-18 | 15:20:00' },
  { title: 'Weekly Newsletter', senderName: 'Michael Brown', timestamp: '2024-03-17 | 09:00:00' },
  { title: 'Discussion Topic', senderName: 'Sarah Wilson', timestamp: '2024-03-16 | 11:10:00' },
  { title: 'Feedback Request', senderName: 'David Clark', timestamp: '2024-03-15 | 14:30:00' },
  { title: 'Announcement', senderName: 'Emma Lee', timestamp: '2024-03-14 | 16:25:00' },
  { title: 'Task Assignment', senderName: 'Daniel Taylor', timestamp: '2024-03-13 | 13:55:00' },
  { title: 'Upcoming Event Details', senderName: 'Olivia Martinez', timestamp: '2024-03-12 | 10:00:00' },
  { title: 'Reminder', senderName: 'James Wilson', timestamp: '2024-03-11 | 08:20:00' }
];

const MessagesList = () => {
  const [messagesList, setMessagesList] = useState(messages);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const messagesPerPage = 5;

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
                Title
              </th>
              <th onClick={() => requestSort('senderName')} className={`msg-th ${getClassNamesFor('senderName')}`}>
                Sender Name
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
