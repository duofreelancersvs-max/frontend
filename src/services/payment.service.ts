import { api } from "@/lib/api";

export interface CreateOrderResponse {
  order_id: string;
  amount: number;
  currency: string;
}

export interface VerifyPaymentResponse {
  status: "ok" | "failed";
  subscription?: {
    _id: string;
    planId: string;
    status: string;
    startDate: string;
    endDate: string;
  };
}

export interface UpgradePreviewResponse {
  currentPlan: {
    name: string;
    price: number;
    startDate: string;
    endDate: string;
  };
  newPlan: {
    name: string;
    price: number;
  };
  proration: {
    remainingDays: number;
    totalDays: number;
    creditAmount: number;
    dueAmount: number;
  };
}

export const paymentService = {
  createOrder: (planId: string) =>
    api.post<CreateOrderResponse>("/subscriptions/create-order", { planId }),

  verifyPayment: (data: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    planId: string;
  }) => api.post<VerifyPaymentResponse>("/subscriptions/verify-payment", data),

  getUpgradePreview: (planId: string) =>
    api.get<UpgradePreviewResponse>(`/subscriptions/upgrade-preview?planId=${planId}`),
};

export default paymentService;
