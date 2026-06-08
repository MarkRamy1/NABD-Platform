// Mock reviews data for hospitals
// This file provides sample reviews so they display without needing a backend API

const MOCK_REVIEWS = [
    // Ain Shams Hospital reviews
    {
        hospitalId: 1,
        rating: 4.5,
        comment_en: "Excellent cardiology department. Doctors are very professional and caring. Modern equipment.",
        comment_ar: "قسم القلب ممتاز جداً. الأطباء محترفون وعطوفون جداً. معدات حديثة.",
        user_name_en: "Ahmed M.",
        user_name_ar: "أحمد م.",
        visit_date: "2024-05-15"
    },
    {
        hospitalId: 1,
        rating: 5,
        comment_en: "Best hospital experience I've had. Clean facilities, quick service, friendly staff.",
        comment_ar: "أفضل تجربة مستشفى مررت بها. المرافق نظيفة، الخدمة سريعة، الموظفون ودودون.",
        user_name_en: "Fatima A.",
        user_name_ar: "فاطمة أ.",
        visit_date: "2024-06-02"
    },
    {
        hospitalId: 1,
        rating: 4,
        comment_en: "Good overall experience. Waiting time was reasonable. Staff was helpful.",
        comment_ar: "تجربة جيدة بشكل عام. وقت الانتظار كان معقولاً. الموظفون كانوا مساعدين.",
        user_name_en: "Mohamed K.",
        user_name_ar: "محمد ك.",
        visit_date: "2024-05-28"
    },
    {
        hospitalId: 1,
        rating: 3.5,
        comment_en: "Decent facilities but could improve billing process. Treatment was good.",
        comment_ar: "مرافق جيدة لكن يمكن تحسين عملية الدفع. العلاج كان جيداً.",
        user_name_en: "Layla H.",
        user_name_ar: "ليلى ح.",
        visit_date: "2024-06-08"
    },

    // El Demerdash Hospital reviews
    {
        hospitalId: 2,
        rating: 4,
        comment_en: "Very professional neurology team. Made me feel comfortable during procedures.",
        comment_ar: "فريق أعصاب محترف جداً. جعلوني أشعر براحة أثناء الإجراءات.",
        user_name_en: "Hassan S.",
        user_name_ar: "حسن س.",
        visit_date: "2024-05-20"
    },
    {
        hospitalId: 2,
        rating: 4.5,
        comment_en: "Great pediatric department. Doctor was very patient with my child.",
        comment_ar: "قسم الأطفال رائع. الطبيب كان صبوراً جداً مع طفلي.",
        user_name_en: "Noor M.",
        user_name_ar: "نور م.",
        visit_date: "2024-06-05"
    },
    {
        hospitalId: 2,
        rating: 3.5,
        comment_en: "Good medical care but parking is challenging. Appointment scheduling could be better.",
        comment_ar: "الرعاية الطبية جيدة لكن الوقوف صعب. يمكن تحسين جدولة المواعيد.",
        user_name_en: "Karim A.",
        user_name_ar: "كريم أ.",
        visit_date: "2024-05-25"
    },

    // General Hospital Cairo reviews
    {
        hospitalId: 3,
        rating: 5,
        comment_en: "Outstanding orthopedic surgery. My recovery was faster than expected.",
        comment_ar: "جراحة عظام رائعة جداً. تعافيي كان أسرع من المتوقع.",
        user_name_en: "Omar N.",
        user_name_ar: "عمر ن.",
        visit_date: "2024-05-18"
    },
    {
        hospitalId: 3,
        rating: 4,
        comment_en: "Excellent emergency room. Staff was quick and efficient.",
        comment_ar: "غرفة الطوارئ ممتازة. الموظفون كانوا سريعين وفعالين.",
        user_name_en: "Mona E.",
        user_name_ar: "منى ع.",
        visit_date: "2024-06-01"
    },
    {
        hospitalId: 3,
        rating: 4.5,
        comment_en: "Professional staff, clean environment. Highly recommended.",
        comment_ar: "موظفون محترفون، بيئة نظيفة. يُنصح به بشدة.",
        user_name_en: "Sameh L.",
        user_name_ar: "سامح ل.",
        visit_date: "2024-06-07"
    },

    // Helwan Hospital reviews
    {
        hospitalId: 4,
        rating: 4,
        comment_en: "Good dermatology services. Doctor took time to explain treatment.",
        comment_ar: "خدمات جلدية جيدة. الطبيب أخذ وقته لشرح العلاج.",
        user_name_en: "Dina R.",
        user_name_ar: "دينا ر.",
        visit_date: "2024-05-22"
    },
    {
        hospitalId: 4,
        rating: 3.5,
        comment_en: "Acceptable care but facilities need updating. Staff is friendly.",
        comment_ar: "رعاية مقبولة لكن المرافق تحتاج تحديثاً. الموظفون ودودون.",
        user_name_en: "Tariq H.",
        user_name_ar: "طارق ح.",
        visit_date: "2024-06-04"
    },

    // Qasr El Nile Hospital reviews
    {
        hospitalId: 5,
        rating: 5,
        comment_en: "Outstanding gynecology department. Very supportive during my visit.",
        comment_ar: "قسم النساء متميز جداً. كانوا مساندين جداً خلال زيارتي.",
        user_name_en: "Rania F.",
        user_name_ar: "رانيا ف.",
        visit_date: "2024-05-19"
    },
    {
        hospitalId: 5,
        rating: 4.5,
        comment_en: "Excellent ENT services. Doctor solved my problem in one visit.",
        comment_ar: "خدمات أنف وأذن وحنجرة ممتازة. الطبيب حل مشكلتي في زيارة واحدة.",
        user_name_en: "Youssef M.",
        user_name_ar: "يوسف م.",
        visit_date: "2024-06-03"
    },
];

// Get reviews for a specific hospital
function getMockReviews(hospitalId) {
    return MOCK_REVIEWS.filter(r => r.hospitalId === hospitalId);
}

// Add a new mock review
function addMockReview(hospitalId, rating, commentEn, commentAr, userName) {
    const newReview = {
        hospitalId,
        rating,
        comment_en: commentEn,
        comment_ar: commentAr,
        user_name_en: userName,
        user_name_ar: userName,
        visit_date: new Date().toISOString().split('T')[0]
    };
    MOCK_REVIEWS.push(newReview);
    return newReview;
}
