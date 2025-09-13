// src/components/LocationSharing.jsx
import { useState, useEffect, useRef } from "react";
import axios from "axios";

const API = "http://localhost:5000/api";

export default function LocationSharing({ user }) {
  const [sharing, setSharing] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const startSharing = () => {
    if (!user?.id) {
      alert("Please login as rider");
      return;
    }

    setSharing(true);

    intervalRef.current = setInterval(() => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            try {
              const { latitude, longitude } = pos.coords;
              await axios.post(`${API}/rider/${user.id}/location`, {
                lat: latitude,
                lng: longitude,
              });
              console.log("Location sent:", latitude, longitude);
            } catch (err) {
              console.error("Failed to send location:", err);
            }
          },
          (err) => console.error("Geolocation error:", err),
          { enableHighAccuracy: true }
        );
      }
    }, 3000);
  };

  const stopSharing = () => {
    setSharing(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  return (
    <div style={{ margin: "10px 0" }}>
      {sharing ? (
        <button onClick={stopSharing} style={{ background: "red", color: "#fff" }}>
          Stop Sharing Location
        </button>
      ) : (
        <button onClick={startSharing} style={{ background: "green", color: "#fff" }}>
          Start Sharing Location
        </button>
      )}
    </div>
  );
}
