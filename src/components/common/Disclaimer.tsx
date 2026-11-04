import React from "react";
import { AlertTriangle, ShieldCheck } from "lucide-react";

export function MandatoryDisclaimer({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <div className="flex items-center gap-2 p-2 bg-amber-50/80 border border-amber-200 text-amber-900 text-xs rounded">
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
        <span>
          <strong>আইনি সতর্কীকরণ:</strong> এই খসড়াটি AI-সহায়ক। বিজ্ঞ আইনজীবীর পুনঃপরীক্ষা ও স্বাক্ষর ছাড়া কোনো আদালতে গ্রহণযোগ্য নয়।
        </span>
      </div>
    );
  }

  return (
    <div className="p-4 bg-amber-50 border border-amber-300 rounded-lg text-amber-900 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-amber-100 rounded-full text-amber-700 shrink-0">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-bold text-sm text-amber-900 mb-1 flex items-center gap-2">
            আইনি সতর্কীকরণ ও বাধ্যবাধকতা (Mandatory Legal Disclaimer)
            <span className="text-[10px] bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full font-medium">বিধিমালা ২০২৩</span>
          </h4>
          <p className="text-xs leading-relaxed text-amber-800 text-justify">
            এই অ্যাপটি AI-সহায়ক খসড়া প্রস্তুতকারী টুল। প্রতিটি দলিল বিজ্ঞ অ্যাডভোকেট কর্তৃক সরেজমিনে পুনঃপরীক্ষা, সাক্ষ্য-প্রমাণ যাচাই ও স্বাক্ষর ছাড়া কোনো আদালতে বা থানায় দাখিল করা যাবে না। LegalAI BD কোনো প্রত্যক্ষ আইনি পরামর্শ বা ওকালতি প্রতিনিধিত্ব প্রদান করে না।
          </p>
        </div>
      </div>
    </div>
  );
}
