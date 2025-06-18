// src/components/DateRangePicker.tsx
import React from 'react';

interface DateRangePickerProps {
  startDate: Date | null;
  endDate: Date | null;
  onDateChange: (start: Date | null, end: Date | null) => void;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({ startDate, endDate, onDateChange }) => {
  return (
    <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
      <div className="flex-1">
        <label htmlFor="startDate" className="block text-xs font-medium text-gray-600 mb-1">初日</label>
        <input
          type="date"
          id="startDate"
          name="startDate"
          value={startDate ? startDate.toISOString().split('T')[0] : ''}
          onChange={(e) => onDateChange(e.target.value ? new Date(e.target.value) : null, endDate)}
          required
          className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-base transition duration-150 ease-in-out"
        />
      </div>
      <div className="flex-1">
        <label htmlFor="endDate" className="block text-xs font-medium text-gray-600 mb-1">終日</label>
        <input
          type="date"
          id="endDate"
          name="endDate"
          value={endDate ? endDate.toISOString().split('T')[0] : ''}
          onChange={(e) => onDateChange(startDate, e.target.value ? new Date(e.target.value) : null)}
          required
          className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-base transition duration-150 ease-in-out"
        />
      </div>
    </div>
  );
};