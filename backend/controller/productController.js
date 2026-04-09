const Product = require("../models/Product.js");
const parseList = (value) => {
    if (!value) return [];
    if (Array.isArray(value)) return value.filter(Boolean);
    return String(value)
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
};

const buildUpdateData = (body, file) => {
    const data = {};

    if (body.name !== undefined) data.name = body.name;
    if (body.description !== undefined) data.description = body.description;
    if (body.category !== undefined) data.category = body.category;
    if (body.subCategory !== undefined) data.subCategory = body.subCategory;
    if (body.brand !== undefined) data.brand = body.brand;
    if (body.weight !== undefined) data.weight = body.weight;

    if (body.price !== undefined && body.price !== "") data.price = Number(body.price);
    if (body.discountPrice !== undefined && body.discountPrice !== "") {
        data.discountPrice = Number(body.discountPrice);
    }
    if (body.stock !== undefined && body.stock !== "") data.stock = Number(body.stock);

    if (body.sizes !== undefined) data.sizes = parseList(body.sizes);
    if (body.flavour !== undefined) data.flavour = parseList(body.flavour);

    if (file) {
        data.images = [`/uploads/${file.filename}`];
    } else if (body.images !== undefined) {
        data.images = parseList(body.images);
    }

    return data;
};

const normalizeCategory = (value) => {
    if (!value) return value;
    const normalized = value.replace(/-/g, " ").toLowerCase();
    const categoryMatch = (name) => new RegExp(`^${name}$`, "i");
    if (normalized === "supplements") return { category: categoryMatch("Supplements") };
    if (normalized === "clothing") return { category: categoryMatch("Clothing") };
    if (normalized === "accessories") return { category: categoryMatch("Accessories") };
    if (normalized === "lifting accessories") {
        return {
            category: categoryMatch("Accessories"),
            subCategory: categoryMatch("Lifting Accessories")
        };
    }
    if (normalized === "shakers bottles" || normalized === "shaker bottles") {
        return {
            $or: [
                { category: categoryMatch("Accessories"), subCategory: categoryMatch("Shaker Bottles") },
                { category: categoryMatch("Shaker Bottles") }
            ]
        };
    }
    return { category: value };
};

// ✅ Create product - Admin only
exports.createProduct = async (req, res) => {
    try {
        const images = [];
        if (req.file) {
            images.push(`/uploads/${req.file.filename}`);
        } else if (req.body.images) {
            images.push(...parseList(req.body.images));
        }

        const newProduct = new Product({
            name: req.body.name,
            description: req.body.description,
            category: req.body.category,
            subCategory: req.body.subCategory,
            price: Number(req.body.price),
            discountPrice: req.body.discountPrice ? Number(req.body.discountPrice) : undefined,
            stock: req.body.stock ? Number(req.body.stock) : 0,
            images: images,
            brand: req.body.brand,
            sizes: parseList(req.body.sizes),
            weight: req.body.weight,
            flavour: parseList(req.body.flavour)
        });

        await newProduct.save();
        res.status(201).json({
            message: "Product created successfully",
            product: newProduct
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ✅ Get all products - with filters
exports.getAllProducts = async (req, res) => {
    try {
        const filter = {};

        // Filter by category
        if (req.query.category) filter.category = req.query.category;

        // Filter by subCategory
        if (req.query.subCategory) filter.subCategory = req.query.subCategory;

        // Filter by brand
        if (req.query.brand) filter.brand = req.query.brand;

        // Only show available products to users
        if (!req.query.showAll) filter.isAvailable = true;

        const products = await Product.find(filter);
        res.status(200).json(products);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ✅ Get products by category (frontend route)
exports.getProductsByCategory = async (req, res) => {
    try {
        const filter = normalizeCategory(req.params.category);
        
        // Apply subCategory filter if 'type' query param provided
        if (req.query.type) {
            const normalizedType = req.query.type
                .split('-')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join('-');
            filter.subCategory = new RegExp(`^${normalizedType}$`, 'i');
        }
        
        const products = await Product.find({ ...filter, isAvailable: true });
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ✅ Get product by ID
exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.status(200).json(product);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ✅ Update product - Admin only
exports.updateProduct = async (req, res) => {
    try {
        const updateData = buildUpdateData(req.body, req.file);
        const updated = await Product.findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
            { new: true }
        );

        if (!updated) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.status(200).json({
            message: "Product updated successfully",
            product: updated
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ✅ Delete product - Admin only
exports.deleteProduct = async (req, res) => {
    try {
        const deleted = await Product.findByIdAndDelete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.status(200).json({ message: "Product deleted successfully" });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ✅ Search products by name
exports.searchProducts = async (req, res) => {
    try {
        const query = req.query.q || req.query.name || '';
        
        if (!query.trim()) {
            return res.status(400).json({ message: "Search query is required" });
        }

        const products = await Product.find({
            $or: [
                { name: { $regex: query, $options: "i" } },
                { description: { $regex: query, $options: "i" } },
                { brand: { $regex: query, $options: "i" } }
            ],
            isAvailable: true
        });

        if (products.length === 0) {
            return res.status(404).json({ message: "No products found" });
        }

        res.status(200).json(products);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};