import { useMemo } from "react";
import { computeOutOfStock, getInventoryAlerts } from "../services/inventory";

export const useInventory = (inventory, menuItems) => {
  const computedOutOfStock = useMemo(() => computeOutOfStock(inventory || [], menuItems || []), [inventory, menuItems]);

  const alerts = useMemo(() => getInventoryAlerts(inventory || [], menuItems || []), [inventory, menuItems]);

  return { computedOutOfStock, alerts };
};
