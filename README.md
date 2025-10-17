# Bharat Warehouse Optimiser

A comprehensive **Micro-Fulfillment Unit (MFU) Simulator** designed for warehouse layout optimization, pathfinding simulation, and efficiency analytics. This application helps optimize warehouse operations through visual layout design, AI-powered pathfinding, and real-time performance analytics.

## 🎯 Project Overview

The Bharat Warehouse Optimiser is a full-stack web application that simulates warehouse operations to help optimize layout designs, robot movement patterns, and overall operational efficiency. It's specifically designed for micro-fulfillment units and can be adapted for various warehouse scenarios including disaster relief, festival rushes, and emergency situations.

### Key Features

- **🎨 Visual Layout Designer**: Drag-and-drop interface for creating warehouse layouts
- **🤖 Robot Simulation**: Real-time pathfinding and movement simulation
- **📊 Performance Analytics**: Comprehensive metrics and ROI calculations
- **🌍 Seasonal Optimization**: Different algorithms for normal vs. high-demand periods
- **💾 Data Persistence**: Save and manage multiple layout configurations
- **📈 Live Metrics**: Real-time efficiency, cost savings, and carbon footprint tracking

## 🏗️ Architecture

### Frontend (React + Vite)
- **Framework**: React 18 with modern hooks and context
- **UI Components**: Radix UI components with Tailwind CSS
- **State Management**: TanStack Query for server state, React hooks for local state
- **Routing**: Wouter for lightweight client-side routing
- **Charts**: Recharts for analytics visualizations

### Backend (Node.js + Express)
- **Server**: Express.js with CORS and JSON middleware
- **Database**: PostgreSQL with Drizzle ORM (in-memory storage for development)
- **API**: RESTful endpoints for layouts, simulations, and order items
- **Storage**: Modular storage system supporting both database and in-memory options

### Core Algorithms
- **Pathfinding**: A* algorithm for optimal robot movement
- **Optimization**: Traveling Salesman Problem (TSP) solver for shelf ordering
- **Seasonal Logic**: Different optimization strategies for various demand scenarios

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd bharat-warehouse-optimiser
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```
   This will start both the backend server (port 5000) and frontend development server.

4. **Access the application**
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:5000`

### Available Scripts

- `npm run dev` - Start both frontend and backend in development mode
- `npm run client:dev` - Start only the frontend development server
- `npm run build` - Build the application for production
- `npm start` - Start the production server
- `npm run db:push` - Push database schema changes

## 🎮 How to Use

### 1. Layout Design
- **Select Components**: Choose from shelf, robot start point, packing station, or obstacles
- **Place Elements**: Click on grid cells to place selected components
- **Configure Grid**: Adjust grid size (default: 15x15)
- **Save Layouts**: Store your designs for future use

### 2. Order Management
- **Add Order Items**: Select shelves and add items to your order
- **Configure Products**: Map products to specific shelf locations
- **Order Optimization**: System automatically optimizes picking sequence

### 3. Simulation Setup
- **Season Selection**: Choose between normal, black-friday, christmas, or holiday modes
- **Robot Speed**: Adjust simulation speed for different scenarios
- **Start Simulation**: Watch real-time robot movement and pathfinding

### 4. Analytics Dashboard
- **Performance Metrics**: View efficiency, cost savings, and carbon reduction
- **ROI Calculator**: Calculate return on investment for different layouts
- **Comparative Analysis**: Compare multiple layout configurations
- **Impact Projections**: See potential savings across multiple stores/locations

## 🧠 Core Components

### Simulation Engine (`client/src/lib/simulation.js`)
- **TSP Solver**: Optimizes shelf visiting order using Traveling Salesman Problem
- **Seasonal Adaptation**: Different algorithms for various demand scenarios
- **Path Calculation**: Integrates with A* pathfinding for optimal routes
- **Metrics Calculation**: Real-time efficiency, time, and cost calculations

### Pathfinding Service (`client/src/lib/pathfinding.js`)
- **A* Algorithm**: Optimal pathfinding with obstacle avoidance
- **Heuristic Calculation**: Manhattan distance for efficient pathfinding
- **Dynamic Routing**: Adapts to changing warehouse layouts

### Analytics Dashboard (`client/src/components/AnalyticsDashboard.jsx`)
- **ROI Calculator**: Comprehensive return on investment analysis
- **Performance Charts**: Visual representation of efficiency trends
- **Carbon Footprint**: Environmental impact calculations
- **Implementation Timeline**: Rollout planning and cost projections

## 📊 Key Metrics Tracked

### Operational Metrics
- **Efficiency**: Percentage of optimal route achieved
- **Total Distance**: Cumulative robot travel distance
- **Total Time**: Simulation duration in seconds
- **Order Completion**: Items collected vs. total order items

### Financial Metrics
- **Cost Savings**: Daily operational cost reductions
- **ROI**: Return on investment calculations
- **Implementation Cost**: Setup and deployment expenses
- **Annual Savings**: Projected yearly cost reductions

### Environmental Metrics
- **Carbon Reduction**: CO₂ emission reductions
- **Distance Optimization**: Reduced travel distances
- **Energy Efficiency**: Lower energy consumption patterns

## 🌍 Seasonal Optimization

The system adapts to different operational scenarios:

### Normal Operations
- Standard TSP optimization for balanced efficiency
- Baseline performance metrics

### High-Demand Periods (Black Friday, Christmas)
- **Order Volume**: 2.5x normal capacity
- **Efficiency Adjustment**: 85-90% of optimal due to increased complexity
- **Speed Boost**: 20% faster robot movement
- **Priority Routing**: Demand-based shelf ordering

### Emergency/Disaster Relief
- **Rapid Deployment**: Optimized for quick setup
- **High Volume**: 1.8x normal capacity
- **Flexible Routing**: Adaptable to changing requirements

## 🗄️ Database Schema

### Layouts Table
```sql
- id: Primary key
- name: Layout name
- description: Layout description
- gridSize: Grid dimensions (default: 15)
- gridData: JSON array representing warehouse layout
- metrics: Performance metrics (JSON)
- createdAt: Timestamp
```

### Simulations Table
```sql
- id: Primary key
- layoutId: Foreign key to layouts
- orderItems: JSON array of order items
- totalDistance: Simulation distance
- totalTime: Simulation duration
- efficiency: Calculated efficiency percentage
- pathData: Robot path coordinates (JSON)
- createdAt: Timestamp
```

### Order Items Table
```sql
- id: Primary key
- name: Item name
- shelfLocation: Shelf identifier
- gridX: X coordinate on grid
- gridY: Y coordinate on grid
```

## 🔧 Configuration

### Environment Variables
- `NODE_ENV`: Set to 'development' or 'production'
- Database connection settings (when using PostgreSQL)

### Customization Options
- Grid size adjustment
- Robot speed settings
- Seasonal multiplier configuration
- Cost calculation parameters (labor, energy, etc.)

## 📈 Performance Optimization

### Algorithm Efficiency
- **TSP Solver**: Optimized for up to 7 shelves (brute-force)
- **A* Pathfinding**: Efficient heuristic-based routing
- **Memory Management**: Optimized data structures for large grids

### Frontend Optimization
- **React Query**: Intelligent caching and background updates
- **Component Lazy Loading**: Optimized bundle splitting
- **Real-time Updates**: Efficient state management for live simulations

## 🚀 Deployment

### Production Build
```bash
npm run build
npm start
```

### Docker Deployment (Optional)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 5000
CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For questions, issues, or contributions, please refer to the project documentation or create an issue in the repository.

---

**Built with ❤️ for optimizing warehouse operations and improving supply chain efficiency.**
