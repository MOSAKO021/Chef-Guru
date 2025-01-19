const Ing = require("../Models/IngModel.js")
const Fav = require("../Models/FavModel.js")
const User = require("../Models/UserModel.js")
const History = require("../Models/HistoryModel.js")
const axios = require('axios');
const { hashPassword, comparePassword } = require('../utils/passwordUtils')
const { createJWT, verifyJWT } = require('../utils/tokenUtils');
const StatusCodes = require('http-status-codes');


const recipes = [
    {
        name: 'Spaghetti Carbonara',
        steps: [
            'Boil pasta according to package instructions.',
            'Cook pancetta in a skillet until crispy.',
            'Whisk eggs and grated Parmesan in a bowl.',
            'Combine pasta, pancetta, and egg mixture.',
            'Season with salt and pepper and serve.'
        ],
        ingredients: [
            'Spaghetti',
            'Pancetta',
            'Eggs',
            'Parmesan cheese',
            'Salt',
            'Pepper',
        ]
    },
    // {
    //     name: 'Chicken Alfredo',
    //     steps: [
    //         'Cook pasta according to package instructions.',
    //         'Cook chicken breasts in a skillet until done.',
    //         'Melt butter in a pan and add heavy cream.',
    //         'Stir in Parmesan and cook until sauce thickens.',
    //         'Combine pasta, chicken, and sauce.',
    //         'Season with salt and pepper and serve.'
    //     ],
    //     ingredients: [
    //         'Pasta',
    //         'Chicken breasts',
    //         'Butter',
    //         'Heavy cream',
    //         'Parmesan cheese',
    //         'Salt',
    //         'Pepper',
    //     ]
    // },
    // {
    //     name: 'Beef Tacos',
    //     steps: [
    //         'Cook ground beef in a skillet until browned.',
    //         'Add taco seasoning and water to the beef.',
    //         'Simmer until sauce thickens.',
    //         'Warm taco shells in the oven.',
    //         'Fill taco shells with beef, lettuce, cheese, and salsa.'
    //     ],
    //     ingredients: [
    //         'Ground beef',
    //         'Taco seasoning',
    //         'Taco shells',
    //         'Lettuce',
    //         'Cheese',
    //         'Salsa',
    //     ]
    // },
    // {
    //     name: 'Vegetable Stir Fry',
    //     steps: [
    //         'Heat oil in a large pan.',
    //         'Add chopped vegetables and cook until tender.',
    //         'Stir in soy sauce, garlic, and ginger.',
    //         'Cook until sauce thickens.',
    //         'Serve with rice or noodles.'
    //     ],
    //     ingredients: [
    //         'Mixed vegetables (e.g., bell peppers, broccoli, carrots)',
    //         'Soy sauce',
    //         'Garlic',
    //         'Ginger',
    //         'Cooking oil',
    //         'Rice or noodles (optional)',
    //     ]
    // },
    {
        name: 'Margherita Pizza',
        steps: [
            'Preheat oven to 475°F (245°C).',
            'Roll out pizza dough on a floured surface.',
            'Spread tomato sauce over the dough.',
            'Top with fresh mozzarella and basil leaves.',
            'Bake in the oven until crust is golden.',
            'Drizzle with olive oil and serve.'
        ],
        ingredients: [
            'Pizza dough',
            'Tomato sauce',
            'Fresh mozzarella',
            'Basil leaves',
            'Olive oil',
        ]
    },
    // {
    //     name: 'Chicken Caesar Salad',
    //     steps: [
    //         'Grill chicken breasts until fully cooked.',
    //         'Chop romaine lettuce and place in a bowl.',
    //         'Add croutons and grated Parmesan.',
    //         'Slice the grilled chicken and add to the salad.',
    //         'Toss with Caesar dressing and serve.'
    //     ],
    //     ingredients: [
    //         'Chicken breasts',
    //         'Romaine lettuce',
    //         'Croutons',
    //         'Parmesan cheese',
    //         'Caesar dressing',
    //     ]
    // },
    {
        name: 'Pancakes',
        steps: [
            'Mix flour, sugar, baking powder, and salt in a bowl.',
            'Whisk milk, eggs, and melted butter in another bowl.',
            'Combine wet and dry ingredients and stir until smooth.',
            'Heat a griddle and pour batter to form pancakes.',
            'Cook until bubbles form, then flip and cook until golden.',
            'Serve with syrup and butter.'
        ],
        ingredients: [
            'Flour',
            'Sugar',
            'Baking powder',
            'Salt',
            'Milk',
            'Eggs',
            'Butter',
            'Syrup (optional)',
        ]
    },
    // {
    //     name: 'Beef Stew',
    //     steps: [
    //         'Brown beef in a large pot.',
    //         'Add chopped onions, carrots, and potatoes.',
    //         'Stir in beef broth, tomato paste, and seasonings.',
    //         'Simmer until meat and vegetables are tender.',
    //         'Serve hot with crusty bread.'
    //     ],
    //     ingredients: [
    //         'Beef',
    //         'Onions',
    //         'Carrots',
    //         'Potatoes',
    //         'Beef broth',
    //         'Tomato paste',
    //         'Seasonings',
    //     ]
    // },
    {
        name: 'Chocolate Chip Cookies',
        steps: [
            'Preheat oven to 350°F (175°C).',
            'Cream butter and sugars together in a bowl.',
            'Add eggs and vanilla extract and mix well.',
            'Stir in flour, baking soda, and salt.',
            'Fold in chocolate chips.',
            'Drop spoonfuls of dough onto a baking sheet.',
            'Bake until golden brown.'
        ],
        ingredients: [
            'Butter',
            'Sugar',
            'Brown sugar',
            'Eggs',
            'Vanilla extract',
            'Flour',
            'Baking soda',
            'Salt',
            'Chocolate chips',
        ]
    },
    {
        name: 'Grilled Cheese Sandwich',
        steps: [
            'Butter one side of each bread slice.',
            'Place cheese slices between two pieces of bread.',
            'Heat a skillet over medium heat.',
            'Cook sandwich until bread is golden brown and cheese is melted.',
            'Serve hot.'
        ],
        ingredients: [
            'Bread slices',
            'Cheese slices',
            'Butter',
        ]
    }
]


