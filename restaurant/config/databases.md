users/
  |-- {userId}/  // User ID from Firebase Auth
        |-- displayName: String
        |-- email: String  // From Auth, but duplicated for easy access
        |-- phoneNumber: String
        |-- address: String
        |-- profileImageUrl: String
        |-- role: String  // "customer", "manager", etc.
        |-- createdAt: Timestamp
        |-- lastLogin: Timestamp
        |-- favoriteItems: Array<String>  // Array of food item IDs
        |-- settings: {
              |-- notifications: Boolean
              |-- darkMode: Boolean
              |-- locationServices: Boolean
            }

foodItems/
  |-- {foodItemId}/
        |-- name: String
        |-- description: String
        |-- price: Number
        |-- category: String
        |-- imageUrl: String
        |-- available: Boolean
        |-- featured: Boolean
        |-- rating: Number
        |-- reviews: Number
        |-- calories: Number
        |-- prepTime: String
        |-- ingredients: Array<String>
        |-- allergens: Array<String>
        |-- spicyLevel: String
        |-- createdAt: Timestamp
        |-- updatedAt: Timestamp


categories/
  |-- {categoryId}/
        |-- name: String
        |-- icon: String
        |-- color: String
        |-- displayOrder: Number


orders/
  |-- {orderId}/
        |-- userId: String
        |-- items: Array<{
              |-- foodItemId: String
              |-- name: String
              |-- price: Number
              |-- quantity: Number
              |-- options: Array<String>  // "Extra Cheese", "Medium Size", etc.
            }>
        |-- status: String  // "pending", "processing", "delivered", etc.
        |-- totalAmount: Number
        |-- deliveryAddress: String
        |-- paymentMethod: String
        |-- promoCode: String
        |-- discount: Number
        |-- createdAt: Timestamp
        |-- updatedAt: Timestamp


promotions/
  |-- {promotionId}/
        |-- title: String
        |-- description: String
        |-- fullDescription: String
        |-- code: String
        |-- discount: Number
        |-- discountType: String  // "percentage", "fixed"
        |-- minimumOrderValue: Number
        |-- validFrom: Timestamp
        |-- validUntil: Timestamp
        |-- imageUrl: String
        |-- terms: Array<String>
        |-- featuredItems: Array<String>  // Food item IDs
        |-- validDays: String
        |-- validHours: String


