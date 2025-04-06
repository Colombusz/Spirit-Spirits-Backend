import mongoose from 'mongoose';

const liquorSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please enter the name of the liquor"],
    },
    price: {
        type: Number,
        required: [true, "Please enter the price of the liquor"],
        maxlength: [5, "Price cannot exceed 5 characters"],
        default: 0.0,
    },
    promoPrice: {
        type: Number,
        required: false,
    },
    description: {
        type: String,
        required: [true, "Please enter the description of the liquor"],
    },
    images: [
        {
            public_id: {
                type: String,
                required: true
            },
            url: {
                type: String,
                required: true
            },
        }
    ],
    brand: {
        type: String,
        default: ''
    },
    stock: {
        type: Number,
        required: [true, 'Please enter product stock'],
        maxLength: [5, 'Product stock cannot exceed 5 characters'],
        default: 0
    },
    category: {
        type: String,
        required: [true, "Please enter the category of the liquor"],
        enum: {
            values: [
            'Vodka',
            'Rum',
            'Tequila',
            'Whiskey',
            'Gin',
            'Brandy',
            'Liqueur',
            'Beer',
            'Wine',
            'Champagne',
            'Sake',
            'Soju',
            'Baijiu',
            'Whisky',
            'Other',
            ],
            message: "Please select the correct category for the liquor",
        },
    },
    reviews: {
        type: [mongoose.Schema.Types.ObjectId],  // Array of ObjectIds
        ref: "Review",                           // Reference to the 'Review' model
        default: [],                             // Default empty array for no reviews
    },
    rating: {
        type: Number,
        default: 0,
    },
    numReviews: {
        type: Number,
        default: 0,
    },
},{ timestamps: true });

const Liquor = mongoose.model('Liquor', liquorSchema);

export default Liquor;