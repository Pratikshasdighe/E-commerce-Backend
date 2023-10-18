const express = require("express");
const {
  newOrder,
  getSingleOrder,
  myOrder,
  getAllOrders,
  updateOrder,
  deleteOrder,
} = require("../controller/orderController");

const { isAuthenticationUser, authorizeRoles } = require("../middleware/auth");

const router = express.Router();

router.route("/order/new").post(isAuthenticationUser, newOrder);
router.route("/order/:id").get(isAuthenticationUser, getSingleOrder);
router.route("/orders/me").get(isAuthenticationUser, myOrder);
router
  .route("/admin/orders")
  .get(isAuthenticationUser, authorizeRoles("admin"), getAllOrders);
router
  .route("/admin/order/:id")
  .put(isAuthenticationUser, authorizeRoles("admin"), updateOrder)
  .delete(isAuthenticationUser, authorizeRoles("admin"), deleteOrder);
module.exports = router;
