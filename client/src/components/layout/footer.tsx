import { Link } from 'wouter';

export default function Footer() {
  return (
    <footer className="bg-neutral-800 text-neutral-300 py-8 mt-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-1 mb-4">
              <span className="material-icons text-2xl">eco</span>
              <h3 className="text-lg font-poppins font-semibold text-white">FarmerAccess</h3>
            </div>
            <p className="text-sm">Empowering farmers through technology. Connect, learn, and grow together.</p>
            <div className="mt-4 flex space-x-3">
              <a href="#" className="text-neutral-300 hover:text-white">
                <span className="material-icons">facebook</span>
              </a>
              <a href="#" className="text-neutral-300 hover:text-white">
                <span className="material-icons">whatsapp</span>
              </a>
              <a href="#" className="text-neutral-300 hover:text-white">
                <span className="material-icons">telegram</span>
              </a>
              <a href="#" className="text-neutral-300 hover:text-white">
                <span className="material-icons">language</span>
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-white font-poppins font-medium mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/marketplace">
                  <a className="hover:text-white">Marketplace</a>
                </Link>
              </li>
              <li>
                <Link href="/community">
                  <a className="hover:text-white">Community Forum</a>
                </Link>
              </li>
              <li>
                <Link href="/farm-management">
                  <a className="hover:text-white">Farm Management</a>
                </Link>
              </li>
              <li>
                <Link href="/weather">
                  <a className="hover:text-white">Weather Forecast</a>
                </Link>
              </li>
              <li>
                <Link href="/bidding">
                  <a className="hover:text-white">Crop Bidding</a>
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-poppins font-medium mb-4">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white">Government Schemes</a></li>
              <li><a href="#" className="hover:text-white">Farming Tips</a></li>
              <li><a href="#" className="hover:text-white">Crop Calendar</a></li>
              <li><a href="#" className="hover:text-white">Market Prices</a></li>
              <li><a href="#" className="hover:text-white">Expert Consultation</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-poppins font-medium mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white">Help Center</a></li>
              <li><a href="#" className="hover:text-white">Contact Us</a></li>
              <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white">Terms of Service</a></li>
            </ul>
            <div className="mt-4">
              <div className="flex items-center">
                <span className="material-icons text-sm mr-2">phone</span>
                <span>Toll-Free: 1800-XXX-XXXX</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-neutral-700 text-sm text-center">
          <p>&copy; {new Date().getFullYear()} FarmerAccess. All rights reserved.</p>
          <div className="mt-2">
            <span>Available in: </span>
            <a href="#" className="text-white font-medium mr-2">English</a>
            <a href="#" className="hover:text-white mr-2">हिन्दी</a>
            <a href="#" className="hover:text-white mr-2">मराठी</a>
            <a href="#" className="hover:text-white mr-2">ਪੰਜਾਬੀ</a>
            <a href="#" className="hover:text-white">తెలుగు</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
