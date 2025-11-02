import React from "react";
import { StaffList } from "../../components/admin/StaffList";
import { Card } from "@material-tailwind/react";

export function Staff() {
  return (
    <div className="mt-12">
      <Card>
        <StaffList />
      </Card>
    </div>
  );
}

export default Staff;