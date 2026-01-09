// src/pages/NotFound.jsx
import { Link } from 'react-router-dom';
import { FaCompass, FaArrowLeft } from 'react-icons/fa';
import Button from '../Components/ui/Button';

function NotFound() {
    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center px-6 py-64 text-center animate-fade-in-up">
            <div className="w-24 h-24 bg-secondary rounded-full flex items-center justify-center mb-6 shadow-inner">
                <FaCompass className="text-4xl text-muted-foreground animate-pulse" />
            </div>

            <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-br from-foreground to-gray-400">
                404
            </h1>
            <p className="text-xl font-bold text-foreground mb-2">Off the Map</p>
            <p className="text-muted-foreground max-w-md mb-8">
                It seems you've steered off course. The page you are looking for doesn't exist or has been moved.
            </p>

            <Button to="/" variant="primary" size="lg" className="gap-2 px-8">
                <FaArrowLeft /> Return to Base
            </Button>
        </div>
    );
}

export default NotFound;
