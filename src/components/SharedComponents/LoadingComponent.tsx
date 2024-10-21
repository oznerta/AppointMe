import { useEffect, useState } from 'react';
import { Progress } from "@/components/ui/progress";

const LoadingComponent = () => {
    const [progress, setProgress] = useState(20);

    useEffect(() => {
        // Simulate the progress incrementing from 20 to 100
        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(interval);
                    return 100; // Ensure it caps at 100
                }
                return prev + 20; // Increment by 10
            });
        }, 500); // Adjust the interval duration as needed

        return () => clearInterval(interval); // Cleanup on unmount
    }, []);

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100"> {/* Full viewport height */}
            <div className="flex flex-col items-center justify-center w-[250px]">
                <Progress value={progress} />
                <span className="mt-2">Loading...</span>
            </div>
        </div>
    );
};

export default LoadingComponent;
