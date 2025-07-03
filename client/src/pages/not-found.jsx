import { Link } from "wouter";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-warehouse-50 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-warehouse-400 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-warehouse-900 mb-2">Page Not Found</h2>
          <p className="text-warehouse-600">
            The warehouse layout you're looking for doesn't exist.
          </p>
        </div>
        
        <div className="space-y-4">
          <Link href="/">
            <a className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
              <Home className="w-4 h-4 mr-2" />
              Back to Simulator
            </a>
          </Link>
          
          <button 
            onClick={() => window.history.back()}
            className="inline-flex items-center px-6 py-3 bg-warehouse-100 text-warehouse-700 rounded-lg hover:bg-warehouse-200 transition-colors ml-3"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}