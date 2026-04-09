const BASE = "http://localhost:8081/api";

// Shared request handler
const request = async (url, options = {}) => {
  const res = await fetch(`${BASE}${url}`, {
    ...(options.body && {
      headers: { "Content-Type": "application/json" }
    }),
    ...options,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed: ${res.status}`);
  }

  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return res.json();
  }
  return res.text();
};

// ---------------- ACTIVITIES ----------------

export const getActivities = () =>
  request("/activities");

export const getMyActivities = (userId) =>
  request(`/activities/students/${userId}/activities`);

export const createActivity = (activity) =>
  request("/activities", {
    method: "POST",
    body: JSON.stringify(activity),
  });

export const deleteActivity = (id) =>
  request(`/activities/${id}`, {
    method: "DELETE",
  });

// 🔥 REQUIRED FEATURE
export const getStudentsByActivity = (activityId) =>
  request(`/activities/${activityId}/students`);

// ---------------- REGISTRATION ----------------

export const registerActivity = (userId, activityId) =>
  request("/activities/register", {
    method: "POST",
    body: JSON.stringify({ userId, activityId }),
  });

export const unregisterActivity = (userId, activityId) =>
  request("/activities/unregister", {
    method: "POST",
    body: JSON.stringify({ userId, activityId }),
  });