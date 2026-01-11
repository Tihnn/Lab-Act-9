const axios = require('axios');

const API_URL = 'http://localhost:3001';

const sampleData = {
  bicycles: [
    {
      name: "Mountain Bike Pro",
      description: "Professional mountain bike with carbon frame for extreme terrains",
      price: 1299.99,
      brand: "Trek",
      type: "Mountain",
      frameSize: "Large",
      color: "Blue",
      stock: 10,
      imageUrl: "https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=400"
    },
    {
      name: "Road Racer Elite",
      description: "Lightweight racing bike for speed enthusiasts",
      price: 1599.99,
      brand: "Specialized",
      type: "Road",
      frameSize: "Medium",
      color: "Red",
      stock: 8,
      imageUrl: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=400"
    },
    {
      name: "City Cruiser",
      description: "Comfortable bike for daily commuting",
      price: 599.99,
      brand: "Giant",
      type: "Hybrid",
      frameSize: "Medium",
      color: "Black",
      stock: 15,
      imageUrl: "https://images.unsplash.com/photo-1511994298241-608e28f14fde?w=400"
    }
  ],
  parts: [
    {
      name: "Disc Brake Set",
      description: "High-performance hydraulic disc brakes",
      price: 159.99,
      category: "Brakes",
      brand: "Shimano",
      compatibility: "Universal",
      stock: 25,
      imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400"
    },
    {
      name: "Carbon Wheelset",
      description: "Lightweight carbon fiber wheels",
      price: 899.99,
      category: "Wheels",
      brand: "Mavic",
      compatibility: "Road Bikes",
      stock: 12,
      imageUrl: "https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=400"
    },
    {
      name: "Chain & Cassette Kit",
      description: "11-speed drivetrain components",
      price: 129.99,
      category: "Drivetrain",
      brand: "SRAM",
      compatibility: "Mountain/Road",
      stock: 30,
      imageUrl: "https://images.unsplash.com/photo-1571333250630-f0230c320b6d?w=400"
    }
  ],
  accessories: [
    {
      name: "LED Light Set",
      description: "Front and rear LED lights for night riding",
      price: 39.99,
      category: "Lights",
      brand: "Cateye",
      stock: 50,
      imageUrl: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400"
    },
    {
      name: "Water Bottle Cage",
      description: "Aluminum bottle holder",
      price: 14.99,
      category: "Bottles",
      brand: "Elite",
      stock: 100,
      imageUrl: "https://images.unsplash.com/photo-1523475440-9f17d8e85b5b?w=400"
    },
    {
      name: "Bike Lock Pro",
      description: "Heavy-duty U-lock with cable",
      price: 49.99,
      category: "Locks",
      brand: "Kryptonite",
      stock: 40,
      imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400"
    }
  ],
  clothing: [
    {
      name: "Pro Cycling Jersey",
      description: "Breathable performance jersey",
      price: 79.99,
      category: "Jerseys",
      brand: "Pearl Izumi",
      size: "L",
      color: "Blue",
      gender: "Unisex",
      stock: 35,
      imageUrl: "https://images.unsplash.com/photo-1571333250630-f0230c320b6d?w=400"
    },
    {
      name: "Padded Cycling Shorts",
      description: "Comfortable shorts with gel padding",
      price: 89.99,
      category: "Shorts",
      brand: "Castelli",
      size: "M",
      color: "Black",
      gender: "Men",
      stock: 28,
      imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400"
    },
    {
      name: "Cycling Helmet",
      description: "Lightweight safety helmet with ventilation",
      price: 129.99,
      category: "Helmets",
      brand: "Giro",
      size: "M/L",
      color: "White",
      gender: "Unisex",
      stock: 45,
      imageUrl: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400"
    }
  ]
};

async function seedDatabase() {
  console.log('🌱 Starting database seeding...\n');

  try {
    // Seed bicycles
    console.log('📦 Adding bicycles...');
    for (const bicycle of sampleData.bicycles) {
      try {
        await axios.post(`${API_URL}/products/bicycles`, bicycle);
        console.log(`  ✅ Added: ${bicycle.name}`);
      } catch (error) {
        console.log(`  ❌ Failed: ${bicycle.name} - ${error.message}`);
      }
    }

    // Seed parts
    console.log('\n📦 Adding parts...');
    for (const part of sampleData.parts) {
      try {
        await axios.post(`${API_URL}/products/parts`, part);
        console.log(`  ✅ Added: ${part.name}`);
      } catch (error) {
        console.log(`  ❌ Failed: ${part.name} - ${error.message}`);
      }
    }

    // Seed accessories
    console.log('\n📦 Adding accessories...');
    for (const accessory of sampleData.accessories) {
      try {
        await axios.post(`${API_URL}/products/accessories`, accessory);
        console.log(`  ✅ Added: ${accessory.name}`);
      } catch (error) {
        console.log(`  ❌ Failed: ${accessory.name} - ${error.message}`);
      }
    }

    // Seed clothing
    console.log('\n📦 Adding clothing...');
    for (const clothing of sampleData.clothing) {
      try {
        await axios.post(`${API_URL}/products/clothing`, clothing);
        console.log(`  ✅ Added: ${clothing.name}`);
      } catch (error) {
        console.log(`  ❌ Failed: ${clothing.name} - ${error.message}`);
      }
    }

    console.log('\n✨ Database seeding completed!\n');
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    console.log('\n⚠️  Make sure the backend server is running on http://localhost:3001\n');
  }
}

// Run the seeder
seedDatabase();
