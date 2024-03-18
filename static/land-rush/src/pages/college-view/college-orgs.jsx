import React, { useState } from 'react';
import './style.css';

const orgs = [
  { name: 'Chess Club', memberCount: 25, status: 'Active' },
  { name: 'Drama Society', memberCount: 40, status: 'Active' },
  { name: 'Debate Team', memberCount: 30, status: 'Inactive' },
  { name: 'Music Band', memberCount: 15, status: 'Active' },
  { name: 'Coding Club', memberCount: 50, status: 'Active' },
  { name: 'Environmental Club', memberCount: 20, status: 'Active' },
  { name: 'Sports Club', memberCount: 60, status: 'Active' },
  { name: 'Photography Club', memberCount: 35, status: 'Inactive' },
  { name: 'Volunteer Society', memberCount: 45, status: 'Active' },
  { name: 'Art Club', memberCount: 10, status: 'Active' }
];

const OrganizationsList = () => {
  const [organizations, setOrganizations] = useState(orgs);
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

  const sortedOrganizations = [...organizations].sort((a, b) => {
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

  const filteredOrganizations = sortedOrganizations.filter((org) =>
    org.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="org-list-container">
      <input
        type="text"
        placeholder="Search by name..."
        value={searchTerm}
        onChange={handleSearch}
        className="org-search-bar"
      />
      <div className="org-grid-container">
        <table className="org-table">
          <thead>
            <tr>
              <th onClick={() => requestSort('name')} className={`org-th ${getClassNamesFor('name')}`}>
                Name
              </th>
              <th onClick={() => requestSort('memberCount')} className={`org-th ${getClassNamesFor('memberCount')}`}>
                Member Count
              </th>
              <th onClick={() => requestSort('status')} className={`org-th ${getClassNamesFor('status')}`}>
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredOrganizations.map((org, index) => (
              <tr key={index} className="org-tr">
                <td className="org-td">{org.name}</td>
                <td className="org-td">{org.memberCount}</td>
                <td className="org-td">{org.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrganizationsList;
