import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UserGroupIcon, 
  DocumentTextIcon, 
  CalendarIcon,
  PlusCircleIcon,
  ChartBarIcon 
} from '@heroicons/react/24/outline';
import Sidebar from '../../components/common/Sidebar';
import StatCard from '../../components/common/StatCard';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalLearners: 0,
    totalReports: 0,
    avgAttendance: 0,
  });
  const [recentLearners, setRecentLearners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [learnersRes, reportsRes, attendanceRes] = await Promise.all([
        api.get('/learners'),
        api.get('/reports'),
        api.get('/attendance/stats/summary'),
      ]);

      setStats({
        totalLearners: learnersRes.data.length,
        totalReports: reportsRes.data.length,
        avgAttendance: attendanceRes.data.summary?.overallAttendanceRate || 0,
      });

      setRecentLearners(learnersRes.data.slice(-5).reverse());
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-paper flex">
        <Sidebar />
        <main className="flex-1 p-8 flex items-center justify-center">
          <div className="spinner w-12 h-12"></div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper flex">
      <Sidebar />
      
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="page-header">
          <h1 className="page-title">Dashboard Overview</h1>
          <p className="page-subtitle">Welcome back, here's what's happening today</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            icon={<UserGroupIcon className="w-8 h-8" />}
            value={stats.totalLearners}
            label="Total Learners"
            color="teal"
          />
          <StatCard
            icon={<DocumentTextIcon className="w-8 h-8" />}
            value={stats.totalReports}
            label="Reports Generated"
            color="gold"
          />
          <StatCard
            icon={<ChartBarIcon className="w-8 h-8" />}
            value={`${stats.avgAttendance}%`}
            label="Avg Attendance"
            color="green"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Learners */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Recent Learners</h2>
            </div>
            <div className="card-body">
              {recentLearners.length > 0 ? (
                <div className="space-y-4">
                  {recentLearners.map((learner) => (
                    <div key={learner.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-ink">{learner.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="reg-chip">
                            {learner.reg_number}
                          </span>
                          <span className="text-xs text-muted">{learner.grade}</span>
                        </div>
                      </div>
                      <span className={`badge ${
                        learner.status === 'Active' ? 'badge-green' : 'badge-red'
                      }`}>
                        {learner.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-state-icon">👥</div>
                  <div className="empty-state-text">No learners yet</div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Quick Actions</h2>
            </div>
            <div className="card-body space-y-3">
              <button
                onClick={() => navigate('/teacher/learners')}
                className="w-full flex items-center gap-3 p-4 bg-paper rounded-lg hover:bg-ink/5 transition-colors"
              >
                <PlusCircleIcon className="w-5 h-5 text-teal" />
                <span className="font-medium text-ink">Add New Learner</span>
              </button>
              <button
                onClick={() => navigate('/teacher/reports')}
                className="w-full flex items-center gap-3 p-4 bg-paper rounded-lg hover:bg-ink/5 transition-colors"
              >
                <DocumentTextIcon className="w-5 h-5 text-gold" />
                <span className="font-medium text-ink">Generate Report Card</span>
              </button>
              <button
                onClick={() => navigate('/teacher/attendance')}
                className="w-full flex items-center gap-3 p-4 bg-paper rounded-lg hover:bg-ink/5 transition-colors"
              >
                <CalendarIcon className="w-5 h-5 text-green" />
                <span className="font-medium text-ink">Record Attendance</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}