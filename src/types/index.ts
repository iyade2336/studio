
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: 'Sensor' | 'Equipment' | 'Subscription';
  stock?: number; // Optional: for physical products
  dataAiHint?: string; // For placeholder images
}

export interface CartItem extends Product {
  quantity: number;
}
