
"use client";

import Image from 'next/image';
import type { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart, PackageSearch } from 'lucide-react';
import { useCart } from '@/context/cart-context';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart(product, 1);
  };

  return (
    <Card className="flex flex-col h-full shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
      <div className="relative w-full h-56 bg-muted">
        <Image
          src={product.imageUrl}
          alt={product.name}
          layout="fill"
          objectFit="cover"
          data-ai-hint={product.dataAiHint || "product image"}
          className="transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">{product.name}</CardTitle>
        <Badge variant={product.category === 'Sensor' ? 'default' : 'secondary'} className="w-fit text-xs">
          {product.category}
        </Badge>
      </CardHeader>
      <CardContent className="flex-grow">
        <CardDescription className="line-clamp-3 mb-2">{product.description}</CardDescription>
        <p className="text-2xl font-semibold text-primary">${product.price.toFixed(2)}</p>
        {product.stock !== undefined && (
           <p className={cn("text-sm mt-1", product.stock > 0 ? "text-green-600" : "text-destructive")}>
             {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
           </p>
        )}
      </CardContent>
      <CardFooter className="gap-2">
        <Button variant="outline" className="w-1/2" asChild>
           {/* TODO: Link to actual product detail page */}
          <a href={`/products/${product.id}`}> 
            <PackageSearch className="mr-2 h-4 w-4" /> View
          </a>
        </Button>
        <Button 
          className="w-1/2" 
          onClick={handleAddToCart}
          disabled={product.stock !== undefined && product.stock <= 0}
        >
          <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
}

// Temporary Badge component if not already globally available
// This should be in ui/badge.tsx and imported. If it is, remove this.
const Badge = ({ className, variant, ...props }: React.HTMLAttributes<HTMLDivElement> & { variant?: 'default' | 'secondary' | 'destructive' | 'outline' }) => (
  <span
    className={cn(
      "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
      variant === 'default' && "border-transparent bg-primary text-primary-foreground",
      variant === 'secondary' && "border-transparent bg-secondary text-secondary-foreground",
      variant === 'destructive' && "border-transparent bg-destructive text-destructive-foreground",
      variant === 'outline' && "text-foreground",
      className
    )}
    {...props}
  />
);
