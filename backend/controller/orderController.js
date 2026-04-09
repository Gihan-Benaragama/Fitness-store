const Order = require("../models/Order.js");
const Cart = require("../models/Cart.js");
const Product = require("../models/Product.js");

const getAuthUserId = (req) => req.user?._id || req.user?.id;

// ✅ Create order
exports.createOrder = async (req, res) => {
    try {
        // Validate items exist
        if (!req.body.items || req.body.items.length === 0) {
            return res.status(400).json({ message: "No items in order" });
        }

        // Check stock for each item
        for (const item of req.body.items) {
            const product = await Product.findById(item.product);
            if (!product) {
                return res.status(404).json({ message: `Product ${item.name} not found` });
            }
            if (product.stock < item.quantity) {
                return res.status(400).json({ message: `${product.name} is out of stock` });
            }
        }

        // Create order data - support both authenticated and guest users
        const orderData = {
            items: req.body.items,
            shippingAddress: req.body.shippingAddress,
            paymentMethod: req.body.paymentMethod || "Cash on Delivery",
            totalPrice: req.body.totalPrice,
            shippingPrice: req.body.shippingPrice || 0
        };

        // Add user ID if authenticated, otherwise add guest info
        const userId = getAuthUserId(req);
        if (userId) {
            orderData.user = userId;
        } else {
            // Guest checkout - use info from form
            orderData.guestInfo = {
                name: `${req.body.firstName || ''} ${req.body.lastName || ''}`.trim(),
                email: req.body.email || '',
                phone: req.body.phone || ''
            };
        }

        const newOrder = new Order(orderData);
        await newOrder.save();

        // Reduce stock for each product
        for (const item of req.body.items) {
            await Product.findByIdAndUpdate(
                item.product,
                { $inc: { stock: -item.quantity } }
            );
        }

        // Clear cart after order placed (only for authenticated users)
        if (userId) {
            await Cart.findOneAndUpdate(
                { user: userId },
                { items: [], totalPrice: 0 }
            );
        }

        res.status(201).json({
            message: "Order placed successfully",
            order: newOrder
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ✅ Get all orders - Admin only
exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate("user", "firstName lastName email")
            .populate("items.product", "name price");
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ✅ Get order by ID
exports.getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate("user", "firstName lastName email")
            .populate("items.product", "name price images");

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ✅ Get orders by user
exports.getOrdersByUser = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.params.userId })
            .populate("items.product", "name price images");

        if (orders.length === 0) {
            return res.status(404).json({ message: "No orders found" });
        }

        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ✅ Update order status - Admin only
exports.updateOrderStatus = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        order.status = req.body.status;

        // Set deliveredAt when status is Delivered
        if (req.body.status === "Delivered") {
            order.deliveredAt = Date.now();
            order.isPaid = true;
            order.paidAt = Date.now();
        }

        await order.save();
        res.status(200).json({
            message: "Order status updated successfully",
            order: order
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ✅ Cancel order
exports.cancelOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        if (order.status === "Delivered") {
            return res.status(400).json({ message: "Cannot cancel delivered order" });
        }

        order.status = "Cancelled";
        await order.save();

        // Restore stock
        for (const item of order.items) {
            await Product.findByIdAndUpdate(
                item.product,
                { $inc: { stock: item.quantity } }
            );
        }

        res.status(200).json({ message: "Order cancelled successfully" });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};