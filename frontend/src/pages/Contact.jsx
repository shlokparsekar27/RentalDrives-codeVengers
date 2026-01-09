// src/pages/Contact.jsx
import { useState } from 'react';
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaPaperPlane } from 'react-icons/fa';
import Button from '../Components/ui/Button';
import Card from '../Components/ui/Card';
import Badge from '../Components/ui/Badge';

function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'General Inquiry',
    message: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const { name, email, subject, message } = formData;
    const recipient = 'support@rentaldrives.com';
    const emailSubject = `[Support Request] ${subject}`;

    // Construct email body with all form details
    const emailBody = `Name: ${name}
Email: ${email}
Subject: ${subject}

Message:
${message}

--------------------------------------------------
Sent via RentalDrives Contact Form`;

    // Create mailto link
    // encodeURIComponent handles special characters safely
    const mailtoLink = `mailto:${recipient}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

    // Open email client
    window.location.href = mailtoLink;
  };

  return (
    <div className="bg-background min-h-screen pt-24 pb-20 font-sans text-foreground">
      <div className="container mx-auto px-4 lg:px-8 max-w-6xl">

        {/* Header */}
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <Badge variant="outline" className="mb-4 bg-background/50 backdrop-blur-sm border-primary/20 text-primary">24/7 Support</Badge>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">We're Here to Help</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">

          {/* Contact Info (Left Column) */}
          <div className="md:col-span-5 space-y-8">
            <Card className="p-8 bg-primary/5 border-primary/10">
              <h3 className="text-xl font-bold mb-6">Contact Information</h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center text-primary shadow-sm shrink-0">
                    <FaPhone />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-1">Phone</p>
                    <p className="font-mono font-bold text-lg">+91 98765 43210</p>
                    <p className="text-xs text-muted-foreground">Mon-Fri 9am-6pm IST</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center text-primary shadow-sm shrink-0">
                    <FaEnvelope />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-1">Email</p>
                    <p className="font-medium">support@rentaldrives.com</p>
                    <p className="text-xs text-muted-foreground">Online Support</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center text-primary shadow-sm shrink-0">
                    <FaMapMarkerAlt />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-1">Headquarters</p>
                    <p className="font-medium">EDC Complex, Patto Plaza</p>
                    <p className="text-sm text-muted-foreground">Panaji, Goa, India 403001</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Contact Form (Right Column) */}
          <div className="md:col-span-7">
            <Card className="p-8 md:p-10 shadow-xl border-border/80">
              <h3 className="text-2xl font-bold mb-6">Send us a Message</h3>
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full p-3 bg-secondary rounded-lg border border-transparent focus:bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-foreground placeholder:text-muted-foreground"
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full p-3 bg-secondary rounded-lg border border-transparent focus:bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-foreground placeholder:text-muted-foreground"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Subject</label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full p-3 bg-secondary rounded-lg border border-transparent focus:bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all cursor-pointer text-foreground"
                  >
                    <option value="General Inquiry">General Inquiry</option>
                    <option value="Booking Issue">Booking Issue</option>
                    <option value="Payment Dispute">Payment Dispute</option>
                    <option value="Fleet Partnership">Fleet Partnership</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Message</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows="5"
                    className="w-full p-3 bg-secondary rounded-lg border border-transparent focus:bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-foreground placeholder:text-muted-foreground"
                    placeholder="How can we help you today?"
                  ></textarea>
                </div>

                <Button type="submit" variant="primary" size="lg" className="w-full md:w-auto px-8 gap-2">
                  <FaPaperPlane /> Send Message
                </Button>
              </form>
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Contact;