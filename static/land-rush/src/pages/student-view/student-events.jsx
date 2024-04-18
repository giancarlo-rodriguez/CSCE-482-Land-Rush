import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './student.css';
import Cookies from 'js-cookie';

const MembersList = () => {
  const [organizations, setOrganizations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [joinRequests, setJoinRequests] = useState([]);
  const [newOrgName, setNewOrgName] = useState('');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const token = Cookies.get('token');
    if (token) {
      axios.get('http://127.0.0.1:8000/show/orgs', {
        headers: {
          Authorization: `Token ${token}`
        }
      })
      .then(response => {
        setOrganizations(response.data);
      })
      .catch(error => {
        console.error('Error fetching organizations:', error);
      });
    }
  }, []);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleJoinRequest = (organizationName, organizationId, userHasRole) => {
    if (userHasRole === 'Admin') {
      window.location.href = `/org/${organizationId}`;
    } else if (userHasRole === 'Regular member') {
      window.location.href = `/org/${organizationId}/events`;
    } else {
      // Make a POST request to join the organization
      const token = Cookies.get('token');
      axios.post(`http://127.0.0.1:8000/join/org`, { organization: organizationName }, {
        headers: {
          Authorization: `Token ${token}`
        }
      })
      .then(response => {
        console.log('Request to join organization:', organizationName);
        // Optionally, you can update the UI to reflect the successful join request
      })
      .catch(error => {
        console.error('Error joining organization:', error);
        // Handle error, if needed
      });
    }
  };

  const handleCreateOrganization = () => {
    axios.post('http://127.0.0.1:8000/create/org/request', { organization: newOrgName }, {
      headers: {
        Authorization: `Token ${Cookies.get('token')}`
      }
    })
    .then(() => {
      setNewOrgName('');
      setShowModal(false);
      // Refetch the updated organization list from the server
      axios.get('http://127.0.0.1:8000/show/orgs', {
        headers: {
          Authorization: `Token ${Cookies.get('token')}`
        }
      })
      .then(response => {
        setOrganizations(response.data);
      })
      .catch(error => {
        console.error('Error fetching organizations:', error);
      });
    })
    .catch(error => {
      console.error('Error creating organization:', error);
    });
  };
  
  const sortedOrganizations = organizations.sort((a, b) => {
    if (a.user_has_role === 'Admin') {
      return -1; // a comes before b
    } else if (b.user_has_role === 'Admin') {
      return 1; // b comes before a
    } else if (a.user_has_role === 'Regular member') {
      return -1; // a comes before b
    } else if (b.user_has_role === 'Regular member') {
      return 1; // b comes before a
    } else {
      return 0; // no change in order
    }
  });

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
        <button onClick={() => setShowModal(true)}>Add Organization</button>
        {showModal && (
          <div className="modal">
            <div className="modal-content">
              <span className="close" onClick={() => setShowModal(false)}>&times;</span>
              <input
                type="text"
                placeholder="Enter organization name..."
                value={newOrgName}
                onChange={(e) => setNewOrgName(e.target.value)}
              />
              <button onClick={handleCreateOrganization}>Create</button>
            </div>
          </div>
        )}
        <table className="member-table">
          <thead>
            <tr>
              <th>Organization</th>
              <th>Membership Status</th>
              <th>Join Request</th>
            </tr>
          </thead>
          <tbody>
            {sortedOrganizations.map((organization, index) => (
              <tr key={index} className="member-tr">
                <td>{organization.name}</td>
                <td>{organization.user_has_role}</td>
                <td>
                  <button onClick={() => handleJoinRequest(organization.name, organization.id, organization.user_has_role)}>
                    {organization.user_has_role === 'Admin' ? 'Go to Organization' :
                      organization.user_has_role === 'Regular member' ? 'View Events' :
                        'Request to Join'}
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