import { analyzeCaseStatement } from "../src/lib/ai/router";

async function testVagueIncident() {
  const statement = "কালকে একটা ঝামেলা হইছে, আমার সাথে খুব অন্যায় হইছে। কেউ সাহায্য করতেছে না, আমি এর উপযুক্ত বিচার ও আইনি ব্যবস্থা চাই।";
  console.log("================================================================================");
  console.log("          TEST: ভেজা / অস্পষ্ট ঘটনা (MESSY / INSUFFICIENT INFO INCIDENT)         ");
  console.log("================================================================================");
  console.log(`ইনপুট বিবরণ: "${statement}"\n`);

  const res = await analyzeCaseStatement(statement);

  console.log(`✓ শিরোনাম (Title): ${res.caseTitleBn}`);
  console.log(`✓ ক্যাটাগরি (Category): ${res.caseCategory}`);
  console.log(`✓ পূর্ণাঙ্গতা স্কোর (Score): ${res.completenessScore}%`);
  console.log(`✓ অস্ত্রের উপস্থিতি (Weapons Detected):`, res.extractedFacts.weaponsUsed);
  console.log(`✓ শারীরিক জখম (Injuries/Medical):`, res.extractedFacts.injuriesAndMedical);
  console.log(`✓ আর্থিক ক্ষয়ক্ষতি (Financial Loss):`, res.extractedFacts.totalFinancialLoss);
  console.log(`✓ অভিযুক্তের তালিকা (Accused List):`, res.extractedFacts.accusedList);

  console.log("\nপ্রযোজ্য আইন ও ধারা সমূহ (Applicable Laws):");
  if (!res.applicableLaws || res.applicableLaws.length === 0) {
    console.log("  [শূন্য হ্যালুসিনেশন] কোনো তথ্য ছাড়া কোনো মনগড়া ধারা অন্তর্ভুক্ত করা হয়নি।");
  } else {
    res.applicableLaws.forEach((l, idx) => {
      console.log(`  ${idx + 1}. ${l.actNameBn} — ${l.section} (${l.titleBn})`);
    });
  }

  console.log("\nতথ্য অনুসন্ধানে ফলো-আপ প্রশ্নাবলি (Clarification Questions):");
  res.followUpQuestions.forEach((q, idx) => {
    console.log(`  ${idx + 1}. ${q.questionBn}`);
  });

  console.log("\nঅ্যাডভোকেটের কৌশলগত পরামর্শ:");
  res.strategicAdviceForAdvocateBn.forEach((adv, idx) => {
    console.log(`  ${idx + 1}. ${adv}`);
  });
  console.log("================================================================================\n");
}

testVagueIncident();
