import { analyzeCaseStatement } from "../src/lib/ai/router";

interface TestCase {
  label: string;
  statement: string;
}

const testCases: TestCase[] = [
  {
    label: "মানবিক উদ্ধার ও জরুরি চিকিৎসা (Humanitarian Rescue)",
    statement: "ময়মনসিংহের ব্রীজের মোড়ে একজন বৃদ্ধ মানুষ অজ্ঞান অবস্থায় পড়ে আছে দুই দিন যাবত। কেউ কোন পদক্ষেপ নিচ্ছে না। আমি আইনী পদক্ষেপ নিতে চাই।"
  },
  {
    label: "মারাত্মক জখম ও ছিনতাই (Violent Assault & Robbery)",
    statement: "গতকাল রাতে রহিম ও করিম ধারালো ছুরি দিয়ে আমার পেটে আঘাত করে ৫০ হাজার টাকা ছিনিয়ে নিয়ে যায়।"
  },
  {
    label: "জমি জবরদখল ও দেওয়ানি প্রতিকার (Civil Land Dispute)",
    statement: "কুদ্দুস তালুকদার আমার পৈতৃক জমি জোরপূর্বক দখল করে অবৈধ সীমানা প্রাচীর নির্মাণ করছে।"
  },
  {
    label: "চেক ডিজঅনার মোকদ্দমা (NI Act 138)",
    statement: "জহিরুল ইসলাম ১০ লক্ষ টাকার একটি চেক প্রদান করেছিল, ব্যাংক পর্যাপ্ত তহবিল না থাকায় চেকটি ডিজঅনার করেছে। আমি লিগ্যাল নোটিশ পাঠিয়েছি।"
  },
  {
    label: "পাবলিক নুইসেন্স / গণউপদ্রব (Public Nuisance)",
    statement: "প্রতিদিন আমার বাসার বারান্দার সামনে প্রকাশ্যে সিগারেট খায় শামীম। আমি বারবার তাকে মানা করার পরও সে এটা করেই যাচ্ছে।"
  }
];

async function runTests() {
  console.log("================================================================================");
  console.log("             LEGAL AI ENGINE - DEMO INCIDENT VERIFICATION REPORT               ");
  console.log("================================================================================\n");

  for (let i = 0; i < testCases.length; i++) {
    const tc = testCases[i];
    console.log(`[টেস্ট #${i + 1}] ক্যাটাগরি: ${tc.label}`);
    console.log(`ঘটনার বিবরণ: "${tc.statement}"`);
    console.log("--------------------------------------------------------------------------------");

    try {
      const res = await analyzeCaseStatement(tc.statement);
      console.log(`✓ শিরোনাম (Title): ${res.caseTitleBn}`);
      console.log(`✓ ক্যাটাগরি (Category): ${res.caseCategory}`);
      console.log(`✓ পূর্ণাঙ্গতা স্কোর (Score): ${res.completenessScore}%`);
      
      console.log("\nপ্রযোজ্য আইন ও ধারা সমূহ (Applicable Laws):");
      if (res.applicableLaws.length === 0) {
        console.log("  (কোনো ধারা প্রযোজ্য হিসেবে পাওয়া যায়নি)");
      } else {
        res.applicableLaws.forEach((l, idx) => {
          console.log(`  ${idx + 1}. ${l.actNameBn} — ${l.section}`);
          console.log(`     বিষয়বস্তু: ${l.titleBn}`);
        });
      }

      console.log("\nআইনি অনুসন্ধান ও জেরা প্রশ্নাবলি (Follow-up Questions):");
      if (res.followUpQuestions.length === 0) {
        console.log("  (কোনো ফলো-আপ প্রশ্নের প্রয়োজন নেই)");
      } else {
        res.followUpQuestions.forEach((q, idx) => {
          console.log(`  ${idx + 1}. ${q.questionBn}`);
        });
      }

    } catch (err) {
      console.error(`❌ ত্রুটি ঘটেছে:`, err);
    }

    console.log("\n================================================================================\n");
  }
}

runTests();
