import { useState, useMemo } from 'react';
import { useCreateSalesOrder, useGetMySalesOrders } from '@/hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2, ShoppingCart, Trash2, Plus, Minus, CheckCircle2, Info, Package } from 'lucide-react';
import { toast } from 'sonner';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { formatCurrency } from '@/utils/format';
import type { Product } from '../backend';
import { PaymentPlan } from '../backend';

type CartItem = Product & { quantity: number };

const SAMPLE_PRODUCTS: Product[] = [
  {
    productId: 'prod-1',
    name: 'Travel Backpack',
    description: 'Durable 40L travel backpack with multiple compartments',
    price: BigInt(2500),
    imageUrls: [],
    category: 'Luggage',
  },
  {
    productId: 'prod-2',
    name: 'Portable Charger',
    description: '20000mAh power bank with fast charging',
    price: BigInt(1500),
    imageUrls: [],
    category: 'Electronics',
  },
  {
    productId: 'prod-3',
    name: 'Travel Pillow',
    description: 'Memory foam neck pillow for comfortable travel',
    price: BigInt(800),
    imageUrls: [],
    category: 'Accessories',
  },
  {
    productId: 'prod-4',
    name: 'Water Bottle',
    description: 'Insulated stainless steel water bottle 750ml',
    price: BigInt(600),
    imageUrls: [],
    category: 'Accessories',
  },
  {
    productId: 'prod-5',
    name: 'Travel Adapter',
    description: 'Universal travel adapter with USB ports',
    price: BigInt(1200),
    imageUrls: [],
    category: 'Electronics',
  },
  {
    productId: 'prod-6',
    name: 'Luggage Tag Set',
    description: 'Set of 4 durable luggage tags',
    price: BigInt(400),
    imageUrls: [],
    category: 'Accessories',
  },
];

type CheckoutStep = 'browse' | 'checkout' | 'confirmation';

