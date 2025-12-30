// Debug component to test recommendation loading
import React, { useState, useEffect } from 'react';
import { propertyService } from '../services/propertyService';

const DebugRecommendations = () => {
  const [debugData, setDebugData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const debugLoad = async () => {
      try {
        console.log('🔍 Starting debug load...');
        
        // Test each endpoint individually
        const mostBookedResponse = await propertyService.getMostBookedProperties(3);
        console.log('📡 Most Booked Response:', mostBookedResponse);
        
        const highestRatedResponse = await propertyService.getHighestRatedProperties(3);
        console.log('📡 Highest Rated Response:', highestRatedResponse);
        
        const averagePriceResponse = await propertyService.getAveragePriceProperties(3);
        console.log('📡 Average Price Response:', averagePriceResponse);
        
        // Test mapping logic
        const mappedProperties = [
          ...(mostBookedResponse.properties || []).map(p => ({
            ...p,
            recommendation_type: 'most_booked',
            recommendation_label: 'Most Booked - Popular & Trusted',
            recommendation_message: mostBookedResponse.message
          })),
          ...(highestRatedResponse.properties || []).map(p => ({
            ...p,
            recommendation_type: 'highest_rated',
            recommendation_label: 'Highest Rated - Top Rated by Guests',
            recommendation_message: highestRatedResponse.message
          })),
          ...(averagePriceResponse.properties || []).map(p => ({
            ...p,
            recommendation_type: 'average_price',
            recommendation_label: 'Best Value - Average Price',
            recommendation_message: averagePriceResponse.message
          }))
        ];
        
        console.log('🎯 Mapped Properties:', mappedProperties);
        
        setDebugData({
          mostBooked: mostBookedResponse,
          highestRated: highestRatedResponse,
          averagePrice: averagePriceResponse,
          mappedProperties: mappedProperties
        });
        
      } catch (err) {
        console.error('❌ Debug Error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    debugLoad();
  }, []);

  if (loading) {
    return <div>Loading debug data...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div style={{ padding: '20px', background: '#f5f5f5', margin: '20px', borderRadius: '8px' }}>
      <h2>🔍 Debug Recommendation Data</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>📊 Raw API Responses:</h3>
        <pre style={{ background: '#fff', padding: '10px', borderRadius: '4px', fontSize: '12px' }}>
          {JSON.stringify(debugData, null, 2)}
        </pre>
      </div>
      
      <div>
        <h3>🎯 Mapped Properties (what PropertyCard receives):</h3>
        {debugData.mappedProperties?.map((prop, index) => (
          <div key={index} style={{ 
            background: '#fff', 
            padding: '10px', 
            margin: '5px 0', 
            borderRadius: '4px',
            border: prop.recommendation_type ? '2px solid green' : '2px solid red'
          }}>
            <h4>{prop.title}</h4>
            <p>💰 ${prop.rent_price} | ⭐ {prop.rating} | 📍 {prop.city}</p>
            <p>🏷️ recommendation_type: <strong>{prop.recommendation_type || 'NOT SET'}</strong></p>
            <p>📝 recommendation_label: {prop.recommendation_label}</p>
            <p>💬 recommendation_message: {prop.recommendation_message}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DebugRecommendations;
