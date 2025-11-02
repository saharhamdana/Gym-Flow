import React from "react";
// Importation nommée pour correspondre à l'exportation nommée dans StaffList.jsx
import { StaffList } from "@/components/admin/StaffList"; 
import { Card } from "@material-tailwind/react";

export function Staff() {
  return (
    <div className="mt-12 mb-8 flex flex-col gap-12">
      {/* La Card englobe StaffList qui contient les statistiques et le header */}
      <Card className="mx-3 !bg-transparent shadow-none"> 
        <StaffList />
      </Card>
    </div>
  );
}

export default Staff;