const express = require("express");
const {
  getAllProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductDetails,
  createReview,
  getProductReviews,
  deleteProductReviews,
  getAdminProduct,
} = require("../controller/productController");
const { isAuthenticationUser, authorizeRoles } = require("../middleware/auth");

const Router = express.Router();

Router.route("/products").get(getAllProduct);
Router.route("/admin/products/new").post(
  isAuthenticationUser,
  authorizeRoles("admin"),
  createProduct
);
Router.route("/admin/products").get(
  isAuthenticationUser,
  authorizeRoles("admin"),
  getAdminProduct
);
Router.route("/admin/products/:id")
  .put(isAuthenticationUser, authorizeRoles("admin"), updateProduct)
  .delete(isAuthenticationUser, authorizeRoles("admin"), deleteProduct);

Router.route("/product/:id").get(getProductDetails);
Router.route("/review").put(isAuthenticationUser, createReview);
Router.route("/reviews")
  .get(getProductReviews)
  .delete(isAuthenticationUser, deleteProductReviews);
module.exports = Router;
