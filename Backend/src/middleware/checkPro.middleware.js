// middleware/checkPro.middleware.js
export const checkPro = (req, res, next) => {
  try {
    // lấy dữ liệu từ JWT payload
    const plan = req.user?.plan || req.user?.subscription?.plan;
    const endDate = req.user?.endDate || req.user?.subscription?.endDate;
    const status = req.user?.subscription?.status || "active";

    // kiểm tra quyền Pro
    if (
      plan === "pro" &&
      endDate &&
      new Date(endDate) > new Date() &&
      status === "active"
    ) {
      return next();
    }

    return res.status(403).json({
      message:
        "❌ Chức năng này chỉ dành cho người dùng Pro. Hãy nâng cấp gói của bạn 🚀",
    });
  } catch (err) {
    console.error("checkPro error:", err);
    return res
      .status(500)
      .json({ message: "Internal server error in checkPro" });
  }
};
