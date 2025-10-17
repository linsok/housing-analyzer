import { Shield, TrendingUp, Users, Award, Target, Heart } from 'lucide-react';
import Card from '../components/ui/Card';

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              About My Rentor
            </h1>
            <p className="text-xl text-primary-100">
              Your trusted partner in finding the perfect rental property across Cambodia
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
              <p className="text-lg text-gray-700 mb-4">
                At My Rentor, we're dedicated to revolutionizing the rental property market in Cambodia. 
                Our mission is to make finding and renting properties transparent, efficient, and accessible 
                for everyone.
              </p>
              <p className="text-lg text-gray-700">
                We believe that everyone deserves a place to call home, and we're committed to helping 
                renters find their perfect property while providing property owners with the tools they 
                need to manage their listings effectively.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Card className="text-center p-6">
                <Target className="w-12 h-12 text-primary-600 mx-auto mb-3" />
                <h3 className="font-semibold text-lg">Our Goal</h3>
                <p className="text-gray-600 text-sm mt-2">
                  Simplify property search
                </p>
              </Card>
              <Card className="text-center p-6">
                <Heart className="w-12 h-12 text-primary-600 mx-auto mb-3" />
                <h3 className="font-semibold text-lg">Our Values</h3>
                <p className="text-gray-600 text-sm mt-2">
                  Trust & transparency
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">What Makes Us Different</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center p-8">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Verified Properties</h3>
              <p className="text-gray-600">
                Every property listing is thoroughly verified by our admin team to ensure authenticity 
                and quality. You can trust that what you see is what you get.
              </p>
            </Card>

            <Card className="text-center p-8">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Market Analytics</h3>
              <p className="text-gray-600">
                Access real-time market trends and compare rental prices across different areas. 
                Make informed decisions with data-driven insights.
              </p>
            </Card>

            <Card className="text-center p-8">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Community Driven</h3>
              <p className="text-gray-600">
                Read verified reviews from real renters and share your own experiences. 
                Our community helps everyone make better rental decisions.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Our Impact</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-5xl font-bold text-primary-600 mb-2">1000+</div>
              <div className="text-gray-600 text-lg">Properties Listed</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-primary-600 mb-2">500+</div>
              <div className="text-gray-600 text-lg">Verified Owners</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-primary-600 mb-2">2000+</div>
              <div className="text-gray-600 text-lg">Happy Renters</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-primary-600 mb-2">50+</div>
              <div className="text-gray-600 text-lg">Cities Covered</div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-6">Our Commitment</h2>
          <p className="text-center text-lg text-gray-700 max-w-3xl mx-auto mb-12">
            We're committed to providing the best rental property experience in Cambodia. 
            Our team works tirelessly to ensure that every property is verified, every review 
            is authentic, and every user has access to the tools they need to make informed decisions.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-6">
              <Award className="w-10 h-10 text-primary-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Quality Assurance</h3>
              <p className="text-gray-600">
                Every property undergoes a rigorous verification process before being listed on our platform.
              </p>
            </Card>

            <Card className="p-6">
              <Shield className="w-10 h-10 text-primary-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Secure Platform</h3>
              <p className="text-gray-600">
                Your data and privacy are our top priorities. We use industry-standard security measures.
              </p>
            </Card>

            <Card className="p-6">
              <Users className="w-10 h-10 text-primary-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Customer Support</h3>
              <p className="text-gray-600">
                Our dedicated support team is always ready to help you with any questions or concerns.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Join Our Community</h2>
          <p className="text-xl text-primary-100 mb-8">
            Whether you're looking for a property or want to list one, we're here to help you every step of the way.
          </p>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
