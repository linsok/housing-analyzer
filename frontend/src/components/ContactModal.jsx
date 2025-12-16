import { useState } from 'react';
import { X, MessageCircle, Phone, Mail, Send } from 'lucide-react';
import Button from './ui/Button';
import { bookingService } from '../services/bookingService';

const ContactModal = ({ property, onClose, user }) => {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [activeTab, setActiveTab] = useState('message');

  const handleSendMessage = async () => {
    if (!message.trim()) {
      alert('Please enter a message');
      return;
    }

    setSending(true);
    try {
      await bookingService.sendMessage({
        property: property.id,
        receiver: property.owner.id,
        content: message
      });
      alert('Message sent successfully!');
      setMessage('');
      onClose();
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleCall = () => {
    if (property.owner.phone) {
      window.open(`tel:${property.owner.phone}`);
    } else {
      alert('Phone number not available');
    }
  };

  const handleEmail = () => {
    if (property.owner.email) {
      window.open(`mailto:${property.owner.email}`);
    } else {
      alert('Email address not available');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">Contact Property Owner</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
              {property.owner.profile_picture ? (
                <img
                  src={property.owner.profile_picture}
                  alt={property.owner.full_name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-sm font-semibold text-gray-600">
                  {property.owner.full_name?.[0] || 'O'}
                </span>
              )}
            </div>
            <div>
              <div className="font-semibold">{property.owner.full_name}</div>
              <div className="text-sm text-gray-600">{property.title}</div>
            </div>
          </div>

          <div className="flex border-b">
            <button
              className={`flex-1 pb-2 px-1 text-sm font-medium border-b-2 transition ${
                activeTab === 'message'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-600'
              }`}
              onClick={() => setActiveTab('message')}
            >
              <MessageCircle className="w-4 h-4 mr-1 inline" />
              Message
            </button>
            <button
              className={`flex-1 pb-2 px-1 text-sm font-medium border-b-2 transition ${
                activeTab === 'phone'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-600'
              }`}
              onClick={() => setActiveTab('phone')}
            >
              <Phone className="w-4 h-4 mr-1 inline" />
              Call
            </button>
            <button
              className={`flex-1 pb-2 px-1 text-sm font-medium border-b-2 transition ${
                activeTab === 'email'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-600'
              }`}
              onClick={() => setActiveTab('email')}
            >
              <Mail className="w-4 h-4 mr-1 inline" />
              Email
            </button>
          </div>
        </div>

        {activeTab === 'message' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your Message
              </label>
              <textarea
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none"
                placeholder="Hi, I'm interested in your property. Could you please provide more information?"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleSendMessage}
                disabled={sending}
                className="flex-1"
              >
                <Send className="w-4 h-4 mr-2" />
                {sending ? 'Sending...' : 'Send Message'}
              </Button>
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {activeTab === 'phone' && (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Phone Number</div>
                  <div className="text-lg text-primary-600">
                    {property.owner.phone || 'Not available'}
                  </div>
                </div>
                <Button onClick={handleCall} disabled={!property.owner.phone}>
                  <Phone className="w-4 h-4 mr-2" />
                  Call Now
                </Button>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              Best time to call: {property.owner.response_time || 'Usually responds quickly'}
            </div>
          </div>
        )}

        {activeTab === 'email' && (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Email Address</div>
                  <div className="text-lg text-primary-600">
                    {property.owner.email || 'Not available'}
                  </div>
                </div>
                <Button onClick={handleEmail} disabled={!property.owner.email}>
                  <Mail className="w-4 h-4 mr-2" />
                  Send Email
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="text-xs text-gray-500 text-center mt-4">
          Contact information is verified and available 24/7
        </div>
      </div>
    </div>
  );
};

export default ContactModal;
