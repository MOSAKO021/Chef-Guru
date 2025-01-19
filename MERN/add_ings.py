from pymongo import MongoClient

# Replace the placeholder with your MongoDB Atlas connection string
CONNECTION_STRING = "mongodb+srv://mosako:very_Str0ng_paSSw0rd@cluster0.rdx31pr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

# Connect to MongoDB Atlas
client = MongoClient(CONNECTION_STRING)

# Create or connect to the database and collection
db = client["cooking_database"]
ingredients_collection = db["ingredients"]

# List of ingredients (minimum of 300)
ingredients = [
    {"ingredient": "Salt"}, {"ingredient": "Sugar"}, {"ingredient": "Pepper"},
    {"ingredient": "Olive Oil"}, {"ingredient": "Vegetable Oil"}, {"ingredient": "Butter"},
    {"ingredient": "Milk"}, {"ingredient": "Eggs"}, {"ingredient": "Flour"},
    {"ingredient": "Rice"}, {"ingredient": "Pasta"}, {"ingredient": "Chicken"},
    {"ingredient": "Beef"}, {"ingredient": "Fish"}, {"ingredient": "Garlic"},
    {"ingredient": "Onion"}, {"ingredient": "Tomato"}, {"ingredient": "Potato"},
    {"ingredient": "Carrot"}, {"ingredient": "Celery"}, {"ingredient": "Basil"},
    {"ingredient": "Parsley"}, {"ingredient": "Cilantro"}, {"ingredient": "Cinnamon"},
    {"ingredient": "Cumin"}, {"ingredient": "Chili Powder"}, {"ingredient": "Vinegar"},
    {"ingredient": "Soy Sauce"}, {"ingredient": "Honey"}, {"ingredient": "Lemon"},
    {"ingredient": "Lime"}, {"ingredient": "Apple"}, {"ingredient": "Banana"},
    {"ingredient": "Yeast"}, {"ingredient": "Baking Powder"}, {"ingredient": "Baking Soda"},
    {"ingredient": "Cheese"}, {"ingredient": "Corn"}, {"ingredient": "Spinach"},
    {"ingredient": "Zucchini"}, {"ingredient": "Eggplant"}, {"ingredient": "Bell Pepper"},
    {"ingredient": "Mushrooms"}, {"ingredient": "Ginger"}, {"ingredient": "Turmeric"},
    {"ingredient": "Chives"}, {"ingredient": "Thyme"}, {"ingredient": "Oregano"},
    {"ingredient": "Rosemary"}, {"ingredient": "Dill"}, {"ingredient": "Mint"},
    {"ingredient": "Kale"}, {"ingredient": "Broccoli"}, {"ingredient": "Cauliflower"},
    {"ingredient": "Cabbage"}, {"ingredient": "Green Beans"}, {"ingredient": "Asparagus"},
    {"ingredient": "Leeks"}, {"ingredient": "Beets"}, {"ingredient": "Peas"},
    {"ingredient": "Avocado"}, {"ingredient": "Peanut Butter"}, {"ingredient": "Coconut Oil"},
    {"ingredient": "Lettuce"}, {"ingredient": "Cucumber"}, {"ingredient": "Pickles"},
    {"ingredient": "Chickpeas"}, {"ingredient": "Lentils"}, {"ingredient": "Black Beans"},
    {"ingredient": "Kidney Beans"}, {"ingredient": "Tofu"}, {"ingredient": "Tempeh"},
    {"ingredient": "Soy Milk"}, {"ingredient": "Almond Milk"}, {"ingredient": "Coconut Milk"},
    {"ingredient": "Sesame Oil"}, {"ingredient": "Saffron"}, {"ingredient": "Nutmeg"},
    {"ingredient": "Paprika"}, {"ingredient": "Mustard"}, {"ingredient": "Ketchup"},
    {"ingredient": "Mayonnaise"}, {"ingredient": "Hot Sauce"}, {"ingredient": "BBQ Sauce"},
    {"ingredient": "Maple Syrup"}, {"ingredient": "Granola"}, {"ingredient": "Oats"},
    {"ingredient": "Quinoa"}, {"ingredient": "Couscous"}, {"ingredient": "Barley"},
    {"ingredient": "Breadcrumbs"}, {"ingredient": "Panko"}, {"ingredient": "Crackers"},
    {"ingredient": "Worcestershire Sauce"}, {"ingredient": "Capers"}, {"ingredient": "Anchovies"},
    # Add more ingredients until 300 entries are reached
]


# Insert ingredients into the MongoDB Atlas collection
ingredients_collection.insert_many(ingredients)

print(f"Inserted {len(ingredients)} ingredients into MongoDB Atlas.")
