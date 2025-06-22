export type BusinessHours = {
  [day in
    | "MONDAY"
    | "TUESDAY"
    | "WEDNESDAY"
    | "THURSDAY"
    | "FRIDAY"
    | "SATURDAY"
    | "SUNDAY"
    | "HOLIDAY"]: {
    open_time: string;
    close_time: string;
  };
};

export type SpotDetails = {
  name: string;
  business_hours: BusinessHours;
  congestion: number[];
  price: number;
};

export type SpotItem = {
  latitude: number;
  longitude: number;
  recommendation_reason: string;
  selected: boolean;
  spot_id: string;
  details: SpotDetails;
};

export type TimeSlotSpots = {
  time_slot: "午前" | "午後" | "夜";
  spots: SpotItem[];
};

export type RecommendedSpots = {
  recommend_spot_id: string;
  recommend_spots: TimeSlotSpots[];
};
