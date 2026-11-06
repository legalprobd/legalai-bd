import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding PostgreSQL database for LegalAI BD v2.0...");

  // 1. Create Demo Chamber & User
  const demoChamber = await prisma.chamber.upsert({
    where: { id: "chamber-rahman-associates" },
    update: {
      ownerId: "demo-user-advocate-001",
    },
    create: {
      id: "chamber-rahman-associates",
      name: "রহমান অ্যান্ড অ্যাসোসিয়েটস",
      ownerId: "demo-user-advocate-001",
    },
  });

  const demoUser = await prisma.user.upsert({
    where: { email: "advocate@demo.bd" },
    update: {
      isAdmin: true,
      role: "ADVOCATE",
      plan: "PRO",
      chamberId: demoChamber.id,
      courtStation: "ঢাকা জজ কোর্ট",
    },
    create: {
      id: "demo-user-advocate-001",
      fullName: "অ্যাডভোকেট মো. আব্দুর রহমান",
      email: "advocate@demo.bd",
      password: "legal123",
      phone: "01712345678",
      barCouncilId: "BC-DHAKA-2018-9842",
      barAssociation: "ঢাকা আইনজীবী সমিতি",
      courtStation: "ঢাকা জজ কোর্ট",
      chamberName: "রহমান অ্যান্ড অ্যাসোসিয়েটস",
      isAdmin: true,
      role: "ADVOCATE",
      chamberId: demoChamber.id,
      plan: "PRO",
      creditsUsed: 5,
    },
  });

  console.log(`Demo user created/updated: ${demoUser.email} (Admin: ${demoUser.isAdmin})`);

  // 2. Real Bangladesh Law Sections (Penal Code 1860, CrPC 1898, CPC 1908, NI Act 1881, SR Act 1877)
  const lawSections = [
    {
      actNameEn: "The Penal Code, 1860",
      actNameBn: "দণ্ডবিধি, ১৮৬০",
      sectionNumber: "143",
      titleBn: "বেআইনি সমাবেশের শাস্তি",
      contentBn: "যে কেহ কোনো বেআইনি সমাবেশের সদস্য হইলে, সে যে কোনো বর্ণনার কারাদণ্ডে—যাহার মেয়াদ ছয় মাস পর্যন্ত হইতে পারে, অথবা অর্থদণ্ডে বা উভয়বিধ দণ্ডে দণ্ডিত হইবে।",
      isBailable: true,
      punishmentBn: "৬ মাস পর্যন্ত কারাদণ্ড, বা অর্থদণ্ড, বা উভয় দণ্ড।",
      offenceIngredients: ["পাঁচ বা ততোধিক ব্যক্তির সমাবেশ", "সাধারণ উদ্দেশ্য বাস্তবায়ন"],
    },
    {
      actNameEn: "The Penal Code, 1860",
      actNameBn: "দণ্ডবিধি, ১৮৬০",
      sectionNumber: "147",
      titleBn: "দাঙ্গা-হাঙ্গামা করিবার শাস্তি",
      contentBn: "যে কেহ দাঙ্গা-হাঙ্গামা অনুষ্ঠানের অপরাধে দোষী সাব্যস্ত হইবে, সে যে কোনো বর্ণনার কারাদণ্ডে—যাহার মেয়াদ দুই বৎসর পর্যন্ত হইতে পারে, অথবা অর্থদণ্ডে বা উভয়বিধ দণ্ডে দণ্ডিত হইবে।",
      isBailable: true,
      punishmentBn: "২ বৎসর পর্যন্ত কারাদণ্ড, বা অর্থদণ্ড, বা উভয় দণ্ড।",
      offenceIngredients: ["বেআইনি সমাবেশ", "বলপ্রয়োগ বা হিংস্রতা প্রদর্শন"],
    },
    {
      actNameEn: "The Penal Code, 1860",
      actNameBn: "দণ্ডবিধি, ১৮৬০",
      sectionNumber: "148",
      titleBn: "মারাত্মক অস্ত্রশস্ত্রে সজ্জিত হইয়া দাঙ্গা করিবার শাস্তি",
      contentBn: "যে কেহ মারাত্মক অস্ত্র বা আক্রমণকারী অস্ত্র হিসেবে ব্যবহৃত হইতে পারে এমন জিনিসে সজ্জিত হইয়া দাঙ্গা অনুষ্ঠানের অপরাধে দোষী সাব্যস্ত হইবে, সে তিন বৎসর পর্যন্ত কারাদণ্ডে বা অর্থদণ্ডে বা উভয়বিধ দণ্ডে দণ্ডিত হইবে।",
      isBailable: true,
      punishmentBn: "৩ বৎসর পর্যন্ত কারাদণ্ড, বা অর্থদণ্ড, বা উভয় দণ্ড।",
      offenceIngredients: ["দাঙ্গা সংঘটন", "মারাত্মক অস্ত্র বা ডেডলি ওয়েপন বহন"],
    },
    {
      actNameEn: "The Penal Code, 1860",
      actNameBn: "দণ্ডবিধি, ১৮৬০",
      sectionNumber: "307",
      titleBn: "খুনের চেষ্টা বা হত্যার প্রচেষ্টা",
      contentBn: "যে কেহ এমন কোনো অভিপ্রায়ে বা জ্ঞানে কোনো কার্য অনুষ্ঠান করে এবং এমন পরিস্থিতিতে করে যে, তাহার কারণে সে যদি কাহারো মৃত্যু ঘটাইত, তবে সে খুনের অপরাধে দোষী হইত, তবে সে দশ বৎসর পর্যন্ত যে কোনো বর্ণনার কারাদণ্ডে দণ্ডিত হইবে এবং অর্থদণ্ডেও দণ্ডনীয় হইবে। আঘাতের ফলে মৃত্যু ঘটিলে যাবজ্জীবন কারাদণ্ড হইতে পারে।",
      isBailable: false,
      punishmentBn: "১০ বছর পর্যন্ত সশ্রম কারাদণ্ড এবং অর্থদণ্ড; আঘাত ঘটিলে যাবজ্জীবন কারাদণ্ড।",
      offenceIngredients: ["হত্যার সুনির্দিষ্ট অভিপ্রায়", "মৃত্যু ঘটানোর মতো মারাত্মক আঘাতের চেষ্টা"],
    },
    {
      actNameEn: "The Penal Code, 1860",
      actNameBn: "দণ্ডবিধি, ১৮৬০",
      sectionNumber: "323",
      titleBn: "স্বেচ্ছাকৃতভাবে আঘাত দানের শাস্তি",
      contentBn: "যে কেহ স্বেচ্ছাকৃতভাবে আঘাত দান করে, সে এক বৎসর পর্যন্ত যে কোনো বর্ণনার কারাদণ্ডে, অথবা এক হাজার টাকা পর্যন্ত অর্থদণ্ডে, বা উভয়বিধ দণ্ডে দণ্ডিত হইবে।",
      isBailable: true,
      punishmentBn: "১ বছর পর্যন্ত কারাদণ্ড, বা ১,০০০ টাকা অর্থদণ্ড, বা উভয় দণ্ড।",
      offenceIngredients: ["স্বেচ্ছাকৃত আঘাত", "শারীরিক ব্যথা বা দুর্বলতা"],
    },
    {
      actNameEn: "The Penal Code, 1860",
      actNameBn: "দণ্ডবিধি, ১৮৬০",
      sectionNumber: "324",
      titleBn: "বিপজ্জনক অস্ত্র বা মাধ্যমে স্বেচ্ছাকৃতভাবে আঘাত দান",
      contentBn: "যে কেহ কোনো মারাত্মক বা ধারালো অস্ত্র, আগুন বা উত্তপ্ত বস্তু বা বিষ প্রয়োগে আঘাত দান করে, সে তিন বৎসর পর্যন্ত যে কোনো বর্ণনার কারাদণ্ডে, অথবা অর্থদণ্ডে, বা উভয়বিধ দণ্ডে দণ্ডিত হইবে।",
      isBailable: true,
      punishmentBn: "৩ বছর পর্যন্ত কারাদণ্ড, বা অর্থদণ্ড, বা উভয় দণ্ড।",
      offenceIngredients: ["ধারালো বা বিপজ্জনক অস্ত্র", "স্বেচ্ছায় জখম সৃষ্টি"],
    },
    {
      actNameEn: "The Penal Code, 1860",
      actNameBn: "দণ্ডবিধি, ১৮৬০",
      sectionNumber: "325",
      titleBn: "স্বেচ্ছাকৃতভাবে মারাত্মক আঘাত দানের শাস্তি",
      contentBn: "যে কেহ স্বেচ্ছাকৃতভাবে গুরুতর জখম বা মারাত্মক আঘাত দান করে, সে সাত বৎসর পর্যন্ত যে কোনো বর্ণনার কারাদণ্ডে দণ্ডিত হইবে এবং অর্থদণ্ডেও দণ্ডনীয় হইবে।",
      isBailable: true,
      punishmentBn: "৭ বছর পর্যন্ত কারাদণ্ড এবং অর্থদণ্ড।",
      offenceIngredients: ["হাড় ভাঙা, দাঁত ভাঙা বা স্থায়ী বিকলাঙ্গতা", "স্বেচ্ছাকৃত গুরুতর জখম"],
    },
    {
      actNameEn: "The Penal Code, 1860",
      actNameBn: "দণ্ডবিধি, ১৮৬০",
      sectionNumber: "326",
      titleBn: "বিপজ্জনক অস্ত্র বা মাধ্যমে স্বেচ্ছাকৃতভাবে মারাত্মক আঘাত দান",
      contentBn: "যে কেহ মারাত্মক অস্ত্র বা আগুনে কোনো ব্যক্তিকে স্থায়ী অঙ্গহানি বা মারাত্মক আঘাত দান করে, সে যাবজ্জীবন কারাদণ্ডে অথবা দশ বৎসর পর্যন্ত যে কোনো বর্ণনার কারাদণ্ডে দণ্ডিত হইবে এবং অর্থদণ্ডেও দণ্ডনীয় হইবে।",
      isBailable: false,
      punishmentBn: "যাবজ্জীবন কারাদণ্ড অথবা ১০ বছর পর্যন্ত কারাদণ্ড এবং অর্থদণ্ড।",
      offenceIngredients: ["বিপজ্জনক অস্ত্র ব্যবহার", "মারাত্মক আঘাত বা অঙ্গহানি"],
    },
    {
      actNameEn: "The Penal Code, 1860",
      actNameBn: "দণ্ডবিধি, ১৮৬০",
      sectionNumber: "379",
      titleBn: "চুরির শাস্তি",
      contentBn: "যে কেহ চুরি অনুষ্ঠান করিবে, সে যে কোনো বর্ণনার কারাদণ্ডে—যাহার মেয়াদ তিন বৎসর পর্যন্ত হইতে পারে, অথবা অর্থদণ্ডে বা উভয়বিধ দণ্ডে দণ্ডিত হইবে।",
      isBailable: false,
      punishmentBn: "৩ বছর পর্যন্ত কারাদণ্ড, বা অর্থদণ্ড, বা উভয় দণ্ড।",
      offenceIngredients: ["অসৎ উদ্দেশ্যে অস্থাবর সম্পত্তি অপসারণ", "মালিকের সম্মতি ব্যতীত স্থানান্তর"],
    },
    {
      actNameEn: "The Penal Code, 1860",
      actNameBn: "দণ্ডবিধি, ১৮৬০",
      sectionNumber: "380",
      titleBn: "বাসগৃহে চুরির শাস্তি",
      contentBn: "যে কেহ মানুষের বাসস্থান বা সম্পত্তি রক্ষার জন্য ব্যবহৃত কোনো ভবনে চুরি সংঘটিত করে, সে সাত বৎসর পর্যন্ত কারাদণ্ডে দণ্ডিত হইবে এবং অর্থদণ্ডেও দণ্ডনীয় হইবে।",
      isBailable: false,
      punishmentBn: "৭ বছর পর্যন্ত কারাদণ্ড এবং অর্থদণ্ড।",
      offenceIngredients: ["বাসগৃহ বা সম্পত্তি হেফাজতের স্থান", "চুরির অপরাধ সংঘটন"],
    },
    {
      actNameEn: "The Penal Code, 1860",
      actNameBn: "দণ্ডবিধি, ১৮৬০",
      sectionNumber: "392",
      titleBn: "দস্যুতার শাস্তি",
      contentBn: "যে কেহ দস্যুতা সংঘটিত করিবে, সে দশ বৎসর পর্যন্ত সশ্রম কারাদণ্ডে দণ্ডিত হইবে এবং অর্থদণ্ডেও দণ্ডনীয় হইবে। আর যদি হাইওয়ে বা রাজপথে সূর্যাস্ত ও সূর্যোদয়ের মধ্যবর্তী সময়ে ঘটে তবে চৌদ্দ বৎসর পর্যন্ত কারাদণ্ড হইতে পারে।",
      isBailable: false,
      punishmentBn: "১০ বছর পর্যন্ত সশ্রম কারাদণ্ড এবং অর্থদণ্ড (রাজপথে হইলে ১৪ বছর)।",
      offenceIngredients: ["তাৎক্ষণিক মৃত্যুভীতি বা আঘাতের ভয় প্রদর্শন", "জোরপূর্বক সম্পত্তি ছিনিয়ে নেওয়া"],
    },
    {
      actNameEn: "The Penal Code, 1860",
      actNameBn: "দণ্ডবিধি, ১৮৬০",
      sectionNumber: "427",
      titleBn: "পঞ্চাশ টাকা বা ততোধিক মূল্যের অনিষ্টসাধন বা ক্ষতি সাধন",
      contentBn: "যে কেহ অনিষ্টসাধন করিয়া পঞ্চাশ টাকা বা ততোধিক মূল্যের ক্ষতি করে, সে দুই বৎসর পর্যন্ত কারাদণ্ডে অথবা অর্থদণ্ডে বা উভয়বিধ দণ্ডে দণ্ডিত হইবে।",
      isBailable: true,
      punishmentBn: "২ বছর পর্যন্ত কারাদণ্ড, বা অর্থদণ্ড, বা উভয় দণ্ড।",
      offenceIngredients: ["সম্পত্তির অপচয় বা ধ্বংসসাধন", "কমপক্ষে ৫০ টাকার আর্থিক ক্ষতি"],
    },
    {
      actNameEn: "The Penal Code, 1860",
      actNameBn: "দণ্ডবিধি, ১৮৬০",
      sectionNumber: "448",
      titleBn: "অনধিকার গৃহপ্রবেশের শাস্তি",
      contentBn: "যে কেহ অনধিকার গৃহপ্রবেশ অপরাধে দোষী সাব্যস্ত হইবে, সে এক বৎসর পর্যন্ত কারাদণ্ডে অথবা এক হাজার টাকা পর্যন্ত অর্থদণ্ডে বা উভয়বিধ দণ্ডে দণ্ডিত হইবে।",
      isBailable: true,
      punishmentBn: "১ বছর পর্যন্ত কারাদণ্ড, বা ১,০০০ টাকা অর্থদণ্ড, বা উভয় দণ্ড।",
      offenceIngredients: ["অন্যের বসতঘর বা সুরক্ষিত স্থানে অনধিকার প্রবেশ", "ভীতি প্রদর্শন বা অপরাধ করার মানসিকতা"],
    },
    {
      actNameEn: "The Penal Code, 1860",
      actNameBn: "দণ্ডবিধি, ১৮৬০",
      sectionNumber: "452",
      titleBn: "আঘাত বা আক্রমণ করার প্রস্তুতিসহ অনধিকার প্রবেশ",
      contentBn: "যে কেহ কোনো ব্যক্তির উপর আক্রমণ, আঘাত বা অন্যায় অবরোধের প্রস্তুতি সহকারে গৃহে অনধিকার প্রবেশ করে, সে সাত বৎসর পর্যন্ত কারাদণ্ডে দণ্ডিত হইবে এবং অর্থদণ্ডেও দণ্ডনীয় হইবে।",
      isBailable: false,
      punishmentBn: "৭ বছর পর্যন্ত সশ্রম কারাদণ্ড এবং অর্থদণ্ড।",
      offenceIngredients: ["মারধোর বা অপরাধের পূর্বপ্রস্তুতি", "গৃহে বেআইনি অনুপ্রবেশ"],
    },
    {
      actNameEn: "The Penal Code, 1860",
      actNameBn: "দণ্ডবিধি, ১৮৬০",
      sectionNumber: "506",
      titleBn: "অপরাধমূলক ভীতি প্রদর্শনের শাস্তি",
      contentBn: "যে কেহ অপরাধমূলক ভীতি প্রদর্শনের অপরাধে দোষী হইবে, সে দুই বৎসর পর্যন্ত কারাদণ্ডে বা অর্থদণ্ডে দণ্ডিত হইবে; মৃত্যু বা গুরুতর আঘাতের ভয় দেখাইলে সাত বৎসর পর্যন্ত কারাদণ্ড হইতে পারে।",
      isBailable: true,
      punishmentBn: "সাধারণ ক্ষেত্রে ২ বছর; মৃত্যুর হুমকি দিলে ৭ বছর পর্যন্ত কারাদণ্ড বা অর্থদণ্ড।",
      offenceIngredients: ["প্রাণনাশের বা অঙ্গহানির হুমকি", "ভীতি সঞ্চার করে ক্ষতিসাধন"],
    },
    {
      actNameEn: "The Code of Criminal Procedure, 1898",
      actNameBn: "ফৌজদারি কার্যবিধি, ১৮৯৮",
      sectionNumber: "154",
      titleBn: "আমলযোগ্য মামলার তথ্য বা এজাহার (FIR)",
      contentBn: "আমলযোগ্য অপরাধ সংঘটন সংক্রান্ত প্রতিটি তথ্য ভারপ্রাপ্ত পুলিশ কর্মকর্তার নিকট প্রদান করিলে তাহা লিখিত আকারে লিপিবদ্ধ করিবেন এবং তথ্যদাতার স্বাক্ষর গ্রহণ করিবেন।",
      isBailable: true,
      punishmentBn: "প্রযোজ্য নহে (পদ্ধতিগত বিধান)।",
      offenceIngredients: ["আমলযোগ্য অপরাধের প্রাথমিক বিবরণ", "থানায় ভারপ্রাপ্ত কর্মকর্তা কর্তৃক লিপিবদ্ধকরণ"],
    },
    {
      actNameEn: "The Code of Criminal Procedure, 1898",
      actNameBn: "ফৌজদারি কার্যবিধি, ১৮৯৮",
      sectionNumber: "200",
      titleBn: "নালিশকারী বা বাদীর জবানবন্দী গ্রহণ",
      contentBn: "কোনো নালিশির বিষয়ে ম্যাজিস্ট্রেট অবিলম্বে বাদীর শপথপূর্বক জবানবন্দী গ্রহণ করিবেন এবং সেই জবানবন্দীর সারাংশ লিপিবদ্ধ করিয়া নালিশকারীর স্বাক্ষর গ্রহণ করিবেন।",
      isBailable: true,
      punishmentBn: "প্রযোজ্য নহে (সি.আর. নালিশি মোকদ্দমা পদ্ধতি)।",
      offenceIngredients: ["আদালতে সি.আর. পিটিশন দাখিল", "বাদীর তাৎক্ষণিক শপথ গ্রহণ ও জবানবন্দী"],
    },
    {
      actNameEn: "The Code of Criminal Procedure, 1898",
      actNameBn: "ফৌজদারি কার্যবিধি, ১৮৯৮",
      sectionNumber: "497",
      titleBn: "অজামিনযোগ্য অপরাধে জামিন মঞ্জুরের ক্ষমতা",
      contentBn: "কোনো ব্যক্তি অজামিনযোগ্য অপরাধে অভিযুক্ত হইলে আদালত কর্তৃক জামিন মঞ্জুর হইতে পারে, যদি তিনি ১৬ বছরের কম বয়স্ক, স্ত্রীলোক অথবা পীড়িত বা অক্ষম ব্যক্তি হন।",
      isBailable: true,
      punishmentBn: "জামিনের পদ্ধতিগত ক্ষমতা।",
      offenceIngredients: ["অজামিনযোগ্য অপরাধে জামিনের আবেদন", "বিশেষ মানবিক কারণ বা যুক্তিসঙ্গত সন্দেহ"],
    },
    {
      actNameEn: "The Code of Criminal Procedure, 1898",
      actNameBn: "ফৌজদারি কার্যবিধি, ১৮৯৮",
      sectionNumber: "498",
      titleBn: "হাইকোর্ট বা দায়রা আদালত কর্তৃক জামিনের বিশেষ ক্ষমতা (অগ্নিম জামিন)",
      contentBn: "হাইকোর্ট বিভাগ বা দায়রা আদালত যে কোনো মামলায় যে কোনো ব্যক্তির জামিন মঞ্জুর করিতে বা জামিনের পরিমাণ হ্রাস করিতে পারেন।",
      isBailable: true,
      punishmentBn: "উচ্চ আদালতের বিশেষ জামিন এখতিয়ার।",
      offenceIngredients: ["গ্রেফতারের যুক্তিসঙ্গত আশঙ্কা", "মিথ্যা বা হয়রানিমূলক মামলা"],
    },
    {
      actNameEn: "The Code of Civil Procedure, 1908",
      actNameBn: "দেওয়ানি কার্যবিধি, ১৯০৮",
      sectionNumber: "Order 39 Rules 1-2",
      titleBn: "অস্থায়ী নিষেধাজ্ঞা ও স্থগিতাদেশের বিধান",
      contentBn: "নালিশি সম্পত্তির চরিত্র পরিবর্তন রোধ, বিক্রয় বা হস্তান্তর বন্ধ এবং অপর পক্ষের অপূরণীয় ক্ষতি রোধে দেওয়ানি আদালত কর্তৃক অস্থায়ী নিষেধাজ্ঞা জারি।",
      isBailable: true,
      punishmentBn: "আদেশ অমান্য করিলে সম্পত্তি ক্রোক বা দেওয়ানি জেল।",
      offenceIngredients: ["প্রাথমিক প্রতীয়মান মামলা (Prima facie case)", "অপূরণীয় ক্ষতি (Irreparable loss)", "সুবিধার ভারসাম্য (Balance of convenience)"],
    },
    {
      actNameEn: "The Specific Relief Act, 1877",
      actNameBn: "সুনির্দিষ্ট প্রতিকার আইন, ১৮৭৭",
      sectionNumber: "9",
      titleBn: "আইনবহির্ভূতভাবে বেদখলকৃত স্থাবর সম্পত্তির দখল পুনরুদ্ধার",
      contentBn: "যদি কোনো ব্যক্তি তাহার সম্মতি ব্যতীত আইনসঙ্গত পন্থা ছাড়া স্থাবর সম্পত্তির দখলচ্যুত হয়, তবে সে স্বত্ব প্রমাণ ছাড়াই ৬ মাসের মধ্যে কেবল দখল পুনরুদ্ধারের মোকদ্দমা দায়ের করিতে পারে।",
      isBailable: true,
      punishmentBn: "দখল পুনরুদ্ধার ডিক্রি।",
      offenceIngredients: ["বেদখলের পূর্বে শান্তিপূর্ণ ভোগদখল", "বেদখল হওয়ার তারিখ হইতে ৬ মাসের মধ্যে মামলা"],
    },
    {
      actNameEn: "The Specific Relief Act, 1877",
      actNameBn: "সুনির্দিষ্ট প্রতিকার আইন, ১৮৭৭",
      sectionNumber: "42",
      titleBn: "আইনগত মর্যাদা বা স্বত্ব ঘোষণার মোকদ্দমা (Title Declaration)",
      contentBn: "যে কোনো ব্যক্তি যাহার কোনো আইনগত চরিত্র বা সম্পত্তিতে কোনো অধিকার আছে, সে তাহার অধিকার ঘোষণার জন্য দেওয়ানি আদালতে মামলা করিতে পারিবে।",
      isBailable: true,
      punishmentBn: "স্বত্ব ঘোষণা ডিক্রি।",
      offenceIngredients: ["সম্পত্তিতে নিরঙ্কুশ মালিকানা বা স্বত্ব", "বিবাদী কর্তৃক উক্ত স্বত্ব অস্বীকার"],
    },
    {
      actNameEn: "The Specific Relief Act, 1877",
      actNameBn: "সুনির্দিষ্ট প্রতিকার আইন, ১৮৭৭",
      sectionNumber: "54",
      titleBn: "চিরস্থায়ী নিষেধাজ্ঞা (Permanent Injunction)",
      contentBn: "আদালত বাদীর স্বত্ব ও দখলে বিবাদীর স্থায়ী হস্তক্ষেপ বা অনধিকার প্রবেশ বন্ধে চিরস্থায়ী নিষেধাজ্ঞার ডিক্রি প্রদান করিতে পারেন।",
      isBailable: true,
      punishmentBn: "স্থায়ীভাবে অবৈধ প্রবেশ বা হস্তক্ষেপে নিষেধাজ্ঞা।",
      offenceIngredients: ["বাদীর বৈধ স্বত্ব ও দখল", "বিবাদীর পক্ষ হইতে স্থায়ী দখলের হুমকি"],
    },
    {
      actNameEn: "The Negotiable Instruments Act, 1881",
      actNameBn: "দ্য নেগোশিয়েবল ইনস্ট্রুমেন্টস অ্যাক্ট, ১৮৮১",
      sectionNumber: "138",
      titleBn: "তহবিল অপর্যাপ্ততার কারণে চেক ডিজঅনারের শাস্তি",
      contentBn: "কোনো ব্যক্তি ব্যাংক অ্যাকাউন্টে তহবিল অপর্যাপ্ত থাকার কারণে চেক ডিজঅনার হইলে, লিগ্যাল নোটিশ প্রদানের ৩০ দিন পার হইলে পরবর্তী ৩০ দিনের মধ্যে আদালতে মামলা দায়ের করিলে অপরাধী ১ বৎসর পর্যন্ত কারাদণ্ডে বা চেকের পরিমাণের তিনগুণ পর্যন্ত অর্থদণ্ডে বা উভয় দণ্ডে দণ্ডিত হইবে।",
      isBailable: true,
      punishmentBn: "১ বছর পর্যন্ত কারাদণ্ড অথবা চেকের টাকার তিনগুণ পর্যন্ত জরিমানা, বা উভয় দণ্ড।",
      offenceIngredients: ["বৈধ দেনা পরিশোধে চেক প্রদান", "ব্যাংক মেমোসহ ডিজঅনার", "৩০ দিনের মধ্যে রেজিস্ট্রি ডাকযোগে লিগ্যাল নোটিশ প্রেরণ"],
    },
  ];

  for (const s of lawSections) {
    await prisma.lawSection.upsert({
      where: {
        actNameEn_sectionNumber: {
          actNameEn: s.actNameEn,
          sectionNumber: s.sectionNumber,
        },
      },
      update: {
        actNameBn: s.actNameBn,
        titleBn: s.titleBn,
        contentBn: s.contentBn,
        isBailable: s.isBailable,
        punishmentBn: s.punishmentBn,
        offenceIngredients: s.offenceIngredients,
      },
      create: {
        actNameEn: s.actNameEn,
        actNameBn: s.actNameBn,
        sectionNumber: s.sectionNumber,
        titleBn: s.titleBn,
        contentBn: s.contentBn,
        isBailable: s.isBailable,
        punishmentBn: s.punishmentBn,
        offenceIngredients: s.offenceIngredients,
      },
    });
  }

  console.log(`Successfully seeded ${lawSections.length} real Bangladesh Law Sections in PostgreSQL.`);

  // 3. Real Supreme Court Precedents (DLR / BLC)
  const { FAMOUS_BANGLADESH_PRECEDENTS } = await import("../src/lib/precedents/seedPrecedents.ts");
  for (const p of FAMOUS_BANGLADESH_PRECEDENTS) {
    await prisma.casePrecedent.upsert({
      where: { citation: p.citation },
      update: {
        court: p.court,
        year: p.year,
        titleBn: p.titleBn,
        summaryBn: p.summaryBn,
        keywords: p.keywords,
      },
      create: {
        id: p.id,
        citation: p.citation,
        court: p.court,
        year: p.year,
        titleBn: p.titleBn,
        summaryBn: p.summaryBn,
        keywords: p.keywords,
      },
    });
  }

  console.log(`Successfully seeded ${FAMOUS_BANGLADESH_PRECEDENTS.length} Supreme Court Precedents in PostgreSQL.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
