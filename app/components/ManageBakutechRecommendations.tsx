'use client';

import { useState, useEffect } from 'react';

interface Bakugan {
  _id: string;
  names: string[];
  size: string;
  element: string;
  specialProperties: string;
  imageUrl: string;
  currentPrice: number;
  referenceUri: string;
}

interface BakutechRecommendation {
  _id: string;
  bakuganId: Bakugan | string;
  rank: number;
  reason: string;
  createdAt: string;
  updatedAt: string;
}

const ManageBakutechRecommendations = () => {
  const [bakuganItems, setBakuganItems] = useState<Bakugan[]>([]);
  const [recommendations, setRecommendations] = useState<BakutechRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Form states for each rank
  const [rank1BakuganId, setRank1BakuganId] = useState<string>('');
  const [rank1Reason, setRank1Reason] = useState<string>('');
  const [rank2BakuganId, setRank2BakuganId] = useState<string>('');
  const [rank2Reason, setRank2Reason] = useState<string>('');
  const [rank3BakuganId, setRank3BakuganId] = useState<string>('');
  const [rank3Reason, setRank3Reason] = useState<string>('');
  const [rank4BakuganId, setRank4BakuganId] = useState<string>('');
  const [rank4Reason, setRank4Reason] = useState<string>('');
  const [rank5BakuganId, setRank5BakuganId] = useState<string>('');
  const [rank5Reason, setRank5Reason] = useState<string>('');

  // Fetch all Bakugan items and recommendations
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch all B3 Bakugan items (BakuTech)
        const bakuganResponse = await fetch('/api/bakugan?bakutech=true');
        if (!bakuganResponse.ok) {
          throw new Error('Failed to fetch BakuTech items');
        }
        const bakuganData = await bakuganResponse.json();
        setBakuganItems(bakuganData);
        
        // Fetch all BakuTech recommendations
        const recommendationsResponse = await fetch('/api/bakutech-recommendations');
        if (!recommendationsResponse.ok) {
          throw new Error('Failed to fetch BakuTech recommendations');
        }
        const recommendationsData = await recommendationsResponse.json();
        setRecommendations(recommendationsData);
        
        // Set form values based on existing recommendations
        recommendationsData.forEach((rec: BakutechRecommendation) => {
          const bakuganId = typeof rec.bakuganId === 'string' ? rec.bakuganId : rec.bakuganId._id;
          
          if (rec.rank === 1) {
            setRank1BakuganId(bakuganId);
            setRank1Reason(rec.reason || '');
          } else if (rec.rank === 2) {
            setRank2BakuganId(bakuganId);
            setRank2Reason(rec.reason || '');
          } else if (rec.rank === 3) {
            setRank3BakuganId(bakuganId);
            setRank3Reason(rec.reason || '');
          } else if (rec.rank === 4) {
            setRank4BakuganId(bakuganId);
            setRank4Reason(rec.reason || '');
          } else if (rec.rank === 5) {
            setRank5BakuganId(bakuganId);
            setRank5Reason(rec.reason || '');
          }
        });
        
        setError(null);
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError(err.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Handle form submission for a specific rank
  const handleSubmit = async (rank: number) => {
    try {
      setLoading(true);
      setSuccess(null);
      setError(null);
      
      let bakuganId = '';
      let reason = '';
      
      // Get the correct values based on rank
      if (rank === 1) {
        bakuganId = rank1BakuganId;
        reason = rank1Reason;
      } else if (rank === 2) {
        bakuganId = rank2BakuganId;
        reason = rank2Reason;
      } else if (rank === 3) {
        bakuganId = rank3BakuganId;
        reason = rank3Reason;
      } else if (rank === 4) {
        bakuganId = rank4BakuganId;
        reason = rank4Reason;
      } else if (rank === 5) {
        bakuganId = rank5BakuganId;
        reason = rank5Reason;
      }
      
      if (!bakuganId) {
        setError(`Please select a BakuTech for rank ${rank}`);
        setLoading(false);
        return;
      }
      
      // Create or update recommendation
      const response = await fetch('/api/bakutech-recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bakuganId,
          rank,
          reason,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to update rank ${rank} BakuTech recommendation`);
      }
      
      // Refresh recommendations
      const recommendationsResponse = await fetch('/api/bakutech-recommendations');
      const recommendationsData = await recommendationsResponse.json();
      setRecommendations(recommendationsData);
      
      setSuccess(`Rank ${rank} BakuTech recommendation updated successfully`);
    } catch (err: any) {
      console.error(`Error updating rank ${rank} BakuTech recommendation:`, err);
      setError(err.message || `Failed to update rank ${rank} BakuTech recommendation`);
    } finally {
      setLoading(false);
    }
  };

  // Handle recommendation deletion
  const handleDelete = async (id: string, rank: number) => {
    try {
      setLoading(true);
      setSuccess(null);
      setError(null);
      
      // Delete recommendation
      const response = await fetch(`/api/bakutech-recommendations?id=${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to delete rank ${rank} BakuTech recommendation`);
      }
      
      // Refresh recommendations
      const recommendationsResponse = await fetch('/api/bakutech-recommendations');
      const recommendationsData = await recommendationsResponse.json();
      setRecommendations(recommendationsData);
      
      // Clear form values for the deleted rank
      if (rank === 1) {
        setRank1BakuganId('');
        setRank1Reason('');
      } else if (rank === 2) {
        setRank2BakuganId('');
        setRank2Reason('');
      } else if (rank === 3) {
        setRank3BakuganId('');
        setRank3Reason('');
      } else if (rank === 4) {
        setRank4BakuganId('');
        setRank4Reason('');
      } else if (rank === 5) {
        setRank5BakuganId('');
        setRank5Reason('');
      }
      
      setSuccess(`Rank ${rank} BakuTech recommendation deleted successfully`);
    } catch (err: any) {
      console.error(`Error deleting rank ${rank} BakuTech recommendation:`, err);
      setError(err.message || `Failed to delete rank ${rank} BakuTech recommendation`);
    } finally {
      setLoading(false);
    }
  };

  // Get recommendation by rank
  const getRecommendationByRank = (rank: number) => {
    return recommendations.find(rec => rec.rank === rank);
  };

  // Get medal color based on rank
  const getMedalColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'from-yellow-300 to-yellow-500'; // Gold
      case 2:
        return 'from-gray-300 to-gray-500'; // Silver
      case 3:
        return 'from-amber-600 to-amber-800'; // Bronze
      case 4:
        return 'from-purple-400 to-purple-600'; // Purple
      case 5:
        return 'from-teal-400 to-teal-600'; // Teal
      default:
        return 'from-blue-300 to-blue-500';
    }
  };

  // Get medal text based on rank
  const getMedalText = (rank: number) => {
    switch (rank) {
      case 1:
        return 'Top Pick';
      case 2:
        return 'Runner Up';
      case 3:
        return 'Notable Mention';
      case 4:
        return 'Great Choice';
      case 5:
        return 'Solid Option';
      default:
        return 'Recommended';
    }
  };

  if (loading && bakuganItems.length === 0) {
    return (
      <div className="bg-gradient-to-b from-gray-900/50 to-gray-800/30 backdrop-blur-xl rounded-2xl p-6 border border-gray-800/50">
        <h2 className="text-xl font-semibold text-blue-300 mb-6">Manage BakuTech Recommendations</h2>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-gray-900/50 to-gray-800/30 backdrop-blur-xl rounded-2xl p-6 border border-gray-800/50">
      <h2 className="text-xl font-semibold text-blue-300 mb-6">Manage BakuTech Recommendations</h2>
      
      {error && (
        <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-300">
          <p className="font-semibold">{error}</p>
        </div>
      )}
      
      {success && (
        <div className="mb-6 p-4 bg-green-500/20 border border-green-500/50 rounded-xl text-green-300">
          <p className="font-semibold">{success}</p>
        </div>
      )}
      
      <div className="space-y-8">
        {/* Rank 1 Recommendation */}
        <div className="bg-gradient-to-b from-gray-800/50 to-gray-700/30 backdrop-blur-xl rounded-xl p-6 border border-gray-700/50">
          <div className="flex items-center gap-4 mb-4">
            <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getMedalColor(1)} p-1 border border-gray-700/50 flex items-center justify-center shadow-lg`}>
              <div className="w-full h-full rounded-full bg-gray-900/80 flex items-center justify-center text-white font-bold text-xl">
                1
              </div>
            </div>
            <h3 className="text-lg font-semibold text-yellow-300">{getMedalText(1)}</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="rank1BakuganId" className="block text-sm font-medium text-gray-300 mb-1">
                Select BakuTech
              </label>
              <select
                id="rank1BakuganId"
                value={rank1BakuganId}
                onChange={(e) => setRank1BakuganId(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800/70 border border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-white"
              >
                <option value="">-- Select BakuTech --</option>
                {bakuganItems.map((bakugan) => (
                  <option key={bakugan._id} value={bakugan._id}>
                    {bakugan.names[0]} ({bakugan.size}, {bakugan.element})
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="rank1Reason" className="block text-sm font-medium text-gray-300 mb-1">
                Reason for Recommendation
              </label>
              <textarea
                id="rank1Reason"
                value={rank1Reason}
                onChange={(e) => setRank1Reason(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 bg-gray-800/70 border border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-white"
                placeholder="Why is this BakuTech recommended?"
              ></textarea>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => handleSubmit(1)}
                disabled={loading || !rank1BakuganId}
                className="flex-1 px-4 py-2 rounded-xl bg-gradient-to-r from-yellow-600 to-yellow-500 text-white font-semibold hover:from-yellow-500 hover:to-yellow-400 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : 'Save Rank 1'}
              </button>
              
              {getRecommendationByRank(1) && (
                <button
                  onClick={() => handleDelete(getRecommendationByRank(1)?._id || '', 1)}
                  disabled={loading}
                  className="px-4 py-2 rounded-xl bg-red-600/30 text-red-300 border border-red-600/30 hover:bg-red-600/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        </div>
        
        {/* Rank 2 Recommendation */}
        <div className="bg-gradient-to-b from-gray-800/50 to-gray-700/30 backdrop-blur-xl rounded-xl p-6 border border-gray-700/50">
          <div className="flex items-center gap-4 mb-4">
            <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getMedalColor(2)} p-1 border border-gray-700/50 flex items-center justify-center shadow-lg`}>
              <div className="w-full h-full rounded-full bg-gray-900/80 flex items-center justify-center text-white font-bold text-xl">
                2
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-300">{getMedalText(2)}</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="rank2BakuganId" className="block text-sm font-medium text-gray-300 mb-1">
                Select BakuTech
              </label>
              <select
                id="rank2BakuganId"
                value={rank2BakuganId}
                onChange={(e) => setRank2BakuganId(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800/70 border border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-white"
              >
                <option value="">-- Select BakuTech --</option>
                {bakuganItems.map((bakugan) => (
                  <option key={bakugan._id} value={bakugan._id}>
                    {bakugan.names[0]} ({bakugan.size}, {bakugan.element})
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="rank2Reason" className="block text-sm font-medium text-gray-300 mb-1">
                Reason for Recommendation
              </label>
              <textarea
                id="rank2Reason"
                value={rank2Reason}
                onChange={(e) => setRank2Reason(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 bg-gray-800/70 border border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-white"
                placeholder="Why is this BakuTech recommended?"
              ></textarea>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => handleSubmit(2)}
                disabled={loading || !rank2BakuganId}
                className="flex-1 px-4 py-2 rounded-xl bg-gradient-to-r from-gray-500 to-gray-400 text-white font-semibold hover:from-gray-400 hover:to-gray-300 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : 'Save Rank 2'}
              </button>
              
              {getRecommendationByRank(2) && (
                <button
                  onClick={() => handleDelete(getRecommendationByRank(2)?._id || '', 2)}
                  disabled={loading}
                  className="px-4 py-2 rounded-xl bg-red-600/30 text-red-300 border border-red-600/30 hover:bg-red-600/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        </div>
        
        {/* Rank 3 Recommendation */}
        <div className="bg-gradient-to-b from-gray-800/50 to-gray-700/30 backdrop-blur-xl rounded-xl p-6 border border-gray-700/50">
          <div className="flex items-center gap-4 mb-4">
            <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getMedalColor(3)} p-1 border border-gray-700/50 flex items-center justify-center shadow-lg`}>
              <div className="w-full h-full rounded-full bg-gray-900/80 flex items-center justify-center text-white font-bold text-xl">
                3
              </div>
            </div>
            <h3 className="text-lg font-semibold text-amber-600">{getMedalText(3)}</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="rank3BakuganId" className="block text-sm font-medium text-gray-300 mb-1">
                Select BakuTech
              </label>
              <select
                id="rank3BakuganId"
                value={rank3BakuganId}
                onChange={(e) => setRank3BakuganId(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800/70 border border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-white"
              >
                <option value="">-- Select BakuTech --</option>
                {bakuganItems.map((bakugan) => (
                  <option key={bakugan._id} value={bakugan._id}>
                    {bakugan.names[0]} ({bakugan.size}, {bakugan.element})
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="rank3Reason" className="block text-sm font-medium text-gray-300 mb-1">
                Reason for Recommendation
              </label>
              <textarea
                id="rank3Reason"
                value={rank3Reason}
                onChange={(e) => setRank3Reason(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 bg-gray-800/70 border border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-white"
                placeholder="Why is this BakuTech recommended?"
              ></textarea>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => handleSubmit(3)}
                disabled={loading || !rank3BakuganId}
                className="flex-1 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-700 to-amber-600 text-white font-semibold hover:from-amber-600 hover:to-amber-500 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-amber-600 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : 'Save Rank 3'}
              </button>
              
              {getRecommendationByRank(3) && (
                <button
                  onClick={() => handleDelete(getRecommendationByRank(3)?._id || '', 3)}
                  disabled={loading}
                  className="px-4 py-2 rounded-xl bg-red-600/30 text-red-300 border border-red-600/30 hover:bg-red-600/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        </div>
        
        {/* Rank 4 Recommendation */}
        <div className="bg-gradient-to-b from-gray-800/50 to-gray-700/30 backdrop-blur-xl rounded-xl p-6 border border-gray-700/50">
          <div className="flex items-center gap-4 mb-4">
            <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getMedalColor(4)} p-1 border border-gray-700/50 flex items-center justify-center shadow-lg`}>
              <div className="w-full h-full rounded-full bg-gray-900/80 flex items-center justify-center text-white font-bold text-xl">
                4
              </div>
            </div>
            <h3 className="text-lg font-semibold text-purple-400">{getMedalText(4)}</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="rank4BakuganId" className="block text-sm font-medium text-gray-300 mb-1">
                Select BakuTech
              </label>
              <select
                id="rank4BakuganId"
                value={rank4BakuganId}
                onChange={(e) => setRank4BakuganId(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800/70 border border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-white"
              >
                <option value="">-- Select BakuTech --</option>
                {bakuganItems.map((bakugan) => (
                  <option key={bakugan._id} value={bakugan._id}>
                    {bakugan.names[0]} ({bakugan.size}, {bakugan.element})
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="rank4Reason" className="block text-sm font-medium text-gray-300 mb-1">
                Reason for Recommendation
              </label>
              <textarea
                id="rank4Reason"
                value={rank4Reason}
                onChange={(e) => setRank4Reason(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 bg-gray-800/70 border border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-white"
                placeholder="Why is this BakuTech recommended?"
              ></textarea>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => handleSubmit(4)}
                disabled={loading || !rank4BakuganId}
                className="flex-1 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 text-white font-semibold hover:from-purple-500 hover:to-purple-400 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : 'Save Rank 4'}
              </button>
              
              {getRecommendationByRank(4) && (
                <button
                  onClick={() => handleDelete(getRecommendationByRank(4)?._id || '', 4)}
                  disabled={loading}
                  className="px-4 py-2 rounded-xl bg-red-600/30 text-red-300 border border-red-600/30 hover:bg-red-600/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        </div>
        
        {/* Rank 5 Recommendation */}
        <div className="bg-gradient-to-b from-gray-800/50 to-gray-700/30 backdrop-blur-xl rounded-xl p-6 border border-gray-700/50">
          <div className="flex items-center gap-4 mb-4">
            <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getMedalColor(5)} p-1 border border-gray-700/50 flex items-center justify-center shadow-lg`}>
              <div className="w-full h-full rounded-full bg-gray-900/80 flex items-center justify-center text-white font-bold text-xl">
                5
              </div>
            </div>
            <h3 className="text-lg font-semibold text-teal-400">{getMedalText(5)}</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="rank5BakuganId" className="block text-sm font-medium text-gray-300 mb-1">
                Select BakuTech
              </label>
              <select
                id="rank5BakuganId"
                value={rank5BakuganId}
                onChange={(e) => setRank5BakuganId(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800/70 border border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-white"
              >
                <option value="">-- Select BakuTech --</option>
                {bakuganItems.map((bakugan) => (
                  <option key={bakugan._id} value={bakugan._id}>
                    {bakugan.names[0]} ({bakugan.size}, {bakugan.element})
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="rank5Reason" className="block text-sm font-medium text-gray-300 mb-1">
                Reason for Recommendation
              </label>
              <textarea
                id="rank5Reason"
                value={rank5Reason}
                onChange={(e) => setRank5Reason(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 bg-gray-800/70 border border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-white"
                placeholder="Why is this BakuTech recommended?"
              ></textarea>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => handleSubmit(5)}
                disabled={loading || !rank5BakuganId}
                className="flex-1 px-4 py-2 rounded-xl bg-gradient-to-r from-teal-600 to-teal-500 text-white font-semibold hover:from-teal-500 hover:to-teal-400 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : 'Save Rank 5'}
              </button>
              
              {getRecommendationByRank(5) && (
                <button
                  onClick={() => handleDelete(getRecommendationByRank(5)?._id || '', 5)}
                  disabled={loading}
                  className="px-4 py-2 rounded-xl bg-red-600/30 text-red-300 border border-red-600/30 hover:bg-red-600/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageBakutechRecommendations;
