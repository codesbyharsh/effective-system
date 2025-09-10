import OrderItem from "./OrderItem";

const BucketPage = ({ orders, onUpdateStatus, onRemove }) => {
  return (
    <div>
      <h3>Your Bucket</h3>
      {orders.length === 0 && <p>No orders in bucket</p>}
      {orders.map((order) => (
        <OrderItem
          key={order._id}
          order={order}
          inBucket={true}
          onUpdateStatus={onUpdateStatus}
          onToggleBucket={() => onRemove(order._id)}
        />
      ))}
    </div>
  );
};

export default BucketPage;
