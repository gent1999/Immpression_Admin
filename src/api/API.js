import axios from "axios";

// ✅ Load API URL correctly for Vite
const API_URL = import.meta.env.VITE_API_URL;

console.log("🔍 API URL:", API_URL); // ✅ Debugging Step

// ✅ Function to fetch all images
// ✅ Function to fetch all images
export async function getAllImages(token, page=1, limit=50, query) {
  try {
    // set up pagination query
    const params = {
      page: page,
      limit: limit,
      input: query.input,
      stage: query.stage,
    };

    const response = await axios.get(`${API_URL}/api/admin/all_images`, {
      headers: { Authorization: `Bearer ${token}` },
      params,
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching images:", error.response?.data || error);
    return [];
  }
}

// ✅ Function to load statistics of all images
export async function getAllImagesStats(token) {
  try {
    const response = await axios.get(`${API_URL}/api/admin/all_images/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  }
  catch (error) {
    console.error("Error fetching images stats:", error.response?.data || error);
    return [];
  }
}

// ✅ Function to handle admin login
export async function loginAdmin(email, password) {
  try {
    const response = await axios.post(`${API_URL}/api/admin/login`, {
      email,
      password,
    });

    return response.data; // ✅ Return token and message
  } catch (error) {
    console.error("Login error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Login failed. Please try again.");
  }
}

// ✅ Function to renew auth user token before session expired
export async function renewToken(token){
  try{
    const response = await axios.post(`${API_URL}/api/admin/renew_token`,
      {},
      { headers: { Authorization: `Bearer ${token}` }, }
    );
    return response.data;
  }
  catch(error){
    console.error("Renew token error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Renew token failed. Please try again.");
  }
}

// ✅ Function to fetch a single artwork by ID
export async function getArtwork(id, token) {
  try {
    const response = await axios.get(`${API_URL}/api/admin/art/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data.art; // ✅ Return artwork data
  } catch (error) {
    console.error("Error fetching artwork:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Failed to fetch artwork.");
  }
}

// ✅ Function to approve an artwork
export async function approveArtwork(id, token) {
  try {
    const response = await axios.put(
      `${API_URL}/api/admin/art/${id}/approve`,
      {},
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data; // ✅ Return updated artwork data
  } catch (error) {
    console.error("Error approving artwork:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Failed to approve artwork.");
  }
}

export const rejectArtwork = async (id, token) => {
    const response = await fetch(`${API_URL}/api/admin/art/${id}/reject`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error("Failed to reject artwork");
    }

    return await response.json();
};

export async function getAllUsers(token) {
  try {
    const response = await axios.get(`${API_URL}/api/admin/users`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data.users.map(user => ({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      profilePictureLink: user.profilePictureLink || "https://via.placeholder.com/50",
      // NEW
      stripeAccountId: user.stripeAccountId || null,
      stripeLinked: Boolean(user.stripeAccountId),
      stripeOnboardingCompleted: Boolean(user.stripeOnboardingCompleted),
    }));
  } catch (error) {
    console.error("Error fetching users:", error.response?.data || error.message);
    return [];
  }
}

  export async function getUserDetails(id, token) {
    try {
        const response = await axios.get(`${API_URL}/api/admin/user/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        return response.data.user;
    } catch (error) {
        console.error("Error fetching user details:", error.response?.data || error.message);
        throw new Error("Failed to fetch user details.");
    }
}

// ✅ Function to delete an artwork by ID (admin only)
export async function deleteArtwork(id, token) {
  try {
    const response = await axios.delete(`${API_URL}/api/admin/art/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data; // Returns success message
  } catch (error) {
    console.error("Error deleting artwork:", error.response?.data || error.message);
    throw new Error(error.response?.data?.error || "Failed to delete artwork.");
  }
}

  // ✅ Function to delete a user by ID (admin only)
export async function deleteUser(id, token) {
  try {
    const response = await axios.delete(`${API_URL}/api/admin/user/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data; // Returns success message
  } catch (error) {
    console.error("Error deleting user:", error.response?.data || error.message);
    throw new Error(error.response?.data?.error || "Failed to delete user.");
  }
}

export async function getAllOrders(token, page = 1, limit = 50) {
  try {
    const params = { page, limit };
    const response = await axios.get(`${API_URL}/orders`, {
      headers: { Authorization: `Bearer ${token}` },
      params,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching orders:", error.response?.data || error.message);
    return { data: [], pagination: { totalPages: 1 } };
  }
}

export async function getOrderById(orderId, token) {
  try {
    const response = await axios.get(`${API_URL}/orderDetails/${orderId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.data;
  } catch (error) {
    console.error("Error fetching order by ID:", error.response?.data || error);
    throw new Error("Failed to fetch order.");
  }
}

// ✅ Function to delete an order by ID (admin only)
export async function deleteOrder(id, token) {
  try {
    const response = await axios.delete(`${API_URL}/order/${id}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data; // Returns success message
  } catch (error) {
    console.error("Error deleting order:", error.response?.data || error.message);
    throw new Error(error.response?.data?.error || error.response?.data?.message || "Failed to delete order.");
  }
}

// ========= Payouts (Admin) =========

// Preview the seller payout for an order (after Stripe fee, minus tax, minus 3% base hold)
export async function getPayoutPreview(orderId, token) {
  try {
    const res = await axios.get(`${API_URL}/order/${orderId}/payout-preview`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    // Server returns:
    // { success, data: { base, shipping, tax, stripeFee, platformHoldOnBase,
    //   sellerDueCents, sellerTransferredCents, sellerRemainingCents, currency, chargeId, transferGroup } }
    return res.data;
  } catch (error) {
    console.error("Error loading payout preview:", error?.response?.data || error);
    throw new Error(
      error?.response?.data?.error || "Failed to load payout preview."
    );
  }
}

// Execute the payout to the seller for this order.
// By default the server will send the full remaining amount.
// Pass { amountCents } to send a partial or custom amount (in cents).
export async function payoutOrder(orderId, token, { amountCents } = {}) {
  try {
    const body = {};
    if (Number.isFinite(amountCents)) body.amountCents = Math.max(0, Math.round(Number(amountCents)));

    const res = await axios.post(
      `${API_URL}/order/${orderId}/payout`,
      body,
      { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
    );
    // Server returns:
    // { success, data: { transferId, amountCents, currency, sellerTransferredCents, sellerRemainingCents } }
    return res.data;
  } catch (error) {
    console.error("Error executing payout:", error?.response?.data || error);
    throw new Error(
      error?.response?.data?.error || "Failed to execute payout."
    );
  }
}

// ========= Analytics (Admin) =========

export async function getAnalytics(token) {
  try {
    const response = await axios.get(`${API_URL}/api/admin/analytics`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching analytics:", error.response?.data || error.message);
    return { success: false, data: null };
  }
}

// ========= Reports Management (Admin - Apple Guideline 1.2 Compliance) =========

// Get all reports with pagination and filters
export async function getAllReports(token, page = 1, limit = 20, filters = {}) {
  try {
    const params = { page, limit, ...filters };
    const response = await axios.get(`${API_URL}/api/admin/reports`, {
      headers: { Authorization: `Bearer ${token}` },
      params,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching reports:", error.response?.data || error.message);
    return { success: false, data: [], pagination: { totalPages: 1 } };
  }
}

// Get reports dashboard statistics
export async function getReportsStats(token) {
  try {
    const response = await axios.get(`${API_URL}/api/admin/reports/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching reports stats:", error.response?.data || error.message);
    return { success: false, data: null };
  }
}

// Get single report by ID
export async function getReportById(id, token) {
  try {
    const response = await axios.get(`${API_URL}/api/admin/reports/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching report:", error.response?.data || error.message);
    throw new Error(error.response?.data?.error || "Failed to fetch report.");
  }
}

// Update report status
export async function updateReportStatus(id, status, token) {
  try {
    const response = await axios.patch(
      `${API_URL}/api/admin/reports/${id}/status`,
      { status },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating report status:", error.response?.data || error.message);
    throw new Error(error.response?.data?.error || "Failed to update report status.");
  }
}

// Warn user for reported content
export async function warnReportedUser(reportId, message, token) {
  try {
    const response = await axios.post(
      `${API_URL}/api/admin/reports/${reportId}/action/warn-user`,
      { message },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    console.error("Error warning user:", error.response?.data || error.message);
    throw new Error(error.response?.data?.error || "Failed to warn user.");
  }
}

// Suspend user for reported content
export async function suspendReportedUser(reportId, durationDays, message, token) {
  try {
    const response = await axios.post(
      `${API_URL}/api/admin/reports/${reportId}/action/suspend-user`,
      { durationDays, message },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    console.error("Error suspending user:", error.response?.data || error.message);
    throw new Error(error.response?.data?.error || "Failed to suspend user.");
  }
}

// Ban user for reported content
export async function banReportedUser(reportId, reason, token) {
  try {
    const response = await axios.post(
      `${API_URL}/api/admin/reports/${reportId}/action/ban-user`,
      { reason },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    console.error("Error banning user:", error.response?.data || error.message);
    throw new Error(error.response?.data?.error || "Failed to ban user.");
  }
}

// Remove reported content
export async function removeReportedContent(reportId, token) {
  try {
    const response = await axios.post(
      `${API_URL}/api/admin/reports/${reportId}/action/remove-content`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    console.error("Error removing content:", error.response?.data || error.message);
    throw new Error(error.response?.data?.error || "Failed to remove content.");
  }
}

// Dismiss report
export async function dismissReport(reportId, reason, token) {
  try {
    const response = await axios.post(
      `${API_URL}/api/admin/reports/${reportId}/action/dismiss`,
      { reason },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    console.error("Error dismissing report:", error.response?.data || error.message);
    throw new Error(error.response?.data?.error || "Failed to dismiss report.");
  }
}
