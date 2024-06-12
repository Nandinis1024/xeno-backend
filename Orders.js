const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    product: {
        type: String,
        trim: true,
    },
    quantity: {
        type: Number,
    },
    price: {
        type: Number,
    },
    }, { timestamps: true }
);

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;