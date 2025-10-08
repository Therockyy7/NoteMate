export interface UserType {
  _id: string;
  username: string;
  email: string;
  profileImage: string;
  subscription: {
    plan: "free" | "pro";
    startDate: string;
    endDate: string | null;
    status: "active" | "expired" | "cancelled";
    paymentMethod: string | null;
    transactionId: string | null;
  };
  isPro: boolean;
  createdAt: string;
}
