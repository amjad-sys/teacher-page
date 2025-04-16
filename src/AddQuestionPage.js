import React, { useState } from 'react';
import { db } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

function AddQuestionPage() {
  const [questionText, setQuestionText] = useState('');
  const [type, setType] = useState('trueFalse');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [used, setUsed] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let dataToAdd = {
        question: questionText, // استخدام "question" بدل "questionText" لتطابق النموذج
        type,
        used,
        timestamp: serverTimestamp(),
      };

      if (type === 'trueFalse') {
        dataToAdd.options = ['صح', 'خطأ']; // خيارات ثابتة لصح وخطأ
        dataToAdd.correctAnswer = correctAnswer === 'true' ? 'صح' : 'خطأ'; // تطابق القيمة
      } else if (type === 'multipleChoice') {
        dataToAdd.options = options.filter(opt => opt.trim() !== ''); // فلترة الخيارات الفارغة
        dataToAdd.correctAnswer = parseInt(correctAnswer); // تحويل لعدد
      } else if (type === 'openEnded') {
        dataToAdd.correctAnswer = correctAnswer; // نص مباشر
        dataToAdd.options = []; // خيارات فارغة
      }

      await addDoc(collection(db, 'questionLibrary'), dataToAdd);
      console.log('تمت إضافة السؤال بنجاح، المعرف:', dataToAdd);
      alert('تمت إضافة السؤال بنجاح!');
      setQuestionText('');
      setType('trueFalse');
      setOptions(['', '', '', '']);
      setCorrectAnswer('');
      setUsed(false);
    } catch (error) {
      console.error('خطأ في إضافة السؤال:', error);
      alert('فشل في إضافة السؤال: ' + error.message);
    }
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  return (
    <div className="add-question-page">
      <h1>إضافة سؤال جديد</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          placeholder="نص السؤال"
          required
        />
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="trueFalse">صح/خطأ</option>
          <option value="multipleChoice">اختيار متعدد</option>
          <option value="openEnded">إجابة مفتوحة</option>
        </select>
        {type === 'trueFalse' && (
          <select value={correctAnswer} onChange={(e) => setCorrectAnswer(e.target.value)} required>
            <option value="">اختر الإجابة الصحيحة</option>
            <option value="true">صح</option>
            <option value="false">خطأ</option>
          </select>
        )}
        {type === 'multipleChoice' && (
          <>
            {options.map((option, index) => (
              <input
                key={index}
                type="text"
                value={option}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                placeholder={`الخيار ${index + 1}`}
                required
              />
            ))}
            <input
              type="number"
              value={correctAnswer}
              onChange={(e) => setCorrectAnswer(e.target.value)}
              placeholder="رقم الإجابة الصحيحة (0-3)"
              min="0"
              max="3"
              required
            />
          </>
        )}
        {type === 'openEnded' && (
          <input
            type="text"
            value={correctAnswer}
            onChange={(e) => setCorrectAnswer(e.target.value)}
            placeholder="الإجابة الصحيحة"
            required
          />
        )}
        <label>
          <input type="checkbox" checked={used} onChange={(e) => setUsed(e.target.checked)} />
          مستخدم
        </label>
        <button type="submit">إضافة السؤال</button>
      </form>
    </div>
  );
}

export default AddQuestionPage;