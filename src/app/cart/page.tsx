
"use client";

import { PageHeader } from "@/components/shared/page-header";
import { useCart } from "@/context/cart-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { Trash2, Plus, Minus, ShoppingBag, CreditCard } from "lucide-react";

export default function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, clearCart, cartTotal, itemCount } = useCart();

  return (
    <div className="space-y-6 md:space-y-8">
      <PageHeader
        title="Your Shopping Cart"
        description={itemCount > 0 ? `You have ${itemCount} item(s) in your cart.` : "Your cart is currently empty."}
      />

      {itemCount === 0 ? (
        <Card className="text-center py-12 shadow-md">
          <CardHeader>
            <ShoppingBag className="mx-auto h-20 w-20 text-muted-foreground mb-4" />
            <CardTitle className="text-2xl">Your Cart is Empty</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">
              Looks like you haven&apos;t added anything to your cart yet.
            </p>
            <Button asChild size="lg">
              <Link href="/products">Start Shopping</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <Card key={item.id} className="flex flex-col sm:flex-row items-center p-4 gap-4 shadow-sm">
                <div className="relative h-24 w-24 sm:h-20 sm:w-20 shrink-0 overflow-hidden rounded-md">
                  <Image
                    src={item.imageUrl}
                    alt={item.name}
                    layout="fill"
                    objectFit="cover"
                     data-ai-hint={item.dataAiHint || "product image"}
                  />
                </div>
                <div className="flex-grow text-center sm:text-left">
                  <h3 className="text-lg font-semibold">{item.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    ${item.price.toFixed(2)} each
                  </p>
                </div>
                <div className="flex items-center gap-2 mt-2 sm:mt-0">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="h-8 w-8"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-10 text-center font-medium">{item.quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="h-8 w-8"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <p className="font-semibold sm:ml-4 w-20 text-center sm:text-right">
                  ${(item.price * item.quantity).toFixed(2)}
                </p>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeFromCart(item.id)}
                  className="text-destructive hover:text-destructive-foreground hover:bg-destructive/90 sm:ml-2"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </Card>
            ))}
             <div className="mt-4 flex justify-end">
                <Button variant="outline" onClick={clearCart} className="text-destructive border-destructive hover:bg-destructive/10">
                    <Trash2 className="mr-2 h-4 w-4"/> Clear Cart
                </Button>
            </div>
          </div>

          <Card className="lg:col-span-1 h-fit shadow-md sticky top-20">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span>Subtotal ({itemCount} items)</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="text-green-600">FREE</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-3 mt-3">
                <span>Total</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button size="lg" className="w-full">
                <CreditCard className="mr-2 h-5 w-5" /> Proceed to Checkout
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}
