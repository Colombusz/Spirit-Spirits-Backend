import mongoose from "mongoose";


const promoSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please enter the name of the promo"],
    },
    discount: {
        type: Number,
        required: [true, "Please enter the discount of the promo"],
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
    description: {
        type: String,
        required: [true, "Please enter the description of the promo"],
    },
}, {
    timestamps: true,
});

const Promo = mongoose.model("Promo", promoSchema);

export default Promo;
