import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Hotel, Car, UserCircle, ShoppingBag, ArrowRight } from 'lucide-react';

export default function HomePage() {
  const services = [
    {
      title: 'Hotels & Stays',
      description: 'Book comfortable rooms, cottages, and stays with our easy booking system',
      icon: Hotel,
      to: '/hotel',
      color: 'from-blue-500 to-blue-600',
    },
    {
      title: 'Cab Booking',
      description: 'Reliable cab services from 4-seater to 22-seater vehicles',
      icon: Car,
      to: '/cab',
      color: 'from-green-500 to-green-600',
    },
    {
      title: 'Acting Driver',
      description: 'Professional acting driver services for your convenience',
      icon: UserCircle,
      to: '/driver',
      color: 'from-purple-500 to-purple-600',
    },
    {
      title: 'Store',
      description: 'Browse and purchase quality products with easy delivery',
      icon: ShoppingBag,
      to: '/store',
      color: 'from-orange-500 to-orange-600',
    },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Hero Section with Background Image */}
      <section 
        className="relative py-20 px-4 bg-hero-image bg-overlay-light"
        style={{
          backgroundImage: 'url(/assets/generated/travel-bg-hero-couple.dim_1920x1080.jpg)'
        }}
      >
        <div className="container max-w-6xl mx-auto text-center content-above-overlay">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-orange-600 bg-clip-text text-transparent">
            Welcome to Travel Break
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Your one-stop platform for hotels, transportation, and shopping needs
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/hotel">
              <Button size="lg" className="gap-2">
                Explore Services
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/customer-care">
              <Button size="lg" variant="outline">
                Contact Support
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16 px-4">
        <div className="container max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Our Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {services.map((service) => (
              <Link key={service.to} to={service.to}>
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${service.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <service.icon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle>{service.title}</CardTitle>
                    <CardDescription>{service.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="ghost" className="gap-2 group-hover:gap-3 transition-all">
                      Learn More
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
