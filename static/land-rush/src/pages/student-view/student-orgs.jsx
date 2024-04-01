import React, { useState } from 'react';
import './student.css';

const initialMembers = [
  { name: 'John', isMember: true },
  { name: 'Emily', isMember: false },
  { name: 'Michael', isMember: false },
  { name: 'Sarah', isMember: true },
  { name: 'David', isMember: true },
  { name: 'Jessica', isMember: true },
  { name: 'Matthew', isMember: true },
  { name: 'Olivia', isMember: false },
  { name: 'Daniel', isMember: true },
  { name: 'Sophia', isMember: true }
];

const MembersList = () => {
  const [members, setMembers] = useState(initialMembers);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [searchTerm, setSearchTerm] = useState('');
  const [joinRequests, setJoinRequests] = useState([]);

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
    // Sort by isMember with "Yes" values at the top
    if (sortConfig.key === 'isMember') {
      if (a.isMember === b.isMember) {
        // If isMember values are the same, use the current sort configuration
        if (sortConfig.direction === 'ascending') {
          return a[sortConfig.key] > b[sortConfig.key] ? 1 : -1;
        } else {
          return a[sortConfig.key] < b[sortConfig.key] ? 1 : -1;
        }
      } else {
        return a.isMember === true ? -1 : 1;
      }
    }
  
    // If sorting by other keys, prioritize sorting by isMember first
    if (a.isMember !== b.isMember) {
      return a.isMember === true ? -1 : 1;
    } else {
      // Use the current sorting configuration for other keys
      if (sortConfig.direction === 'ascending') {
        return a[sortConfig.key] > b[sortConfig.key] ? 1 : -1;
      } else {
        return a[sortConfig.key] < b[sortConfig.key] ? 1 : -1;
      }
    }
  });
  

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleJoinRequest = (index) => {
    const updatedMembers = [...members];
    const member = updatedMembers[index];
    
    if (member.isMember) {
      // If already a member, remove membership
      member.isMember = false;
    } else {
      // If not a member, add to join requests
      setJoinRequests([...joinRequests, member.name]);
    }
    
    // Update the state with the modified members array
    setMembers(updatedMembers);
  };

  const filteredMembers = sortedMembers.filter((member) =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="member-list-container">
      <div className="join-requests">
        <h2>Join Requests</h2>
        <ul>
          {joinRequests.map((request, index) => (
            <li key={index}>{request}</li>
          ))}
        </ul>
      </div>
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
              <th onClick={() => requestSort('isMember')} className={`member-th ${getClassNamesFor('isMember')}`}>
                Is Member
              </th>
              <th className="member-th">Join Request</th>
            </tr>
          </thead>
          <tbody>
            {filteredMembers.map((member, index) => (
              <tr key={index} className="member-tr">
                <td className="member-td">{member.name}</td>
                <td className="member-td">{member.isMember ? 'Yes' : 'No'}</td>
                <td className="member-td">
                  <button onClick={() => handleJoinRequest(index)}>
                    {member.isMember ? 'Drop Membership' : 'Request to Join'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MembersList;
