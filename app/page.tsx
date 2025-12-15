'use client';

'use client';

import { useEffect, useState } from 'react';

export default function Home() {
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger the entrance animation after component mounts
    setIsVisible(true);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-6">
      <div className="w-full max-w-6xl text-center">
        <div className="mb-12">
          <h1 
            className={`text-6xl md:text-7xl font-bold mb-4 font-['Arial_Black',_sans] text-gray-900
              transition-all duration-500 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}
              ${isHovered ? 'scale-105' : 'scale-100'}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            GATES 56
            <span className="block text-2xl md:text-3xl text-gray-600 mt-4 font-normal">
              The Gym Management Software
            </span>
          </h1>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mt-12">
          {[
            { 
              title: 'Dashboard', 
              icon: '📊',
              description: 'Overview of your gym operations',
              bgColor: 'bg-blue-50 hover:bg-blue-100',
              textColor: 'text-blue-600'
            },
            { 
              title: 'Live Access', 
              icon: '👥',
              description: 'Real-time member access control',
              bgColor: 'bg-green-50 hover:bg-green-100',
              textColor: 'text-green-600'
            },
            { 
              title: 'Analytics', 
              icon: '📈',
              description: 'Performance insights & reports',
              bgColor: 'bg-purple-50 hover:bg-purple-100',
              textColor: 'text-purple-600'
            },
            { 
              title: 'Engagement', 
              icon: '💬',
              description: 'Member communication tools',
              bgColor: 'bg-orange-50 hover:bg-orange-100',
              textColor: 'text-orange-600'
            }
          ].map((item, index) => (
            <button 
              key={index}
              className={`p-6 rounded-xl text-left transition-all duration-300 transform hover:scale-105 
                ${item.bgColor} border border-gray-200 hover:shadow-md
                ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
              style={{
                transitionDelay: `${index * 100}ms`,
                animationFillMode: 'both'
              }}
            >
              <div className="text-3xl mb-3">{item.icon}</div>
              <h3 className={`text-xl font-semibold mb-2 ${item.textColor}`}>{item.title}</h3>
              <p className="text-gray-600 text-sm">{item.description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
