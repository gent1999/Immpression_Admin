import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "@styles/listview.css";

function ListView({ data, type, onDelete }) {
  const navigate = useNavigate();
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key) {
      if (sortConfig.direction === "asc") direction = "desc";
      else if (sortConfig.direction === "desc") direction = null;
      else direction = "asc";
    }

    setSortConfig({ key, direction });

    if (!direction) return;

    data.sort((a, b) => {
      if (key === "createdAt") {
        return direction === "asc"
          ? new Date(a[key]) - new Date(b[key])
          : new Date(b[key]) - new Date(a[key]);
      } else {
        return direction === "asc"
          ? (a[key] || "").localeCompare(b[key] || "")
          : (b[key] || "").localeCompare(a[key] || "");
      }
    });
  };

  const getArrow = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === "asc" ? " \u2B07\uFE0F" : " \u2B06\uFE0F";
    }
    return "";
  };

  const HEADERS =
    type === "users"
      ? [
        { label: "Profile", sortable: false },
        {
          label: "Name",
          sortable: true,
          onClick: () => handleSort("name"),
          arrow: getArrow("name"),
        },
        {
          label: "Email",
          sortable: true,
          onClick: () => handleSort("email"),
          arrow: getArrow("email"),
        },
        {
          label: "Stripe",
          sortable: false,
        },
        {
          label: "Joined",
          sortable: true,
          onClick: () => handleSort("createdAt"),
          arrow: getArrow("createdAt"),
        },
      ]
      : type === "orders"
        ? [
          { label: "Image", sortable: false },
          {
            label: "Title",
            sortable: true,
            onClick: () => handleSort("artName"),
            arrow: getArrow("artName"),
          },
          {
            label: "Artist",
            sortable: true,
            onClick: () => handleSort("artistName"),
            arrow: getArrow("artistName"),
          },
          {
            label: "Status",
            sortable: true,
            onClick: () => handleSort("status"),
            arrow: getArrow("status"),
          },
          {
            label: "Date Uploaded",
            sortable: true,
            onClick: () => handleSort("createdAt"),
            arrow: getArrow("createdAt"),
          },
          { label: "Actions", sortable: false },
        ]
        : [
          { label: "Image", sortable: false },
          {
            label: "Title",
            sortable: true,
            onClick: () => handleSort("name"),
            arrow: getArrow("name"),
          },
          {
            label: "Artist",
            sortable: true,
            onClick: () => handleSort("artistName"),
            arrow: getArrow("artistName"),
          },
          { label: "Status", sortable: false },
          {
            label: "Date Uploaded",
            sortable: true,
            onClick: () => handleSort("createdAt"),
            arrow: getArrow("createdAt"),
          },
        ];

  const renderTableRowContent = (item) => {
    if (type === "users") {
      return (
        <>
          <td>
            <img
              src={item.profilePictureLink || "https://via.placeholder.com/50"}
              alt={item.name}
              className="profile-image"
            />
          </td>
          <td>{item.name}</td>
          <td>{item.email}</td>
          <td className="status-cell">
            <span className={`status ${item.stripeLinked ? "approved" : "rejected"}`}>
              {item.stripeLinked ? "LINKED" : "NOT LINKED"}
            </span>
          </td>
          <td>{new Date(item.createdAt).toLocaleDateString()}</td>
        </>
      );
    } else if (type === "orders") {
      return (
        <>
          <td>
            <img
              src={item.imageLink || "https://via.placeholder.com/50"}
              alt={item.artName}
              className="list-image"
            />
          </td>
          <td>{item.artName}</td>
          <td>{item.artistName}</td>
          <td className="status-cell">
            <span className={`status ${String(item.status || "").toLowerCase()}`}>
              {(item.status || "").toUpperCase()}
            </span>
          </td>
          <td>{new Date(item.createdAt).toLocaleDateString()}</td>
          <td className="actions-cell" onClick={(e) => e.stopPropagation()}>
            <button
              className="delete-btn"
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm("Are you sure you want to delete this order?")) {
                  onDelete && onDelete(item._id);
                }
              }}
              title="Delete Order"
            >
              🗑️
            </button>
          </td>
        </>
      );
    } else {
      return (
        <>
          <td>
            <img
              src={item.imageLink}
              alt={item.name}
              className="list-image"
            />
          </td>
          <td>{item.name}</td>
          <td>{item.artistName}</td>
          <td className="status-cell">
            <span className={`status ${item.stage}`}>{item.stage}</span>
          </td>
          <td>{new Date(item.createdAt).toLocaleDateString()}</td>
        </>
      );
    }
  };

  return (
    <div className="list-view">
      <div className="table-container">
        <table>
          <thead>
            <tr>
              {HEADERS.map((header, index) => (
                <th
                  key={index}
                  className={header.sortable ? "sortable" : ""}
                  onClick={header.sortable ? header.onClick : undefined}
                >
                  {header.label}
                  {header.arrow}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr
                key={item._id}
                className="clickable-row"
                onClick={() =>
                  type === "users"
                    ? navigate(`/user/${item._id}`)
                    : type === "orders"
                      ? navigate(`/order/${item._id}`, {
                        state: { imageLink: item.imageLink }, // ✅ pass imageLink to OrderDetails
                      })
                      : navigate(`/art/${item._id}`)
                }
              >
                {renderTableRowContent(item)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ListView;
