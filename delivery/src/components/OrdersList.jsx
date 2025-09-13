// components/OrdersList.jsx
import OrderItem from "./OrderItem";

const OrdersList = ({ orders, bucket, onToggleBucket, currentUser }) => {
  return (
    <div>
      <h3>Available Orders</h3>
      {orders.length === 0 && <p>No orders available for this pincode</p>}
      {orders.map((order) => (
        <OrderItem
          key={order._id}
          order={order}
          currentUser={currentUser}
          onToggleBucket={() => onToggleBucket(order)}
        />
      ))}
    </div>
  );
};

export default OrdersList;
