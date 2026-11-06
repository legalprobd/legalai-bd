import React from "react";
import Link from "next/link";
import { Scale, ShieldCheck } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-white  border-t border-slate-200  mt-auto py-8 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-slate-200 ">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-xs">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-base text-indigo-950  flex items-center gap-1.5">
                LegalAI BD <span className="text-[10px] bg-indigo-100  text-indigo-700  px-2 py-0.5 rounded-full font-bold">v2.0</span>
              </span>
              <p className="text-xs text-slate-500 ">
                বাংলাদেশের অ্যাডভোকেট ও আইনি পেশাজীবীদের জন্য এআই ড্রাফটিং প্ল্যাটফর্ম
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-slate-600 ">
            <Link href="/pricing" className="hover:text-indigo-600  transition-colors">
              সাবস্ক্রিপশন ও মূল্যতালিকা (Pricing)
            </Link>
            <Link href="/terms" className="hover:text-indigo-600  transition-colors">
              ব্যবহারের শর্তাবলি (Terms of Service)
            </Link>
            <Link href="/privacy" className="hover:text-indigo-600  transition-colors">
              গোপনীয়তা নীতি (Privacy Policy)
            </Link>
            <Link href="/dashboard" className="hover:text-indigo-600  transition-colors">
              ড্যাশবোর্ড (Dashboard)
            </Link>
          </div>
        </div>

        {/* Legal Disclaimer & Copyright */}
        <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-slate-500 ">
          <div className="flex items-start gap-2 max-w-2xl text-left">
            <ShieldCheck className="w-4 h-4 text-emerald-600  shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>আইনি দাবিত্যাগ:</strong> LegalAI BD কোনো ল ফার্ম নয় এবং এটি সরাসরি আইনি পরামর্শ প্রদান করে না। এটি বিজ্ঞ আইনজীবীদের ড্রাফটিং ও গবেষণার সহায়তাকারী এআই টুল। আদালতে যেকোনো নথিপত্র দাখিলের পূর্বে বিজ্ঞ আইনজীবীর নিজস্ব যাচাই ও স্বাক্ষর অপরিহার্য।
            </p>
          </div>
          <p className="shrink-0 text-center md:text-right">
            © 2026 LegalAI BD. সর্বস্বত্ব সংরক্ষিত।
          </p>
        </div>
      </div>
    </footer>
  );
}
