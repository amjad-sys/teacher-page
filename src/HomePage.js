// src/HomePage.js
import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, getDocs, doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

function HomePage({ user, searchTerm }) {
  const [stats, setStats] = useState({
    usedQuestions: 0,
    unusedQuestions: 0,
    studentsCount: 0,
    scores: [],
    lastUpdate: null,
    questionTypes: { trueFalse: 0, multipleChoice: 0, openEnded: 0 },
    passingRate: 0,
  });
  const [timeRemaining, setTimeRemaining] = useState(null);
  const updateInterval = 1200; // 20 دقيقة (1200 ثانية)

  const fetchStats = async () => {
    try {
      const questionsSnapshot = await getDocs(collection(db, 'questionLibrary'));
      const questions = questionsSnapshot.docs.map(doc => doc.data());
      const usedQuestions = questions.filter(q => q.used).length;
      const unusedQuestions = questions.length - usedQuestions;

      const questionTypes = { trueFalse: 0, multipleChoice: 0, openEnded: 0 };
      questions.forEach(q => {
        if (q.type === 'trueFalse') questionTypes.trueFalse++;
        else if (q.type === 'multipleChoice') questionTypes.multipleChoice++;
        else questionTypes.openEnded++;
      });

      const studentsSnapshot = await getDocs(collection(db, 'userResults'));
      const studentsCount = studentsSnapshot.size;
      const scores = studentsSnapshot.docs.map(doc => doc.data().score || 0);

      const passingStudents = scores.filter(score => score > 50).length;
      const passingRate = studentsCount > 0 ? (passingStudents / studentsCount) * 100 : 0;

      const lastUpdateDoc = await getDoc(doc(db, 'updates', 'lastUpdate'));
      const lastUpdate = lastUpdateDoc.exists()
        ? lastUpdateDoc.data().timestamp?.toDate().toLocaleString() || 'غير متوفر'
        : 'غير متوفر';

      setStats({
        usedQuestions,
        unusedQuestions,
        studentsCount,
        scores,
        lastUpdate,
        questionTypes,
        passingRate,
      });

      // حساب الوقت المتبقي للتحديث
      if (lastUpdateDoc.exists()) {
        const lastUpdateTimestamp = lastUpdateDoc.data().timestamp?.toDate();
        if (lastUpdateTimestamp) {
          const now = new Date();
          const secondsSinceLastUpdate = Math.floor((now - lastUpdateTimestamp) / 1000);
          const remaining = Math.max(0, updateInterval - secondsSinceLastUpdate);
          setTimeRemaining(remaining);
        }
      }
    } catch (error) {
      console.error('خطأ في جلب الإحصائيات:', error);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (timeRemaining === null) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 0) {
          fetchStats();
          return updateInterval;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining]);

  const handleRefresh = async () => {
    try {
      await setDoc(doc(db, 'updates', 'lastUpdate'), {
        timestamp: serverTimestamp(),
      });
      setTimeRemaining(updateInterval);
      await fetchStats();
    } catch (error) {
      console.error('خطأ في تحديث الأسئلة:', error);
    }
  };

  const filteredStats = searchTerm
    ? {
        usedQuestions: stats.usedQuestions,
        unusedQuestions: stats.unusedQuestions,
        studentsCount: stats.studentsCount,
        scores: stats.scores.filter(score => score.toString().includes(searchTerm)),
        lastUpdate: stats.lastUpdate,
        questionTypes: stats.questionTypes,
        passingRate: stats.passingRate,
      }
    : stats;

  const questionsChartData = {
    labels: ['الأسئلة المستخدمة', 'الأسئلة غير المستخدمة'],
    datasets: [
      {
        label: 'عدد الأسئلة',
        data: [filteredStats.usedQuestions, filteredStats.unusedQuestions],
        backgroundColor: ['#4285F4', '#A142F4'],
        borderColor: ['#fff', '#fff'],
        borderWidth: 1,
      },
    ],
  };

  const scoreDistribution = {
    '0-20': 0,
    '21-40': 0,
    '41-60': 0,
    '61-80': 0,
    '81-100': 0,
  };

  filteredStats.scores.forEach(score => {
    if (score <= 20) scoreDistribution['0-20']++;
    else if (score <= 40) scoreDistribution['21-40']++;
    else if (score <= 60) scoreDistribution['41-60']++;
    else if (score <= 80) scoreDistribution['61-80']++;
    else scoreDistribution['81-100']++;
  });

  const scoresChartData = {
    labels: Object.keys(scoreDistribution),
    datasets: [
      {
        label: 'عدد الطلاب',
        data: Object.values(scoreDistribution),
        backgroundColor: '#4285F4',
        borderColor: '#fff',
        borderWidth: 1,
      },
    ],
  };

  const questionTypesChartData = {
    labels: ['صح/خطأ', 'اختيار متعدد', 'إجابة مفتوحة'],
    datasets: [
      {
        label: 'عدد الأسئلة',
        data: [
          filteredStats.questionTypes.trueFalse,
          filteredStats.questionTypes.multipleChoice,
          filteredStats.questionTypes.openEnded,
        ],
        backgroundColor: ['#4285F4', '#A142F4', '#8AB4F8'],
        borderColor: ['#fff', '#fff', '#fff'],
        borderWidth: 1,
      },
    ],
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="home-page">
      <h1>إحصائيات اختبار الرياضيات</h1>
      <div className="stats">
        <div className="stat-card">
          <h3>الأسئلة المستخدمة</h3>
          <p>{filteredStats.usedQuestions}</p>
        </div>
        <div className="stat-card">
          <h3>الأسئلة غير المستخدمة</h3>
          <p>{filteredStats.unusedQuestions}</p>
        </div>
        <div className="stat-card">
          <h3>عدد الطلاب المشاركين</h3>
          <p>{filteredStats.studentsCount}</p>
        </div>
        <div className="stat-card">
          <h3>متوسط العلامات</h3>
          <p>
            {filteredStats.scores.length > 0
              ? (filteredStats.scores.reduce((a, b) => a + b, 0) / filteredStats.scores.length).toFixed(2)
              : 'غير متوفر'}
          </p>
        </div>
        <div className="stat-card">
          <h3>نسبة النجاح (أكثر من 50%)</h3>
          <p>{filteredStats.passingRate.toFixed(2)}%</p>
        </div>
        <div className="stat-card">
          <h3>آخر تحديث للأسئلة</h3>
          <p>{filteredStats.lastUpdate}</p>
        </div>
      </div>
      {user && (
        <div className="actions">
          <Link to="/add-question" className="action-btn">إضافة سؤال</Link>
          <Link to="/edit-questions" className="action-btn">تعديل الأسئلة</Link>
          <button onClick={handleRefresh} className="action-btn">تحديث الأسئلة</button>
        </div>
      )}
      {timeRemaining !== null && (
        <div className="timer-container">
          <h3>الوقت المتبقي للتحديث</h3>
          <div className="timer">{formatTime(timeRemaining)}</div>
        </div>
      )}
      <div className="charts">
        <div className="chart-container">
          <h3>توزيع الأسئلة</h3>
          <Pie
            data={questionsChartData}
            options={{
              plugins: {
                legend: { position: 'right', labels: { color: '#fff', font: { family: 'Tajawal' } } },
                tooltip: { bodyFont: { family: 'Tajawal' }, titleFont: { family: 'Tajawal' } },
              },
            }}
          />
        </div>
        <div className="chart-container">
          <h3>توزيع العلامات</h3>
          <Bar
            data={scoresChartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                x: { ticks: { font: { family: 'Tajawal' }, color: '#fff' } },
                y: { ticks: { font: { family: 'Tajawal' }, color: '#fff' } },
              },
              plugins: {
                legend: { position: 'right', labels: { color: '#fff', font: { family: 'Tajawal' } } },
                tooltip: { bodyFont: { family: 'Tajawal' }, titleFont: { family: 'Tajawal' } },
              },
            }}
          />
        </div>
        <div className="chart-container">
          <h3>توزيع الأسئلة حسب النوع</h3>
          <Pie
            data={questionTypesChartData}
            options={{
              plugins: {
                legend: { position: 'right', labels: { color: '#fff', font: { family: 'Tajawal' } } },
                tooltip: { bodyFont: { family: 'Tajawal' }, titleFont: { family: 'Tajawal' } },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default HomePage;