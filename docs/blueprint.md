# **App Name**: Island Bites

## Core Features:

- Location Selection: Allow users to select their location from a dropdown menu with 'Jamaica' and 'Trinidad' options.
- Default Restaurants and Meals: Define default restaurants and meals for each location (Jamaica & Trinidad) as a local JSON object. This information will be used for random meal selection.
- Shake to Decide: Implement a 'Shake to Decide' feature (or button alternative) that randomly selects a restaurant and meal from the current location's list. Include a rolling animation and sound effect.
- Custom Meals: Users can add custom meals (meal name and optional restaurant). Store custom meal data locally using browser storage (like localStorage) to persist data between sessions.

## Style Guidelines:

- Use vibrant, Caribbean-inspired colors such as turquoise, yellow, and green for the primary color scheme.
- Accent color: Coral (#FF7F50) for interactive elements and highlights.
- Utilize food icons and emojis to represent different meals and restaurants.
- Incorporate smooth animations and bounce effects during the dice roll to make it visually appealing.
- Design a clean and intuitive layout with a clear welcome screen, main screen with location selector and 'Roll the Dice' button, and an account page for custom meal management.

## Original User Request:
Create a basic mobile app called **NUMNUM** that helps users decide what to eat. The app should have the following features:



### 🧭 Core Features:

1. **🌍 Location Selection:**
   - Users can choose their location from a dropdown with two options: `Jamaica` and `Trinidad`.

2. **🍽️ Default Restaurants and Meals:**

   **Jamaica**
   - Juici Patties: "Beef Patty", "Curry Chicken", "Coco Bread"
   - Scotchies: "Jerk Chicken", "Festival", "Roast Yam"
   - Island Grill: "BBQ Chicken", "Rice & Peas", "Callaloo Wrap"

   **Trinidad**
   - Royal Castle: "Fried Chicken", "Fries", "Spicy Wings"
   - Doubles King: "Doubles", "Aloo Pie", "Chickpea Wrap"
   - Roti Cafe: "Chicken Roti", "Goat Roti", "Dhalpourie"

3. **🎲 Shake to Decide:**
   - Users can shake their phone to "roll a dice".
   - A random restaurant and meal is selected from their current location list.
   - Include a button alternative for devices that don’t support motion.
   - Add a fun rolling animation and sound effect.

4. **👤 Accounts Page – Custom Meals:**
   - Users can create an account or log in.
   - On the Accounts page, allow users to:
     - Add custom meals (meal name and optional restaurant).
     - View and manage their custom meals (edit/delete).
   - Custom meals are included in the dice roll if location matches or no restaurant is provided.

5. **📱 UI Layout:**
   - Welcome screen with app name/logo and a "Get Started" button.
   - Main screen with:
     - Location selector
     - "Roll the Dice" button (and shake detection)
     - Result display: "You're eating at [restaurant]: [meal]"
   - Accounts tab for login and meal management.

6. **🎨 Style:**
   - Caribbean-inspired colors and patterns.
   - Use food icons/emojis and playful fonts.
   - Smooth animations and bounce effects for dice roll.
  