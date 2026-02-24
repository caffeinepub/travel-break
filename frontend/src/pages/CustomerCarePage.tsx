import { useState } from 'react';
import { useSubmitInquiry, useGetMyInquiries } from '@/hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle2, Mail, Phone, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { formatDateTime } from '@/utils/format';
import { Variant_new_closed_reviewed } from '../backend';

export default function CustomerCarePage() {
  const { identity } = useInternetIdentity();
  const { data: myInquiries } = useGetMyInquiries();
  const submitInquiry = useSubmitInquiry();

  const [message, setMessage] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);

  const isAuthenticated = !!identity;

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to submit an inquiry');
      return;
    }

    if (!message || !contactInfo) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      await submitInquiry.mutateAsync({ message, contactInfo });
      setShowConfirmation(true);
      setMessage('');
      setContactInfo('');
      toast.success('Inquiry submitted successfully!');
    } catch (error) {
      toast.error('Failed to submit inquiry');
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
            <CardTitle>Inquiry Submitted!</CardTitle>
            <CardDescription>
              We've received your message and will get back to you soon
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-sm">
              <p className="text-blue-900 dark:text-blue-100">
                <strong>Note:</strong> Email and WhatsApp notifications are not included in this version. 
                Our support team will review your inquiry and respond through your provided contact information.
              </p>
            </div>
            <Button onClick={() => setShowConfirmation(false)} className="w-full">
              Submit Another Inquiry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Customer Care</h1>
        <p className="text-muted-foreground">We're here to help you</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Submit an Inquiry</CardTitle>
              <CardDescription>Send us your questions or concerns</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="contact">Your Contact Information *</Label>
                <Input
                  id="contact"
                  value={contactInfo}
                  onChange={(e) => setContactInfo(e.target.value)}
                  placeholder="Email or phone number"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message *</Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your inquiry or issue"
                  rows={6}
                />
              </div>

              <Button onClick={handleSubmit} disabled={submitInquiry.isPending} className="w-full">
                {submitInquiry.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Inquiry'
                )}
              </Button>

              {!isAuthenticated && (
                <p className="text-sm text-muted-foreground text-center">
                  Please sign in to submit an inquiry
                </p>
              )}
            </CardContent>
          </Card>

          {isAuthenticated && myInquiries && myInquiries.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>My Inquiries</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {myInquiries.map((inquiry) => (
                  <div key={inquiry.inquiryId} className="rounded-lg border p-4">
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-sm text-muted-foreground">{formatDateTime(inquiry.timestamp)}</p>
                      <Badge variant={inquiry.status === Variant_new_closed_reviewed.new_ ? 'default' : inquiry.status === Variant_new_closed_reviewed.reviewed ? 'secondary' : 'outline'}>
                        {inquiry.status === Variant_new_closed_reviewed.new_ ? 'New' : inquiry.status}
                      </Badge>
                    </div>
                    <p className="text-sm">{inquiry.message}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                  <Mail className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">support@travelbreak.com</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
                  <Phone className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="font-medium">Phone</p>
                  <p className="text-sm text-muted-foreground">+1 (555) 123-4567</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <p className="font-medium">Hours</p>
                  <p className="text-sm text-muted-foreground">Mon-Fri: 9AM-6PM</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>FAQ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="font-medium mb-1">How do I modify my booking?</p>
                <p className="text-muted-foreground">Contact our support team with your booking ID.</p>
              </div>
              <div>
                <p className="font-medium mb-1">What's your cancellation policy?</p>
                <p className="text-muted-foreground">Free cancellation up to 24 hours before service.</p>
              </div>
              <div>
                <p className="font-medium mb-1">How do I track my order?</p>
                <p className="text-muted-foreground">Check your account dashboard for order status.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
