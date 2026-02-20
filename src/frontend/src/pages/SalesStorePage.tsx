import { useState } from 'react';
import { useCreateSalesOrder } from '@/hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2, ShoppingCart, Minus, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { formatCurrency } from '@/utils/format';
import { useCartStore } from '@/state/cart';
import { Product, PaymentPlan } from '../backend';

// Sample products with both actual and offer prices
const SAMPLE_PRODUCTS: Product[] = [
  {
    productId: '1',
    name: 'Travel Backpack',
    description: 'Durable and spacious backpack perfect for all your adventures',
    price: BigInt(2500),
    offerPrice: BigInt(2000),
    imageUrls: [],
    category: 'Bags',
  },
  {
    productId: '2',
    name: 'Water Bottle',
    description: 'Insulated stainless steel water bottle',
    price: BigInt(800),
    offerPrice: BigInt(650),
    imageUrls: [],
    category: 'Accessories',
  },
  {
    productId: '3',
    name: 'Travel Pillow',
    description: 'Comfortable memory foam travel pillow',
    price: BigInt(1200),
    offerPrice: BigInt(950),
    imageUrls: [],
    category: 'Comfort',
  },
  {
    productId: '4',
    name: 'Sunglasses',
    description: 'UV protection sunglasses with polarized lenses',
    price: BigInt(1500),
    offerPrice: BigInt(1200),
    imageUrls: [],
    category: 'Accessories',
  },
  {
    productId: '5',
    name: 'Travel Journal',
    description: 'Premium leather-bound travel journal',
    price: BigInt(900),
    offerPrice: BigInt(750),
    imageUrls: [],
    category: 'Stationery',
  },
  {
    productId: '6',
    name: 'Portable Charger',
    description: 'High-capacity portable power bank',
    price: BigInt(1800),
    offerPrice: BigInt(1500),
    imageUrls: [],
    category: 'Electronics',
  },
];

