import { useState, useEffect } from "react";
import { Star } from "lucide-react";

const LoadingComponent = () => {
  const [dots, setDots] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prevDots) => {
        if (prevDots.length < 3) {
          return prevDots + ".";
        } else {
          return "";
        }
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center justify-center h-screen">
      <Star className="animate-spin mr-2 text-primary" size={32} />
      Loading{dots}
    </div>
  );
};

export default LoadingComponent;
