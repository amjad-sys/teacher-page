// src/ProductsPage.js
import React from 'react';

function ProductsPage({ user, searchTerm }) {
  // فلترة المحتوى بناءً على البحث
  const content = `
    اختبار الرياضيات هو نظام تعليمي تفاعلي مصمم لتحسين مهارات الطلاب في الرياضيات.
    يحتوي على أسئلة متنوعة (صح/خطأ، اختيار متعدد، إجابة مفتوحة) تغطي مواضيع مختلفة.
    يمكن للمعلمين إدارة الأسئلة بسهولة ومتابعة أداء الطلاب.
  `;
  const filteredContent = searchTerm
    ? content.split('\n').filter(line => line.toLowerCase().includes(searchTerm.toLowerCase())).join('\n')
    : content;

  return (
    <div className="products-page">
      <h1>معلومات عن الاختبار</h1>
      <p style={{ whiteSpace: 'pre-line' }}>{filteredContent || 'لا توجد نتائج مطابقة'}</p>
    </div>
  );
}

export default ProductsPage;