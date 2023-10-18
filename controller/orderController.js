const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncError = require("../middleware/catchAsyncError");

// create new order

exports.newOrder = catchAsyncError(async (req, res, next) => {
  const {
    shippingInfo,
    orderItem,
    paymentInfo,
    paidAt,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    orderStatus,
  } = req.body;
  const order = await Order.create({
    shippingInfo,
    orderItem,
    paymentInfo,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    orderStatus,
    paidAt: Date.now(),
    user: req.user._id,
  });
  res.status(201).json({
    success: true,
    order,
  });
});

// get single order

exports.getSingleOrder = catchAsyncError(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate(
    "user",
    "email name"
  );
  if (!order) {
    return next(new ErrorHandler("order is not found with this Id", 404));
  }
  res.status(200).json({
    success: true,
    order,
  });
});

// get logged in user orders

exports.myOrder = catchAsyncError(async (req, res, next) => {
  const orders = await Order.find({ user: req.user._id });

  res.status(200).json({
    success: true,
    orders,
  });
});

//get all order --Admin

exports.getAllOrders = catchAsyncError(async (req, res, next) => {
  const orders = await Order.find();
  let totalAmount = 0;
  orders.forEach((order) => {
    totalAmount += order.totalPrice;
  });
  res.status(200).json({
    success: true,
    totalAmount,
    orders,
  });
});

// update order status -- admin

exports.updateOrder = catchAsyncError(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return next(new ErrorHandler("order is not found with this Id", 404));
  }

  if (order.orderStatus === "Delivered") {
    return next(new ErrorHandler("You have alreday delivered this order", 400));
  }
  if (req.body.status === "Shipped") {
    order.orderItem.forEach(async (order) => {
      await updateStock(order.product, order.quantity);
    });
  }
  order.orderStatus = req.body.status;
  if (req.body.status === "Delivered") {
    order.deliveredAt = Date.now();
  }
  order.save({ validateBeforeSave: false });
  res.status(200).json({
    success: true,
  });
});

async function updateStock(id, quantity) {
  const product = await Product.findById(id);
  product.stock -= quantity;

  await product.save({ validateBeforeSave: false });
}

// delete order

exports.deleteOrder = catchAsyncError(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return next(new ErrorHandler("order is not found with this Id", 404));
  }
  await order.remove();
  res.status(200).json({
    success: true,
  });
});
