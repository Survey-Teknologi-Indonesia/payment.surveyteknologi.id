"use client";

import Image from "next/image";
import Link from "next/link";
import { Mail, Phone, MapPin, Globe, ArrowUpRight } from "lucide-react";


export default function Footer() {
  return (
    <footer
      id="contact"
      className="border-t border-white/5 bg-[#05080e] pt-20 pb-10 text-gray-400"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-4 md:grid-cols-2">
          {/* Logo & Info */}
          <div className="flex flex-col space-y-5">
            <div className="flex items-center gap-3">
              <div className="overflow-hidden rounded-lg border border-white/10 p-1 bg-white/5">
                <Image
                  src="/assets/image/logo.jpeg"
                  width={35}
                  height={35}
                  alt="Survey Teknologi Indonesia Logo"
                  className="rounded object-cover"
                  unoptimized
                />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold tracking-wider text-white uppercase leading-none">
                  SURVEY TEKNOLOGI
                </span>
                <span className="text-[9px] font-semibold text-amber-500 tracking-widest uppercase leading-none mt-0.5">
                  INDONESIA
                </span>
              </div>
            </div>
             <p className="text-sm text-gray-400 leading-relaxed max-w-xs">
              description
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-6">
              company
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/"
                  className="text-sm hover:text-white transition-colors duration-200"
                >
                  nav.home
                </Link>
              </li>
              <li>
                <Link
                  href="/our-fleet"
                  className="text-sm hover:text-white transition-colors duration-200"
                >
                  nav.ourFleet
                </Link>
              </li>
              <li>
                <a
                  href="#about"
                  className="text-sm hover:text-white transition-colors duration-200"
                >
                  nav.aboutUs
                </a>
              </li>
              <li>
                <a
                  href="#solutions"
                  className="text-sm hover:text-white transition-colors duration-200"
                >
                  nav.solutions
                </a>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-6">
              services
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/solutions/lidar"
                  className="text-sm hover:text-white transition-colors duration-200 flex items-center gap-1 group"
                >
                  LiDAR Survey{" "}
                  <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link
                  href="/solutions/photogrammetry"
                  className="text-sm hover:text-white transition-colors duration-200 flex items-center gap-1 group"
                >
                  Photogrammetry{" "}
                  <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link
                  href="/solutions/bathymetry"
                  className="text-sm hover:text-white transition-colors duration-200 flex items-center gap-1 group"
                >
                  Bathymetry{" "}
                  <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link
                  href="/solutions/spatial-camera"
                  className="text-sm hover:text-white transition-colors duration-200 flex items-center gap-1 group"
                >
                  Spatial Camera & SLAM{" "}
                  <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link
                  href="/solutions/powerline-inspection"
                  className="text-sm hover:text-white transition-colors duration-200 flex items-center gap-1 group"
                >
                  Powerline Inspection{" "}
                  <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="flex flex-col space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-2">
              contactUs
            </h4>
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-amber-500" />
              <span className="text-sm hover:text-white transition-colors duration-200 cursor-pointer">
                info@surveyteknologi.id
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-amber-500" />
              <span className="text-sm hover:text-white transition-colors duration-200 cursor-pointer">
                +62 811 5064 378
              </span>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="h-4 w-4 text-amber-500 mt-1 shrink-0" />
              <span className="text-sm leading-relaxed">
                Makassar, Indonesia
              </span>
            </div>

            {/* Social icons */}
            <div className="flex space-x-4 pt-4">
              <a
              target="_blank"
                href="https://www.linkedin.com/in/survey-teknologi-indonesia-9bba32317/"
                className="rounded-full border border-white/5 bg-white/5 p-2 text-gray-400 hover:text-white hover:border-amber-500/30 transition-all duration-200 flex items-center justify-center"
                aria-label="LinkedIn"
              >
                <svg
                  className="h-4 w-4 fill-current"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
              <a
                href="#"
                className="rounded-full border border-white/5 bg-white/5 p-2 text-gray-400 hover:text-white hover:border-amber-500/30 transition-all duration-200 flex items-center justify-center"
                aria-label="Website"
              >
              </a>
            </div>
          </div>
        </div>

        {/* Footer bottom */}
        <div className="mt-16 border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          <p>
            © {new Date().getFullYear()} Survey Teknologi Indonesia. {"all Rights Reserved"}
          </p>
          <div className="flex space-x-6">
            <a href="#" className="hover:text-white transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
