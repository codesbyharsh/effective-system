import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import Header from "./Header";
import OrdersList from "./OrdersList";
import BucketPage from "./BucketPage";
import LocationSharing from "./LocationSharing";
import PincodeSelector from "./PincodeSelector";
import './Dashboard.css'

const API = "http://localhost:5000/api";

const Dashboard = () => {
  const { currentUser, logout } = useAuth();
  const [view, setView] = useState("orders");
  const [orders, setOrders] = useState([]);
  const [bucket, setBucket] = useState([]);
  const [completed, setCompleted] = useState([]);
  const [pincodes, setPincodes] = useState([]);
  const [selectedPincode, setSelectedPincode] = useState("");
  const [locationLogs, setLocationLogs] = useState([]); // NEW

  // fetch pincodes
  useEffect(() => {
    axios.get(`${API}/pincodes`).then((res) => setPincodes(res.data.data));
  }, []);

  // fetch orders for selected pincode
  useEffect(() => {
    if (selectedPincode) {
      axios
        .get(`${API}/orders/available/${selectedPincode}`)
        .then((res) => setOrders(res.data))
        .catch(() => setOrders([]));
    }
  }, [selectedPincode]);

  // poll location logs every 5s
  useEffect(() => {
    if (!currentUser?.id) return;

    const interval = setInterval(async () => {
      try {
        const res = await axios.get(`${API}/rider/${currentUser.id}/location`);
        if (res.data?.location) {
          const { lat, lng, updatedAt } = res.data.location;
          setLocationLogs((prev) => [
            `📍 ${lat}, ${lng} at ${new Date(updatedAt).toLocaleTimeString()}`,
            ...prev,
          ]);
        }
      } catch (err) {
        console.error("Failed to fetch location log:", err);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [currentUser]);

  const applyOrderUpdateLocally = (updatedOrder) => {
    setOrders((prev) =>
      prev.map((o) => (o._id === updatedOrder._id ? updatedOrder : o))
    );

    if (updatedOrder.inBucket && updatedOrder.bucketedBy === currentUser?.id) {
      setBucket((prev) =>
        prev.some((o) => o._id === updatedOrder._id)
          ? prev
          : [updatedOrder, ...prev]
      );
    } else {
      setBucket((prev) => prev.filter((o) => o._id !== updatedOrder._id));
    }

    if (updatedOrder.orderStatus === "Delivered") {
      setCompleted((prev) =>
        prev.some((o) => o._id === updatedOrder._id)
          ? prev
          : [updatedOrder, ...prev]
      );
      setOrders((prev) => prev.filter((o) => o._id !== updatedOrder._id));
      setBucket((prev) => prev.filter((o) => o._id !== updatedOrder._id));
    }
  };

  const toggleBucket = async (order) => {
    if (!currentUser?.id) {
      alert("You must be logged in as a rider");
      return;
    }
    const isInBucket = bucket.some((o) => o._id === order._id);
    const url = `${API}/delivery/bucket/${order._id}/${isInBucket ? "remove" : "add"}`;

    try {
      const res = await axios.post(url, { riderId: currentUser.id });
      if (res.data?.order) applyOrderUpdateLocally(res.data.order);
      else applyOrderUpdateLocally(res.data);
    } catch (err) {
      console.error("bucket toggle failed:", err);
      alert(err.response?.data?.error || err.message || "Failed");
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const res = await axios.post(`${API}/orders/${id}/status`, {
        status,
        riderId: currentUser.id,
      });
      if (res.data) applyOrderUpdateLocally(res.data);
    } catch (err) {
      console.error("status update failed:", err);
      alert(err.response?.data?.error || "Failed to update status");
    }
  };

  return (
    <div className='dashboard'>
      <Header user={currentUser} onLogout={logout} />


      {currentUser && <LocationSharing user={currentUser} />}

 {/* 🚀 Location logs */}
      <div
        style={{
          marginTop: "20px",
          padding: "10px",
          border: "1px solid #ccc",
          background: "#fafafa",
          maxHeight: "150px",
          overflowY: "auto",
        }}
      >
        <h4>📡 Location Logs</h4>
        {locationLogs.length === 0 ? (
          <p>No location updates yet.</p>
        ) : (
          <ul>
            {locationLogs.map((log, i) => (
              <li key={i}>{log}</li>
            ))}
          </ul>
        )}
      </div>

   <div style={{ display: "flex", justifyContent: "space-around", margin:"10px" }}>
        <button onClick={() => setView("orders")}>Orders</button>
        <button onClick={() => setView("bucket")}>
          Bucket ({bucket.length})
        </button>
        <button onClick={() => setView("completed")}>
          Completed ({completed.length})
        </button>
      </div>

      <PincodeSelector
        pincodes={pincodes}
        selectedPincode={selectedPincode}
        onPincodeChange={setSelectedPincode}
      />

      {/* Orders/Bucket/Completed */}
      {view === "orders" && (
        <OrdersList orders={orders} bucket={bucket} onToggleBucket={toggleBucket}  currentUser={currentUser} />
      )}
      {view === "bucket" && (
        <BucketPage
          orders={bucket}
          onUpdateStatus={updateStatus}
          onRemove={(id) =>
            setBucket(bucket.filter((o) => o._id !== id))
          }
        />
      )}
      {view === "completed" &&
        completed.map((o) => (
          <div key={o._id}>Order #{o._id.slice(-6)} Delivered</div>
        ))}

     
    </div>
  );
};

export default Dashboard;
