// src/EditQuestionsPage.js
import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { deleteDoc } from 'firebase/firestore';
import './EditQuestionsPage.css';
function EditQuestionsPage({ searchTerm }) {
  const [questions, setQuestions] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [editAnswer, setEditAnswer] = useState('');
  const [editOptions, setEditOptions] = useState([]);
  const [editType, setEditType] = useState('');
  const [editUsed, setEditUsed] = useState(false);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'questionLibrary'));
        const questionsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setQuestions(questionsData);
      } catch (error) {
        console.error('خطأ في جلب الأسئلة:', error);
      }
    };
    fetchQuestions();
  }, []);

  // فلترة الأسئلة بناءً على البحث
  const filteredQuestions = searchTerm
    ? questions.filter(q => q.question.toLowerCase().includes(searchTerm.toLowerCase()))
    : questions;

  const startEditing = (question) => {
    setEditingId(question.id);
    setEditText(question.question || '');
    setEditAnswer(question.correctAnswer ?? '');
    setEditOptions(question.options ? [...question.options] : []);
    setEditType(question.type || 'openEnded');
    setEditUsed(question.used || false);
  };

  const saveChanges = async () => {
    try {
      if (!editText.trim()) {
        alert('نص السؤال لا يمكن أن يكون فارغًا!');
        return;
      }
      const questionRef = doc(db, 'questionLibrary', editingId);
      const updatedData = {
        question: editText.trim(),
        correctAnswer: editType === 'multipleChoice' ? parseInt(editAnswer) : editAnswer,
        type: editType === 'openEnded' ? null : editType,
        options: editType === 'openEnded' ? [] : editOptions.filter(opt => opt.trim()),
        used: editUsed,
      };
      await updateDoc(questionRef, updatedData);
      setQuestions(questions.map(q => (q.id === editingId ? { id: editingId, ...updatedData } : q)));
      setEditingId(null);
      alert('تم حفظ التغييرات بنجاح!');
    } catch (error) {
      alert('خطأ أثناء الحفظ: ' + error.message);
    }
  };

  const cancelEditing = () => {
    setEditingId(null);
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'questionLibrary', id));
      setQuestions(questions.filter(q => q.id !== id));
      alert('تم حذف السؤال بنجاح!');
    } catch (error) {
      alert('خطأ في حذف السؤال: ' + error.message);
    }
  };

  return (
    <div className="edit-questions-page">
       
      <h1>تعديل الأسئلة</h1>
      {filteredQuestions.length === 0 ? (
        <p>لا توجد أسئلة مطابقة...</p>
      ) : (
        filteredQuestions.map(question => (
          <div key={question.id} className="question">
            {editingId === question.id ? (
              <div>
                <label>نص السؤال:</label>
                <input value={editText} onChange={(e) => setEditText(e.target.value)} />
                <label>النوع:</label>
                <select value={editType} onChange={(e) => setEditType(e.target.value)}>
                  <option value="trueFalse">صح/خطأ</option>
                  <option value="multipleChoice">اختيار متعدد</option>
                  <option value="openEnded">إجابة مفتوحة</option>
                </select>
                <label>مستخدم؟</label>
                <input
                  type="checkbox"
                  checked={editUsed}
                  onChange={(e) => setEditUsed(e.target.checked)}
                />
                {editType === 'trueFalse' && (
                  <>
                    <label>الإجابة الصحيحة:</label>
                    <select value={editAnswer} onChange={(e) => setEditAnswer(e.target.value)}>
                      <option value="صح">صح</option>
                      <option value="خطأ">خطأ</option>
                    </select>
                    {editOptions.map((option, index) => (
                      <input
                        key={index}
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...editOptions];
                          newOptions[index] = e.target.value;
                          setEditOptions(newOptions);
                        }}
                      />
                    ))}
                  </>
                )}
                {editType === 'multipleChoice' && (
                  <>
                    {editOptions.map((option, index) => (
                      <input
                        key={index}
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...editOptions];
                          newOptions[index] = e.target.value;
                          setEditOptions(newOptions);
                        }}
                      />
                    ))}
                    <label>الإجابة الصحيحة (رقم الخيار):</label>
                    <input
                      type="number"
                      value={editAnswer}
                      onChange={(e) => setEditAnswer(e.target.value)}
                    />
                  </>
                )}
                {editType === 'openEnded' && (
                  <>
                    <label>الإجابة الصحيحة:</label>
                    <input value={editAnswer} onChange={(e) => setEditAnswer(e.target.value)} />
                  </>
                )}
                <button onClick={saveChanges}>حفظ</button>
                <button onClick={cancelEditing}>إلغاء</button>
              </div>
            ) : (
              <div>
                <h3>{question.question}</h3>
                <p>النوع: {question.type === 'trueFalse' ? 'صح/خطأ' : question.type === 'multipleChoice' ? 'اختيار متعدد' : 'إجابة مفتوحة'}</p>
                {question.options?.length > 0 && (
                  <ul>
                    {question.options.map((option, index) => (
                      <li key={index}>{index}: {option}</li>
                    ))}
                  </ul>
                )}
                <p>الإجابة الصحيحة: {question.correctAnswer}</p>
                <p>مستخدم: {question.used ? 'نعم' : 'لا'}</p>
                <button onClick={() => startEditing(question)}>تعديل</button>
<button onClick={() => handleDelete(question.id)}>حذف</button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}

export default EditQuestionsPage;