// src/pages/Contact.jsx
import { FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';

function Contact() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">Get in Touch</h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">
            We'd love to hear from you! Whether you have a question about our services or need assistance, feel free to reach out.
          </p>
        </div>

        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10">
          
          {/* Contact Information Section */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Contact Information</h2>
            <p className="text-gray-600">
              Fill up the form and our team will get back to you within 24 hours.
            </p>
            
            <div className="flex items-center text-gray-700">
              <FaPhone className="w-5 h-5 mr-3 text-blue-600" />
              <span>+91 98765 43210</span>
            </div>
            <div className="flex items-center text-gray-700">
              <FaEnvelope className="w-5 h-5 mr-3 text-blue-600" />
              <span>support@rentaldrives.com</span>
            </div>
            <div className="flex items-center text-gray-700">
              <FaMapMarkerAlt className="w-5 h-5 mr-3 text-blue-600" />
              <span>Panjim, Goa, India</span>
            </div>
          </div>

          {/* Contact Form Section */}
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <form action="#" method="POST" className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                <input type="text" name="name" id="name" required className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                <input type="email" name="email" id="email" required className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message</label>
                <textarea name="message" id="message" rows="4" required className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"></textarea>
              </div>
              <div>
                <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  Send Message
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Contact;