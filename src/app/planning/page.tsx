"use client";

import GoogleMap, { type MapPin } from "@/components/GoogleMap";
import { useEffect, useState } from "react";
import { getInitialRecommendedSpots } from "./action";

export default function Planning() {
	const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
  const tokyoLatLng = { lat: 35.652832, lng: 139.839478 };
  const [mapPins, setMapPins] = useState<MapPin[]>([]);

	useEffect(() => {
		(async () => {
			const spots = await getInitialRecommendedSpots();
			const pins: MapPin[] = spots.recommend_spots.flatMap((timeSlot) =>
				timeSlot.spots.map((spot, index) => ({
				id: `${timeSlot.time_slot}-${spot.spot_id}-${index}`,
				position: { lat: spot.latitude, lng: spot.longitude },
				title: spot.details.name,
				description: spot.recommendation_reason,
				}))
			);
			setMapPins(pins);
		})();
	}, []);

	return (
		<div style={{ width: "100vw", height: "100vh", position: "relative" }}>
			<GoogleMap
				apiKey={GOOGLE_MAPS_API_KEY}
				center={tokyoLatLng}
				zoom={4}
				pins={mapPins}
			/>
		</div>
	);
}
