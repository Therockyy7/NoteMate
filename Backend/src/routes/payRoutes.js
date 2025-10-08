import express from "express";
import { VNPay, ignoreLogger, ProductCode, VnpLocale } from "vnpay";
import dateFormat from "dateformat";
import protectRoute from "../middleware/auth.middleware.js";
import User from "../models/User.js";
const API_URL = process.env.API_URL;

const router = express.Router();

router.post("/subscribe", protectRoute, async (req, res) => {
  try {
    const { planDuration } = req.body;
    const user = req.user;
    //Bang gia
    const planPrices = {
      1: 39000, // 1 tháng
      3: 117000, // 3 tháng
      6: 234000, // 6 tháng
      12: 468000, // 12 tháng
    };

    const totalPrice = planPrices[planDuration];
    if (!totalPrice)
      return res.status(400).json({ message: "Gói không hợp lệ" });

    const txnRef = `${Date.now()}-${user._id}`;
    const orderInfo = `Đăng ký Pro #${txnRef}`;

    const vnpay = new VNPay({
      tmnCode: "DH2F13SW",
      secureSecret: "7VJPG70RGPOWFO47VSBT29WPDYND0EJG",
      vnpayHost: "https://sandbox.vnpayment.vn",
      testMode: true,
      hashAlgorithm: "SHA512",
      loggerFn: ignoreLogger,
    });

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const vnpayUrl = await vnpay.buildPaymentUrl({
      vnp_IpAddr: req.ip || "127.0.0.1",
      vnp_Amount: totalPrice,
      vnp_TxnRef: txnRef,
      vnp_OrderInfo: orderInfo,
      //Nay la IP may' nen doi lai localhost:3000/4000
      // vnp_ReturnUrl: `http://10.12.48.155:3000/api/payment/callback-vnpay?txnRef=${txnRef}&duration=${planDuration}&userId=${user._id}`,

      vnp_ReturnUrl: `http:// 192.168.1.6:3000/api/payment/callback-vnpay?txnRef=${txnRef}&duration=${planDuration}&userId=${user._id}`,
      vnp_OrderType: ProductCode.Other,
      vnp_Locale: VnpLocale.VN,
      vnp_CreateDate: dateFormat(new Date(), "yyyymmddHHMMss"),
      vnp_ExpireDate: dateFormat(tomorrow, "yyyymmddHHMMss"),
    });

    res.json({ paymentUrl: vnpayUrl });
  } catch (error) {
    console.error("Error subscribe:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// Callback không nên require token
router.get("/callback-vnpay", async (req, res) => {
  try {
    const { txnRef, duration, userId } = req.query;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + Number(duration));

    user.subscription = {
      plan: "pro",
      status: "active",
      startDate,
      endDate,
      paymentMethod: "vnpay",
      transactionId: txnRef,
    };

    await user.save();

    //Success
    res.json({
      message: "Thanh toán thành công",
      subscription: user.subscription,
    });
    // return res.redirect(`Notemate://successpayment?plan=${duration}`);
  } catch (error) {
    console.error("Callback VNPay error:", error);
    res.status(500).json({ message: "Lỗi callback VNPay" });
  }
});

export default router;
