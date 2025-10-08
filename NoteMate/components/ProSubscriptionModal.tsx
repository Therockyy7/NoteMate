import React, { useState, useMemo } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import * as WebBrowser from "expo-web-browser";
import axios from "axios";
import { useAuthStore } from "../store/authStore.js";
import { MaterialCommunityIcons } from "@expo/vector-icons"; // Cần cài đặt expo install @expo/vector-icons
import { API_URL } from "../../../NoteMate/NoteMate/constants/api.js";

type ProSubscriptionModalProps = {
  visible: boolean;
  onClose: () => void;
};

// Dữ liệu gói cập nhật theo hình ảnh
const plans = [
  {
    duration: 1,
    label: "1 tháng",
    price: 39000,
    originalPrice: 39000,
    discount: 0,
    labelDiscount: "",
  },
  {
    duration: 3,
    label: "3 tháng",
    price: 111150,
    originalPrice: 117000,
    discount: 5,
    labelDiscount: "-5%",
  },
  {
    duration: 6,
    label: "6 tháng",
    price: 187200,
    originalPrice: 234000,
    discount: 20,
    labelDiscount: "-20%",
  },
  {
    duration: 12,
    label: "12 tháng",
    price: 327600,
    originalPrice: 468000,
    discount: 30,
    labelDiscount: "-30%",
  },
];

// Hàm định dạng tiền tệ Việt Nam (VND)
const formatVND = (amount: number) => {
  return amount.toLocaleString("vi-VN") + " đ";
};

