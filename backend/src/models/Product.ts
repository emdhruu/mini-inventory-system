import { model, Schema } from "mongoose";

interface IProduct {
    name: string;
    sku: string;
    price: number;
    stock: number;
    category: string;
    status?: "active" | "inactive";
}

const productSchema = new Schema<IProduct>({
    name: {
        type: String,
        required: [true, "Product name is required"],
        trim: true,
    },
    sku: {
        type: String,
        required: [true, "SKU is required"],
        unique: true,
        trim: true,
        uppercase: true,
    },
    price: {
        type: Number,
        required: [true, "Price is required"],
        min: [0, "Price cannot be negative"],
    },
    stock: {
        type: Number,
        required: [true, "Stock quantity is required"],
        min: [0, "Stock cannot be negative"],
        default: 0,
    },
    category: {
        type: String,
        required: [true, "Category is required"],
        trim: true,
    },
    status: {
        type: String,
        enum: ["active", "inactive"],
        default: "active",
    },
}, {
    timestamps: true,
});

const Product = model<IProduct>("Product", productSchema);

export default Product;