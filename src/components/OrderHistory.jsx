import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { getUserOrders } from '../services/orderService';

const formatDate = (value) => {
  if (!value) {
    return 'Unknown date';
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Unknown date' : date.toLocaleString();
};

function OrderHistory() {
  const user = useSelector((state) => state.auth.user);
  const [selectedOrderId, setSelectedOrderId] = useState('');

  const ordersQuery = useQuery({
    queryKey: ['orders', user?.uid],
    queryFn: () => getUserOrders(user.uid),
    enabled: Boolean(user?.uid),
  });

  const orders = ordersQuery.data ?? [];
  const selectedOrder = orders.find((order) => order.id === selectedOrderId) ?? orders[0] ?? null;

  useEffect(() => {
    if (orders.length > 0 && !selectedOrderId) {
      setSelectedOrderId(orders[0].id);
    }
  }, [orders, selectedOrderId]);

  if (!user) {
    return null;
  }

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Purchase history</p>
          <h2>Orders</h2>
        </div>
        <button className="ghost-button" type="button" onClick={() => ordersQuery.refetch()}>
          Refresh
        </button>
      </div>

      {ordersQuery.isLoading ? (
        <p className="muted-copy">Loading order history...</p>
      ) : ordersQuery.isError ? (
        <p className="notice error">Unable to load orders from Firestore.</p>
      ) : orders.length === 0 ? (
        <p className="muted-copy">No orders have been placed yet.</p>
      ) : (
        <div className="order-history-layout">
          <div className="order-list">
            {orders.map((order) => {
              const isActive = order.id === selectedOrder?.id;
              return (
                <button
                  key={order.id}
                  type="button"
                  className={isActive ? 'order-item active' : 'order-item'}
                  onClick={() => setSelectedOrderId(order.id)}
                >
                  <strong>{order.id}</strong>
                  <span>{formatDate(order.createdAt)}</span>
                  <span>${Number(order.totalAmount ?? 0).toFixed(2)}</span>
                </button>
              );
            })}
          </div>

          {selectedOrder && (
            <div className="order-detail">
              <div className="detail-grid">
                <div>
                  <p className="label">Order ID</p>
                  <strong>{selectedOrder.id}</strong>
                </div>
                <div>
                  <p className="label">Created</p>
                  <strong>{formatDate(selectedOrder.createdAt)}</strong>
                </div>
                <div>
                  <p className="label">Total</p>
                  <strong>${Number(selectedOrder.totalAmount ?? 0).toFixed(2)}</strong>
                </div>
                <div>
                  <p className="label">Placed by</p>
                  <strong>{selectedOrder.userEmail ?? user.email}</strong>
                </div>
              </div>

              <div className="order-products">
                {selectedOrder.items?.map((item) => (
                  <div key={`${selectedOrder.id}-${item.id}`} className="order-product-row">
                    <div>
                      <strong>{item.title}</strong>
                      <p className="muted-copy">Qty {item.quantity}</p>
                    </div>
                    <span>${Number(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

export default OrderHistory;