const register = async (req, res) => {
    const { name, email, password: plainPassword } = req.body;

    const password = await hashPassword(plainPassword);

    let user = await User.create({ name, email, password });

    await user.save();

    res.status(200).json({ message: 'created successfully' });
};




const login = async (req, res) => {
    try {
        console.log("Login request:", req.body);
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isPasswordCorrect = await comparePassword(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = createJWT({ userId: user._id });

        const oneDay = 1000 * 60 * 60 * 24; // 24 hours
        res.cookie('token', token, {
            httpOnly: true,
            expires: new Date(Date.now() + oneDay),
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
        });

        res.status(200).json({ msg: 'User logged in' });
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const check = async (req, res) => {
    if (req.cookies) {
        const val = verifyJWT(req.cookies.token);
        console.log("val:", val);
        if (val) {
            res.status(200).json({ message: "Neekentuku ra idanta?" })
        }
        else { res.status(500).json({ message: 'Antuke mundu chuskovali' }) }
    }
    else {
        res.status(500).json({ message: 'Antuke mundu chuskovali!' })
    }
}

const logout = (req, res) => {
    res.cookie('token', 'logout', {
        httpOnly: true,
        expires: new Date(Date.now()),
    })
    res.status(StatusCodes.OK).json({ msg: 'user logged out' })
}

// const getAllIngs = async (req, res) => {
//     try {
//         const ingredients = await Ing.find({}, { _id: 0, ingredient: 1 }).exec();
//         const ingredientList = ingredients.map(doc => doc.ingredient);
//         res.status(200).json({ ingredients: ingredientList });
//     } catch (e) {
//         console.log("Error: ", e);
//         res.json(500).json({ error: "Error fetching ingredients" }, e)
//     }
// }

const getAllIngs = async (req, res) => {
    try {
        // Hardcoded list of ingredients
        const ingredientList = [
            //  Pulses & Legumes
            "Lentils", 
            "Chickpeas", 
            "Black beans", 
            "Kidney beans", 
            "Split peas", 
            "Pinto beans", 
            "Mung beans", 
            "Black-eyed peas", 
            "Green beans", 
            "Fava beans", 
            
            //  Meat & Poultry
            "Chicken", 
            "Ground beef", 
            "Pork chops", 
            "Lamb", 
            "Beef steak", 
            "Turkey", 
            "Duck", 
            "Sausages", 
            "Veal", 
            "Bacon", 
            
            //  Cereals & Grains
            "Rice", 
            "Quinoa", 
            "Oats", 
            "Barley", 
            "Bulgur", 
            "Couscous", 
            "Farro", 
            "Millet", 
            "Wheat berries", 
            "Cornmeal", 
            
            //  Vegetables
            "Carrots", 
            "Spinach", 
            "Broccoli", 
            "Kale", 
            "Cauliflower", 
            "Potatoes", 
            "Tomatoes", 
            "Bell peppers", 
            "Zucchini", 
            "Mushrooms", 
            "Cabbage", 
            "Asparagus", 
            "Onions", 
            "Garlic", 
            "Eggplant", 
            "Sweetcorn", 
            "Leeks", 
            "Brussels sprouts", 
            "Radishes", 
            
            //  Fruits
            "Apples", 
            "Bananas", 
            "Oranges", 
            "Mangoes", 
            "Strawberries", 
            "Blueberries", 
            "Grapes", 
            "Avocados", 
            "Pineapple", 
            "Pears", 
            "Peaches", 
            "Plums", 
            "Cherries", 
            "Raspberries", 
            "Blackberries", 
            "Watermelon", 
            "Kiwis", 
            "Papaya", 
            "Lemons", 
            "Limes", 
            
            //  Oils & Fats
            "Olive oil", 
            "Coconut oil", 
            "Vegetable oil", 
            "Butter", 
            "Ghee", 
            "Sesame oil", 
            "Canola oil", 
            "Peanut oil", 
            "Avocado oil", 
            "Sunflower oil", 
            "Palm oil", 
            "Truffle oil", 
            "Walnut oil", 
            "Almond oil", 
            
            //  Sugars & Sweeteners
            "White sugar", 
            "Brown sugar", 
            "Honey", 
            "Maple syrup", 
            "Agave syrup", 
            "Stevia", 
            "Molasses", 
            "Coconut sugar", 
            "Date syrup", 
            "Powdered sugar", 
            "Corn syrup", 
            "Golden syrup", 
            
            //  Dairy & Dairy Alternatives
            "Milk", 
            "Cheese", 
            "Yogurt", 
            "Butter", 
            "Cream", 
            "Cottage cheese", 
            "Ice cream", 
            "Ghee", 
            
            //  Herbs & Spices
            "Salt", 
            "Black pepper", 
            "Cinnamon", 
            "Cumin", 
            "Coriander", 
            "Turmeric", 
            "Paprika", 
            "Chili powder", 
            "Ginger", 
            "Garlic powder", 
            "Onion powder", 
            "Thyme", 
            "Rosemary", 
            "Basil", 
            "Oregano", 
            "Parsley", 
            "Mint", 
            "Saffron", 
            "Nutmeg", 
            "Cloves", 
            "Cardamom", 
            "Bay leaves", 
            "Allspice", 
            
            //  Nuts & Seeds
            "Almonds", 
            "Cashews", 
            "Walnuts", 
            "Pistachios", 
            "Hazelnuts", 
            "Brazil nuts", 
            "Pine nuts", 
            "Peanuts", 
            "Sunflower seeds", 
            "Chia seeds", 
            "Flax seeds", 
            "Pumpkin seeds", 
            "Sesame seeds", 
            "Hemp seeds", 
            
            //  Breads & Bakery
            "White bread", 
            "Whole wheat bread", 
            "Sourdough", 
            "Rye bread", 
            "Baguette", 
            "Focaccia", 
            "Pita", 
            "Bagels", 
            "Muffins", 
            "Croissants", 
            "Cinnamon rolls", 
            "Tortillas", 
            
            //  Beverages
            "Water", 
            "Coffee", 
            "Tea", 
            "Juice", 
            "Lemonade", 
            "Soda", 
            "Sparkling water", 
            "Milkshake", 
            "Smoothies", 
            "Herbal tea", 
            "Energy drinks", 
            "Wine", 
            "Beer", 
            "Whiskey", 
            "Rum", 
            
            //  Condiments & Sauces
            "Ketchup", 
            "Mustard", 
            "Mayonnaise", 
            "Barbecue sauce", 
            "Soy sauce", 
            "Hot sauce", 
            "Worcestershire sauce", 
            "Vinegar", 
            "Honey mustard", 
            "Ranch dressing", 
            "Salad dressing", 
            "Teriyaki sauce", 
            "Fish sauce", 
            "Tahini", 
            "Pesto", 
            "Chimichurri", 
            
            //  Processed & Packaged Foods
            "Canned tomatoes", 
            "Canned beans", 
            "Canned tuna", 
            "Frozen vegetables", 
            "Frozen fruits", 
            "Instant noodles", 
            "Mac and cheese", 
            "Granola bars", 
            "Cereal", 
            "Crackers", 
            "Chips", 
            "Instant oatmeal", 
            
            //  Miscellaneous
            "Tofu", 
            "Tempeh", 
            "Seitan", 
            "Miso paste", 
            "Nutritional yeast", 
            "Cornstarch", 
            "Baking soda", 
            "Baking powder", 
            "Vanilla extract", 
            "Gelatin", 
            "Agar agar", 
            "Food coloring", 
            "Cocoa powder", 
            "Chocolate chips", 
            "Marshmallows", 
            "Coconut flakes"
        ]
        

        // Send the hardcoded list as a response
        res.status(200).json({ ingredients: ingredientList });
    } catch (e) {
        console.error("Error: ", e);
        res.status(500).json({ error: "Error fetching ingredients" });
    }
};

const fetchRecipes = async (req, res) => {
    const ingredients = req.body.ingredients;
    const url = 'http://127.0.0.1:5000/generate-recipe';
    // console.log("da:", ingredients);
    
    
    try {
        const requests = Array(5).fill().map(() => axios.post(url, {ingredients}));
        const responses = await Promise.all(requests);

        const recipes = responses.map(response => response.data.recipe);
        recipes.forEach((recipe, index) => {
            console.log(`Response ${index + 1}:`, recipe);
        });

        res.status(200).json({ recipes: recipes });
    } catch (error) {
        console.error('Error fetching recipes:', error);
        res.status(500).json({ error: 'Failed to fetch recipes' });
    }
};


const starRecipe = async (req, res) => {
    try {
        const { name, steps, ingredients } = req.body;
        const tok = req.cookies.token;
        const userId = verifyJWT(tok).userId;

        if (!userId || !name || !steps || !ingredients) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const existingRecipe = await Fav.findOne({ recipeName: name });
        let favId;

        if (existingRecipe) {
            favId = existingRecipe._id;
        } else {
            const newFavourite = new Fav({
                recipeName: name,
                recipeIngrids: ingredients,
                recipeStps: steps,
                user: userId
            });
            const result = await newFavourite.save();
            favId = result._id;
        }

        await User.findByIdAndUpdate(userId, {
            $addToSet: { favourites: favId }
        });

        res.status(200).json({ message: 'Recipe added to favourites' });
    } catch (error) {
        console.error('Error inserting favourite recipe:', error);
        res.status(500).json({ error: 'Failed to add recipe to favourites' });
    }
};

const createHistory = async (req, res) => {
    try {
        const { name, steps, ingredients } = req.body;
        const tok = req.cookies.token;
        const userId = verifyJWT(tok).userId;

        if (!userId || !name || !steps || !ingredients) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const existingRecipe = await History.findOne({ recipeName: name });
        let favId;

        const newFavourite = new History({
            recipeName: name,
            recipeIngrids: ingredients,
            recipeStps: steps,
            user: userId
        });
        const result = await newFavourite.save();
        favId = result._id;


        await User.findByIdAndUpdate(userId, {
            $push: { history: favId } 
        });

        res.status(200).json({ message: 'Recipe added to history' });
    } catch (error) {
        console.error('Error inserting favourite recipe:', error);
        res.status(500).json({ error: 'Failed to add recipe to history' });
    }
};



const fetchFavs = async (req, res) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({ error: 'Unauthorized access' });
        }

        const val = verifyJWT(token);
        if (!val) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        const userId = val.userId; 
        const user = await User.findById(userId).populate('favourites');

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json(user.favourites);
    } catch (error) {
        console.error('Error fetching favourites:', error);
        res.status(500).json({ error: 'Failed to fetch favourites' });
    }
};