export default function SalesStorePage() {
  const { identity } = useInternetIdentity();
  const createOrder = useCreateSalesOrder();
  const { items, addItem, removeItem, updateQuantity, clearCart, getTotalPrice } = useCartStore();

  const [showCheckout, setShowCheckout] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [orderId, setOrderId] = useState<string>('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [email, setEmail] = useState('');
  const [paymentPlan, setPaymentPlan] = useState<PaymentPlan>(PaymentPlan.fullUpfront);

  const isAuthenticated = !!identity;
  const cartTotal = getTotalPrice();
  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const upfrontAmount = paymentPlan === PaymentPlan.partialUpfront ? Math.round(cartTotal * 0.4) : cartTotal;
  const remainingAmount = paymentPlan === PaymentPlan.partialUpfront ? cartTotal - upfrontAmount : 0;

  const handleCheckout = () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to checkout');
      return;
    }
    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    setShowCheckout(true);
  };

  const handlePlaceOrder = async () => {
    if (!deliveryAddress || !contactNumber || !email) {
      toast.error('Please fill in all delivery details');
      return;
    }

    try {
      const id = await createOrder.mutateAsync({
        products: items.map(item => item.product),
        deliveryAddress,
        contactNumber,
        email,
        totalPrice: BigInt(cartTotal),
        paymentPlan,
      });
      setOrderId(id);
      setShowCheckout(false);
      setShowConfirmation(true);
      clearCart();
      toast.success('Order placed successfully!');
    } catch (error) {
      toast.error('Failed to place order');
      console.error(error);
    }
  };

  if (showConfirmation) {
    return (
      <div className="container py-16 max-w-2xl">
        <Card className="border-green-500/50">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
              <CheckCircle2 className="h-6 w-6 text-green-500" />
            </div>
            <CardTitle>Order Confirmed!</CardTitle>
            <CardDescription>
              Your order has been successfully placed
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border p-4 space-y-2">
              <p><strong>Order Reference:</strong> {orderId}</p>
              <p><strong>Delivery Address:</strong> {deliveryAddress}</p>
              <p><strong>Contact:</strong> {contactNumber}</p>
              <p><strong>Email:</strong> {email}</p>
            </div>

            <div className="rounded-lg border p-4 space-y-2 bg-muted/50">
              <p className="font-semibold mb-2">Payment Summary</p>
              <div className="flex justify-between text-sm">
                <span>Total Amount:</span>
                <span className="font-medium">{formatCurrency(cartTotal)}</span>
              </div>
              {paymentPlan === PaymentPlan.partialUpfront && (
                <>
                  <div className="flex justify-between text-sm">
                    <span>Upfront Payment (40%):</span>
                    <span className="font-medium text-primary">{formatCurrency(upfrontAmount)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Cash on Delivery:</span>
                    <span className="font-medium">{formatCurrency(remainingAmount)}</span>
                  </div>
                </>
              )}
            </div>

            <Button onClick={() => setShowConfirmation(false)} className="w-full">
              Continue Shopping
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header with Background Image */}
      <div 
        className="relative py-12 px-4 bg-hero-image bg-overlay-subtle"
        style={{
          backgroundImage: 'url(/assets/generated/travel-bg-resort-view-2.dim_1920x1080.jpg)'
        }}
      >
        <div className="container max-w-7xl mx-auto content-above-overlay">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Travel Store</h1>
              <p className="text-muted-foreground">Essential items for your journey</p>
            </div>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="lg" className="relative">
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Cart
                  {cartItemCount > 0 && (
                    <Badge className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center">
                      {cartItemCount}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent className="w-full sm:max-w-lg">
                <SheetHeader>
                  <SheetTitle>Shopping Cart</SheetTitle>
                </SheetHeader>
                <div className="mt-8 space-y-4">
                  {items.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">Your cart is empty</p>
                  ) : (
                    <>
                      <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                        {items.map((item) => (
                          <div key={item.product.productId} className="flex gap-4 p-4 rounded-lg border">
                            <div className="flex-1">
                              <h4 className="font-medium">{item.product.name}</h4>
                              <div className="flex items-center gap-2 mt-1">
                                <p className="text-sm font-semibold text-primary">{formatCurrency(item.product.offerPrice)}</p>
                                <p className="text-xs text-muted-foreground line-through">{formatCurrency(item.product.price)}</p>
                              </div>
                              <div className="flex items-center gap-2 mt-2">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => updateQuantity(item.product.productId, item.quantity - 1)}
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span className="w-8 text-center">{item.quantity}</span>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => updateQuantity(item.product.productId, item.quantity + 1)}
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 ml-auto"
                                  onClick={() => removeItem(item.product.productId)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <Separator />
                      <div className="space-y-2">
                        <div className="flex justify-between text-lg font-semibold">
                          <span>Total:</span>
                          <span>{formatCurrency(cartTotal)}</span>
                        </div>
                        <Button onClick={handleCheckout} className="w-full" size="lg">
                          Proceed to Checkout
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Checkout Form */}
      {showCheckout && (
        <div className="container py-8 max-w-4xl">
          <Card>
            <CardHeader>
              <CardTitle>Checkout</CardTitle>
              <CardDescription>Complete your order details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Delivery Address</Label>
                  <Input
                    id="address"
                    placeholder="Enter your delivery address"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Contact Number</Label>
                  <Input
                    id="phone"
                    placeholder="Enter your contact number"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Payment Option</Label>
                  <RadioGroup value={paymentPlan} onValueChange={(value) => setPaymentPlan(value as PaymentPlan)}>
                    <div className="flex items-center space-x-2 p-3 rounded-lg border">
                      <RadioGroupItem value={PaymentPlan.fullUpfront} id="full" />
                      <Label htmlFor="full" className="flex-1 cursor-pointer">
                        <div>
                          <p className="font-medium">Pay Full Amount</p>
                          <p className="text-sm text-muted-foreground">{formatCurrency(cartTotal)}</p>
                        </div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-3 rounded-lg border">
                      <RadioGroupItem value={PaymentPlan.partialUpfront} id="partial" />
                      <Label htmlFor="partial" className="flex-1 cursor-pointer">
                        <div>
                          <p className="font-medium">40% Upfront + Cash on Delivery</p>
                          <p className="text-sm text-muted-foreground">
                            Pay {formatCurrency(Math.round(cartTotal * 0.4))} now, {formatCurrency(cartTotal - Math.round(cartTotal * 0.4))} on delivery
                          </p>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <h3 className="font-semibold">Order Summary</h3>
                {items.map((item) => (
                  <div key={item.product.productId} className="flex justify-between text-sm">
                    <span>{item.product.name} x {item.quantity}</span>
                    <span>{formatCurrency(Number(item.product.offerPrice) * item.quantity)}</span>
                  </div>
                ))}
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total:</span>
                  <span>{formatCurrency(cartTotal)}</span>
                </div>
                {paymentPlan === PaymentPlan.partialUpfront && (
                  <>
                    <div className="flex justify-between text-sm text-primary">
                      <span>Upfront Payment (40%):</span>
                      <span className="font-semibold">{formatCurrency(upfrontAmount)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Cash on Delivery:</span>
                      <span>{formatCurrency(remainingAmount)}</span>
                    </div>
                  </>
                )}
              </div>

              <div className="flex gap-4">
                <Button variant="outline" onClick={() => setShowCheckout(false)} className="flex-1">
                  Back to Cart
                </Button>
                <Button onClick={handlePlaceOrder} disabled={createOrder.isPending} className="flex-1">
                  {createOrder.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Placing Order...
                    </>
                  ) : (
                    'Place Order'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Products Grid */}
      {!showCheckout && (
        <div className="container py-8 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SAMPLE_PRODUCTS.map((product) => (
              <Card key={product.productId} className="overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-lg">{product.name}</CardTitle>
                  <CardDescription>{product.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Badge variant="secondary">{product.category}</Badge>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold text-primary">{formatCurrency(product.offerPrice)}</p>
                    <p className="text-sm text-muted-foreground line-through">{formatCurrency(product.price)}</p>
                  </div>
                  <Button onClick={() => addItem(product)} className="w-full">
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Add to Cart
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
