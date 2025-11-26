import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { regionData, translations } from '../data';
import { Translations } from '../types';

// Updated palette: Sky Blues and Slate Greys
const COLORS = ['#0284c7', '#38bdf8', '#7dd3fc', '#cbd5e1', '#f1f5f9'];

interface StatsChartProps {
  lang: 'en' | 'ko';
}

const StatsChart: React.FC<StatsChartProps> = ({ lang }) => {
  const t = translations[lang];

  return (
    <div className="bg-slate-50 p-8 rounded-3xl h-full flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-sky-100 rounded-full blur-3xl opacity-50 -mr-10 -mt-10"></div>
      
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={regionData}
            cx="50%"
            cy="50%"
            innerRadius={80}
            outerRadius={120}
            fill="#8884d8"
            paddingAngle={5}
            dataKey="value"
            stroke="none"
          >
            {regionData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
              formatter={(value: number) => [`${value}%`, 'Users']}
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px 20px', fontFamily: 'Inter' }}
          />
          <Legend 
            verticalAlign="bottom" 
            height={36} 
            iconType="circle" 
            iconSize={8}
            wrapperStyle={{ paddingTop: '20px', fontFamily: 'Inter', fontSize: '14px', color: '#64748b' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StatsChart;