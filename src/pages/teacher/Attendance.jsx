import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/common/Sidebar';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { formatDate } from '../../utils/helpers';

export default function TeacherAttendance() {
  const [learners, setLearners] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    learnerId: '',
    date: new Date().toISOString().split('T')[0],
    status: 'present'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [learnersRes, attendanceRes] = await Promise.all([
        api.get('/learners'),
        api.get('/attendance')
      ]);
      setLearners(learnersRes.data);
      setAttendance(attendanceRes.data);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleRecordAttendance = async () => {
    if (!formData.learnerId) {
      toast.error('Please select a learner');
      return;
    }

    try {
      const response = await api.post('/attendance', formData);
      setAttendance([response.data, ...attendance]);
      toast.success('Attendance recorded');
      
      // Reset form but keep date
      setFormData({
        ...formData,
        learnerId: '',
        status: 'present'
      });
    } catch (error) {
      toast.error('Failed to record attendance');
    }
  };

  const getStatusBadgeClass = (status) => {
    switch(status) {
      case 'present': return 'badge-green';
      case 'absent': return 'badge-red';
      case 'late': return 'badge-gold';
      default: return 'badge';
    }
  };

  const getLearnerName = (learnerId) => {
    const learner = learners.find(l => l.id === learnerId);
    return learner?.name || 'Unknown';
  };

  return (
    <div className="min-h-screen bg-paper flex">
      <Sidebar />
      
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="page-header">
          <h1 className="page-title">Attendance</h1>
          <p className="page-subtitle">Record and manage daily attendance</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Record Attendance */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Record Attendance</h2>
            </div>
            <div className="card-body">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="form-input"
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Learner</label>
                  <select
                    value={formData.learnerId}
                    onChange={(e) => setFormData({...formData, learnerId: e.target.value})}
                    className="form-select"
                  >
                    <option value="">Select learner</option>
                    {learners.map(learner => (
                      <option key={learner.id} value={learner.id}>
                        {learner.name} ({learner.reg_number})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Status</label>
                <div className="flex gap-4 mt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="present"
                      checked={formData.status === 'present'}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                      className="w-4 h-4 text-green"
                    />
                    <span className="badge badge-green">Present</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="absent"
                      checked={formData.status === 'absent'}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                      className="w-4 h-4 text-red"
                    />
                    <span className="badge badge-red">Absent</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="late"
                      checked={formData.status === 'late'}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                      className="w-4 h-4 text-gold"
                    />
                    <span className="badge badge-gold">Late</span>
                  </label>
                </div>
              </div>

              <button
                onClick={handleRecordAttendance}
                className="btn btn-teal w-full mt-4"
              >
                ✔ Record Attendance
              </button>
            </div>
          </div>

          {/* Attendance Log */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Attendance Log</h2>
            </div>
            <div className="card-body p-0 max-h-[500px] overflow-y-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Learner</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.length > 0 ? (
                    attendance.map((record) => (
                      <tr key={record.id}>
                        <td className="font-medium">{getLearnerName(record.learner_id)}</td>
                        <td>{formatDate(record.date)}</td>
                        <td>
                          <span className={`badge ${getStatusBadgeClass(record.status)}`}>
                            {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="text-center py-12 text-muted">
                        No attendance records yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}