const ProSubscriptionModal: React.FC<ProSubscriptionModalProps> = ({
  visible,
  onClose,
}) => {
  // Mặc định chọn gói 1 tháng như trong hình
  const [selectedPlanDuration, setSelectedPlanDuration] = useState<number>(
    plans[0].duration
  );
  const { token } = useAuthStore();

  // Tìm gói đang được chọn
  const selectedPlan = useMemo(() => {
    return plans.find((p) => p.duration === selectedPlanDuration);
  }, [selectedPlanDuration]);

  // Hàm xử lý thanh toán (không thay đổi)
  const handleSubscribe = async () => {
    if (!selectedPlanDuration) {
      Alert.alert("Thông báo", "Vui lòng chọn gói Pro trước khi thanh toán");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/payment/subscribe`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ planDuration: selectedPlanDuration }),
      });

      // Lấy text trước, vì server có thể trả HTML
      const text = await response.text();
      console.log("Server response:", text);

      // Cố gắng parse JSON
      let data;
      try {
        data = JSON.parse(text);
      } catch (err) {
        console.error("Cannot parse JSON:", err, text);
        Alert.alert(
          "Error",
          "Server trả về không phải JSON. Kiểm tra console."
        );
        return;
      }

      if (!response.ok)
        throw new Error(data.message || "Không thể tạo thanh toán");

      if (data.paymentUrl) {
        await WebBrowser.openBrowserAsync(data.paymentUrl);
        Alert.alert(
          "Thành công",
          "Tài khoản của bạn đã nâng cấp lên Tài khoản Pro, hãy bắt đầu sử dụng ngay tính năng, tiện ích của tài khoản này nhé."
        );
        onClose();
      }
    } catch (error) {
      console.error("Error subscribe:", error);
      Alert.alert(
        "Lỗi",
        error instanceof Error
          ? error.message
          : "Không thể tạo thanh toán, vui lòng thử lại."
      );
    }
  };
  return (
    <Modal
      visible={visible}
      animationType="fade" // Đổi animationType thành 'fade' hoặc 'none' cho giống popup
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Nút đóng góc phải */}
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <MaterialCommunityIcons name="close" size={24} color="#666" />
          </TouchableOpacity>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Tiêu đề */}
            <Text style={styles.title}>Sign up for a Pro Account</Text>

            {/* Gói đang chọn */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                You are selecting a package
              </Text>
              <View style={styles.selectedPackageContainer}>
                <MaterialCommunityIcons
                  name="file-chart-outline"
                  size={18}
                  color="#e17156"
                />
                <Text style={styles.selectedPackageText}>Pro</Text>
              </View>
            </View>

            {/* Thời lượng */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Duration</Text>
              <View style={styles.plansGrid}>
                {plans.map((plan) => (
                  <TouchableOpacity
                    key={plan.duration}
                    style={[
                      styles.planButton,
                      selectedPlanDuration === plan.duration &&
                        styles.planSelected,
                    ]}
                    onPress={() => setSelectedPlanDuration(plan.duration)}
                  >
                    {/* radio button */}
                    <View style={styles.planRadio}>
                      <View
                        style={[
                          styles.radioCircle,
                          selectedPlanDuration === plan.duration &&
                            styles.radioSelected,
                        ]}
                      />
                    </View>
                    {/* Nội dung gói */}
                    <View style={styles.planContent}>
                      <Text style={styles.planDurationText}>{plan.label}</Text>

                      <View style={styles.priceContainer}>
                        {plan.discount > 0 && (
                          <Text style={styles.originalPrice}>
                            {formatVND(plan.originalPrice)}
                          </Text>
                        )}
                        <Text style={styles.currentPrice}>
                          {formatVND(plan.price)}
                        </Text>
                      </View>
                    </View>

                    {/* Chiết khấu (nếu có) */}
                    {plan.discount > 0 && (
                      <View style={styles.discountBadge}>
                        <Text style={styles.discountText}>
                          {plan.labelDiscount}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Chi tiết thanh toán */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Payment details</Text>
              <View style={styles.paymentDetailsContainer}>
                <View style={styles.paymentRow}>
                  <Text style={styles.paymentLabel}>You pay</Text>
                  <Text style={styles.paymentAmount}>
                    {selectedPlan ? formatVND(selectedPlan.price) : "0 đ"}
                    <Text style={styles.paymentVND}> VND</Text>
                  </Text>
                </View>

                <View style={styles.infoList}>
                  <Text style={styles.infoText}>
                    - Each month is equivalent to 30 days.
                  </Text>
                  <Text style={styles.infoText}>
                    - The system will charge at the time of registration.
                  </Text>
                  <Text style={styles.infoText}>
                    - The service package will be automatically renewed at the
                    end of the period. After registering, you can turn off the
                    automatic mode if you do not need it.
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Nút hành động */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.subscribeBtn}
              onPress={handleSubscribe}
            >
              <Text style={styles.subscribeText}>Pay</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ProSubscriptionModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 8, // Giảm bớt borderRadius cho giống hình
    width: "90%", // Tăng width cho giống popup
    maxHeight: "80%", // Giới hạn chiều cao và cho phép cuộn
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 1,
    padding: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 20,
    textAlign: "center",
    paddingTop: 10,
  },
  // --- Các Section chung ---
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    color: "#4a4a4a",
    marginBottom: 10,
    fontWeight: "500",
  },
  // --- Gói đang chọn ---
  selectedPackageContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    backgroundColor: "#fff0ec", // Màu nền nhẹ cho section 'Nâng cao'
    borderRadius: 4,
    alignSelf: "flex-start",
  },
  selectedPackageText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#e17156",
    marginLeft: 5,
  },
  // --- Thời lượng ---
  plansGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  planButton: {
    width: "48%", // 2 cột
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    padding: 10,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "flex-start",
    position: "relative",
  },
  planSelected: {
    borderColor: "#e17156", // Màu viền khi     ọn
    backgroundColor: "#fff", // Không cần đổi màu nền
  },
  planRadio: {
    paddingRight: 10,
    paddingTop: 3,
  },
  radioCircle: {
    height: 14,
    width: 14,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: "#999",
    alignItems: "center",
    justifyContent: "center",
  },
  radioSelected: {
    borderColor: "#e17156",
    backgroundColor: "#e17156",
    borderWidth: 4,
  },
  planContent: {
    flex: 1,
    alignItems: "flex-start",
  },
  planDurationText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  priceContainer: {
    alignItems: "flex-start",
  },
  originalPrice: {
    fontSize: 12,
    color: "#999",
    textDecorationLine: "line-through",
  },
  currentPrice: {
    fontSize: 14,
    fontWeight: "700",
    color: "#e17156",
  },
  discountBadge: {
    position: "absolute",
    top: -1, // Đặt ở góc trên bên phải
    right: -1,
    backgroundColor: "#00b289", // Màu xanh lá cho discount
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderBottomLeftRadius: 4,
    borderTopRightRadius: 3,
  },
  discountText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#fff",
  },
  // --- Chi tiết thanh toán ---
  paymentDetailsContainer: {
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 4,
    padding: 15,
  },
  paymentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  paymentLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#4a4a4a",
  },
  paymentAmount: {
    fontSize: 18,
    fontWeight: "700",
    color: "#e17156",
  },
  paymentVND: {
    fontSize: 14,
    fontWeight: "500",
    color: "#999",
  },
  infoList: {
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 10,
  },
  infoText: {
    fontSize: 12,
    color: "#666",
    lineHeight: 18,
    marginBottom: 4,
  },
  // --- Nút hành động ---
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    padding: 12,
    borderRadius: 4,
    marginRight: 10,
    alignItems: "center",
  },
  cancelText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "500",
  },
  subscribeBtn: {
    flex: 1,
    backgroundColor: "#e17156", // Màu đỏ cam
    padding: 12,
    borderRadius: 4,
    alignItems: "center",
  },
  subscribeText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
});
