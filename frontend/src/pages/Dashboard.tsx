import React from "react";
import { useAuthStore } from "../store/authStore";
import { Link } from "react-router-dom";

const Dashboard: React.FC = () => {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="space-y-6">
      
    </div>
  );
};

export default Dashboard;
