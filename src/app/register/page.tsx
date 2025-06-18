"use client";
// src/components/TravelPlanFormReducer.tsx
import React, { useReducer } from 'react';
import { DateRangePicker } from './DateRangePicker';
import { TimeOfDayPicker } from './TimeOfDayPicker';

// フォームのデータを定義するインターフェース
interface TravelPlanFormData {
  departureLocation: string;
  startDate: Date | null;
  endDate: Date | null;
  timeOfDay: string;
  travelAtmosphere: string;
  budget: number | '';
  region: string;
}

// Actionの型定義
type Action =
  | { type: 'SET_FIELD'; field: keyof TravelPlanFormData; value: any }
  | { type: 'SET_DATES'; startDate: Date | null; endDate: Date | null };

// Reducer関数
const formReducer = (state: TravelPlanFormData, action: Action): TravelPlanFormData => {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value };
    case 'SET_DATES':
      return { ...state, startDate: action.startDate, endDate: action.endDate };
    default:
      return state;
  }
};

interface TravelPlanFormProps {
  onSubmit: (data: TravelPlanFormData) => void;
}

const TravelPlanFormReducer: React.FC<TravelPlanFormProps> = ({ onSubmit }) => {
  const [formData, dispatch] = useReducer(formReducer, {
    departureLocation: '',
    startDate: null,
    endDate: null,
    timeOfDay: '',
    travelAtmosphere: '',
    budget: '',
    region: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    dispatch({
      type: 'SET_FIELD',
      field: name as keyof TravelPlanFormData,
      value: name === 'budget' ? (value === '' ? '' : parseInt(value, 10)) : value,
    });
  };

  const handleDateChange = (start: Date | null, end: Date | null) => {
    dispatch({ type: 'SET_DATES', startDate: start, endDate: end });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-2xl">
        <h2 className="text-3xl font-extrabold text-center text-gray-900">
          旅行計画の入力
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          あなたの理想の旅を教えてください
        </p>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {/* 出発地 */}
          <div>
            <label htmlFor="departureLocation" className="block text-sm font-medium text-gray-700 mb-1">
              出発地 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="departureLocation"
              name="departureLocation"
              value={formData.departureLocation}
              onChange={handleChange}
              required
              className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-base transition duration-150 ease-in-out"
              placeholder="例: 東京、大阪"
            />
          </div>

          {/* 期間 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              期間 (何泊何日) <span className="text-red-500">*</span>
            </label>
            <DateRangePicker
              startDate={formData.startDate}
              endDate={formData.endDate}
              onDateChange={handleDateChange}
            />
          </div>

          {/* 時間帯 */}
          <div>
            <label htmlFor="timeOfDay" className="block text-sm font-medium text-gray-700 mb-1">
              旅行する時間帯 <span className="text-red-500">*</span>
            </label>
            <TimeOfDayPicker
              selectedTime={formData.timeOfDay}
              onTimeChange={(value) => dispatch({ type: 'SET_FIELD', field: 'timeOfDay', value })}
            />
          </div>

          {/* 旅行の雰囲気 */}
          <div>
            <label htmlFor="travelAtmosphere" className="block text-sm font-medium text-gray-700 mb-1">
              旅行の雰囲気 (自由記述)
            </label>
            <textarea
              id="travelAtmosphere"
              name="travelAtmosphere"
              rows={4}
              value={formData.travelAtmosphere}
              onChange={handleChange}
              className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-base transition duration-150 ease-in-out"
              placeholder="例: 自然を満喫したい、歴史的な場所を巡りたい、賑やかな街が好き、家族向け、一人旅"
            ></textarea>
          </div>

          {/* 予算 */}
          <div>
            <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-1">
              予算 (円)
            </label>
            <input
              type="number"
              id="budget"
              name="budget"
              value={formData.budget}
              onChange={handleChange}
              min="0"
              className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-base transition duration-150 ease-in-out"
              placeholder="例: 50000"
            />
          </div>

          {/* 地域 */}
          <div>
            <label htmlFor="region" className="block text-sm font-medium text-gray-700 mb-1">
              地域 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="region"
              name="region"
              value={formData.region}
              onChange={handleChange}
              required
              className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-base transition duration-150 ease-in-out"
              placeholder="例: 北海道、沖縄、京都"
            />
          </div>

          {/* 送信ボタン */}
          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-lg font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out shadow-lg transform hover:scale-105"
            >
              旅行計画を送信
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TravelPlanFormReducer;