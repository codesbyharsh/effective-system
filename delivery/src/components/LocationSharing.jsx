import { useState, useEffect } from "react";
import axios from "axios";

const API = "http://localhost:5000/api";

const LocationSharing = ({ user }) => {
  const [sharing, setSharing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let interval;
    if (sharing) {
      interval = setInterval(() => {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            try {
              await axios.post(`${API}/rider/location`, {
                username: user.username,
                name: user.name,
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude,
                timestamp: new Date(),
              });
            } catch {
              setError("Failed to update location");
            }
          },
          () => setError("Failed to get location"),
          { enableHighAccuracy: true }
        );
      }, 3000); // every 3 sec
    }
    return () => clearInterval(interval);
  }, [sharing, user]);

  return (
    <div style={{ margin: "10px 0" }}>
      <button onClick={() => setSharing((prev) => !prev)}>
        {sharing ? "Stop Location Sharing" : "Start Location Sharing"}
      </button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default LocationSharing;
