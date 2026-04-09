const Cart = require("../models/Cart.js");
const Product = require("../models/Product.js");

const getAuthUserId = (req) => req.user?._id || req.user?.id;
const getGuestId = (req) => req.header("x-guest-id");

const getCartFilter = (req) => {
    const userId = getAuthUserId(req);
    if (userId) {
        return { user: userId };
    }

    const guestId = getGuestId(req);
    if (guestId) {
        return { guestId };
    }

    return null;
};

// ✅ Add item to cart
exports.addToCart = async (req, res) => {
    try {
        const cartFilter = getCartFilter(req);
        if (!cartFilter) {
            return res.status(400).json({ message: "Guest cart id missing" });
        }

        const product = await Product.findById(req.body.productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        if (!product.isAvailable || product.stock < req.body.quantity) {
            return res.status(400).json({ message: "Product out of stock" });
        }

        let cart = await Cart.findOne(cartFilter);

        if (!cart) {
            cart = new Cart({
                user: cartFilter.user,
                guestId: cartFilter.guestId,
                items: [],
                totalPrice: 0
            });
        }

        // Check if product already in cart
        const existingItem = cart.items.find(
            item => item.product.toString() === req.body.productId
        );

        if (existingItem) {
            // Update quantity
            existingItem.quantity += req.body.quantity;
        } else {
            // Add new item
            const itemPrice = Number(product.discountPrice) || Number(product.price) || 0;
            cart.items.push({
                product: product._id,
                name: product.name,
                image: product.images[0] || "",
                price: itemPrice,
                quantity: req.body.quantity || 1,
                size: req.body.size || "",
                flavour: req.body.flavour || ""
            });
        }

        // Recalculate total with proper number conversion
        cart.totalPrice = cart.items.reduce((total, item) => {
            const itemPrice = Number(item.price) || 0;
            const itemQuantity = Number(item.quantity) || 1;
            return total + (itemPrice * itemQuantity);
        }, 0);

        await cart.save();
        res.status(200).json({
            message: "Item added to cart",
            cart: cart
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ✅ Get cart
exports.getCart = async (req, res) => {
    try {
        const cartFilter = getCartFilter(req);
        if (!cartFilter) {
            return res.status(400).json({ message: "Guest cart id missing" });
        }

        const cart = await Cart.findOne(cartFilter)
            .populate("items.product");

        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }

        // Update prices from current product data to ensure accuracy
        const updatedCart = { ...cart.toObject() };
        updatedCart.items = updatedCart.items.map(item => {
            if (item.product) {
                const currentPrice = Number(item.product.discountPrice) || Number(item.product.price) || Number(item.price) || 0;
                return {
                    ...item,
                    price: currentPrice
                };
            }
            return item;
        });

        // Recalculate total with updated prices
        updatedCart.totalPrice = updatedCart.items.reduce((total, item) => {
            const itemPrice = Number(item.price) || 0;
            const itemQuantity = Number(item.quantity) || 1;
            return total + (itemPrice * itemQuantity);
        }, 0);

        res.status(200).json(updatedCart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ✅ Update item quantity
exports.updateCartItem = async (req, res) => {
    try {
        const cartFilter = getCartFilter(req);
        if (!cartFilter) {
            return res.status(400).json({ message: "Guest cart id missing" });
        }

        const cart = await Cart.findOne(cartFilter);
        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }

        const item = cart.items.find(
            item => item.product.toString() === req.params.productId
        );

        if (!item) {
            return res.status(404).json({ message: "Item not found in cart" });
        }

        item.quantity = req.body.quantity;

        // Recalculate total with proper number conversion
        cart.totalPrice = cart.items.reduce((total, item) => {
            const itemPrice = Number(item.price) || 0;
            const itemQuantity = Number(item.quantity) || 1;
            return total + (itemPrice * itemQuantity);
        }, 0);

        await cart.save();
        res.status(200).json({
            message: "Cart updated successfully",
            cart: cart
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ✅ Remove item from cart
exports.removeFromCart = async (req, res) => {
    try {
        const cartFilter = getCartFilter(req);
        if (!cartFilter) {
            return res.status(400).json({ message: "Guest cart id missing" });
        }

        const cart = await Cart.findOne(cartFilter);
        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }

        cart.items = cart.items.filter(
            item => item.product.toString() !== req.params.productId
        );

        // Recalculate total with proper number conversion
        cart.totalPrice = cart.items.reduce((total, item) => {
            const itemPrice = Number(item.price) || 0;
            const itemQuantity = Number(item.quantity) || 1;
            return total + (itemPrice * itemQuantity);
        }, 0);

        await cart.save();
        res.status(200).json({
            message: "Item removed from cart",
            cart: cart
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ✅ Clear cart
exports.clearCart = async (req, res) => {
    try {
        const cartFilter = getCartFilter(req);
        if (!cartFilter) {
            return res.status(400).json({ message: "Guest cart id missing" });
        }

        const cart = await Cart.findOne(cartFilter);
        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }

        cart.items = [];
        cart.totalPrice = 0;

        await cart.save();
        res.status(200).json({ message: "Cart cleared successfully", cart: cart });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};