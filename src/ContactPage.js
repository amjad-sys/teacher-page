// src/ContactPage.js
import React from 'react';

function ContactPage({ user, searchTerm }) {
  const content = `
    تواصلوا معنا للاستفسارات:
    البريد الإلكتروني: support@mathquiz.com
    الهاتف: 123-456-7890
    العنوان: شارع التعليم، مدينة المعرفة
  `;
  const filteredContent = searchTerm
    ? content.split('\n').filter(line => line.toLowerCase().includes(searchTerm.toLowerCase())).join('\n')
    : content;

  return (
    <div className="contact-page">
      <h1>تواصلوا معنا</h1>
      <p style={{ whiteSpace: 'pre-line' }}>{filteredContent || 'لا توجد نتائج مطابقة'}</p>
    </div>
  );
}

export default ContactPage;