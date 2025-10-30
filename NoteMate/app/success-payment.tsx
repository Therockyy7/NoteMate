import React, { useState } from "react";
import { View, Text, Modal, TouchableOpacity, StyleSheet } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function SuccessPayment() {
  const [visible, setVisible] = useState(true);

  const handleClose = () => {
    setVisible(false);
    router.replace("/profile");
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Tiêu đề và nút đóng */}
          <View style={styles.header}>
            <Text style={styles.title}>Đăng ký thành công</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <MaterialCommunityIcons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Nội dung thông báo */}
          <View style={styles.content}>
            <MaterialCommunityIcons
              name="check-circle"
              size={24}
              color="#38a858" // Màu xanh lá của icon check
              style={styles.icon}
            />
            <Text style={styles.message}>
              Bạn đã kích hoạt thành công dịch vụ {"\n"}
              <Text style={styles.highlight}>Tài khoản Pro</Text>. Bây giờ hãy
              trải nghiệm những tính năng thú vị dành cho bạn.
            </Text>
          </View>

          {/* Nút xác nhận */}
          <TouchableOpacity style={styles.confirmBtn} onPress={handleClose}>
            <Text style={styles.confirmText}>Xác nhận</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modal: {
    backgroundColor: "#fff",
    borderRadius: 6, // Góc bo nhẹ
    width: "85%", // Kích thước rộng hơn
    maxWidth: 350,
    paddingTop: 15,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee", // Đường phân cách nhẹ
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  closeButton: {
    padding: 5,
  },
  content: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 20,
  },
  icon: {
    marginRight: 10,
    marginTop: 2, // Căn chỉnh cho icon thẳng hàng với dòng văn bản đầu
  },
  message: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    color: "#4a4a4a",
  },
  highlight: {
    fontWeight: "700",
    color: "#4a4a4a", // Giữ màu chữ đậm như văn bản thường, chỉ in đậm
  },
  confirmBtn: {
    backgroundColor: "#e14e44", // Màu đỏ của nút Xác nhận
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 4,
    alignSelf: "flex-end", // Căn phải
    margin: 20, // margin để tách khỏi nội dung
    // Bỏ elevation/shadow nếu không cần
  },
  confirmText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
