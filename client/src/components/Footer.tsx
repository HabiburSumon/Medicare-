'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">M+</span>
              </div>
              <span className="text-xl font-bold text-white">MediCare<span className="text-primary-400">+</span></span>
            </div>
            <p className="text-sm text-gray-400">Your trusted telemedicine platform for quality healthcare access from anywhere.</p>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/doctors" className="hover:text-primary-400 transition-colors">Find Doctors</Link></li>
              <li><Link href="/medicines" className="hover:text-primary-400 transition-colors">Medicines</Link></li>
              <li><Link href="/symptom-checker" className="hover:text-primary-400 transition-colors">Symptom Checker</Link></li>
              <li><Link href="/chat" className="hover:text-primary-400 transition-colors">Messages</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">Services</h3>
            <ul className="space-y-2 text-sm">
              <li><span className="text-gray-400">Video Consultation</span></li>
              <li><span className="text-gray-400">Chat with Doctor</span></li>
              <li><span className="text-gray-400">Digital Prescriptions</span></li>
              <li><span className="text-gray-400">Medicine Delivery</span></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">Contact</h3>
            <ul className="space-y-2 text-sm">
              <li className="text-gray-400">📧 support@medicare.com</li>
              <li className="text-gray-400">📞 +880 1234-567890</li>
              <li className="text-gray-400">📍 Dhaka, Bangladesh</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-500">
          <p>© 2024 MediCare+. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}