export default function SalesStorePage() {
  const { identity } = useInternetIdentity();
  const { data: myOrders } = useGetMySalesOrders();
  const createOrder = useCreateSalesOrder();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [step, setStep] = useState<CheckoutStep>('browse');
  const [orderId, setOrderId] = useState<string>('');

  // Checkout form state
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [email, setEmail] = useState('');
  const [paymentOption, setPaymentOption] = useState<'full' | 'partial'>('full');

  const isAuthenticated = !!identity;

  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
  }, [cart]);

  const paymentBreakdown = useMemo(() => {
    if (paymentOption === 'full') {
      return {
        upfront: cartTotal,
        remaining: 0,
        label: 'Full Payment',
      };
    } else {
      const upfront = Math.round(cartTotal * 0.4);
      const remaining = cartTotal - upfront;
      return {
        upfront,
        remaining,
        label: '40% Upfront + COD',
      };
    }
  }, [cartTotal, paymentOption]);

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === product.productId);
      if (existing) {
        return prev.map((item) =>
          item.productId === product.productId ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    toast.success(`${product.name} added to cart`);
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.productId === productId ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
    toast.success('Item removed from cart');
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    if (!isAuthenticated) {
      toast.error('Please sign in to checkout');
      return;
    }
    setStep('checkout');
  };

  const handlePlaceOrder = async () => {
    if (!deliveryAddress || !contactNumber || !email) {
      toast.error('Please fill in all delivery details');
      return;
    }

    const products = cart.map(({ quantity, ...product }) => product);
    const paymentPlan = paymentOption === 'full' ? PaymentPlan.fullUpfront : PaymentPlan.partialUpfront;

    try {
      const id = await createOrder.mutateAsync({
        products,
        deliveryAddress,
        contactNumber,
        email,
        totalPrice: BigInt(cartTotal),
        paymentPlan,
      });
      setOrderId(id);
      setStep('confirmation');
      toast.success('Order placed successfully!');
    } catch (error) {
      toast.error('Failed to place order');
      console.error(error);
    }
  };

  if (step === 'confirmation') {
    return (
      <div className="container py-16 max-w-2xl">
        <Card className="border-green-500/50">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
              <CheckCircle2 className="h-6 w-6 text-green-500" />
            </div>
            <CardTitle>Order Placed Successfully!</CardTitle>
            <CardDescription>
              Your order has been confirmed and will be processed soon
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border p-4 space-y-2">
              <p><strong>Order Reference:</strong> {orderId}</p>
              <p><strong>Items:</strong> {cart.reduce((sum, item) => sum + item.quantity, 0)} item(s)</p>
              <p><strong>Delivery Address:</strong> {deliveryAddress}</p>
            </div>

            <div className="rounded-lg border p-4 space-y-2 bg-muted/50">
              <p className="font-semibold mb-2">Payment Summary</p>
              <div className="flex justify-between text-sm">
                <span>Total Amount:</span>
                <span className="font-medium">{formatCurrency(cartTotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Payment Option:</span>
                <span className="font-medium">{paymentBreakdown.label}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Upfront Payment:</span>
                <span className="font-medium text-primary">{formatCurrency(paymentBreakdown.upfront)}</span>
              </div>
              {paymentBreakdown.remaining > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Cash on Delivery:</span>
                  <span className="font-medium">{formatCurrency(paymentBreakdown.remaining)}</span>
                </div>
              )}
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Next Step:</strong> {paymentOption === 'full' 
                  ? `Please submit a payment record for the full amount of ${formatCurrency(paymentBreakdown.upfront)} on the Payment Receiving page.`
                  : `Please submit a payment record for the upfront amount of ${formatCurrency(paymentBreakdown.upfront)} on the Payment Receiving page. The remaining ${formatCurrency(paymentBreakdown.remaining)} will be collected on delivery.`
                } Use the order reference <strong>{orderId}</strong> when submitting your payment record.
              </AlertDescription>
            </Alert>

            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-sm">
              <p className="text-blue-900 dark:text-blue-100">
                <strong>Note:</strong> This system records payment information only. No actual payment processing occurs. Email and WhatsApp notifications are not included in this version.
              </p>
            </div>

            <Button
              onClick={() => {
                setStep('browse');
                setCart([]);
                setOrderId('');
                setDeliveryAddress('');
                setContactNumber('');
                setEmail('');
                setPaymentOption('full');
              }}
              className="w-full"
            >
              Continue Shopping
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 'checkout') {
    return (
      <div className="container py-8 max-w-4xl">
        <Button variant="ghost" onClick={() => setStep('browse')} className="mb-4">
          ← Back to Store
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Delivery Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Delivery Address *</Label>
                  <Textarea
                    id="address"
                    placeholder="Enter your complete delivery address"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Contact Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter your contact number"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <Separator className="my-4" />

                <div className="space-y-3">
                  <Label>Payment Option *</Label>
                  <RadioGroup value={paymentOption} onValueChange={(value) => setPaymentOption(value as 'full' | 'partial')}>
                    <div className="flex items-start space-x-3 rounded-lg border p-4 cursor-pointer hover:bg-muted/50">
                      <RadioGroupItem value="full" id="full" />
                      <div className="flex-1">
                        <Label htmlFor="full" className="cursor-pointer font-medium">
                          Full Payment
                        </Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          Pay the full amount upfront
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 rounded-lg border p-4 cursor-pointer hover:bg-muted/50">
                      <RadioGroupItem value="partial" id="partial" />
                      <div className="flex-1">
                        <Label htmlFor="partial" className="cursor-pointer font-medium">
                          40% Upfront + Cash on Delivery
                        </Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          Pay 40% now and the remaining 60% on delivery
                        </p>
                      </div>
                    </div>
                  </RadioGroup>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div key={item.productId} className="flex justify-between text-sm">
                      <span>{item.name} × {item.quantity}</span>
                      <span className="font-medium">{formatCurrency(Number(item.price) * item.quantity)}</span>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between font-semibold">
                    <span>Total:</span>
                    <span>{formatCurrency(cartTotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-primary">
                    <span>Upfront Payment:</span>
                    <span className="font-semibold">{formatCurrency(paymentBreakdown.upfront)}</span>
                  </div>
                  {paymentBreakdown.remaining > 0 && (
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Cash on Delivery:</span>
                      <span>{formatCurrency(paymentBreakdown.remaining)}</span>
                    </div>
                  )}
                </div>

                <Button onClick={handlePlaceOrder} disabled={createOrder.isPending} className="w-full">
                  {createOrder.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Placing Order...
                    </>
                  ) : (
                    'Place Order'
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
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
          <h1 className="text-3xl font-bold mb-2">Sales Store</h1>
          <p className="text-muted-foreground">Browse and purchase quality travel products</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Products Grid */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {SAMPLE_PRODUCTS.map((product) => (
                <Card key={product.productId} className="flex flex-col">
                  <CardHeader>
                    <div className="w-full h-32 bg-muted rounded-lg flex items-center justify-center mb-2">
                      <Package className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <CardTitle className="text-lg">{product.name}</CardTitle>
                    <CardDescription className="text-sm">{product.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col justify-end">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-primary">{formatCurrency(product.price)}</span>
                      <Button size="sm" onClick={() => addToCart(product)}>
                        <Plus className="h-4 w-4 mr-1" />
                        Add
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Shopping Cart */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Cart ({cart.reduce((sum, item) => sum + item.quantity, 0)})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cart.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">Your cart is empty</p>
                ) : (
                  <>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {cart.map((item) => (
                        <div key={item.productId} className="rounded-lg border p-3 space-y-2">
                          <div className="flex justify-between items-start">
                            <p className="font-medium text-sm">{item.name}</p>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => removeFromCart(item.productId)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => updateQuantity(item.productId, -1)}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="text-sm w-8 text-center">{item.quantity}</span>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => updateQuantity(item.productId, 1)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                            <span className="text-sm font-medium">{formatCurrency(Number(item.price) * item.quantity)}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <div className="flex justify-between font-semibold">
                        <span>Total:</span>
                        <span className="text-primary">{formatCurrency(cartTotal)}</span>
                      </div>
                    </div>

                    <Button onClick={handleCheckout} className="w-full">
                      Proceed to Checkout
                    </Button>

                    {!isAuthenticated && (
                      <p className="text-xs text-muted-foreground text-center">
                        Please sign in to checkout
                      </p>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Recent Orders */}
            {isAuthenticated && myOrders && myOrders.length > 0 && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-base">Recent Orders</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {myOrders.slice(0, 3).map((order) => (
                    <div key={order.orderId} className="rounded-lg border p-3 text-sm">
                      <p className="font-medium">{order.products.length} item(s)</p>
                      <p className="text-muted-foreground">{formatCurrency(order.totalPrice)}</p>
                      <Badge variant={order.status === 'confirmed' ? 'default' : 'secondary'} className="mt-2">
                        {order.status}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
