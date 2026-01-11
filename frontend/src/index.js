import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Initialize sample products if none exist
const initializeSampleProducts = () => {
  const existingProducts = localStorage.getItem('bikeshop_products');
  if (!existingProducts) {
    const sampleProducts = {
      bicycles: [
        {
          id: 1,
          name: "Mountain Bike Pro",
          description: "High-performance mountain bike for challenging terrains",
          price: 899.99,
          stock: 15,
          brand: "TrailMaster",
          imageUrl: "https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=400"
        },
        {
          id: 2,
          name: "Road Racer X1",
          description: "Lightweight road bike for speed enthusiasts",
          price: 1299.99,
          stock: 10,
          brand: "SpeedDemon",
          imageUrl: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=400"
        }
      ],
      parts: [
        {
          id: 3,
          name: "Hydraulic Disc Brakes",
          description: "Premium hydraulic disc brakes for superior stopping power",
          price: 149.99,
          stock: 25,
          brand: "StopMax"
        },
        {
          id: 4,
          name: "Carbon Fiber Wheels",
          description: "Ultra-lightweight carbon fiber wheelset",
          price: 599.99,
          stock: 8,
          brand: "SpinTech"
        }
      ],
      accessories: [
        {
          id: 5,
          name: "LED Bike Light Set",
          description: "Bright LED front and rear lights for night riding",
          price: 39.99,
          stock: 50,
          brand: "BrightRide"
        },
        {
          id: 6,
          name: "Smart Bike Lock",
          description: "Bluetooth-enabled U-lock with alarm system",
          price: 79.99,
          stock: 20,
          brand: "SecureLock"
        }
      ],
      clothing: [
        {
          id: 7,
          name: "Pro Cycling Jersey",
          description: "Breathable moisture-wicking cycling jersey",
          price: 59.99,
          stock: 30,
          brand: "RideWear"
        },
        {
          id: 8,
          name: "Padded Cycling Shorts",
          description: "Comfortable padded shorts for long rides",
          price: 49.99,
          stock: 35,
          brand: "ComfortRide"
        }
      ]
    };
    localStorage.setItem('bikeshop_products', JSON.stringify(sampleProducts));
  }
};

// Initialize on app load
initializeSampleProducts();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
