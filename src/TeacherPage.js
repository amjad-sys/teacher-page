// src/TeacherPage.js
import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, getDocs } from 'firebase/firestore';

function TeacherPage() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);

  // جلب الأسئلة من Firestore
  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'questionLibrary'));
      const questionsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setQuestions(questionsData);
      console.log('الأسئلة:', questionsData);
    } catch (error) {
      console.error('خطأ في جلب الأسئلة:', error.message, error.code);
      alert('حدث خطأ أثناء جلب الأسئلة: ' + error.message);
    }
    setLoading(false);
  };

  // جلب الأسئلة عند تحميل الصفحة
  useEffect(() => {
    fetchQuestions();
  }, []);

  return (
    <div>
      <h1>صفحة المعلم - الأسئلة</h1>
      <button onClick={fetchQuestions} disabled={loading}>
        {loading ? 'جاري التحميل...' : 'تحديث الأسئلة'}
      </button>
      {questions.length === 0 ? (
        <p>لا توجد أسئلة حاليًا...</p>
      ) : (
        <ul>
          {questions.map(question => (
            <li key={question.id}>
              <h3>{question.question}</h3>
              <p>
                النوع:{' '}
                {question.type === 'trueFalse'
                  ? 'صح/خطأ'
                  : question.type === 'multipleChoice'
                  ? 'اختيار متعدد'
                  : 'إجابة مفتوحة'}
              </p>
              {question.options?.length > 0 && (
                <div>
                  <p>الخيارات:</p>
                  <ul>
                    {question.options.map((option, index) => (
                      <li key={index}>
                        {index}: {option}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <p>الإجابة الصحيحة: {question.correctAnswer}</p>
              <p>مستخدم: {question.used ? 'نعم' : 'لا'}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default TeacherPage;