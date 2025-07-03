// utils/attachShelfCoordinates.js
export function attachShelfCoordinatesToOrderItems(orderItems, shelfProductMap) {
  return orderItems.map(item => {
    const match = Object.entries(shelfProductMap).find(
      ([_, productName]) => productName.toLowerCase() === item.name.toLowerCase()
    );

    if (match) {
      const [key] = match;
      const [x, y] = key.split(",").map(Number);
      return { ...item, gridX: x, gridY: y };
    }

    return { ...item, gridX: null, gridY: null };
  });
}