const fetchHistory = async (req, res) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({ error: 'Unauthorized access' });
        }

        const val = verifyJWT(token);
        if (!val) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        const userId = val.userId; 
        const user = await User.findById(userId).populate({
            path: 'history',
            options: {
                sort: { createdAt: -1 },
                limit: 10 
            }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json(user.history);
    } catch (error) {
        console.error('Error fetching history:', error);
        res.status(500).json({ error: 'Failed to fetch history' });
    }
};


const removeRecipe = async (req, res) => {
    const { recipeName } = req.body;

    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({ message: 'Unauthorized access' });
        }

        const val = verifyJWT(token);
        if (!val) {
            return res.status(401).json({ message: 'Invalid token' });
        }

        const deletedRecipe = await Fav.findOneAndDelete({ recipeName });
        if (!deletedRecipe) {
            return res.status(404).json({ message: 'Recipe not found' });
        }

        const userId = val.userId;
        await User.findByIdAndUpdate(userId, {
            $pull: { favourites: deletedRecipe._id }
        });

        res.status(200).json({ message: 'Recipe removed from favourites', recipe: deletedRecipe });
    } catch (error) {
        console.error('Error removing recipe from favourites:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const createImage = async (req, res) => {
    const { recipeName } = req.body;
    console.log("name:", recipeName);
    const options = {
        method: 'POST',
        url: 'https://chatgpt-42.p.rapidapi.com/texttoimage',
        headers: {
            'x-rapidapi-key': process.env.RAPID_API_KEY,
            'x-rapidapi-host': 'chatgpt-42.p.rapidapi.com',
            'Content-Type': 'application/json'
        },
        data: {
            text: recipeName,
            width: 512,
            height: 512
        }
    };

    try {
        const response = await axios.request(options);
        res.status(200).json(response.data)
    } catch (error) {
        console.error(error);
        res.status(400).json("Error:", error)
    }
}


module.exports = { getAllIngs, fetchHistory, createHistory, check, logout, register, login, fetchRecipes, fetchFavs, removeRecipe, starRecipe, createImage };