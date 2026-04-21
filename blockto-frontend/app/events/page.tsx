import type { Metadata } from "next";
import EventsClient from "./EventsClient";

export const metadata: Metadata = {
  title: "Events Calendar",
  description:
    "Stay updated with upcoming crypto events, listings, protocol upgrades, and macro economic releases that move the market.",
};

export default function EventsPage() {
  return <EventsClient />;
}
