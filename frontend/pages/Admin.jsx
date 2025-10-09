import React, { useEffect, useState } from "react";
import API from "../utils/axiosClient";

export default function Admin() {
  const [therapists, setTherapists] = useState([]);

  const fetchTherapists = async () => {
    try {
      const res = await API.get("/therapis/all");
      setTherapists(res.data);
    } catch (err) {
      console.error("Error fetching therapists:", err);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await API.patch(`/therapis/${id}/status`, { status });
      fetchTherapists();
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  useEffect(() => {
    fetchTherapists();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Therapist Applications</h1>

      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-2 border">Name</th>
            <th className="p-2 border">Email</th>
            <th className="p-2 border">Specialization</th>
            <th className="p-2 border">Experience</th>
            <th className="p-2 border">Status</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {therapists.map((t) => (
            <tr key={t._id}>
              <td className="p-2 border">{t.name}</td>
              <td className="p-2 border">{t.email}</td>
              <td className="p-2 border">{t.specialization}</td>
              <td className="p-2 border">{t.experience} yrs</td>
              <td className="p-2 border font-semibold">{t.status}</td>
              <td className="p-2 border space-x-2">
                <button
                  onClick={() => updateStatus(t._id, "accepted")}
                  className="bg-green-500 text-white px-3 py-1 rounded"
                >
                  Accept
                </button>
                <button
                  onClick={() => updateStatus(t._id, "rejected")}
                  className="bg-red-500 text-white px-3 py-1 rounded"
                >
                  Reject
                </button>
                <button
                  onClick={() => updateStatus(t._id, "pending")}
                  className="bg-yellow-500 text-white px-3 py-1 rounded"
                >
                  Pending
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
