import { OrderStatus } from '../types';

export function getStatusClass(status: OrderStatus): string {
  if (status.includes('Pending')) return 'status-pending';
  if (['Approved', 'Truck Assigned', 'In Warehouse', 'Loading', 'Left Warehouse', 'Delivered'].includes(status)) {
    return 'status-approved';
  }
  if (status === 'Rejected') return 'status-rejected';
  if (status === 'Disputed') return 'status-disputed';
  return '';
}

export function getPriorityClass(priority: string): string {
  if (priority === 'Critical') return 'priority-critical';
  if (priority === 'Urgent') return 'priority-urgent';
  if (priority === 'High') return 'priority-high';
  return '';
}

export function formatDuration(milliseconds: number): string {
  if (!milliseconds || milliseconds === 0) return '0d 0h';

  const days = Math.floor(milliseconds / (1000 * 60 * 60 * 24));
  const hours = Math.floor((milliseconds % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) {
    return `${days}d ${hours}h`;
  } else if (hours > 0) {
    return `0d ${hours}h`;
  } else {
    return `0d 0h ${minutes}m`;
  }
}

export function calculateAverage(arr: number[]): number {
  if (arr.length === 0) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

export function filterOrdersByDate<T extends { orderDate: string }>(
  orders: T[],
  startDate: Date,
  endDate: Date
): T[] {
  return orders.filter(order => {
    const orderDate = new Date(order.orderDate);
    return orderDate >= startDate && orderDate <= endDate;
  });
}

export function setDateRange(days: number): { start: Date; end: Date } {
  const end = new Date();
  const start = new Date();

  if (days === 0) {
    start.setHours(0, 0, 0, 0);
  } else if (days === 365) {
    start.setFullYear(2020, 0, 1);
  } else {
    start.setDate(start.getDate() - days);
  }

  return { start, end };
}

export function canSeeFinancialInfo(department: string): boolean {
  return department === 'Sales' || department === 'Management' || department === 'Finance';
}

export function formatDate(dateString: string): string {
  if (!dateString) return '-';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}
