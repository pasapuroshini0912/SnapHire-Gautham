import { Facebook, Instagram, Github } from "lucide-react";
import React from "react";

const Footer = () => {
  return (
    <footer>
      <div className="container mx-auto">
        <div className="grid grid-cols-1 p-10 sm:grid-cols-2 lg:grid-cols-3 gap-8 bg-zinc-900 rounded-lg border border-zinc-800">
          {/* Demo Section */}
          <div className="space-y-4">
            <a href="/">
              <h1 className="text-lg font-medium text-zinc-100 pb-2">
                <strong className="text-zinc-100 font-extrabold mr-0.5">
                  Job
                </strong>
                Portal
              </h1>
            </a>
            <div className="space-y-2">
              <h2 className="text-base font-semibold text-zinc-200">Demo Credentials</h2>
              <div className="text-zinc-400 text-sm space-y-1">
                <p><span className="font-medium text-zinc-300">Student:</span> student@test.com / 123456</p>
                <p><span className="font-medium text-zinc-300">Company:</span> company@test.com / 123456</p>
                <p><span className="font-medium text-zinc-300">Admin:</span> admin@test.com / 123456</p>
              </div>
            </div>
            <p className="text-zinc-500 text-sm">
              Created by Gautham
            </p>
          </div>

          {/* Contact Info Section */}
          <div className="space-y-4">
            <h2 className="text-base font-semibold text-zinc-200">Contact Info</h2>
            <div className="text-zinc-400 text-sm space-y-2">
              <p className="hover:text-zinc-200 transition-colors">Email: gautham8325@gmail.com</p>
              <a
                href="https://www.linkedin.com/in/gautham-k8325"
                target="_blank"
                rel="noopener noreferrer"
                className="block hover:text-zinc-200 transition-colors"
              >
                LinkedIn: gautham-k8325
              </a>
              <a
                href="https://github.com/gautham8325"
                target="_blank"
                rel="noopener noreferrer"
                className="block hover:text-zinc-200 transition-colors"
              >
                GitHub: gautham8325
              </a>
            </div>
            <div className="flex gap-4 pt-2">
              <a
                href="https://www.instagram.com/gautham8325"
                target="_blank"
                rel="noopener noreferrer"
                className="transform transition-transform hover:scale-110"
              >
                <Instagram className="bg-zinc-800 p-2 w-10 h-10 rounded-full text-zinc-300 hover:bg-zinc-700 hover:text-zinc-100 transition-colors" />
              </a>
              <a
                href="https://github.com/gautham8325"
                target="_blank"
                rel="noopener noreferrer"
                className="transform transition-transform hover:scale-110"
              >
                <Github className="bg-zinc-800 p-2 w-10 h-10 rounded-full text-zinc-300 hover:bg-zinc-700 hover:text-zinc-100 transition-colors" />
              </a>
            </div>
          </div>

          {/* Quick Links Section */}
          <div className="space-y-4">
            <h2 className="text-base font-semibold text-zinc-200">Quick Links</h2>
            <div className="grid grid-cols-2 gap-2 text-zinc-400 text-sm">
              <a href="#" className="hover:text-zinc-200 transition-colors">About Us</a>
              <a href="#" className="hover:text-zinc-200 transition-colors">Features</a>
              <a href="#" className="hover:text-zinc-200 transition-colors">FAQ</a>
              <a href="#" className="hover:text-zinc-200 transition-colors">Support</a>
              <a href="#" className="hover:text-zinc-200 transition-colors">Careers</a>
              <a href="#" className="hover:text-zinc-200 transition-colors">Contact</a>
            </div>
          </div>
        </div>
        <div className="h-6"></div>
      </div>
    </footer>
  );
};

export default Footer;
