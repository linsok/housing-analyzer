import { useState } from 'react';
import { HelpCircle, Mail, Phone, MessageCircle, Send, ChevronDown, ChevronUp } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const Support = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const faqs = [
    {
      question: 'How do I search for properties?',
      answer: 'You can search for properties by clicking on the "Rent" link in the navigation bar. Use filters to narrow down your search by location, price range, property type, and more.'
    },
    {
      question: 'How do I list my property?',
      answer: 'To list your property, you need to register as a property owner. Once registered, go to your dashboard and click on "Add Property" to create a new listing.'
    },
    {
      question: 'Are all properties verified?',
      answer: 'Yes! All properties go through a verification process by our admin team before they appear on the platform. This ensures quality and authenticity.'
    },
    {
      question: 'How do I contact a property owner?',
      answer: 'On each property detail page, you\'ll find contact information for the owner. You can also send them a message directly through our platform if you\'re logged in.'
    },
    {
      question: 'Can I save my favorite properties?',
      answer: 'Yes! If you\'re registered as a renter, you can save properties to your favorites list by clicking the heart icon on any property card.'
    },
    {
      question: 'How does the market trend feature work?',
      answer: 'The Market Trend page allows you to compare up to 4 properties side by side. You can filter properties and see real-time statistics about rental prices in different areas.'
    },
    {
      question: 'Is my personal information secure?',
      answer: 'Absolutely! We use industry-standard security measures to protect your data. Your personal information is never shared with third parties without your consent.'
    },
    {
      question: 'How do I change my account information?',
      answer: 'You can update your account information by going to your profile page. Click on your name in the navigation bar and select "Profile".'
    }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send the form data to your backend
    console.log('Support request submitted:', formData);
    setSubmitted(true);
    setFormData({ name: '', email: '', subject: '', message: '' });
    
    // Reset success message after 5 seconds
    setTimeout(() => {
      setSubmitted(false);
    }, 5000);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const toggleFaq = (index) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <HelpCircle className="w-16 h-16 mx-auto mb-4" />
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              How Can We Help You?
            </h1>
            <p className="text-xl text-primary-100">
              Get support, find answers, or contact our team
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Contact Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="text-center p-6 hover:shadow-lg transition">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Email Support</h3>
            <p className="text-gray-600 mb-3">Get help via email</p>
            <a href="mailto:support@myrentor.com" className="text-primary-600 hover:text-primary-700 font-medium">
              support@myrentor.com
            </a>
          </Card>

          <Card className="text-center p-6 hover:shadow-lg transition">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Phone className="w-8 h-8 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Phone Support</h3>
            <p className="text-gray-600 mb-3">Call us directly</p>
            <a href="tel:+85512345678" className="text-primary-600 hover:text-primary-700 font-medium">
              +855 12 345 678
            </a>
          </Card>

          <Card className="text-center p-6 hover:shadow-lg transition">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-8 h-8 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Live Chat</h3>
            <p className="text-gray-600 mb-3">Chat with our team</p>
            <span className="text-primary-600 font-medium">
              Available 9AM - 6PM
            </span>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* FAQ Section */}
          <div>
            <Card className="p-8">
              <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
              
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <div key={index} className="border-b border-gray-200 pb-4">
                    <button
                      className="w-full flex justify-between items-center text-left"
                      onClick={() => toggleFaq(index)}
                    >
                      <span className="font-semibold text-gray-900">{faq.question}</span>
                      {expandedFaq === index ? (
                        <ChevronUp className="w-5 h-5 text-primary-600 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      )}
                    </button>
                    
                    {expandedFaq === index && (
                      <p className="mt-3 text-gray-600 leading-relaxed">
                        {faq.answer}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Contact Form */}
          <div>
            <Card className="p-8">
              <h2 className="text-2xl font-bold mb-6">Send Us a Message</h2>
              
              {submitted && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800 font-medium">
                    Thank you for contacting us! We'll get back to you soon.
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your.email@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    name="subject"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="What is this about?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    name="message"
                    required
                    rows="6"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us more about your inquiry..."
                  />
                </div>

                <Button type="submit" className="w-full" size="lg">
                  <Send className="w-5 h-5 mr-2" />
                  Send Message
                </Button>
              </form>
            </Card>
          </div>
        </div>

        {/* Additional Help Section */}
        <Card className="mt-8 p-8 bg-primary-50 border-primary-200">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">Still Need Help?</h3>
            <p className="text-gray-700 mb-6">
              Our support team is available Monday to Friday, 9:00 AM to 6:00 PM (Cambodia Time)
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="mailto:support@myrentor.com">
                <Button variant="primary">
                  <Mail className="w-5 h-5 mr-2" />
                  Email Us
                </Button>
              </a>
              <a href="tel:+85512345678">
                <Button variant="outline">
                  <Phone className="w-5 h-5 mr-2" />
                  Call Us
                </Button>
              </a>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Support;
