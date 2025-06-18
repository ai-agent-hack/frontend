// src/components/TimeOfDayPicker.tsx
import React from 'react';

interface TimeOfDayPickerProps {
  selectedTime: string;
  onTimeChange: (value: string) => void;
}

export const TimeOfDayPicker: React.FC<TimeOfDayPickerProps> = ({ selectedTime, onTimeChange }) => {
  return (
    <select
      id="timeOfDay"
      name="timeOfDay"
      value={selectedTime}
      onChange={(e) => onTimeChange(e.target.value)}
      required
      className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-base transition duration-150 ease-in-out"
    >
      <option value="" disabled>時間帯を選択してください</option>
      <option value="午前">午前</option>
      <option value="午後">午後</option>
      <option value="終日">終日</option>
      <option value="夜間">夜間</option>
    </select>
  );
};