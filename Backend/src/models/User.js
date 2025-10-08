import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const subscriptionSchema = new mongoose.Schema(
  {
    plan: {
      type: String,
      enum: ["free", "pro"],
      default: "free",
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ["active", "expired", "cancelled"],
      default: "active",
    },
    paymentMethod: {
      type: String, // vnpay
      default: null,
    },
    transactionId: {
      type: String,
      default: null,
    },
  },
  { _id: false } // không tạo _id riêng cho subdoc
);

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      require: true,
      unique: true,
    },
    email: {
      type: String,
      require: true,
      unique: true,
    },
    password: {
      type: String,
      require: true,
      minlength: 6,
    },
    profileImage: {
      type: String,
      default:
        "https://i.pinimg.com/1200x/dc/6c/b0/dc6cb0521d182f959da46aaee82e742f.jpg",
    },
    favorites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Book",
      },
    ],
    subscription: subscriptionSchema, // 👈 thêm gói đăng ký
  },
  {
    timestamps: true,
  }
);

// Hash password
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method kiểm tra user có Pro không
userSchema.methods.isPro = function () {
  if (
    this.subscription &&
    this.subscription.plan === "pro" &&
    this.subscription.endDate &&
    this.subscription.endDate > new Date() &&
    this.subscription.status === "active"
  ) {
    return true;
  }
  return false;
};

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
