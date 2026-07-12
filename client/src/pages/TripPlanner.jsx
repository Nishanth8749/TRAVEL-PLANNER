import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { itineraryAPI, destinationAPI } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import {
  FaPlus, FaTrash, FaSave, FaMapMarkerAlt, FaCalendarAlt,
  FaDollarSign, FaBed, FaCar, FaHiking, FaCheckCircle, FaSpinner
} from 'react-icons/fa';

const TripPlanner = () => {
  const [searchParams] = useSearchParams();
  const preselectedId = searchParams.get('destination');
  const [destinations, setDestinations] = useState([]);
  const [itineraries, setItineraries] = useState([]);
  const [showForm, setShowForm] = useState(!!preselectedId);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    destinations: preselectedId ? [parseInt(preselectedId)] : [],
    start_date: '',
    end_date: '',
    budget: '',
    transportation: '',
    hotels: '',
    activities: [],
    notes: ''
  });

  const [activityInput, setActivityInput] = useState('');

  useEffect(() => {
    fetchDestinations();
    fetchItineraries();
  }, []);

  const fetchDestinations = async () => {
    try {
      const response = await destinationAPI.getAll();
      setDestinations(response.data);
    } catch (error) {
      console.error('Failed to fetch destinations:', error);
    }
  };

  const fetchItineraries = async () => {
    try {
      const response = await itineraryAPI.getAll();
      setItineraries(response.data);
    } catch (error) {
      console.error('Failed to fetch itineraries:', error);
    }
  };

  const toggleDestination = (destId) => {
    setFormData(prev => ({
      ...prev,
      destinations: prev.destinations.includes(destId)
        ? prev.destinations.filter(d => d !== destId)
        : [...prev.destinations, destId]
    }));
  };

  const addActivity = () => {
    if (activityInput.trim()) {
      setFormData(prev => ({ ...prev, activities: [...prev.activities, activityInput.trim()] }));
      setActivityInput('');
    }
  };

  const removeActivity = (index) => {
    setFormData(prev => ({ ...prev, activities: prev.activities.filter((_, i) => i !== index) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.destinations.length === 0) {
      alert('Please select at least one destination');
      return;
    }
    try {
      setSaving(true);
      await itineraryAPI.create(formData);
      setSaved(true);
      setShowForm(false);
      fetchItineraries();
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Failed to save itinerary:', error);
    } finally {
      setSaving(false);
    }
  };

  const deleteItinerary = async (id) => {
    if (!window.confirm('Delete this itinerary?')) return;
    try {
      await itineraryAPI.delete(id);
      fetchItineraries();
    } catch (error) {
      console.error('Failed to delete itinerary:', error);
    }
  };

  return (
    <div className="page-container bg-gray-50 dark:bg-dark-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Trip Planner</h1>
          <p className="text-gray-600 dark:text-gray-400">Create and manage your custom travel itineraries</p>
        </motion.div>

        {saved && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-green-600 dark:text-green-400 flex items-center gap-2">
            <FaCheckCircle /> Itinerary saved successfully!
          </motion.div>
        )}

        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn-primary flex items-center gap-2"
          >
            {showForm ? 'Cancel' : <><FaPlus /> Create New Itinerary</>}
          </button>
        </div>

        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-12">
            <form onSubmit={handleSubmit} className="bg-white dark:bg-dark-100 rounded-2xl p-6 shadow-md">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">New Itinerary</h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Trip Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Summer European Adventure"
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select Destinations</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 max-h-64 overflow-y-auto p-2">
                    {destinations.map(dest => (
                      <button
                        key={dest.id}
                        type="button"
                        onClick={() => toggleDestination(dest.id)}
                        className={`p-3 rounded-xl text-left transition-all ${
                          formData.destinations.includes(dest.id)
                            ? 'bg-primary-50 dark:bg-primary-900/20 border-2 border-primary-500'
                            : 'bg-gray-50 dark:bg-dark-200 border-2 border-transparent hover:border-gray-300'
                        }`}
                      >
                        <img src={dest.images?.[0]} alt={dest.name} className="w-full h-20 object-cover rounded-lg mb-2" />
                        <p className="text-xs font-medium text-gray-900 dark:text-white truncate">{dest.name}</p>
                        <p className="text-xs text-gray-500">${dest.price}</p>
                      </button>
                    ))}
                  </div>
                  {formData.destinations.length > 0 && (
                    <p className="text-sm text-primary-600 mt-2">{formData.destinations.length} destination(s) selected</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Start Date</label>
                    <input
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">End Date</label>
                    <input
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                      className="input-field"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Budget ($)</label>
                    <input
                      type="number"
                      value={formData.budget}
                      onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
                      placeholder="5000"
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Transportation</label>
                    <select
                      value={formData.transportation}
                      onChange={(e) => setFormData(prev => ({ ...prev, transportation: e.target.value }))}
                      className="input-field"
                    >
                      <option value="">Select...</option>
                      <option value="flight">Flight</option>
                      <option value="train">Train</option>
                      <option value="car">Car Rental</option>
                      <option value="bus">Bus</option>
                      <option value="cruise">Cruise</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Hotel Preference</label>
                    <select
                      value={formData.hotels}
                      onChange={(e) => setFormData(prev => ({ ...prev, hotels: e.target.value }))}
                      className="input-field"
                    >
                      <option value="">Select...</option>
                      <option value="luxury">Luxury (5-star)</option>
                      <option value="boutique">Boutique</option>
                      <option value="mid">Mid-range (3-4 star)</option>
                      <option value="budget">Budget-friendly</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Activities</label>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={activityInput}
                      onChange={(e) => setActivityInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addActivity())}
                      placeholder="Add an activity..."
                      className="input-field flex-1"
                    />
                    <button type="button" onClick={addActivity} className="btn-secondary px-4">
                      <FaPlus />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.activities.map((activity, i) => (
                      <span key={i} className="px-3 py-1.5 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-lg text-sm flex items-center gap-2">
                        {activity}
                        <button type="button" onClick={() => removeActivity(i)} className="hover:text-red-500"><FaTrash className="text-xs" /></button>
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Any special requests or notes..."
                    className="input-field"
                    rows={3}
                  />
                </div>

                <button type="submit" disabled={saving} className="w-full btn-primary flex items-center justify-center gap-2">
                  {saving ? <><FaSpinner className="animate-spin" /> Saving...</> : <><FaSave /> Save Itinerary</>}
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Saved Itineraries */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">My Itineraries</h2>
          {itineraries.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-dark-100 rounded-2xl">
              <p className="text-gray-500 dark:text-gray-400">No itineraries yet. Create your first trip plan!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {itineraries.map((itinerary, i) => (
                <motion.div
                  key={itinerary.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white dark:bg-dark-100 rounded-2xl p-6 shadow-md"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white text-lg">{itinerary.title}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(itinerary.start_date).toLocaleDateString()} - {new Date(itinerary.end_date).toLocaleDateString()}
                      </p>
                    </div>
                    <button onClick={() => deleteItinerary(itinerary.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                      <FaTrash />
                    </button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {itinerary.destinations?.slice(0, 3).map((destId, idx) => {
                      const dest = destinations.find(d => d.id === destId);
                      return dest ? (
                        <span key={idx} className="px-3 py-1 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-lg text-xs">
                          {dest.name}
                        </span>
                      ) : null;
                    })}
                    {itinerary.destinations?.length > 3 && (
                      <span className="px-3 py-1 bg-gray-100 dark:bg-dark-200 text-gray-600 dark:text-gray-300 rounded-lg text-xs">
                        +{itinerary.destinations.length - 3} more
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-300 mb-4">
                    {itinerary.budget > 0 && <span className="flex items-center gap-1"><FaDollarSign className="text-green-500" /> ${itinerary.budget}</span>}
                    {itinerary.transportation && <span className="flex items-center gap-1"><FaCar className="text-blue-500" /> {itinerary.transportation}</span>}
                    {itinerary.hotels && <span className="flex items-center gap-1"><FaBed className="text-purple-500" /> {itinerary.hotels}</span>}
                  </div>

                  {itinerary.activities?.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {itinerary.activities.slice(0, 4).map((activity, idx) => (
                        <span key={idx} className="px-2 py-1 bg-gray-100 dark:bg-dark-200 rounded text-xs text-gray-600 dark:text-gray-300">{activity}</span>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TripPlanner;
