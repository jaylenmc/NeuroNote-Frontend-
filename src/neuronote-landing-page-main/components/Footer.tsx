import React from 'react';
import { Brain, Twitter, Github, Linkedin } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-background border-t border-white/5 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-display font-bold text-white">
                NeuroNote
              </span>
            </div>
            <p className="text-gray-500 mb-6">
              The operating system for your brain. Built for students, researchers, and lifelong learners.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-gray-500 hover:text-white transition-colors"><Twitter className="w-5 h-5" /></a>
              <a href="#" className="text-gray-500 hover:text-white transition-colors"><Github className="w-5 h-5" /></a>
              <a href="#" className="text-gray-500 hover:text-white transition-colors"><Linkedin className="w-5 h-5" /></a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-6">Product</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-gray-500 hover:text-primary-400 transition-colors">Features</a></li>
              <li><a href="#" className="text-gray-500 hover:text-primary-400 transition-colors">Integrations</a></li>
              <li><a href="#" className="text-gray-500 hover:text-primary-400 transition-colors">Pricing</a></li>
              <li><a href="#" className="text-gray-500 hover:text-primary-400 transition-colors">Changelog</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-6">Resources</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-gray-500 hover:text-primary-400 transition-colors">Methodology</a></li>
              <li><a href="#" className="text-gray-500 hover:text-primary-400 transition-colors">Community</a></li>
              <li><a href="#" className="text-gray-500 hover:text-primary-400 transition-colors">Help Center</a></li>
              <li><a href="#" className="text-gray-500 hover:text-primary-400 transition-colors">API Docs</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-6">Company</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-gray-500 hover:text-primary-400 transition-colors">About Us</a></li>
              <li><a href="#" className="text-gray-500 hover:text-primary-400 transition-colors">Careers</a></li>
              <li><a href="#" className="text-gray-500 hover:text-primary-400 transition-colors">Legal</a></li>
              <li><a href="#" className="text-gray-500 hover:text-primary-400 transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-600 text-sm">
            © 2024 NeuroNote Labs Inc. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-gray-600">
            <a href="#" className="hover:text-gray-400">Privacy Policy</a>
            <a href="#" className="hover:text-gray-400">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;