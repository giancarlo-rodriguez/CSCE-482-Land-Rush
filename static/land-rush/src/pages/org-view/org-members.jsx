import React, { useState } from 'react';
import './style.css';

const initialMembers = [
  { name: 'John', isRushing: true },
  { name: 'Emily', isRushing: false },
  { name: 'Michael', isRushing: false },
  { name: 'Sarah', isRushing: true },
  { name: 'David', isRushing: true },
  { name: 'Jessica', isRushing: true },
  { name: 'Matthew', isRushing: true },
  { name: 'Olivia', isRushing: false },
  { name: 'Daniel', isRushing: true },
  { name: 'Sophia', isRushing: true }
];

const MembersList = () => {
  const [members, setMembers] = useState(initialMembers);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [searchTerm, setSearchTerm] = useState('');

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

  const sortedMembers = [...members].sort((a, b) => {
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

  const filteredMembers = sortedMembers.filter((member) =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="member-list-container">
      <input
        type="text"
        placeholder="Search by name..."
        value={searchTerm}
        onChange={handleSearch}
        className="member-search-bar"
      />
      <div className="member-grid-container">
        <table className="member-table">
          <thead>
            <tr>
              <th onClick={() => requestSort('name')} className={`member-th ${getClassNamesFor('name')}`}>
                Name
              </th>
              <th onClick={() => requestSort('isRushing')} className={`member-th ${getClassNamesFor('isRushing')}`}>
                Participating in Upcoming Rush?
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredMembers.map((member, index) => (
              <tr key={index} className="member-tr">
                <td className="member-td">{member.name}</td>
                <td className="member-td">{member.isRushing ? 'Yes' : 'No'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MembersList;
