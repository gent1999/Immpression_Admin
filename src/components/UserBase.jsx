import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import UserTopPanel from "./UserTopPanel";
import ListView from "./ListView";
import { getAllUsers } from "../api/API";
import ScreenTemplate from "./Template/ScreenTemplate";
import { useAuth } from "@/context/authContext";
import "@styles/userbase.css";

function UserBase() {
  const navigate = useNavigate();
  const { authState } = useAuth();

  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    async function fetchUsers() {
      if (!authState?.token) {
        navigate("/login");
        return;
      }
      setLoading(true);
      const userList = await getAllUsers(authState.token);
      setUsers(userList);
      setFilteredUsers(userList);
      setLoading(false);
    }
    fetchUsers();
  }, [authState?.token]);

  const handleShowAllUsers = () => {
    setFilteredUsers(users);
    setActiveFilter("all");
  };

  const handleFilterLinked = () => {
    setFilteredUsers(users.filter((u) => Boolean(u.stripeAccountId)));
    setActiveFilter("linked");
  };

  const handleFilterUnlinked = () => {
    setFilteredUsers(users.filter((u) => !u.stripeAccountId));
    setActiveFilter("unlinked");
  };

  const handleSearch = (query) => {
    const q = query.trim().toLowerCase();
    setFilteredUsers(
      users.filter((u) => {
        const nameMatch = u.name ? u.name.toLowerCase().includes(q) : false;
        const emailMatch = u.email ? u.email.toLowerCase().includes(q) : false;
        return nameMatch || emailMatch;
      })
    );
  };

  return (
    <ScreenTemplate>
      <UserTopPanel
        totalUsers={users.length}
        totalLinked={users.filter((u) => Boolean(u.stripeAccountId)).length}
        totalUnlinked={users.filter((u) => !u.stripeAccountId).length}
        onShowAllUsers={handleShowAllUsers}
        onFilterLinked={handleFilterLinked}
        onFilterUnlinked={handleFilterUnlinked}
        onSearch={handleSearch}
        activeFilter={activeFilter}
      />

      <div className="userBaseContent">
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading users…</p>
          </div>
        ) : (
          <div className="users-container">
            <ListView data={filteredUsers} type="users" />
          </div>
        )}
      </div>
    </ScreenTemplate>
  );
}

export default UserBase;
