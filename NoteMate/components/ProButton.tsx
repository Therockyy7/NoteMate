import { View, Text, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import { useAuthStore } from "../store/authStore";
import { useTheme } from "../../NoteMate/contexts/ThemeContext";
import createProfileStyles from "../assets/styles/profile.styles";
import ProSubscriptionModal from "../components/ProSubscriptionModal";

const ProButton = () => {
  const [showPro, setShowPro] = useState(false);
  const { colors } = useTheme();
  const styles = createProfileStyles(colors);

  return (
    <>
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={() => setShowPro(true)}
      >
        <Text>SIGN UP FOR PRO</Text>
      </TouchableOpacity>

      <ProSubscriptionModal
        visible={showPro}
        onClose={() => setShowPro(false)}
      />
    </>
  );
};

export default ProButton;
